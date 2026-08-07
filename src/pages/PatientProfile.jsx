import { useState, useContext } from 'react';
import { createPortal } from 'react-dom';
import { CallContext } from '../App';
import { getAvatar } from '../data/patients';
import { Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, ReferenceArea, ReferenceLine, ReferenceDot } from 'recharts';
import logoHomeCare from '../assets/images/logo-atlas-homecare.png';
import logoMyAtlas from '../assets/images/logo-my-atlas.png';
import imgCardAllergy from '../assets/images/card-allergy.png';
import imgCardDisease from '../assets/images/card-disease.png';
import imgCardAddress from '../assets/images/card-address.png';

const font = "'Sarabun', sans-serif";
const BLACK = '#1E1B39';
const GRAY = '#615E83';

const glassCard = {
  background: 'rgba(255,255,255,0.5)',
  backdropFilter: 'blur(5px)',
  border: '1px solid rgba(255,255,255,0.5)',
  borderRadius: 24,
  boxShadow: '0 2px 6px rgba(13,10,44,0.08)',
  padding: 16,
};

/* ── Tooltip ── */
/* ranges: เกณฑ์ปกติราย dataKey — ใช้ตีตราค่าใน tooltip ว่าปกติ/สูง/ต่ำกว่าเกณฑ์ */
const Tip = ({ active, payload, label, ranges, unit, source }) => {
  if (!active || !payload?.length) return null;
  const judge = (key, v) => {
    const r = ranges?.[key];
    if (!r || typeof v !== 'number') return null;
    if (v > r[1]) return { text: 'สูงกว่าเกณฑ์', color: '#FF383C' };
    if (v < r[0]) return { text: 'ต่ำกว่าเกณฑ์', color: '#E8802A' };
    return { text: 'ปกติ', color: '#34C759' };
  };
  /* recharts ใส่ <Area> ที่วาดพื้นใต้เส้นเข้ามาใน payload ด้วย (tooltipType="none" ไม่เป็นผล)
     รายการนั้นใช้ชื่อ dataKey ดิบ เช่น "v" — กรองทิ้งเมื่อมีรายการของเส้นจริงที่มีชื่ออ่านได้แล้ว */
  const rows = payload.filter(p => p.name !== p.dataKey
    || !payload.some(q => q.dataKey === p.dataKey && q.name !== q.dataKey));
  const dotColor = (c) => (!c || String(c).startsWith('url')) ? '#34C759' : c;
  return (
    <div style={{
      /* พื้นขาวเกือบทึบ — อ่านรายละเอียดชัด ไม่ให้กราฟข้างหลังทะลุรบกวน (เบลอไว้เก็บขอบที่เหลือ 2%) */
      background: 'rgba(255,255,255,0.98)',
      backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
      borderRadius: 16, padding: '10px 14px 11px', minWidth: 158,
      boxShadow: '0 12px 32px rgba(30,27,57,0.16), 0 2px 8px rgba(30,27,57,0.06)',
      border: '1px solid rgba(30,27,57,0.05)', fontFamily: font,
    }}>
      {/* หัว: เวลา/วันที่ */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, paddingBottom: 6, marginBottom: 6, borderBottom: '1px solid rgba(30,27,57,0.07)' }}>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ flexShrink: 0 }}>
          <circle cx="5" cy="5" r="4.2" stroke="#9291A5" strokeWidth="1.1" />
          <path d="M5 2.8V5l1.6 1" stroke="#9291A5" strokeWidth="1.1" strokeLinecap="round" />
        </svg>
        <span style={{ fontSize: 10, fontWeight: 600, color: GRAY, letterSpacing: 0.2 }}>{label}</span>
      </div>
      {rows.map((p, i) => {
        const st = judge(p.dataKey, p.value);
        const c = dotColor(p.color);
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '3px 0' }}>
            <span style={{
              width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
              background: `linear-gradient(180deg, ${c}, ${c})`,
              boxShadow: `0 0 0 2.5px ${c}22`,
            }} />
            <span style={{ fontSize: 10.5, color: GRAY, flex: 1, paddingRight: 8, whiteSpace: 'nowrap' }}>{p.name}</span>
            <span className="num" style={{ fontSize: 14, fontWeight: 800, color: '#1E1B39', lineHeight: 1 }}>
              {Array.isArray(p.value) ? `${p.value[1]}/${p.value[0]}` : p.value}
            </span>
            {unit && <span style={{ fontSize: 9, color: '#9291A5', marginLeft: 1 }}>{unit}</span>}
            {st && (
              <span style={{
                fontSize: 8.5, fontWeight: 700, color: st.color, background: `${st.color}14`,
                border: `1px solid ${st.color}30`, padding: '2px 7px', borderRadius: 100,
                marginLeft: 4, whiteSpace: 'nowrap',
              }}>{st.text}</span>
            )}
          </div>
        );
      })}
      {/* ที่มาของค่า — รายจุดจากข้อมูล (src) ก่อน ถ้าไม่มีใช้ที่มารวมของกราฟ (source) */}
      {(payload[0]?.payload?.src || source) && (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 5, paddingTop: 6, marginTop: 5, borderTop: '1px dashed rgba(30,27,57,0.08)' }}>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
            <rect x="1" y="2.2" width="8" height="5.6" rx="1.4" stroke="#9291A5" strokeWidth="1.1" />
            <path d="M3.2 8.8h3.6" stroke="#9291A5" strokeWidth="1.1" strokeLinecap="round" />
            <circle cx="5" cy="5" r="1.1" fill="#9291A5" />
          </svg>
          <span style={{ fontSize: 9, color: '#9291A5', lineHeight: 1.5 }}>ที่มา: {payload[0]?.payload?.src || source}</span>
        </div>
      )}
    </div>
  );
};

/* ── Vital row icon mapping ── */
const VITAL_ROW_ICONS = {
  'ความดันโลหิต': ppRowBp,
  'อัตราเต้นของหัวใจ': ppRowEcg,
  'อุณหภูมิ': ppRowThermo,
  'ออกซิเจน': ppRowOxygen,
  'น้ำตาล': ppRowDrop,
  'ส่วนสูง': ppRowHeight,
  'น้ำหนัก': ppRowWeight,
  'รอบเอว': ppRowWaist,
  'CGM': ppRowDrop, // ค่าน้ำตาลเหมือนกัน ใช้ไอคอนหยดร่วมกัน
};

/* ── VitalRow helper ── */
function VitalRow({ label, value, unit, color = '#34C759', time = '10:00 น.' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 16, height: 16, borderRadius: '50%',
          background: 'linear-gradient(135deg, #34C759, #15B03C)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '0.5px solid white', flexShrink: 0,
        }}>
          {VITAL_ROW_ICONS[label] ? <img src={VITAL_ROW_ICONS[label]} alt="" style={{ width: 8, height: 8, filter: 'brightness(10)' }} /> :
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M3 6L1 4l.7-.7L3 4.6 6.3 1.3 7 2 3 6z" fill="white" /></svg>}
        </div>
        <span style={{ fontSize: 10, color: 'black', width: 80, fontFamily: font }}>{label}</span>
        <span style={{ fontSize: 10, fontWeight: 500, color: color, fontFamily: font }}>{value} {unit}</span>
      </div>
      <span style={{ fontSize: 8, color: '#8E8E93', fontFamily: font }}>อัพเดทล่าสุด: {time}</span>
    </div>
  );
}

/* ══════ ป๊อปอัพ "ดูเพิ่มเติม" ของ vital ทุกใบ — ดูย้อนหลังแบบ สัปดาห์/เดือน/ปี พร้อมกราฟ ══════ */
/* "วันนี้" ของข้อมูลจำลอง = วันปัจจุบันจริง (ไดนามิก) — ทุก picker/ข้อมูลนับจากวันนี้ */
const TH_M = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
const _now = new Date();
const DETAIL_TODAY = new Date(_now.getFullYear(), _now.getMonth(), _now.getDate());
const beYY = y => String((y + 543) % 100);
const fmtDM = d => `${d.getDate()} ${TH_M[d.getMonth()]}`;
const fmtDMY = d => `${fmtDM(d)} ${beYY(d.getFullYear())}`;
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const dayNum = d => Math.round(d.getTime() / 86400000);
/* แปลงวันที่ปฏิทิน "YYYY-MM-DD" → จำนวนวันเทียบกับวันนี้ (ลบ = อดีต) — ใช้ปักหมุดเส้นเรื่อง */
const D = s => { const [y, m, dd] = s.split('-').map(Number); return dayNum(new Date(y, m - 1, dd)) - dayNum(DETAIL_TODAY); };

/* config ต่อ metric: เส้น เกณฑ์ โซนปกติ และพารามิเตอร์จำลองข้อมูลสมจริงตั้งแต่ต้นปีถึงวันนี้
   story = จุดยึดเส้นเรื่องทางคลินิก [วันปฏิทินจริง, ค่า] — interpolate เชิงเส้นระหว่างจุด
   เรื่องของผู้ป่วย: ม.ค. คุมได้ปานกลาง → 21 ก.พ. 69 เกิด STEMI + PCI ค่าพุ่ง → พักฟื้น เม.ย.–มิ.ย. ดีขึ้น →
   ก.ค.–ส.ค. ความดัน/ชีพจรไต่กลับขึ้น (สอดคล้องการ์ด "สูงเล็กน้อย/หัวใจเต้นเร็ว")
   dn = ความแกว่งรายวัน · circ+ca = จังหวะร่างกายรายชั่วโมง · last = ค่าล่าสุดต้องตรงหัวการ์ด */
const DETAIL_CFG = {
  'ความดันโลหิต': {
    unit: 'mmHg', domain: [60, 180], ticks: [60, 90, 120, 150, 180],
    refs: [{ y: 140, color: '#FF383C', label: 'เกณฑ์ 140' }, { y: 90, color: '#4A3AFF', label: 'เกณฑ์ 90' }],
    lines: [
      { key: 'systolic', name: 'Systolic', color: '#FF383C', color2: '#992224', range: [90, 140], last: 150, seed: 1,
        story: [[D('2026-01-01'), 126], [D('2026-02-10'), 130], [D('2026-02-18'), 133], [D('2026-02-21'), 166], [D('2026-02-24'), 152], [D('2026-03-01'), 138], [D('2026-03-25'), 133], [D('2026-04-15'), 128], [D('2026-05-20'), 126], [D('2026-06-20'), 128], [D('2026-07-15'), 132], [D('2026-07-31'), 131], [D('2026-08-04'), 140], [0, 150]], dn: 4, circ: 'bp', ca: 6 },
      { key: 'diastolic', name: 'Diastolic', color: '#4A3AFF', color2: '#2C2399', range: [60, 90], last: 77, seed: 5,
        story: [[D('2026-01-01'), 80], [D('2026-02-18'), 84], [D('2026-02-21'), 96], [D('2026-02-24'), 88], [D('2026-03-01'), 82], [D('2026-03-25'), 84], [D('2026-05-20'), 78], [D('2026-07-15'), 80], [D('2026-07-31'), 88], [D('2026-08-04'), 82], [0, 77]], dn: 3, circ: 'bp', ca: 4 },
    ],
  },
  'อัตราเต้นของหัวใจ': {
    unit: 'bpm', domain: [50, 120], ticks: [60, 80, 100, 120],
    zones: [{ y1: 60, y2: 100, color: 'rgba(52,199,89,0.06)', edge: '#1E9E4B', legendLabel: 'ช่วงปกติ 60–100' }],
    refs: [{ y: 100, color: '#FF383C', label: 'เกณฑ์ 100', hideLegend: true }],
    lines: [{ key: 'v', name: 'อัตราเต้นของหัวใจ', color: '#FF383C', color2: '#992224', range: [60, 100], last: 103, seed: 2,
      story: [[D('2026-01-01'), 74], [D('2026-02-18'), 80], [D('2026-02-21'), 112], [D('2026-02-24'), 96], [D('2026-03-01'), 88], [D('2026-03-25'), 84], [D('2026-05-20'), 76], [D('2026-07-15'), 80], [D('2026-07-31'), 82], [D('2026-08-04'), 92], [0, 103]], dn: 4, circ: 'hr', ca: 7 }],
  },
  'อุณหภูมิ': {
    unit: '°C', domain: [35, 39], ticks: [35, 36, 37, 38, 39], decimals: 1,
    zones: [{ y1: 36, y2: 37.5, color: 'rgba(52,199,89,0.06)', edge: '#1E9E4B', legendLabel: 'ช่วงปกติ 36–37.5' }],
    lines: [{ key: 'v', name: 'อุณหภูมิ', color: '#E8802A', color2: '#B45309', range: [36, 37.5], last: 36, seed: 3,
      story: [[D('2026-01-01'), 36.5], [D('2026-02-18'), 36.5], [D('2026-02-21'), 38.1], [D('2026-02-23'), 37.6], [D('2026-02-25'), 37.1], [D('2026-03-01'), 36.7], [D('2026-05-01'), 36.5], [D('2026-07-31'), 36.5], [0, 36.0]], dn: 0.18, circ: 'temp', ca: 0.35 }],
  },
  'ออกซิเจน': {
    unit: '%', domain: [88, 100], ticks: [88, 92, 96, 100],
    zones: [{ y1: 95, y2: 100, color: 'rgba(52,199,89,0.06)', edge: '#1E9E4B', legendLabel: 'ช่วงปกติ ≥ 95' }],
    lines: [{ key: 'v', name: 'ออกซิเจน', color: '#1398D8', color2: '#0B6E9E', range: [95, 100], last: 98, seed: 4,
      story: [[D('2026-01-01'), 97], [D('2026-02-18'), 97], [D('2026-02-21'), 92], [D('2026-02-24'), 94], [D('2026-03-01'), 96], [D('2026-05-01'), 97], [D('2026-07-31'), 97], [0, 98]], dn: 0.8, circ: 'none', ca: 0.6 }],
  },
  'น้ำตาล': {
    unit: 'mg/dl', domain: [60, 220], ticks: [60, 100, 140, 180, 220],
    zones: [{ y1: 70, y2: 180, color: 'rgba(52,199,89,0.06)', edge: '#1E9E4B', legendLabel: 'ช่วงปกติ 70–180' }],
    lines: [{ key: 'v', name: 'น้ำตาล', color: '#8B5CF6', color2: '#6D28D9', range: [70, 180], last: 142, seed: 6,
      story: [[D('2026-01-01'), 124], [D('2026-02-10'), 130], [D('2026-02-18'), 135], [D('2026-02-21'), 178], [D('2026-02-24'), 160], [D('2026-03-01'), 145], [D('2026-03-25'), 132], [D('2026-05-15'), 126], [D('2026-07-01'), 130], [D('2026-07-31'), 118], [D('2026-08-04'), 136], [0, 142]], dn: 9, circ: 'meal', ca: 26 }],
  },
  'CGM': {
    unit: 'mg/dl', domain: [60, 220], ticks: [60, 100, 140, 180, 220],
    zones: [{ y1: 70, y2: 180, color: 'rgba(52,199,89,0.06)', edge: '#1E9E4B', legendLabel: 'ช่วงปกติ 70–180' }],
    lines: [{ key: 'v', name: 'ค่าเฉลี่ยรายวัน (CGM)', color: '#34C759', color2: '#0F7B37', range: [70, 180], last: 142, seed: 7,
      story: [[D('2026-01-01'), 120], [D('2026-02-18'), 132], [D('2026-02-21'), 172], [D('2026-02-24'), 158], [D('2026-03-01'), 142], [D('2026-03-25'), 130], [D('2026-05-15'), 126], [D('2026-07-01'), 130], [D('2026-07-31'), 128], [0, 142]], dn: 8, circ: 'meal', ca: 30 }],
  },
};

const DETAIL_PERIODS = ['วัน', 'สัปดาห์', 'เดือน', 'ปี'];

