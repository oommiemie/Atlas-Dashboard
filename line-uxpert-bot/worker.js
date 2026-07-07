/**
 * line-uxpert-bot — Cloudflare Worker
 *
 * LINE group bot ที่เป็น "UX expert" ตอบคำถาม UX อิง Laws of UX + brand METAHERB.
 * ทำงาน: LINE webhook → verify signature → (ถ้าข้อความขึ้นต้น "ux") → Groq/Gemini → reply.
 *
 * ความจำ (ต้องผูก KV binding ชื่อ BOT_KV):
 *   - จดข้อความ text ทุกข้อความในห้อง (rolling 40 ข้อความ, TTL 3 วัน) → ใช้เป็นบริบทตอนตอบ
 *   - อ่านข้อความที่ถูก reply ได้ (quotedMessageId → lookup ใน history)
 *   - จดคำตอบของ bot เองด้วย → user reply ถึงข้อความ bot แล้ว bot รู้เรื่อง
 *
 * ต้องตั้ง Environment secrets (Worker → Settings → Variables and Secrets):
 *   GROQ_API_KEY    = Groq API key (gsk_...) — provider หลัก (เร็ว, free tier ใจดี)
 *   GEMINI_API_KEY  = Google AI Studio API key (AIza...) — fallback
 *   LINE_TOKEN      = LINE Channel access token (long-lived)
 *   LINE_SECRET     = LINE Channel secret (ใช้ verify ลายเซ็น)
 *   LINE_GROUP_ID   = group id สำหรับ cron push (คั่นหลายกลุ่มด้วย comma)
 *   GITHUB_WEBHOOK_SECRET = secret เดียวกับที่ตั้งใน GitHub repo webhook (แจ้งเตือน push)
 *
 * Cron Trigger: ตั้ง "15 10 * * *" (UTC) = 17:15 เวลาไทย → เตือนอัปเดต Blog + Taiga
 *
 * GitHub push notify: ตั้ง webhook ที่ repo → Settings → Webhooks:
 *   Payload URL = https://<worker>/github · Content type = application/json
 *   Secret = GITHUB_WEBHOOK_SECRET · event เลือก "Just the push event"
 */

const TRIGGERS = ["ux", "UX", "เมต้า"]; // ตอบเฉพาะข้อความที่ขึ้นต้นด้วยคำเหล่านี้ (ในกลุ่ม)

const BOT_NAME = "น้อง UX";

const SYSTEM_PROMPT = `คุณคือ "น้อง UX" เพื่อนสาย UX/UI + dev ระดับ senior คุยกันเองสไตล์ Gen Z ไทย สนุก มีอีโมจิพองาม.
ใส่แสลง Gen Z พอดีๆ (ปังมาก/จัดไป/รอด-ไม่รอด/จริงดิ/อิหยังวะ/ตึงง) + ศัพท์ UXUI-tech จริง (flow, tap target, affordance, hierarchy, component, CTA, a11y, ship). อย่ายัดจนอ่านยาก.
แก่นต้องแน่น: คำแนะนำถูกหลัก ใช้จริงได้ อ้างหลักการเมื่อช่วยเหตุผลชัด (Laws of UX, Nielsen heuristics, Gestalt, WCAG). ครอบคลุม research/IA/interaction/UI/usability/a11y/microcopy. เป็นกลาง ไม่ผูกแบรนด์. ตอบไทย (ปนอังกฤษได้).
บางครั้งจะได้รับ [แชทย้อนหลังล่าสุด] และ [ข้อความที่ถูก reply ถึง] เป็นบริบท — ใช้ทำความเข้าใจบทสนทนา แต่ตอบเฉพาะคำถามล่าสุดเท่านั้น อย่าเอาบริบทมาเล่าซ้ำ.
ข้อมูลไม่พอ → ถามกลับสั้นๆ หรือให้คำแนะนำทั่วไป + บอกสมมติฐาน. เลี่ยง dark patterns. แนะนำเทสกับ user จริง.
รูปแบบ LINE (LINE ไม่รองรับ Markdown):
- ห้ามใช้ ** * _ # backtick เด็ดขาด
- หัวข้อ = ข้อความธรรมดา + อีโมจินำหน้า, bullet ใช้ "•"
- เว้นบรรทัดว่างให้โปร่ง, สั้นกระชับ 3-5 ข้อพอ`;

