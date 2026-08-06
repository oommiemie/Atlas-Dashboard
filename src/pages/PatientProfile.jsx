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
/* config ต่อ metric: เส้น เกณฑ์ โซนปกติ และพารามิเตอร์สร้างข้อมูลย้อนหลัง (last = ค่าล่าสุดต้องตรงหัวการ์ด) */
const DETAIL_CFG = {
  'ความดันโลหิต': {
    unit: 'mmHg', domain: [60, 180], ticks: [60, 90, 120, 150, 180],
    refs: [{ y: 140, color: '#FF383C', label: 'เกณฑ์ 140' }, { y: 90, color: '#4A3AFF', label: 'เกณฑ์ 90' }],
    lines: [
      { key: 'systolic', name: 'Systolic', color: '#FF383C', color2: '#992224', range: [90, 140], last: 150, base: 134, spread: 9, seed: 1 },
      { key: 'diastolic', name: 'Diastolic', color: '#4A3AFF', color2: '#2C2399', range: [60, 90], last: 77, base: 84, spread: 6, seed: 5 },
    ],
  },
  'อัตราเต้นของหัวใจ': {
    unit: 'bpm', domain: [50, 120], ticks: [60, 80, 100, 120],
    zones: [{ y1: 60, y2: 100, color: 'rgba(52,199,89,0.06)', edge: '#1E9E4B', legendLabel: 'ช่วงปกติ 60–100' }],
    refs: [{ y: 100, color: '#FF383C', label: 'เกณฑ์ 100', hideLegend: true }],
    lines: [{ key: 'v', name: 'อัตราเต้นของหัวใจ', color: '#FF383C', color2: '#992224', range: [60, 100], last: 103, base: 85, spread: 8, seed: 2 }],
  },
  'อุณหภูมิ': {
    unit: '°C', domain: [35, 39], ticks: [35, 36, 37, 38, 39], decimals: 1,
    zones: [{ y1: 36, y2: 37.5, color: 'rgba(52,199,89,0.06)', edge: '#1E9E4B', legendLabel: 'ช่วงปกติ 36–37.5' }],
    lines: [{ key: 'v', name: 'อุณหภูมิ', color: '#E8802A', color2: '#B45309', range: [36, 37.5], last: 36, base: 36.6, spread: 0.45, seed: 3 }],
  },
  'ออกซิเจน': {
    unit: '%', domain: [88, 100], ticks: [88, 92, 96, 100],
    zones: [{ y1: 95, y2: 100, color: 'rgba(52,199,89,0.06)', edge: '#1E9E4B', legendLabel: 'ช่วงปกติ ≥ 95' }],
    lines: [{ key: 'v', name: 'ออกซิเจน', color: '#1398D8', color2: '#0B6E9E', range: [95, 100], last: 98, base: 97, spread: 1.6, seed: 4 }],
  },
  'น้ำตาล': {
    unit: 'mg/dl', domain: [60, 220], ticks: [60, 100, 140, 180, 220],
    zones: [{ y1: 70, y2: 180, color: 'rgba(52,199,89,0.06)', edge: '#1E9E4B', legendLabel: 'ช่วงปกติ 70–180' }],
    lines: [{ key: 'v', name: 'น้ำตาล', color: '#8B5CF6', color2: '#6D28D9', range: [70, 180], last: 142, base: 130, spread: 16, seed: 6 }],
  },
  'CGM': {
    unit: 'mg/dl', domain: [60, 220], ticks: [60, 100, 140, 180, 220],
    zones: [{ y1: 70, y2: 180, color: 'rgba(52,199,89,0.06)', edge: '#1E9E4B', legendLabel: 'ช่วงปกติ 70–180' }],
    lines: [{ key: 'v', name: 'ค่าเฉลี่ยรายวัน (CGM)', color: '#34C759', color2: '#0F7B37', range: [70, 180], last: 142, base: 128, spread: 18, seed: 7 }],
  },
};

const DETAIL_PERIODS = ['วัน', 'สัปดาห์', 'เดือน', 'ปี'];

/* "วันนี้" ของข้อมูลจำลอง = 25 มี.ค. 69 — ทุก picker นับย้อนจากวันนี้ */
const TH_M = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
const DETAIL_TODAY = new Date(2026, 2, 25);
const beYY = y => String((y + 543) % 100);
const fmtDM = d => `${d.getDate()} ${TH_M[d.getMonth()]}`;
const fmtDMY = d => `${fmtDM(d)} ${beYY(d.getFullYear())}`;
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const dayNum = d => Math.round(d.getTime() / 86400000);

