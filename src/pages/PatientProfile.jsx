import { useState } from 'react';
import { getAvatar } from '../data/patients';
import { LineChart, Line, Area, AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart } from 'recharts';
import logoHomeCare from '../assets/images/logo-atlas-homecare.png';
import logoMyAtlas from '../assets/images/logo-my-atlas.png';
import imgCardAllergy from '../assets/images/card-allergy.png';
import imgCardDisease from '../assets/images/card-disease.png';
import imgCardAddress from '../assets/images/card-address.png';

const font = "'IBM Plex Sans Thai Looped', sans-serif";
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
const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'rgba(255,255,255,0.95)', borderRadius: 12, padding: '8px 12px', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.04)', fontFamily: font }}>
      <p style={{ fontSize: 10, fontWeight: 600, color: GRAY, marginBottom: 3 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ fontSize: 11, fontWeight: 700, color: p.color }}>{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

/* ── Vital row icon mapping ── */
const VITAL_ROW_ICONS = {
  'ความดันโลหิต': ppRowBp,
  'ชีพจร': ppRowEcg,
  'อุณหภูมิ': ppRowThermo,
  'ออกซิเจน': ppRowOxygen,
  'น้ำตาล': ppRowDrop,
  'ส่วนสูง': ppRowHeight,
  'น้ำหนัก': ppRowWeight,
  'รอบเอว': ppRowWaist,
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

/* ── BMI Gauge SVG ── */
function BMIGauge({ bmi = 19.5 }) {
  const angle = Math.min(Math.max((bmi - 10) / 30, 0), 1) * 180;
  return (
    <svg width="160" height="95" viewBox="0 0 160 95">
      <path d="M10 85 A 70 70 0 0 1 150 85" fill="none" stroke="#E5E7EB" strokeWidth="12" strokeLinecap="round" />
      <path d="M10 85 A 70 70 0 0 1 150 85" fill="none" stroke="url(#bmiGrad)" strokeWidth="12" strokeLinecap="round" strokeDasharray="220" strokeDashoffset={220 - (angle / 180) * 220} />
      <defs>
        <linearGradient id="bmiGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#34C759" />
          <stop offset="40%" stopColor="#FFCC00" />
          <stop offset="70%" stopColor="#FF9500" />
          <stop offset="100%" stopColor="#FF383C" />
        </linearGradient>
      </defs>
      <text x="80" y="75" textAnchor="middle" fontSize="28" fontWeight="700" fill={BLACK} fontFamily={font}>{bmi}</text>
      <text x="80" y="92" textAnchor="middle" fontSize="10" fill="#8E8E93" fontFamily={font}>ค่าปกติอยู่ในเกณฑ์ดี</text>
    </svg>
  );
}

/* ── Chart mock data ── */
const chartData = [
  { day: '15 มี.ค.', systolic: 128, diastolic: 95 },
  { day: '16 มี.ค.', systolic: 132, diastolic: 92 },
  { day: '17 มี.ค.', systolic: 125, diastolic: 98 },
  { day: '18 มี.ค.', systolic: 130, diastolic: 90 },
  { day: '19 มี.ค.', systolic: 135, diastolic: 96 },
  { day: '20 มี.ค.', systolic: 128, diastolic: 93 },
  { day: '21 มี.ค.', systolic: 130, diastolic: 95 },
];

const chartFilterTabs = ['ทั้งหมด', 'ชีพจร', 'อุณหภูมิ', 'ออกซิเจน', 'น้ำตาล', 'น้ำหนัก', 'CGM'];
const chartDataSets = {
  0: { // ทั้งหมด = BP
    data: chartData, lines: [
      { key: 'systolic', name: 'Systolic', color: '#FF383C', dash: '5 5' },
      { key: 'diastolic', name: 'Diastolic', color: '#3B82F6', dash: '' },
    ], domain: [90, 140],
  },
  1: { // ชีพจร
    data: [{ day:'15 มี.ค.', v:82 },{ day:'16 มี.ค.', v:78 },{ day:'17 มี.ค.', v:90 },{ day:'18 มี.ค.', v:85 },{ day:'19 มี.ค.', v:103 },{ day:'20 มี.ค.', v:88 },{ day:'21 มี.ค.', v:80 }],
    lines: [{ key: 'v', name: 'ชีพจร', color: '#FC9BBA', dash: '' }], domain: [60, 120],
  },
  2: { // อุณหภูมิ
    data: [{ day:'15 มี.ค.', v:36.5 },{ day:'16 มี.ค.', v:36.8 },{ day:'17 มี.ค.', v:36.2 },{ day:'18 มี.ค.', v:37.1 },{ day:'19 มี.ค.', v:36.4 },{ day:'20 มี.ค.', v:36.6 },{ day:'21 มี.ค.', v:36.3 }],
    lines: [{ key: 'v', name: 'อุณหภูมิ', color: '#3B82F6', dash: '' }], domain: [35, 38],
  },
  3: { // ออกซิเจน
    data: [{ day:'15 มี.ค.', v:97 },{ day:'16 มี.ค.', v:98 },{ day:'17 มี.ค.', v:96 },{ day:'18 มี.ค.', v:98 },{ day:'19 มี.ค.', v:95 },{ day:'20 มี.ค.', v:97 },{ day:'21 มี.ค.', v:98 }],
    lines: [{ key: 'v', name: 'ออกซิเจน', color: '#8B5CF6', dash: '' }], domain: [90, 100],
  },
  4: { // น้ำตาล
    data: [{ day:'15 มี.ค.', v:118 },{ day:'16 มี.ค.', v:132 },{ day:'17 มี.ค.', v:142 },{ day:'18 มี.ค.', v:128 },{ day:'19 มี.ค.', v:135 },{ day:'20 มี.ค.', v:145 },{ day:'21 มี.ค.', v:138 }],
    lines: [{ key: 'v', name: 'น้ำตาล', color: '#19A589', dash: '' }], domain: [80, 160],
  },
  5: { // น้ำหนัก
    data: [{ day:'15 มี.ค.', v:62 },{ day:'16 มี.ค.', v:61.8 },{ day:'17 มี.ค.', v:62.1 },{ day:'18 มี.ค.', v:61.5 },{ day:'19 มี.ค.', v:62 },{ day:'20 มี.ค.', v:61.7 },{ day:'21 มี.ค.', v:62.2 }],
    lines: [{ key: 'v', name: 'น้ำหนัก', color: '#E8802A', dash: '' }], domain: [58, 66],
  },
  6: { // CGM
    data: [{ day:'15 มี.ค.', v:130 },{ day:'16 มี.ค.', v:142 },{ day:'17 มี.ค.', v:128 },{ day:'18 มี.ค.', v:155 },{ day:'19 มี.ค.', v:138 },{ day:'20 มี.ค.', v:145 },{ day:'21 มี.ค.', v:142 }],
    lines: [{ key: 'v', name: 'CGM', color: '#E8802A', dash: '' }], domain: [100, 170],
  },
};

/* ── Mock vital history ── */
const makeVitals = (bp, hr, temp, spo2, sugar, height, weight, waist) => [
  { label: 'ความดันโลหิต', value: bp, unit: 'mmHg' },
  { label: 'ชีพจร', value: `${hr}`, unit: 'bpm' },
  { label: 'อุณหภูมิ', value: `${temp}`, unit: '°C' },
  { label: 'ออกซิเจน', value: `${spo2}%`, unit: '' },
  { label: 'น้ำตาล', value: `${sugar}`, unit: 'mg/dL' },
  { label: 'ส่วนสูง', value: `${height}`, unit: 'cm' },
  { label: 'น้ำหนัก', value: `${weight}`, unit: 'kg' },
  { label: 'รอบเอว', value: `${waist}`, unit: 'inch' },
];

const vitalHistory = [
  { source: 'Atlas HomeCare', logo: 'homecare', visits: [
    { id: '0001', date: '25 มี.ค. 69', time: '10:00 น.', vitals: makeVitals('98/77', 90, 36, 98, 93, 170, 62, 28) },
    { id: '0002', date: '20 มี.ค. 69', time: '09:30 น.', vitals: makeVitals('120/80', 85, 36.5, 97, 110, 170, 63, 29) },
    { id: '0003', date: '15 มี.ค. 69', time: '11:00 น.', vitals: makeVitals('135/88', 92, 36.2, 96, 125, 170, 62, 28) },
    { id: '0004', date: '10 มี.ค. 69', time: '10:15 น.', vitals: makeVitals('128/82', 88, 36.4, 98, 105, 170, 61, 28) },
  ]},
  { source: 'My Atlas', logo: 'myatlas', visits: [
    { id: '0005', date: '23 มี.ค. 69', time: '08:00 น.', vitals: makeVitals('115/75', 78, 36.3, 99, 98, 170, 62, 28) },
    { id: '0006', date: '18 มี.ค. 69', time: '07:45 น.', vitals: makeVitals('118/78', 80, 36.1, 98, 102, 170, 63, 29) },
    { id: '0007', date: '13 มี.ค. 69', time: '08:30 น.', vitals: makeVitals('122/80', 82, 36.5, 97, 108, 170, 62, 28) },
    { id: '0008', date: '8 มี.ค. 69', time: '09:00 น.', vitals: makeVitals('110/72', 76, 36.2, 99, 95, 170, 61, 28) },
  ]},
];

/* ── Stat card configs ── */
import imgVitalBp from '../assets/images/vital-bp.png';
import imgVitalPulse from '../assets/images/vital-pulse.png';
import imgVitalTemp from '../assets/images/vital-temp.png';
import imgVitalOxygen from '../assets/images/vital-oxygen.png';
import imgVitalSugar from '../assets/images/vital-sugar.png';
import ppBp from '../assets/icons/pp-bp.svg';
import ppEcg from '../assets/icons/pp-ecg.svg';
import ppThermo from '../assets/icons/pp-thermo.svg';
import ppOxygen from '../assets/icons/pp-oxygen.svg';
import ppDrop from '../assets/icons/pp-drop.svg';
import ppRowBp from '../assets/icons/pp-row-bp.svg';
import ppRowEcg from '../assets/icons/pp-row-ecg.svg';
import ppRowThermo from '../assets/icons/pp-row-thermo.svg';
import ppRowOxygen from '../assets/icons/pp-row-oxygen.svg';
import ppRowDrop from '../assets/icons/pp-row-drop.svg';
import ppRowHeight from '../assets/icons/pp-row-height.svg';
import ppRowWeight from '../assets/icons/pp-row-weight.svg';
import ppRowWaist from '../assets/icons/pp-row-waist.svg';
import ppHeaderIcon from '../assets/icons/pp-header-icon.svg';

const statCards = [
  { label: 'ความดันโลหิต', value: '150/77', unit: 'mmHg', gradient: 'linear-gradient(149deg, #FF383C, #992224)', shadow: 'rgba(208,56,26,0.3)', icon: 'ecg', badge: 'สูงเล็กน้อย', img: imgVitalBp },
  { label: 'ชีพจร', value: '103', unit: 'bpm', gradient: 'linear-gradient(149deg, #FC9BBA, #DB677E)', shadow: 'rgba(252,155,186,0.3)', icon: 'heart', badge: 'หัวใจเต้นเร็ว', img: imgVitalPulse },
  { label: 'อุณหภูมิ', value: '36', unit: 'C', gradient: 'linear-gradient(149deg, #3B82F6, #1D4ED8)', shadow: 'rgba(59,130,246,0.3)', icon: 'thermo', badge: 'ปกติ', img: imgVitalTemp },
  { label: 'ออกซิเจน', value: '98', unit: '%', gradient: 'linear-gradient(149deg, #8B5CF6, #7C3AED)', shadow: 'rgba(139,92,246,0.3)', icon: 'lungs', badge: 'ปกติ', img: imgVitalOxygen },
  { label: 'น้ำตาล', value: '142', unit: 'mg/dl', gradient: 'linear-gradient(149deg, #19A589, #0D7C66)', shadow: 'rgba(139,92,246,0.3)', icon: 'drop', badge: 'ปกติ', img: imgVitalSugar },
  { label: 'CGM', value: '142', unit: 'mg/dl', gradient: 'linear-gradient(149deg, #E8802A, #D06A1A)', shadow: 'rgba(139,92,246,0.3)', icon: 'scale', badge: 'ปกติ', img: imgVitalSugar },
];

/* ── Figma icons for stat cards ── */
const STAT_ICONS = {
  ecg: ppBp,
  heart: ppEcg,
  thermo: ppThermo,
  lungs: ppOxygen,
  drop: ppDrop,
  scale: ppDrop,
};
function StatIcon({ type }) {
  const src = STAT_ICONS[type];
  return src ? <img src={src} alt="" style={{ width: 20, height: 20 }} /> : null;
}

/* ── Tabs ── */
const tabLabels = ['Vital Signs', 'ประวัติการเยี่ยมบ้าน', 'ประวัติการจ่ายยา', 'ผลตรวจทางการแพทย์'];

/* ═══════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════ */
export default function PatientProfile({ patient, onClose }) {
  const [activeTab, setActiveTab] = useState(0);
  const [chartFilter, setChartFilter] = useState(0);
  const [historyPage, setHistoryPage] = useState(1);
  const [expandedVisit, setExpandedVisit] = useState('0-0'); // default first visit open

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
              <button className="hover-btn" style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'rgba(255,255,255,0.15)', border: 'none',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button className="hover-btn" style={{
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

          {/* ── Scrollable content below tabs ── */}
          <div style={{ flex: 1, overflowY: 'auto', paddingTop: 12 }}>

          {activeTab === 0 && (
            <div className="anim-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* ── 6 Stat Cards (4-col grid, 2 rows) ── */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                {statCards.map((s, i) => (
                  <div key={i} className={`hover-stat anim-slide-up delay-${i + 1}`} style={{
                    backgroundImage: s.gradient, borderRadius: 24, padding: 16,
                    color: '#fff', position: 'relative', overflow: 'hidden',
                    display: 'flex', flexDirection: 'column', gap: 8,
                    boxShadow: `0 4px 14px ${s.shadow}`,
                  }}>
                    {/* 3D image bottom-right */}
                    <img src={s.img} alt="" style={{ position: 'absolute', bottom: -20, right: -29, width: 90, height: 90, objectFit: 'cover', pointerEvents: 'none' }} />
                    {/* Top: icon + badge */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', height: 40 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 14, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <StatIcon type={s.icon} />
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 100, background: 'rgba(255,255,255,0.18)', color: 'rgba(255,255,255,0.9)', lineHeight: '16.5px' }}>{s.badge}</span>
                    </div>
                    {/* Label */}
                    <p style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.8)', margin: 0, lineHeight: '16px' }}>{s.label}</p>
                    {/* Value + unit */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 20, fontWeight: 700, lineHeight: '20px' }}>{s.value}</span>
                      <span style={{ fontSize: 12, lineHeight: 'normal' }}>{s.unit}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* ── Chart + BMI row ── */}
              <div style={{ display: 'flex', gap: 16 }}>

                {/* Chart section */}
                <div className="hover-card anim-slide-up delay-5" style={{ ...glassCard, flex: 1, minWidth: 0 }}>
                  {/* Chart filter tabs */}
                  <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
                    {chartFilterTabs.map((t, i) => (
                      <button
                        key={i}
                        className="hover-btn"
                        onClick={() => setChartFilter(i)}
                        style={{
                          padding: '4px 12px', borderRadius: 14, border: 'none', cursor: 'pointer',
                          fontSize: 10, fontWeight: 500, fontFamily: font,
                          background: chartFilter === i ? '#34C759' : 'rgba(0,0,0,0.04)',
                          color: chartFilter === i ? '#fff' : GRAY,
                        }}
                      >
                        {t}
                      </button>
                    ))}
                  </div>

                  {/* Legend - dynamic */}
                  <div style={{ display: 'flex', gap: 16, marginBottom: 8 }}>
                    {(chartDataSets[chartFilter] || chartDataSets[0]).lines.map(l => (
                      <div key={l.key} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: l.color, display: 'inline-block' }} />
                        <span style={{ fontSize: 10, color: GRAY }}>{l.name}</span>
                      </div>
                    ))}
                  </div>

                  {(() => {
                    const ds = chartDataSets[chartFilter] || chartDataSets[0];
                    const isMultiLine = ds.lines.length > 1;
                    return (
                      <ResponsiveContainer width="100%" height={200}>
                        <ComposedChart data={ds.data} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                          <defs>
                            {ds.lines.map(l => (
                              <linearGradient key={l.key + 'g'} id={`grad-${l.key}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={l.color} stopOpacity={0.25} />
                                <stop offset="100%" stopColor={l.color} stopOpacity={0.02} />
                              </linearGradient>
                            ))}
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" vertical={false} />
                          <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#8E8E93', fontFamily: font }} axisLine={false} tickLine={false} dy={8} />
                          <YAxis tick={{ fontSize: 10, fill: '#8E8E93' }} axisLine={false} tickLine={false} domain={ds.domain} />
                          <Tooltip content={<Tip />} />
                          {ds.lines.map(l => (
                            <Area key={l.key + 'a'} type="monotone" dataKey={l.key} fill={`url(#grad-${l.key})`} stroke="none" animationDuration={1000} />
                          ))}
                          {ds.lines.map(l => (
                            <Line key={l.key} type="monotone" dataKey={l.key} name={l.name} stroke={l.color} strokeWidth={2.5}
                              strokeDasharray={l.dash || '0'}
                              dot={{ r: 4, fill: 'white', stroke: l.color, strokeWidth: 2 }}
                              activeDot={{ r: 6, fill: l.color, stroke: 'white', strokeWidth: 2.5, style: { filter: `drop-shadow(0 2px 4px ${l.color}60)` } }}
                              animationDuration={1200} animationEasing="ease-out"
                            />
                          ))}
                        </ComposedChart>
                      </ResponsiveContainer>
                    );
                  })()}
                </div>

                {/* BMI section */}
                <div className="hover-card anim-slide-up delay-6" style={{ ...glassCard, width: 220, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: BLACK, marginBottom: 2 }}>BMI</div>
                  <div style={{ fontSize: 12, color: GRAY, marginBottom: 10 }}>Body Mass Index</div>
                  <BMIGauge bmi={19.5} />
                  <div style={{ display: 'flex', gap: 20, marginTop: 12 }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: BLACK }}>60</div>
                      <div style={{ fontSize: 9, color: GRAY }}>น้ำหนัก (kg)</div>
                    </div>
                    <div style={{ width: 1, background: 'rgba(0,0,0,0.08)', alignSelf: 'stretch' }} />
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: BLACK }}>175</div>
                      <div style={{ fontSize: 9, color: GRAY }}>ส่วนสูง (cm)</div>
                    </div>
                  </div>
                </div>
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
            <div className="anim-slide-up" style={{ ...glassCard, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🏠</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: BLACK, marginBottom: 4 }}>ประวัติการเยี่ยมบ้าน</div>
              <div style={{ fontSize: 13, color: GRAY }}>กำลังพัฒนา...</div>
            </div>
          )}

          {/* ── Tab 3: ประวัติการจ่ายยา ── */}
          {activeTab === 2 && (
            <div className="anim-slide-up" style={{ ...glassCard, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>💊</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: BLACK, marginBottom: 4 }}>ประวัติการจ่ายยา</div>
              <div style={{ fontSize: 13, color: GRAY }}>กำลังพัฒนา...</div>
            </div>
          )}

          {/* ── Tab 4: ผลตรวจทางการแพทย์ ── */}
          {activeTab === 3 && (
            <div className="anim-slide-up" style={{ ...glassCard, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔬</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: BLACK, marginBottom: 4 }}>ผลตรวจทางการแพทย์</div>
              <div style={{ fontSize: 13, color: GRAY }}>กำลังพัฒนา...</div>
            </div>
          )}
          </div>{/* end scrollable */}
        </div>{/* end main content */}
      </div>{/* end 2-column flex */}
    </div>/* end root */
  );
}