// Groq (provider หลัก). text = llama 3.3 70B, มีรูป = llama 4 scout (vision).
const GROQ_TEXT_MODEL = "llama-3.3-70b-versatile";
const GROQ_VISION_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";

/** ตอบ UX: ลอง Groq ก่อน ถ้าล่ม/ตอบว่าง ค่อย fallback Gemini. */
async function answerUX(env, userText, imageB64) {
  if (env.GROQ_API_KEY) {
    try {
      const out = await askGroq(env.GROQ_API_KEY, userText, imageB64);
      if (out) return out;
    } catch (_) { /* ตกไป Gemini */ }
  }
  return askGemini(env.GEMINI_API_KEY, userText, imageB64);
}

async function askGroq(key, userText, imageB64) {
  const content = imageB64
    ? [
        { type: "text", text: userText },
        { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageB64}` } },
      ]
    : userText;
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: imageB64 ? GROQ_VISION_MODEL : GROQ_TEXT_MODEL,
      temperature: 0.7,
      max_tokens: 1024,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content },
      ],
    }),
  });
  const data = await res.json();

  if (data?.error) {
    // rate limit → ข้อความ cooldown; error อื่น → throw ให้ fallback Gemini
    if (res.status === 429 || /rate limit|quota/i.test(data.error.message || "")) {
      return "แง็ก โดนเบรกก่อน 😮‍💨 น้องคุยเยอะไปหน่อย (AI พักแป๊บ)\nรอสักครู่แล้วถามใหม่นะแก เดี๋ยวจัดให้ 🙏";
    }
    throw new Error(data.error.message || "groq error");
  }

  const out = data?.choices?.[0]?.message?.content || "";
  return out.trim() ? sanitizeForLine(out.trim()) : "";
}

export default {
  async fetch(request, env, ctx) {
    if (request.method === "GET") {
      return new Response("line-uxpert-bot ok", { status: 200 });
    }
    if (request.method !== "POST") {
      return new Response("method not allowed", { status: 405 });
    }

    const raw = await request.text();

    // ---- GitHub webhook: แจ้งเตือน push เข้ากลุ่ม LINE ----
    if (new URL(request.url).pathname === "/github") {
      const sig = request.headers.get("x-hub-signature-256") || "";
      const ok = await verifyGithubSignature(env.GITHUB_WEBHOOK_SECRET, raw, sig);
      if (!ok) return new Response("bad signature", { status: 403 });

      const ghEvent = request.headers.get("x-github-event") || "";
      if (ghEvent === "ping") return new Response("pong", { status: 200 });
      if (ghEvent !== "push") return new Response("ignored", { status: 200 });

      let payload;
      try { payload = JSON.parse(raw); } catch { return new Response("bad json", { status: 400 }); }

      const msg = formatPushMessage(payload);
      if (msg) ctx.waitUntil(pushLineAll(env, msg));
      return new Response("ok", { status: 200 });
    }

    // ---- verify LINE signature ----
    const signature = request.headers.get("x-line-signature") || "";
    const valid = await verifySignature(env.LINE_SECRET, raw, signature);
    if (!valid) return new Response("bad signature", { status: 403 });

    let body;
    try { body = JSON.parse(raw); } catch { return new Response("bad json", { status: 400 }); }

    const events = body.events || [];
    // ตอบ 200 ให้ LINE ก่อน แล้วประมวลผล event เบื้องหลัง
    ctx.waitUntil(Promise.all(events.map((ev) => handleEvent(ev, env))));
    return new Response("ok", { status: 200 });
  },

  // ---- Cron Trigger: เตือนอัปเดต Blog + Taiga (ตั้ง cron "15 10 * * *" = 17:15 ICT) ----
  async scheduled(event, env, ctx) {
    const msg =
      "⏰ เตือนความจำประจำวัน\nอย่าลืมอัปเดต Blog และ Taiga วันนี้ด้วยนะ 📝✅";
    ctx.waitUntil(pushLineAll(env, msg));
  },
};

/** verify ลายเซ็น GitHub webhook (HMAC SHA-256 hex, prefix "sha256="). */
async function verifyGithubSignature(secret, body, signature) {
  if (!secret || !signature.startsWith("sha256=")) return false;
  const enc = new TextEncoder();
  const keyData = await crypto.subtle.importKey(
    "raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
  );
  const mac = await crypto.subtle.sign("HMAC", keyData, enc.encode(body));
  const expected = "sha256=" + [...new Uint8Array(mac)].map((b) => b.toString(16).padStart(2, "0")).join("");
  return expected === signature;
}

/** แปลง push payload → ข้อความ LINE (คืน null ถ้าไม่มีอะไรน่าแจ้ง เช่น ลบ branch). */
function formatPushMessage(p) {
  const repo = p.repository?.full_name || "repo";
  const branch = (p.ref || "").replace("refs/heads/", "");
  const pusher = p.pusher?.name || p.sender?.login || "ใครสักคน";

  if (p.deleted) return `🗑 ${pusher} ลบ branch ${branch} ที่ ${repo}`;
  const commits = p.commits || [];
  if (!commits.length) return null;

  const lines = commits.slice(0, 5).map((c) => {
    const title = (c.message || "").split("\n")[0].slice(0, 80);
    return `• ${title} (${(c.id || "").slice(0, 7)})`;
  });
  if (commits.length > 5) lines.push(`… และอีก ${commits.length - 5} commit`);

  return [
    `🚀 Push ใหม่ที่ ${repo}`,
    `${pusher} → ${branch} (${commits.length} commit)`,
    "",
    ...lines,
    "",
    p.compare || "",
  ].join("\n").trim();
}

/** ส่ง push ไปทุกกลุ่มใน LINE_GROUP_ID (คั่นด้วย comma). */
async function pushLineAll(env, text) {
  const ids = (env.LINE_GROUP_ID || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  await Promise.all(
    ids.map((to) =>
      fetch("https://api.line.me/v2/bot/message/push", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${env.LINE_TOKEN}` },
        body: JSON.stringify({ to, messages: [{ type: "text", text }] }),
      }),
    ),
  );
}

