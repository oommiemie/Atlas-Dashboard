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
function getBmiCategory(bmi) {
  if (bmi < 18.5) return { label: 'น้ำหนักต่ำกว่าเกณฑ์', color: '#3B82F6', range: '< 18.5', advice: 'ควรเพิ่มน้ำหนักด้วยอาหารที่มีคุณค่า' };
  if (bmi < 23) return { label: 'ปกติ (สมส่วน)', color: '#34C759', range: '18.5 – 22.9', advice: 'น้ำหนักอยู่ในเกณฑ์ที่ดี รักษาไว้!' };
  if (bmi < 25) return { label: 'ท้วม', color: '#FFCC00', range: '23.0 – 24.9', advice: 'ควรควบคุมอาหารและออกกำลังกาย' };
  if (bmi < 30) return { label: 'อ้วน ระดับ 1', color: '#FF9500', range: '25.0 – 29.9', advice: 'ควรลดน้ำหนักและพบแพทย์' };
  return { label: 'อ้วน ระดับ 2', color: '#FF383C', range: '≥ 30.0', advice: 'ควรพบแพทย์เพื่อวางแผนลดน้ำหนัก' };
}

function BMIGauge({ bmi = 19.5 }) {
  const angle = Math.min(Math.max((bmi - 10) / 30, 0), 1) * 180;
  const cat = getBmiCategory(bmi);
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
      <text x="80" y="92" textAnchor="middle" fontSize="10" fill={cat.color} fontFamily={font} fontWeight="600">{cat.label}</text>
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
import imgVitalCgm from '../assets/images/vital-cgm.png';
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

const statCards = [
  { label: 'ความดันโลหิต', value: '150/77', unit: 'mmHg', gradient: 'linear-gradient(149deg, #FF383C, #992224)', shadow: 'rgba(208,56,26,0.3)', icon: 'ecg', badge: 'สูงเล็กน้อย', img: imgVitalBp },
  { label: 'ชีพจร', value: '103', unit: 'bpm', gradient: 'linear-gradient(149deg, #FC9BBA, #DB677E)', shadow: 'rgba(252,155,186,0.3)', icon: 'heart', badge: 'หัวใจเต้นเร็ว', img: imgVitalPulse },
  { label: 'อุณหภูมิ', value: '36', unit: 'C', gradient: 'linear-gradient(149deg, #3B82F6, #1D4ED8)', shadow: 'rgba(59,130,246,0.3)', icon: 'thermo', badge: 'ปกติ', img: imgVitalTemp },
  { label: 'ออกซิเจน', value: '98', unit: '%', gradient: 'linear-gradient(149deg, #8B5CF6, #7C3AED)', shadow: 'rgba(139,92,246,0.3)', icon: 'lungs', badge: 'ปกติ', img: imgVitalOxygen },
  { label: 'น้ำตาล', value: '142', unit: 'mg/dl', gradient: 'linear-gradient(149deg, #19A589, #0D7C66)', shadow: 'rgba(139,92,246,0.3)', icon: 'drop', badge: 'ปกติ', img: imgVitalSugar },
  { label: 'CGM', value: '142', unit: 'mg/dl', gradient: 'linear-gradient(149deg, #E8802A, #D06A1A)', shadow: 'rgba(232,128,42,0.3)', icon: 'scale', badge: 'ปกติ', img: imgVitalCgm },
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

/* ── Home Visit History Data ── */
const homeVisitData = [
  { month: 'มีนาคม 69', visits: [
    { day: 25, monthShort: 'มี.ค', time: '10:30 น.', visitor: 'พว.สุภาพร วงศ์สว่าง', type: 'เยี่ยมตามนัด', tags: ['Barthel Index', 'ADL', 'Cardiac Rehab'],
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
    { day: 5, monthShort: 'มี.ค', time: '09:00 น.', visitor: 'พว.สุภาพร วงศ์สว่าง', type: 'เยี่ยมตามนัด', tags: ['Barthel Index', 'Wound Care'],
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
    { day: 26, monthShort: 'ก.พ', time: '14:00 น.', visitor: 'พว.สุภาพร วงศ์สว่าง', type: 'เยี่ยมหลัง D/C', tags: ['Post-Discharge', 'Med Reconciliation'],
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
    { day: 10, monthShort: 'ก.พ', time: '10:00 น.', visitor: 'พว.กานต์ธิดา เจริญพร', type: 'เยี่ยมก่อน Admit', tags: ['Pre-Admission Assessment'],
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
    { day: 15, monthShort: 'ม.ค', time: '09:30 น.', visitor: 'พว.กานต์ธิดา เจริญพร', type: 'เยี่ยมตามนัด', tags: ['Chronic Disease', 'NCD Screening'],
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
    { day: 18, monthShort: 'เม.ย', title: 'แบบประเมิน Barthel Index Score', assessor: 'พว.สุภาพร วงศ์สว่าง', status: 'รอประเมิน', img: imgAssessBarthel,
      score: null, result: null, gradient: null, datetime: '18 เมษายน 2569 (นัดหมาย)' },
    { day: 18, monthShort: 'เม.ย', title: 'แบบประเมินเกณฑ์การให้คะแนนภาวะหายใจลำบาก', assessor: 'พว.สุภาพร วงศ์สว่าง', status: 'รอประเมิน', img: imgAssessDyspnea,
      score: null, result: null, gradient: null, datetime: '18 เมษายน 2569 (นัดหมาย)' },
  ]},
  { month: 'มีนาคม 69', items: [
    { day: 25, monthShort: 'มี.ค', title: 'แบบประเมิน Barthel Index Score', assessor: 'พว.สุภาพร วงศ์สว่าง', status: 'ประเมินแล้ว', img: imgAssessBarthel,
      score: 20, result: 'ไม่พิการ ทำกิจวัตรประจำวันได้เอง', gradient: 'linear-gradient(160deg, #34D65D, #21AB44)', datetime: '25 มีนาคม 2569 เวลา 10:30 น.' },
    { day: 25, monthShort: 'มี.ค', title: 'แบบประเมินเกณฑ์การให้คะแนนภาวะหายใจลำบาก', assessor: 'พว.สุภาพร วงศ์สว่าง', status: 'ประเมินแล้ว', img: imgAssessDyspnea,
      score: 1, result: 'เหนื่อยเฉพาะออกกำลังกายหนัก (mMRC Grade 1)', gradient: 'linear-gradient(160deg, #34D65D, #21AB44)', datetime: '25 มีนาคม 2569 เวลา 10:30 น.' },
    { day: 5, monthShort: 'มี.ค', title: 'แบบประเมินกิจวัตรประจำวัน ADL', assessor: 'พว.สุภาพร วงศ์สว่าง', status: 'ประเมินแล้ว', img: imgAssessAdl,
      score: 18, result: 'พึ่งพาเล็กน้อย ต้องช่วยเรื่องขึ้นบันได', gradient: 'linear-gradient(160deg, #34D65D, #21AB44)', datetime: '5 มีนาคม 2569 เวลา 09:00 น.' },
  ]},
  { month: 'กุมภาพันธ์ 69', items: [
    { day: 26, monthShort: 'ก.พ', title: 'แบบประเมินกิจวัตรประจำวัน ADL', assessor: 'พว.สุภาพร วงศ์สว่าง', status: 'ประเมินแล้ว', img: imgAssessAdl,
      score: 14, result: 'พึ่งพาปานกลาง ต้องช่วยเรื่องอาบน้ำ/เดินไกล', gradient: 'linear-gradient(160deg, #E8802A, #D06A1A)', datetime: '26 กุมภาพันธ์ 2569 เวลา 14:00 น.' },
    { day: 26, monthShort: 'ก.พ', title: 'แบบประเมินการควบคุมโรคหืด', assessor: 'พว.สุภาพร วงศ์สว่าง', status: 'รอประเมิน', img: imgAssessAsthma,
      score: null, result: null, gradient: null, datetime: '26 กุมภาพันธ์ 2569 (ยกเลิก — ผู้ป่วยยังอ่อนเพลียหลัง D/C)' },
    { day: 10, monthShort: 'ก.พ', title: 'แบบคัดกรองภาวะเสี่ยงสำหรับผู้ที่มีอายุ 35 ปีขึ้นไป', assessor: 'พว.กานต์ธิดา เจริญพร', status: 'ประเมินแล้ว', img: imgAssessRisk35,
      score: 8, result: 'เสี่ยงสูง (DM+HT+สูบบุหรี่+FHx)', gradient: 'linear-gradient(160deg, #FF383C, #CC2D30)', datetime: '10 กุมภาพันธ์ 2569 เวลา 10:00 น.' },
    { day: 10, monthShort: 'ก.พ', title: 'แบบประเมินเกณฑ์การให้คะแนนภาวะหายใจลำบาก', assessor: 'พว.กานต์ธิดา เจริญพร', status: 'ประเมินแล้ว', img: imgAssessDyspnea,
      score: 2, result: 'เหนื่อยเมื่อเดินเร็วหรือขึ้นทางชัน (mMRC Grade 2)', gradient: 'linear-gradient(160deg, #E8802A, #D06A1A)', datetime: '10 กุมภาพันธ์ 2569 เวลา 10:00 น.' },
  ]},
  { month: 'มกราคม 69', items: [
    { day: 15, monthShort: 'ม.ค', title: 'แบบประเมิน Barthel Index Score', assessor: 'พว.กานต์ธิดา เจริญพร', status: 'ประเมินแล้ว', img: imgAssessBarthel,
      score: 20, result: 'ไม่พิการ', gradient: 'linear-gradient(160deg, #34D65D, #21AB44)', datetime: '15 มกราคม 2569 เวลา 09:30 น.' },
    { day: 15, monthShort: 'ม.ค', title: 'แบบประเมินการควบคุมโรคหืด', assessor: 'พว.กานต์ธิดา เจริญพร', status: 'ประเมินแล้ว', img: imgAssessAsthma,
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
    { day: 25, monthShort: 'มี.ค', vn: 'VN:690325-001', serviceDate: '25 มี.ค. 2569', sendDate: '25 มี.ค. 2569', sender: 'พว.สุภาพร วงศ์สว่าง',
      meds: 'Clopidogrel 75 mg bid, Atorvastatin 40 mg od, Aspirin 81 mg od, Omeprazole 20 mg bid, Spironolactone 25 mg od, Ferrous Fumarate 200 mg tid',
      medList: [
        { name: 'Clopidogrel 75 mg', qty: 60, dose: 'รับประทานครั้งละ 1 เม็ด วันละ 2 ครั้ง', schedule: [{ s: 'check' }, { s: 'x' }, null, null] },
        { name: 'Atorvastatin 40 mg', qty: 30, dose: 'รับประทานครั้งละ 1 เม็ด ก่อนนอน', schedule: [null, null, null, { s: 'check' }] },
        { name: 'Aspirin 81 mg', qty: 30, dose: 'รับประทานครั้งละ 1 เม็ด หลังอาหารเช้า', schedule: [{ s: 'check' }, null, null, null] },
        { name: 'Omeprazole 20 mg', qty: 60, dose: 'รับประทานครั้งละ 1 เม็ด วันละ 2 ครั้ง ก่อนอาหาร', schedule: [{ s: 'check' }, null, { s: 'check' }, null] },
        { name: 'Spironolactone 25 mg', qty: 30, dose: 'รับประทานครั้งละ 1 เม็ด หลังอาหารเช้า', schedule: [{ s: 'check' }, null, null, null] },
        { name: 'Ferrous Fumarate 200 mg', qty: 90, dose: 'รับประทานครั้งละ 1 เม็ด วันละ 3 ครั้ง หลังอาหาร', schedule: [{ s: 'check' }, { s: 'check' }, { s: 'wait' }, null] },
      ] },
    { day: 5, monthShort: 'มี.ค', vn: 'VN:690305-001', serviceDate: '5 มี.ค. 2569', sendDate: '5 มี.ค. 2569', sender: 'พว.สุภาพร วงศ์สว่าง',
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
    { day: 26, monthShort: 'ก.พ', vn: 'VN:690226-001', serviceDate: '25 ก.พ. 2569 (D/C)', sendDate: '26 ก.พ. 2569', sender: 'ภก.ธนพล ศรีสมบูรณ์',
      meds: 'Clopidogrel 75 mg bid, Aspirin 81 mg od, Atorvastatin 40 mg od, Omeprazole 20 mg bid, Spironolactone 25 mg od, Ferrous Fumarate 200 mg tid, Isosorbide SL 5 mg prn',
      medList: [
        { name: 'Clopidogrel 75 mg', qty: 60, dose: 'รับประทานครั้งละ 1 เม็ด วันละ 2 ครั้ง', schedule: [{ s: 'check' }, { s: 'check' }, null, null] },
        { name: 'Aspirin 81 mg', qty: 30, dose: 'รับประทานครั้งละ 1 เม็ด หลังอาหารเช้า', schedule: [{ s: 'check' }, null, null, null] },
        { name: 'Atorvastatin 40 mg', qty: 30, dose: 'รับประทานครั้งละ 1 เม็ด ก่อนนอน', schedule: [null, null, null, { s: 'wait' }] },
      ] },
  ]},
  { month: 'มกราคม 69', items: [
    { day: 15, monthShort: 'ม.ค', vn: 'VN:690115-001', serviceDate: '15 ม.ค. 2569', sendDate: '15 ม.ค. 2569', sender: 'ภก.ธนพล ศรีสมบูรณ์',
      meds: 'Metformin 500 mg bid, Amlodipine 5 mg od, Simvastatin 20 mg od',
      medList: [
        { name: 'Metformin 500 mg', qty: 60, dose: 'รับประทานครั้งละ 1 เม็ด วันละ 2 ครั้ง หลังอาหาร', schedule: [{ s: 'check' }, null, { s: 'check' }, null] },
        { name: 'Amlodipine 5 mg', qty: 30, dose: 'รับประทานครั้งละ 1 เม็ด เช้า', schedule: [{ s: 'check' }, null, null, null] },
        { name: 'Simvastatin 20 mg', qty: 30, dose: 'รับประทานครั้งละ 1 เม็ด ก่อนนอน', schedule: [null, null, null, { s: 'check' }] },
      ] },
    { day: 2, monthShort: 'ม.ค', vn: 'VN:690102-001', serviceDate: '2 ม.ค. 2569', sendDate: '3 ม.ค. 2569', sender: 'ภก.ธนพล ศรีสมบูรณ์',
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
  const [activeTab, setActiveTab] = useState(0);
  const [chartFilter, setChartFilter] = useState(0);
  const [historyPage, setHistoryPage] = useState(1);
  const [expandedVisit, setExpandedVisit] = useState('0-0'); // default first visit open
  const [bmiHover, setBmiHover] = useState(false);
  const [visitDetail, setVisitDetail] = useState(null);
  const [assessDetail, setAssessDetail] = useState(null);
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
                      <ResponsiveContainer className="anim-chart-fade" width="100%" height={200}>
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
                <div
                  className="hover-card anim-slide-up delay-6"
                  style={{ ...glassCard, width: 220, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'visible', zIndex: bmiHover ? 200 : 1 }}
                >
                  <div style={{ fontSize: 16, fontWeight: 700, color: BLACK, marginBottom: 2 }}>BMI</div>
                  <div style={{ fontSize: 12, color: GRAY, marginBottom: 10 }}>Body Mass Index</div>
                  {/* Gauge — hover only here */}
                  <div
                    onMouseEnter={() => setBmiHover(true)}
                    onMouseLeave={() => setBmiHover(false)}
                    style={{ position: 'relative', cursor: 'pointer' }}
                  >
                    <BMIGauge bmi={19.5} />

                    {/* BMI Hover Tooltip */}
                    {bmiHover && (() => {
                    const bmiVal = 19.5;
                    const cat = getBmiCategory(bmiVal);
                    const ranges = [
                      { label: 'น้ำหนักต่ำกว่าเกณฑ์', range: '< 18.5', color: '#3B82F6', icon: '🔽' },
                      { label: 'ปกติ (สมส่วน)', range: '18.5 – 22.9', color: '#34C759', icon: '✅' },
                      { label: 'น้ำหนักเกิน', range: '23.0 – 24.9', color: '#FFCC00', icon: '⚠️' },
                      { label: 'อ้วน ระดับ 1', range: '25.0 – 29.9', color: '#FF9500', icon: '🔶' },
                      { label: 'อ้วน ระดับ 2', range: '≥ 30.0', color: '#FF383C', icon: '🔴' },
                    ];
                    return (
                      <div style={{
                        position: 'absolute', top: '50%', right: '100%', transform: 'translateY(-50%)',
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
                  {/* Weight / Height */}
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
            <div className="anim-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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

              {/* Timeline */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {homeVisitData.map((group, gi) => (
                  <div key={gi}>
                    {/* Month header */}
                    <div style={{ padding: '8px 0', fontSize: 12, fontWeight: 500, color: 'black', fontFamily: font }}>{group.month}</div>

                    {/* Visit cards */}
                    {group.visits.map((visit, vi) => (
                      <div key={vi} style={{ display: 'flex', gap: 10 }}>
                        {/* Date column + line */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, paddingBottom: 12 }}>
                          <div style={{
                            width: 48, height: 48, borderRadius: 16, flexShrink: 0,
                            background: 'linear-gradient(135deg, #19A589, #0D7C66)',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
                          }}>
                            <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.8)', fontFamily: font }}>{visit.monthShort}</span>
                            <span style={{ fontSize: 16, fontWeight: 700, color: 'white', fontFamily: font }}>{visit.day}</span>
                          </div>
                          <div style={{ width: 1, flex: 1, minHeight: 12, background: 'rgba(25,165,137,0.3)' }} />
                        </div>

                        {/* Card */}
                        <div className="hover-visit-card" onClick={() => setVisitDetail(visit.detail)} style={{
                          flex: 1, borderRadius: 16, padding: 16, position: 'relative', overflow: 'hidden',
                          border: '1px solid white', cursor: 'pointer', marginBottom: 12,
                          background: 'white',
                        }}>
                          {/* 3D image */}
                          <img src={imgHomevisit3dCard} alt="" style={{ position: 'absolute', bottom: -5, right: 0, width: 80, height: 80, objectFit: 'contain', opacity: 0.5, pointerEvents: 'none' }} />

                          {/* Time + arrow */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                            <span style={{ fontSize: 14, fontWeight: 500, color: 'black', fontFamily: font }}>{visit.time}</span>
                            <button style={{
                              width: 24, height: 24, borderRadius: 100, border: 'none', cursor: 'pointer',
                              background: '#F2F2F7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                            }}>
                              <svg width="7" height="10" viewBox="0 0 7 10" fill="none"><path d="M1 1L5 5L1 9" stroke="#8E8E93" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </button>
                          </div>

                          {/* Info row */}
                          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                              <img src={ppStethoscope} alt="" style={{ width: 14, height: 12 }} />
                              <span style={{ fontSize: 10, color: '#8E8E93', fontFamily: font }}>ผู้เยี่ยม: {visit.visitor}</span>
                            </div>
                            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                              <img src={ppTextSearch} alt="" style={{ width: 12, height: 14 }} />
                              <span style={{ fontSize: 10, color: '#8E8E93', fontFamily: font }}>ประเภทการเยี่ยม: {visit.type}</span>
                            </div>
                          </div>

                          {/* Tags */}
                          <div style={{ display: 'flex', gap: 10 }}>
                            {visit.tags.map((tag, ti) => (
                              <span key={ti} style={{
                                fontSize: 10, color: '#0D7C66', fontFamily: font,
                                background: 'rgba(25,165,137,0.2)', borderRadius: 100,
                                padding: '4px 10px',
                              }}>{tag}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Visit Detail Popup ── */}
          {visitDetail && (
            <div className="anim-backdrop" style={{
              position: 'fixed', inset: 0, zIndex: 9999,
              background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }} onClick={() => setVisitDetail(null)}>
            <div className="anim-slide-up" onClick={e => e.stopPropagation()} style={{
              backdropFilter: 'blur(50px)', background: 'rgba(255,255,255,0.95)',
              border: '1px solid rgba(255,255,255,0.8)', borderRadius: 24,
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)', padding: 20,
              display: 'flex', flexDirection: 'column', gap: 16,
              width: '90%', maxWidth: 700, maxHeight: '85vh', overflowY: 'auto',
            }}>
              {/* Detail Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 14, background: 'linear-gradient(135deg, #19A589, #0D7C66)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <img src={ppHeaderIcon} alt="" style={{ width: 20, height: 20 }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: BLACK }}>รายละเอียดการเยี่ยมบ้าน</div>
                    <div style={{ fontSize: 12, color: GRAY, marginTop: 2 }}>{visitDetail.datetime}</div>
                  </div>
                </div>
                <button
                  className="hover-btn"
                  onClick={() => setVisitDetail(null)}
                  style={{
                    width: 32, height: 32, borderRadius: 100, border: 'none', cursor: 'pointer',
                    background: '#F2F2F7', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1 1L9 9M9 1L1 9" stroke="#8E8E93" strokeWidth="1.5" strokeLinecap="round"/></svg>
                </button>
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: 'rgba(0,0,0,0.06)' }} />

              {/* Info rows */}
              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: 'black', fontFamily: font, marginBottom: 8 }}>ประเภทการเยี่ยม</div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'black', fontFamily: font }}>เยี่ยมตามนัด</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: 'black', fontFamily: font, marginBottom: 8 }}>HN</div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'black', fontFamily: font }}>{visitDetail.hn}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: 'black', fontFamily: font, marginBottom: 8 }}>เจ้าหน้าที่</div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'black', fontFamily: font }}>เจ้าหน้าที่ทดสอบ ทดลอง</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: 'black', fontFamily: font, marginBottom: 8 }}>วัน-เวลา</div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'black', fontFamily: font }}>{visitDetail.datetime}</div>
                </div>
              </div>

              {/* Mission card (blue gradient) */}
              <div style={{
                background: 'linear-gradient(160deg, #3B82F6, #1D4ED8)', borderRadius: 16, padding: 16,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <div style={{ width: 0, height: 14, borderLeft: '3px solid white' }} />
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'white', fontFamily: font }}>ภารกิจ/วัตถุประสงค์การเยี่ยม</span>
                </div>
                <div style={{ fontSize: 14, color: 'white', lineHeight: 1.6, fontFamily: font }}>{visitDetail.mission}</div>
              </div>

              {/* Section cards */}
              {[
                { title: 'ข้อมูลทางการแพทย์', content: visitDetail.medical },
                { title: 'สาเหตุการส่งเยี่ยม', content: visitDetail.reason },
              ].map((sec, i) => (
                <div key={i} style={{ background: 'white', border: '1px solid white', borderRadius: 16, padding: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                    <div style={{ width: 0, height: 14, borderLeft: '3px solid #19A589' }} />
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'black', fontFamily: font }}>{sec.title}</span>
                  </div>
                  <div style={{ fontSize: 14, color: 'black', lineHeight: 1.6, fontFamily: font, whiteSpace: 'pre-line' }}>{sec.content}</div>
                </div>
              ))}

              {/* Objective with checkmark */}
              <div style={{ background: 'white', border: '1px solid white', borderRadius: 16, padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <div style={{ width: 0, height: 14, borderLeft: '3px solid #19A589' }} />
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'black', fontFamily: font }}>วัตถุประสงค์การเยี่ยม</span>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <img src={ppCheckmarkCircle} alt="" style={{ width: 20, height: 20, flexShrink: 0, marginTop: 2 }} />
                  <div style={{ fontSize: 14, color: 'black', lineHeight: 1.6, fontFamily: font }}>{visitDetail.objective}</div>
                </div>
              </div>

              {/* Health issue */}
              <div style={{ background: 'white', border: '1px solid white', borderRadius: 16, padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <div style={{ width: 0, height: 14, borderLeft: '3px solid #19A589' }} />
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'black', fontFamily: font }}>ปัญหาสุขภาพ</span>
                </div>
                <div style={{ fontSize: 14, color: 'black', lineHeight: 1.6, fontFamily: font }}>{visitDetail.healthIssue}</div>
              </div>

              {/* Social/Environment */}
              <div style={{ background: 'white', border: '1px solid white', borderRadius: 16, padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <div style={{ width: 0, height: 14, borderLeft: '3px solid #19A589' }} />
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'black', fontFamily: font }}>ข้อมูลด้านสังคมและสิ่งแวดล้อม</span>
                </div>
                <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: 'black', fontFamily: font, marginBottom: 8 }}>จำนวนสมาชิกในบ้าน</div>
                    <div style={{ fontSize: 14, fontWeight: 500, fontFamily: font }}>{visitDetail.social.members}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: 'black', fontFamily: font, marginBottom: 8 }}>รายได้ครัวเรือน</div>
                    <div style={{ fontSize: 14, fontWeight: 500, fontFamily: font }}>{visitDetail.social.income}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: 'black', fontFamily: font, marginBottom: 8 }}>สวัสดิการ</div>
                    <div style={{ fontSize: 14, fontWeight: 500, fontFamily: font }}>{visitDetail.social.welfare}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: 'black', fontFamily: font, marginBottom: 8 }}>ปัญหาสุขภาพจิต/พฤติกรรมเสี่ยง</div>
                    <div style={{ fontSize: 14, fontWeight: 500, fontFamily: font }}>{visitDetail.social.mental}</div>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: 'black', fontFamily: font, marginBottom: 8 }}>ลักษณะสิ่งแวดล้อมบ้าน</div>
                  <div style={{ fontSize: 14, fontWeight: 500, fontFamily: font }}>{visitDetail.social.env}</div>
                </div>
              </div>

              {/* Screening grid */}
              <div style={{ background: 'white', border: '1px solid white', borderRadius: 16, padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <div style={{ width: 0, height: 14, borderLeft: '3px solid #19A589' }} />
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'black', fontFamily: font }}>ข้อมูลคัดกรอง</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                  {visitDetail.screening.map((s, i) => (
                    <div key={i} style={{ background: 'rgba(116,116,128,0.08)', borderRadius: 16, padding: 16 }}>
                      <div style={{ fontSize: 12, color: 'black', fontFamily: font, marginBottom: 8 }}>{s.label}</div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: 'black', fontFamily: font }}>{s.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Visit notes */}
              <div style={{ background: 'white', border: '1px solid white', borderRadius: 16, padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <div style={{ width: 0, height: 14, borderLeft: '3px solid #19A589' }} />
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'black', fontFamily: font }}>บันทึกการเยี่ยมบ้าน</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {visitDetail.notes.map((note, i) => (
                    <div key={i} style={{ border: '1px solid rgba(116,116,128,0.08)', borderRadius: 16, padding: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <img src={NOTE_ICONS[note.icon]} alt="" style={{ width: 12, height: 14 }} />
                        <span style={{ fontSize: 12, color: 'black', fontFamily: font }}>{note.label}</span>
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: 'black', fontFamily: font }}>{note.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            </div>
          )}

          {/* ── Tab 3: ประวัติการประเมิน ── */}
          {activeTab === 2 && (
            <div className="anim-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Hero banner — purple gradient */}
              <div style={{
                background: 'linear-gradient(175deg, #8B5CF6 0%, #7C3AED 100%)',
                borderRadius: 16, padding: 16, position: 'relative', overflow: 'hidden',
                backdropFilter: 'blur(10px)', boxShadow: '0 4px 4px rgba(0,0,0,0.1)',
                display: 'flex', gap: 16, alignItems: 'center',
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

              {/* Timeline */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {assessmentData.map((group, gi) => (
                  <div key={gi}>
                    {/* Month header */}
                    <div style={{ padding: '8px 0', fontSize: 12, fontWeight: 500, color: 'black', fontFamily: font }}>{group.month}</div>

                    {/* Assessment cards */}
                    {group.items.map((item, ii) => (
                      <div key={ii} style={{ display: 'flex', gap: 10 }}>
                        {/* Date column + line */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, paddingBottom: 12 }}>
                          <div style={{
                            width: 48, height: 48, borderRadius: 16, flexShrink: 0,
                            background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
                          }}>
                            <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.8)', fontFamily: font }}>{item.monthShort}</span>
                            <span style={{ fontSize: 16, fontWeight: 700, color: 'white', fontFamily: font }}>{item.day}</span>
                          </div>
                          <div style={{ width: 1, flex: 1, minHeight: 12, background: 'rgba(139,92,246,0.3)' }} />
                        </div>

                        {/* Card */}
                        <div className="hover-assess-card" onClick={() => item.score !== null && setAssessDetail(item)} style={{
                          flex: 1, borderRadius: 16, padding: 16, position: 'relative', overflow: 'hidden',
                          border: '1px solid white', cursor: 'pointer', marginBottom: 12,
                          background: 'linear-gradient(90deg, rgba(206,195,255,0.04) 0%, rgba(255,255,255,0.052) 100%), white',
                        }}>
                          {/* 3D image */}
                          <img src={item.img} alt="" style={{ position: 'absolute', bottom: -5, right: -5, width: 80, height: 80, objectFit: 'contain', opacity: 0.5, pointerEvents: 'none' }} />

                          {/* Title + arrow */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                            <span style={{ fontSize: 14, fontWeight: 500, color: 'black', fontFamily: font }}>{item.title}</span>
                            <button style={{
                              width: 24, height: 24, borderRadius: 100, border: 'none', cursor: 'pointer',
                              background: '#F2F2F7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                            }}>
                              <svg width="7" height="10" viewBox="0 0 7 10" fill="none"><path d="M1 1L5 5L1 9" stroke="#8E8E93" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </button>
                          </div>

                          {/* Assessor */}
                          <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 8 }}>
                            <img src={ppStethoscope} alt="" style={{ width: 14, height: 12 }} />
                            <span style={{ fontSize: 10, color: '#8E8E93', fontFamily: font }}>ผู้ประเมิน: {item.assessor}</span>
                          </div>

                          {/* Status badge */}
                          <span style={{
                            fontSize: 10, fontFamily: font, borderRadius: 100, padding: '4px 10px',
                            color: item.status === 'ประเมินแล้ว' ? '#34C759' : item.status === 'รอประเมิน' ? '#FF9500' : '#8E8E93',
                            background: item.status === 'ประเมินแล้ว' ? 'rgba(52,199,89,0.2)' : item.status === 'รอประเมิน' ? 'rgba(255,149,0,0.15)' : 'rgba(142,142,147,0.1)',
                          }}>{item.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
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
      {assessDetail && (
        <div className="anim-backdrop" style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }} onClick={() => setAssessDetail(null)}>
          <div className="anim-slide-up" onClick={e => e.stopPropagation()} style={{
            background: 'white', borderRadius: 24, padding: 16, width: 450, maxWidth: '90%',
            display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center',
            overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
                <div style={{ width: 40, height: 40, borderRadius: 14, background: '#6658E1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <img src={ppPencilClipboard} alt="" style={{ width: 20, height: 20 }} />
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: BLACK, fontFamily: font, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{assessDetail.title}</div>
                  <div style={{ fontSize: 12, color: GRAY, marginTop: 4, fontFamily: font }}>{assessDetail.datetime}</div>
                </div>
              </div>
              <button
                className="hover-btn"
                onClick={() => setAssessDetail(null)}
                style={{
                  width: 32, height: 32, borderRadius: 100, border: 'none', cursor: 'pointer',
                  background: '#F2F2F7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1 1L9 9M9 1L1 9" stroke="#8E8E93" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </button>
            </div>

            {/* Score card */}
            <div style={{
              width: '100%', borderRadius: 16, padding: 16, position: 'relative', overflow: 'hidden',
              background: assessDetail.gradient,
              display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center',
            }}>
              {/* 3D image */}
              <img src={assessDetail.img} alt="" style={{
                position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)',
                width: 125, height: 125, objectFit: 'contain', pointerEvents: 'none',
              }} />

              <div style={{ fontSize: 12, color: 'white', fontFamily: font, fontWeight: 500, letterSpacing: 0.22, marginBottom: 2 }}>คะแนน</div>
              <div style={{ fontSize: 48, fontWeight: 700, color: 'white', fontFamily: font, textShadow: '0 4px 4px rgba(0,0,0,0.25)', lineHeight: 1 }}>{assessDetail.score}</div>

              {/* Result badge */}
              <div style={{
                marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 10,
                background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)', borderRadius: 100,
                padding: '4px 10px', boxShadow: '0 4px 4px rgba(0,0,0,0.05)',
              }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="white" strokeWidth="1.2"/><path d="M7 4V7.5M7 9.5V10" stroke="white" strokeWidth="1.2" strokeLinecap="round"/></svg>
                <span style={{ fontSize: 12, color: 'white', fontFamily: font }}>{assessDetail.result}</span>
              </div>
            </div>

            {/* Assessor */}
            <div style={{
              background: 'rgba(116,116,128,0.08)', borderRadius: 100,
              padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <img src={ppStethoscope} alt="" style={{ width: 14, height: 12 }} />
              <span style={{ fontSize: 10, color: '#8E8E93', fontFamily: font }}>ผู้ประเมิน: {assessDetail.assessor}</span>
            </div>
          </div>
        </div>
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
          <span style={{ fontSize: 14, fontWeight: 500, color: 'black', fontFamily: "'IBM Plex Sans Thai Looped', sans-serif" }}>{med.name}</span>
        </div>
        <span style={{
          fontSize: 10, color: '#0088FF', fontFamily: "'IBM Plex Sans Thai Looped', sans-serif",
          background: 'rgba(0,136,255,0.2)', borderRadius: 100, padding: '4px 10px',
        }}>จำนวน {med.qty} เม็ด</span>
      </div>

      {/* Dose + expand */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 12, color: '#8E8E93', fontFamily: "'IBM Plex Sans Thai Looped', sans-serif" }}>{med.dose}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 10, color: '#8E8E93', fontFamily: "'IBM Plex Sans Thai Looped', sans-serif" }}>ดูเพิ่มเติม</span>
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
            <span style={{ fontSize: 12, fontWeight: 500, color: 'black', fontFamily: "'IBM Plex Sans Thai Looped', sans-serif" }}>1 มกราคม 2569</span>
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
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'black', fontFamily: "'IBM Plex Sans Thai Looped', sans-serif" }}>{t.label}</span>
                    <span style={{ fontSize: 10, color: '#8E8E93', fontFamily: "'IBM Plex Sans Thai Looped', sans-serif" }}>{t.time}</span>
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
