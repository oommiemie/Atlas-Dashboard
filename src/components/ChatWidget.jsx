/* ═══ Chat Widget — LINE-style chat พอร์ตจาก MobileMetaherb (ChatScreen + ChatContext)
   ปรับเป็น web React + ธีม Atlas · contact เป็นครอบครัว/นิติบุคคลจาก Smart Village
   พฤติกรรมคงเดิมจากต้นทาง: seed messages · quick replies · auto-reply 1.5s ·
   typing bubble 3 จุด · ส่งรูป · unread badge ═══ */
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { IconMessageCircle, IconX, IconChevronLeft, IconCamera, IconSend2 } from '@tabler/icons-react';

const font = "'IBM Plex Sans Thai Looped', sans-serif";
const BLACK = '#1E1B39';
const GRAY = '#615E83';
const GRAY2 = '#9291A5';
const PURPLE = '#6658E1';
const GREEN = '#34C759';

const nowTime = () => new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });

/* ── รายชื่อห้องแชต (โครงเดียวกับ Conversation ใน ChatContext ต้นทาง) ── */
const SEED_CONVERSATIONS = [
  {
    id: 'fam-boonmak', name: 'ครอบครัวทดสอบ11', sub: 'บ้าน 42/1 · เดอะแกรนด์ วิลล่า',
    lastMessage: 'คุณยายอาการดีขึ้นแล้วค่ะ ขอบคุณมากนะคะ 🙏', time: '10:04', unread: 2, online: true,
  },
  {
    id: 'fam-srisuk', name: 'ครอบครัวทดสอบ12', sub: 'บ้าน 42/5 · เดอะแกรนด์ วิลล่า',
    lastMessage: 'พรุ่งนี้สะดวกให้เข้าเยี่ยมช่วงบ่ายครับ', time: 'เมื่อวาน', unread: 1, online: true,
  },
  {
    id: 'juristic-grand', name: 'นิติบุคคล เดอะแกรนด์ วิลล่า', sub: 'คุณอรทัย แสงมณี',
    lastMessage: 'รับทราบค่ะ จะแจ้ง รปภ. ให้ทราบ', time: 'เมื่อวาน', unread: 0, online: false,
  },
];

/* ── seed บทสนทนาห้องแรก (โครงเดียวกับ SEED_MESSAGES ต้นทาง) ── */
const SEED_MESSAGES = {
  'fam-boonmak': [
    { id: 'm1', sender: 'them', text: 'สวัสดีค่ะ พอดีเห็นแจ้งเตือนจากระบบว่าคุณยายล้มเมื่อเช้า ตอนนี้เป็นยังไงบ้างคะ', time: '09:55' },
    { id: 'm2', sender: 'me', text: 'ทีมเข้าไปดูแล้วครับ คุณยายลื่นในห้องน้ำ ฟกช้ำเล็กน้อย ไม่มีแผลแตก', time: '09:58' },
    { id: 'm3', sender: 'them', text: 'โล่งอกไปที ต้องพาไปตรวจที่ รพ. เพิ่มไหมคะ', time: '10:00' },
    { id: 'm4', sender: 'me', text: 'แนะนำให้เฝ้าดูอาการ 24 ชม.ก่อนครับ ถ้าปวดหัว เวียนหัว หรืออาเจียน ให้รีบพามาที่ รพ. ทันที', time: '10:02' },
    { id: 'm5', sender: 'them', text: 'คุณยายอาการดีขึ้นแล้วค่ะ ขอบคุณมากนะคะ 🙏', time: '10:04' },
  ],
};

/* ── quick replies + auto-reply pool (แนวเดียวกับ QUICK_REPLIES / SHOP_REPLIES ต้นทาง) ── */
const QUICK_REPLIES = ['สอบถามอาการล่าสุด', 'ขอนัดเยี่ยมบ้าน', 'แจ้งผลการช่วยเหลือ', 'มีอะไรให้ช่วยไหมครับ/คะ'];
const AUTO_REPLIES = [
  'ขอบคุณค่ะ 🙏',
  'รับทราบค่ะ เดี๋ยวแจ้งคนที่บ้านให้นะคะ',
  'สะดวกค่ะ ช่วงบ่ายได้เลย',
  'ตอนนี้อาการปกติดีค่ะ ทานข้าวได้',
  'ขอบคุณที่ติดตามดูแลนะคะ 😊',
];