const OCR_PROMPT =
  "ทำ OCR: ดึงข้อความทั้งหมดในรูปนี้ออกมาให้ครบตามลำดับที่เห็น (รองรับไทย/อังกฤษ). พิมพ์เฉพาะข้อความที่อ่านได้ ไม่ต้องวิเคราะห์ ไม่ต้องเกริ่นนำ ไม่ต้องใส่ bullet. ถ้าไม่มีข้อความให้บอกว่า 'ไม่พบข้อความในรูป'.";
const UX_IMG_PROMPT =
  "รีวิว/วิเคราะห์ UX/UI ของภาพหน้าจอนี้อย่างมืออาชีพ: จุดเด่น, ปัญหาที่พบ (อ้างหลักการ UX), และข้อเสนอแนะที่ทำได้จริง. กระชับ ใช้ bullet.";

/** id ต้นทาง (กลุ่ม/ห้อง/ผู้ใช้) — ใช้เป็น namespace ของ KV keys ต่อห้อง. */
function sourceId(ev) {
  const s = ev.source || {};
  return s.groupId || s.roomId || s.userId || "unknown";
}

/** คีย์เก็บโหมดรูปชั่วคราว ("ocr" | "ux"). */
function sourceKey(ev) {
  return `imgmode:${sourceId(ev)}`;
}

// ================= ความจำแชท (KV) =================

const HIST_MAX = 40;                 // เก็บล่าสุดกี่ข้อความต่อห้อง
const HIST_CONTEXT = 15;             // ส่งเป็นบริบทให้ AI กี่ข้อความ
const HIST_TTL = 60 * 60 * 24 * 3;   // ความจำอยู่ได้ 3 วัน (ต่ออายุทุกครั้งที่มีข้อความใหม่)
const HIST_TEXT_MAX = 500;           // ตัดข้อความยาวก่อนเก็บ กัน KV บวม

function histKey(ev) {
  return `hist:${sourceId(ev)}`;
}

async function loadHistory(env, ev) {
  if (!env.BOT_KV) return [];
  try {
    return JSON.parse((await env.BOT_KV.get(histKey(ev))) || "[]");
  } catch {
    return [];
  }
}

async function saveHistory(env, ev, hist) {
  if (!env.BOT_KV) return;
  await env.BOT_KV.put(histKey(ev), JSON.stringify(hist.slice(-HIST_MAX)), {
    expirationTtl: HIST_TTL,
  });
}

/** เพิ่มข้อความเข้า history ของห้อง (อ่านล่าสุด → append → เซฟ). */
async function appendHistory(env, ev, entry) {
  const hist = await loadHistory(env, ev);
  hist.push({ ...entry, text: (entry.text || "").slice(0, HIST_TEXT_MAX) });
  await saveHistory(env, ev, hist);
  return hist;
}