/* สเปกของช่วงที่เลือก: ป้ายแกนเวลา + เฟสสุ่ม (shift) + anchor = ช่วงจบที่วันนี้ (จุดท้ายต้องตรงค่าบนการ์ด) */
function detailSpec(period, sel) {
  if (period === 'วัน') {
    const isCur = sameDay(sel.date, DETAIL_TODAY);
    return {
      labels: Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`),
      shift: dayNum(sel.date) * 1.7, anchor: isCur,
      title: isCur ? `วันนี้ · ${fmtDMY(sel.date)}` : fmtDMY(sel.date),
    };
  }
  if (period === 'สัปดาห์') {
    const days = Array.from({ length: 7 }, (_, i) => addDays(sel.date, i - 6));
    return {
      labels: days.map(fmtDM), shift: dayNum(sel.date) * 0.9, anchor: sameDay(sel.date, DETAIL_TODAY),
      title: `${fmtDM(days[0])} – ${fmtDMY(sel.date)}`,
    };
  }
  if (period === 'เดือน') {
    const { y, m } = sel.month;
    const isCur = y === DETAIL_TODAY.getFullYear() && m === DETAIL_TODAY.getMonth();
    const nDays = isCur ? DETAIL_TODAY.getDate() : new Date(y, m + 1, 0).getDate();
    return {
      labels: Array.from({ length: nDays }, (_, i) => `${i + 1} ${TH_M[m]}`),
      shift: (y * 12 + m) * 0.6, anchor: isCur, title: `${TH_M[m]} ${beYY(y)}`,
    };
  }
  const y = sel.year;
  const isCur = y === DETAIL_TODAY.getFullYear();
  return {
    labels: Array.from({ length: isCur ? DETAIL_TODAY.getMonth() + 1 : 12 }, (_, i) => TH_M[i]),
    shift: y * 1.3, anchor: isCur, title: `ปี ${beYY(y)}`,
  };
}

/* ซีรีส์ deterministic: แกว่งรอบ base (เฟสต่างกันตามช่วงที่เลือก) — ช่วงปัจจุบันไต่ให้จุดสุดท้าย = ค่าบนการ์ดพอดี */
function genDetailData(cfg, spec) {
  const { labels, shift, anchor } = spec;
  const n = labels.length;
  const wave = (i, s) => Math.sin(i * 0.9 + s) + 0.6 * Math.sin(i * 0.37 + s * 1.7);
  return labels.map((lb, i) => {
    const row = { day: lb };
    cfg.lines.forEach(l => {
      const raw = l.base + wave(i + shift + l.seed * 3, l.seed) * l.spread;
      let v = raw;
      if (anchor) {
        const endRaw = l.base + wave(n - 1 + shift + l.seed * 3, l.seed) * l.spread;
        v = n > 1 ? raw + (l.last - endRaw) * (i / (n - 1)) : l.last;
      }
      row[l.key] = cfg.decimals ? +v.toFixed(1) : Math.round(v);
    });
    return row;
  });
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
const chartData = [
  { day: '19 มี.ค.', systolic: 132, diastolic: 88, src: SRC_HOMECARE },
  { day: '20 มี.ค.', systolic: 128, diastolic: 85, src: SRC_MYATLAS },
  { day: '21 มี.ค.', systolic: 135, diastolic: 90, src: SRC_MYATLAS },
  { day: '22 มี.ค.', systolic: 138, diastolic: 82, src: SRC_HOMECARE },
  { day: '23 มี.ค.', systolic: 142, diastolic: 86, src: SRC_MYATLAS },
  { day: '24 มี.ค.', systolic: 146, diastolic: 80, src: SRC_MYATLAS },
  { day: '25 มี.ค.', systolic: 150, diastolic: 77, src: SRC_HOMECARE },
];

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
    data: [{ day:'19 มี.ค.', v:82, src: SRC_HOMECARE },{ day:'20 มี.ค.', v:78, src: SRC_MYATLAS },{ day:'21 มี.ค.', v:85, src: SRC_MYATLAS },{ day:'22 มี.ค.', v:88, src: SRC_HOMECARE },{ day:'23 มี.ค.', v:92, src: SRC_MYATLAS },{ day:'24 มี.ค.', v:96, src: SRC_MYATLAS },{ day:'25 มี.ค.', v:103, src: SRC_HOMECARE }],
    lines: [{ key: 'v', name: 'อัตราเต้นของหัวใจ', color: '#FF383C', color2: '#992224', dash: '', range: [60, 100] }],
    domain: [50, 120], ticks: [60, 80, 100, 120],
    /* แถบช่วงปกติจางๆ ตามขนบ chart คลินิก (reference range) — คำอธิบายอยู่ที่ legend ใต้กราฟ */
    zones: [{ y1: 60, y2: 100, color: 'rgba(52,199,89,0.06)', edge: '#1E9E4B', legendLabel: 'ช่วงปกติ 60–100' }],
    refs: [{ y: 100, color: '#FF383C', label: 'เกณฑ์ 100', hideLegend: true }],
    dots: true, // จุด marker ทุกครั้งที่วัด — เกินเกณฑ์เป็นจุดแดงทึบ
    h: 140, // อยู่แถวเดียวกับ BP — สูงเท่ากันให้แถวเสมอ
  },
  2: { // อุณหภูมิ — ล่าสุด 36
    data: [{ day:'19 มี.ค.', v:36.5 },{ day:'20 มี.ค.', v:36.8 },{ day:'21 มี.ค.', v:36.2 },{ day:'22 มี.ค.', v:36.4 },{ day:'23 มี.ค.', v:36.6 },{ day:'24 มี.ค.', v:36.3 },{ day:'25 มี.ค.', v:36 }],
    lines: [{ key: 'v', name: 'อุณหภูมิ', color: '#FF383C', color2: '#992224', dash: '', range: [36, 37.5] }], domain: [35, 38],
  },
  3: { // ออกซิเจน — ล่าสุด 98
    data: [{ day:'19 มี.ค.', v:97 },{ day:'20 มี.ค.', v:98 },{ day:'21 มี.ค.', v:96 },{ day:'22 มี.ค.', v:97 },{ day:'23 มี.ค.', v:95 },{ day:'24 มี.ค.', v:97 },{ day:'25 มี.ค.', v:98 }],
    lines: [{ key: 'v', name: 'ออกซิเจน', color: '#FF383C', color2: '#992224', dash: '', range: [95, 100] }], domain: [90, 100],
  },
  4: { // น้ำตาล — ล่าสุด 142
    data: [{ day:'19 มี.ค.', v:118 },{ day:'20 มี.ค.', v:132 },{ day:'21 มี.ค.', v:125 },{ day:'22 มี.ค.', v:128 },{ day:'23 มี.ค.', v:135 },{ day:'24 มี.ค.', v:145 },{ day:'25 มี.ค.', v:142 }],
    lines: [{ key: 'v', name: 'น้ำตาล', color: '#FF383C', color2: '#992224', dash: '', range: [70, 180] }], domain: [80, 160],
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

const makeVitals = (bp, hr, temp, spo2, sugar, height, weight, waist) => [
  { label: 'ความดันโลหิต', value: bp, unit: 'mmHg' },
  { label: 'อัตราเต้นของหัวใจ', value: `${hr}`, unit: 'bpm' },
  { label: 'อุณหภูมิ', value: `${temp}`, unit: '°C' },
  { label: 'ออกซิเจน', value: `${spo2}%`, unit: '' },
  { label: 'น้ำตาล', value: `${sugar}`, unit: 'mg/dL' },
  { label: 'ส่วนสูง', value: `${height}`, unit: 'cm' },
  { label: 'น้ำหนัก', value: `${weight}`, unit: 'kg' },
  { label: 'รอบเอว', value: `${waist}`, unit: 'inch' },
];

/* ประวัติ 7 วันล่าสุด (19–25 มี.ค.) — ทุกค่าตรงกับจุดบนกราฟการ์ด vital (BP/อัตราเต้นของหัวใจ/อุณหภูมิ/ออกซิเจน/น้ำตาล)
   แบ่งกลุ่มตามแหล่งบันทึกเดียวกับ src ของกราฟ: เยี่ยมบ้าน (19, 22, 25) = Atlas HomeCare · วัดเอง = My Atlas
   ส่วนสูง/น้ำหนักตรงกับการ์ด BMI (175 cm / 60 kg) */
const vitalHistory = [
  { source: 'Atlas HomeCare', logo: 'homecare', visits: [
    { id: '0007', date: '25 มี.ค. 69', time: '10:30 น.', vitals: makeVitals('150/77', 103, 36, 98, 142, 175, 60, 28) },
    { id: '0004', date: '22 มี.ค. 69', time: '10:00 น.', vitals: makeVitals('138/82', 88, 36.4, 97, 128, 175, 60, 28) },
    { id: '0001', date: '19 มี.ค. 69', time: '09:30 น.', vitals: makeVitals('132/88', 82, 36.5, 97, 118, 175, 60, 28) },
  ]},
  { source: 'My Atlas', logo: 'myatlas', visits: [
    { id: '0006', date: '24 มี.ค. 69', time: '08:00 น.', vitals: makeVitals('146/80', 96, 36.3, 97, 145, 175, 60, 28) },
    { id: '0005', date: '23 มี.ค. 69', time: '07:45 น.', vitals: makeVitals('142/86', 92, 36.6, 95, 135, 175, 60, 28) },
    { id: '0003', date: '21 มี.ค. 69', time: '08:15 น.', vitals: makeVitals('135/90', 85, 36.2, 96, 125, 175, 60, 28) },
    { id: '0002', date: '20 มี.ค. 69', time: '07:30 น.', vitals: makeVitals('128/85', 78, 36.8, 98, 132, 175, 60, 28) },
  ]},
];

/* ── Stat card configs ── */
import imgRobotBp from '../assets/images/vital-robot-bp.png';
import imgRobotCgm from '../assets/images/vital-robot-cgm.png';
import imgBmiScale from '../assets/images/vital-bmi-scale.png';
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
import ppChevronFwdSm from '../assets/icons/pp-chevron-forward-sm.svg';
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
  { label: 'ความดันโลหิต', value: '150/77', unit: 'mmHg', status: 'warning', badge: 'สูงเล็กน้อย',  updated: '25 มี.ค 69 · 10:30', delta: '▲4 / ▼3', chart: 0, art: imgRobotBp, artCrop: { w: 163, h: 249, imgW: 303, x: -24, y: 25 }, col: 'span 2' },
  { label: 'อัตราเต้นของหัวใจ',        value: '103',    unit: 'bpm',   status: 'warning', badge: 'หัวใจเต้นเร็ว', updated: '25 มี.ค 69 · 10:30', delta: '▲7', chart: 1 },
  { label: 'อุณหภูมิ',      value: '36',     unit: 'C',     status: 'normal',  badge: 'ปกติ',        updated: '25 มี.ค 69 · 10:35', delta: '▼0.3', chart: null },
  { label: 'ออกซิเจน',     value: '98',     unit: '%',     status: 'normal',  badge: 'ปกติ',        updated: '25 มี.ค 69 · 10:35', delta: '▲1', chart: null },
  { label: 'น้ำตาล',       value: '142',    unit: 'mg/dl', status: 'normal',  badge: 'ปกติ',        updated: '25 มี.ค 69 · 07:00', delta: '▼3', chart: null },
  { label: 'CGM',          value: '142',    unit: 'mg/dl', status: 'normal',  badge: 'ปกติ',        updated: '25 มี.ค 69 · 23:55', chart: 6, art: imgRobotCgm, artCrop: { w: 108, h: 219, imgW: 275, x: -62, y: -4 }, col: '2 / 4', row: 3 },
];

/* กรอบและเงาเป็นกลางเหมือนกันทุกใบ (ตามที่ตกลงไว้ ไม่ใช้เงาสีของ Figma) */
const CARD_BORDER = '1px solid rgba(30,27,57,0.07)';
const CARD_SHADOW = '0 2px 10px rgba(30,27,57,0.05)';

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
  const [bmiHover, setBmiHover] = useState(false);
  const [metricDetail, setMetricDetail] = useState(null);   // ป๊อปอัพดูเพิ่มเติมของ vital (สัปดาห์/เดือน/ปี)
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
  const totalItems = 25;
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

          {/* ── Tabs row (fixed) ── */}
          <div style={{ background: 'rgba(255,255,255,0.5)', borderRadius: 100, padding: 4, display: 'inline-flex', gap: 4, alignSelf: 'flex-start' }}>
            {tabLabels.map((t, i) => (
              <button
                key={i}
                className="hover-btn"
                onClick={() => setActiveTab(i)}
                style={{
                  padding: '8px 18px', borderRadius: 100, border: 'none', cursor: 'pointer',
                  fontSize: 12, fontWeight: activeTab === i ? 600 : 400, fontFamily: font,
                  background: activeTab === i ? '#0088FF' : 'transparent',
                  color: activeTab === i ? '#fff' : BLACK,
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
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

              {/* ── Vital cards: KPI header + embedded chart (Figma 494:2233), 3-col grid ── */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                {statCards.map((s, i) => {
                  const st = VITAL_STATUS[s.status] || VITAL_STATUS.normal;
                  const ds = s.chart != null ? chartDataSets[s.chart] : null;
                  return (
                  <div key={i} className={`hover-card anim-slide-up delay-${i + 1}`} style={{
                    background: st.surface, border: CARD_BORDER, borderRadius: 24,
                    position: 'relative', overflow: 'hidden', minWidth: 0,
                    display: 'flex', flexDirection: 'column',
                    boxShadow: CARD_SHADOW,
                    gridColumn: s.col, gridRow: s.row,
                  }}>
                    {/* ── Header (Figma 504:3142): ชื่อ + ดูเพิ่มเติม / ค่า / ป้าย / วันอัพเดท — legend ชิดขวาล่างเฉพาะกราฟหลายเส้น ── */}
                    <div style={{ padding: ds ? '16px 16px 12px' : 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
                          {VITAL_ROW_ICONS[s.label] && (
                            <img src={VITAL_ROW_ICONS[s.label]} alt="" style={{
                              width: 14, height: 14, flexShrink: 0,
                              filter: 'grayscale(1) brightness(0.72)',
                            }} />
                          )}
                          <p style={{ fontSize: 12, fontWeight: 600, color: '#1E1B39', margin: 0, lineHeight: '16px', whiteSpace: 'nowrap' }}>{s.label}</p>
                        </div>
                        {/* ปุ่มดูเพิ่มเติม — เปิดป๊อปอัพดูย้อนหลัง สัปดาห์/เดือน/ปี */}
                        <button className="hover-btn" onClick={() => setMetricDetail(s)} style={{
                          display: 'inline-flex', alignItems: 'center', gap: 6, flexShrink: 0,
                          height: 28, padding: '0 12px', borderRadius: 100,
                          background: 'rgba(142,142,147,0.1)', border: '1px solid rgba(255,255,255,0.9)',
                          cursor: 'pointer', fontFamily: font, fontSize: 11, fontWeight: 500,
                          color: '#1E1B39', lineHeight: '16px',
                        }}>
                          ดูเพิ่มเติม
                          {/* glyph ในไฟล์ชี้ซ้าย (chevron.backward) — หมุน 180° ให้ชี้ขวาตามดีไซน์ */}
                          <img src={ppChevronFwdSm} alt="" style={{ width: 6, height: 9, transform: 'rotate(180deg)' }} />
                        </button>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start', minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ fontSize: 20, fontWeight: 700, lineHeight: '20px', color: st.value }}>{s.value}</span>
                            <span style={{ fontSize: 12, color: st.unit, lineHeight: 'normal' }}>{s.unit}</span>
                            {s.delta && <span style={{
                              fontSize: 10, fontWeight: 600, color: '#615E83',
                              background: 'rgba(30,27,57,0.05)', padding: '2px 8px', borderRadius: 100,
                              whiteSpace: 'nowrap',
                            }}>{s.delta} จากครั้งก่อน</span>}
                          </div>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4,
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
                          <p style={{ fontSize: 11, color: '#8E8E93', margin: 0, lineHeight: '16px' }}>อัพเดท : {s.updated}</p>
                          {ds?.showTir && (() => {
                            const l0 = ds.lines[0];
                            const pct = Math.round(ds.data.filter(d => d[l0.key] >= l0.range[0] && d[l0.key] <= l0.range[1]).length / ds.data.length * 100);
                            return <p style={{ fontSize: 11, fontWeight: 600, color: '#0F7B37', margin: 0, lineHeight: '16px' }}>อยู่ในเกณฑ์ {pct}% ของ 24 ชม.</p>;
                          })()}
                        </div>
                      </div>
                    </div>

                    {/* ── Chart บนการ์ดโดยตรง (ดีไซน์ใหม่ไม่มีแผงซ้อน) — เว้นขวาให้ภาพหุ่น 3D ถ้ามี ── */}
                    {ds && (
                      <div style={{ padding: '4px 16px 16px', position: 'relative' }}>
                        <div style={{ marginRight: s.artCrop ? s.artCrop.w + 8 : s.art ? 150 : 0 }}>
                          <ResponsiveContainer className="anim-chart-fade" width="100%" height={ds.h || 100}>
                            <ComposedChart data={ds.data} margin={{ top: 6, right: 18, left: 2, bottom: 4 }}>
                              <CartesianGrid stroke="rgba(30,27,57,0.06)" vertical={ds.data.length <= 40} />
                              <XAxis dataKey="day" interval={ds.xTicks ? 0 : (ds.xInterval ?? 0)} ticks={ds.xTicks} tickFormatter={d => (d === '23:55' ? '24:00' : d.split(' ')[0])} tick={{ fontSize: 10, fill: '#9291A5', fontFamily: font }} axisLine={false} tickLine={false} tickMargin={12} />
                              <YAxis width={26} tick={{ fontSize: 10, fill: '#9291A5', fontFamily: font }} axisLine={false} tickLine={false} domain={ds.domain} ticks={ds.ticks} tickCount={3} />
                              <Tooltip content={<Tip unit={s.unit} source={ds.source} ranges={Object.fromEntries(ds.lines.filter(l => l.range).map(l => [l.key, l.range]))} />} cursor={{ stroke: 'rgba(30,27,57,0.15)', strokeDasharray: '3 3' }} />
                              {/* โซนช่วงค่าผิดปกติ — แถบสีจางพาดเต็มกว้าง มองแวบเดียวรู้ว่าเส้นเข้าโซนวันไหน */}
                              {(ds.zones || []).map((z, zi) => (
                                <ReferenceArea key={zi} y1={z.y1} y2={z.y2} fill={z.color} stroke="none"
                                  label={z.label ? { value: z.label, position: 'insideTopLeft', fill: z.edge, fontSize: 9, fontFamily: font, opacity: 0.85, dx: 2, dy: 2 } : undefined} />
                              ))}
                              {/* กราฟจุดถี่ (CGM): วาดเส้นตั้งของกริดเองตาม xTicks — ปล่อยให้ CartesianGrid ทำจะได้ 288 เส้น */}
                              {ds.data.length > 40 && (ds.xTicks || []).map(t => (
                                <ReferenceLine key={`vgrid-${t}`} x={t} stroke="rgba(30,27,57,0.06)" strokeWidth={1} />
                              ))}
                              {/* เส้นเกณฑ์เดี่ยว (กรณีเกณฑ์ไม่ติดขอบ domain เช่น DIA 90) */}
                              {(ds.refs || []).map(r => (
                                <ReferenceLine key={r.y} y={r.y} stroke={r.color} strokeOpacity={0.4} strokeDasharray="4 4" />
                              ))}
                              {/* splitColor: ไล่สีเส้นตามค่า — เหนือเกณฑ์สูงเป็นแดง / ต่ำกว่าเกณฑ์ล่างเป็นส้ม
                                  (gradient แนวตั้งอิง bbox ของเส้น offset คิดจาก min-max ของข้อมูลจริง) */}
                              {(() => {
                                if (!ds.splitColor) return null;
                                const sc = ds.splitColor;
                                const vals = ds.data.map(d => d[ds.lines[0].key]);
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
                                    <linearGradient id={`split-${i}`} x1="0" y1="0" x2="0" y2="1">
                                      {stops.map(([o, c], si) => <stop key={si} offset={o} stopColor={c} />)}
                                    </linearGradient>
                                  </defs>
                                );
                              })()}
                              {/* เงาเรืองสีใต้เส้น (ต่อเส้น) + พื้นไล่เฉดสองจังหวะ — ให้เส้นลอยมีมิติ */}
                              <defs>
                                {ds.lines.map(l => (
                                  <filter key={l.key} id={`glow-${i}-${l.key}`} x="-50%" y="-50%" width="200%" height="200%">
                                    <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor={l.color} floodOpacity="0.15" />
                                  </filter>
                                ))}
                                {ds.lines.length === 1 && (
                                  <linearGradient id={`fill-${i}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={ds.lines[0].color} stopOpacity={0.12} />
                                    <stop offset="55%" stopColor={ds.lines[0].color} stopOpacity={0.04} />
                                    <stop offset="100%" stopColor={ds.lines[0].color} stopOpacity={0} />
                                  </linearGradient>
                                )}
                              </defs>
                              {/* พื้นไล่เฉดเฉพาะกราฟเส้นเดี่ยว (สองเส้นซ้อนกันจะขุ่น) */}
                              {ds.lines.length === 1 && (
                                <Area type={ds.curve || 'monotone'} dataKey={ds.lines[0].key}
                                  fill={`url(#fill-${i})`} stroke="none" tooltipType="none" legendType="none"
                                  animationDuration={1000} />
                              )}
                              {/* ds.dots (BP): สไตล์ chart แพทย์สากล เส้นทึบ + marker ทุกจุดวัด — จุดในช่วงผิดปกติเป็นแดงทึบ */}
                              {ds.lines.map(l => (
                                <Line key={l.key} type={ds.curve || 'monotone'} dataKey={l.key} name={l.name}
                                  stroke={ds.splitColor && (
                                    (ds.splitColor.high != null && Math.max(...ds.data.map(d => d[l.key])) > ds.splitColor.high) ||
                                    (ds.splitColor.low != null && Math.min(...ds.data.map(d => d[l.key])) < ds.splitColor.low)
                                  ) ? `url(#split-${i})` : l.color}
                                  strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
                                  filter={`url(#glow-${i}-${l.key})`}
                                  dot={ds.dots ? ({ cx, cy, value, index }) => {
                                    const out = l.range && (value < l.range[0] || value > l.range[1]);
                                    return out
                                      ? <circle key={index} cx={cx} cy={cy} r={4.5} fill="#FF383C" stroke="white" strokeWidth={2} />
                                      : <circle key={index} cx={cx} cy={cy} r={4} fill={l.color} stroke="white" strokeWidth={2} />;
                                  } : ({ cx, cy, index }) => (
                                    /* จุดปลายเส้น = ค่าล่าสุด มีรัศมีเรืองรอบ ให้ความรู้สึก live */
                                    index === ds.data.length - 1
                                      ? <g key={index}>
                                          <circle cx={cx} cy={cy} r={9} fill={l.color} opacity={0.15} />
                                          <circle cx={cx} cy={cy} r={4} fill={l.color} stroke="white" strokeWidth={2} />
                                        </g>
                                      : <circle key={index} r={0} fill="none" />
                                  )}
                                  activeDot={{ r: 5, fill: l.color, stroke: 'white', strokeWidth: 2, style: { filter: `drop-shadow(0 2px 4px ${l.color}60)` } }}
                                  animationDuration={1200} animationEasing="ease-out"
                                />
                              ))}
                            </ComposedChart>
                          </ResponsiveContainer>
                          {/* คำอธิบายกราฟรวมไว้ที่เดียวใต้กราฟ — ชื่อเส้น + เกณฑ์ของเส้นนั้นจับคู่กันด้วยสี
                              (เลิกมี legend ซ้ำบนหัวการ์ด) */}
                          {(() => {
                            const refByColor = Object.fromEntries((ds.refs || []).map(r => [r.color, r]));
                            /* จับคู่ชื่อกับเกณฑ์สีเดียวกันทุกแบบ (CGM: สูง · เกณฑ์ 180 / ต่ำ · เกณฑ์ 70 — โครงเดียวกับกราฟความดัน) */
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
                                {/* legend ของโซนช่วงค่า — สี่เหลี่ยมมนสีเดียวกับแถบบนกราฟ */}
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
                        {/* ภาพหุ่น 3D ข้างกราฟ — แบบ artCrop: หน้าต่างครอปชิดมุมขวาล่าง ภาพขยายข้างในให้เห็นเฉพาะโซนสำคัญ
                            เหมือนภาพโผล่จากมุมการ์ด (ขอบหน้าต่าง + ขอบการ์ดตัดส่วนเกินทิ้ง) */}
                        {s.art && (s.artCrop ? (
                          <div style={{
                            position: 'absolute', right: 0, bottom: 0, width: s.artCrop.w, height: s.artCrop.h,
                            overflow: 'hidden', pointerEvents: 'none',
                            /* เฟดขอบล่างให้ภาพกลืนกับการ์ด ไม่ตัดขาดเป็นเส้นตรง */
                            WebkitMaskImage: 'linear-gradient(180deg, black 62%, transparent 97%)',
                            maskImage: 'linear-gradient(180deg, black 62%, transparent 97%)',
                          }}>
                            <img src={s.art} alt="" style={{ position: 'absolute', width: s.artCrop.imgW, left: s.artCrop.x, top: s.artCrop.y, maxWidth: 'none' }} />
                          </div>
                        ) : (
                          <img src={s.art} alt="" style={{ position: 'absolute', right: 0, bottom: 4, height: (ds.h || 100) + 55, objectFit: 'contain', pointerEvents: 'none' }} />
                        ))}
                      </div>
                    )}
                  </div>
                  );
                })}

                {/* BMI section — แถว 3 ช่องซ้าย คู่กับ CGM ที่กิน 2 ช่องขวา
                    โครงหัวการ์ดเหมือนใบ vital อื่น (ไอคอน+ชื่อ / ดูเพิ่มเติม / ค่า / ป้ายสถานะ / อัพเดท)
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
                    gridColumn: 1, gridRow: 3, display: 'flex', flexDirection: 'column',
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
                        position: 'absolute', top: '50%', left: '100%', transform: 'translateY(-50%)',
                        marginLeft: 10, width: 260, borderRadius: 20, overflow: 'hidden',
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

                        {/* Arrow pointing right */}
                        <div style={{
                          position: 'absolute', top: '50%', right: -6, transform: 'translateY(-50%) rotate(45deg)',
                          width: 12, height: 12, background: 'white',
                          boxShadow: '2px -2px 4px rgba(0,0,0,0.06)',
                        }} />
                      </div>
                    );
                  })()}
                  </div>
                  </div>
                  {/* แถวล่างตาม Figma: น้ำหนัก | เครื่องชั่ง (กลาง เฟดขอบล่าง) | ส่วนสูง */}
                  <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', padding: '4px 30px 14px', marginTop: 'auto' }}>
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
                  <select style={{
                    fontSize: 10, color: GRAY, background: 'rgba(0,0,0,0.04)', border: 'none',
                    borderRadius: 10, padding: '4px 10px', fontFamily: font, cursor: 'pointer',
                  }}>
                    <option>เพิ่มเติม</option>
                  </select>
                </div>

                <div style={{ marginTop: 14 }}>
                  {vitalHistory.map((group, gi) => (
                    <div key={gi} style={{ marginBottom: 16 }}>
                      {/* Source header */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                        <img
                          src={group.logo === 'homecare' ? logoHomeCare : logoMyAtlas}
                          alt={group.source}
                          style={{ width: 20, height: 20, borderRadius: '50%', objectFit: 'contain' }}
                        />
                        <span style={{ fontSize: 10, fontWeight: 500, color: GRAY }}>{group.source}</span>
                      </div>

                      {/* Visit cards */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingLeft: 28 }}>
                        {group.visits.map((visit, vi) => {
                          const visitKey = `${gi}-${vi}`;
                          const isOpen = expandedVisit === visitKey;
                          return (
                            <div key={vi} className="hover-card" style={{
                              background: '#fff', borderRadius: 16,
                              border: '1px solid rgba(0,0,0,0.04)',
                              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                              overflow: 'hidden',
                            }}>
                              {/* Header - clickable */}
                              <div onClick={() => setExpandedVisit(isOpen ? null : visitKey)} style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '12px 16px', cursor: 'pointer',
                                background: isOpen ? 'rgba(139,92,246,0.03)' : 'transparent',
                                transition: 'background 0.15s ease',
                              }}>
                                <div style={{ display: 'flex', gap: 8, fontSize: 12, fontFamily: font }}>
                                  <span style={{ fontWeight: 600, color: BLACK }}>Visit: {visit.id}</span>
                                  <span style={{ color: '#8E8E93' }}>({visit.date})</span>
                                </div>
                                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={{ transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'none' }}>
                                  <path d="M1 1L5 5L9 1" stroke="#8E8E93" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </div>
                              {/* Content - collapsible */}
                              {isOpen && (
                                <div style={{ padding: '0 16px 16px' }}>
                                  {visit.vitals.map((v, vii) => (
                                    <div key={vii}>
                                      {vii > 0 && <div style={{ height: 1, background: 'rgba(0,0,0,0.04)', margin: '6px 0 6px 24px' }} />}
                                      <VitalRow label={v.label} value={v.value} unit={v.unit} time={visit.time} />
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
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
                    {[1, 2, 3].map(p => (
                      <button
                        key={p}
                        className="hover-btn"
                        onClick={() => setHistoryPage(p)}
                        style={{
                          width: 24, height: 24, borderRadius: '50%', border: 'none', cursor: 'pointer',
                          fontSize: 11, fontWeight: 600, fontFamily: font,
                          background: historyPage === p ? '#7C3AED' : 'rgba(0,0,0,0.04)',
                          color: historyPage === p ? '#fff' : GRAY,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        {p}
                      </button>
                    ))}
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