/* ── avatar วงกลมตัวอักษรแรก ── */
function Avatar({ name, online, size = 40 }) {
  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      <div style={{
        width: size, height: size, borderRadius: '50%', color: 'white',
        fontSize: size * 0.4, fontWeight: 700, fontFamily: font,
        background: 'linear-gradient(135deg,#8B81F2,#6658E1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>{name[0]}</div>
      {online && <span style={{ position: 'absolute', bottom: 1, right: 1, width: 10, height: 10, borderRadius: '50%', background: GREEN, border: '2px solid white' }} />}
    </div>
  );
}

/* ── bubble ข้อความ — มุมแหลมชี้ฝั่งผู้พูด (พอร์ตจาก Bubble ต้นทาง) ── */
function Bubble({ msg, themName }) {
  const isMe = msg.sender === 'me';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
      {msg.image ? (
        <img src={msg.image} alt="" style={{
          width: 180, height: 180, objectFit: 'cover', borderRadius: 18, background: '#eee',
          borderBottomRightRadius: isMe ? 4 : 18, borderBottomLeftRadius: isMe ? 18 : 4,
        }} />
      ) : (
        <div style={{
          maxWidth: '78%', padding: '9px 14px', borderRadius: 18,
          background: isMe ? PURPLE : 'white',
          border: isMe ? 'none' : '1px solid #ececed',
          borderBottomRightRadius: isMe ? 4 : 18, borderBottomLeftRadius: isMe ? 18 : 4,
          fontSize: 13.5, lineHeight: 1.5, color: isMe ? 'white' : '#0a0a0a', fontFamily: font,
        }}>{msg.text}</div>
      )}
      <span style={{ fontSize: 10, color: GRAY2, marginTop: 3, fontFamily: font, padding: '0 4px' }}>
        {isMe ? msg.time : `${themName} • ${msg.time}`}
      </span>
    </div>
  );
}

/* ── typing bubble 3 จุด ── */
function TypingBubble() {
  return (
    <div style={{ display: 'flex' }}>
      <div style={{
        display: 'flex', gap: 4, padding: '12px 14px', borderRadius: 18, borderBottomLeftRadius: 4,
        background: 'white', border: '1px solid #ececed',
      }}>
        {[0, 1, 2].map(i => (
          <span key={i} style={{
            width: 6, height: 6, borderRadius: '50%', background: GRAY2,
            animation: `chatTypingDot 1.2s ${i * 0.18}s ease-in-out infinite`,
          }} />
        ))}
      </div>
    </div>
  );
}