/** ดึงชื่อผู้ส่ง (cache ใน KV 1 วัน) — group/room ใช้ member API, เดี่ยวใช้ profile API. */
async function getDisplayName(env, ev) {
  const s = ev.source || {};
  if (!s.userId) return "สมาชิก";
  const cacheKey = `name:${s.userId}`;
  if (env.BOT_KV) {
    const hit = await env.BOT_KV.get(cacheKey);
    if (hit) return hit;
  }
  let url;
  if (s.groupId) url = `https://api.line.me/v2/bot/group/${s.groupId}/member/${s.userId}`;
  else if (s.roomId) url = `https://api.line.me/v2/bot/room/${s.roomId}/member/${s.userId}`;
  else url = `https://api.line.me/v2/bot/profile/${s.userId}`;
  try {
    const res = await fetch(url, { headers: { Authorization: `Bearer ${env.LINE_TOKEN}` } });
    const data = await res.json();
    const name = data?.displayName || "สมาชิก";
    if (env.BOT_KV) await env.BOT_KV.put(cacheKey, name, { expirationTtl: 86400 });
    return name;
  } catch {
    return "สมาชิก";
  }
}

/**
 * ประกอบ prompt: แชทย้อนหลัง + ข้อความที่ถูก reply + คำถามล่าสุด.
 * hist ที่ส่งเข้ามา "รวมข้อความปัจจุบันแล้ว" — เลยตัดตัวสุดท้ายออกจากบริบท.
 */
function buildPrompt(hist, quoted, quotedMissing, name, question) {
  let p = "";
  const context = hist.slice(0, -1).slice(-HIST_CONTEXT);
  if (context.length) {
    p += `[แชทย้อนหลังล่าสุด]\n${context.map((m) => `${m.name}: ${m.text}`).join("\n")}\n\n`;
  }
  if (quoted) {
    p += `[ข้อความที่ถูก reply ถึง]\n${quoted.name}: ${quoted.text}\n\n`;
  } else if (quotedMissing) {
    p += `[หมายเหตุ] ผู้ถาม reply ถึงข้อความเก่าที่ไม่อยู่ในความจำแล้ว (เกิน ${HIST_MAX} ข้อความ/3 วัน หรือเป็นรูป) — ถ้าจำเป็นให้บอกผู้ถามว่าขอ copy ข้อความนั้นมาให้หน่อย\n\n`;
  }
  p += `[คำถามล่าสุดจาก ${name}]\n${question}`;
  return p;
}

// ==================================================