/* สเปกของช่วงที่เลือก: ป้ายแกนเวลา + offs (วันเทียบกับวันนี้ต่อจุด) + anchor = ช่วงจบที่วันนี้ */
function detailSpec(period, sel) {
  const off = d => dayNum(d) - dayNum(DETAIL_TODAY);
  if (period === 'วัน') {
    const isCur = sameDay(sel.date, DETAIL_TODAY);
    return {
      mode: 'hour', dayOff: off(sel.date),
      labels: Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`),
      anchor: isCur,
      title: isCur ? `วันนี้ · ${fmtDMY(sel.date)}` : fmtDMY(sel.date),
    };
  }
  if (period === 'สัปดาห์') {
    const days = Array.from({ length: 7 }, (_, i) => addDays(sel.date, i - 6));
    return {
      mode: 'day', offs: days.map(off),
      labels: days.map(fmtDM), anchor: sameDay(sel.date, DETAIL_TODAY),
      title: `${fmtDM(days[0])} – ${fmtDMY(sel.date)}`,
    };
  }
  if (period === 'เดือน') {
    const { y, m } = sel.month;
    const isCur = y === DETAIL_TODAY.getFullYear() && m === DETAIL_TODAY.getMonth();
    const nDays = isCur ? DETAIL_TODAY.getDate() : new Date(y, m + 1, 0).getDate();
    return {
      mode: 'day', offs: Array.from({ length: nDays }, (_, i) => off(new Date(y, m, i + 1))),
      labels: Array.from({ length: nDays }, (_, i) => `${i + 1} ${TH_M[m]}`),
      anchor: isCur, title: `${TH_M[m]} ${beYY(y)}`,
    };
  }
  const y = sel.year;
  const isCur = y === DETAIL_TODAY.getFullYear();
  const nM = isCur ? DETAIL_TODAY.getMonth() + 1 : 12;
  return {
    mode: 'month', offs: Array.from({ length: nM }, (_, i) => off(new Date(y, i, 15))),
    labels: Array.from({ length: nM }, (_, i) => TH_M[i]),
    anchor: isCur, title: `ปี ${beYY(y)}`,
  };
}

/* ── เครื่องจำลองข้อมูลสมจริง (deterministic ทุกครั้งที่ render) ──
   ค่า = เส้นเรื่องทางคลินิก (story interpolate) + ความแกว่งรายวัน (noise ตาม seed ของวัน)
       + จังหวะร่างกายรายชั่วโมง (circadian/มื้ออาหาร) — วันนี้บังคับจุดล่าสุดตรงค่าบนการ์ด */
const dNoise = s => { const x = Math.sin(s * 127.1 + 311.7) * 43758.5453; return (x - Math.floor(x)) * 2 - 1; };
const CIRC = {
  none: () => 0,
  bp: (h, a) => a * Math.sin(((h - 3) / 24) * 2 * Math.PI),                       // ต่ำกลางดึก พีคช่วงสาย
  hr: (h, a) => a * Math.sin(((h - 4) / 24) * 2 * Math.PI),                       // ช้าตอนหลับ เร็วช่วงบ่าย
  temp: (h, a) => a * Math.sin(((h - 12) / 24) * 2 * Math.PI),                    // ต่ำเช้ามืด สูงหัวค่ำ
  meal: (h, a) => a * (Math.exp(-((h - 8.2) ** 2) / 2.2) + Math.exp(-((h - 13.3) ** 2) / 2.6)
    + Math.exp(-((h - 19.2) ** 2) / 3)) - a * 0.25 * Math.exp(-((h - 4) ** 2) / 5), // ลอนสามมื้อ + ต่ำกลางดึก
};
function genDetailData(cfg, spec) {
  const interp = (story, o) => {
    if (o <= story[0][0]) return story[0][1];
    for (let k = 1; k < story.length; k++) {
      if (o <= story[k][0]) {
        const [o0, v0] = story[k - 1], [o1, v1] = story[k];
        return v0 + (v1 - v0) * ((o - o0) / (o1 - o0));
      }
    }
    return story[story.length - 1][1];
  };
  const fmt = v => cfg.decimals ? +v.toFixed(1) : Math.round(v);
  const rows = spec.labels.map(lb => ({ day: lb }));
  cfg.lines.forEach(l => {
    const sd = (l.seed || 1) * 7.13;
    /* ค่าประจำวัน: เส้นเรื่อง + ความแกว่งรายวัน (วันนี้ไม่ใส่ noise ให้ตรงการ์ด) */
    const dayVal = o => interp(l.story, o) + (o === 0 ? 0 : dNoise((o * 31.7 + 11) * sd) * l.dn);
    if (spec.mode === 'hour') {
      const vals = spec.labels.map((_, h) =>
        dayVal(spec.dayOff) + CIRC[l.circ || 'none'](h, l.ca || 0)
        + dNoise((spec.dayOff * 24 + h + 3) * sd) * l.dn * 0.45);
      /* วันนี้: ไล่ปรับให้ชั่วโมงท้ายสุดตรงค่าบนการ์ดพอดี (คงรูปทรงช่วงเช้าไว้) */
      if (spec.anchor) {
        const corr = l.last - vals[vals.length - 1];
        vals.forEach((v, h) => { vals[h] = v + corr * (h / (vals.length - 1)); });
      }
      vals.forEach((v, i) => { rows[i][l.key] = fmt(v); });
    } else if (spec.mode === 'day') {
      spec.offs.forEach((o, i) => { rows[i][l.key] = fmt(o === 0 ? l.last : dayVal(o)); });
    } else {
      /* รายเดือน: ค่ากลางเดือน + แกว่งเบาๆ — เดือนปัจจุบันจบที่ค่าล่าสุด */
      spec.offs.forEach((o, i) => {
        const isLastCur = spec.anchor && i === spec.offs.length - 1;
        rows[i][l.key] = fmt(isLastCur ? l.last : interp(l.story, o) + dNoise((o * 3.3 + 5) * sd) * l.dn * 0.5);
      });
    }
  });
  return rows;
}

function MetricDetailModal({ metric, onClose }) {
  const [period, setPeriod] = useState('วัน');
  const [selIdx, setSelIdx] = useState(null);   // จุดที่กดบนกราฟ — null = จุดท้ายของช่วง
  /* ตัวกรองช่วง: วัน/สัปดาห์เลือกวัน · เดือนเลือกเดือน · ปีเลือกปี (3 ปีย้อนหลัง) */
  const [selDate, setSelDate] = useState(DETAIL_TODAY);
  const [selMonth, setSelMonth] = useState({ y: DETAIL_TODAY.getFullYear(), m: DETAIL_TODAY.getMonth() });
  const [selYear, setSelYear] = useState(DETAIL_TODAY.getFullYear());
  const [pickerOpen, setPickerOpen] = useState(false);
  const cfg = DETAIL_CFG[metric.label];
  const spec = detailSpec(period, { date: selDate, month: selMonth, year: selYear });
  const data = genDetailData(cfg, spec);
  const pickerOptions = period === 'เดือน'
    ? Array.from({ length: 12 }, (_, i) => {
      const d = new Date(DETAIL_TODAY.getFullYear(), DETAIL_TODAY.getMonth() - i, 1);
      const o = { y: d.getFullYear(), m: d.getMonth() };
      return { label: `${TH_M[o.m]} ${beYY(o.y)}`, active: o.y === selMonth.y && o.m === selMonth.m, pick: () => setSelMonth(o) };
    })
    : period === 'ปี'
      ? Array.from({ length: 3 }, (_, i) => {
        const y = DETAIL_TODAY.getFullYear() - i;
        return { label: `ปี ${beYY(y)} (${y + 543})`, active: y === selYear, pick: () => setSelYear(y) };
      })
      : Array.from({ length: 14 }, (_, i) => {
        const d = addDays(DETAIL_TODAY, -i);
        return { label: i === 0 ? `วันนี้ · ${fmtDMY(d)}` : fmtDMY(d), active: sameDay(d, selDate), pick: () => setSelDate(d) };
      });
  const fmt = v => cfg.decimals ? (+v).toFixed(1) : Math.round(v);
  const stats = cfg.lines.map(l => {
    const vals = data.map(d => d[l.key]);
    return {
      name: l.name, color: l.color, color2: l.color2,
      last: fmt(vals[vals.length - 1]), avg: fmt(vals.reduce((a, b) => a + b, 0) / vals.length),
      max: fmt(Math.max(...vals)), min: fmt(Math.min(...vals)),
    };
  });
  const zoneLegends = (cfg.zones || []).filter(z => z.legendLabel);
  const loneRefs = (cfg.refs || []).filter(r => !r.hideLegend);
  const statusBg = metric.status === 'normal' ? '#34C759' : metric.status === 'critical' ? '#E02A2E' : '#E8802A';
  /* ค่า/สถานะที่แสดงบนหัว — โฟกัสจุดท้ายของช่วงเป็นค่าเริ่มต้น แล้วย้ายตามจุดที่กด
     isLive = จุดท้ายของช่วงปัจจุบันจริงๆ → ใช้ค่า/สถานะจากการ์ดหลักโดยตรง */
  const lastIdx = data.length - 1;
  const effIdx = Math.min(selIdx != null ? selIdx : lastIdx, lastIdx);
  const isLatest = effIdx === lastIdx;
  const selRow = !(isLatest && spec.anchor) ? data[effIdx] : null;
  const dispValue = selRow
    ? (cfg.lines.length > 1 ? cfg.lines.map(l => fmt(selRow[l.key])).join('/') : String(fmt(selRow[cfg.lines[0].key])))
    : metric.value;
  const outHigh = selRow && cfg.lines.some(l => l.range && selRow[l.key] > l.range[1]);
  const outLow = selRow && cfg.lines.some(l => l.range && selRow[l.key] < l.range[0]);
  const dispStatus = selRow
    ? (outHigh ? { text: 'สูงกว่าเกณฑ์', color: '#FF383C' } : outLow ? { text: 'ต่ำกว่าเกณฑ์', color: '#E8802A' } : { text: 'ปกติ', color: '#34C759' })
    : { text: metric.badge, color: (metric.status === 'normal' ? '#34C759' : metric.status === 'critical' ? '#E02A2E' : '#E8802A') };
  /* render ผ่าน portal ที่ body — ไม่งั้น backdrop-filter ของ .main-inner จะขัง fixed overlay ให้ครอบแค่โซน main */
  return createPortal(
    <div className="anim-backdrop" onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(30,27,57,0.45)',
      backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      {/* โครงตาม Figma 542:3284 — การ์ดขาว 600px ร่องเนื้อหาเป็นการ์ดซ้อน */}
      <div className="anim-scale-in" onClick={e => { e.stopPropagation(); setPickerOpen(false); }} style={{
        width: 600, maxWidth: '94vw', maxHeight: '90vh', overflowY: 'auto',
        background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(30px)',
        borderRadius: 24, padding: 16, fontFamily: font,
        boxShadow: '0 24px 80px rgba(30,27,57,0.35)',
        display: 'flex', flexDirection: 'column', gap: 14,
      }}>
        {/* ═ Header: กล่องไอคอนสีประจำ metric + ชื่อ · ปุ่มปิดวงกลม ═ */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 14, flexShrink: 0,
            background: cfg.lines[0].color2 || cfg.lines[0].color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {VITAL_ROW_ICONS[metric.label] && <img src={VITAL_ROW_ICONS[metric.label]} alt="" style={{ width: 20, height: 20, filter: 'brightness(10)' }} />}
          </div>
          <div style={{ flex: 1, fontSize: 16, fontWeight: 700, color: '#1E1B39' }}>{metric.label}</div>
          <button onClick={onClose} className="hover-btn" style={{
            width: 32, height: 32, borderRadius: '50%', border: 'none', cursor: 'pointer', flexShrink: 0,
            background: 'rgba(142,142,147,0.1)', color: '#8E8E93', fontSize: 13, fontFamily: font,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>✕</button>
        </div>
        <div style={{ height: 1, background: 'rgba(30,27,57,0.07)' }} />

        {/* ═ แท็บช่วงเวลา (fillterDate): pill กว้าง 80 · active ฟ้า #0088FF ═ */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex', padding: 4, borderRadius: 100,
            background: 'rgba(116,116,128,0.06)', border: '1px solid rgba(120,120,128,0.1)',
          }}>
            {DETAIL_PERIODS.map(p => (
              <button key={p} className="hover-btn" onClick={() => { setPeriod(p); setSelIdx(null); setPickerOpen(false); }} style={{
                width: 80, height: 28, borderRadius: 100, border: 'none', cursor: 'pointer',
                fontSize: 12, fontFamily: font, transition: 'all 0.2s ease',
                background: period === p ? '#0088FF' : 'transparent',
                color: period === p ? 'white' : '#1E1B39',
                fontWeight: period === p ? 600 : 400,
              }}>{p}</button>
            ))}
          </div>
          {/* ตัวกรองช่วง — dropdown ตามแท็บ: วัน/สัปดาห์ = เลือกวัน · เดือน = เลือกเดือน · ปี = เลือกปี */}
          <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
            <button className="hover-btn" onClick={() => setPickerOpen(o => !o)} style={{
              display: 'inline-flex', alignItems: 'center', gap: 7, cursor: 'pointer',
              height: 32, padding: '0 12px', borderRadius: 100, fontFamily: font,
              background: pickerOpen ? 'rgba(0,136,255,0.1)' : 'rgba(116,116,128,0.06)',
              border: `1px solid ${pickerOpen ? 'rgba(0,136,255,0.35)' : 'rgba(120,120,128,0.1)'}`,
              fontSize: 12, fontWeight: 600, color: pickerOpen ? '#0088FF' : '#1E1B39', transition: 'all 0.15s ease',
            }}>
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
                <rect x="1" y="2.2" width="12" height="10.8" rx="2.4" stroke="currentColor" strokeWidth="1.4" />
                <path d="M1 5.6h12" stroke="currentColor" strokeWidth="1.4" />
                <path d="M4.4 0.8v2.6M9.6 0.8v2.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              {spec.title}
              <svg width="9" height="6" viewBox="0 0 10 6" fill="none" style={{ flexShrink: 0, transform: pickerOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }}>
                <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {pickerOpen && (
              <div className="no-scrollbar anim-scale-in" style={{
                position: 'absolute', top: 'calc(100% + 6px)', right: 0, zIndex: 60, minWidth: 176,
                maxHeight: 232, overflowY: 'auto', background: 'white', borderRadius: 16, padding: 6,
                border: '1px solid rgba(30,27,57,0.08)', boxShadow: '0 14px 44px rgba(30,27,57,0.2)',
              }}>
                {pickerOptions.map(o => (
                  <button key={o.label} className="hover-btn" onClick={() => { o.pick(); setSelIdx(null); setPickerOpen(false); }} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
                    width: '100%', textAlign: 'left', padding: '8px 12px', borderRadius: 10,
                    border: 'none', cursor: 'pointer', fontFamily: font, fontSize: 12, whiteSpace: 'nowrap',
                    background: o.active ? 'rgba(0,136,255,0.1)' : 'transparent',
                    color: o.active ? '#0088FF' : '#1E1B39', fontWeight: o.active ? 600 : 400,
                  }}>
                    {o.label}
                    {o.active && <span style={{ fontSize: 11 }}>✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ═ การ์ดเนื้อหา: Value+Unit → Status → Date Record → Chart → Criterion ═ */}
        <div style={{
          background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(30,27,57,0.06)',
          borderRadius: 24, padding: 16, display: 'flex', flexDirection: 'column', gap: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            {/* ค่าใหญ่สีตามสถานะของจุดที่เลือก (default = ค่าล่าสุด) */}
            <span className="num" style={{ fontSize: 20, fontWeight: 700, color: dispStatus.color, transition: 'color 0.2s ease' }}>{dispValue}</span>
            <span style={{ fontSize: 12, color: '#000' }}>{metric.unit}</span>
            {!isLatest && (
              <button className="hover-btn" onClick={() => setSelIdx(null)} style={{
                marginLeft: 6, border: 'none', cursor: 'pointer', borderRadius: 100, padding: '3px 10px',
                background: 'rgba(0,136,255,0.1)', color: '#0088FF', fontSize: 10.5, fontWeight: 600, fontFamily: font,
              }}>↺ กลับค่าล่าสุด</button>
            )}
          </div>
          {dispStatus.text && (
            <span style={{
              alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 5,
              background: dispStatus.color, color: 'white', borderRadius: 100, padding: '4px 11px',
              fontSize: 11, fontWeight: 600, transition: 'background 0.2s ease',
            }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <circle cx="6" cy="6" r="6" fill="white" fillOpacity="0.25" />
                <circle cx="6" cy="3.4" r="0.9" fill="white" />
                <rect x="5.2" y="5" width="1.6" height="4" rx="0.8" fill="white" />
              </svg>
              {dispStatus.text}
            </span>
          )}
          <div style={{ fontSize: 12, fontWeight: 500, color: 'rgba(0,0,0,0.7)' }}>
            {/* แสดงวันที่ตรงๆ — วิวรายวันพ่วงเวลาของจุดด้วย · ช่วงย้อนหลังใช้ป้ายจุด/ชื่อช่วงที่เลือก */}
            {selRow
              ? (period === 'วัน' ? `${fmtDMY(selDate)} · ${selRow.day}` : isLatest ? spec.title : selRow.day)
              : (period === 'วัน' ? metric.updated : metric.updated.split(' · ')[0])}
          </div>

          {/* Chart — กล่องเทาอ่อนมุมมน 24 ตามแบบ */}
          <div style={{ background: 'rgba(142,142,147,0.07)', borderRadius: 24, padding: '14px 8px 6px' }}>
            <ResponsiveContainer width="100%" height={200}>
              <ComposedChart data={data} margin={{ top: 4, right: 12, bottom: 0, left: -14 }}
                onClick={st => { if (st && st.activeTooltipIndex != null) setSelIdx(st.activeTooltipIndex === lastIdx ? null : st.activeTooltipIndex); }}
                style={{ cursor: 'pointer' }}>
                <CartesianGrid stroke="rgba(30,27,57,0.05)" vertical={period === 'สัปดาห์'} />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#9291A5', fontFamily: font }} tickLine={false} axisLine={{ stroke: 'rgba(30,27,57,0.08)' }} minTickGap={22} />
                <YAxis domain={cfg.domain} ticks={cfg.ticks} tick={{ fontSize: 10, fill: '#9291A5', fontFamily: font }} tickLine={false} axisLine={false} />
                {(cfg.zones || []).map((z, zi) => (
                  <ReferenceArea key={zi} y1={z.y1} y2={z.y2} fill={z.color} stroke="none" />
                ))}
                {(cfg.refs || []).map(r => (
                  <ReferenceLine key={r.y} y={r.y} stroke={r.color} strokeOpacity={0.4} strokeDasharray="4 4" />
                ))}
                {/* เส้นโฟกัสแนวตั้ง + แหวนไฮไลต์ที่จุด — ล็อกค้างที่จุดที่กดเลือก */}
                {data[effIdx] && (
                  <ReferenceLine x={data[effIdx].day} stroke="#0088FF" strokeWidth={1.5} strokeDasharray="5 4" strokeOpacity={0.7} />
                )}
                {data[effIdx] && cfg.lines.map(l => {
                  const v = data[effIdx][l.key];
                  const out = l.range && (v < l.range[0] || v > l.range[1]);
                  const c = out ? '#FF383C' : l.color;
                  return [
                    <ReferenceDot key={`glow-${l.key}`} x={data[effIdx].day} y={v} r={11} fill={c} fillOpacity={0.15} stroke="none" isFront />,
                    <ReferenceDot key={`ring-${l.key}`} x={data[effIdx].day} y={v} r={7} fill="none" stroke={c} strokeWidth={2} isFront />,
                    <ReferenceDot key={`core-${l.key}`} x={data[effIdx].day} y={v} r={4} fill={c} stroke="white" strokeWidth={2} isFront />,
                  ];
                })}
                <Tooltip
                  content={<Tip unit={cfg.unit} source="รวมจากแอพ Atlas HomeCare · My Atlas · อุปกรณ์ IoT" ranges={Object.fromEntries(cfg.lines.map(l => [l.key, l.range]))} />}
                  cursor={{ stroke: 'rgba(30,27,57,0.15)', strokeDasharray: '3 3' }}
                />
                {cfg.lines.map(l => (
                  <Line key={l.key} type="monotone" dataKey={l.key} name={l.name}
                    stroke={l.color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
                    dot={({ cx, cy, value, index }) => {
                      /* จุดทุกช่วงเวลา — ขนาดตามความถี่ข้อมูล · หลุดเกณฑ์เป็นแดง (แหวนโฟกัสวาดด้วย ReferenceDot แยก) */
                      const base = data.length > 20 ? 2.5 : data.length > 10 ? 3 : 3.5;
                      const out = l.range && (value < l.range[0] || value > l.range[1]);
                      return <circle key={index} cx={cx} cy={cy} r={base} fill={out ? '#FF383C' : l.color} stroke="white" strokeWidth={1.5} />;
                    }}
                    activeDot={{ r: 5, fill: l.color, stroke: 'white', strokeWidth: 2 }}
                    animationDuration={700} animationEasing="ease-out"
                  />
                ))}
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Criterion — legend ใต้กราฟตามแบบ */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '4px 14px' }}>
            {cfg.lines.length > 1 && cfg.lines.map(l => (
              <span key={l.key} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#1E1B39', whiteSpace: 'nowrap' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: `linear-gradient(180deg, ${l.color}, ${l.color2})`, flexShrink: 0 }} />
                {l.name}
              </span>
            ))}
            {loneRefs.map(r => (
              <span key={r.y} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#615E83', whiteSpace: 'nowrap' }}>
                <svg width="14" height="2" style={{ flexShrink: 0, overflow: 'visible' }} aria-hidden="true">
                  <line x1="0" y1="1" x2="14" y2="1" stroke={r.color} strokeOpacity={0.55} strokeWidth="1.5" strokeDasharray="4 3" />
                </svg>
                {r.label}
              </span>
            ))}
            {(cfg.refs || []).filter(r => r.hideLegend).map(r => (
              <span key={`h-${r.y}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#615E83', whiteSpace: 'nowrap' }}>
                <svg width="14" height="2" style={{ flexShrink: 0, overflow: 'visible' }} aria-hidden="true">
                  <line x1="0" y1="1" x2="14" y2="1" stroke={r.color} strokeOpacity={0.55} strokeWidth="1.5" strokeDasharray="4 3" />
                </svg>
                {r.label}
              </span>
            ))}
            {zoneLegends.map((z, zi) => (
              <span key={`z-${zi}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#615E83', whiteSpace: 'nowrap' }}>
                <span style={{ width: 14, height: 8, borderRadius: 3, flexShrink: 0, background: `${z.edge}2E`, border: `1px solid ${z.edge}66` }} />
                {z.legendLabel}
              </span>
            ))}
          </div>
        </div>

        {/* ═ การ์ดสถิติ 4 ใบท้ายป๊อปอัพตามแบบ (ล่าสุด/เฉลี่ย/สูงสุด/ต่ำสุด) ═ */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {[['ล่าสุด', 'last'], ['เฉลี่ย', 'avg'], ['สูงสุด', 'max'], ['ต่ำสุด', 'min']].map(([lb, key]) => (
            <div key={lb} style={{
              background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(30,27,57,0.06)',
              borderRadius: 24, padding: '12px 12px 14px',
            }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: GRAY, marginBottom: 8 }}>{lb}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {stats.map(st => (
                  <div key={st.name} style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
                    {stats.length > 1 && <span style={{ width: 7, height: 7, borderRadius: '50%', background: st.color, flexShrink: 0, alignSelf: 'center' }} />}
                    <span className="num" style={{ fontSize: 18, fontWeight: 800, color: '#1E1B39', lineHeight: 1.15 }}>{st[key]}</span>
                    <span style={{ fontSize: 9, color: '#9291A5' }}>{cfg.unit}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ══ ตั้งค่าภาพเครื่องชั่ง BMI — ปรับตัวเลขตรงนี้ได้เลย ══ */
const BMI_SCALE_IMG = {
  width: 94,      // ความกว้างรูป (px)
  offsetX: 0,     // ขยับซ้าย/ขวา: + ไปขวา, - ไปซ้าย (px)
  offsetY: -28,   // ขยับขึ้น/ลง: + ยกขึ้น, - กดลง (px)
  opacity: 0.4,   // ความโปร่งใส 0–1 (1 = ทึบสุด)
  fadeStart: 20,  // % ของรูปที่เริ่มเฟดจางลงถึงขอบล่าง (100 = ไม่เฟด)
};

/* ── BMI Gauge SVG ── */
function getBmiCategory(bmi) {
  if (bmi < 18.5) return { label: 'น้ำหนักต่ำกว่าเกณฑ์', color: '#3B82F6', range: '< 18.5', advice: 'ควรเพิ่มน้ำหนักด้วยอาหารที่มีคุณค่า' };
  if (bmi < 23) return { label: 'ปกติ (สมส่วน)', color: '#34C759', range: '18.5 – 22.9', advice: 'น้ำหนักอยู่ในเกณฑ์ที่ดี รักษาไว้!' };
  if (bmi < 25) return { label: 'ท้วม', color: '#FFCC00', range: '23.0 – 24.9', advice: 'ควรควบคุมอาหารและออกกำลังกาย' };
  if (bmi < 30) return { label: 'อ้วน ระดับ 1', color: '#FF9500', range: '25.0 – 29.9', advice: 'ควรลดน้ำหนักและพบแพทย์' };
  return { label: 'อ้วน ระดับ 2', color: '#FF383C', range: '≥ 30.0', advice: 'ควรพบแพทย์เพื่อวางแผนลดน้ำหนัก' };
}

function BMIGauge({ bmi = 19.5 }) {
  /* Figma 504:2991 — เกจโชว์ช่วง 10–25 (19.5 → ~63% ของครึ่งวง) track เทาจาง เส้น gradient เขียว→เหลืองที่ปลาย */
  const frac = Math.min(Math.max((bmi - 10) / 15, 0), 1);
  const cat = getBmiCategory(bmi);
  const status = bmi >= 18.5 && bmi < 23 ? 'อยู่ในเกณฑ์ปกติ' : cat.label;
  return (
    <svg width="194" height="112" viewBox="0 0 194 112">
      <path d="M7 104 A 90 90 0 0 1 187 104" fill="none" stroke="rgba(142,142,147,0.10)" strokeWidth="13" strokeLinecap="round" />
      <path d="M7 104 A 90 90 0 0 1 187 104" fill="none" stroke="url(#bmiGrad)" strokeWidth="13" strokeLinecap="round" pathLength="100" strokeDasharray="100" strokeDashoffset={100 - frac * 100} />
      <defs>
        <linearGradient id="bmiGrad" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#34C759" />
          <stop offset="45%" stopColor="#34C759" />
          <stop offset="72%" stopColor="#FFE684" />
        </linearGradient>
      </defs>
      <text x="97" y="86" textAnchor="middle" fontSize="32" fontWeight="700" fill="#000" fontFamily={font}>{bmi}</text>
      <text x="97" y="108" textAnchor="middle" fontSize="12" fontWeight="500" fill={cat.color} fontFamily={font}>{status}</text>
    </svg>
  );
}

/* ── Chart mock data ──
   7 วันย้อนหลังจบที่วันอัพเดท (25 มี.ค) — จุดสุดท้ายต้องตรงกับค่าล่าสุดบนหัวการ์ดเสมอ
   src: ที่มาของค่ารายจุด — เยี่ยมบ้านบันทึกผ่าน Atlas HomeCare / ผู้ป่วยวัดเองผ่าน My Atlas + IoT */
const SRC_HOMECARE = 'แอพ Atlas HomeCare · บันทึกจากการเยี่ยมบ้าน';
const SRC_MYATLAS = 'แอพ My Atlas · ผู้ป่วยวัดเองด้วยอุปกรณ์ IoT';
/* ป้ายวัน 7 วันล่าสุดจบวันนี้ (ไดนามิก) + แหล่งบันทึก: เยี่ยมบ้าน = วันแรก/กลาง/วันนี้ ที่เหลือวัดเอง */
const WEEK_LABELS = Array.from({ length: 7 }, (_, i) => fmtDM(addDays(DETAIL_TODAY, i - 6)));
const WEEK_SRC = i => [0, 3, 6].includes(i) ? SRC_HOMECARE : SRC_MYATLAS;
const chartData = [[132, 88], [128, 85], [135, 90], [138, 82], [142, 86], [146, 80], [150, 77]]
  .map(([systolic, diastolic], i) => ({ day: WEEK_LABELS[i], systolic, diastolic, src: WEEK_SRC(i) }));

/* CGM: เครื่องวัดจริงบันทึกทุก 1-5 นาที — mock แบบ 5 นาที (288 จุด/วัน) ด้วยสูตร deterministic
   จังหวะร่างกายพื้นฐาน + ลอนน้ำตาลหลังมื้อ (เช้า/เที่ยง/เย็น/ของว่างก่อนนอน) มื้อเที่ยงทะลุเกณฑ์ 180 */
const cgmData = (() => {
  const meal = (t, center, height, width) => height * Math.exp(-((t - center) ** 2) / (2 * width * width));
  const pts = [];
  for (let m = 0; m < 24 * 60; m += 5) {
    const t = m / 60;
    const v = 96
      + 6 * Math.sin(((t - 3) / 24) * Math.PI * 2)
      + meal(t, 8.4, 62, 1.15)   // มื้อเช้า ~164
      + meal(t, 13.4, 92, 1.35)  // มื้อเที่ยง ~190 (เกินเกณฑ์)
      + meal(t, 19.3, 80, 1.5)   // มื้อเย็น ~171
      + meal(t, 23.6, 52, 0.8)   // ของว่างก่อนนอน — จูนให้เส้นไหลมาจบ ~142 เองพอดีค่าหัวการ์ด
      - meal(t, 3.6, 34, 1.0);   // น้ำตาลต่ำกลางดึก ~03:30 แตะ ~63 (ต่ำกว่าเกณฑ์ 70)
    pts.push({ day: `${String(Math.floor(t)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`, v: Math.round(v) });
  }
  pts[pts.length - 1].v = 142; // เก็บเศษปัดให้ตรงหัวการ์ดเป๊ะ (ค่าธรรมชาติ ~141)
  return pts;
})();

/* dataset ต่อ metric — การ์ดแต่ละใบดึงกราฟของตัวเองด้วย key นี้ (Figma 494:2233) */
const chartDataSets = {
  0: { // ความดันโลหิต — กราฟระดับอ่านทางคลินิก: เส้นทึบ, สเกลละเอียด, เส้นเกณฑ์ 140/90, สรุปเฉลี่ย+ช่วง
    data: chartData, lines: [
      { key: 'systolic', name: 'Systolic', color: '#FF383C', color2: '#992224', dash: '', range: [90, 140] },
      { key: 'diastolic', name: 'Diastolic', color: '#4A3AFF', color2: '#2C2399', dash: '', range: [60, 90] },
    ], domain: [60, 180], ticks: [60, 90, 120, 150, 180],
    dots: true, // สไตล์ chart ทางการแพทย์สากล: เส้นทึบ + จุด marker ทุกครั้งที่วัด
    refs: [
      { y: 140, color: '#FF383C', label: 'เกณฑ์ 140' },
      { y: 90, color: '#4A3AFF', label: 'เกณฑ์ 90' },
    ],
    h: 140,
  },
  /* ใบเดี่ยวใช้โทนแอพ (ม่วง-ฟ้า-มินต์) ไล่เฉดให้แยก metric ออก — BP คงแดง/น้ำเงินตามขนบทางการแพทย์ */
  1: { // อัตราเต้นของหัวใจ — สไตล์ chart การแพทย์สากล (เหมือน BP): เส้นทึบสีเดียว + marker ทุกจุดวัด จุดหลุดเกณฑ์เป็นแดงทึบ
    data: [82, 78, 85, 88, 92, 96, 103].map((v, i) => ({ day: WEEK_LABELS[i], v, src: WEEK_SRC(i) })),
    lines: [{ key: 'v', name: 'อัตราเต้นของหัวใจ', color: '#FF383C', color2: '#992224', dash: '', range: [60, 100] }],
    domain: [50, 120], ticks: [60, 80, 100, 120],
    /* แถบช่วงปกติจางๆ ตามขนบ chart คลินิก (reference range) — คำอธิบายอยู่ที่ legend ใต้กราฟ */
    zones: [{ y1: 60, y2: 100, color: 'rgba(52,199,89,0.06)', edge: '#1E9E4B', legendLabel: 'ช่วงปกติ 60–100' }],
    refs: [{ y: 100, color: '#FF383C', label: 'เกณฑ์ 100', hideLegend: true }],
    dots: true, // จุด marker ทุกครั้งที่วัด — เกินเกณฑ์เป็นจุดแดงทึบ
    h: 140, // อยู่แถวเดียวกับ BP — สูงเท่ากันให้แถวเสมอ
  },
  2: { // อุณหภูมิ — ล่าสุด 36 · โทนส้มเดียวกับป๊อปอัพดูเพิ่มเติม + โซนช่วงปกติ
    data: [36.5, 36.8, 36.2, 36.4, 36.6, 36.3, 36].map((v, i) => ({ day: WEEK_LABELS[i], v, src: WEEK_SRC(i) })),
    lines: [{ key: 'v', name: 'อุณหภูมิ', color: '#E8802A', color2: '#B45309', dash: '', range: [36, 37.5] }], domain: [35, 38],
    zones: [{ y1: 36, y2: 37.5, color: 'rgba(52,199,89,0.06)', edge: '#1E9E4B', legendLabel: 'ช่วงปกติ 36–37.5' }],
    dots: true,
  },
  3: { // ออกซิเจน — ล่าสุด 98 · โทนฟ้าเดียวกับป๊อปอัพ + โซน ≥95
    data: [97, 98, 96, 97, 95, 97, 98].map((v, i) => ({ day: WEEK_LABELS[i], v, src: WEEK_SRC(i) })),
    lines: [{ key: 'v', name: 'ออกซิเจน', color: '#1398D8', color2: '#0B6E9E', dash: '', range: [95, 100] }], domain: [90, 100],
    zones: [{ y1: 95, y2: 100, color: 'rgba(52,199,89,0.06)', edge: '#1E9E4B', legendLabel: 'ช่วงปกติ ≥ 95' }],
    dots: true,
  },
  4: { // น้ำตาล — ล่าสุด 142 · โทนม่วงเดียวกับป๊อปอัพ + โซน 70–180 (ขยาย domain ให้เห็นเกณฑ์)
    data: [118, 132, 125, 128, 135, 145, 142].map((v, i) => ({ day: WEEK_LABELS[i], v, src: WEEK_SRC(i) })),
    lines: [{ key: 'v', name: 'น้ำตาล', color: '#8B5CF6', color2: '#6D28D9', dash: '', range: [70, 180] }], domain: [60, 200], ticks: [60, 100, 140, 180],
    zones: [{ y1: 70, y2: 180, color: 'rgba(52,199,89,0.06)', edge: '#1E9E4B', legendLabel: 'ช่วงปกติ 70–180' }],
    dots: true,
  },
  6: { // CGM — เซนเซอร์บันทึกทุก 5 นาที (288 จุด/วัน) ยอดมื้อเที่ยงทะลุเกณฑ์ 180 ล่าสุด 142
    data: cgmData,
    /* เส้นทึบต่อเนื่อง (ข้อมูลเซนเซอร์ไม่ใช่การวัดเป็นครั้ง) เขียว = ในเกณฑ์
       splitColor ไล่สีเส้นช่วงที่ทะลุเกณฑ์เป็นแดง */
    lines: [{ key: 'v', name: 'CGM (24 ชม.)', color: '#34C759', color2: '#0F7B37', dash: '', range: [70, 180] }],
    splitColor: { high: 180, above: '#FF383C', low: 70, below: '#E8802A' },
    curve: 'natural', // spline โค้งไหลเป็นคลื่น เหมาะกับข้อมูลเซนเซอร์ต่อเนื่อง
    refs: [
      { y: 180, color: '#FF383C', label: 'เกณฑ์ 180' },
      { y: 70, color: '#E8802A', label: 'เกณฑ์ 70' },
    ],
    legend: [
      { color: '#34C759', color2: '#0F7B37', label: 'ในเกณฑ์' },
      { color: '#FF383C', color2: '#992224', label: 'สูง' },
      { color: '#E8802A', color2: '#B45309', label: 'ต่ำ' },
    ],
    source: 'แอพ My Atlas · อุปกรณ์สวมใส่ (เซนเซอร์ CGM) บันทึกทุก 5 นาที',
    showTir: true, // สรุป % เวลาที่อยู่ในเกณฑ์ (Time-in-Range) ใต้บรรทัดอัพเดท
    /* แกน Y แสดง 5 ค่า ระยะเท่ากันทุกขั้น (ขั้นละ 30) ครอบทั้งเกณฑ์ต่ำ 70 และสูง 180 */
    domain: [50, 210], ticks: [60, 90, 120, 150, 180],
    /* label แกน X กำหนดเอง ครบช่วงถึงขอบขวา — จุดสุดท้าย 23:55 แสดงเป็น 24:00 */
    xTicks: ['00:00', '06:00', '12:00', '18:00', '23:55'],
    h: 145,
  },
};

/* ── Mock vital history ── */
/* ตัดสินค่าคัดกรองรายรายการ — อิงเป้าหมายเฉพาะผู้ป่วย DM+HT หลัง PCI (BP<130/80, FBS<130) และเกณฑ์ทั่วไป
   คืน null = ปกติ · แดง = ผิดปกติชัด · ส้ม = เกินเป้าหมาย/เฝ้าระวัง */
const judgeScreening = (label, value) => {
  const num = parseFloat(String(value).replace(/[^\d.]/g, ''));
  if (label === 'ความดันโลหิต') {
    const m = String(value).match(/(\d+)\/(\d+)/);
    if (m) {
      const sys = +m[1], dia = +m[2];
      if (sys >= 140 || dia >= 90) return { text: 'สูงกว่าเกณฑ์', color: '#FF383C' };
      if (sys >= 130 || dia >= 80) return { text: 'เกินเป้าหมาย', color: '#E8802A' };
    }
    return null;
  }
  if (label === 'ออกซิเจนในเลือด') return num < 90 ? { text: 'ต่ำมาก', color: '#FF383C' } : num < 95 ? { text: 'ต่ำกว่าเกณฑ์', color: '#E8802A' } : null;
  if (label === 'อุณหภูมิ') return num > 37.5 ? { text: 'มีไข้', color: '#FF383C' } : num < 36 ? { text: 'ต่ำกว่าเกณฑ์', color: '#E8802A' } : null;
  if (label === 'น้ำตาลในเลือด') return num > 180 ? { text: 'สูงกว่าเกณฑ์', color: '#FF383C' } : num > 130 ? { text: 'สูงกว่าเป้าหมาย', color: '#E8802A' } : num < 70 ? { text: 'ต่ำกว่าเกณฑ์', color: '#FF383C' } : null;
  if (label === 'อัตราเต้นของหัวใจ') return num > 100 ? { text: 'เร็วกว่าเกณฑ์', color: '#FF383C' } : num < 60 ? { text: 'ช้ากว่าเกณฑ์', color: '#E8802A' } : null;
  if (label === 'รอบเอว') return num >= 90 ? { text: 'เกินเกณฑ์', color: '#E8802A' } : null;
  return null;
};

/* ประวัติการวัดรายเดือน — ไทม์ไลน์เรียงตามวัน/เวลา สร้างจากเครื่องจำลองชุดเดียวกับกราฟ (ค่าตรงกันเสมอ)
   · เยี่ยมบ้าน (Atlas HomeCare): เจ้าหน้าที่วัดครบทุกค่าแล้วกดบันทึกครั้งเดียว — 1 รายการ/ครั้ง ระบุอุปกรณ์รายค่า
   · วัดเอง (My Atlas): ข้อมูลไหลเข้าแยกทีละค่า ไม่พร้อมกัน — นาฬิกา/เซนเซอร์อัตโนมัติ + กรอกเองบางรายการ
     บางวันบางค่าวัดมากกว่า 1 ครั้ง (เช่น ความดันเช้า-เย็น) */
const histD = k => fmtDMY(addDays(DETAIL_TODAY, -k));
const HV_STAFF = 'พว.สุภาพร ทดสอบ57';
const buildMonthEntries = (y, m) => {
  const isCur = y === DETAIL_TODAY.getFullYear() && m === DETAIL_TODAY.getMonth();
  const nDays = isCur ? DETAIL_TODAY.getDate() : new Date(y, m + 1, 0).getDate();
  const spec = detailSpec('เดือน', { month: { y, m } });
  const [bp, hr, tp, ox, sg, cg] = ['ความดันโลหิต', 'อัตราเต้นของหัวใจ', 'อุณหภูมิ', 'ออกซิเจน', 'น้ำตาล', 'CGM']
    .map(k => genDetailData(DETAIL_CFG[k], spec));
  const rnd = (d, s) => dNoise((y * 372 + m * 31 + d) * 7.7 + s);
  const mm = v => String(Math.abs(Math.round(v)) % 60).padStart(2, '0');
  const out = [];
  for (let d = nDays; d >= 1; d--) {
    const i = d - 1;
    const dateLabel = fmtDMY(new Date(y, m, d));
    const isToday = isCur && d === nDays;
    const isHome = isToday || (d - 1) % 7 === 0;
    const day = [];
    const push = (time, e) => day.push({ id: `${y}-${m}-${d}-${e.metric || 'home'}-${time}`, dateLabel, isToday, time, ...e });
    /* ── My Atlas: แยกรายค่า ── */
    push('23:55', { kind: 'self', metric: 'CGM', value: `${cg[i].v}`, unit: 'mg/dl', dev: 'เซนเซอร์ CGM Anytime', auto: true });
    push(`20:${mm(rnd(d, 1) * 30 + 15)}`, { kind: 'self', metric: 'อัตราเต้นของหัวใจ', value: `${hr[i].v}`, unit: 'bpm', dev: 'นาฬิกา Anytime Watch', auto: true });
    if (rnd(d, 2) > 0.25) push(`19:${mm(rnd(d, 3) * 30 + 10)}`, { kind: 'self', metric: 'ความดันโลหิต', value: `${bp[i].systolic + Math.round(rnd(d, 4) * 4)}/${bp[i].diastolic + Math.round(rnd(d, 5) * 3)}`, unit: 'mmHg', dev: 'เครื่องวัดความดันที่บ้าน', auto: false, again: true });
    if (rnd(d, 6) > 0.55) push(`18:${mm(rnd(d, 9) * 30 + 20)}`, { kind: 'self', metric: 'อุณหภูมิ', value: `${tp[i].v}`, unit: '°C', dev: 'เครื่องวัดไข้', auto: false });
    if (rnd(d, 7) > 0) push(`12:${mm(rnd(d, 8) * 30 + 5)}`, { kind: 'self', metric: 'ออกซิเจน', value: `${ox[i].v}`, unit: '%', dev: 'นาฬิกา Anytime Watch', auto: true });
    push(`07:${mm(rnd(d, 12) * 30 + 10)}`, { kind: 'self', metric: 'ความดันโลหิต', value: `${bp[i].systolic}/${bp[i].diastolic}`, unit: 'mmHg', dev: 'เครื่องวัดความดันที่บ้าน', auto: false });
    if (rnd(d, 10) > -0.2) push(`06:${mm(rnd(d, 11) * 30 + 40)}`, { kind: 'self', metric: 'น้ำตาล', value: `${sg[i].v}`, unit: 'mg/dl', dev: 'เครื่องเจาะ GLUCO', auto: false });
    /* ── เยี่ยมบ้าน: บันทึกครบชุดครั้งเดียว ── */
    if (isHome) push(isToday ? '10:30' : '10:00', {
      kind: 'home', staff: HV_STAFF,
      vitals: [
        { label: 'ความดันโลหิต', value: `${bp[i].systolic}/${bp[i].diastolic}`, unit: 'mmHg', dev: 'เครื่องวัดความดัน Yuwell (IoT)' },
        { label: 'อัตราเต้นของหัวใจ', value: `${hr[i].v}`, unit: 'bpm', dev: 'เครื่องวัดปลายนิ้ว (IoT)' },
        { label: 'อุณหภูมิ', value: `${tp[i].v}`, unit: '°C', dev: 'เครื่องวัดไข้อินฟราเรด (IoT)' },
        { label: 'ออกซิเจน', value: `${ox[i].v}`, unit: '%', dev: 'เครื่องวัดปลายนิ้ว (IoT)' },
        { label: 'น้ำตาล', value: `${sg[i].v}`, unit: 'mg/dl', dev: 'เครื่องเจาะ GLUCO (IoT)' },
        { label: 'ส่วนสูง', value: '175', unit: 'cm', dev: 'กรอกเอง' },
        { label: 'น้ำหนัก', value: '60', unit: 'kg', dev: 'กรอกเอง' },
        { label: 'รอบเอว', value: '28', unit: 'inch', dev: 'กรอกเอง' },
      ],
    });
    day.sort((a, b) => b.time.localeCompare(a.time));
    out.push(...day);
  }
  return out;
};

/* ── Stat card configs ── */
import imgRobotBp from '../assets/images/vital-robot-bp.png';
import imgRobotCgm from '../assets/images/vital-robot-cgm.png';
import imgBmiScale from '../assets/images/vital-bmi-scale.png';
import imgVitalMannequin from '../assets/images/vital-mannequin.png';
import imgVitalMannBp from '../assets/images/vital-mann-bp.png';
import imgVitalMannHeart from '../assets/images/vital-mann-heart.png';
import imgVitalMannWatch from '../assets/images/vital-mann-watch.png';
import imgVitalMannTemp from '../assets/images/vital-mann-temp.png';
import imgVitalMannSugar from '../assets/images/vital-mann-sugar.png';
import imgMiniBp from '../assets/images/vital-mini-bp.png';
import imgMiniHr from '../assets/images/vital-mini-hr.png';
import imgMiniTemp from '../assets/images/vital-mini-temp.png';
import imgMiniSpo2 from '../assets/images/vital-mini-spo2.png';
import imgMiniSugar from '../assets/images/vital-mini-sugar.png';
import imgMiniCgm from '../assets/images/vital-mini-cgm.png';
import ppInfoCircle from '../assets/icons/pp-info-circle.svg';
import ppRowBp from '../assets/icons/pp-row-bp.svg';
import ppRowEcg from '../assets/icons/pp-row-ecg.svg';
import ppRowThermo from '../assets/icons/pp-row-thermo.svg';
import ppRowOxygen from '../assets/icons/pp-row-oxygen.svg';
import ppRowDrop from '../assets/icons/pp-row-drop.svg';
import ppRowHeight from '../assets/icons/pp-row-height.svg';
import ppRowWeight from '../assets/icons/pp-row-weight.svg';
import ppRowWaist from '../assets/icons/pp-row-waist.svg';
import ppHeaderIcon from '../assets/icons/pp-header-icon.svg';
import ppStethoscope from '../assets/icons/pp-stethoscope.svg';
import ppTextSearch from '../assets/icons/pp-text-search.svg';
import ppCheckmarkCircle from '../assets/icons/pp-checkmark-circle.svg';
import ppEcgText from '../assets/icons/pp-ecg-text.svg';
import ppBoltHeart from '../assets/icons/pp-bolt-heart.svg';
import ppChartClipboard from '../assets/icons/pp-chart-clipboard.svg';
import ppSparkleClipboard from '../assets/icons/pp-sparkle-clipboard.svg';
import ppHeartClipboard from '../assets/icons/pp-heart-clipboard.svg';
import imgHomevisit3dCard from '../assets/images/homevisit-3d.png';
import imgHomevisitHero3d from '../assets/images/homevisit-hero-3d.png';
import imgMedPrescription3d from '../assets/images/med-prescription-3d.png';
import ppPill from '../assets/icons/pp-pill.svg';
import imgMedPill3d from '../assets/images/med-pill-3d.png';
import imgMedMorning from '../assets/images/med-morning.png';
import imgMedNoon from '../assets/images/med-noon.png';
import imgMedEvening from '../assets/images/med-evening.png';
import imgMedNight from '../assets/images/med-night.png';
import iconMedCheck from '../assets/icons/med-check-circle.svg';
import iconMedX from '../assets/icons/med-x-circle.svg';
import iconMedHourglass from '../assets/icons/med-hourglass.svg';
import iconMedList from '../assets/icons/med-list-icon.svg';
import iconMedCalendar from '../assets/icons/med-calendar-icon.svg';
import ppPencilClipboard from '../assets/icons/pp-pencil-clipboard.svg';
import imgAssessBarthel from '../assets/images/assess-barthel.png';
import imgAssessAdl from '../assets/images/assess-adl.png';
import imgAssessAsthma from '../assets/images/assess-asthma.png';
import imgAssessRisk35 from '../assets/images/assess-risk35.png';
import imgAssessDyspnea from '../assets/images/assess-dyspnea.png';
import imgAssessHero3d from '../assets/images/assess-hero-3d.png';

/* การ์ดรวม KPI + กราฟตามดีไซน์ Figma (node 494:2233) — chart ชี้ dataset ใน chartDataSets
   ผังกริด 3 คอลัมน์: แถว 1 = ความดัน(2)+อัตราเต้นของหัวใจ(1), แถว 2 = อุณหภูมิ/ออกซิเจน/น้ำตาล(1:1:1),
   แถว 3 = BMI(1)+CGM(2) — col/row คุมตำแหน่ง ใบที่ไม่ระบุปล่อยไหลตามลำดับ */
const statCards = [
  /* artCrop: หน้าต่างครอปมุมขวาล่าง (w,h) + ขนาด/ตำแหน่งภาพข้างใน (imgW,x,y) — จูนให้เห็นแขนใส่ cuff กับจอเครื่องวัด */
  { label: 'ความดันโลหิต', value: '150/77', unit: 'mmHg', status: 'warning', badge: 'สูงเล็กน้อย',  updated: `${histD(0)} · 10:30`, delta: '▲4 / ▼3', chart: 0, art: imgRobotBp, artCrop: { w: 163, h: 249, imgW: 303, x: -24, y: 25 }, col: 'span 2' },
  { label: 'อัตราเต้นของหัวใจ',        value: '103',    unit: 'bpm',   status: 'warning', badge: 'หัวใจเต้นเร็ว', updated: `${histD(0)} · 10:30`, delta: '▲7', chart: 1 },
  { label: 'อุณหภูมิ',      value: '36',     unit: 'C',     status: 'normal',  badge: 'ปกติ',        updated: `${histD(0)} · 10:35`, delta: '▼0.3', chart: 2 },
  { label: 'ออกซิเจน',     value: '98',     unit: '%',     status: 'normal',  badge: 'ปกติ',        updated: `${histD(0)} · 10:35`, delta: '▲1', chart: 3 },
  { label: 'น้ำตาล',       value: '142',    unit: 'mg/dl', status: 'normal',  badge: 'ปกติ',        updated: `${histD(0)} · 07:00`, delta: '▼3', chart: 4 },
  { label: 'CGM',          value: '142',    unit: 'mg/dl', status: 'normal',  badge: 'ปกติ',        updated: `${histD(0)} · 23:55`, chart: 6, art: imgRobotCgm, artCrop: { w: 108, h: 219, imgW: 275, x: -62, y: -4 }, col: '2 / 4', row: 3 },
];

/* กรอบและเงาเป็นกลางเหมือนกันทุกใบ (ตามที่ตกลงไว้ ไม่ใช้เงาสีของ Figma) */
const CARD_BORDER = '1px solid rgba(30,27,57,0.07)';
const CARD_SHADOW = '0 2px 10px rgba(30,27,57,0.05)';

/* ภาพอุปกรณ์ประจำ vital มุมขวาล่างมินิการ์ด (นาฬิกาหน้าจอค่านั้นๆ / กล่องเซนเซอร์ CGM) — แสดงแบบจางๆ
   นาฬิกาทุกใบใช้ค่าจูนโดยผู้ใช้ชุดเดียวกัน · CGM ใช้ค่าเฉพาะ */
const MINI_ART = [
  { img: imgMiniBp, w: 84, r: -28, b: -18, op: 0.38, fd: 62 },    // ความดัน — นาฬิกาหน้าจอ 120/80
  { img: imgMiniHr, w: 84, r: -28, b: -18, op: 0.38, fd: 62 },    // การเต้นหัวใจ — นาฬิกาหน้าจอ BPM
  { img: imgMiniTemp, w: 84, r: -28, b: -18, op: 0.38, fd: 62 },  // อุณหภูมิ — นาฬิกาหน้าจอ °C
  { img: imgMiniSpo2, w: 84, r: -28, b: -18, op: 0.38, fd: 62 },  // ออกซิเจน — นาฬิกาหน้าจอ SpO2
  { img: imgMiniSugar, w: 84, r: -28, b: -18, op: 0.38, fd: 62 }, // น้ำตาล — นาฬิกาหน้าจอ มก./ดล.
  { img: imgMiniCgm, w: 92, b: -5 },                              // CGM — กล่องเซนเซอร์ Anytime
];

/* หุ่นจำลองข้างกราฟใหญ่ เปลี่ยนตาม vital ที่เลือก — เซ็ตทางการจาก Figma (โหนดชื่อ BP/HR/SO2/temperature/Blood glucose/CGM)
   ค่าตำแหน่ง/ขนาดต่อแท็บจูนผ่านแผง ⚙ แล้วฝังที่นี่ */
const VITAL_ART = [
  { img: imgVitalMannBp, cw: 259, ch: 290, w: 364, ix: 0, iy: -56, x: 0, y: -20, opacity: 1, fade: 45 }, // ความดัน — ครอปซูมช่วงตัว+เครื่องวัด (ค่าจูนโดยผู้ใช้)
  { img: imgVitalMannHeart, cw: 259, ch: 290, w: 390, ix: -66, iy: -142, x: 0, y: -20, opacity: 1, fade: 50 }, // การเต้นหัวใจ — ครอปซูมช่วงบน โฟกัสนาฬิกาที่ยกดู
  { img: imgVitalMannTemp, w: 259, x: -7, y: -24, opacity: 1, fade: 58 },     // อุณหภูมิ — ยกเครื่องวัดไข้จ่อหน้าผากตัวเอง
  { img: imgVitalMannWatch, w: 259, x: -7, y: -24, opacity: 1, fade: 58 },    // ออกซิเจน — นาฬิกาสวมใส่ที่ข้อมือ
  { img: imgVitalMannSugar, w: 259, x: -7, y: -24, opacity: 1, fade: 58 },    // น้ำตาล — ถือเครื่องเจาะน้ำตาล
  { img: imgVitalMannequin, w: 259, x: -7, y: -24, opacity: 1, fade: 58 },    // CGM — เซนเซอร์แปะต้นแขน
];

/* เติมค่า default ให้ครบทุก field — ค่าจริงจูนผ่านแผงตั้งค่า (ถอดออกแล้ว) และฝังไว้ข้างบน */
const VITAL_ART_CFG = VITAL_ART.map(a => ({
  cw: a.cw ?? a.w, ch: a.ch ?? Math.round(a.w * 1.12),
  w: a.w, ix: a.ix ?? 0, iy: a.iy ?? 0,
  x: a.x ?? 14, y: a.y ?? -20, opacity: a.opacity ?? 1, fade: a.fade ?? 68,
}));
const MINI_ART_CFG = MINI_ART.map(m => ({
  w: m.w, r: m.r ?? -8, b: m.b ?? -12, op: m.op ?? 0.38, fd: m.fd ?? 62,
}));

/* สถานะกำหนด: สีไม่ทาทั้งใบ — แต้มแค่ 2 จุดคือมุมบนซ้าย (surface) กับหลังภาพ 3D (imgGlow)
   ที่เหลือเป็นพื้นขาว ค่าปกติขาวล้วน มีสีแค่ป้ายเขียว */
/* การ์ดขาวล้วนทุกสถานะตามดีไซน์ 504:3142 — สถานะสื่อผ่านสีตัวเลข/หน่วย/ป้ายเท่านั้น */
const VITAL_STATUS = {
  normal: {
    surface: '#FFFFFF',
    value: '#34C759', unit: '#34C759',
    badgeBg: '#34C759', badgeFg: '#FFFFFF',
    mark: 'info',
  },
  warning: {
    surface: '#FFFFFF',
    value: '#E8802A', unit: '#FF8D28',
    badgeBg: '#E8802A', badgeFg: '#FFFFFF',
    mark: '!', markFg: '#E8802A',
  },
  critical: {
    surface: '#FFFFFF',
    value: '#E02A2E', unit: '#FF6B6E',
    badgeBg: '#FF383C', badgeFg: '#FFFFFF',
    mark: '!', markFg: '#FF383C',
  },
};


/* ── Home Visit History Data ── */
const homeVisitData = [
  { month: 'มีนาคม 69', visits: [
    { day: 25, monthShort: 'มี.ค', time: '10:30 น.', visitor: 'พว.สุภาพร ทดสอบ57', type: 'เยี่ยมตามนัด', tags: ['Barthel Index', 'ADL', 'Cardiac Rehab'],
      detail: {
        hn: 'HN-650001', datetime: '25 มีนาคม 2569 - 10:30 น.',
        mission: 'ติดตามการฟื้นฟูสมรรถภาพหัวใจ (Cardiac Rehabilitation Phase III) ประเมินความสามารถในการออกกำลังกาย ติดตามการรับประทานยาต้านเกล็ดเลือดคู่ (DAPT) และควบคุมปัจจัยเสี่ยง ได้แก่ ความดันโลหิต ไขมันในเลือด ระดับน้ำตาล และส่งเสริมการเลิกบุหรี่',
        medical: 'โรคหัวใจขาดเลือดเฉียบพลัน (Acute STEMI) S/P PCI RCA with 1 DES เมื่อ 21/02/69\nชาย 61 ปี โรคร่วม: DM type 2, HT, Dyslipidemia\nผลตรวจ 06/03/69: Hb 9.3 g/dL, Hct 27%, WBC 12,830, Platelet 546,000, Cr 0.93 mg/dL, eGFR 88 mL/min/1.73m²\nEcho (28/02/69): EF 45%, mild MR, regional wall motion abnormality at inferior wall\nยาปัจจุบัน: Clopidogrel 75 mg bid, Atorvastatin 40 mg od, Omeprazole 20 mg bid, Aspirin 81 mg od, Ferrous Fumarate 200 mg tid, Spironolactone 25 mg od, Isosorbide SL 5 mg prn',
        reason: 'ติดตามฟื้นฟูสมรรถภาพหัวใจหลัง PCI ครั้งที่ 3 (สัปดาห์ที่ 4)',
        objective: 'ประเมินระดับ Functional Capacity ด้วย 6-Minute Walk Test, ติดตามการรับประทานยา DAPT ครบ ประเมินภาวะเลือดออกผิดปกติ, ควบคุม BP < 130/80 mmHg, LDL < 55 mg/dL ตามแนวทาง ESC 2023',
        healthIssue: 'ผู้ป่วยยังมีอาการเหนื่อยเล็กน้อยเมื่อเดินขึ้นบันได (NYHA Class II) ค่า EF 45% ต้องเฝ้าระวังภาวะหัวใจล้มเหลว และมีภาวะโลหิตจาง (Hb 9.3) จากการใช้ยาต้านเกล็ดเลือดคู่',
        social: { members: '3 คน (ภรรยา, ลูกสาว)', income: '18,000 บาท/เดือน', welfare: 'บัตรทอง (สิทธิ์ 30 บาท)', mental: 'วิตกกังวลเล็กน้อยเรื่องการกลับไปทำงาน PHQ-2 = 1 คะแนน', env: 'บ้านชั้นเดียว พื้นเรียบไม่มีบันได มีห้องน้ำนั่งราบ อากาศถ่ายเทดี ห่างจาก รพ.สต. ประมาณ 3 กม.' },
        screening: [
          { label: 'ความดันโลหิต', value: '128/78 mmHg' }, { label: 'ออกซิเจนในเลือด', value: '97%' },
          { label: 'อุณหภูมิ', value: '36.5 °C' }, { label: 'น้ำตาลในเลือด', value: '142 mg/dL' },
          { label: 'อัตราเต้นของหัวใจ', value: '72 bpm' }, { label: 'น้ำหนัก', value: '68 kg' },
          { label: 'ส่วนสูง', value: '170 cm' }, { label: 'รอบเอว', value: '90 cm' },
        ],
        notes: [
          { icon: 'ecg', label: 'บันทึกการเยี่ยม', value: 'ผู้ป่วยอาการทั่วไปดี รู้สึกตัวดี ไม่มีอาการเจ็บหน้าอก 6MWT = 380 เมตร (เพิ่มขึ้นจากครั้งก่อน 40 เมตร) ไม่มีจุดเลือดออกตามตัว ไม่มีอุจจาระดำ' },
          { icon: 'bolt', label: 'อาการและอาการแสดง', value: 'เหนื่อยเล็กน้อยหลังเดินเร็วประมาณ 15 นาที (Borg Scale 3/10) ไม่มี chest pain, orthopnea, PND ขาไม่บวม น้ำหนักคงที่' },
          { icon: 'chart', label: 'การพยาบาล', value: 'วัด vital signs, ตรวจ capillary refill time ปลายมือปลายเท้าปกติ, ตรวจจุดแทง catheter ที่ข้อมือขวา แผลหายดีไม่บวมแดง, ทำ 6MWT พร้อมจับ SpO2 ระหว่างเดิน' },
          { icon: 'sparkle', label: 'การให้คำแนะนำ', value: 'เพิ่มระยะเวลาเดินเป็น 20 นาที/วัน ความเร็วปานกลาง, งดอาหารเค็ม/มัน/ทอด, ทานยา DAPT สม่ำเสมอห้ามหยุดเอง, สังเกตอาการเลือดออกผิดปกติ เช่น ฟกช้ำง่าย เลือดกำเดา อุจจาระดำ, พบแพทย์ทันทีหากเจ็บหน้าอก/เหนื่อยมากขึ้น' },
          { icon: 'heart', label: 'การประเมิน', value: 'อาการดีขึ้นต่อเนื่อง 6MWT เพิ่มขึ้น BP ควบคุมได้ดี น้ำตาลสูงเล็กน้อยต้องติดตาม แนะนำนัดเจาะเลือดตรวจ HbA1c, Lipid profile ก่อนพบแพทย์ครั้งต่อไป 18/04/69' },
        ],
      },
    },
    { day: 5, monthShort: 'มี.ค', time: '09:00 น.', visitor: 'พว.สุภาพร ทดสอบ57', type: 'เยี่ยมตามนัด', tags: ['Barthel Index', 'Wound Care'],
      detail: {
        hn: 'HN-650001', datetime: '5 มีนาคม 2569 - 09:00 น.',
        mission: 'ติดตามอาการหลัง PCI สัปดาห์ที่ 2 ประเมินแผล catheter site ติดตามภาวะโลหิตจางจากยาต้านเกล็ดเลือด และเริ่มโปรแกรมฟื้นฟูหัวใจระยะที่ 2',
        medical: 'ผลตรวจ 03/03/69: CBC - Hb 9.0 g/dL (ลดลงจาก D/C), Platelet 380,000\nผู้ป่วยรับประทานยาสม่ำเสมอ ไม่มี chest pain ขณะพัก แต่ยังเหนื่อยง่ายเมื่อเดินเร็ว',
        reason: 'ติดตามหลัง PCI สัปดาห์ที่ 2 ตรวจแผลและเริ่ม Cardiac Rehab Phase II',
        objective: 'ประเมินแผล catheter site, ตรวจสอบอาการเลือดออกผิดปกติ, ทำ 6MWT baseline, สอนการออกกำลังกายที่ปลอดภัย',
        healthIssue: 'ภาวะโลหิตจาง Hb 9.0 จากยา DAPT ต้องเฝ้าระวัง, เหนื่อยง่ายเมื่อออกแรง (NYHA Class II-III), ผู้ป่วยยังกลัวการออกกำลังกายเพราะกังวลเรื่องหัวใจ',
        social: { members: '3 คน (ภรรยา, ลูกสาว)', income: '18,000 บาท/เดือน', welfare: 'บัตรทอง (สิทธิ์ 30 บาท)', mental: 'วิตกกังวลปานกลาง กลัวออกกำลังกายจะทำให้หัวใจวาย PHQ-2 = 2 คะแนน', env: 'บ้านชั้นเดียว สะอาด' },
        screening: [
          { label: 'ความดันโลหิต', value: '135/82 mmHg' }, { label: 'ออกซิเจนในเลือด', value: '96%' },
          { label: 'อุณหภูมิ', value: '36.4 °C' }, { label: 'น้ำตาลในเลือด', value: '155 mg/dL' },
          { label: 'อัตราเต้นของหัวใจ', value: '80 bpm' }, { label: 'น้ำหนัก', value: '69 kg' },
          { label: 'ส่วนสูง', value: '170 cm' }, { label: 'รอบเอว', value: '91 cm' },
        ],
        notes: [
          { icon: 'ecg', label: 'บันทึกการเยี่ยม', value: 'ผู้ป่วยพักผ่อนอยู่บ้าน เดินในบ้านได้ ยังไม่กล้าเดินออกนอกบ้าน แผล catheter ข้อมือขวาหายดี ไม่บวมแดง ผิวซีดเล็กน้อยจากภาวะโลหิตจาง' },
          { icon: 'bolt', label: 'อาการและอาการแสดง', value: 'เหนื่อยง่ายเมื่อเดินเร็วหรือเดินนานกว่า 5 นาที (Borg Scale 5/10) มีอาการวิงเวียนเล็กน้อยเมื่อลุกขึ้นเร็ว (Orthostatic hypotension)' },
          { icon: 'chart', label: 'การพยาบาล', value: 'วัด vital signs, ตรวจแผล catheter site, ทำ 6MWT baseline = 340 เมตร, ตรวจ orthostatic BP: นอน 130/80 → ยืน 118/72 (drop 12 mmHg), สอน graded exercise protocol' },
          { icon: 'sparkle', label: 'การให้คำแนะนำ', value: 'เริ่มเดินช้าๆ 10 นาที/วัน เพิ่มทีละ 2 นาที/สัปดาห์, ลุกขึ้นช้าๆ นั่งพักก่อนยืน, ทานอาหารที่มีธาตุเหล็กสูง เช่น ตับ ผักใบเขียว, พบแพทย์ตามนัด 18/03/69 พร้อมผลเลือด' },
          { icon: 'heart', label: 'การประเมิน', value: 'ผู้ป่วยฟื้นตัวช้ากว่าปกติเนื่องจากภาวะโลหิตจาง ต้องติดตาม Hb ใกล้ชิด หาก < 8.0 ต้องพิจารณาส่งพบแพทย์ก่อนนัด อาการวิตกกังวลดีขึ้นหลังอธิบายโปรแกรม Cardiac Rehab' },
        ],
      },
    },
  ]},
  { month: 'กุมภาพันธ์ 69', visits: [
    { day: 26, monthShort: 'ก.พ', time: '14:00 น.', visitor: 'พว.สุภาพร ทดสอบ57', type: 'เยี่ยมหลัง D/C', tags: ['Post-Discharge', 'Med Reconciliation'],
      detail: {
        hn: 'HN-650001', datetime: '26 กุมภาพันธ์ 2569 - 14:00 น.',
        mission: 'เยี่ยมบ้านภายใน 48 ชม. หลังจำหน่ายจากโรงพยาบาล (D/C 25/02/69) ตรวจสอบความเข้าใจเรื่องยาต้านเกล็ดเลือดคู่ ประเมินความพร้อมของบ้านสำหรับผู้ป่วยโรคหัวใจ และวางแผน Cardiac Rehab ระยะที่ 2',
        medical: 'D/C จาก IPD 25/02/69 หลัง PCI RCA with 1 DES เมื่อ 21/02/69\nAdmit dx: Acute STEMI inferior wall, อาการสำคัญ: เจ็บแน่นหน้าอกรุนแรง 3 ชม. ก่อนมา\nPeak Troponin I 41.8 ng/L, Hb ตอน D/C 9.5 g/dL\nD/C meds: Clopidogrel 75 mg bid, Aspirin 81 mg od, Atorvastatin 40 mg od, Omeprazole 20 mg bid, Spironolactone 25 mg od, Ferrous Fumarate 200 mg tid, Isosorbide SL 5 mg prn',
        reason: 'เยี่ยมหลังจำหน่าย 48 ชม. (Transitional Care) ตามแนวปฏิบัติ ACS pathway',
        objective: 'ทวนสอบรายการยา (Med Reconciliation), ประเมินความเข้าใจเรื่องโรคและยา, ประเมินสภาพบ้านและ caregiver, วาง plan Cardiac Rehab Phase II',
        healthIssue: 'ผู้ป่วยเพิ่ง D/C 1 วัน ยังอ่อนเพลีย ปวดบริเวณแผลข้อมือขวา (catheter site) เล็กน้อย มีรอยฟกช้ำรอบแผล ยังสับสนเรื่องยาบางตัว ภรรยาเป็น caregiver หลักแต่ทำงานกลางวัน',
        social: { members: '3 คน (ภรรยาอายุ 58 ปี ทำงานแม่บ้าน, ลูกสาว 30 ปี ทำงานโรงงาน)', income: '18,000 บาท/เดือน', welfare: 'บัตรทอง (สิทธิ์ 30 บาท)', mental: 'วิตกกังวลมาก กลัวเกิดซ้ำ นอนไม่หลับ 2 คืนแล้ว PHQ-2 = 3 คะแนน', env: 'บ้านชั้นเดียว ห้องน้ำนั่งราบ ไม่มีบันได พื้นกระเบื้องเรียบ มีราวจับในห้องน้ำ อากาศถ่ายเทดี' },
        screening: [
          { label: 'ความดันโลหิต', value: '140/85 mmHg' }, { label: 'ออกซิเจนในเลือด', value: '96%' },
          { label: 'อุณหภูมิ', value: '36.6 °C' }, { label: 'น้ำตาลในเลือด', value: '168 mg/dL' },
          { label: 'อัตราเต้นของหัวใจ', value: '84 bpm' }, { label: 'น้ำหนัก', value: '70 kg' },
          { label: 'ส่วนสูง', value: '170 cm' }, { label: 'รอบเอว', value: '92 cm' },
        ],
        notes: [
          { icon: 'ecg', label: 'บันทึกการเยี่ยม', value: 'ผู้ป่วย D/C จาก IPD เมื่อวาน นอนพักอยู่บ้าน รู้สึกตัวดี ยังอ่อนเพลีย เบื่ออาหารเล็กน้อย ปัสสาวะปกติ ยังไม่ถ่ายอุจจาระ แผล catheter ข้อมือขวามีรอยฟกช้ำ 2x3 cm ไม่มีเลือดซึม' },
          { icon: 'bolt', label: 'อาการและอาการแสดง', value: 'อ่อนเพลีย เวียนศีรษะเมื่อลุกนั่ง เหนื่อยง่ายมากเมื่อเดินไปห้องน้ำ (Borg Scale 6/10) ไม่มี chest pain ขณะพัก ไม่มีอาการ orthopnea/PND ขาไม่บวม' },
          { icon: 'chart', label: 'การพยาบาล', value: 'วัด vital signs ครบ, ตรวจแผล catheter site, ทำ Med Reconciliation พบว่าผู้ป่วยสับสน Clopidogrel กับ Omeprazole (ทานสลับกัน) จึงทำ pill box จัดยาตามมื้อ, ติดป้ายสีรายการยาแต่ละมื้อ, สอนภรรยาช่วยดูแลเรื่องยา' },
          { icon: 'sparkle', label: 'การให้คำแนะนำ', value: 'ย้ำห้ามหยุดยา Clopidogrel + Aspirin เด็ดขาด (เสี่ยง stent thrombosis), อธิบาย red flag symptoms: เจ็บหน้าอก เหนื่อยมาก ขาบวม วูบ เลือดออกผิดปกติ → โทร 1669 ทันที, พักผ่อนเพียงพอ ค่อยๆ เริ่มเดินในบ้าน 5 นาที 2 ครั้ง/วัน, ลดเค็ม ลดมัน งดบุหรี่เด็ดขาด' },
          { icon: 'heart', label: 'การประเมิน', value: 'ผู้ป่วยยังอ่อนเพลียมากจาก Hb ต่ำ + Post-PCI ต้องติดตามใกล้ชิด น้ำตาลสูง 168 → ต้องปรับพฤติกรรมอาหาร แผล catheter site ปกติ เรื่องยาแก้ไขแล้วด้วย pill box ภรรยาเข้าใจดี นัดเยี่ยมครั้งต่อไป 05/03/69' },
        ],
      },
    },
    { day: 10, monthShort: 'ก.พ', time: '10:00 น.', visitor: 'พว.กานต์ธิดา ทดสอบ58', type: 'เยี่ยมก่อน Admit', tags: ['Pre-Admission Assessment'],
      detail: {
        hn: 'HN-650001', datetime: '10 กุมภาพันธ์ 2569 - 10:00 น.',
        mission: 'ประเมินอาการเจ็บหน้าอกที่มีมากขึ้น เตรียมส่งต่อโรงพยาบาลเพื่อตรวจวินิจฉัยเพิ่มเติม',
        medical: 'ผู้ป่วยโทรแจ้งว่ามีอาการเจ็บแน่นหน้าอกรุนแรงขึ้น โดยเฉพาะเมื่อเดินขึ้นบันไดหรือยกของหนัก ต้องหยุดพักจึงจะหายเจ็บ อาการเป็นมากขึ้นใน 2 สัปดาห์ที่ผ่านมา\nPMH: DM type 2 (10 ปี), HT (8 ปี), Dyslipidemia, สูบบุหรี่ 20 มวน/วัน x 30 ปี\nยาเดิม: Metformin 500 mg bid, Amlodipine 5 mg od, Simvastatin 20 mg od',
        reason: 'ผู้ป่วยโทรแจ้งอาการเจ็บหน้าอกมากขึ้น ต้องประเมินเร่งด่วน',
        objective: 'ประเมินลักษณะอาการเจ็บหน้าอก แยก Stable Angina vs ACS, วัด vital signs, ประเมินความเสี่ยง CVD, ประสาน ER หากจำเป็น',
        healthIssue: 'อาการเจ็บแน่นหน้าอก (Typical Angina) ที่แย่ลง exertional chest pain ร้าวไปแขนซ้าย ประวัติมีปัจจัยเสี่ยง CVD สูง: DM, HT, Dyslipidemia, สูบบุหรี่ มีประวัติครอบครัวพ่อเสียด้วยโรคหัวใจตอนอายุ 55 ปี',
        social: { members: '3 คน', income: '18,000 บาท/เดือน', welfare: 'บัตรทอง', mental: 'กังวลมาก กลัวเป็นโรคหัวใจเหมือนพ่อ', env: 'บ้านชั้นเดียว สะอาด อากาศถ่ายเทดี' },
        screening: [
          { label: 'ความดันโลหิต', value: '155/95 mmHg' }, { label: 'ออกซิเจนในเลือด', value: '95%' },
          { label: 'อุณหภูมิ', value: '36.5 °C' }, { label: 'น้ำตาลในเลือด', value: '185 mg/dL' },
          { label: 'อัตราเต้นของหัวใจ', value: '92 bpm' }, { label: 'น้ำหนัก', value: '72 kg' },
          { label: 'ส่วนสูง', value: '170 cm' }, { label: 'รอบเอว', value: '95 cm' },
        ],
        notes: [
          { icon: 'ecg', label: 'บันทึกการเยี่ยม', value: 'ผู้ป่วยนั่งพักอยู่ในบ้าน บอกว่าเมื่อเช้าเดินไปตลาด (~300 ม.) มีอาการแน่นหน้าอกกลางอก ร้าวไปแขนซ้าย ต้องหยุดพัก 5 นาทีจึงดีขึ้น อาการเป็นมาเรื่อยๆ 2 สัปดาห์ แต่ละครั้งเป็นนานขึ้น' },
          { icon: 'bolt', label: 'อาการและอาการแสดง', value: 'Typical anginal chest pain: squeezing sensation, substernal, ร้าวไปแขนซ้าย, provoked by exertion, relieved by rest. ไม่มี rest pain. BP สูง 155/95 HR 92 สม่ำเสมอ. เหงื่อออก เวียนศีรษะเล็กน้อย' },
          { icon: 'chart', label: 'การพยาบาล', value: 'วัด vital signs ครบ, ECG 12 leads (portable): NSR rate 92, no ST changes at rest, ประสานเวร Triage ER รพ.ศูนย์ แนะนำให้ไป ER เพื่อ stress test/coronary angiography' },
          { icon: 'sparkle', label: 'การให้คำแนะนำ', value: 'แนะนำพบแพทย์โรคหัวใจโดยเร็ว ไม่ออกกำลังกายหนักจนกว่าจะพบแพทย์ หากเจ็บหน้าอกขณะพักหรือนานกว่า 20 นาที → โทร 1669 ทันที งดสูบบุหรี่เด็ดขาด ควบคุมอาหาร' },
          { icon: 'heart', label: 'การประเมิน', value: 'สงสัย Unstable Angina/Progressive Angina ประสานส่งต่อ ER รพ.ศูนย์แล้ว ผู้ป่วยและภรรยาเข้าใจ ลูกสาวจะพาไป ER วันนี้เวลา 13:00 น. โทรติดตามหลัง ER visit' },
        ],
      },
    },
  ]},
  { month: 'มกราคม 69', visits: [
    { day: 15, monthShort: 'ม.ค', time: '09:30 น.', visitor: 'พว.กานต์ธิดา ทดสอบ58', type: 'เยี่ยมตามนัด', tags: ['Chronic Disease', 'NCD Screening'],
      detail: {
        hn: 'HN-650001', datetime: '15 มกราคม 2569 - 09:30 น.',
        mission: 'เยี่ยมติดตามโรคเรื้อรัง (DM, HT, Dyslipidemia) ตามโปรแกรม NCD Clinic ประเมินการควบคุมโรค ติดตามการรับประทานยา และคัดกรองภาวะแทรกซ้อน',
        medical: 'ผลเลือดล่าสุด (10/01/69): FBS 165 mg/dL, HbA1c 8.2%, LDL 148 mg/dL, TG 280 mg/dL, Cr 1.05 mg/dL, eGFR 74\nyาเดิม: Metformin 500 mg bid, Amlodipine 5 mg od, Simvastatin 20 mg od\nสูบบุหรี่ 20 มวน/วัน x 30 ปี ไม่ยอมเลิก',
        reason: 'ติดตาม NCD รายไตรมาส (Q1/2569)',
        objective: 'ประเมินการควบคุม DM/HT/Dyslipidemia, คัดกรองภาวะแทรกซ้อน (ตา ไต เท้า), ประเมินความเสี่ยง CVD, ให้คำปรึกษาเลิกบุหรี่',
        healthIssue: 'DM ควบคุมไม่ดี HbA1c 8.2% (เป้า <7%), LDL 148 สูงมาก (เป้า <100), TG สูง, BP ยังไม่ถึงเป้า, สูบบุหรี่ไม่ยอมเลิก → ปัจจัยเสี่ยง CVD สูงมาก',
        social: { members: '3 คน', income: '18,000 บาท/เดือน', welfare: 'บัตรทอง', mental: 'ปกติ แต่ไม่ค่อยสนใจเรื่องสุขภาพ', env: 'บ้านชั้นเดียว สะอาด' },
        screening: [
          { label: 'ความดันโลหิต', value: '148/92 mmHg' }, { label: 'ออกซิเจนในเลือด', value: '97%' },
          { label: 'อุณหภูมิ', value: '36.4 °C' }, { label: 'น้ำตาลในเลือด', value: '175 mg/dL' },
          { label: 'อัตราเต้นของหัวใจ', value: '82 bpm' }, { label: 'น้ำหนัก', value: '72 kg' },
          { label: 'ส่วนสูง', value: '170 cm' }, { label: 'รอบเอว', value: '95 cm' },
        ],
        notes: [
          { icon: 'ecg', label: 'บันทึกการเยี่ยม', value: 'ผู้ป่วยอยู่บ้าน สุขภาพทั่วไปปกติ ยอมรับว่าทานยาไม่สม่ำเสมอ (ลืมมื้อเย็นบ่อย) ยังสูบบุหรี่วันละ 15-20 มวน ไม่ค่อยออกกำลังกาย ทานอาหารไม่ค่อยควบคุม ชอบทานส้มตำปูปลาร้า ข้าวเหนียวหมูปิ้ง' },
          { icon: 'bolt', label: 'อาการและอาการแสดง', value: 'ไม่มีอาการเจ็บหน้าอก ไม่เหนื่อยผิดปกติ ตาไม่มัว เท้าชาเล็กน้อยบริเวณปลายนิ้ว ไม่มีแผลที่เท้า ตรวจ monofilament test: รับความรู้สึกลดลงที่ metatarsal heads ทั้ง 2 ข้าง' },
          { icon: 'chart', label: 'การพยาบาล', value: 'วัด vital signs ครบ, ตรวจเท้าทั้ง 2 ข้าง: ผิวแห้ง ไม่มีแผล เล็บปกติ pulse dorsalis pedis คลำได้ทั้ง 2 ข้าง, monofilament test ผิดปกติ 3/10 จุด → early peripheral neuropathy, ตรวจ fundus กลับมาปกติ ส่งผลเลือดรอ HbA1c' },
          { icon: 'sparkle', label: 'การให้คำแนะนำ', value: 'ย้ำทานยาสม่ำเสมอ ตั้งเตือนในมือถือ, ลดอาหารแป้ง/หวาน/มัน ทานผักเพิ่ม, ตรวจเท้าทุกวันก่อนนอน ทาครีมให้ความชุ่มชื้น ห้ามเดินเท้าเปล่า, สอน 5A เลิกบุหรี่ (Ask, Advise, Assess, Assist, Arrange), แนะนำเดินวันละ 30 นาที' },
          { icon: 'heart', label: 'การประเมิน', value: 'ควบคุมโรคเรื้อรังไม่ดี ปัจจัยเสี่ยง CVD สูงมาก (DM + HT + Dyslipidemia + สูบบุหรี่ + อ้วนลงพุง + FHx) เริ่มมี peripheral neuropathy ต้องประสานแพทย์ปรับยา DM และพิจารณาเปลี่ยน Simvastatin → Atorvastatin ขนาดสูง นัดพบแพทย์ 20/01/69' },
        ],
      },
    },
  ]},
];

const NOTE_ICONS = {
  ecg: ppEcgText, bolt: ppBoltHeart, chart: ppChartClipboard,
  sparkle: ppSparkleClipboard, heart: ppHeartClipboard,
};

/* ── Assessment History Data ── */
const assessmentData = [
  { month: 'เมษายน 69', items: [
    { day: 18, monthShort: 'เม.ย', title: 'แบบประเมิน Barthel Index Score', assessor: 'พว.สุภาพร ทดสอบ57', status: 'รอประเมิน', img: imgAssessBarthel,
      score: null, result: null, gradient: null, datetime: '18 เมษายน 2569 (นัดหมาย)' },
    { day: 18, monthShort: 'เม.ย', title: 'แบบประเมินเกณฑ์การให้คะแนนภาวะหายใจลำบาก', assessor: 'พว.สุภาพร ทดสอบ57', status: 'รอประเมิน', img: imgAssessDyspnea,
      score: null, result: null, gradient: null, datetime: '18 เมษายน 2569 (นัดหมาย)' },
  ]},
  { month: 'มีนาคม 69', items: [
    { day: 25, monthShort: 'มี.ค', title: 'แบบประเมิน Barthel Index Score', assessor: 'พว.สุภาพร ทดสอบ57', status: 'ประเมินแล้ว', img: imgAssessBarthel,
      score: 20, result: 'ไม่พิการ ทำกิจวัตรประจำวันได้เอง', gradient: 'linear-gradient(160deg, #34D65D, #21AB44)', datetime: '25 มีนาคม 2569 เวลา 10:30 น.' },
    { day: 25, monthShort: 'มี.ค', title: 'แบบประเมินเกณฑ์การให้คะแนนภาวะหายใจลำบาก', assessor: 'พว.สุภาพร ทดสอบ57', status: 'ประเมินแล้ว', img: imgAssessDyspnea,
      score: 1, result: 'เหนื่อยเฉพาะออกกำลังกายหนัก (mMRC Grade 1)', gradient: 'linear-gradient(160deg, #34D65D, #21AB44)', datetime: '25 มีนาคม 2569 เวลา 10:30 น.' },
    { day: 5, monthShort: 'มี.ค', title: 'แบบประเมินกิจวัตรประจำวัน ADL', assessor: 'พว.สุภาพร ทดสอบ57', status: 'ประเมินแล้ว', img: imgAssessAdl,
      score: 18, result: 'พึ่งพาเล็กน้อย ต้องช่วยเรื่องขึ้นบันได', gradient: 'linear-gradient(160deg, #34D65D, #21AB44)', datetime: '5 มีนาคม 2569 เวลา 09:00 น.' },
  ]},
  { month: 'กุมภาพันธ์ 69', items: [
    { day: 26, monthShort: 'ก.พ', title: 'แบบประเมินกิจวัตรประจำวัน ADL', assessor: 'พว.สุภาพร ทดสอบ57', status: 'ประเมินแล้ว', img: imgAssessAdl,
      score: 14, result: 'พึ่งพาปานกลาง ต้องช่วยเรื่องอาบน้ำ/เดินไกล', gradient: 'linear-gradient(160deg, #E8802A, #D06A1A)', datetime: '26 กุมภาพันธ์ 2569 เวลา 14:00 น.' },
    { day: 26, monthShort: 'ก.พ', title: 'แบบประเมินการควบคุมโรคหืด', assessor: 'พว.สุภาพร ทดสอบ57', status: 'รอประเมิน', img: imgAssessAsthma,
      score: null, result: null, gradient: null, datetime: '26 กุมภาพันธ์ 2569 (ยกเลิก — ผู้ป่วยยังอ่อนเพลียหลัง D/C)' },
    { day: 10, monthShort: 'ก.พ', title: 'แบบคัดกรองภาวะเสี่ยงสำหรับผู้ที่มีอายุ 35 ปีขึ้นไป', assessor: 'พว.กานต์ธิดา ทดสอบ58', status: 'ประเมินแล้ว', img: imgAssessRisk35,
      score: 8, result: 'เสี่ยงสูง (DM+HT+สูบบุหรี่+FHx)', gradient: 'linear-gradient(160deg, #FF383C, #CC2D30)', datetime: '10 กุมภาพันธ์ 2569 เวลา 10:00 น.' },
    { day: 10, monthShort: 'ก.พ', title: 'แบบประเมินเกณฑ์การให้คะแนนภาวะหายใจลำบาก', assessor: 'พว.กานต์ธิดา ทดสอบ58', status: 'ประเมินแล้ว', img: imgAssessDyspnea,
      score: 2, result: 'เหนื่อยเมื่อเดินเร็วหรือขึ้นทางชัน (mMRC Grade 2)', gradient: 'linear-gradient(160deg, #E8802A, #D06A1A)', datetime: '10 กุมภาพันธ์ 2569 เวลา 10:00 น.' },
  ]},
  { month: 'มกราคม 69', items: [
    { day: 15, monthShort: 'ม.ค', title: 'แบบประเมิน Barthel Index Score', assessor: 'พว.กานต์ธิดา ทดสอบ58', status: 'ประเมินแล้ว', img: imgAssessBarthel,
      score: 20, result: 'ไม่พิการ', gradient: 'linear-gradient(160deg, #34D65D, #21AB44)', datetime: '15 มกราคม 2569 เวลา 09:30 น.' },
    { day: 15, monthShort: 'ม.ค', title: 'แบบประเมินการควบคุมโรคหืด', assessor: 'พว.กานต์ธิดา ทดสอบ58', status: 'ประเมินแล้ว', img: imgAssessAsthma,
      score: 23, result: 'ควบคุมได้ดี ไม่มีอาการหอบ', gradient: 'linear-gradient(160deg, #34D65D, #21AB44)', datetime: '15 มกราคม 2569 เวลา 09:30 น.' },
  ]},
];

/* ── Prescription Data ── */
const MED_TIMES = [
  { label: 'เช้า', time: '06:00 น.', img: imgMedMorning },
  { label: 'กลางวัน', time: '12:00 น.', img: imgMedNoon },
  { label: 'เย็น', time: '18:00 น.', img: imgMedEvening },
  { label: 'ก่อนนอน', time: '22:00 น.', img: imgMedNight },
];
const MED_STATUS_ICON = { check: iconMedCheck, x: iconMedX, wait: iconMedHourglass };

const prescriptionData = [
  { month: 'มีนาคม 69', items: [
    { day: 25, monthShort: 'มี.ค', vn: 'VN:690325-001', serviceDate: '25 มี.ค. 2569', sendDate: '25 มี.ค. 2569', sender: 'พว.สุภาพร ทดสอบ57',
      meds: 'Clopidogrel 75 mg bid, Atorvastatin 40 mg od, Aspirin 81 mg od, Omeprazole 20 mg bid, Spironolactone 25 mg od, Ferrous Fumarate 200 mg tid',
      medList: [
        { name: 'Clopidogrel 75 mg', qty: 60, dose: 'รับประทานครั้งละ 1 เม็ด วันละ 2 ครั้ง', schedule: [{ s: 'check' }, { s: 'x' }, null, null] },
        { name: 'Atorvastatin 40 mg', qty: 30, dose: 'รับประทานครั้งละ 1 เม็ด ก่อนนอน', schedule: [null, null, null, { s: 'check' }] },
        { name: 'Aspirin 81 mg', qty: 30, dose: 'รับประทานครั้งละ 1 เม็ด หลังอาหารเช้า', schedule: [{ s: 'check' }, null, null, null] },
        { name: 'Omeprazole 20 mg', qty: 60, dose: 'รับประทานครั้งละ 1 เม็ด วันละ 2 ครั้ง ก่อนอาหาร', schedule: [{ s: 'check' }, null, { s: 'check' }, null] },
        { name: 'Spironolactone 25 mg', qty: 30, dose: 'รับประทานครั้งละ 1 เม็ด หลังอาหารเช้า', schedule: [{ s: 'check' }, null, null, null] },
        { name: 'Ferrous Fumarate 200 mg', qty: 90, dose: 'รับประทานครั้งละ 1 เม็ด วันละ 3 ครั้ง หลังอาหาร', schedule: [{ s: 'check' }, { s: 'check' }, { s: 'wait' }, null] },
      ] },
    { day: 5, monthShort: 'มี.ค', vn: 'VN:690305-001', serviceDate: '5 มี.ค. 2569', sendDate: '5 มี.ค. 2569', sender: 'พว.สุภาพร ทดสอบ57',
      meds: 'Clopidogrel 75 mg bid, Atorvastatin 40 mg od, Aspirin 81 mg od, Omeprazole 20 mg bid, Spironolactone 25 mg od, Ferrous Fumarate 200 mg tid, Isosorbide SL 5 mg prn',
      medList: [
        { name: 'Clopidogrel 75 mg', qty: 60, dose: 'รับประทานครั้งละ 1 เม็ด วันละ 2 ครั้ง', schedule: [{ s: 'check' }, { s: 'check' }, null, null] },
        { name: 'Atorvastatin 40 mg', qty: 30, dose: 'รับประทานครั้งละ 1 เม็ด ก่อนนอน', schedule: [null, null, null, { s: 'check' }] },
        { name: 'Aspirin 81 mg', qty: 30, dose: 'รับประทานครั้งละ 1 เม็ด หลังอาหารเช้า', schedule: [{ s: 'check' }, null, null, null] },
        { name: 'Omeprazole 20 mg', qty: 60, dose: 'รับประทานครั้งละ 1 เม็ด วันละ 2 ครั้ง ก่อนอาหาร', schedule: [{ s: 'check' }, null, { s: 'x' }, null] },
        { name: 'Isosorbide SL 5 mg', qty: 10, dose: 'อมใต้ลิ้น เมื่อมีอาการเจ็บหน้าอก', schedule: [null, null, null, null] },
      ] },
  ]},
  { month: 'กุมภาพันธ์ 69', items: [
    { day: 26, monthShort: 'ก.พ', vn: 'VN:690226-001', serviceDate: '25 ก.พ. 2569 (D/C)', sendDate: '26 ก.พ. 2569', sender: 'ภก.ธนพล ทดสอบ56',
      meds: 'Clopidogrel 75 mg bid, Aspirin 81 mg od, Atorvastatin 40 mg od, Omeprazole 20 mg bid, Spironolactone 25 mg od, Ferrous Fumarate 200 mg tid, Isosorbide SL 5 mg prn',
      medList: [
        { name: 'Clopidogrel 75 mg', qty: 60, dose: 'รับประทานครั้งละ 1 เม็ด วันละ 2 ครั้ง', schedule: [{ s: 'check' }, { s: 'check' }, null, null] },
        { name: 'Aspirin 81 mg', qty: 30, dose: 'รับประทานครั้งละ 1 เม็ด หลังอาหารเช้า', schedule: [{ s: 'check' }, null, null, null] },
        { name: 'Atorvastatin 40 mg', qty: 30, dose: 'รับประทานครั้งละ 1 เม็ด ก่อนนอน', schedule: [null, null, null, { s: 'wait' }] },
      ] },
  ]},
  { month: 'มกราคม 69', items: [
    { day: 15, monthShort: 'ม.ค', vn: 'VN:690115-001', serviceDate: '15 ม.ค. 2569', sendDate: '15 ม.ค. 2569', sender: 'ภก.ธนพล ทดสอบ56',
      meds: 'Metformin 500 mg bid, Amlodipine 5 mg od, Simvastatin 20 mg od',
      medList: [
        { name: 'Metformin 500 mg', qty: 60, dose: 'รับประทานครั้งละ 1 เม็ด วันละ 2 ครั้ง หลังอาหาร', schedule: [{ s: 'check' }, null, { s: 'check' }, null] },
        { name: 'Amlodipine 5 mg', qty: 30, dose: 'รับประทานครั้งละ 1 เม็ด เช้า', schedule: [{ s: 'check' }, null, null, null] },
        { name: 'Simvastatin 20 mg', qty: 30, dose: 'รับประทานครั้งละ 1 เม็ด ก่อนนอน', schedule: [null, null, null, { s: 'check' }] },
      ] },
    { day: 2, monthShort: 'ม.ค', vn: 'VN:690102-001', serviceDate: '2 ม.ค. 2569', sendDate: '3 ม.ค. 2569', sender: 'ภก.ธนพล ทดสอบ56',
      meds: 'Metformin 500 mg bid, Amlodipine 5 mg od, Simvastatin 20 mg od, Paracetamol 500 mg prn',
      medList: [
        { name: 'Metformin 500 mg', qty: 60, dose: 'รับประทานครั้งละ 1 เม็ด วันละ 2 ครั้ง หลังอาหาร', schedule: [{ s: 'check' }, null, { s: 'x' }, null] },
        { name: 'Amlodipine 5 mg', qty: 30, dose: 'รับประทานครั้งละ 1 เม็ด เช้า', schedule: [{ s: 'check' }, null, null, null] },
        { name: 'Simvastatin 20 mg', qty: 30, dose: 'รับประทานครั้งละ 1 เม็ด ก่อนนอน', schedule: [null, null, null, { s: 'check' }] },
        { name: 'Paracetamol 500 mg', qty: 20, dose: 'รับประทานเมื่อมีอาการปวด ครั้งละ 1-2 เม็ด', schedule: [null, null, null, null] },
      ] },
  ]},
];

/* ── Tabs ── */
const tabLabels = ['Vital Signs', 'ประวัติการเยี่ยมบ้าน', 'ประวัติการประเมิน', 'ติดตามการทานยา'];

/* ═══════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════ */
export default function PatientProfile({ patient, onClose }) {
  const { startCall } = useContext(CallContext);
  const [activeTab, setActiveTab] = useState(0);
  const [historyPage, setHistoryPage] = useState(1);
  const [expandedVisit, setExpandedVisit] = useState('0-0'); // default first visit open
  /* ตัวกรองเดือนของตารางประวัติการวัด — ประวัติสร้างจาก generator เดียวกับกราฟ */
  const [histMonth, setHistMonth] = useState({ y: DETAIL_TODAY.getFullYear(), m: DETAIL_TODAY.getMonth() });
  const [histPickerOpen, setHistPickerOpen] = useState(false);
  const [histCalYear, setHistCalYear] = useState(DETAIL_TODAY.getFullYear());
  const histEntries = buildMonthEntries(histMonth.y, histMonth.m);
  const [bmiHover, setBmiHover] = useState(false);
  const [metricDetail, setMetricDetail] = useState(null);   // ป๊อปอัพดูเพิ่มเติมของ vital (สัปดาห์/เดือน/ปี)
  const [selVital, setSelVital] = useState(0);              // vital ที่เลือกดูกราฟใหญ่ (แท็บตามแบบ 573:6974)
  const [selPeriod, setSelPeriod] = useState('สัปดาห์');    // ช่วงเวลาของกราฟใหญ่ (วัน/สัปดาห์/เดือน/ปี)
  const [selPt, setSelPt] = useState(null);                 // จุดที่กดบนกราฟใหญ่ — null = จุดล่าสุด
  const [haloMouse, setHaloMouse] = useState(null);         // ตำแหน่งเมาส์บนพื้นหลังจุด (interactive)
  /* ตัวเลือกช่วงเอง: วัน/สัปดาห์เลือกวัน · เดือนเลือกเดือน · ปีเลือกปี (3 ปีย้อนหลัง) */
  const [selDate, setSelDate] = useState(DETAIL_TODAY);
  const [selMonth, setSelMonth] = useState({ y: DETAIL_TODAY.getFullYear(), m: DETAIL_TODAY.getMonth() });
  const [selYear, setSelYear] = useState(DETAIL_TODAY.getFullYear());
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [calView, setCalView] = useState({ y: DETAIL_TODAY.getFullYear(), m: DETAIL_TODAY.getMonth() }); // เดือนที่ปฏิทินแสดงอยู่
  const [calYear, setCalYear] = useState(DETAIL_TODAY.getFullYear());                                    // ปีที่กริดเดือนแสดงอยู่
  const [selVisit, setSelVisit] = useState(homeVisitData[0].visits[0]);   // รายการเยี่ยมที่เลือกในหน้า 2 คอลัมน์
  const [selAssess, setSelAssess] = useState(assessmentData[0].items[0]); // รายการประเมินที่เลือกในหน้า 2 คอลัมน์
  const [rxDetail, setRxDetail] = useState(null);
  const [rxCalendarMode, setRxCalendarMode] = useState(false);
  const [rxSelectedDay, setRxSelectedDay] = useState(6);

  if (!patient) return null;

  const avatar = getAvatar(patient.age, patient.gender);

  /* ── Info grid for patient card ── */
  const infoGrid = [
    { label: 'วันเกิด', value: '14 ก.พ. 2544' },
    { label: 'เพศ', value: 'ชาย' },
    { label: 'หมู่เลือด', value: 'AB' },
    { label: 'เบอร์โทรศัพท์', value: '090 000 0000' },
  ];

  /* ── Pagination ── */
  const totalItems = histEntries.length;
  const perPage = 10;
  const totalPages = Math.ceil(totalItems / perPage);
  const startItem = (historyPage - 1) * perPage + 1;
  const endItem = Math.min(historyPage * perPage, totalItems);

  return (
    <div style={{ fontFamily: font, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* ── Fixed header: Back + Tabs ── */}
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 12 }}>
        <button
          className="hover-btn"
          onClick={onClose}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 14, color: '#0088FF', fontWeight: 600, fontFamily: font,
            padding: '4px 0', display: 'flex', alignItems: 'center', gap: 4,
          }}
        >
          {'<'} กลับ
        </button>
      </div>

      {/* ── 2-column layout (scrollable) ── */}
      <div style={{ display: 'flex', gap: 20, flex: 1, overflow: 'hidden' }}>

        {/* ════ LEFT SIDEBAR - fixed ════ */}
        <div style={{ width: 250, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto' }}>

          {/* Patient card - blue gradient */}
          <div className="hover-card anim-slide-up delay-1" style={{
            background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
            borderRadius: 24, textAlign: 'center', padding: 16,
            color: 'white',
          }}>
            <img src={avatar} alt="avatar" style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(255,255,255,0.3)', marginBottom: 8 }} />
            <div style={{ fontSize: 16, fontWeight: 700, color: 'white', marginBottom: 6 }}>{patient.name}</div>
            <div style={{
              display: 'inline-block',
              background: 'rgba(255,255,255,0.2)', borderRadius: 100,
              padding: '4px 10px', fontSize: 10, color: 'white', marginBottom: 12,
            }}>
              {patient.age} ปี
            </div>

            {/* Phone + Video call buttons */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 12 }}>
              <button className="hover-btn" title="โทรติดต่อผู้ป่วย" onClick={() => startCall(patient)} style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'rgba(255,255,255,0.15)', border: 'none',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button className="hover-btn" title="วิดีโอคอล" onClick={() => startCall(patient)} style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'rgba(255,255,255,0.15)', border: 'none',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M23 7l-7 5 7 5V7z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2" stroke="white" strokeWidth="2"/>
                </svg>
              </button>
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: 'rgba(255,255,255,0.15)', margin: '0 0 12px 0' }} />

            {/* Info grid 2x2 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, textAlign: 'left' }}>
              {infoGrid.map((r, i) => (
                <div key={i}>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', marginBottom: 2 }}>{r.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'white' }}>{r.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* แพ้ยา card - Figma style */}
          <div className="hover-card anim-slide-up delay-2" style={{ background: 'white', border: '1px solid white', borderRadius: 16, overflow: 'hidden', position: 'relative' }}>
            <div style={{ padding: 16 }}>
              <p style={{ fontSize: 12, fontWeight: 500, color: 'black', margin: 0, fontFamily: font }}>แพ้ยา</p>
            </div>
            <img src={imgCardAllergy} alt="" style={{ position: 'absolute', top: -1, right: -1, width: 58, height: 58, objectFit: 'cover', pointerEvents: 'none' }} />
            <div style={{ background: 'rgba(255,56,60,0.05)', padding: 16 }}>
              <p style={{ fontSize: 14, color: '#8E8E93', margin: 0, fontFamily: font, lineHeight: '14px' }}>ไม่พบข้อมูลแพ้ยา</p>
            </div>
          </div>

          {/* โรคประจำตัว card */}
          <div className="hover-card anim-slide-up delay-3" style={{ background: 'white', border: '1px solid white', borderRadius: 16, overflow: 'hidden', position: 'relative' }}>
            <div style={{ padding: 16 }}>
              <p style={{ fontSize: 12, fontWeight: 500, color: 'black', margin: 0, fontFamily: font }}>โรคประจำตัว</p>
            </div>
            <img src={imgCardDisease} alt="" style={{ position: 'absolute', top: -1, right: -1, width: 58, height: 58, objectFit: 'cover', pointerEvents: 'none' }} />
            <div style={{ background: 'rgba(255,56,60,0.05)', padding: 16 }}>
              <p style={{ fontSize: 14, color: '#8E8E93', margin: 0, fontFamily: font, lineHeight: '14px' }}>{patient.disease || 'ไม่พบข้อมูลโรคประจำตัว'}</p>
            </div>
          </div>

          {/* ที่อยู่ card */}
          <div className="hover-card anim-slide-up delay-4" style={{ background: 'white', border: '1px solid white', borderRadius: 16, overflow: 'hidden', position: 'relative' }}>
            <div style={{ padding: 16 }}>
              <p style={{ fontSize: 12, fontWeight: 500, color: 'black', margin: 0, fontFamily: font }}>ที่อยู่</p>
            </div>
            <img src={imgCardAddress} alt="" style={{ position: 'absolute', top: -1, right: -1, width: 58, height: 58, objectFit: 'cover', pointerEvents: 'none' }} />
            <div style={{ padding: 16 }}>
              <p style={{ fontSize: 14, color: 'black', margin: 0, fontFamily: font, lineHeight: '16px' }}>{patient.address || 'เลขที่ 2 ชั้นที่ 2 ซอย สุขสวัสดิ์ 33 แขวงราษฎร์บูรณะ เขตราษฎร์บูรณะ กรุงเทพมหานคร 10140'}</p>
            </div>
          </div>
        </div>

        {/* ════ MAIN CONTENT ════ */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* ── Tabs row (fixed) — สไตล์เดียวกับแท็บ vital: ปุ่มกว้างเท่ากัน + ไฮไลต์ gradient เลื่อนตาม ── */}
          <div style={{
            position: 'relative', display: 'inline-flex', padding: 4, borderRadius: 100, alignSelf: 'flex-start',
            background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.7)',
            boxShadow: 'inset 0 1px 3px rgba(30,27,57,0.05)',
          }}>
            <span aria-hidden style={{
              position: 'absolute', top: 4, left: 4 + activeTab * 158, width: 158, height: 32,
              borderRadius: 100, background: 'linear-gradient(160deg, #3FA9FF 0%, #0088FF 55%, #0070E0 100%)',
              boxShadow: '0 4px 12px rgba(0,136,255,0.35), inset 0 1px 0 rgba(255,255,255,0.3)',
              transition: 'left 0.3s cubic-bezier(0.34, 1.25, 0.64, 1)',
            }} />
            {tabLabels.map((t, i) => (
              <button
                key={i}
                onClick={() => setActiveTab(i)}
                style={{
                  position: 'relative', zIndex: 1, width: 158, height: 32,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: 100, border: 'none', cursor: 'pointer', background: 'transparent',
                  fontSize: 12, fontFamily: font, whiteSpace: 'nowrap',
                  color: activeTab === i ? '#fff' : '#615E83',
                  fontWeight: activeTab === i ? 600 : 500,
                  transition: 'color 0.25s ease',
                }}
              >
                {t}
              </button>
            ))}
          </div>

          {/* ── Scrollable content below tabs — ปิด overflow-x กันแถบนอนโผล่ล่าง ── */}
          <div className="no-scrollbar" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', paddingTop: 12 }}>

          {activeTab === 0 && (
            <div className="anim-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* ── จัดวางตาม Figma 573:6974 — ซ้าย: มินิการ์ด 6 ใบ (3×2) กดเลือกดูกราฟใหญ่ · ขวา: BMI ── */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, alignItems: 'stretch' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: '1fr 1fr', gap: 16 }}>
                {statCards.map((s, i) => {
                  const st = VITAL_STATUS[s.status] || VITAL_STATUS.normal;
                  /* สีประจำ vital (จากเส้นกราฟ) — ใช้ทาเส้นตารางหลังภาพ */
                  const tint = chartDataSets[s.chart]?.lines[0]?.color || '#6658E1';
                  return (
                  <div key={i} className={`hover-card pp-vital-mini anim-slide-up delay-${i + 1}`} onClick={() => { setSelVital(i); setSelPt(null); }} style={{
                    background: st.surface, borderRadius: 24,
                    border: selVital === i ? '1px solid rgba(0,136,255,0.45)' : CARD_BORDER,
                    boxShadow: selVital === i ? '0 2px 12px rgba(0,136,255,0.12)' : CARD_SHADOW,
                    position: 'relative', minWidth: 0, cursor: 'pointer',
                    overflow: 'hidden', isolation: 'isolate',
                    display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 7,
                    padding: '14px 16px', transition: 'border 0.15s ease, box-shadow 0.15s ease',
                  }}>
                    {/* เส้นตารางสีประจำ vital จางมากๆ หลังภาพอุปกรณ์ (zIndex -2 = ชั้นหลังสุด) — เฟดออกจากมุมขวาล่าง */}
                    <span aria-hidden style={{
                      position: 'absolute', right: -4, bottom: -4, width: 150, height: 105, zIndex: -2,
                      backgroundImage: `linear-gradient(${tint}0A 1px, transparent 1px), linear-gradient(90deg, ${tint}0A 1px, transparent 1px)`,
                      backgroundSize: '14px 14px',
                      WebkitMaskImage: 'radial-gradient(ellipse at 88% 88%, black 8%, transparent 64%)',
                      maskImage: 'radial-gradient(ellipse at 88% 88%, black 8%, transparent 64%)',
                    }} />
                    {/* ภาพอุปกรณ์วัดมุมขวาล่าง — จางๆ เฟดเข้าหากลางการ์ด อยู่ใต้ตัวหนังสือ (zIndex -1) */}
                    {MINI_ART[i] && (() => {
                      const mc = MINI_ART_CFG[i];
                      return (
                        <img aria-hidden src={MINI_ART[i].img} alt="" className="pp-mini-art" style={{
                          position: 'absolute', right: mc.r, bottom: mc.b,
                          width: mc.w, zIndex: -1, pointerEvents: 'none',
                          /* ใบที่เลือกอยู่ภาพชัดกว่าใบอื่น · hover ชัดสุด+เด้ง (transition คุมใน index.css) */
                          opacity: selVital === i ? Math.min(mc.op + 0.4, 0.92) : mc.op,
                          WebkitMaskImage: `linear-gradient(135deg, transparent 8%, black ${mc.fd}%)`,
                          maskImage: `linear-gradient(135deg, transparent 8%, black ${mc.fd}%)`,
                        }} />
                      );
                    })()}
                    {/* มินิการ์ดตามแบบ: ชื่อ / ค่า+หน่วย / ป้ายสถานะ / วันที่บันทึก */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
                      {VITAL_ROW_ICONS[s.label] && (
                        <img src={VITAL_ROW_ICONS[s.label]} alt="" style={{
                          width: 14, height: 14, flexShrink: 0,
                          filter: 'grayscale(1) brightness(0.72)',
                        }} />
                      )}
                      <p style={{ fontSize: 12, fontWeight: 600, color: '#1E1B39', margin: 0, lineHeight: '16px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.label}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 20, fontWeight: 700, lineHeight: '22px', color: st.value }}>{s.value}</span>
                      <span style={{ fontSize: 12, color: st.unit, lineHeight: 'normal' }}>{s.unit}</span>
                    </div>
                    <span style={{
                      alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 4,
                      fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 100,
                      background: st.badgeBg, color: st.badgeFg, lineHeight: '14px',
                    }}>
                      {/* สัญลักษณ์กำกับ ไม่สื่อสถานะด้วยสีอย่างเดียว — ปกติ = info, ผิดปกติ = ! */}
                      {st.mark === 'info'
                        ? <img src={ppInfoCircle} alt="" style={{ width: 8, height: 8 }} />
                        : st.mark && <span style={{
                            width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                            background: '#fff', color: st.markFg,
                            fontSize: 8, fontWeight: 800, lineHeight: '10px', textAlign: 'center',
                          }}>{st.mark}</span>}
                      {s.badge}
                    </span>
                    <p style={{ fontSize: 10, color: 'rgba(0,0,0,0.5)', margin: 0, lineHeight: '14px' }}>อัพเดท : {s.updated}</p>

                  </div>
                  );
                })}
                </div>

                {/* BMI — คอลัมน์ขวาตามแบบ 573:6974 สูงเท่ากริดมินิการ์ด
                    สีค่ากับป้ายมาจากเกณฑ์ BMI จริง ถ้าค่าเปลี่ยนหมวดสีเปลี่ยนตามเอง */}
                {(() => {
                const bmiVal = 19.5;
                const bmiCat = getBmiCategory(bmiVal);
                return (
                <div
                  className="hover-card anim-slide-up delay-7"
                  style={{
                    background: '#FFFFFF', border: CARD_BORDER, borderRadius: 24,
                    boxShadow: CARD_SHADOW, minWidth: 0,
                    display: 'flex', flexDirection: 'column',
                    position: 'relative', overflow: 'visible', zIndex: bmiHover ? 200 : 1,
                  }}
                >
                  {/* เลเยอร์ clip รูปเครื่องชั่ง — ตัดภาพตามขอบมนการ์ด (การ์ดเองต้อง overflow visible ให้ tooltip) */}
                  <div style={{ position: 'absolute', inset: 0, borderRadius: 24, overflow: 'hidden', pointerEvents: 'none' }}>
                    <img src={imgBmiScale} alt="" style={{
                      position: 'absolute', left: `calc(50% + ${BMI_SCALE_IMG.offsetX}px)`, bottom: BMI_SCALE_IMG.offsetY, transform: 'translateX(-50%)',
                      width: BMI_SCALE_IMG.width, objectFit: 'contain',
                      opacity: BMI_SCALE_IMG.opacity,
                      WebkitMaskImage: `linear-gradient(180deg, black ${BMI_SCALE_IMG.fadeStart}%, transparent 96%)`,
                      maskImage: `linear-gradient(180deg, black ${BMI_SCALE_IMG.fadeStart}%, transparent 96%)`,
                    }} />
                  </div>
                  {/* หัวการ์ดกึ่งกลางตาม Figma 504:2991 */}
                  <div style={{ padding: '16px 16px 0', textAlign: 'center' }}>
                    <p style={{ fontSize: 16, fontWeight: 700, color: '#1E1B39', margin: 0, lineHeight: '26px' }}>BMI</p>
                    <p style={{ fontSize: 12, color: GRAY, margin: 0, lineHeight: '16px' }}>Body Mass Index</p>
                  </div>
                  {/* เกจกึ่งกลางการ์ดตาม Figma — ถ่วงน้ำหนักขึ้นบนเล็กน้อย */}
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2px 16px 26px', position: 'relative' }}>
                  {/* Gauge — hover only here */}
                  <div
                    onMouseEnter={() => setBmiHover(true)}
                    onMouseLeave={() => setBmiHover(false)}
                    style={{ position: 'relative', cursor: 'pointer' }}
                  >
                    <BMIGauge bmi={bmiVal} />

                    {/* BMI Hover Tooltip */}
                    {bmiHover && (() => {
                    const cat = bmiCat; // ใช้ค่าเดียวกับหัวการ์ด ไม่ประกาศซ้ำให้หลุดกัน
                    const ranges = [
                      { label: 'น้ำหนักต่ำกว่าเกณฑ์', range: '< 18.5', color: '#3B82F6', icon: '🔽' },
                      { label: 'ปกติ (สมส่วน)', range: '18.5 – 22.9', color: '#34C759', icon: '✅' },
                      { label: 'น้ำหนักเกิน', range: '23.0 – 24.9', color: '#FFCC00', icon: '⚠️' },
                      { label: 'อ้วน ระดับ 1', range: '25.0 – 29.9', color: '#FF9500', icon: '🔶' },
                      { label: 'อ้วน ระดับ 2', range: '≥ 30.0', color: '#FF383C', icon: '🔴' },
                    ];
                    return (
                      <div style={{
                        /* การ์ด BMI อยู่คอลัมน์ขวาสุด+ชิดขอบบนโซนสกรอลล์ — เปิดไปทางซ้าย ยึดหัวไว้ระดับการ์ด
                           แล้วปล่อยยาวลงล่าง (ยื่นขึ้นบนจะโดนขอบ overflow ของโซนแท็บตัด) */
                        position: 'absolute', top: -60, right: '100%',
                        marginRight: 10, width: 260, borderRadius: 20, overflow: 'hidden',
                        boxShadow: '0 12px 40px rgba(30,27,57,0.22), 0 2px 8px rgba(30,27,57,0.08)',
                        zIndex: 200, fontFamily: font,
                        animation: 'anim-scale-in 0.2s ease-out',
                        background: 'white',
                      }}>
                        {/* Header gradient */}
                        <div style={{
                          background: `linear-gradient(135deg, ${cat.color}, ${cat.color}CC)`,
                          padding: '14px 16px 12px', color: 'white',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                              <div style={{ fontSize: 10, opacity: 0.85, marginBottom: 2 }}>สถานะปัจจุบัน</div>
                              <div style={{ fontSize: 15, fontWeight: 700 }}>{cat.label}</div>
                            </div>
                            <div style={{
                              width: 40, height: 40, borderRadius: 12,
                              background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 20, fontWeight: 700,
                            }}>
                              {bmiVal}
                            </div>
                          </div>
                          {/* Mini progress bar */}
                          <div style={{ marginTop: 10, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.2)', overflow: 'hidden' }}>
                            <div style={{
                              height: '100%', borderRadius: 3,
                              background: 'rgba(255,255,255,0.7)',
                              width: `${Math.min(Math.max((bmiVal - 10) / 30, 0), 1) * 100}%`,
                              transition: 'width 0.5s ease',
                            }} />
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 8, opacity: 0.7 }}>
                            <span>10</span><span>18.5</span><span>23</span><span>25</span><span>30</span><span>40</span>
                          </div>
                        </div>

                        {/* Body */}
                        <div style={{ padding: '12px 14px 14px' }}>
                          {/* Advice */}
                          <div style={{
                            background: `${cat.color}10`, borderRadius: 12, padding: '10px 12px',
                            marginBottom: 12, fontSize: 11, color: BLACK, lineHeight: 1.6,
                            display: 'flex', alignItems: 'flex-start', gap: 8,
                            border: `1px solid ${cat.color}20`,
                          }}>
                            <span style={{ fontSize: 14, flexShrink: 0, marginTop: -1 }}>💡</span>
                            <span>{cat.advice}</span>
                          </div>

                          {/* Range table */}
                          <div style={{ fontSize: 9, color: GRAY, marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>เกณฑ์ BMI สำหรับชาวเอเชีย</div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            {ranges.map((r, i) => {
                              const isActive = r.label === cat.label || (cat.label === 'ปกติ (สมส่วน)' && r.label === 'ปกติ (สมส่วน)');
                              return (
                                <div key={i} style={{
                                  display: 'flex', alignItems: 'center', gap: 8,
                                  padding: '6px 10px', borderRadius: 10,
                                  background: isActive ? `${r.color}12` : 'transparent',
                                  border: isActive ? `1px solid ${r.color}30` : '1px solid transparent',
                                  transition: 'all 0.15s',
                                }}>
                                  <span style={{ fontSize: 11, width: 18, textAlign: 'center', flexShrink: 0 }}>{r.icon}</span>
                                  <div style={{
                                    width: 24, height: 5, borderRadius: 3, flexShrink: 0,
                                    background: isActive ? r.color : `${r.color}60`,
                                  }} />
                                  <span style={{ flex: 1, fontSize: 10, color: isActive ? BLACK : GRAY, fontWeight: isActive ? 600 : 400 }}>{r.label}</span>
                                  <span style={{
                                    fontSize: 9, color: isActive ? r.color : GRAY, fontWeight: isActive ? 700 : 400,
                                    background: isActive ? `${r.color}15` : 'transparent',
                                    padding: '2px 6px', borderRadius: 6,
                                  }}>{r.range}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* ลูกศรชี้ขวาเข้าหาเกจ — เลื่อนลงมาระดับกึ่งกลางเกจ (ป๊อปอัพยึดหัวบน ไม่ได้กึ่งกลางแล้ว) */}
                        <div style={{
                          position: 'absolute', top: 116, right: -6, transform: 'translateY(-50%) rotate(45deg)',
                          width: 12, height: 12, background: 'white',
                          boxShadow: '2px -2px 4px rgba(0,0,0,0.06)',
                        }} />
                      </div>
                    );
                  })()}
                  </div>
                  </div>
                  {/* แถวล่างตาม Figma: น้ำหนัก | เครื่องชั่ง (กลาง เฟดขอบล่าง) | ส่วนสูง — ขยับสองฝั่งเข้าหากลาง */}
                  <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', padding: '4px 58px 14px', marginTop: 'auto' }}>
                    {/* ยกเฉพาะข้อความขึ้น — รูปเครื่องชั่งคงชิดขอบล่างตามแบบ */}
                    <div style={{ textAlign: 'center', position: 'relative', zIndex: 1, bottom: 20 }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, justifyContent: 'center' }}>
                        <span style={{ fontSize: 16, fontWeight: 700, color: '#000' }}>60</span>
                        <span style={{ fontSize: 12, color: '#000' }}>kg</span>
                      </div>
                      <div style={{ fontSize: 10, color: '#000', marginTop: 2 }}>น้ำหนัก</div>
                    </div>
                    <div style={{ textAlign: 'center', position: 'relative', zIndex: 1, bottom: 20 }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, justifyContent: 'center' }}>
                        <span style={{ fontSize: 16, fontWeight: 700, color: '#000' }}>175</span>
                        <span style={{ fontSize: 12, color: '#000' }}>cm</span>
                      </div>
                      <div style={{ fontSize: 10, color: '#000', marginTop: 2 }}>ส่วนสูง</div>
                    </div>
                  </div>
                </div>
                );
                })()}
              </div>

              {/* ── การ์ดรวมตามแบบ 573:6974: แท็บเลือก vital → แถวสถิติ → กราฟใหญ่ + หุ่นจำลอง ── */}
              <div className="anim-slide-up delay-3" onClick={() => setDatePickerOpen(false)} style={{
                background: 'white', border: CARD_BORDER, borderRadius: 24, boxShadow: CARD_SHADOW,
                padding: 16, display: 'flex', flexDirection: 'column', gap: 14, position: 'relative',
              }}>
                {/* แถบเลือก vital (fillterDate ตามแบบ) + ปุ่มดูเพิ่มเติมของตัวที่เลือก */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                  <div style={{
                    position: 'relative', display: 'inline-flex', padding: 4, borderRadius: 100,
                    background: 'rgba(142,142,147,0.1)', border: '1px solid rgba(120,120,128,0.08)',
                    boxShadow: 'inset 0 1px 3px rgba(30,27,57,0.06)',
                  }}>
                    {/* ตัวไฮไลต์ gradient เลื่อนตามแท็บที่เลือก (ปุ่มกว้าง 106 เท่ากันทุกใบ) */}
                    <span aria-hidden style={{
                      position: 'absolute', top: 4, left: 4 + selVital * 106, width: 106, height: 30,
                      borderRadius: 100, background: 'linear-gradient(160deg, #3FA9FF 0%, #0088FF 55%, #0070E0 100%)',
                      boxShadow: '0 4px 12px rgba(0,136,255,0.35), inset 0 1px 0 rgba(255,255,255,0.3)',
                      transition: 'left 0.3s cubic-bezier(0.34, 1.25, 0.64, 1)',
                    }} />
                    {['ความดัน', 'การเต้นหัวใจ', 'อุณหภูมิ', 'ออกซิเจน', 'น้ำตาล', 'CGM'].map((t, i) => (
                      <button key={t} onClick={() => { setSelVital(i); setSelPt(null); }} style={{
                        position: 'relative', zIndex: 1, width: 106, height: 30,
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        borderRadius: 100, border: 'none', cursor: 'pointer', background: 'transparent',
                        fontSize: 12, fontFamily: font, whiteSpace: 'nowrap',
                        color: selVital === i ? 'white' : '#615E83',
                        fontWeight: selVital === i ? 600 : 500,
                        transition: 'color 0.25s ease',
                      }}>
                        {VITAL_ROW_ICONS[statCards[i].label] && (
                          <img src={VITAL_ROW_ICONS[statCards[i].label]} alt="" style={{
                            width: 12, height: 12, flexShrink: 0,
                            filter: selVital === i ? 'brightness(10)' : 'grayscale(1) brightness(0.85)',
                            opacity: selVital === i ? 1 : 0.75,
                            transition: 'filter 0.25s ease, opacity 0.25s ease',
                          }} />
                        )}
                        {t}
                      </button>
                    ))}
                  </div>
                  {/* ตัวกรองช่วงเวลา — วัน/สัปดาห์/เดือน/ปี + เส้นคั่น + ไอคอนปฏิทินเลือกช่วงเอง (รางเดียวกัน) */}
                  {(() => {
                    const spec = detailSpec(selPeriod, { date: selDate, month: selMonth, year: selYear });
                    /* ไอคอนติดฟ้าเมื่อเปิดอยู่ หรือกำลังดูช่วงย้อนหลังที่เลือกเอง (ไม่ได้จบวันนี้) */
                    const calActive = datePickerOpen || !spec.anchor;
                    const TY = DETAIL_TODAY.getFullYear(), TM = DETAIL_TODAY.getMonth();
                    return (
                      <div style={{
                        position: 'relative', display: 'inline-flex', alignItems: 'center', padding: 4, borderRadius: 100, flexShrink: 0,
                        background: 'rgba(142,142,147,0.1)', border: '1px solid rgba(120,120,128,0.08)',
                        boxShadow: 'inset 0 1px 3px rgba(30,27,57,0.06)',
                      }}>
                        <span aria-hidden style={{
                          position: 'absolute', top: 4, left: 4 + DETAIL_PERIODS.indexOf(selPeriod) * 66, width: 66, height: 28,
                          borderRadius: 100, background: 'linear-gradient(160deg, #3FA9FF 0%, #0088FF 55%, #0070E0 100%)',
                          boxShadow: '0 4px 12px rgba(0,136,255,0.35), inset 0 1px 0 rgba(255,255,255,0.3)',
                          transition: 'left 0.3s cubic-bezier(0.34, 1.25, 0.64, 1)',
                        }} />
                        {DETAIL_PERIODS.map(p => (
                          <button key={p} onClick={() => { setSelPeriod(p); setSelPt(null); setDatePickerOpen(false); }} style={{
                            position: 'relative', zIndex: 1, width: 66, height: 28,
                            borderRadius: 100, border: 'none', cursor: 'pointer', background: 'transparent',
                            fontSize: 11.5, fontFamily: font, whiteSpace: 'nowrap',
                            color: selPeriod === p ? 'white' : '#615E83',
                            fontWeight: selPeriod === p ? 600 : 500,
                            transition: 'color 0.25s ease',
                          }}>{p}</button>
                        ))}
                        {/* เส้นคั่นก่อนไอคอนปฏิทิน */}
                        <span aria-hidden style={{ width: 1, height: 16, background: 'rgba(30,27,57,0.14)', margin: '0 5px', flexShrink: 0, position: 'relative', zIndex: 1 }} />
                        <span style={{ position: 'relative', zIndex: 1, display: 'inline-flex' }} onClick={e => e.stopPropagation()}>
                          <button className="hover-btn" title={spec.title} onClick={() => {
                            setDatePickerOpen(o => !o);
                            setCalView({ y: selDate.getFullYear(), m: selDate.getMonth() });
                            setCalYear(selMonth.y);
                          }} style={{
                            width: 34, height: 28, borderRadius: 100, border: 'none', cursor: 'pointer',
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            background: calActive ? 'rgba(0,136,255,0.12)' : 'transparent',
                            color: calActive ? '#0088FF' : '#615E83', transition: 'all 0.2s ease',
                          }}>
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                              <rect x="1" y="2.2" width="12" height="10.8" rx="2.4" stroke="currentColor" strokeWidth="1.4" />
                              <path d="M1 5.6h12" stroke="currentColor" strokeWidth="1.4" />
                              <path d="M4.4 0.8v2.6M9.6 0.8v2.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                              {!spec.anchor && <circle cx="7" cy="9.2" r="1.6" fill="currentColor" />}
                            </svg>
                          </button>
                          {datePickerOpen && (
                            <div className="anim-scale-in" style={{
                              position: 'absolute', top: 'calc(100% + 10px)', right: 0, zIndex: 60, width: 252,
                              background: 'white', borderRadius: 16, padding: 10,
                              border: '1px solid rgba(30,27,57,0.08)', boxShadow: '0 14px 44px rgba(30,27,57,0.2)',
                            }}>
                              {/* หัวบอกช่วงที่ดูอยู่ตอนนี้ */}
                              <div style={{ padding: '0 4px 8px', fontSize: 10.5, color: '#9291A5', borderBottom: '1px solid rgba(30,27,57,0.06)', marginBottom: 8, whiteSpace: 'nowrap' }}>
                                กำลังดู · <span style={{ color: '#0088FF', fontWeight: 600 }}>{spec.title}</span>
                              </div>
                              {selPeriod === 'ปี' ? (
                                /* ── กริดปี: 3 ปีย้อนหลัง ── */
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                                  {[0, 1, 2].map(i => {
                                    const y = TY - i; const act = y === selYear;
                                    return (
                                      <button key={y} className="hover-btn" onClick={() => { setSelYear(y); setSelPt(null); setDatePickerOpen(false); }} style={{
                                        height: 36, borderRadius: 10, border: 'none', cursor: 'pointer', fontFamily: font,
                                        fontSize: 12, fontWeight: act ? 700 : 500,
                                        background: act ? '#0088FF' : 'rgba(116,116,128,0.06)', color: act ? 'white' : '#1E1B39',
                                      }}>ปี {beYY(y)}</button>
                                    );
                                  })}
                                </div>
                              ) : selPeriod === 'เดือน' ? (
                                /* ── กริดเดือน: เลื่อนปีได้ 2567–2569 · เดือนอนาคตกดไม่ได้ ── */
                                <>
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                                    <button className="hover-btn" disabled={calYear <= TY - 2} onClick={() => setCalYear(y => y - 1)} style={{ width: 26, height: 26, borderRadius: '50%', border: 'none', cursor: 'pointer', background: 'rgba(116,116,128,0.08)', color: calYear <= TY - 2 ? '#C7C7CC' : '#1E1B39', fontSize: 12 }}>‹</button>
                                    <span style={{ fontSize: 12.5, fontWeight: 700, color: '#1E1B39' }}>พ.ศ. {calYear + 543}</span>
                                    <button className="hover-btn" disabled={calYear >= TY} onClick={() => setCalYear(y => y + 1)} style={{ width: 26, height: 26, borderRadius: '50%', border: 'none', cursor: 'pointer', background: 'rgba(116,116,128,0.08)', color: calYear >= TY ? '#C7C7CC' : '#1E1B39', fontSize: 12 }}>›</button>
                                  </div>
                                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                                    {TH_M.map((mn, mi) => {
                                      const future = calYear > TY || (calYear === TY && mi > TM);
                                      const act = selMonth.y === calYear && selMonth.m === mi;
                                      return (
                                        <button key={mn} className="hover-btn" disabled={future}
                                          onClick={() => { setSelMonth({ y: calYear, m: mi }); setSelPt(null); setDatePickerOpen(false); }} style={{
                                            height: 32, borderRadius: 10, border: 'none', cursor: future ? 'default' : 'pointer', fontFamily: font,
                                            fontSize: 11.5, fontWeight: act ? 700 : 500,
                                            background: act ? '#0088FF' : 'rgba(116,116,128,0.06)',
                                            color: act ? 'white' : future ? '#C7C7CC' : '#1E1B39',
                                          }}>{mn}</button>
                                      );
                                    })}
                                  </div>
                                </>
                              ) : (
                                /* ── ปฏิทินรายวัน: เลื่อนเดือนได้ · วันอนาคตกดไม่ได้ · โหมดสัปดาห์ไฮไลต์ทั้งช่วง 7 วัน ── */
                                (() => {
                                  const { y, m } = calView;
                                  const off = new Date(y, m, 1).getDay();
                                  const nD = new Date(y, m + 1, 0).getDate();
                                  const atMax = y === TY && m === TM;
                                  const atMin = y === TY - 2 && m === 0;
                                  const wkStart = addDays(selDate, -6);
                                  const step = dir => setCalView(v => {
                                    const d = new Date(v.y, v.m + dir, 1);
                                    return { y: d.getFullYear(), m: d.getMonth() };
                                  });
                                  return (
                                    <>
                                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                                        <button className="hover-btn" disabled={atMin} onClick={() => step(-1)} style={{ width: 26, height: 26, borderRadius: '50%', border: 'none', cursor: 'pointer', background: 'rgba(116,116,128,0.08)', color: atMin ? '#C7C7CC' : '#1E1B39', fontSize: 12 }}>‹</button>
                                        <span style={{ fontSize: 12.5, fontWeight: 700, color: '#1E1B39' }}>{TH_M[m]} {beYY(y)}</span>
                                        <button className="hover-btn" disabled={atMax} onClick={() => step(1)} style={{ width: 26, height: 26, borderRadius: '50%', border: 'none', cursor: 'pointer', background: 'rgba(116,116,128,0.08)', color: atMax ? '#C7C7CC' : '#1E1B39', fontSize: 12 }}>›</button>
                                      </div>
                                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 2 }}>
                                        {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map(w => (
                                          <span key={w} style={{ textAlign: 'center', fontSize: 9.5, fontWeight: 600, color: '#9291A5', padding: '2px 0' }}>{w}</span>
                                        ))}
                                      </div>
                                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
                                        {Array.from({ length: off }, (_, i) => <span key={`b${i}`} />)}
                                        {Array.from({ length: nD }, (_, i) => {
                                          const d = new Date(y, m, i + 1);
                                          const future = d > DETAIL_TODAY;
                                          const act = sameDay(d, selDate);
                                          const inWeek = !act && selPeriod === 'สัปดาห์' && d >= wkStart && d <= selDate;
                                          const today = sameDay(d, DETAIL_TODAY);
                                          return (
                                            <button key={i} disabled={future}
                                              onClick={() => { setSelDate(d); setSelPt(null); setDatePickerOpen(false); }} style={{
                                                height: 28, borderRadius: inWeek ? 8 : '50%', border: today && !act ? '1.5px solid rgba(0,136,255,0.55)' : 'none',
                                                cursor: future ? 'default' : 'pointer', fontFamily: font, fontSize: 11, padding: 0,
                                                fontWeight: act ? 700 : 500,
                                                background: act ? '#0088FF' : inWeek ? 'rgba(0,136,255,0.1)' : 'transparent',
                                                color: act ? 'white' : future ? '#C7C7CC' : inWeek ? '#0088FF' : '#1E1B39',
                                                transition: 'background 0.12s ease',
                                              }}>{i + 1}</button>
                                          );
                                        })}
                                      </div>
                                      {selPeriod === 'สัปดาห์' && (
                                        <div style={{ marginTop: 8, fontSize: 9.5, color: '#9291A5', textAlign: 'center' }}>เลือกวันสิ้นสุด — แสดงย้อนหลัง 7 วันจบวันนั้น</div>
                                      )}
                                    </>
                                  );
                                })()
                              )}
                            </div>
                          )}
                        </span>
                      </div>
                    );
                  })()}
                </div>

                {(() => {
                  const s = statCards[selVital];
                  const st = VITAL_STATUS[s.status] || VITAL_STATUS.normal;
                  const ds = chartDataSets[s.chart];
                  const isCgm = s.label === 'CGM';
                  /* ข้อมูลตามช่วงที่เลือก — ช่วง "ดั้งเดิม" ที่จบวันนี้ (CGM = วัน, ที่เหลือ = สัปดาห์) ใช้ชุดข้อมูลจริง
                     ช่วงอื่น/ช่วงย้อนหลังที่เลือกเอง สร้างจากเครื่องกำเนิดเดียวกับป๊อปอัพเดิม */
                  const spec = detailSpec(selPeriod, { date: selDate, month: selMonth, year: selYear });
                  const native = spec.anchor && (isCgm ? selPeriod === 'วัน' : selPeriod === 'สัปดาห์');
                  const data = native ? ds.data : genDetailData(DETAIL_CFG[s.label], spec);
                  const dec = s.label === 'อุณหภูมิ';
                  const f = v => dec ? (+v).toFixed(1) : String(Math.round(v));
                  const stats = ds.lines.map(l => {
                    const vs = data.map(d => d[l.key]);
                    return { color: l.color, color2: l.color2, avg: f(vs.reduce((a, b) => a + b, 0) / vs.length), max: f(Math.max(...vs)), min: f(Math.min(...vs)) };
                  });
                  const n = data.length;
                  const outPts = data.filter(d => ds.lines.some(l => l.range && (d[l.key] < l.range[0] || d[l.key] > l.range[1]))).length;
                  const l0 = ds.lines[0];
                  const first = data[0][l0.key], last = data[n - 1][l0.key];
                  const avg0 = data.reduce((a, d) => a + d[l0.key], 0) / n;
                  const trend = Math.abs(last - first) <= avg0 * 0.03 ? 'แนวโน้มทรงตัว' : last > first ? 'แนวโน้มสูงขึ้น' : 'แนวโน้มลดลง';
                  const tir = isCgm ? Math.round(data.filter(d => d[l0.key] >= l0.range[0] && d[l0.key] <= l0.range[1]).length / n * 100) : null;
                  const outText = isCgm
                    ? `อยู่ในเกณฑ์ ${tir}% ${selPeriod === 'วัน' ? 'ของ 24 ชม.' : 'ของช่วงที่ดู'}`
                    : outPts ? `หลุดเกณฑ์ ${outPts} จาก ${n} ครั้ง` : `อยู่ในเกณฑ์ครบทั้ง ${n} ครั้ง`;
                  /* โฟกัสจุดบนกราฟแบบหน้าป๊อปอัพ — กดจุดแล้วการ์ด "ล่าสุด" เปลี่ยนเป็นค่าจุดนั้น */
                  const lastIdx = n - 1;
                  const effIdx = Math.min(selPt != null ? selPt : lastIdx, lastIdx);
                  const isLatest = effIdx === lastIdx;
                  /* isLive = จุดท้ายของช่วงปัจจุบันจริงๆ → ใช้ค่า/ป้ายจากการ์ดหลัก · ช่วงย้อนหลังคิดจากข้อมูลช่วงนั้น */
                  const isLive = isLatest && spec.anchor;
                  const selRow = !isLive ? data[effIdx] : null;
                  const dispValue = selRow
                    ? (ds.lines.length > 1 ? ds.lines.map(l => f(selRow[l.key])).join('/') : String(f(selRow[l0.key])))
                    : s.value;
                  const outHigh = selRow && ds.lines.some(l => l.range && selRow[l.key] > l.range[1]);
                  const outLow = selRow && ds.lines.some(l => l.range && selRow[l.key] < l.range[0]);
                  const dispStatus = selRow
                    ? (outHigh ? { text: 'สูงกว่าเกณฑ์', color: '#FF383C' } : outLow ? { text: 'ต่ำกว่าเกณฑ์', color: '#E8802A' } : { text: 'ปกติ', color: '#34C759' })
                    : { text: s.badge, color: st.badgeBg };
                  const accent = selRow ? dispStatus.color : st.badgeBg;
                  /* การ์ดสถิติ: ขาวเรียบไม่มีเงา + ชิปไอคอนสีประจำ · ใบล่าสุดไล่เฉดสีตามสถานะ */
                  const statCell = {
                    background: 'white', border: CARD_BORDER, borderRadius: 20, padding: '12px 14px',
                    display: 'flex', flexDirection: 'column', gap: 7, justifyContent: 'center', minWidth: 0,
                  };
                  const chip = c => ({
                    width: 22, height: 22, borderRadius: 8, flexShrink: 0,
                    background: `${c}16`, color: c,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 800, lineHeight: 1,
                  });
                  const trendColor = s.status === 'normal' ? '#0F7B37' : '#B45309';
                  return (
                    <>
                      {/* ═ แถวสถิติ 5 ใบตามแบบ: ค่าล่าสุด · เฉลี่ย · สูงสุด · ต่ำสุด · สรุป(กว้าง 2 ส่วน) ═ */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 1fr 1fr 1fr 2fr', gap: 12 }}>
                        <div className="hover-card" style={{
                          ...statCell,
                          background: `linear-gradient(135deg, ${accent}14, rgba(255,255,255,0.95) 70%)`,
                          border: `1px solid ${accent}2E`,
                          transition: 'background 0.25s ease, border 0.25s ease',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                            <span style={chip(accent)}>
                              {/* จุด live มีวงแหวนเรือง — สื่อว่าเป็นค่าปัจจุบัน/จุดที่เลือก */}
                              <span style={{ width: 8, height: 8, borderRadius: '50%', background: accent, boxShadow: `0 0 0 3px ${accent}30` }} />
                            </span>
                            <span style={{ fontSize: 11, fontWeight: 600, color: GRAY }}>{isLive ? 'ล่าสุด' : 'จุดที่เลือก'}</span>
                            {!isLatest && (
                              <button onClick={() => setSelPt(null)} style={{
                                marginLeft: 'auto', border: 'none', cursor: 'pointer', borderRadius: 100, padding: '2px 8px',
                                background: 'rgba(0,136,255,0.1)', color: '#0088FF', fontSize: 9.5, fontWeight: 600, fontFamily: font,
                                whiteSpace: 'nowrap',
                              }}>↺ ล่าสุด</button>
                            )}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                            <span className="num" style={{ fontSize: 20, fontWeight: 800, lineHeight: '22px', color: selRow ? dispStatus.color : st.value, transition: 'color 0.2s ease' }}>{dispValue}</span>
                            <span style={{ fontSize: 11, color: selRow ? dispStatus.color : st.unit }}>{s.unit}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: 4,
                              fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 100,
                              background: accent, color: '#fff', lineHeight: '14px', transition: 'background 0.25s ease',
                            }}>
                              {(selRow ? !(outHigh || outLow) : st.mark === 'info')
                                ? <img src={ppInfoCircle} alt="" style={{ width: 8, height: 8 }} />
                                : <span style={{
                                    width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                                    background: '#fff', color: accent,
                                    fontSize: 8, fontWeight: 800, lineHeight: '10px', textAlign: 'center',
                                  }}>!</span>}
                              {dispStatus.text}
                            </span>
                            <span style={{ fontSize: 10, color: 'rgba(0,0,0,0.45)', lineHeight: '14px', whiteSpace: 'nowrap' }}>
                              {selRow
                                ? (selPeriod === 'วัน' ? `${fmtDMY(selDate)} · ${selRow.day}` : isLatest ? spec.title : selRow.day)
                                : s.updated}
                            </span>
                          </div>
                        </div>
                        {[['เฉลี่ย', 'avg', '≈', '#6658E1'], ['สูงสุด', 'max', '↑', '#FF383C'], ['ต่ำสุด', 'min', '↓', '#0088FF']].map(([lb, key, sym, c]) => (
                          <div key={lb} className="hover-card" style={statCell}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                              <span style={chip(c)}>{sym}</span>
                              <span style={{ fontSize: 11, fontWeight: 600, color: GRAY }}>{lb}</span>
                            </div>
                            {stats.map((x, xi) => (
                              <div key={xi} style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
                                {stats.length > 1 && <span style={{ width: 7, height: 7, borderRadius: '50%', background: `linear-gradient(180deg, ${x.color}, ${x.color2 || x.color})`, flexShrink: 0, alignSelf: 'center' }} />}
                                <span className="num" style={{ fontSize: 17, fontWeight: 800, color: '#1E1B39', lineHeight: 1.2 }}>{x[key]}</span>
                                <span style={{ fontSize: 9, color: '#9291A5' }}>{s.unit}</span>
                              </div>
                            ))}
                          </div>
                        ))}
                        <div className="hover-card" style={statCell}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                            <span style={chip('#34C759')}>≡</span>
                            <span style={{ fontSize: 11, fontWeight: 600, color: GRAY }}>สรุป</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#6658E1', flexShrink: 0, marginTop: 5 }} />
                            <span style={{ fontSize: 11, color: '#1E1B39', lineHeight: 1.55 }}>
                              ค่าเฉลี่ย {stats.map(x => x.avg).join('/')} {s.unit} · {outText}
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: trendColor, flexShrink: 0, marginTop: 5 }} />
                            <span style={{ fontSize: 11, fontWeight: 600, lineHeight: 1.5, color: trendColor }}>
                              {trend}{s.status !== 'normal' ? ' · ควรติดตามต่อเนื่อง' : ' · อยู่ในเกณฑ์ที่ดี'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* ═ กราฟใหญ่ของ vital ที่เลือก + หุ่นจำลองชิดขวาตามแบบ ═ */}
                      <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          {/* แผงกราฟ: พื้นโปร่ง (ไม่มีสีพื้นหลัง) + ชิปหน่วยมุมขวาบน */}
                          <div style={{ position: 'relative', padding: '14px 6px 2px' }}>
                          <span style={{
                            position: 'absolute', top: 10, right: 12, zIndex: 2,
                            fontSize: 10, fontWeight: 600, color: '#9291A5',
                            background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(30,27,57,0.06)',
                            borderRadius: 100, padding: '2px 9px',
                          }}>หน่วย · {s.unit}</span>
                          <ResponsiveContainer key={`${selVital}-${selPeriod}-${spec.title}`} className="anim-chart-fade" width="100%" height={220}>
                            <ComposedChart data={data} margin={{ top: 14, right: 54, left: 2, bottom: 4 }}
                              onClick={ch => { if (ch && ch.activeTooltipIndex != null) setSelPt(ch.activeTooltipIndex === lastIdx ? null : ch.activeTooltipIndex); }}
                              style={{ cursor: 'pointer' }}>
                              <CartesianGrid stroke="rgba(30,27,57,0.03)" vertical={data.length <= 40} />
                              <XAxis dataKey="day" interval={native && ds.xTicks ? 0 : undefined} ticks={native ? ds.xTicks : undefined} minTickGap={22} tickFormatter={d => (d === '23:55' ? '24:00' : d.split(' ')[0])} tick={{ fontSize: 10, fill: '#9291A5', fontFamily: font }} axisLine={false} tickLine={false} tickMargin={12} />
                              <YAxis width={30} tick={{ fontSize: 10, fill: '#9291A5', fontFamily: font }} axisLine={false} tickLine={false} domain={ds.domain} ticks={ds.ticks} tickCount={3} />
                              <Tooltip content={<Tip unit={s.unit} source={native ? ds.source : 'รวมจากแอพ Atlas HomeCare · My Atlas · อุปกรณ์ IoT'} ranges={Object.fromEntries(ds.lines.filter(l => l.range).map(l => [l.key, l.range]))} />} cursor={{ stroke: 'rgba(30,27,57,0.15)', strokeDasharray: '3 3' }} />
                              {(ds.zones || []).map((z, zi) => (
                                <ReferenceArea key={zi} y1={z.y1} y2={z.y2} fill={z.color} stroke="none" />
                              ))}
                              {/* กราฟจุดถี่ (CGM): วาดเส้นตั้งของกริดเองตาม xTicks */}
                              {data.length > 40 && (ds.xTicks || []).map(t => (
                                <ReferenceLine key={`vgrid-${t}`} x={t} stroke="rgba(30,27,57,0.03)" strokeWidth={1} />
                              ))}
                              {(ds.refs || []).map(r => (
                                <ReferenceLine key={r.y} y={r.y} stroke={r.color} strokeOpacity={0.4} strokeDasharray="4 4" />
                              ))}
                              {/* เส้น + วงแหวนโฟกัสจุดที่เลือก (แบบหน้าป๊อปอัพ) — ซ่อนเมื่ออยู่ที่จุดล่าสุดของ CGM รายวัน (จุดถี่เกิน) */}
                              {data[effIdx] && !(isLatest && data.length > 40) && (
                                <ReferenceLine x={data[effIdx].day} stroke="#0088FF" strokeWidth={1.5} strokeDasharray="5 4" strokeOpacity={0.7} />
                              )}
                              {data[effIdx] && !(isLatest && data.length > 40) && ds.lines.map(l => {
                                const v = data[effIdx][l.key];
                                const out = l.range && (v < l.range[0] || v > l.range[1]);
                                const c = out ? '#FF383C' : l.color;
                                /* แหวนโฟกัสป๊อปเข้าทุกครั้งที่ย้ายจุด (key ตาม effIdx ให้ remount) */
                                return (
                                  <ReferenceDot key={`focus-${l.key}-${effIdx}`} x={data[effIdx].day} y={v} isFront
                                    shape={p => (
                                      <g className="pp-focus-pop">
                                        <circle cx={p.cx} cy={p.cy} r={11} fill={c} fillOpacity={0.15} />
                                        <circle cx={p.cx} cy={p.cy} r={7} fill="none" stroke={c} strokeWidth={2} />
                                        <circle cx={p.cx} cy={p.cy} r={4} fill={c} stroke="white" strokeWidth={2} />
                                      </g>
                                    )} />
                                );
                              })}
                              {/* splitColor (CGM): ไล่สีเส้นช่วงหลุดเกณฑ์ — สูตรเดียวกับการ์ดเดิม */}
                              {(() => {
                                if (!ds.splitColor) return null;
                                const sc = ds.splitColor;
                                const vals = data.map(d => d[ds.lines[0].key]);
                                const mx = Math.max(...vals), mn = Math.min(...vals);
                                if (mx <= mn) return null;
                                const clamp = v => Math.max(0, Math.min(1, v));
                                const offHigh = sc.high != null ? clamp((mx - sc.high) / (mx - mn)) : 0;
                                const offLow = sc.low != null ? clamp((mx - sc.low) / (mx - mn)) : 1;
                                const hasHigh = sc.high != null && mx > sc.high;
                                const hasLow = sc.low != null && mn < sc.low;
                                if (!hasHigh && !hasLow) return null;
                                const stops = [];
                                if (hasHigh) {
                                  stops.push([0, sc.above], [offHigh, sc.above], [Math.min(1, offHigh + 0.04), ds.lines[0].color]);
                                } else stops.push([0, ds.lines[0].color]);
                                if (hasLow) {
                                  stops.push([Math.max(0, offLow - 0.04), ds.lines[0].color], [offLow, sc.below], [1, sc.below]);
                                } else stops.push([1, ds.lines[0].color]);
                                return (
                                  <defs>
                                    <linearGradient id="split-sel" x1="0" y1="0" x2="0" y2="1">
                                      {stops.map(([o, c], si) => <stop key={si} offset={o} stopColor={c} />)}
                                    </linearGradient>
                                  </defs>
                                );
                              })()}
                              <defs>
                                {ds.lines.map(l => (
                                  <filter key={l.key} id={`glow-sel-${l.key}`} x="-50%" y="-50%" width="200%" height="200%">
                                    <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor={l.color} floodOpacity="0.22" />
                                  </filter>
                                ))}
                                {/* เส้นไล่เฉดซ้าย→ขวา (เข้ม→สด) + จุดสว่างไหลวนช้าๆ ให้เส้นดูมีชีวิต */}
                                {ds.lines.map(l => (
                                  <linearGradient key={`sg-${l.key}`} id={`stroke-sel-${l.key}`} x1="0" y1="0" x2="1" y2="0">
                                    <stop offset="0%" stopColor={l.color2 || l.color} />
                                    <stop offset="62%" stopColor={l.color}>
                                      <animate attributeName="offset" values="0.35;0.8;0.35" dur="5s" repeatCount="indefinite" />
                                    </stop>
                                    <stop offset="100%" stopColor={l.color} />
                                  </linearGradient>
                                ))}
                                {ds.lines.length === 1 && (
                                  <linearGradient id="fill-sel" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={ds.lines[0].color} stopOpacity={0.2} />
                                    <stop offset="45%" stopColor={ds.lines[0].color} stopOpacity={0.06} />
                                    <stop offset="100%" stopColor={ds.lines[0].color} stopOpacity={0} />
                                  </linearGradient>
                                )}
                                {ds.lines.length === 2 && (
                                  <linearGradient id="band-sel" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={ds.lines[0].color} stopOpacity={0.1} />
                                    <stop offset="100%" stopColor={ds.lines[1].color} stopOpacity={0.05} />
                                  </linearGradient>
                                )}
                              </defs>
                              {ds.lines.length === 1 && (
                                <Area type={ds.curve || 'monotone'} dataKey={ds.lines[0].key}
                                  fill="url(#fill-sel)" stroke="none" tooltipType="none" legendType="none"
                                  animationDuration={1100} animationBegin={350} animationEasing="ease-out" />
                              )}
                              {/* แถบระหว่างสองเส้น (pulse pressure band ของความดัน) — เข้าหลังเส้นวาดเกือบจบ */}
                              {ds.lines.length === 2 && (
                                <Area type={ds.curve || 'monotone'}
                                  dataKey={d => [d[ds.lines[1].key], d[ds.lines[0].key]]}
                                  fill="url(#band-sel)" stroke="none" tooltipType="none" legendType="none"
                                  animationDuration={1100} animationBegin={450} animationEasing="ease-out" />
                              )}
                              {ds.lines.map(l => (
                                <Line key={l.key} type={ds.curve || 'monotone'} dataKey={l.key} name={l.name}
                                  stroke={ds.splitColor && (
                                    (ds.splitColor.high != null && Math.max(...data.map(d => d[l.key])) > ds.splitColor.high) ||
                                    (ds.splitColor.low != null && Math.min(...data.map(d => d[l.key])) < ds.splitColor.low)
                                  ) ? 'url(#split-sel)' : `url(#stroke-sel-${l.key})`}
                                  strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
                                  filter={`url(#glow-sel-${l.key})`}
                                  dot={(ds.dots || !native) && data.length <= 40 ? ({ cx, cy, value, index }) => {
                                    /* จุดวงแหวนเด้งป๊อปทีละจุดไล่จากซ้ายไปขวา — หลุดเกณฑ์เป็นแดงทึบให้สะดุดตา */
                                    const base = data.length > 20 ? 2.8 : 4;
                                    const out = l.range && (value < l.range[0] || value > l.range[1]);
                                    const stagger = Math.min(70, Math.round(1100 / data.length));
                                    return (
                                      <g key={index} className="pp-dot-pop" style={{ animationDelay: `${340 + index * stagger}ms` }}>
                                        {out
                                          ? <circle cx={cx} cy={cy} r={base + 0.7} fill="#FF383C" stroke="white" strokeWidth={data.length > 20 ? 1.2 : 2} />
                                          : <circle cx={cx} cy={cy} r={base} fill="white" stroke={l.color} strokeWidth={data.length > 20 ? 1.4 : 2} />}
                                      </g>
                                    );
                                  } : ({ cx, cy, index }) => (
                                    index === data.length - 1
                                      ? <g key={index}>
                                          <circle cx={cx} cy={cy} r={9} fill={l.color} opacity={0.15} />
                                          <circle cx={cx} cy={cy} r={4} fill={l.color} stroke="white" strokeWidth={2} />
                                        </g>
                                      : <circle key={index} r={0} fill="none" />
                                  )}
                                  activeDot={{ r: 5.5, fill: l.color, stroke: 'white', strokeWidth: 2, style: { filter: `drop-shadow(0 2px 5px ${l.color}70)` } }}
                                  animationDuration={1300} animationBegin={ds.lines.length === 2 && l.key === ds.lines[1].key ? 180 : 0} animationEasing="ease-out"
                                />
                              ))}
                              {/* วงเต้นตุบๆ ที่จุดล่าสุดของช่วงปัจจุบัน — สื่อว่าค่ากำลังอัพเดทสด */}
                              {spec.anchor && data[lastIdx] && data.length <= 40 && ds.lines.map(l => (
                                <ReferenceDot key={`live-${l.key}`} x={data[lastIdx].day} y={data[lastIdx][l.key]} isFront
                                  shape={p => <circle cx={p.cx} cy={p.cy} r={9} fill={l.color} className="pp-live-dot" />} />
                              ))}
                              {/* ป้ายค่าปัจจุบันติดขอบขวา (สไตล์กราฟหุ้น) — อ่านค่าท้ายสุดได้ทันทีไม่ต้องเล็ง */}
                              {data[lastIdx] && ds.lines.map(l => {
                                const tv = String(f(data[lastIdx][l.key]));
                                const tw = tv.length * 6.4 + 14;
                                return (
                                  <ReferenceDot key={`tag-${l.key}`} x={data[lastIdx].day} y={data[lastIdx][l.key]} isFront
                                    shape={p => (
                                      <g transform={`translate(${p.cx + 11}, ${p.cy})`} style={{ pointerEvents: 'none' }}>
                                        <g className="pp-tag-in">
                                          <path d={`M0 0 L6 -5 L6 5 Z`} fill={l.color} />
                                          <rect x={5} y={-10} rx={10} width={tw} height={20} fill={l.color} />
                                          <text x={5 + tw / 2} y={3.5} textAnchor="middle" fontSize={10.5} fontWeight={700} fill="white" fontFamily={font}>{tv}</text>
                                        </g>
                                      </g>
                                    )} />
                                );
                              })}
                              {/* หมุดสูงสุด ▲ / ต่ำสุด ▼ ของเส้นหลัก — เห็น extreme ของช่วงทันที (ซ่อนถ้าชนจุดล่าสุด) */}
                              {data.length <= 40 && data.length > 2 && (() => {
                                const vals = data.map(d => d[l0.key]);
                                const mxI = vals.indexOf(Math.max(...vals));
                                const mnI = vals.indexOf(Math.min(...vals));
                                const mark = (idx, up) => idx !== lastIdx && (
                                  <ReferenceDot key={`ext-${up}`} x={data[idx].day} y={data[idx][l0.key]} isFront
                                    shape={p => (
                                      <text className="pp-ext-in" x={p.cx} y={p.cy + (up ? -11 : 17)} textAnchor="middle" fontSize={9.5} fontWeight={700}
                                        fill={up ? '#FF383C' : '#0088FF'} fontFamily={font} style={{ pointerEvents: 'none' }}>
                                        {up ? '▲' : '▼'} {f(data[idx][l0.key])}
                                      </text>
                                    )} />
                                );
                                return [mark(mxI, true), mark(mnI, false)];
                              })()}
                            </ComposedChart>
                          </ResponsiveContainer>
                          </div>
                          {/* เกณฑ์/legend ใต้กราฟ — โครงเดียวกับการ์ดเดิม */}
                          {(() => {
                            const refByColor = Object.fromEntries((ds.refs || []).map(r => [r.color, r]));
                            const items = ds.legend
                              ? ds.legend.map(g => ({ ...g, ref: refByColor[g.color] }))
                              : ds.lines.length > 1
                                ? ds.lines.map(l => ({ color: l.color, color2: l.color2, label: l.name, ref: refByColor[l.color] }))
                                : [];
                            const used = new Set(items.filter(it => it.ref).map(it => it.color));
                            const loneRefs = (ds.refs || []).filter(r => !used.has(r.color) && !r.hideLegend);
                            const zoneLegends = (ds.zones || []).filter(z => z.legendLabel);
                            if (!items.length && !loneRefs.length && !zoneLegends.length) return null;
                            return (
                              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '4px 14px', paddingTop: 8 }}>
                                {items.map(it => (
                                  <span key={it.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 10, color: '#615E83', lineHeight: '14px', whiteSpace: 'nowrap' }}>
                                    <span style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: `linear-gradient(180deg, ${it.color}, ${it.color2 || it.color})` }} />
                                    {it.label}
                                    {it.ref && <span style={{ color: '#9291A5' }}>· {it.ref.label}</span>}
                                  </span>
                                ))}
                                {loneRefs.map(r => (
                                  <span key={r.y} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 10, color: '#8E8E93', lineHeight: '14px', whiteSpace: 'nowrap' }}>
                                    <svg width="14" height="2" style={{ flexShrink: 0, overflow: 'visible' }} aria-hidden="true">
                                      <line x1="0" y1="1" x2="14" y2="1" stroke={r.color} strokeOpacity={0.55} strokeWidth="1.5" strokeDasharray="4 3" />
                                    </svg>
                                    {r.label}
                                  </span>
                                ))}
                                {zoneLegends.map((z, zi) => (
                                  <span key={`zone-${zi}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 10, color: '#615E83', lineHeight: '14px', whiteSpace: 'nowrap' }}>
                                    <span style={{ width: 14, height: 8, borderRadius: 3, flexShrink: 0, background: `${z.edge}2E`, border: `1px solid ${z.edge}66` }} />
                                    {z.legendLabel}
                                  </span>
                                ))}
                              </div>
                            );
                          })()}
                        </div>
                        {/* ช่องว่างจองที่ให้หุ่น — ตัวภาพจริงวาดในชั้น clip ให้โผล่จากขอบล่างการ์ด */}
                        <div aria-hidden style={{ width: (VITAL_ART_CFG[selVital] || VITAL_ART_CFG[0]).cw, flexShrink: 0 }} />
                      </div>

                      {/* ชั้น clip ตามขอบมนการ์ด — หุ่นชิดขอบล่างจริง โดนตัดฐานนิดๆ เหมือนโผล่ขึ้นมา */}
                      <div aria-hidden style={{ position: 'absolute', inset: 0, borderRadius: 24, overflow: 'hidden', pointerEvents: 'none' }}>
                        {(() => {
                          const c = VITAL_ART_CFG[selVital] || VITAL_ART_CFG[0];
                          /* วงแหวนจุดจางๆ ไล่กระจายเป็นชั้นหลังหุ่น — สีตามเส้นกราฟของ vital ที่เลือก */
                          const haloSize = Math.round(c.cw * 1.5);
                          const haloColor = l0.color2 || l0.color;
                          return (
                            <>
                              <svg key={`halo-${selVital}`} className="anim-chart-fade" width={haloSize} height={haloSize}
                                viewBox={`0 0 ${haloSize} ${haloSize}`} aria-hidden
                                onMouseMove={e => {
                                  const rc = e.currentTarget.getBoundingClientRect();
                                  setHaloMouse({ x: e.clientX - rc.left, y: e.clientY - rc.top });
                                }}
                                onMouseLeave={() => setHaloMouse(null)}
                                style={{
                                  position: 'absolute',
                                  right: c.x + (c.cw - haloSize) / 2,
                                  bottom: c.y + c.ch * 0.52 - haloSize / 2,
                                  /* จุดโต้ตอบเมาส์ได้ — เปิด pointer events เฉพาะชั้นนี้ (ชั้นแม่ปิดไว้) */
                                  pointerEvents: 'auto',
                                  /* เจาะรูตรงกลาง — จุดไม่ทับตัวหุ่น เหลือเป็นรัศมีรอบนอก */
                                  WebkitMaskImage: 'radial-gradient(ellipse 42% 52% at 50% 50%, transparent 55%, black 78%)',
                                  maskImage: 'radial-gradient(ellipse 42% 52% at 50% 50%, transparent 55%, black 78%)',
                                }}>
                                {/* วงชิดกัน — เมาส์เข้าใกล้จุดไหน จุดนั้นขยาย+สว่างตามระยะ (แรงสุดที่ σ≈52px) */}
                                {[0.24, 0.33, 0.42, 0.51, 0.6, 0.69].map((f, ri) => {
                                  const r = f * haloSize / 2;
                                  const n = 10 + ri * 7;
                                  return Array.from({ length: n }, (_, i) => {
                                    const a = (i / n) * Math.PI * 2 + ri * 0.4;
                                    const cx = haloSize / 2 + r * Math.cos(a);
                                    const cy = haloSize / 2 + r * Math.sin(a);
                                    let dotR = 2.4 - ri * 0.22;
                                    let dotOp = 0.30 - ri * 0.042;
                                    if (haloMouse) {
                                      const dx = cx - haloMouse.x, dy = cy - haloMouse.y;
                                      const boost = Math.exp(-(dx * dx + dy * dy) / (2 * 52 * 52));
                                      dotR += boost * 3.4;
                                      dotOp = Math.min(0.9, dotOp + boost * 0.55);
                                    }
                                    return (
                                      <circle key={`${ri}-${i}`} cx={cx} cy={cy} r={dotR} fill={haloColor} opacity={dotOp}
                                        style={{ transition: haloMouse ? 'none' : 'r 0.45s ease, opacity 0.45s ease' }} />
                                    );
                                  });
                                })}
                              </svg>
                              {/* หน้าต่างครอป — เห็นภาพเฉพาะส่วนที่อยู่ในกรอบ · ซูม/เลื่อนภาพข้างในได้จากแผง ⚙ */}
                              <div key={`art-${selVital}`} className="anim-chart-fade" style={{
                                position: 'absolute', right: c.x, bottom: c.y,
                                width: c.cw, height: c.ch, overflow: 'hidden', opacity: c.opacity,
                                /* เฟดจางลงถึงขอบล่างของกรอบครอป */
                                WebkitMaskImage: c.fade >= 97 ? 'none' : `linear-gradient(180deg, black ${c.fade}%, transparent 97%)`,
                                maskImage: c.fade >= 97 ? 'none' : `linear-gradient(180deg, black ${c.fade}%, transparent 97%)`,
                              }}>
                                <img src={(VITAL_ART[selVital] || VITAL_ART[0]).img} alt="" style={{
                                  position: 'absolute', left: c.ix, bottom: c.iy,
                                  width: c.w, maxWidth: 'none',
                                  /* พื้นหลังภาพเป็นขาวทึบ — multiply ทำให้ขาวโปร่ง เห็นจุดด้านหลังทะลุรอบตัวหุ่น */
                                  mixBlendMode: 'multiply',
                                }} />
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* ── ประวัติการวัด Vital Signs ── */}
              <div className="anim-slide-up delay-7" style={{ ...glassCard }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 14, background: '#6658E1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <img src={ppHeaderIcon} alt="" style={{ width: 20, height: 20 }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: BLACK }}>ประวัติการวัดค่า Vital Signs</div>
                      <div style={{ fontSize: 11, color: GRAY, marginTop: 2 }}>ประวัติการบันทึกสัญญาณชีพ เพื่อใช้ติดตามและประเมินสุขภาพ</div>
                    </div>
                  </div>
                  {/* ตัวกรองเดือนแบบปฏิทิน — pill วงรี + popover กริด 12 เดือน เลื่อนปีได้ (แบบเดียวกับของกราฟ) */}
                  {(() => {
                    const TYh = DETAIL_TODAY.getFullYear(), TMh = DETAIL_TODAY.getMonth();
                    return (
                      <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
                        <button className="hover-btn" onClick={() => { setHistPickerOpen(o => !o); setHistCalYear(histMonth.y); }} style={{
                          display: 'inline-flex', alignItems: 'center', gap: 7, cursor: 'pointer',
                          height: 30, padding: '0 12px', borderRadius: 100, fontFamily: font,
                          background: histPickerOpen ? 'rgba(0,136,255,0.1)' : 'rgba(0,0,0,0.04)',
                          border: `1px solid ${histPickerOpen ? 'rgba(0,136,255,0.35)' : 'rgba(30,27,57,0.08)'}`,
                          fontSize: 11, fontWeight: 600, color: histPickerOpen ? '#0088FF' : '#1E1B39', transition: 'all 0.15s ease',
                        }}>
                          <svg width="12" height="12" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
                            <rect x="1" y="2.2" width="12" height="10.8" rx="2.4" stroke="currentColor" strokeWidth="1.4" />
                            <path d="M1 5.6h12" stroke="currentColor" strokeWidth="1.4" />
                            <path d="M4.4 0.8v2.6M9.6 0.8v2.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                          </svg>
                          {TH_M[histMonth.m]} {beYY(histMonth.y)}
                          <svg width="9" height="6" viewBox="0 0 10 6" fill="none" style={{ flexShrink: 0, transform: histPickerOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }}>
                            <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                        {histPickerOpen && (
                          <div className="anim-scale-in" style={{
                            position: 'absolute', top: 'calc(100% + 8px)', right: 0, zIndex: 60, width: 252,
                            background: 'white', borderRadius: 16, padding: 10,
                            border: '1px solid rgba(30,27,57,0.08)', boxShadow: '0 14px 44px rgba(30,27,57,0.2)',
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                              <button className="hover-btn" disabled={histCalYear <= TYh - 2} onClick={() => setHistCalYear(y => y - 1)} style={{ width: 26, height: 26, borderRadius: '50%', border: 'none', cursor: 'pointer', background: 'rgba(116,116,128,0.08)', color: histCalYear <= TYh - 2 ? '#C7C7CC' : '#1E1B39', fontSize: 12 }}>‹</button>
                              <span style={{ fontSize: 12.5, fontWeight: 700, color: '#1E1B39' }}>พ.ศ. {histCalYear + 543}</span>
                              <button className="hover-btn" disabled={histCalYear >= TYh} onClick={() => setHistCalYear(y => y + 1)} style={{ width: 26, height: 26, borderRadius: '50%', border: 'none', cursor: 'pointer', background: 'rgba(116,116,128,0.08)', color: histCalYear >= TYh ? '#C7C7CC' : '#1E1B39', fontSize: 12 }}>›</button>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                              {TH_M.map((mn, mi) => {
                                const future = histCalYear > TYh || (histCalYear === TYh && mi > TMh);
                                const act = histMonth.y === histCalYear && histMonth.m === mi;
                                return (
                                  <button key={mn} className="hover-btn" disabled={future}
                                    onClick={() => { setHistMonth({ y: histCalYear, m: mi }); setHistoryPage(1); setExpandedVisit('0-0'); setHistPickerOpen(false); }} style={{
                                      height: 32, borderRadius: 10, border: 'none', cursor: future ? 'default' : 'pointer', fontFamily: font,
                                      fontSize: 11.5, fontWeight: act ? 700 : 500,
                                      background: act ? '#0088FF' : 'rgba(116,116,128,0.06)',
                                      color: act ? 'white' : future ? '#C7C7CC' : '#1E1B39',
                                    }}>{mn}</button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>

                <div style={{ marginTop: 14 }}>
                  {(() => {
                    /* ไทม์ไลน์เรียงวัน/เวลา (ใหม่→เก่า) — แบ่งหน้าแบบรายการ แล้วจัดกลุ่มหัวข้อรายวันในหน้านั้น */
                    const pageEntries = histEntries.slice(startItem - 1, endItem);
                    const days = [];
                    pageEntries.forEach(en => {
                      const last = days[days.length - 1];
                      if (!last || last.date !== en.dateLabel) days.push({ date: en.dateLabel, isToday: en.isToday, list: [en] });
                      else last.list.push(en);
                    });
                    const srcChip = (auto) => (
                      <span style={{
                        fontSize: 9, fontWeight: 700, padding: '1.5px 7px', borderRadius: 100, flexShrink: 0,
                        background: auto ? 'rgba(52,199,89,0.12)' : 'rgba(116,116,128,0.12)',
                        color: auto ? '#0F7B37' : '#615E83',
                      }}>{auto ? 'อัตโนมัติ' : 'กรอกเอง'}</span>
                    );
                    return days.map(day => (
                      <div key={day.date} style={{ marginBottom: 14 }}>
                        {/* หัวข้อวัน */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '2px 0 8px' }}>
                          <span style={{ width: 7, height: 7, borderRadius: '50%', background: day.isToday ? '#34C759' : 'rgba(30,27,57,0.18)', flexShrink: 0 }} />
                          <span style={{ fontSize: 11.5, fontWeight: 700, color: BLACK }}>{day.date}{day.isToday ? ' · วันนี้' : ''}</span>
                          <span style={{ flex: 1, height: 1, background: 'rgba(30,27,57,0.06)' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingLeft: 15 }}>
                          {day.list.map(en => en.kind === 'home' ? (
                            /* ── การ์ดเยี่ยมบ้าน: บันทึกครบชุดครั้งเดียวโดยเจ้าหน้าที่ ── */
                            (() => {
                              const isOpen = expandedVisit === en.id;
                              return (
                                <div key={en.id} className="hover-card" style={{
                                  background: '#fff', borderRadius: 16,
                                  border: '1px solid rgba(25,165,137,0.25)',
                                  boxShadow: '0 1px 4px rgba(0,0,0,0.04)', overflow: 'hidden',
                                }}>
                                  <div onClick={() => setExpandedVisit(isOpen ? null : en.id)} style={{
                                    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', cursor: 'pointer',
                                    background: isOpen ? 'rgba(25,165,137,0.05)' : 'transparent', transition: 'background 0.15s ease',
                                  }}>
                                    <img src={logoHomeCare} alt="" style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'contain', flexShrink: 0 }} />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      <div style={{ fontSize: 12, fontWeight: 700, color: BLACK }}>เยี่ยมบ้าน · วัดครบชุด 8 รายการ</div>
                                      <div style={{ fontSize: 10, color: GRAY, marginTop: 1 }}>แอพ Atlas HomeCare · บันทึกโดย {en.staff} · กดบันทึกครั้งเดียว</div>
                                    </div>
                                    <span style={{ fontSize: 10.5, color: '#8E8E93', flexShrink: 0 }}>{en.time} น.</span>
                                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={{ flexShrink: 0, transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'none' }}>
                                      <path d="M1 1L5 5L9 1" stroke="#8E8E93" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                  </div>
                                  {isOpen && (
                                    <div style={{ padding: '2px 14px 12px' }}>
                                      {en.vitals.map((v, vi) => (
                                        <div key={vi} style={{
                                          display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0',
                                          borderTop: vi > 0 ? '1px solid rgba(0,0,0,0.04)' : 'none',
                                        }}>
                                          {VITAL_ROW_ICONS[v.label] && <img src={VITAL_ROW_ICONS[v.label]} alt="" style={{ width: 13, height: 13, flexShrink: 0, filter: 'grayscale(1) brightness(0.65)' }} />}
                                          <span style={{ fontSize: 11.5, fontWeight: 600, color: BLACK, width: 118, flexShrink: 0 }}>{v.label}</span>
                                          <span style={{ fontSize: 10, color: '#9291A5', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.dev}</span>
                                          {srcChip(v.dev !== 'กรอกเอง')}
                                          <span className="num" style={{ fontSize: 12.5, fontWeight: 700, color: BLACK, marginLeft: 6, whiteSpace: 'nowrap' }}>{v.value} <span style={{ fontSize: 9.5, fontWeight: 400, color: '#9291A5' }}>{v.unit}</span></span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })()
                          ) : (
                            /* ── แถววัดเองผ่าน My Atlas: ทีละค่า ไม่พร้อมกัน ── */
                            <div key={en.id} style={{
                              display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px',
                              background: '#fff', borderRadius: 14, border: '1px solid rgba(0,0,0,0.04)',
                            }}>
                              <img src={logoMyAtlas} alt="" style={{ width: 20, height: 20, borderRadius: '50%', objectFit: 'contain', flexShrink: 0 }} />
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                  {VITAL_ROW_ICONS[en.metric] && <img src={VITAL_ROW_ICONS[en.metric]} alt="" style={{ width: 12, height: 12, flexShrink: 0, filter: 'grayscale(1) brightness(0.65)' }} />}
                                  <span style={{ fontSize: 12, fontWeight: 600, color: BLACK }}>{en.metric}</span>
                                  {en.again && <span style={{ fontSize: 9, fontWeight: 600, color: '#0088FF', background: 'rgba(0,136,255,0.1)', padding: '1px 6px', borderRadius: 100 }}>วัดซ้ำ</span>}
                                </div>
                                <div style={{ fontSize: 10, color: '#9291A5', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>แอพ My Atlas · {en.dev}</div>
                              </div>
                              {srcChip(en.auto)}
                              <span className="num" style={{ fontSize: 13, fontWeight: 700, color: BLACK, whiteSpace: 'nowrap' }}>{en.value} <span style={{ fontSize: 9.5, fontWeight: 400, color: '#9291A5' }}>{en.unit}</span></span>
                              <span style={{ fontSize: 10.5, color: '#8E8E93', flexShrink: 0, width: 46, textAlign: 'right' }}>{en.time} น.</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ));
                  })()}
                </div>

                {/* Pagination */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, paddingTop: 12, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                  <span style={{ fontSize: 11, color: GRAY }}>แสดง {startItem}-{endItem} จาก {totalItems} รายการ</span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button
                      className="hover-btn"
                      onClick={() => setHistoryPage(p => Math.max(1, p - 1))}
                      style={{ width: 24, height: 24, borderRadius: '50%', border: '1px solid rgba(0,0,0,0.08)', background: '#fff', cursor: 'pointer', fontSize: 12, color: GRAY, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      {'‹'}
                    </button>
                    <span style={{
                      minWidth: 52, height: 24, borderRadius: 100, padding: '0 10px',
                      background: 'rgba(0,0,0,0.04)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 600, fontFamily: font, color: GRAY,
                    }}>{historyPage} / {totalPages}</span>
                    <button
                      className="hover-btn"
                      onClick={() => setHistoryPage(p => Math.min(totalPages, p + 1))}
                      style={{ width: 24, height: 24, borderRadius: '50%', border: '1px solid rgba(0,0,0,0.08)', background: '#fff', cursor: 'pointer', fontSize: 12, color: GRAY, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      {'›'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Tab 2: ประวัติการเยี่ยมบ้าน ── */}
          {activeTab === 1 && (
            <div className="anim-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '100%' }}>
              {/* Hero banner — green gradient */}
              <div style={{
                background: 'linear-gradient(175deg, #19A589 0%, #0D7C66 100%)',
                borderRadius: 16, padding: 16, position: 'relative', overflow: 'hidden',
                backdropFilter: 'blur(10px)', boxShadow: '0 4px 4px rgba(0,0,0,0.1)',
                display: 'flex', gap: 16, alignItems: 'center',
              }}>
                <img src={imgHomevisitHero3d} alt="" style={{ position: 'absolute', left: 16, top: 16, width: 80, height: 80, objectFit: 'cover', pointerEvents: 'none' }} />
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 96 }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'white', fontFamily: font }}>ประวัติการเยี่ยมบ้าน</div>
                    <div style={{ fontSize: 12, color: 'white', fontFamily: font, marginTop: 4 }}>ข้อมูลบันทึกการเยี่ยมบ้าน</div>
                  </div>
                  <div style={{
                    backdropFilter: 'blur(2px)', background: 'rgba(255,255,255,0.8)',
                    border: '1px solid white', borderRadius: 100, padding: '4px 16px',
                    height: 36, display: 'flex', alignItems: 'center', gap: 8,
                    fontSize: 12, fontFamily: font, cursor: 'pointer',
                  }}>
                    <span>2569</span>
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="#8E8E93" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                </div>
              </div>

              {/* ═ 2 คอลัมน์ 1:2 ตาม Figma 546:3601 — สกรอลล์แยกซ้าย/ขวา (ทั้งหน้าไม่เลื่อน) ═ */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16, alignItems: 'stretch', flex: 1, minHeight: 0 }}>

                {/* ── ซ้าย: timeline รายการเยี่ยม (สกรอลล์ของตัวเอง ไม่โชว์แถบ) — เผื่อขอบให้เงาการ์ดไม่โดน clip ── */}
                <div className="no-scrollbar" style={{ display: 'flex', flexDirection: 'column', minWidth: 0, overflowY: 'auto', padding: '12px 12px 0 16px', margin: '-12px -8px 0 -16px' }}>
                  {homeVisitData.map((group, gi) => (
                    <div key={gi}>
                      <div style={{ padding: '8px 0', fontSize: 12, fontWeight: 500, color: 'black', fontFamily: font }}>{group.month}</div>
                      {group.visits.map((visit, vi) => {
                        const isSel = selVisit === visit;
                        return (
                          <div key={vi} style={{ display: 'flex', gap: 10 }}>
                            {/* จุดวันที่ — ใบที่เลือกเป็นเขียว gradient ตามแบบ */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, paddingBottom: 12 }}>
                              <div style={{
                                width: 56, height: 56, borderRadius: 16, flexShrink: 0,
                                background: isSel ? 'linear-gradient(135deg, #19A589, #0D7C66)' : 'rgba(255,255,255,0.5)',
                                backdropFilter: isSel ? 'none' : 'blur(5px)',
                                border: isSel ? 'none' : '1px solid rgba(255,255,255,0.6)',
                                boxShadow: isSel ? '0 4px 12px rgba(25,165,137,0.35)' : '0 1px 4px rgba(13,10,44,0.05)',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1,
                                transition: 'all 0.25s ease',
                              }}>
                                <span style={{ fontSize: 8, color: isSel ? 'rgba(255,255,255,0.85)' : '#8E8E93', fontFamily: font }}>{visit.monthShort}</span>
                                <span style={{ fontSize: 17, fontWeight: 700, color: isSel ? 'white' : '#1E1B39', fontFamily: font, lineHeight: 1.1 }}>{visit.day}</span>
                                <span style={{ fontSize: 7.5, color: isSel ? 'rgba(255,255,255,0.85)' : '#8E8E93', fontFamily: font }}>{visit.time}</span>
                              </div>
                              <div style={{ width: 0, flex: 1, minHeight: 14, borderLeft: '1.5px dashed rgba(25,165,137,0.35)' }} />
                            </div>

                            {/* การ์ดรายการ (ย่อ) — คลิกเพื่อแสดงรายละเอียดฝั่งขวา */}
                            <div
                              className="hover-visit-card"
                              onClick={() => setSelVisit(visit)}
                              style={{
                                flex: 1, minWidth: 0, borderRadius: 16, padding: '13px 14px', cursor: 'pointer', marginBottom: 12,
                                background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(5px)',
                                border: `1.5px solid ${isSel ? '#19A589' : 'rgba(255,255,255,0.6)'}`,
                                boxShadow: isSel ? '0 6px 18px rgba(25,165,137,0.15)' : '0 1px 4px rgba(13,10,44,0.05)',
                                transition: 'all 0.25s ease',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
                                <span style={{ fontSize: 14, fontWeight: 600, color: '#1E1B39', fontFamily: font }}>{visit.type}</span>
                                <span style={{
                                  width: 24, height: 24, borderRadius: 100, flexShrink: 0,
                                  background: isSel ? 'rgba(25,165,137,0.12)' : '#F2F2F7',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                  <svg width="7" height="10" viewBox="0 0 7 10" fill="none"><path d="M1 1L5 5L1 9" stroke={isSel ? '#0D7C66' : '#8E8E93'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                </span>
                              </div>
                              <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 8 }}>
                                <img src={ppStethoscope} alt="" style={{ width: 14, height: 12, flexShrink: 0 }} />
                                <span className="truncate" style={{ fontSize: 10, color: '#8E8E93', fontFamily: font }}>ผู้เยี่ยม: {visit.visitor}</span>
                              </div>
                              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                {visit.tags.slice(0, 2).map((tag, ti) => (
                                  <span key={ti} style={{
                                    fontSize: 10, color: '#0D7C66', fontFamily: font,
                                    background: 'rgba(25,165,137,0.15)', borderRadius: 100, padding: '3px 10px',
                                  }}>{tag}</span>
                                ))}
                                {visit.tags.length > 2 && (
                                  <span style={{ fontSize: 10, color: '#8E8E93', fontFamily: font, padding: '3px 4px' }}>+{visit.tags.length - 2}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>

                {/* ── ขวา: รายละเอียดการเยี่ยมที่เลือก ── */}
                {selVisit && (
                  <div className="anim-tab-enter no-scrollbar" key={`${selVisit.day}-${selVisit.time}`} style={{
                    background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(5px)',
                    border: '1px solid rgba(255,255,255,0.5)', borderRadius: 24, padding: 16,
                    boxShadow: '0 2px 6px rgba(13,10,44,0.08)', minWidth: 0,
                    display: 'flex', flexDirection: 'column', gap: 14,
                    overflowY: 'auto',
                  }}>
                    {/* หัว: ไอคอนเขียว + ชื่อ + วันเวลา */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 14, background: 'linear-gradient(135deg, #19A589, #0D7C66)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <img src={ppHeaderIcon} alt="" style={{ width: 20, height: 20 }} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 16, fontWeight: 700, color: '#1E1B39', fontFamily: font }}>รายละเอียดการเยี่ยมบ้าน</div>
                        <div style={{ fontSize: 12, color: '#615E83', fontFamily: font, marginTop: 1 }}>{selVisit.detail.datetime.replace(' - ', ' เวลา ')}</div>
                      </div>
                    </div>
                    <div style={{ height: 1, background: 'rgba(30,27,57,0.07)' }} />

                    {/* ตาราง 2 คอลัมน์: ประเภท/HN · เจ้าหน้าที่/วัน-เวลา */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 16px' }}>
                      {[['ประเภทการเยี่ยม', selVisit.type], ['HN', selVisit.detail.hn], ['เจ้าหน้าที่', selVisit.visitor], ['วัน-เวลา', selVisit.detail.datetime]].map(([lb, v]) => (
                        <div key={lb} style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 12, color: 'black', fontFamily: font, opacity: 0.75 }}>{lb}</div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: 'black', fontFamily: font, marginTop: 3 }}>{v}</div>
                        </div>
                      ))}
                    </div>

                    {/* ภารกิจ/วัตถุประสงค์ — การ์ดน้ำเงิน gradient ตัวอักษรขาวตามแบบ */}
                    <div style={{
                      background: 'linear-gradient(139deg, #3B82F6, #1D4ED8)', borderRadius: 18,
                      padding: '14px 16px', color: 'white',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <span style={{ width: 3.5, height: 16, borderRadius: 2, background: 'white', flexShrink: 0 }} />
                        <span style={{ fontSize: 14, fontWeight: 700, fontFamily: font }}>ภารกิจ/วัตถุประสงค์การเยี่ยม</span>
                      </div>
                      <div style={{ fontSize: 13, fontFamily: font, lineHeight: 1.85 }}>{selVisit.detail.mission}</div>
                    </div>

                    {/* ข้อมูลทางการแพทย์ — หัวข้อแถบส้มแดง + เนื้อหาดำ */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <span style={{ width: 3.5, height: 16, borderRadius: 2, background: '#E8432A', flexShrink: 0 }} />
                        <span style={{ fontSize: 14, fontWeight: 700, color: '#1E1B39', fontFamily: font }}>ข้อมูลทางการแพทย์</span>
                      </div>
                      <div style={{ fontSize: 13, color: '#1E1B39', fontFamily: font, lineHeight: 1.85, whiteSpace: 'pre-line' }}>{selVisit.detail.medical}</div>
                    </div>

                    {/* สาเหตุการส่งเยี่ยม / วัตถุประสงค์ / ปัญหาสุขภาพ */}
                    {[['สาเหตุการส่งเยี่ยม', selVisit.detail.reason], ['ปัญหาสุขภาพ', selVisit.detail.healthIssue]].map(([t, c]) => (
                      <div key={t} style={{ background: 'white', border: '1px solid rgba(30,27,57,0.06)', borderRadius: 16, padding: '13px 15px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
                          <span style={{ width: 3.5, height: 15, borderRadius: 2, background: '#19A589', flexShrink: 0 }} />
                          <span style={{ fontSize: 13.5, fontWeight: 700, color: '#1E1B39', fontFamily: font }}>{t}</span>
                        </div>
                        <div style={{ fontSize: 13, color: '#1E1B39', fontFamily: font, lineHeight: 1.8 }}>{c}</div>
                      </div>
                    ))}
                    <div style={{ background: 'white', border: '1px solid rgba(30,27,57,0.06)', borderRadius: 16, padding: '13px 15px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
                        <span style={{ width: 3.5, height: 15, borderRadius: 2, background: '#19A589', flexShrink: 0 }} />
                        <span style={{ fontSize: 13.5, fontWeight: 700, color: '#1E1B39', fontFamily: font }}>วัตถุประสงค์การเยี่ยม</span>
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                        <img src={ppCheckmarkCircle} alt="" style={{ width: 18, height: 18, flexShrink: 0, marginTop: 2 }} />
                        <div style={{ fontSize: 13, color: '#1E1B39', fontFamily: font, lineHeight: 1.8 }}>{selVisit.detail.objective}</div>
                      </div>
                    </div>

                    {/* ข้อมูลด้านสังคมและสิ่งแวดล้อม */}
                    <div style={{ background: 'white', border: '1px solid rgba(30,27,57,0.06)', borderRadius: 16, padding: '13px 15px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                        <span style={{ width: 3.5, height: 15, borderRadius: 2, background: '#19A589', flexShrink: 0 }} />
                        <span style={{ fontSize: 13.5, fontWeight: 700, color: '#1E1B39', fontFamily: font }}>ข้อมูลด้านสังคมและสิ่งแวดล้อม</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 16px' }}>
                        {[['จำนวนสมาชิกในบ้าน', selVisit.detail.social.members], ['รายได้ครัวเรือน', selVisit.detail.social.income], ['สวัสดิการ', selVisit.detail.social.welfare], ['ปัญหาสุขภาพจิต/พฤติกรรมเสี่ยง', selVisit.detail.social.mental]].map(([lb, v]) => (
                          <div key={lb} style={{ minWidth: 0 }}>
                            <div style={{ fontSize: 11.5, color: '#615E83', fontFamily: font }}>{lb}</div>
                            <div style={{ fontSize: 13, fontWeight: 500, color: '#1E1B39', fontFamily: font, marginTop: 3, lineHeight: 1.6 }}>{v}</div>
                          </div>
                        ))}
                        <div style={{ gridColumn: '1 / -1' }}>
                          <div style={{ fontSize: 11.5, color: '#615E83', fontFamily: font }}>ลักษณะสิ่งแวดล้อมบ้าน</div>
                          <div style={{ fontSize: 13, fontWeight: 500, color: '#1E1B39', fontFamily: font, marginTop: 3, lineHeight: 1.6 }}>{selVisit.detail.social.env}</div>
                        </div>
                      </div>
                    </div>

                    {/* ข้อมูลคัดกรอง */}
                    <div style={{ background: 'white', border: '1px solid rgba(30,27,57,0.06)', borderRadius: 16, padding: '13px 15px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                        <span style={{ width: 3.5, height: 15, borderRadius: 2, background: '#19A589', flexShrink: 0 }} />
                        <span style={{ fontSize: 13.5, fontWeight: 700, color: '#1E1B39', fontFamily: font }}>ข้อมูลคัดกรอง</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10 }}>
                        {selVisit.detail.screening.map((sc, i) => {
                          const j = judgeScreening(sc.label, sc.value);
                          return (
                            <div key={i} style={{
                              background: j ? `${j.color}0D` : 'white',
                              border: `1px solid ${j ? `${j.color}40` : 'rgba(30,27,57,0.06)'}`,
                              borderRadius: 14, padding: '10px 12px',
                            }}>
                              <div style={{ fontSize: 11, color: '#615E83', fontFamily: font }}>{sc.label}</div>
                              <div className="num" style={{ fontSize: 14, fontWeight: 700, color: j ? j.color : '#1E1B39', fontFamily: font, marginTop: 3 }}>{sc.value}</div>
                              {j && <div style={{ fontSize: 9, fontWeight: 700, color: j.color, fontFamily: font, marginTop: 2 }}>⚠ {j.text}</div>}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* บันทึกการเยี่ยมบ้าน */}
                    <div style={{ background: 'white', border: '1px solid rgba(30,27,57,0.06)', borderRadius: 16, padding: '13px 15px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                        <span style={{ width: 3.5, height: 15, borderRadius: 2, background: '#19A589', flexShrink: 0 }} />
                        <span style={{ fontSize: 13.5, fontWeight: 700, color: '#1E1B39', fontFamily: font }}>บันทึกการเยี่ยมบ้าน</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {selVisit.detail.notes.map((note, i) => (
                          <div key={i} style={{ background: 'white', border: '1px solid rgba(30,27,57,0.06)', borderRadius: 14, padding: '11px 13px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
                              <img src={NOTE_ICONS[note.icon]} alt="" style={{ width: 12, height: 14 }} />
                              <span style={{ fontSize: 11.5, fontWeight: 600, color: '#615E83', fontFamily: font }}>{note.label}</span>
                            </div>
                            <div style={{ fontSize: 13, color: '#1E1B39', fontFamily: font, lineHeight: 1.75 }}>{note.value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Tab 3: ประวัติการประเมิน ── */}
          {activeTab === 2 && (
            <div className="anim-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '100%' }}>
              {/* Hero banner — purple gradient */}
              <div style={{
                background: 'linear-gradient(175deg, #8B5CF6 0%, #7C3AED 100%)',
                borderRadius: 16, padding: 16, position: 'relative', overflow: 'hidden',
                backdropFilter: 'blur(10px)', boxShadow: '0 4px 4px rgba(0,0,0,0.1)',
                display: 'flex', gap: 16, alignItems: 'center', flexShrink: 0,
              }}>
                <img src={imgAssessHero3d} alt="" style={{ position: 'absolute', left: 16, top: 16, width: 80, height: 80, objectFit: 'cover', pointerEvents: 'none' }} />
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 96 }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'white', fontFamily: font }}>ประวัติการประเมิน</div>
                    <div style={{ fontSize: 12, color: 'white', fontFamily: font, marginTop: 4 }}>ผลการประเมิน</div>
                  </div>
                  <div style={{
                    backdropFilter: 'blur(2px)', background: 'rgba(255,255,255,0.8)',
                    border: '1px solid white', borderRadius: 100, padding: '4px 16px',
                    height: 36, display: 'flex', alignItems: 'center', gap: 8,
                    fontSize: 12, fontFamily: font, cursor: 'pointer',
                  }}>
                    <span>2569</span>
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="#8E8E93" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                </div>
              </div>

              {/* ═ 2 คอลัมน์ 1:2 — โครงเดียวกับหน้าประวัติการเยี่ยมบ้าน · สกรอลล์แยก ═ */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16, alignItems: 'stretch', flex: 1, minHeight: 0 }}>

                {/* ── ซ้าย: timeline รายการประเมิน ── */}
                <div className="no-scrollbar" style={{ display: 'flex', flexDirection: 'column', minWidth: 0, overflowY: 'auto', padding: '12px 12px 0 16px', margin: '-12px -8px 0 -16px' }}>
                  {assessmentData.map((group, gi) => (
                    <div key={gi}>
                      <div style={{ padding: '8px 0', fontSize: 12, fontWeight: 500, color: 'black', fontFamily: font }}>{group.month}</div>
                      {group.items.map((item, ii) => {
                        const isSel = selAssess === item;
                        return (
                          <div key={ii} style={{ display: 'flex', gap: 10 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, paddingBottom: 12 }}>
                              <div style={{
                                width: 56, height: 56, borderRadius: 16, flexShrink: 0,
                                background: isSel ? 'linear-gradient(135deg, #8B5CF6, #7C3AED)' : 'rgba(255,255,255,0.5)',
                                backdropFilter: isSel ? 'none' : 'blur(5px)',
                                border: isSel ? 'none' : '1px solid rgba(255,255,255,0.6)',
                                boxShadow: isSel ? '0 4px 12px rgba(139,92,246,0.35)' : '0 1px 4px rgba(13,10,44,0.05)',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1,
                                transition: 'all 0.25s ease',
                              }}>
                                <span style={{ fontSize: 8, color: isSel ? 'rgba(255,255,255,0.85)' : '#8E8E93', fontFamily: font }}>{item.monthShort}</span>
                                <span style={{ fontSize: 17, fontWeight: 700, color: isSel ? 'white' : '#1E1B39', fontFamily: font, lineHeight: 1.1 }}>{item.day}</span>
                              </div>
                              <div style={{ width: 0, flex: 1, minHeight: 14, borderLeft: '1.5px dashed rgba(139,92,246,0.35)' }} />
                            </div>

                            <div
                              className="hover-assess-card"
                              onClick={() => setSelAssess(item)}
                              style={{
                                flex: 1, minWidth: 0, borderRadius: 16, padding: '13px 14px', cursor: 'pointer', marginBottom: 12,
                                background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(5px)',
                                border: `1.5px solid ${isSel ? '#8B5CF6' : 'rgba(255,255,255,0.6)'}`,
                                boxShadow: isSel ? '0 6px 18px rgba(139,92,246,0.15)' : '0 1px 4px rgba(13,10,44,0.05)',
                                transition: 'all 0.25s ease',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 7 }}>
                                {/* ชื่อยาวตัดเหลือบรรทัดเดียว */}
                                <span className="truncate" style={{ flex: 1, minWidth: 0, fontSize: 13, fontWeight: 600, color: '#1E1B39', fontFamily: font }}>{item.title}</span>
                                <span style={{
                                  width: 24, height: 24, borderRadius: 100, flexShrink: 0,
                                  background: isSel ? 'rgba(139,92,246,0.12)' : '#F2F2F7',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                  <svg width="7" height="10" viewBox="0 0 7 10" fill="none"><path d="M1 1L5 5L1 9" stroke={isSel ? '#7C3AED' : '#8E8E93'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                </span>
                              </div>
                              <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 8 }}>
                                <img src={ppStethoscope} alt="" style={{ width: 14, height: 12, flexShrink: 0 }} />
                                <span className="truncate" style={{ fontSize: 10, color: '#8E8E93', fontFamily: font }}>ผู้ประเมิน: {item.assessor}</span>
                              </div>
                              <span style={{
                                fontSize: 10, fontFamily: font, borderRadius: 100, padding: '4px 10px',
                                color: item.status === 'ประเมินแล้ว' ? '#34C759' : item.status === 'รอประเมิน' ? '#FF9500' : '#8E8E93',
                                background: item.status === 'ประเมินแล้ว' ? 'rgba(52,199,89,0.2)' : item.status === 'รอประเมิน' ? 'rgba(255,149,0,0.15)' : 'rgba(142,142,147,0.1)',
                              }}>{item.status}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>

                {/* ── ขวา: รายละเอียดการประเมินที่เลือก ── */}
                {selAssess && (
                  <div className="anim-tab-enter no-scrollbar" key={`${selAssess.title}-${selAssess.datetime}`} style={{
                    background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(5px)',
                    border: '1px solid rgba(255,255,255,0.5)', borderRadius: 24, padding: 16,
                    boxShadow: '0 2px 6px rgba(13,10,44,0.08)', minWidth: 0,
                    display: 'flex', flexDirection: 'column', gap: 14,
                    overflowY: 'auto',
                  }}>
                    {/* หัว: ไอคอนม่วง + ชื่อแบบประเมิน + วันเวลา */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 14, background: '#6658E1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <img src={ppPencilClipboard} alt="" style={{ width: 20, height: 20 }} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 16, fontWeight: 700, color: '#1E1B39', fontFamily: font }}>{selAssess.title}</div>
                        <div style={{ fontSize: 12, color: '#615E83', fontFamily: font, marginTop: 1 }}>{selAssess.datetime}</div>
                      </div>
                    </div>
                    <div style={{ height: 1, background: 'rgba(30,27,57,0.07)' }} />

                    {/* ข้อมูลทั่วไป 2 คอลัมน์ */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 16px' }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 12, color: 'black', fontFamily: font, opacity: 0.75 }}>ผู้ประเมิน</div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'black', fontFamily: font, marginTop: 3 }}>{selAssess.assessor}</div>
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 12, color: 'black', fontFamily: font, opacity: 0.75 }}>สถานะ</div>
                        <span style={{
                          display: 'inline-block', marginTop: 4,
                          fontSize: 11, fontWeight: 600, fontFamily: font, borderRadius: 100, padding: '4px 12px',
                          color: selAssess.status === 'ประเมินแล้ว' ? '#34C759' : '#FF9500',
                          background: selAssess.status === 'ประเมินแล้ว' ? 'rgba(52,199,89,0.15)' : 'rgba(255,149,0,0.12)',
                        }}>{selAssess.status}</span>
                      </div>
                    </div>

                    {/* การ์ดคะแนน — gradient ตามระดับผล (แบบเดียวกับ popup เดิม) */}
                    {selAssess.score !== null ? (
                      <div style={{
                        borderRadius: 16, padding: 16, position: 'relative', overflow: 'hidden',
                        background: selAssess.gradient,
                        display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center',
                      }}>
                        <img src={selAssess.img} alt="" style={{
                          position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)',
                          width: 125, height: 125, objectFit: 'contain', pointerEvents: 'none',
                        }} />
                        <div style={{ fontSize: 12, color: 'white', fontFamily: font, fontWeight: 500, letterSpacing: 0.22, marginBottom: 2 }}>คะแนน</div>
                        <div style={{ fontSize: 48, fontWeight: 700, color: 'white', fontFamily: font, textShadow: '0 4px 4px rgba(0,0,0,0.25)', lineHeight: 1 }}>{selAssess.score}</div>
                        <div style={{
                          marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 10,
                          background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255,255,255,0.2)', borderRadius: 100,
                          padding: '4px 10px', boxShadow: '0 4px 4px rgba(0,0,0,0.05)',
                        }}>
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="white" strokeWidth="1.2"/><path d="M7 4V7.5M7 9.5V10" stroke="white" strokeWidth="1.2" strokeLinecap="round"/></svg>
                          <span style={{ fontSize: 12, color: 'white', fontFamily: font }}>{selAssess.result}</span>
                        </div>
                      </div>
                    ) : (
                      /* ยังไม่ประเมิน — การ์ดสถานะรอ */
                      <div style={{
                        borderRadius: 16, padding: '22px 16px', position: 'relative', overflow: 'hidden',
                        background: 'white', border: '1.5px dashed rgba(255,149,0,0.4)',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, textAlign: 'center',
                      }}>
                        <img src={selAssess.img} alt="" style={{ width: 72, height: 72, objectFit: 'contain', opacity: 0.9 }} />
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#FF9500', fontFamily: font }}>รอประเมิน</div>
                        <div style={{ fontSize: 12, color: '#615E83', fontFamily: font }}>{selAssess.datetime}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Tab 4: ติดตามการทานยา ── */}
          {activeTab === 3 && rxDetail && (
            <div className="anim-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Header with view toggle */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button className="hover-btn" onClick={() => { setRxDetail(null); setRxCalendarMode(false); }} style={{
                    background: 'rgba(116,116,128,0.08)', border: 'none', borderRadius: 100,
                    padding: '4px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
                  }}>
                    <svg width="8" height="11" viewBox="0 0 8 11" fill="none"><path d="M7 1L2 5.5L7 10" stroke="#8E8E93" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <span style={{ fontSize: 12, color: '#8E8E93', fontFamily: font }}>กลับ</span>
                  </button>
                  <span style={{ fontSize: 16, fontWeight: 700, color: 'black', fontFamily: font }}>แผนการทานยา</span>
                </div>
                {/* View toggle: list / calendar */}
                <div style={{ background: 'rgba(255,255,255,0.5)', borderRadius: 100, padding: 4, display: 'flex', gap: 8, height: 36, alignItems: 'center' }}>
                  <div onClick={() => setRxCalendarMode(false)} style={{
                    width: 28, height: 28, borderRadius: 100, cursor: 'pointer',
                    background: !rxCalendarMode ? '#0088FF' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <img src={iconMedList} alt="" style={{ width: 15, height: 14, filter: !rxCalendarMode ? 'brightness(10)' : 'none' }} />
                  </div>
                  <div onClick={() => setRxCalendarMode(true)} style={{
                    width: 28, height: 28, borderRadius: 100, cursor: 'pointer',
                    background: rxCalendarMode ? '#0088FF' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <img src={iconMedCalendar} alt="" style={{ width: 16, height: 14, filter: rxCalendarMode ? 'brightness(10)' : 'none' }} />
                  </div>
                </div>
              </div>

              {/* ── List mode ── */}
              {!rxCalendarMode && (rxDetail.medList || []).map((med, mi) => (
                <MedCard key={mi} med={med} defaultOpen={mi === 0} />
              ))}

              {/* ── Calendar mode ── */}
              {rxCalendarMode && (() => {
                const DAYS = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];
                const firstDayOfWeek = 2; // April 2569 starts on Wednesday (0=Sun)
                const daysInMonth = 30;
                const prevDays = [29, 30, 31].slice(3 - firstDayOfWeek);
                const cells = [];
                prevDays.forEach(d => cells.push({ day: d, out: true }));
                for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, out: false });
                const remaining = 7 - (cells.length % 7); if (remaining < 7) for (let d = 1; d <= remaining; d++) cells.push({ day: d, out: true });

                // Mock daily med status: array of [morning, noon, evening, night] per day
                const dayStatus = {
                  1: ['g','g','g','g'], 2: ['g','g','g','g'], 3: ['g','g','g','g'], 4: ['g','g','g','g'],
                  5: ['r','g','g','g'], 6: ['g','g','r','w'], 7: ['o','o','g','g'],
                  9: ['g','r','g','w'], 10: ['o','g','g','g'], 11: ['o','g','g','g'],
                };
                const dotColors = { g: '#34C759', r: '#FF3B30', o: '#FF9500', w: '#8E8E93' };

                // Med data for selected day
                const selectedMeds = [
                  { name: 'Clopidogrel 75 mg', dose: 'รับประทานครั้งละ 1 เม็ด', times: [
                    { slot: 0, s: 'check' }, { slot: 1, s: 'check' },
                  ]},
                  { name: 'Omeprazole 20 mg', dose: 'รับประทานครั้งละ 1 เม็ด', times: [
                    { slot: 0, s: 'check' }, { slot: 2, s: 'x' },
                  ]},
                  { name: 'Aspirin 81 mg', dose: 'รับประทานครั้งละ 1 เม็ด', times: [
                    { slot: 0, s: 'check' },
                  ]},
                  { name: 'Atorvastatin 40 mg', dose: 'รับประทานครั้งละ 1 เม็ด', times: [
                    { slot: 3, s: 'x' },
                  ]},
                  { name: 'Ferrous Fumarate 200 mg', dose: 'รับประทานครั้งละ 1 เม็ด', times: [
                    { slot: 0, s: 'check' }, { slot: 1, s: 'check' }, { slot: 2, s: 'wait' },
                  ]},
                ];

                // Group meds by time slot for calendar view
                const bySlot = [[], [], [], []];
                selectedMeds.forEach(med => {
                  med.times.forEach(t => {
                    bySlot[t.slot].push({ ...med, status: t.s });
                  });
                });

                return (
                  <>
                    {/* Calendar */}
                    <div style={{ background: 'white', borderRadius: 16, padding: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 16 }}>
                      {/* Month + nav */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 16, fontWeight: 700, color: 'black', fontFamily: font }}>เมษายน 2569</span>
                        <div style={{ display: 'flex', gap: 10 }}>
                          <div style={{ width: 24, height: 24, borderRadius: 100, background: 'rgba(116,116,128,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                            <svg width="8" height="11" viewBox="0 0 8 11" fill="none"><path d="M7 1L2 5.5L7 10" stroke="#8E8E93" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          </div>
                          <div style={{ width: 24, height: 24, borderRadius: 100, background: 'rgba(116,116,128,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                            <svg width="8" height="11" viewBox="0 0 8 11" fill="none"><path d="M1 1L6 5.5L1 10" stroke="#8E8E93" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          </div>
                        </div>
                      </div>

                      {/* Day headers */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 16, textAlign: 'center' }}>
                        {DAYS.map(d => (
                          <span key={d} style={{ fontSize: 12, color: 'black', fontFamily: font }}>{d}</span>
                        ))}
                      </div>
                      <div style={{ height: 1, background: 'rgba(0,0,0,0.06)' }} />

                      {/* Calendar grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 16 }}>
                        {cells.map((c, ci) => {
                          const isSelected = !c.out && c.day === rxSelectedDay;
                          const status = !c.out ? dayStatus[c.day] : null;
                          return (
                            <div
                              key={ci}
                              onClick={() => !c.out && setRxSelectedDay(c.day)}
                              style={{
                                height: 90, borderRadius: 24, padding: 10,
                                background: isSelected ? 'linear-gradient(139deg, #3B82F6, #1D4ED8)' : 'rgba(116,116,128,0.08)',
                                display: 'flex', flexDirection: 'column', alignItems: 'center',
                                justifyContent: status ? 'space-between' : 'flex-start',
                                cursor: c.out ? 'default' : 'pointer',
                              }}
                            >
                              <span style={{
                                fontSize: 16, fontWeight: 600, fontFamily: font, width: '100%', textAlign: 'center',
                                color: isSelected ? 'white' : 'black',
                                opacity: c.out ? 0.5 : 1,
                              }}>{c.day}</span>
                              {status && (
                                <div style={{ display: 'flex', gap: 3 }}>
                                  {status.map((s, si) => (
                                    <div key={si} style={{ width: 6, height: 6, borderRadius: '50%', background: dotColors[s] || '#CCC' }} />
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Daily meds for selected day */}
                    <span style={{ fontSize: 16, fontWeight: 700, color: BLACK, fontFamily: font }}>รายการทานยาประจำวัน</span>

                    {MED_TIMES.map((timeSlot, ti) => {
                      const meds = bySlot[ti];
                      if (!meds.length) return null;
                      return (
                        <div key={ti} style={{ background: 'white', borderRadius: 16, padding: 16, overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column', gap: 16 }}>
                          {/* Time-of-day 3D image */}
                          <img src={timeSlot.img} alt="" style={{ position: 'absolute', top: 0, right: 0, width: 70, height: 70, objectFit: 'cover', pointerEvents: 'none' }} />
                          {/* Time header */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 0, height: 14, borderLeft: '3px solid #0088FF' }} />
                            <span style={{ fontSize: 14, fontWeight: 600, color: 'black', fontFamily: font }}>{timeSlot.label}</span>
                            <span style={{ fontSize: 10, color: '#8E8E93', fontFamily: font, padding: '4px 10px' }}>{timeSlot.time}</span>
                          </div>
                          {/* Med cards */}
                          {meds.map((med, mi) => (
                            <div key={mi} style={{ background: 'white', border: '1px solid rgba(116,116,128,0.08)', borderRadius: 16, padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <div style={{ width: 40, height: 40, borderRadius: 100, padding: 6, background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <img src={imgMedPill3d} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                  </div>
                                  <span style={{ fontSize: 14, fontWeight: 500, color: 'black', fontFamily: font }}>{med.name}</span>
                                </div>
                                <img src={MED_STATUS_ICON[med.status]} alt="" style={{ width: 16, height: 16 }} />
                              </div>
                              <span style={{ fontSize: 12, color: '#8E8E93', fontFamily: font }}>{med.dose}</span>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </>
                );
              })()}
            </div>
          )}
          {activeTab === 3 && !rxDetail && (
            <div className="anim-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Hero banner */}
              <div style={{
                background: 'linear-gradient(102deg, #33C360 4%, #1EA84C 100%)',
                borderRadius: 16, padding: 16, position: 'relative', overflow: 'hidden',
                backdropFilter: 'blur(10px)', boxShadow: '0 4px 4px rgba(0,0,0,0.1)',
              }}>
                {/* 3D image — absolute left */}
                <img src={imgMedPrescription3d} alt="" style={{ position: 'absolute', left: 16, top: 16, width: 80, height: 80, objectFit: 'cover', pointerEvents: 'none' }} />
                {/* Content offset from image */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 96 }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'white', fontFamily: font }}>ใบสั่งยา</div>
                    <div style={{ fontSize: 12, color: 'white', fontFamily: font, marginTop: 4 }}>ติดตามข้อมูลการทานยา</div>
                  </div>
                  <div style={{
                    backdropFilter: 'blur(2px)', background: 'rgba(255,255,255,0.8)',
                    border: '1px solid white', borderRadius: 100, padding: '4px 16px',
                    height: 36, display: 'flex', alignItems: 'center', gap: 8,
                    fontSize: 12, fontFamily: font, cursor: 'pointer',
                  }}>
                    <span>2569</span>
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="#8E8E93" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {prescriptionData.map((group, gi) => (
                  <div key={gi}>
                    {/* Month header */}
                    <div style={{ padding: '8px 0', fontSize: 12, fontWeight: 500, color: 'black', fontFamily: font }}>{group.month}</div>

                    {/* Prescription cards */}
                    {group.items.map((rx, ri) => (
                      <div key={ri} style={{ display: 'flex', gap: 10 }}>
                        {/* Date column + line */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, paddingBottom: 12 }}>
                          <div style={{
                            width: 48, height: 48, borderRadius: 16,
                            background: 'linear-gradient(91deg, #33C360 4%, #1EA84C 100%)',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            gap: 4, flexShrink: 0,
                          }}>
                            <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.8)', fontFamily: font }}>{rx.monthShort}</span>
                            <span style={{ fontSize: 16, fontWeight: 700, color: 'white', fontFamily: font }}>{rx.day}</span>
                          </div>
                          <div style={{ width: 1, flex: 1, minHeight: 12, background: 'rgba(51,195,96,0.3)' }} />
                        </div>

                        {/* Card */}
                        <div className="hover-visit-card" onClick={() => setRxDetail(rx)} style={{
                          flex: 1, borderRadius: 16, padding: 16, position: 'relative', overflow: 'hidden',
                          border: '1px solid white', background: 'white', cursor: 'pointer', marginBottom: 12,
                        }}>
                          {/* 3D image */}
                          <img src={imgMedPrescription3d} alt="" style={{ position: 'absolute', bottom: -11, right: -11, width: 80, height: 80, objectFit: 'cover', opacity: 0.5, pointerEvents: 'none' }} />

                          {/* VN + arrow */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                            <span style={{ fontSize: 14, fontWeight: 500, color: 'black', fontFamily: font }}>{rx.vn}</span>
                            <button style={{
                              width: 24, height: 24, borderRadius: 100, border: 'none', cursor: 'pointer',
                              background: '#F2F2F7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                            }}>
                              <svg width="7" height="10" viewBox="0 0 7 10" fill="none"><path d="M1 1L5 5L1 9" stroke="#8E8E93" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </button>
                          </div>

                          {/* Info rows */}
                          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                              <img src={ppStethoscope} alt="" style={{ width: 14, height: 12 }} />
                              <span style={{ fontSize: 10, color: '#8E8E93', fontFamily: font }}>วันที่รับบริการ: {rx.serviceDate}</span>
                            </div>
                            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                              <img src={ppStethoscope} alt="" style={{ width: 14, height: 12 }} />
                              <span style={{ fontSize: 10, color: '#8E8E93', fontFamily: font }}>วันที่ส่งข้อมูล: {rx.sendDate}</span>
                            </div>
                            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                              <img src={ppStethoscope} alt="" style={{ width: 14, height: 12 }} />
                              <span style={{ fontSize: 10, color: '#8E8E93', fontFamily: font }}>ผู้ส่งข้อมูล: {rx.sender}</span>
                            </div>
                          </div>

                          {/* Medication pill badge */}
                          <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: 10,
                            background: 'white', border: '1px solid rgba(0,136,255,0.5)',
                            borderRadius: 100, padding: '4px 10px',
                          }}>
                            <img src={ppPill} alt="" style={{ width: 10, height: 10 }} />
                            <span style={{ fontSize: 10, color: '#0088FF', fontFamily: font, maxWidth: 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rx.meds}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
          </div>{/* end scrollable */}
        </div>{/* end main content */}
      </div>{/* end 2-column flex */}
      {/* ── Assessment Detail Popup ── */}
      {/* ป๊อปอัพดูเพิ่มเติมของ vital — key ตาม metric ให้รีเซ็ตช่วงเวลาเมื่อเปิดใบใหม่ */}
      {metricDetail && DETAIL_CFG[metricDetail.label] && (
        <MetricDetailModal key={metricDetail.label} metric={metricDetail} onClose={() => setMetricDetail(null)} />
      )}
      {/* Prescription detail popup removed — now inline in Tab 4 */}
    </div>/* end root */
  );
}

/* ── Med Card with expandable schedule ── */
function MedCard({ med, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="hover-med-card" onClick={() => setOpen(!open)} style={{
      background: 'white', border: '1px solid rgba(116,116,128,0.08)',
      borderRadius: 16, padding: 16, display: 'flex', flexDirection: 'column', gap: 16,
      cursor: 'pointer',
    }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 100, padding: 6,
            background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <img src={imgMedPill3d} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <span style={{ fontSize: 14, fontWeight: 500, color: 'black', fontFamily: "'Sarabun', sans-serif" }}>{med.name}</span>
        </div>
        <span style={{
          fontSize: 10, color: '#0088FF', fontFamily: "'Sarabun', sans-serif",
          background: 'rgba(0,136,255,0.2)', borderRadius: 100, padding: '4px 10px',
        }}>จำนวน {med.qty} เม็ด</span>
      </div>

      {/* Dose + expand */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 12, color: '#8E8E93', fontFamily: "'Sarabun', sans-serif" }}>{med.dose}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 10, color: '#8E8E93', fontFamily: "'Sarabun', sans-serif" }}>ดูเพิ่มเติม</span>
          <svg width="10" height="7" viewBox="0 0 10 7" fill="none" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
            <path d="M1 1L5 5L9 1" stroke="#8E8E93" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {/* Schedule grid (expanded) */}
      {open && med.schedule && (
        <div className="anim-expand" style={{ background: 'rgba(0,136,255,0.05)', borderRadius: 16, padding: 16, display: 'flex', flexDirection: 'column', gap: 8, transformOrigin: 'top' }}>
          {/* Date label */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 0, height: 14, borderLeft: '3px solid #0088FF' }} />
            <span style={{ fontSize: 12, fontWeight: 500, color: 'black', fontFamily: "'Sarabun', sans-serif" }}>1 มกราคม 2569</span>
          </div>
          {/* Time cards grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {MED_TIMES.map((t, ti) => {
              const slot = med.schedule[ti];
              return (
                <div key={ti} style={{
                  background: 'white', borderRadius: 16, padding: 16, height: 80,
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                  position: 'relative', overflow: 'hidden',
                }}>
                  <img src={t.img} alt="" style={{ position: 'absolute', bottom: -10, right: -0.5, width: 70, height: 70, objectFit: 'cover', pointerEvents: 'none' }} />
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'black', fontFamily: "'Sarabun', sans-serif" }}>{t.label}</span>
                    <span style={{ fontSize: 10, color: '#8E8E93', fontFamily: "'Sarabun', sans-serif" }}>{t.time}</span>
                  </div>
                  {slot ? (
                    <img src={MED_STATUS_ICON[slot.s]} alt="" style={{ width: 16, height: 16 }} />
                  ) : (
                    <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'rgba(116,116,128,0.08)' }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