/* ── หน้าห้องแชต (พอร์ตจาก ChatScreen) ── */
function ChatRoom({ convo, messages, onSend, onSendImage, replying, onBack }) {
  const [input, setInput] = useState('');
  const [focused, setFocused] = useState(false);
  const scrollRef = useRef(null);
  const fileRef = useRef(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) requestAnimationFrame(() => { el.scrollTop = el.scrollHeight; });
  }, [messages.length, replying]);

  const send = (raw) => {
    const text = raw.trim();
    if (!text) return;
    onSend(text);
    setInput('');
  };
  const canSend = input.trim().length > 0;

  return (
    <>
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderBottom: '1px solid rgba(0,0,0,0.06)', background: 'white', borderRadius: '20px 20px 0 0' }}>
        <button onClick={onBack} style={{ width: 30, height: 30, borderRadius: '50%', border: 'none', cursor: 'pointer', background: 'rgba(102,88,225,0.08)', color: PURPLE, fontSize: 14 }}><IconChevronLeft size={14} style={{ verticalAlign: '-2px' }} /></button>
        <Avatar name={convo.name} online={convo.online} size={36} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: BLACK, fontFamily: font, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{convo.name}</div>
          <div style={{ fontSize: 10.5, color: convo.online ? '#1E9E4B' : GRAY2, fontFamily: font }}>
            {convo.online ? 'ออนไลน์ • ตอบกลับภายในไม่กี่นาที' : 'ออฟไลน์'}
          </div>
        </div>
      </div>

      {/* messages */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 10, background: '#fafafa' }}>
        {messages.map(m => <Bubble key={m.id} msg={m} themName={convo.name} />)}
        {replying && <TypingBubble />}
      </div>

      {/* quick replies — ซ่อนตอนกำลังพิมพ์ (พฤติกรรมต้นทาง) */}
      {!focused && (
        <div style={{ display: 'flex', gap: 6, padding: '8px 12px 0', overflowX: 'auto', background: '#fafafa' }}>
          {QUICK_REPLIES.map(q => (
            <button key={q} className="hover-btn" onClick={() => send(q)} style={{
              flexShrink: 0, height: 30, padding: '0 12px', borderRadius: 100, cursor: 'pointer',
              border: '1px solid rgba(102,88,225,0.3)', background: 'rgba(102,88,225,0.08)',
              fontSize: 11.5, fontWeight: 500, color: PURPLE, fontFamily: font,
            }}>{q}</button>
          ))}
        </div>
      )}

      {/* composer */}
      <div style={{ padding: 10, background: '#fafafa', borderRadius: '0 0 20px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, background: 'white', borderRadius: 24, padding: 5, boxShadow: '0 4px 16px rgba(30,27,57,0.1)', border: '1px solid rgba(0,0,0,0.05)' }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: '#f5f5f5', borderRadius: 19, minHeight: 38 }}>
            <button
              onClick={() => fileRef.current?.click()} title="ส่งรูปภาพ"
              style={{ width: 38, height: 38, border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 16 }}
            ><IconCamera size={18} color={GRAY} style={{ verticalAlign: '-4px' }} /></button>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={e => {
              const f = e.target.files?.[0];
              if (f) onSendImage(URL.createObjectURL(f));
              e.target.value = '';
            }} />
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send(input)}
              onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
              placeholder="พิมพ์ข้อความ..."
              style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 13.5, fontFamily: font, color: '#0a0a0a', padding: '0 10px 0 0' }}
            />
          </div>
          <button
            onClick={() => send(input)} disabled={!canSend} title="ส่งข้อความ"
            style={{
              width: 38, height: 38, borderRadius: '50%', border: 'none', flexShrink: 0,
              cursor: canSend ? 'pointer' : 'default', fontSize: 15, color: 'white',
              background: canSend ? 'linear-gradient(135deg,#4438AD,#6658E1)' : '#cfcfd6',
              opacity: canSend ? 1 : 0.7,
            }}
          ><IconSend2 size={16} style={{ verticalAlign: '-3px' }} /></button>
        </div>
      </div>
    </>
  );
}