async function handleEvent(ev, env) {
  if (ev.type !== "message") return;
  const isGroup = ev.source?.type === "group" || ev.source?.type === "room";

  // ---- รูปภาพ: ต้องมี trigger ก่อน (โหมด "ocr" หรือ "ux" ใน KV) ----
  // ในกลุ่ม: ไม่มี trigger → เงียบ ไม่วิเคราะห์. แชตเดี่ยว: วิเคราะห์ UX อัตโนมัติเหมือนเดิม.
  if (ev.message?.type === "image") {
    let mode = null;
    if (env.BOT_KV) {
      mode = await env.BOT_KV.get(sourceKey(ev));
      if (mode) await env.BOT_KV.delete(sourceKey(ev)); // ใช้ครั้งเดียว
    }
    if (!mode) {
      if (isGroup) return; // รูปในกลุ่มที่ไม่ได้สั่ง → ปล่อยผ่าน
      mode = "ux";
    }
    let answer;
    try {
      const b64 = await fetchLineImage(env.LINE_TOKEN, ev.message.id);
      answer = await answerUX(env, mode === "ocr" ? OCR_PROMPT : UX_IMG_PROMPT, b64);
    } catch (e) {
      answer = "ขออภัย อ่านรูปไม่สำเร็จ ลองส่งใหม่อีกครั้งนะ 🙏";
    }
    const botMsgId = await replyLine(env.LINE_TOKEN, ev.replyToken, answer);
    // จดคำตอบรีวิวรูปไว้เป็นบริบทต่อบทสนทนา (reply ถึงคำตอบนี้ได้)
    await appendHistory(env, ev, {
      id: botMsgId || `bot-${ev.message.id}`,
      name: BOT_NAME,
      text: answer,
      ts: ev.timestamp,
    });
    return;
  }

  if (ev.message?.type !== "text") return;
  const text = (ev.message.text || "").trim();

  // ---- จดทุกข้อความ text ลงความจำ (ทั้งที่ trigger และไม่ trigger) ----
  const senderName = await getDisplayName(env, ev);
  const hist = await appendHistory(env, ev, {
    id: ev.message.id,
    name: senderName,
    text,
    ts: ev.timestamp,
  });

  // ---- คำสั่ง "ocr": ตั้งโหมดให้รูปใบถัดไปทำ OCR (ใช้ได้ทั้งกลุ่ม/เดี่ยว) ----
  if (/^ocr\b/i.test(text)) {
    if (env.BOT_KV) {
      await env.BOT_KV.put(sourceKey(ev), "ocr", { expirationTtl: 120 }); // มีผล 2 นาที
      await replyLine(env.LINE_TOKEN, ev.replyToken, "โอเคร 📸 ส่งรูปมาเลยภายใน 2 นาที เดี๋ยวดึงข้อความให้ (OCR)");
    } else {
      await replyLine(env.LINE_TOKEN, ev.replyToken, "โหมด OCR ยังไม่พร้อม (ยังไม่ได้ผูก KV) บอกแอดมินหน่อยน้า 🙏");
    }
    return;
  }

  // ---- คำสั่ง "ux รูป" / "เมต้า รูป": ตั้งโหมดให้รูปใบถัดไปถูกวิเคราะห์ UX/UI ----
  if (/^(ux|เมต้า)\s*(รูป|วิเคราะห์รูป|รีวิวรูป|ดูรูป)\s*$/i.test(text)) {
    if (env.BOT_KV) {
      await env.BOT_KV.put(sourceKey(ev), "ux", { expirationTtl: 120 }); // มีผล 2 นาที
      await replyLine(env.LINE_TOKEN, ev.replyToken, "จัดไป 🔍 ส่งรูปมาเลยภายใน 2 นาที เดี๋ยวรีวิว UX/UI ให้");
    } else {
      await replyLine(env.LINE_TOKEN, ev.replyToken, "โหมดวิเคราะห์รูปยังไม่พร้อม (ยังไม่ได้ผูก KV) บอกแอดมินหน่อยน้า 🙏");
    }
    return;
  }

  // ในกลุ่ม: ตอบเฉพาะข้อความที่ขึ้นต้นด้วย trigger. แชตเดี่ยว: ตอบทุกข้อความ.
  let question = text;
  if (isGroup) {
    const hit = TRIGGERS.find((t) => text.toLowerCase().startsWith(t.toLowerCase()));
    if (!hit) return;
    question = text.slice(hit.length).trim() || "ช่วยแนะนำหลัก UX ที่ควรรู้หน่อย";
  }

  // ---- อ่านข้อความที่ถูก reply (ถ้ามี) จากความจำ ----
  const qid = ev.message.quotedMessageId;
  const quoted = qid ? hist.find((m) => m.id === qid) : null;
  const quotedMissing = Boolean(qid && !quoted);

  const prompt = buildPrompt(hist, quoted, quotedMissing, senderName, question);

  let answer;
  try {
    answer = await answerUX(env, prompt);
  } catch (e) {
    answer = "ขออภัย ระบบ AI ขัดข้องชั่วคราว ลองใหม่อีกครั้งนะ 🙏";
  }
  const botMsgId = await replyLine(env.LINE_TOKEN, ev.replyToken, answer);

  // จดคำตอบของ bot ลงความจำด้วย → คนในกลุ่ม reply ถึงคำตอบ bot แล้วถามต่อได้
  await appendHistory(env, ev, {
    id: botMsgId || `bot-${ev.message.id}`,
    name: BOT_NAME,
    text: answer,
    ts: ev.timestamp,
  });
}

/** ดึงไบต์รูปจาก LINE content API แล้วแปลงเป็น base64. */
async function fetchLineImage(token, messageId) {
  const res = await fetch(`https://api-data.line.me/v2/bot/message/${messageId}/content`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const buf = new Uint8Array(await res.arrayBuffer());
  let binary = "";
  for (let i = 0; i < buf.length; i++) binary += String.fromCharCode(buf[i]);
  return btoa(binary);
}

// ลองรุ่นแรกก่อน ถ้า overload ค่อย fallback ตัวถัดไป
const GEMINI_MODELS = ["gemini-2.5-flash-lite", "gemini-2.5-flash"];

function callGemini(key, model, userText, imageB64) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
  const parts = [{ text: userText }];
  if (imageB64) parts.push({ inline_data: { mime_type: "image/jpeg", data: imageB64 } });
  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [{ role: "user", parts }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
        thinkingConfig: { thinkingBudget: 0 },
      },
    }),
  }).then((r) => r.json());
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const isOverload = (err) =>
  err && (err.code === 503 || err.status === "UNAVAILABLE" || /overload|high demand|try again/i.test(err.message || ""));
const isQuota = (err) =>
  err && (err.code === 429 || err.status === "RESOURCE_EXHAUSTED" || /quota/i.test(err.message || ""));

async function askGemini(key, userText, imageB64) {
  let lastErr;
  // แต่ละ model ลอง 2 ครั้ง (เว้นช่วง) ก่อนเลื่อนไปตัวถัดไป
  for (const model of GEMINI_MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      const data = await callGemini(key, model, userText, imageB64);
      const err = data?.error;

      if (isQuota(err)) {
        const wait = retrySeconds(err);
        const waitTxt = wait ? ` อีก ~${wait} วิ` : " แป๊บนึง";
        return `แง็ก โดนเบรกก่อน 😮‍💨 น้องคุยเยอะไปหน่อย (โควตา AI เต็มชั่วคราว)\nรอ${waitTxt} แล้วถามใหม่นะแก เดี๋ยวจัดให้ 🙏`;
      }
      if (isOverload(err)) {
        lastErr = err;
        await sleep(800); // เว้นแป๊บแล้วลองใหม่
        continue;
      }

      const cand = data?.candidates?.[0];
      const out = (cand?.content?.parts || []).map((p) => p.text).filter(Boolean).join("");
      if (out.trim()) return sanitizeForLine(out.trim());

      lastErr = err || { message: data?.promptFeedback?.blockReason || `finishReason=${cand?.finishReason}` };
    }
  }

  if (isOverload(lastErr)) {
    return "โอ๊ย AI กำลังคนแน่นน 😮‍💨 (server แน่นชั่วคราว)\nรอแป๊บนึงแล้วถามใหม่นะแก เดี๋ยวจัดให้ 🙏";
  }
  return `เอ๊ะ ตอบไม่ได้แฮะ 🥲 (${lastErr?.message || "unknown"}) ลองถามใหม่อีกทีนะ`;
}

/** ดึงวินาทีที่ต้องรอจาก error (RetryInfo หรือข้อความ "retry in Ns"). */
function retrySeconds(err) {
  const ri = (err?.details || []).find((d) => (d["@type"] || "").includes("RetryInfo"));
  if (ri?.retryDelay) return Math.ceil(parseFloat(ri.retryDelay));
  const m = /retry in ([\d.]+)s/i.exec(err?.message || "");
  return m ? Math.ceil(parseFloat(m[1])) : 0;
}

/** LINE ไม่ render markdown — ลบ/แปลงสัญลักษณ์ให้อ่านง่าย. */
function sanitizeForLine(t) {
  return t
    .replace(/\*\*(.*?)\*\*/g, "$1")      // **bold** → bold
    .replace(/(^|\n)\s*[*-]\s+/g, "$1• ") // "* " / "- " bullet → "• "
    .replace(/`{1,3}/g, "")               // backticks
    .replace(/(^|\n)#{1,6}\s*/g, "$1")     // # headings
    .replace(/\n{3,}/g, "\n\n");           // ยุบบรรทัดว่างเกิน
}

/** ส่ง reply แล้วคืน message id ของข้อความที่ bot ส่ง (ใช้จดลง history). */
async function replyLine(token, replyToken, text) {
  const res = await fetch("https://api.line.me/v2/bot/message/reply", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ replyToken, messages: [{ type: "text", text: text.slice(0, 4900) }] }),
  });
  try {
    const data = await res.json();
    return data?.sentMessages?.[0]?.id || null;
  } catch {
    return null;
  }
}

async function verifySignature(secret, body, signature) {
  if (!secret || !signature) return false;
  const enc = new TextEncoder();
  const keyData = await crypto.subtle.importKey(
    "raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
  );
  const mac = await crypto.subtle.sign("HMAC", keyData, enc.encode(body));
  const expected = btoa(String.fromCharCode(...new Uint8Array(mac)));
  return expected === signature;
}