/* ── รายการห้องแชต (พอร์ตจาก ChatListScreen) ── */
function ChatList({ conversations, onOpen }) {
  return (
    <>
      <div style={{ padding: '16px 16px 10px', borderBottom: '1px solid rgba(0,0,0,0.06)', background: 'white', borderRadius: '20px 20px 0 0' }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: BLACK, fontFamily: font }}><IconMessageCircle size={15} color={BLACK} style={{ verticalAlign: '-2px' }} /> แชต</div>
        <div style={{ fontSize: 11, color: GRAY2, fontFamily: font, marginTop: 2 }}>คุยกับครอบครัว/นิติบุคคล</div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', background: '#fafafa', borderRadius: '0 0 20px 20px' }}>
        {conversations.map(c => (
          <div key={c.id} className="hover-row" onClick={() => onOpen(c.id)} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '12px 14px', cursor: 'pointer', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
            <Avatar name={c.name} online={c.online} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: BLACK, fontFamily: font, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</span>
                <span style={{ marginLeft: 'auto', fontSize: 10, color: GRAY2, fontFamily: font, flexShrink: 0 }}>{c.time}</span>
              </div>
              <div style={{ fontSize: 10.5, color: GRAY2, fontFamily: font }}>{c.sub}</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 2 }}>
                <span style={{ flex: 1, fontSize: 11.5, color: c.unread ? BLACK : GRAY, fontWeight: c.unread ? 600 : 400, fontFamily: font, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.lastMessage}</span>
                {c.unread > 0 && (
                  <span style={{ minWidth: 18, height: 18, borderRadius: 100, padding: '0 5px', background: '#FF383C', color: 'white', fontSize: 10, fontWeight: 700, fontFamily: font, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{c.unread}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [conversations, setConversations] = useState(SEED_CONVERSATIONS);
  const [messagesById, setMessagesById] = useState(SEED_MESSAGES);
  const [replying, setReplying] = useState(false);
  const replyTimer = useRef(null);

  useEffect(() => () => { if (replyTimer.current) clearTimeout(replyTimer.current); }, []);

  const unreadTotal = conversations.reduce((s, c) => s + c.unread, 0);
  const activeConvo = conversations.find(c => c.id === activeId);
  const messages = messagesById[activeId] || [];

  /* เปิดห้อง = เคลียร์ unread (markRead ต้นทาง) */
  const openRoom = (id) => {
    setActiveId(id);
    setConversations(prev => prev.map(c => (c.id === id ? { ...c, unread: 0 } : c)));
  };

  const pushMessage = (convoId, msg) => {
    setMessagesById(prev => ({ ...prev, [convoId]: [...(prev[convoId] || []), msg] }));
    setConversations(prev => prev.map(c => (c.id === convoId ? { ...c, lastMessage: msg.text || 'รูปภาพ', time: msg.time } : c)));
  };

  /* auto-reply 1.5s (triggerReply ต้นทาง) */
  const triggerReply = (convoId) => {
    setReplying(true);
    if (replyTimer.current) clearTimeout(replyTimer.current);
    replyTimer.current = setTimeout(() => {
      setReplying(false);
      pushMessage(convoId, {
        id: `m${Date.now() + 1}`, sender: 'them',
        text: AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)],
        time: nowTime(),
      });
    }, 1500);
  };

  const send = (text) => {
    pushMessage(activeId, { id: `m${Date.now()}`, sender: 'me', text, time: nowTime() });
    triggerReply(activeId);
  };
  const sendImage = (url) => {
    pushMessage(activeId, { id: `m${Date.now()}`, sender: 'me', text: '', image: url, time: nowTime() });
    triggerReply(activeId);
  };

  return createPortal(
    <>
      <style>{`@keyframes chatTypingDot { 0%,60%,100% { opacity: 0.3; transform: translateY(0); } 30% { opacity: 1; transform: translateY(-3px); } }`}</style>

      {/* หน้าต่างแชต */}
      {open && (
        <div className="anim-scale-in" style={{
          position: 'fixed', right: 24, bottom: 92, zIndex: 1800,
          width: 340, height: 480, maxWidth: 'calc(100vw - 48px)', maxHeight: 'calc(100vh - 130px)',
          borderRadius: 20, overflow: 'hidden', display: 'flex', flexDirection: 'column',
          background: '#fafafa', boxShadow: '0 20px 60px rgba(30,27,57,0.3)', border: '1px solid rgba(0,0,0,0.06)',
        }}>
          {activeConvo ? (
            <ChatRoom
              convo={activeConvo} messages={messages} replying={replying}
              onSend={send} onSendImage={sendImage} onBack={() => setActiveId(null)}
            />
          ) : (
            <ChatList conversations={conversations} onOpen={openRoom} />
          )}
        </div>
      )}

      {/* ปุ่มลอย */}
      <button
        className="hover-btn" onClick={() => setOpen(o => !o)} title="แชต"
        style={{
          position: 'fixed', right: 24, bottom: 24, zIndex: 1800,
          width: 54, height: 54, borderRadius: '50%', border: 'none', cursor: 'pointer', fontSize: 22,
          background: 'linear-gradient(135deg,#4438AD,#6658E1 50%,#8B5CF6)', color: 'white',
          boxShadow: '0 8px 24px rgba(102,88,225,0.45)',
        }}
      >
        {open ? <IconX size={24} style={{ verticalAlign: 'middle', flexShrink: 0 }} /> : <IconMessageCircle size={24} style={{ verticalAlign: 'middle', flexShrink: 0 }} />}
        {!open && unreadTotal > 0 && (
          <span style={{
            position: 'absolute', top: -2, right: -2, minWidth: 20, height: 20, borderRadius: 100,
            padding: '0 5px', background: '#FF383C', color: 'white', fontSize: 11, fontWeight: 700,
            fontFamily: font, display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid white',
          }}>{unreadTotal}</span>
        )}
      </button>
    </>,
    document.body
  );
}
