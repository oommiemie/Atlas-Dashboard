import { useState, useContext } from 'react';
import { PatientContext } from '../App';
import CountUp from '../components/CountUp';
import {
  BarChart, Bar, PieChart, Pie, Cell, Area, AreaChart,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

import imgReport3d from '../assets/images/report-3d.png';
import imgGrid from '../assets/images/grid-bg.png';
import imgAvatarBlur from '../assets/images/avatar-blur.png';
import imgOutcomeDonut from '../assets/images/outcome-donut.png';
import imgIndicatorGreen from '../assets/images/indicator-green.png';
import imgIndicatorOrange from '../assets/images/indicator-orange.png';
import imgIndicatorRed from '../assets/images/indicator-red.png';
import imgDiseasePie from '../assets/images/disease-pie.png';
import imgFemale3d from '../assets/images/female-3d.png';
import { PATIENTS } from '../data/patients';
import imgMale3d from '../assets/images/male-3d.png';
import iconGenderFemale from '../assets/icons/gender-female.svg';
import iconAllergens from '../assets/icons/allergens.svg';
import iconBirthdayCake from '../assets/icons/birthday-cake.svg';
import iconChevronDown from '../assets/icons/chevron-down.svg';
import iconCalendarPerson from '../assets/icons/calendar-person.svg';
import iconPersonCheck from '../assets/icons/person-check.svg';
import iconTarget from '../assets/icons/target.svg';
import iconArrowUpHeart from '../assets/icons/arrow-up-heart.svg';
import iconCrossFill from '../assets/icons/cross-fill.svg';
import iconReportIcon from '../assets/icons/report-icon.svg';
import iconStarOfLife from '../assets/icons/star-of-life.svg';
import iconBoltHeart from '../assets/icons/bolt-heart.svg';
import iconFilter from '../assets/icons/filter.svg';
import iconExport from '../assets/icons/export.svg';

/* ── shared styles ── */
const font = "'IBM Plex Sans Thai Looped', sans-serif";
const BLACK = '#1E1B39';
const GRAY = '#615E83';

const cardStyle = {
  background: 'rgba(255,255,255,0.5)',
  backdropFilter: 'blur(5px)',
  border: '1px solid rgba(255,255,255,0.5)',
  borderRadius: 24,
  boxShadow: '0 2px 6px rgba(13,10,44,0.08)',
  padding: 16,
};

const chartTitleStyle = { fontSize: 16, fontWeight: 700, color: BLACK, fontFamily: font, lineHeight: 1.4 };
const chartSubStyle = { fontSize: 12, color: GRAY, fontFamily: font, lineHeight: '16px' };

/* ── Tooltip ── */
const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'rgba(255,255,255,0.95)', borderRadius: 14, padding: '10px 14px', boxShadow: '0 8px 32px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.04)' }}>
      <p style={{ fontSize: 11, fontWeight: 600, color: GRAY, marginBottom: 4, fontFamily: font }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ fontSize: 12, fontWeight: 700, color: p.color, fontFamily: font }}>{p.name}: {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}</p>
      ))}
    </div>
  );
};

/* ══════════════════════════════════════════
   MOCK DATA
   ══════════════════════════════════════════ */

const MONTHLY_TREND = [
  { month: 'ม.ค.', visits: 78000, patients: 42000 },
  { month: 'ก.พ.', visits: 92000, patients: 51000 },
  { month: 'มี.ค.', visits: 85000, patients: 48000 },
  { month: 'เม.ย.', visits: 110000, patients: 62000 },
  { month: 'พ.ค.', visits: 135000, patients: 58000 },
  { month: 'มิ.ย.', visits: 128000, patients: 72000 },
  { month: 'ก.ค.', visits: 142000, patients: 68000 },
  { month: 'ส.ค.', visits: 118000, patients: 75000 },
  { month: 'ก.ย.', visits: 105000, patients: 65000 },
  { month: 'ต.ค.', visits: 125000, patients: 82000 },
  { month: 'พ.ย.', visits: 138000, patients: 78000 },
  { month: 'ธ.ค.', visits: 115000, patients: 70000 },
];

const OUTCOME_DATA = [
  { name: 'ปกติ', value: 65, color: '#22C55E' },
  { name: 'คงที่', value: 20, color: '#F59E0B' },
  { name: 'แย่ลง', value: 10, color: '#EF4444' },
];

const TARGET_GROUPS = [
  { name: 'NCD(DM,HT)', value: 120, pct: '27.4%' },
  { name: 'ติดบ้าน/ติดเตียง/LTC', value: 156, pct: '35.6%' },
  { name: 'หญิงตั้งครรภ์/หลังคลอด', value: 35, pct: '8%' },
  { name: 'Palliative Care', value: 42, pct: '9.6%' },
  { name: 'Intermediate Care', value: 85, pct: '19.4%' },
];

const SERVICE_UNITS = [
  { name: 'PCU เมือง', visited: 95, target: 120 },
  { name: 'PCU บ้านนา', visited: 88, target: 120 },
  { name: 'PCU ท่าศาลา', visited: 102, target: 120 },
  { name: 'PCU หนองนค', visited: 78, target: 120 },
  { name: 'PCU บายบา', visited: 92, target: 120 },
];

const AGE_GROUPS = [
  { range: '0-14', count: 12 },
  { range: '15-29', count: 28 },
  { range: '30-44', count: 55 },
  { range: '45-59', count: 98 },
  { range: '60-74', count: 165 },
  { range: '75+', count: 80 },
];

const GENDER_DATA = [
  { name: 'หญิง', value: 70, color: '#EC4899' },
  { name: 'ชาย', value: 30, color: '#3B82F6' },
];

const DISEASE_DATA = [
  { name: 'DM', value: 18, color: '#312E81' },
  { name: 'HT', value: 15, color: '#3730A3' },
  { name: 'Stroke', value: 12, color: '#4338CA' },
  { name: 'CKD', value: 11, color: '#4F46E5' },
  { name: 'COPD', value: 9, color: '#6366F1' },
  { name: 'Heart Failure', value: 8, color: '#818CF8' },
  { name: 'Ca', value: 7, color: '#A78BFA' },
  { name: 'Dementia', value: 6, color: '#C4B5FD' },
  { name: 'Fracture', value: 5, color: '#DDD6FE' },
  { name: 'อื่นๆ', value: 9, color: '#EDE9FE' },
];

const ADL_MONTHLY = [
  { month: 'ต.ค.', score: 48 },
  { month: 'พ.ย.', score: 49 },
  { month: 'ธ.ค.', score: 50 },
  { month: 'ม.ค.', score: 51 },
  { month: 'ก.พ.', score: 52 },
  { month: 'มี.ค.', score: 52.3 },
];

const COMPLICATIONS = [
  { name: 'ผมตกรับ', value: 85 },
  { name: 'UTI', value: 72 },
  { name: 'Aspiration Pne..', value: 68 },
  { name: 'Joint Stiffness', value: 65 },
  { name: 'Malnutrition', value: 45 },
];

const PROCEDURES = [
  { name: 'เคลื่อน', value: 156 },
  { name: 'MO Care', value: 42 },
  { name: 'Foley Care', value: 38 },
  { name: 'Suction', value: 25 },
  { name: 'Tracheostomy', value: 12 },
];

const EQUIPMENT = [
  { name: 'เตียง', value: 156 },
  { name: 'เครื่องดูด', value: 42 },
  { name: 'Oxygen', value: 38 },
  { name: 'Suction', value: 25 },
  { name: 'Walker', value: 12 },
];

const COVERAGE_GAUGES = [
  { label: 'Intermediate Care', pct: 25 },
  { label: 'Palliative Care', pct: 45 },
  { label: 'หญิงตั้งครรภ์', pct: 62 },
  { label: 'ติดบ้าน/LTC', pct: 78 },
  { label: 'NCD', pct: 85 },
];

const OUTCOME_MONTHLY = [
  { month: 'เม.ย.', good: 60, stable: 22, worse: 12 },
  { month: 'พ.ค.', good: 62, stable: 21, worse: 11 },
  { month: 'มิ.ย.', good: 58, stable: 24, worse: 13 },
  { month: 'ก.ค.', good: 63, stable: 20, worse: 10 },
  { month: 'ส.ค.', good: 65, stable: 19, worse: 10 },
  { month: 'ก.ย.', good: 64, stable: 20, worse: 11 },
  { month: 'ต.ค.', good: 66, stable: 18, worse: 10 },
  { month: 'พ.ย.', good: 65, stable: 20, worse: 9 },
  { month: 'ธ.ค.', good: 67, stable: 19, worse: 10 },
  { month: 'ม.ค.', good: 66, stable: 20, worse: 10 },
  { month: 'ก.พ.', good: 68, stable: 18, worse: 9 },
  { month: 'มี.ค.', good: 67.3, stable: 20, worse: 10 },
];

const OUTCOME_BY_GROUP = [
  { name: 'Intermediate\nCare', good: 72, stable: 18, worse: 10 },
  { name: 'Palliative\nCare', good: 45, stable: 30, worse: 25 },
  { name: 'หญิงตั้งครรภ์\n/หลังคลอด', good: 80, stable: 15, worse: 5 },
  { name: 'ติดบ้าน\n/ติดเตียง/LTC', good: 55, stable: 25, worse: 20 },
  { name: 'NCD', good: 70, stable: 20, worse: 10 },
];

const QUALITY_GAUGES = [
  { label: 'แผลดีขึ้น', pct: 25 },
  { label: 'ADL ดีขึ้น', pct: 48 },
  { label: 'ควบคุม BP', pct: 72 },
  { label: 'ควบคุม BS', pct: 58 },
  { label: 'Med Adherence', pct: 85 },
  { label: 'Med Error', pct: 15 },
];

const PATIENT_TABLE = PATIENTS;

/* ══════════════════════════════════════════
   STAT CARD COMPONENT
   ══════════════════════════════════════════ */
function StatCard({ label, value, unit, growth, bg, iconSrc, subValue }) {
  return (
    <div className="hover-stat anim-slide-up" style={{
      background: bg, border: '1px solid rgba(255,255,255,0.7)',
      borderRadius: 24, padding: 16, color: 'white', fontFamily: font,
      position: 'relative', overflow: 'hidden', height: 130,
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      boxShadow: '0 4px 4px rgba(0,0,0,0.1)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', height: 40 }}>
        <div style={{ width: 40, height: 40, borderRadius: 14, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {iconSrc && <img src={iconSrc} alt="" style={{ width: 20, height: 20 }} />}
        </div>
        <div style={{ background: 'rgba(255,255,255,0.18)', borderRadius: 999, padding: '4px 10px', display: 'flex', alignItems: 'center' }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>↑ +{growth}%</span>
        </div>
      </div>
      <span style={{ fontSize: 11, fontWeight: 500, color: 'white', letterSpacing: 0.22 }}>{label}</span>
      {subValue ? (
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <CountUp end={value} style={{ fontSize: 20, fontWeight: 700, lineHeight: '20px' }} />
          <span style={{ fontSize: 12, fontWeight: 700, lineHeight: '12px' }}>{subValue}</span>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
          <CountUp end={value} style={{ fontSize: 26, fontWeight: 700, lineHeight: '26px' }} />
          {unit && <span style={{ fontSize: 12, lineHeight: '12px' }}>{unit}</span>}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   DONUT GAUGE COMPONENT
   ══════════════════════════════════════════ */
function DonutGauge({ pct, label, size = 100, color = '#22C55E' }) {
  const data = [
    { value: pct, color: color },
    { value: 100 - pct, color: '#E5E7EB' },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <div style={{ width: size, height: size, position: 'relative' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" cx="50%" cy="50%" innerRadius={size * 0.32} outerRadius={size * 0.45} startAngle={90} endAngle={-270} strokeWidth={0} animationDuration={1200} animationEasing="ease-out">
              {data.map((d, i) => <Cell key={i} fill={d.color} />)}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: 14, fontWeight: 700, color: BLACK, fontFamily: font }}>{pct}%</div>
      </div>
      <span style={{ fontSize: 11, color: GRAY, fontFamily: font, textAlign: 'center', maxWidth: size }}>{label}</span>
    </div>
  );
}

/* ══════════════════════════════════════════
   ARC GAUGE COMPONENT (like CgmGauge)
   ══════════════════════════════════════════ */
function OutcomeArcGauge({ segments, size = 260 }) {
  const STROKE = 28;
  const R = (size - STROKE) / 2;
  const CX = size / 2, CY = size / 2;
  // เปิดด้านล่างแค่ 50deg (sweep 310deg) — ตาม Figma
  const START_ANGLE = 115, SWEEP = 310, gapDeg = 10;

  const polar = (deg) => {
    const r = (deg * Math.PI) / 180;
    return [CX + R * Math.cos(r), CY + R * Math.sin(r)];
  };
  const arcPath = (s, e) => {
    const [x1, y1] = polar(s), [x2, y2] = polar(e);
    return `M ${x1} ${y1} A ${R} ${R} 0 ${e - s > 180 ? 1 : 0} 1 ${x2} ${y2}`;
  };

  const total = segments.reduce((a, s) => a + s.value, 0);
  let currentAngle = START_ANGLE;
  const arcs = segments.map((seg, i) => {
    const segSweep = (seg.value / total) * SWEEP;
    const start = currentAngle + (i > 0 ? gapDeg / 2 : 0);
    const end = currentAngle + segSweep - (i < segments.length - 1 ? gapDeg / 2 : 0);
    currentAngle += segSweep;
    const [dotX, dotY] = polar(end);
    return { ...seg, start, end, dotX, dotY };
  });

  const gradients = [
    { id: 'outcomeGreen', c1: '#4ACDB3', c2: '#0D7C66' },
    { id: 'outcomeOrange', c1: '#FFB347', c2: '#D97706' },
    { id: 'outcomeRed', c1: '#FB6D51', c2: '#B91C1C' },
  ];

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size}>
        <defs>
          {gradients.map(g => (
            <linearGradient key={g.id} id={g.id} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={g.c1} /><stop offset="100%" stopColor={g.c2} />
            </linearGradient>
          ))}
        </defs>
        {/* Track — เทาจางมาก */}
        <path d={arcPath(START_ANGLE, START_ANGLE + SWEEP)} fill="none" stroke="#EEEEF2" strokeWidth={STROKE} strokeLinecap="round" />
        {/* Segments */}
        {arcs.map((arc, i) => (
          <g key={i}>
            <path d={arcPath(arc.start, arc.end)} fill="none" stroke={`url(#${gradients[i]?.id || 'outcomeGreen'})`} strokeWidth={STROKE} strokeLinecap="round" />
            {/* จุดทึบ — ตาม Figma */}
            <circle cx={arc.dotX} cy={arc.dotY} r={STROKE / 2 + 2} fill={gradients[i]?.c2 || arc.color} />
          </g>
        ))}
      </svg>
    </div>
  );
}

/* ══════════════════════════════════════════
   CHART CARD TITLE COMPONENT
   ══════════════════════════════════════════ */
function ChartTitle({ title, subtitle, iconColor = '#14B8A6', emoji }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 4 }}>
      <div style={{
        width: 40, height: 40, borderRadius: 14, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', background: iconColor,
      }}>
        {emoji ? (
          <span style={{ fontSize: 20 }}>{emoji}</span>
        ) : (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <rect x="2" y="10" width="4" height="8" rx="1" fill="#fff" />
            <rect x="8" y="6" width="4" height="12" rx="1" fill="#fff" />
            <rect x="14" y="2" width="4" height="16" rx="1" fill="#fff" />
          </svg>
        )}
      </div>
      <div style={{ flex: 1 }}>
        <p style={chartTitleStyle}>{title}</p>
        {subtitle && <p style={chartSubStyle}>{subtitle}</p>}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   HORIZONTAL BAR COMPONENT
   ══════════════════════════════════════════ */
function HorizontalBars({ data, maxValue, color = '#14B8A6', showPct = true }) {
  const mx = maxValue || Math.max(...data.map(d => d.value));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {data.map((d, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: font }}>
          <span style={{ fontSize: 12, color: GRAY, minWidth: 120, textAlign: 'right', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.name}</span>
          <div style={{ flex: 1, height: 20, background: '#F1F5F9', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ width: `${(d.value / mx) * 100}%`, height: '100%', background: color, borderRadius: 10, animation: `rankBarGrow 0.8s cubic-bezier(.22,1,.36,1) ${i * 0.08}s both` }} />
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, color: BLACK, minWidth: 70 }}>{d.value}{showPct && d.pct ? ` (${d.pct})` : ''}</span>
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════
   FLOATING CARD for Arc Gauge
   ══════════════════════════════════════════ */
const FLOATING_STYLES = {
  '#22C55E': { bg: 'rgba(220,252,231,0.85)', border: 'rgba(34,197,94,0.2)', textColor: '#15803D', badgeBg: 'rgba(34,197,94,0.15)' },
  '#F59E0B': { bg: 'rgba(255,237,213,0.85)', border: 'rgba(245,158,11,0.2)', textColor: '#D97706', badgeBg: 'rgba(245,158,11,0.15)' },
  '#EF4444': { bg: 'rgba(254,226,226,0.85)', border: 'rgba(239,68,68,0.2)', textColor: '#DC2626', badgeBg: 'rgba(239,68,68,0.15)' },
};

function FloatingCard({ label, pct, count, color, style: posStyle }) {
  const s = FLOATING_STYLES[color] || FLOATING_STYLES['#22C55E'];
  return (
    <div style={{
      position: 'absolute', ...posStyle,
      background: s.bg, border: `1px solid ${s.border}`,
      borderRadius: 16, padding: '10px 14px', minWidth: 100,
      boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
      zIndex: 2,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: BLACK, fontFamily: font }}>{label}</span>
        <div style={{ background: s.badgeBg, borderRadius: 999, padding: '2px 8px' }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: s.textColor, fontFamily: font }}>{pct}%</span>
        </div>
      </div>
      <CountUp end={count} style={{ fontSize: 28, fontWeight: 700, color: s.textColor, fontFamily: font, lineHeight: 1 }} />
    </div>
  );
}

/* ══════════════════════════════════════════
   TAB 1: ภาพรวม
   ══════════════════════════════════════════ */

/* ══════════════════════════════════════════
   OUTCOME DONUT CARD — Recharts donut + floating cards
   ══════════════════════════════════════════ */
const OUTCOME_DONUT = [
  { name: 'ดีขึ้น', value: 65, count: 70, color: '#19A589', light: '#6EDCBF', dark: '#0D7C66', bg: 'rgba(220,252,231,0.85)', borderC: 'rgba(25,165,137,0.25)' },
  { name: 'คงที่', value: 20, count: 40, color: '#F59E0B', light: '#FCD34D', dark: '#D97706', bg: 'rgba(255,237,213,0.85)', borderC: 'rgba(245,158,11,0.25)' },
  { name: 'แย่ลง', value: 15, count: 40, color: '#EF4444', light: '#FCA5A5', dark: '#B91C1C', bg: 'rgba(254,226,226,0.85)', borderC: 'rgba(239,68,68,0.25)' },
];

function OutcomeStatusCard({ d, idx, hoverIdx, setHoverIdx }) {
  const isActive = hoverIdx === idx;
  const totalAll = OUTCOME_DONUT.reduce((a, x) => a + x.count, 0);
  const pct = Math.round((d.count / totalAll) * 100);

  return (
    <div
      onMouseEnter={() => setHoverIdx(idx)}
      onMouseLeave={() => setHoverIdx(null)}
      style={{
        width: 130, position: 'relative', overflow: 'hidden',
        background: `linear-gradient(145deg, ${d.bg}, rgba(255,255,255,0.95))`,
        border: `1.5px solid ${isActive ? d.color : d.borderC}`,
        borderRadius: 20, padding: '14px 16px',
        boxShadow: isActive ? `0 10px 30px ${d.color}30` : '0 2px 10px rgba(0,0,0,0.04)',
        transform: isActive ? 'scale(1.06) translateY(-2px)' : 'scale(1) translateY(0)',
        transition: 'all 0.3s cubic-bezier(.22,1,.36,1)', cursor: 'pointer',
      }}
    >
      {/* Decorative circle */}
      <div style={{
        position: 'absolute', top: -15, right: -15, width: 50, height: 50, borderRadius: '50%',
        background: `${d.color}12`, transition: 'transform 0.3s ease',
        transform: isActive ? 'scale(1.8)' : 'scale(1)',
      }} />

      {/* Header: name + badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, position: 'relative' }}>
        <div style={{
          width: 8, height: 8, borderRadius: '50%',
          background: d.color, flexShrink: 0,
          boxShadow: isActive ? `0 0 8px ${d.color}80` : 'none',
          transition: 'box-shadow 0.3s ease',
        }} />
        <span style={{ fontSize: 13, fontWeight: 600, color: BLACK, fontFamily: font }}>{d.name}</span>
        <div style={{
          marginLeft: 'auto',
          background: isActive ? d.color : 'rgba(255,255,255,0.7)',
          borderRadius: 99, padding: '2px 8px',
          transition: 'background 0.3s ease',
        }}>
          <span style={{
            fontSize: 10, fontWeight: 700, fontFamily: font,
            color: isActive ? 'white' : d.dark,
            transition: 'color 0.3s ease',
          }}>{d.value}%</span>
        </div>
      </div>

      {/* Big number */}
      <CountUp end={d.count} style={{
        fontSize: 30, fontWeight: 700, color: d.dark, fontFamily: font, lineHeight: 1,
        position: 'relative', display: 'block',
      }} />

      {/* Mini progress bar */}
      <div style={{
        marginTop: 10, height: 4, borderRadius: 100, overflow: 'hidden',
        background: `${d.color}15`, position: 'relative',
      }}>
        <div style={{
          height: '100%', borderRadius: 100,
          background: `linear-gradient(90deg, ${d.light}, ${d.color})`,
          width: isActive ? `${pct}%` : `${pct * 0.7}%`,
          transition: 'width 0.5s cubic-bezier(.22,1,.36,1)',
        }} />
      </div>
    </div>
  );
}

function OutcomeDonutCard() {
  const [hoverIdx, setHoverIdx] = useState(null);
  const total = OUTCOME_DONUT.reduce((a, d) => a + d.count, 0);
  const activeData = hoverIdx !== null ? OUTCOME_DONUT[hoverIdx] : null;

  return (
    <div className="anim-scale-in delay-4" style={{ ...cardStyle, display: 'flex', flexDirection: 'column', minHeight: 350 }}>
      <ChartTitle title="Outcome ผู้ป่วย" iconColor="#14B8A6" />

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 4 }}>
        {OUTCOME_DONUT.map((d, i) => (
          <div key={i}
            onMouseEnter={() => setHoverIdx(i)} onMouseLeave={() => setHoverIdx(null)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer',
              opacity: hoverIdx === null || hoverIdx === i ? 1 : 0.4,
              transition: 'opacity 0.2s ease',
            }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color }} />
            <span style={{ fontSize: 12, color: GRAY, fontFamily: font }}>{d.name} {d.value}%</span>
          </div>
        ))}
      </div>

      {/* Donut + cards layout */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>

          {/* Left card — ดีขึ้น */}
          <OutcomeStatusCard d={OUTCOME_DONUT[0]} idx={0} hoverIdx={hoverIdx} setHoverIdx={setHoverIdx} />

          {/* Donut center */}
          <div style={{ position: 'relative', width: 200, height: 200, flexShrink: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={OUTCOME_DONUT} dataKey="value" cx="50%" cy="50%"
                  innerRadius="58%" outerRadius="88%" paddingAngle={5} cornerRadius={6}
                  strokeWidth={0} startAngle={90} endAngle={-270}
                  onMouseEnter={(_, i) => setHoverIdx(i)}
                  onMouseLeave={() => setHoverIdx(null)}
                  animationDuration={1000} animationBegin={200}
                >
                  {OUTCOME_DONUT.map((d, i) => (
                    <Cell key={i} fill={d.color}
                      opacity={hoverIdx === null || hoverIdx === i ? 1 : 0.25}
                      style={{
                        filter: hoverIdx === i ? `drop-shadow(0 0 12px ${d.color}90)` : 'none',
                        transition: 'all 0.3s ease',
                      }}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            {/* Center */}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
              <CountUp end={activeData ? activeData.count : total} duration={800} style={{
                fontSize: 40, fontWeight: 700, fontFamily: font, lineHeight: 1,
                color: activeData ? activeData.dark : BLACK,
                transition: 'color 0.3s ease',
              }} />
              <span style={{
                fontSize: 11, fontWeight: 500, fontFamily: font, marginTop: 6,
                color: activeData ? activeData.color : GRAY,
                transition: 'color 0.3s ease',
              }}>
                {activeData ? activeData.name : 'ทั้งหมด'}
              </span>
            </div>
          </div>

          {/* Right cards — คงที่ + แย่ลง */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {OUTCOME_DONUT.slice(1).map((d, idx) => (
              <OutcomeStatusCard key={idx + 1} d={d} idx={idx + 1} hoverIdx={hoverIdx} setHoverIdx={setHoverIdx} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TabOverview() {
  const totalOutcome = OUTCOME_DATA.reduce((a, d) => a + d.value, 0);
  const outcomeSegments = [
    { value: 65, color: '#22C55E' },
    { value: 20, color: '#F59E0B' },
    { value: 10, color: '#EF4444' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Stat Cards — grid 5x2 เท่ากันหมด */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}>
        <StatCard iconSrc={iconCalendarPerson} label="เยี่ยมทั้งหมดเดือนนี้" value="1,247" unit="ครั้ง" growth="4.1" bg="linear-gradient(149deg, #3B82F6 0%, #1D4ED8 100%)" />
        <StatCard iconSrc={iconPersonCheck} label="ผู้ป่วยที่ได้รับการเยี่ยม" value="438" unit="คน" growth="6.3" bg="linear-gradient(183deg, #26C1A2 6%, #0D7C66 112%)" />
        <StatCard iconSrc={iconTarget} label="Coverage" value="78.5" unit="%" growth="7.8" bg="linear-gradient(149deg, #8B5CF6 0%, #7C3AED 100%)" />
        <StatCard iconSrc={iconArrowUpHeart} label="Outcome ดีขึ้น" value="67.3" unit="%" growth="7.8" bg="linear-gradient(149deg, #34B4E3 0%, #1398D8 100%)" />
        <StatCard iconSrc={iconCrossFill} label="Readmission" value="23" unit="ราย" growth="9.2" bg="linear-gradient(149deg, #FC9BBA 0%, #DB677E 100%)" />
        <StatCard iconSrc={iconReportIcon} label="เฉลี่ยครั้งเยี่ยม/คน" value="2.85" unit="ครั้ง" growth="4.1" bg="linear-gradient(149deg, #AC46A7 0%, #7C2471 100%)" />
        <StatCard iconSrc={iconReportIcon} label="เยี่ยมหลัง D/C เฉลี่ย" value="3.2" unit="วัน" growth="6.3" bg="linear-gradient(149deg, #E8802A 0%, #D06A1A 100%)" />
        <StatCard iconSrc={iconStarOfLife} label="ER Visit" value="18" unit="ราย" growth="7.8" bg="linear-gradient(180deg, #FF383C 0%, #992224 100%)" />
        <StatCard iconSrc={iconBoltHeart} label="ภาวะแทรกซ้อนพบบ่อย" value="Joint Stiff." subValue="65 ราย" growth="7.8" bg="linear-gradient(149deg, #FB6D51 0%, #D0381A 100%)" />
      </div>

      {/* Charts Row - 2 columns, สูงเท่ากัน */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'stretch' }}>
        {/* Left: Line Chart - แนวโน้มการเยี่ยมรายเดือน */}
        <div className="anim-scale-in delay-3" style={{ ...cardStyle, display: 'flex', flexDirection: 'column' }}>
          <ChartTitle title="แนวโน้มการเยี่ยมรายเดือน" iconColor="#14B8A6" />
          <div style={{ display: 'flex', gap: 16, marginTop: 4, marginBottom: 8 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: GRAY, fontFamily: font }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E', display: 'inline-block' }} /> จำนวนเยี่ยม
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: GRAY, fontFamily: font }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#3B82F6', display: 'inline-block' }} /> ผู้ป่วย
            </span>
          </div>
          <div style={{ flex: 1, minHeight: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MONTHLY_TREND} margin={{ top: 10, right: 10, bottom: 5, left: -10 }}>
                <defs>
                  <linearGradient id="fillVisits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22C55E" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#22C55E" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="fillPatients" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: GRAY, fontFamily: font }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: GRAY, fontFamily: font }} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? `${Math.round(v / 1000)}k` : v} />
                <Tooltip content={<Tip />} />
                <Area type="monotone" dataKey="visits" name="จำนวนเยี่ยม" stroke="#22C55E" strokeWidth={3} fill="url(#fillVisits)" dot={false} activeDot={{ r: 6, fill: '#22C55E', strokeWidth: 3, stroke: '#fff' }} animationDuration={1500} animationEasing="ease-out" />
                <Area type="monotone" dataKey="patients" name="ผู้ป่วย" stroke="#3B82F6" strokeWidth={3} fill="url(#fillPatients)" dot={false} activeDot={{ r: 6, fill: '#3B82F6', strokeWidth: 3, stroke: '#fff' }} animationDuration={1500} animationEasing="ease-out" animationBegin={200} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Outcome ผู้ป่วย — Recharts Donut + Cards */}
        <OutcomeDonutCard />
      </div>

      {/* Bottom Row - 2 columns — ตาม Figma */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Left: กลุ่มเป้าหมาย — ชื่อบน bar, สีต่างกันแต่ละแถว */}
        <div className="anim-slide-up delay-5" style={cardStyle}>
          <ChartTitle title="กลุ่มเป้าหมาย" iconColor="#14B8A6" />
          <div style={{ display: 'flex', gap: 8, marginTop: 4, marginBottom: 12 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: GRAY, fontFamily: font }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: GRAY, display: 'inline-block' }} /> เป้าหมาย
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {(() => {
              const barColors = ['#3B82F6', '#A78BFA', '#F472B6', '#F59E0B', '#22C55E'];
              const maxVal = Math.max(...TARGET_GROUPS.map(d => d.value));
              const totalVal = TARGET_GROUPS.reduce((a, d) => a + d.value, 0);
              return TARGET_GROUPS.map((d, i) => {
                const color = barColors[i % barColors.length];
                const widthPct = (d.value / maxVal) * 100;
                return (
                  <div key={i} style={{ fontFamily: font, position: 'relative' }}
                    onMouseEnter={e => {
                      const bar = e.currentTarget.querySelector('.tg-bar');
                      const tip = e.currentTarget.querySelector('.tg-tip');
                      if (bar) { bar.style.height = '16px'; bar.style.boxShadow = `0 2px 10px ${color}40`; }
                      if (tip) tip.style.opacity = '1';
                    }}
                    onMouseLeave={e => {
                      const bar = e.currentTarget.querySelector('.tg-bar');
                      const tip = e.currentTarget.querySelector('.tg-tip');
                      if (bar) { bar.style.height = '12px'; bar.style.boxShadow = 'none'; }
                      if (tip) tip.style.opacity = '0';
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 12, color: BLACK }}>{d.name}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: BLACK }}>{d.value} ({d.pct})</span>
                    </div>
                    <div style={{ height: 12, background: '#F1F5F9', borderRadius: 100, overflow: 'hidden', transition: 'height 0.2s ease', cursor: 'pointer' }} className="tg-bar">
                      <div style={{
                        height: '100%', borderRadius: 100, background: color,
                        width: `${widthPct}%`, transition: 'width 0.6s ease',
                      }} />
                    </div>
                    {/* Tooltip */}
                    <div className="tg-tip" style={{
                      position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)',
                      marginBottom: 6, opacity: 0, pointerEvents: 'none', zIndex: 20,
                      background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(12px)',
                      borderRadius: 12, padding: '10px 14px', minWidth: 180,
                      boxShadow: '0 8px 28px rgba(0,0,0,0.12)', border: '1px solid rgba(255,255,255,0.8)',
                      transition: 'opacity 0.15s ease',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                        <span style={{ fontSize: 13, fontWeight: 700, color: BLACK, fontFamily: font }}>{d.name}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 12, color: GRAY, fontFamily: font }}>จำนวน</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color, fontFamily: font }}>{d.value} ราย</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: 12, color: GRAY, fontFamily: font }}>สัดส่วน</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: BLACK, fontFamily: font }}>{d.pct}</span>
                      </div>
                      <div style={{ height: 4, borderRadius: 100, background: '#F1F5F9', overflow: 'hidden' }}>
                        <div style={{ height: '100%', borderRadius: 100, background: color, width: `${(d.value / totalVal) * 100}%`, animation: 'rankBarGrow 0.8s cubic-bezier(.22,1,.36,1) 0.3s both' }} />
                      </div>
                      <div style={{ position: 'absolute', bottom: -5, left: '50%', transform: 'translateX(-50%) rotate(45deg)', width: 10, height: 10, background: 'rgba(255,255,255,0.97)', borderRight: '1px solid rgba(255,255,255,0.8)', borderBottom: '1px solid rgba(255,255,255,0.8)' }} />
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>

        {/* Right: เยี่ยมตามหน่วยบริการ — ชื่อบน bar, เขียว+เทา */}
        <div className="anim-slide-up delay-6" style={cardStyle}>
          <ChartTitle title="เยี่ยมตามหน่วยบริการ" iconColor="#19A589" />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, marginBottom: 12 }}>
            <div style={{ display: 'flex', gap: 16 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: GRAY, fontFamily: font }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#19A589', display: 'inline-block' }} /> เยี่ยมแล้ว
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: GRAY, fontFamily: font }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#E5E7EB', display: 'inline-block' }} /> เป้าหมาย
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke={GRAY} strokeWidth="1.2"/><text x="7" y="10" textAnchor="middle" fill={GRAY} fontSize="9" fontWeight="600">i</text></svg>
              <span style={{ fontSize: 12, color: BLACK, fontFamily: font }}>ดูเพิ่มเติม</span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {SERVICE_UNITS.map((u, i) => {
              const pct = ((u.visited / u.target) * 100).toFixed(1);
              const remaining = u.target - u.visited;
              return (
                <div key={i} style={{ fontFamily: font, position: 'relative' }}
                  onMouseEnter={e => {
                    const bar = e.currentTarget.querySelector('.su-bar');
                    const tip = e.currentTarget.querySelector('.su-tip');
                    if (bar) { bar.style.height = '16px'; bar.style.boxShadow = '0 2px 10px rgba(25,165,137,0.3)'; }
                    if (tip) tip.style.opacity = '1';
                  }}
                  onMouseLeave={e => {
                    const bar = e.currentTarget.querySelector('.su-bar');
                    const tip = e.currentTarget.querySelector('.su-tip');
                    if (bar) { bar.style.height = '12px'; bar.style.boxShadow = 'none'; }
                    if (tip) tip.style.opacity = '0';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: BLACK }}>{u.name}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: BLACK }}>{u.target} ({pct}%)</span>
                  </div>
                  <div className="su-bar" style={{ height: 12, background: '#E5E7EB', borderRadius: 100, overflow: 'hidden', transition: 'height 0.2s ease, box-shadow 0.2s ease', cursor: 'pointer' }}>
                    <div style={{
                      height: '100%', borderRadius: 100,
                      background: 'linear-gradient(90deg, #4ACDB3, #19A589)',
                      width: `${pct}%`,
                      transition: 'width 0.6s ease',
                    }} />
                  </div>
                  {/* Tooltip */}
                  <div className="su-tip" style={{
                    position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)',
                    marginBottom: 6, opacity: 0, pointerEvents: 'none', zIndex: 20,
                    background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(12px)',
                    borderRadius: 12, padding: '10px 14px', minWidth: 200,
                    boxShadow: '0 8px 28px rgba(0,0,0,0.12)', border: '1px solid rgba(255,255,255,0.8)',
                    transition: 'opacity 0.15s ease',
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: BLACK, fontFamily: font, marginBottom: 8 }}>{u.name}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: GRAY, fontFamily: font }}>
                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#19A589', display: 'inline-block' }} />เยี่ยมแล้ว
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#19A589', fontFamily: font }}>{u.visited}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: GRAY, fontFamily: font }}>
                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#E5E7EB', display: 'inline-block' }} />เป้าหมาย
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: BLACK, fontFamily: font }}>{u.target}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 12, color: GRAY, fontFamily: font }}>คงเหลือ</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#E8802A', fontFamily: font }}>{remaining}</span>
                    </div>
                    <div style={{ height: 4, borderRadius: 100, background: '#E5E7EB', overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: 100, background: 'linear-gradient(90deg, #4ACDB3, #19A589)', width: `${pct}%`, animation: 'rankBarGrow 0.8s cubic-bezier(.22,1,.36,1) 0.3s both' }} />
                    </div>
                    <div style={{ position: 'absolute', bottom: -5, left: '50%', transform: 'translateX(-50%) rotate(45deg)', width: 10, height: 10, background: 'rgba(255,255,255,0.97)', borderRight: '1px solid rgba(255,255,255,0.8)', borderBottom: '1px solid rgba(255,255,255,0.8)' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   TAB 2: ประชากร & สถานะสุขภาพ
   ══════════════════════════════════════════ */
function GenderBubbleCard() {
  const [hover, setHover] = useState(null);
  const bubbles = [
    { id: 'female', label: '♀ หญิง', pct: '70%', count: '306 คน', size: 126, fontSize: 26, gradient: 'linear-gradient(135deg, #FC9BBA, #DB677E)', glow: 'rgba(219,103,126,0.4)' },
    { id: 'male', label: 'ชาย', pct: '20%', count: '88 คน', size: 89, fontSize: 16, gradient: 'linear-gradient(135deg, #34B4E3, #1398D8)', glow: 'rgba(19,152,216,0.4)' },
    { id: 'other', label: 'อื่นๆ', pct: '10%', count: '44 คน', size: 50, fontSize: 12, gradient: 'linear-gradient(135deg, #CCC, #8E8E93)', glow: 'rgba(142,142,147,0.4)' },
  ];

  const bStyle = (b, i) => {
    const isActive = hover === b.id;
    const isOther = hover !== null && hover !== b.id;
    return {
      width: b.size, height: b.size, borderRadius: '50%', border: '3px solid white',
      background: b.gradient,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer',
      transform: isActive ? 'scale(1.12)' : isOther ? 'scale(0.95)' : 'scale(1)',
      boxShadow: isActive ? `0 0 0 4px ${b.glow}, 0 12px 28px ${b.glow}` : '0 4px 12px rgba(0,0,0,0.1)',
      opacity: isOther ? 0.5 : 1,
      zIndex: isActive ? 10 : 3 - i,
      transition: 'all 0.3s cubic-bezier(.22,1,.36,1)',
    };
  };

  return (
    <div className="anim-scale-in delay-2" style={{ ...cardStyle, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', height: 217 }}>
      <ChartTitle title="สัดส่วนเพศ" iconColor="linear-gradient(135deg, #FC9BBA, #DB677E)" />
      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', position: 'relative', margin: '0 -16px -16px -16px' }}>
        {/* Female 3D */}
        <img src={imgFemale3d} alt="" style={{
          position: 'absolute', left: 0, bottom: 0, width: 150, height: 150, objectFit: 'cover', pointerEvents: 'none',
          opacity: hover === 'female' ? 1 : hover !== null ? 0.4 : 0.85,
          transition: 'opacity 0.3s ease',
        }} />

        {/* Bubbles */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', paddingRight: 10 }}>
            {/* หญิง */}
            <div className="anim-bubble delay-1" onMouseEnter={() => setHover('female')} onMouseLeave={() => setHover(null)}
              style={{ ...bStyle(bubbles[0], 0), marginRight: -10 }}>
              <span style={{ fontSize: 12, color: 'white', fontFamily: font, fontWeight: 500 }}>{bubbles[0].label}</span>
              <span style={{ fontSize: 26, fontWeight: 700, color: 'white', fontFamily: font, lineHeight: '26px' }}>{bubbles[0].pct}</span>
              {hover === 'female' && <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.8)', fontFamily: font, marginTop: 2 }}>{bubbles[0].count}</span>}
            </div>
            {/* ชาย */}
            <div className="anim-bubble delay-2" onMouseEnter={() => setHover('male')} onMouseLeave={() => setHover(null)}
              style={{ ...bStyle(bubbles[1], 1), marginRight: -10 }}>
              <span style={{ fontSize: 12, color: 'white', fontFamily: font, fontWeight: 500 }}>{bubbles[1].label}</span>
              <span style={{ fontSize: 16, fontWeight: 700, color: 'white', fontFamily: font, lineHeight: '16px' }}>{bubbles[1].pct}</span>
              {hover === 'male' && <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.8)', fontFamily: font, marginTop: 1 }}>{bubbles[1].count}</span>}
            </div>
          </div>
        </div>

        {/* Male 3D */}
        <img src={imgMale3d} alt="" style={{
          position: 'absolute', right: 0, bottom: 0, width: 150, height: 150, objectFit: 'cover', pointerEvents: 'none',
          opacity: hover === 'male' ? 1 : hover !== null ? 0.4 : 0.85,
          transition: 'opacity 0.3s ease',
        }} />

        {/* อื่นๆ — ซ้อนบนวงชมพู+ฟ้า ตรงรอยต่อ */}
        <div className="anim-bubble delay-3" onMouseEnter={() => setHover('other')} onMouseLeave={() => setHover(null)}
          style={{
            position: 'absolute', bottom: 95, left: '50%',
            transform: `translateX(-40%) ${hover === 'other' ? 'scale(1.2)' : hover !== null ? 'scale(0.9)' : 'scale(1)'}`,
            ...bStyle(bubbles[2], 2),
            width: 50, height: 50, zIndex: hover === 'other' ? 10 : 4,
          }}>
          <span style={{ fontSize: 8, color: 'white', fontFamily: font, fontWeight: 500 }}>{bubbles[2].label}</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'white', fontFamily: font, lineHeight: '12px' }}>{bubbles[2].pct}</span>
        </div>
      </div>
    </div>
  );
}

function DiseasePieCard() {
  const [hoverIdx, setHoverIdx] = useState(null);
  const total = DISEASE_DATA.reduce((a, d) => a + d.value, 0);
  const activeD = hoverIdx !== null ? DISEASE_DATA[hoverIdx] : null;

  return (
    <div className="anim-scale-in delay-4" style={{ ...cardStyle, height: 450, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <div style={{ width: 40, height: 40, borderRadius: 14, background: '#6658E1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src={iconAllergens} alt="" style={{ width: 20, height: 20 }} />
        </div>
        <span style={{ fontSize: 16, fontWeight: 700, color: BLACK, fontFamily: font }}>โรคประจำตัวหลัก</span>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Donut */}
        <div style={{ position: 'relative', width: 200, height: 200, flexShrink: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={DISEASE_DATA} dataKey="value" cx="50%" cy="50%"
                innerRadius="50%" outerRadius="90%" paddingAngle={2} cornerRadius={4}
                strokeWidth={0} startAngle={90} endAngle={-270}
                onMouseEnter={(_, i) => setHoverIdx(i)}
                onMouseLeave={() => setHoverIdx(null)}
                animationDuration={1000}
              >
                {DISEASE_DATA.map((d, i) => (
                  <Cell key={i} fill={d.color}
                    opacity={hoverIdx === null || hoverIdx === i ? 1 : 0.3}
                    style={{
                      filter: hoverIdx === i ? `drop-shadow(0 0 10px ${d.color}80)` : 'none',
                      transition: 'all 0.3s ease',
                    }}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          {/* Center */}
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
            <span style={{
              fontSize: 32, fontWeight: 700, fontFamily: font, lineHeight: 1,
              color: activeD ? activeD.color : BLACK,
              transition: 'color 0.3s ease',
            }}>
              {activeD ? `${activeD.value}%` : `${total}%`}
            </span>
            <span style={{
              fontSize: 11, fontWeight: 500, fontFamily: font, marginTop: 4,
              color: activeD ? activeD.color : GRAY,
              transition: 'color 0.3s ease',
            }}>
              {activeD ? activeD.name : 'ทั้งหมด'}
            </span>
          </div>
        </div>

        {/* Legend list */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6, overflowY: 'auto', maxHeight: 340 }}>
          {DISEASE_DATA.map((d, i) => {
            const isActive = hoverIdx === i;
            const pctWidth = (d.value / DISEASE_DATA[0].value) * 100;
            return (
              <div key={i}
                onMouseEnter={() => setHoverIdx(i)}
                onMouseLeave={() => setHoverIdx(null)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '6px 10px', borderRadius: 12, cursor: 'pointer',
                  background: isActive ? `${d.color}12` : 'transparent',
                  border: `1.5px solid ${isActive ? d.color : 'transparent'}`,
                  transition: 'all 0.2s ease',
                }}>
                <div style={{
                  width: 10, height: 10, borderRadius: '50%', background: d.color, flexShrink: 0,
                  boxShadow: isActive ? `0 0 6px ${d.color}80` : 'none',
                  transition: 'box-shadow 0.2s ease',
                }} />
                <span style={{
                  fontSize: 12, fontFamily: font, flex: 1,
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? BLACK : GRAY,
                }}>{d.name}</span>
                {/* Mini bar */}
                <div style={{ width: 50, height: 6, borderRadius: 100, background: 'rgba(0,0,0,0.04)', overflow: 'hidden', flexShrink: 0 }}>
                  <div style={{
                    height: '100%', borderRadius: 100, background: d.color,
                    width: `${pctWidth}%`,
                    transition: 'width 0.4s ease',
                  }} />
                </div>
                <span style={{
                  fontSize: 12, fontFamily: font, fontWeight: 600, minWidth: 30, textAlign: 'right',
                  color: isActive ? d.color : BLACK,
                }}>{d.value}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const TARGET_CARDS = [
  { name: 'ติดบ้าน/ติดเตียง/LTC', value: 156, pct: '35.6%', icon: '🏠', gradient: 'linear-gradient(135deg, #F59E0B, #D97706)', light: '#FEF3C7' },
  { name: 'NCD (DM, HT)', value: 120, pct: '27.4%', icon: '💊', gradient: 'linear-gradient(135deg, #22C55E, #15803D)', light: '#DCFCE7' },
  { name: 'Intermediate Care', value: 85, pct: '19.4%', icon: '🏥', gradient: 'linear-gradient(135deg, #3B82F6, #1D4ED8)', light: '#DBEAFE' },
  { name: 'Palliative Care', value: 42, pct: '9.6%', icon: '🕊️', gradient: 'linear-gradient(135deg, #8B5CF6, #6D28D9)', light: '#EDE9FE' },
  { name: 'หญิงตั้งครรภ์/หลังคลอด', value: 35, pct: '8%', icon: '🤰', gradient: 'linear-gradient(135deg, #EC4899, #BE185D)', light: '#FCE7F3' },
];

function TargetGroupCards() {
  const [hoverIdx, setHoverIdx] = useState(null);
  const total = TARGET_CARDS.reduce((a, d) => a + d.value, 0);
  const maxVal = TARGET_CARDS[0].value;

  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <ChartTitle title="กลุ่มเป้าหมาย" iconColor="#8B5CF6" />
        <span style={{ fontSize: 12, color: GRAY, fontFamily: font }}>รวม <b style={{ color: BLACK, fontSize: 14 }}>{total}</b> ราย</span>
      </div>

      {/* Ranked list — ออกแบบใหม่ */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {TARGET_CARDS.map((d, i) => {
          const isActive = hoverIdx === i;
          const pctNum = Math.round((d.value / total) * 100);
          const barWidth = (d.value / maxVal) * 100;
          return (
            <div key={i}
              onMouseEnter={() => setHoverIdx(i)}
              onMouseLeave={() => setHoverIdx(null)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 14px', borderRadius: 16, cursor: 'pointer',
                background: isActive ? d.light : 'transparent',
                border: `1.5px solid ${isActive ? d.gradient.includes('#F59E0B') ? '#F59E0B40' : d.gradient.includes('#22C55E') ? '#22C55E40' : d.gradient.includes('#3B82F6') ? '#3B82F640' : d.gradient.includes('#8B5CF6') ? '#8B5CF640' : '#EC489940' : 'transparent'}`,
                transform: isActive ? 'translateX(4px)' : 'translateX(0)',
                transition: 'all 0.25s cubic-bezier(.22,1,.36,1)',
              }}>

              {/* Icon bubble */}
              <div style={{
                width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                background: isActive ? d.gradient : `${d.light}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18,
                boxShadow: isActive ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
                border: isActive ? '2px solid rgba(255,255,255,0.8)' : '2px solid transparent',
                transition: 'all 0.25s ease',
              }}>{d.icon}</div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{
                    fontSize: 13, fontFamily: font,
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? BLACK : GRAY,
                    transition: 'all 0.2s ease',
                  }}>{d.name}</span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, flexShrink: 0 }}>
                    <span style={{
                      fontSize: 16, fontWeight: 700, fontFamily: font,
                      color: BLACK,
                    }}>{d.value}</span>
                    <span style={{ fontSize: 11, color: GRAY, fontFamily: font }}>ราย</span>
                  </div>
                </div>

                {/* Bar + pct */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    flex: 1, height: isActive ? 10 : 8, borderRadius: 100,
                    background: '#F1F5F9', overflow: 'hidden',
                    transition: 'height 0.2s ease',
                  }}>
                    <div style={{
                      height: '100%', borderRadius: 100,
                      background: d.gradient,
                      width: `${barWidth}%`,
                      boxShadow: isActive ? '0 1px 6px rgba(0,0,0,0.15)' : 'none',
                      transition: 'width 0.6s ease, box-shadow 0.2s ease',
                    }} />
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: 600, fontFamily: font,
                    color: isActive ? BLACK : GRAY,
                    minWidth: 36, textAlign: 'right',
                    transition: 'color 0.2s ease',
                  }}>{d.pct}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getCoverageColor(pct) {
  if (pct < 40) return { color: '#EF4444', light: '#FEE2E2', label: 'แย่', glow: 'rgba(239,68,68,0.3)' };
  if (pct <= 65) return { color: '#F59E0B', light: '#FEF3C7', label: 'ปานกลาง', glow: 'rgba(245,158,11,0.3)' };
  return { color: '#22C55E', light: '#DCFCE7', label: 'ดี', glow: 'rgba(34,197,94,0.3)' };
}

function CoverageGaugeItem({ pct, label }) {
  const [hover, setHover] = useState(false);
  const { color, light, label: status, glow } = getCoverageColor(pct);
  const SIZE = 90;
  const data = [
    { value: pct, fill: color },
    { value: 100 - pct, fill: '#F1F5F9' },
  ];

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
        cursor: 'pointer', position: 'relative',
        transform: hover ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'transform 0.25s ease',
      }}>
      <div style={{
        width: SIZE, height: SIZE, position: 'relative',
        filter: hover ? `drop-shadow(0 4px 12px ${glow})` : 'none',
        transition: 'filter 0.25s ease',
      }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" cx="50%" cy="50%"
              innerRadius="65%" outerRadius="90%" startAngle={90} endAngle={-270}
              strokeWidth={0} cornerRadius={6} paddingAngle={2}
              animationDuration={1000}>
              {data.map((d, i) => <Cell key={i} fill={d.fill} />)}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{
            fontSize: hover ? 20 : 18, fontWeight: 700, color, fontFamily: font,
            transition: 'font-size 0.2s ease',
          }}>{pct}%</span>
        </div>
      </div>
      <span style={{
        fontSize: 11, color: hover ? BLACK : GRAY, fontFamily: font, textAlign: 'center',
        maxWidth: SIZE + 20, fontWeight: hover ? 600 : 400,
        transition: 'all 0.2s ease',
      }}>{label}</span>

      {/* Hover tooltip */}
      {hover && (
        <div style={{
          position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)',
          marginBottom: 8, zIndex: 20, pointerEvents: 'none',
          background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(12px)',
          borderRadius: 12, padding: '10px 14px', minWidth: 140,
          boxShadow: '0 8px 28px rgba(0,0,0,0.12)', border: '1px solid rgba(255,255,255,0.8)',
          whiteSpace: 'nowrap',
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: BLACK, fontFamily: font, marginBottom: 6 }}>{label}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: 4 }}>
            <span style={{ fontSize: 11, color: GRAY, fontFamily: font }}>Coverage</span>
            <span style={{ fontSize: 14, fontWeight: 700, color, fontFamily: font }}>{pct}%</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
            <span style={{ fontSize: 11, color: GRAY, fontFamily: font }}>สถานะ:</span>
            <span style={{ fontSize: 12, fontWeight: 600, color, fontFamily: font, background: light, padding: '1px 8px', borderRadius: 99 }}>{status}</span>
          </div>
          <div style={{ height: 4, borderRadius: 100, background: '#F1F5F9', overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 100, background: color, width: `${pct}%` }} />
          </div>
          <div style={{ position: 'absolute', bottom: -5, left: '50%', transform: 'translateX(-50%) rotate(45deg)', width: 10, height: 10, background: 'rgba(255,255,255,0.97)', borderRight: '1px solid rgba(255,255,255,0.8)', borderBottom: '1px solid rgba(255,255,255,0.8)' }} />
        </div>
      )}
    </div>
  );
}

function CoverageSection() {
  return (
    <div style={cardStyle}>
      <ChartTitle title="กลุ่มเป้าหมาย & Coverage" iconColor="#14B8A6" />
      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, marginTop: 4, marginBottom: 12, flexWrap: 'wrap' }}>
        {[
          { label: '< 40% แย่', color: '#EF4444' },
          { label: '40-65% ปานกลาง', color: '#F59E0B' },
          { label: '> 65% ดี', color: '#22C55E' },
        ].map((l, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: l.color }} />
            <span style={{ fontSize: 11, color: GRAY, fontFamily: font }}>{l.label}</span>
          </div>
        ))}
      </div>
      {/* Gauges */}
      <div style={{ display: 'flex', justifyContent: 'space-around' }}>
        {COVERAGE_GAUGES.map((g, i) => (
          <CoverageGaugeItem key={i} pct={g.pct} label={g.label} />
        ))}
      </div>
    </div>
  );
}

function InteractiveHBarCard({ title, iconColor, data, colors }) {
  const [hoverIdx, setHoverIdx] = useState(null);
  const mx = Math.max(...data.map(d => d.value));
  const total = data.reduce((a, d) => a + d.value, 0);

  return (
    <div className="anim-slide-up delay-6" style={cardStyle}>
      <ChartTitle title={title} iconColor={iconColor} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
        {data.map((d, i) => {
          const color = colors[i % colors.length];
          const isActive = hoverIdx === i;
          const pctOfMax = (d.value / mx) * 100;
          const pctOfTotal = Math.round((d.value / total) * 100);
          return (
            <div key={i}
              onMouseEnter={() => setHoverIdx(i)}
              onMouseLeave={() => setHoverIdx(null)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, fontFamily: font,
                padding: '6px 8px', borderRadius: 12, cursor: 'pointer', position: 'relative',
                background: isActive ? `${color}08` : 'transparent',
                transition: 'background 0.2s ease',
              }}>
              {/* Rank number */}
              <span style={{
                fontSize: 13, fontWeight: 700, width: 18, textAlign: 'center', flexShrink: 0,
                color: isActive ? color : (i < 3 ? color : GRAY),
                transition: 'color 0.2s ease',
              }}>{i + 1}</span>
              {/* Name */}
              <span style={{
                fontSize: 12, width: 90, textAlign: 'right', flexShrink: 0,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                color: isActive ? BLACK : GRAY,
                fontWeight: isActive ? 600 : 400,
                transition: 'all 0.2s ease',
              }}>{d.name}</span>
              {/* Bar */}
              <div style={{
                flex: 1, height: isActive ? 18 : 14, borderRadius: 100,
                background: '#F1F5F9', overflow: 'hidden',
                transition: 'height 0.25s ease',
                boxShadow: isActive ? `0 2px 8px ${color}30` : 'none',
              }}>
                <div style={{
                  height: '100%', borderRadius: 100,
                  background: `linear-gradient(90deg, ${color}, ${color}CC)`,
                  width: `${pctOfMax}%`,
                  transition: 'width 0.6s ease',
                }} />
              </div>
              {/* Value */}
              <span style={{
                fontSize: 13, fontWeight: 700, width: 35, textAlign: 'right', flexShrink: 0,
                color: isActive ? color : BLACK,
                transition: 'color 0.2s ease',
              }}>{d.value}</span>

              {/* Tooltip on hover */}
              {isActive && (
                <div style={{
                  position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)',
                  marginBottom: 6, zIndex: 20, pointerEvents: 'none',
                  background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(12px)',
                  borderRadius: 12, padding: '8px 14px', minWidth: 160,
                  boxShadow: '0 8px 28px rgba(0,0,0,0.12)', border: '1px solid rgba(255,255,255,0.8)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: BLACK, fontFamily: font }}>{d.name}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span style={{ fontSize: 11, color: GRAY, fontFamily: font }}>จำนวน</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color, fontFamily: font }}>{d.value}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 11, color: GRAY, fontFamily: font }}>สัดส่วน</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: BLACK, fontFamily: font }}>{pctOfTotal}%</span>
                  </div>
                  <div style={{ height: 4, borderRadius: 100, background: '#F1F5F9', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 100, background: color, width: `${pctOfTotal}%` }} />
                  </div>
                  <div style={{ position: 'absolute', bottom: -5, left: '50%', transform: 'translateX(-50%) rotate(45deg)', width: 10, height: 10, background: 'rgba(255,255,255,0.97)', borderRight: '1px solid rgba(255,255,255,0.8)', borderBottom: '1px solid rgba(255,255,255,0.8)' }} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TabPopulation() {
  const barColors = ['#3B82F6', '#A78BFA', '#F472B6', '#F59E0B', '#22C55E'];
  const maxTarget = Math.max(...TARGET_GROUPS.map(d => d.value));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Stat Cards — 4 ใบ สีตาม Figma */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <StatCard iconSrc={iconPersonCheck} label="ผู้ป่วยทั้งหมด" value="438" unit="ราย" growth="4.1" bg="linear-gradient(149deg, #3B82F6 0%, #1D4ED8 100%)" />
        <StatCard iconSrc={iconReportIcon} label="อายุเฉลี่ย" value="62.5" unit="ปี" growth="6.3" bg="linear-gradient(149deg, #EC4899 0%, #BE185D 100%)" />
        <StatCard iconSrc={iconArrowUpHeart} label="ADL เฉลี่ย (ก่อน)" value="52.3" unit="คะแนน" growth="7.8" bg="linear-gradient(149deg, #14B8A6 0%, #0D9488 100%)" />
        <StatCard iconSrc={iconStarOfLife} label="ความรุนแรงซ้ำ" value="188" unit="ราย" growth="7.8" bg="linear-gradient(149deg, #EF4444 0%, #DC2626 100%)" />
      </div>

      {/* Row: ซ้าย (สัดส่วนเพศ + อายุ ซ้อนกัน) | ขวา (โรคประจำตัว เต็ม) — ตาม Figma layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Left column — 2 cards ซ้อน */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: 450 }}>
          {/* สัดส่วนเพศ — Bubble chart แบ่งสัดส่วน */}
          <GenderBubbleCard />

          {/* จำนวนตามช่วงอายุ — Bar เขียว teal rounded-top-100px */}
          <div className="anim-scale-in delay-3" style={{ ...cardStyle, flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 40, height: 40, borderRadius: 14, background: 'linear-gradient(135deg, #19A589, #0D7C66)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src={iconBirthdayCake} alt="" style={{ width: 20, height: 20 }} />
              </div>
              <span style={{ fontSize: 16, fontWeight: 700, color: BLACK, fontFamily: font }}>จำนวนตามช่วงอายุ</span>
            </div>
            <div style={{ flex: 1, marginTop: 8 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={AGE_GROUPS} margin={{ top: 5, right: 10, bottom: 5, left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" vertical={false} />
                  <XAxis dataKey="range" tick={{ fontSize: 12, fill: GRAY, fontFamily: font }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: GRAY, fontFamily: font }} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? `${Math.round(v/1000)}k` : v} />
                  <Tooltip content={<Tip />} />
                  <Bar dataKey="count" name="จำนวน" radius={[100, 100, 0, 0]} barSize={28} animationDuration={1000}>
                    {AGE_GROUPS.map((_, i) => <Cell key={i} fill={`url(#barGreenGrad${i})`} />)}
                  </Bar>
                  <defs>
                    {AGE_GROUPS.map((_, i) => (
                      <linearGradient key={i} id={`barGreenGrad${i}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#19A589" /><stop offset="100%" stopColor="#0D7C66" />
                      </linearGradient>
                    ))}
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right column — โรคประจำตัวหลัก + hover interactive */}
        <DiseasePieCard />
      </div>

      {/* Row: ADL Score + ภาวะแทรกซ้อน */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* ADL Score — Line chart สีม่วง + จุด */}
        <div className="anim-slide-up delay-5" style={cardStyle}>
          <ChartTitle title="แนวโน้ม ADL Score รายเดือน" iconColor="#8B5CF6" />
          <div style={{ marginTop: 12, height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ADL_MONTHLY} margin={{ top: 10, right: 10, bottom: 5, left: -10 }}>
                <defs>
                  <linearGradient id="fillADL" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: GRAY, fontFamily: font }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: GRAY, fontFamily: font }} axisLine={false} tickLine={false} domain={[40, 60]} />
                <Tooltip content={<Tip />} />
                <Area type="monotone" dataKey="score" name="ADL Score" stroke="#8B5CF6" strokeWidth={2.5} fill="url(#fillADL)" dot={{ r: 4, fill: '#8B5CF6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, fill: '#8B5CF6', strokeWidth: 3, stroke: '#fff' }} animationDuration={1200} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ภาวะแทรกซ้อนที่พบ */}
        <InteractiveHBarCard title="ภาวะแทรกซ้อนที่พบ" iconColor="#EF4444" data={COMPLICATIONS}
          colors={['#EF4444', '#F87171', '#FB923C', '#FBBF24', '#FCD34D']} />
      </div>

      {/* Row: พัฒนาการ + อุปกรณ์ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <InteractiveHBarCard title="หัตถการที่ดำเนินการ" iconColor="#3B82F6" data={PROCEDURES}
          colors={['#1D4ED8', '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE']} />
        <InteractiveHBarCard title="อุปกรณ์ที่ใช้" iconColor="#8B5CF6" data={EQUIPMENT}
          colors={['#6D28D9', '#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE']} />
      </div>

      {/* Coverage Gauges — สีตามเกณฑ์ + hover */}
      <CoverageSection />

      {/* กลุ่มเป้าหมาย — Treemap cards */}
      <TargetGroupCards />
    </div>
  );
}

/* ══════════════════════════════════════════
   TAB 3: ผลลัพธ์การดูแล
   ══════════════════════════════════════════ */
function Outcome3DBarCard() {
  const [hover, setHover] = useState(null);
  const maxVal = 100; // เป็น %
  const BAR_W = 36, DEPTH = 10, CHART_H = 200;
  const yTicks = [
    { label: '100%', pct: 0 },
    { label: '50%', pct: 50 },
    { label: '0', pct: 100 },
  ];

  return (
    <div className="anim-slide-up delay-7" style={cardStyle}>
      <ChartTitle title="Outcome ตามกลุ่มเป้าหมาย (%)" iconColor="#14B8A6" />
      <div style={{ display: 'flex', marginTop: 16 }}>
        {/* Y axis */}
        <div style={{ width: 40, position: 'relative', height: CHART_H }}>
          {yTicks.map(t => (
            <span key={t.label} style={{
              position: 'absolute', top: `${t.pct}%`, transform: 'translateY(-50%)',
              fontSize: 12, color: GRAY, fontFamily: font,
            }}>{t.label}</span>
          ))}
        </div>
        {/* Chart area */}
        <div style={{ flex: 1, position: 'relative', height: CHART_H }}>
          {/* Grid lines */}
          {yTicks.map(t => (
            <div key={t.label} style={{
              position: 'absolute', top: `${t.pct}%`, left: 0, right: 0,
              borderBottom: '1px dashed rgba(0,0,0,0.06)',
            }} />
          ))}
          {/* 3D Bars — ยืนบน baseline */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, top: 0,
            display: 'flex', gap: 8, justifyContent: 'space-around',
            alignItems: 'flex-end', padding: '0 16px',
          }}>
            {OUTCOME_BY_GROUP.map((item, i) => {
              const isActive = hover === item.name;
              const barH = (item.good / maxVal) * CHART_H;
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}
                  onMouseEnter={() => setHover(item.name)} onMouseLeave={() => setHover(null)}>
                  {/* 3D bar */}
                  <div className="anim-bar-3d" style={{
                    position: 'relative', width: BAR_W + DEPTH, height: barH + DEPTH,
                    transition: 'transform 0.25s ease, filter 0.25s ease',
                    transform: isActive ? 'translateY(-4px)' : 'translateY(0)',
                    filter: isActive ? 'drop-shadow(0 8px 16px rgba(3,105,161,0.3))' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.06))',
                    cursor: 'default',
                    animationDelay: `${i * 0.1}s`,
                  }}>
                    <div style={{ position: 'absolute', bottom: 0, left: 0, width: BAR_W, height: barH, background: 'linear-gradient(180deg, #7DD3FC 0%, #38BDF8 40%, #0284C7 100%)', borderRadius: '4px 4px 0 0' }} />
                    <div style={{ position: 'absolute', bottom: 0, left: BAR_W, width: DEPTH, height: barH, background: '#0369A1', transform: 'skewY(-40deg)', transformOrigin: 'bottom left', borderRadius: '0 2px 0 0' }} />
                    <div style={{ position: 'absolute', bottom: barH, left: 0, width: BAR_W, height: DEPTH, background: '#BAE6FD', transform: 'skewX(-50deg)', transformOrigin: 'bottom left', borderRadius: '2px 2px 0 0' }} />
                  </div>

                  {/* Tooltip — อยู่นอก flow, z-index สูง */}
                  {isActive && (
                    <div style={{
                      position: 'absolute', bottom: barH + DEPTH + 12, left: '50%', transform: 'translateX(-50%)',
                      zIndex: 100, pointerEvents: 'none',
                      background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(12px)',
                      borderRadius: 12, padding: '10px 14px', minWidth: 150,
                      boxShadow: '0 8px 28px rgba(0,0,0,0.15)', border: '1px solid rgba(255,255,255,0.8)',
                      whiteSpace: 'nowrap',
                    }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: BLACK, fontFamily: font, marginBottom: 8 }}>
                        {item.name.replace(/\n/g, ' ')}
                      </div>
                      {[
                        { label: 'ดีขึ้น', value: item.good, color: '#22C55E' },
                        { label: 'คงที่', value: item.stable, color: '#F59E0B' },
                        { label: 'แย่ลง', value: item.worse, color: '#EF4444' },
                      ].map((r, j) => (
                        <div key={j} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: GRAY, fontFamily: font }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: r.color, display: 'inline-block' }} />
                            {r.label}
                          </span>
                          <span style={{ fontSize: 13, fontWeight: 700, color: r.color, fontFamily: font }}>{r.value}%</span>
                        </div>
                      ))}
                      <div style={{ marginTop: 6, height: 6, borderRadius: 100, display: 'flex', overflow: 'hidden', background: '#F1F5F9' }}>
                        <div style={{ width: `${item.good}%`, background: '#22C55E' }} />
                        <div style={{ width: `${item.stable}%`, background: '#F59E0B' }} />
                        <div style={{ width: `${item.worse}%`, background: '#EF4444' }} />
                      </div>
                      <div style={{ position: 'absolute', bottom: -5, left: '50%', transform: 'translateX(-50%) rotate(45deg)', width: 10, height: 10, background: 'rgba(255,255,255,0.97)', borderRight: '1px solid rgba(255,255,255,0.8)', borderBottom: '1px solid rgba(255,255,255,0.8)' }} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {/* X labels */}
      <div style={{ display: 'flex', paddingLeft: 40, marginTop: 8 }}>
        <div style={{ flex: 1, display: 'flex', gap: 8, justifyContent: 'space-around', padding: '0 16px' }}>
          {OUTCOME_BY_GROUP.map((item, i) => (
            <span key={i} style={{
              flex: 1, fontSize: 10, color: hover === item.name ? BLACK : GRAY, fontFamily: font,
              textAlign: 'center', whiteSpace: 'pre-line', lineHeight: 1.2,
              fontWeight: hover === item.name ? 600 : 400,
              transition: 'all 0.2s ease',
            }}>{item.name.replace(/\n/g, '\n')}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function TabOutcome() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Stat Cards — 4 ใบ สีตาม Figma */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <StatCard iconSrc={iconArrowUpHeart} label="Outcome ดีขึ้น" value="67.3" unit="%" growth="7.8" bg="linear-gradient(149deg, #14B8A6 0%, #0D9488 100%)" />
        <StatCard iconSrc={iconCrossFill} label="Readmission" value="23" unit="ราย" growth="9.2" bg="linear-gradient(149deg, #22C55E 0%, #15803D 100%)" />
        <StatCard iconSrc={iconStarOfLife} label="ER Visit" value="18" unit="ราย" growth="7.8" bg="linear-gradient(149deg, #EF4444 0%, #DC2626 100%)" />
        <StatCard iconSrc={iconBoltHeart} label="Med Adherence" value="82.3" unit="%" growth="6.3" bg="linear-gradient(149deg, #4C1D95 0%, #6D28D9 100%)" />
      </div>

      {/* ตัวชี้วัดคุณภาพ — 6 donuts สีตามเกณฑ์ + hover */}
      <div className="anim-slide-up delay-2" style={cardStyle}>
        <ChartTitle title="ตัวชี้วัดคุณภาพการดูแล" iconColor="#22C55E" />
        <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 16 }}>
          {QUALITY_GAUGES.map((g, i) => (
            <CoverageGaugeItem key={i} pct={g.pct} label={g.label} />
          ))}
        </div>
      </div>

      {/* Outcome donut + Outcome trend line */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'stretch' }}>
        <OutcomeDonutCard />

        {/* แนวโน้ม Outcome — สวย */}
        <div className="anim-scale-in delay-4" style={{ ...cardStyle, display: 'flex', flexDirection: 'column' }}>
          <ChartTitle title="แนวโน้ม Outcome รายเดือน" iconColor="#14B8A6" />
          {/* Legend with lines */}
          <div style={{ display: 'flex', gap: 20, marginTop: 4, marginBottom: 4 }}>
            {[
              { label: 'ดีขึ้น', color: '#22C55E', dash: false },
              { label: 'คงที่', color: '#F59E0B', dash: true },
              { label: 'แย่ลง', color: '#EF4444', dash: true },
            ].map((l, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="20" height="10"><line x1="0" y1="5" x2="20" y2="5" stroke={l.color} strokeWidth={l.dash ? 1.5 : 3} strokeDasharray={l.dash ? '4 2' : 'none'} /></svg>
                <span style={{ fontSize: 11, color: GRAY, fontFamily: font }}>{l.label}</span>
              </div>
            ))}
          </div>
          <div style={{ flex: 1, minHeight: 220, marginTop: 4 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={OUTCOME_MONTHLY} margin={{ top: 10, right: 16, bottom: 5, left: -10 }}>
                <defs>
                  <linearGradient id="outGoodFill2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22C55E" stopOpacity={0.35} />
                    <stop offset="50%" stopColor="#22C55E" stopOpacity={0.08} />
                    <stop offset="100%" stopColor="#22C55E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 9, fill: GRAY, fontFamily: font }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: GRAY, fontFamily: font }} axisLine={false} tickLine={false} domain={[0, 80]} unit="%" />
                <Tooltip cursor={{ stroke: '#8B5CF6', strokeWidth: 1, strokeDasharray: '4 3' }} content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  const total = payload.reduce((a, p) => a + (p.value || 0), 0);
                  return (
                    <div style={{ background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(16px)', borderRadius: 16, padding: '14px 18px', boxShadow: '0 12px 40px rgba(0,0,0,0.14)', border: '1px solid rgba(255,255,255,0.8)', minWidth: 160 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: BLACK, fontFamily: font, marginBottom: 10, borderBottom: '1px solid rgba(0,0,0,0.06)', paddingBottom: 8 }}>{label}</div>
                      {payload.map((p, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: GRAY, fontFamily: font }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, display: 'inline-block', boxShadow: `0 0 4px ${p.color}60` }} />
                            {p.name}
                          </span>
                          <span style={{ fontSize: 14, fontWeight: 700, color: p.color, fontFamily: font }}>{p.value}%</span>
                        </div>
                      ))}
                      <div style={{ marginTop: 8, height: 6, borderRadius: 100, display: 'flex', overflow: 'hidden', background: '#F1F5F9' }}>
                        {payload.map((p, i) => (
                          <div key={i} style={{ width: `${(p.value / total) * 100}%`, height: '100%', background: p.color }} />
                        ))}
                      </div>
                    </div>
                  );
                }} />
                {/* ดีขึ้น — เส้นหลัก เขียวเด่น + gradient fill */}
                <Area type="natural" dataKey="good" name="ดีขึ้น" stroke="#22C55E" strokeWidth={3} fill="url(#outGoodFill2)"
                  dot={{ r: 5, fill: 'white', strokeWidth: 2.5, stroke: '#22C55E' }}
                  activeDot={{ r: 8, fill: '#22C55E', strokeWidth: 3, stroke: '#fff', style: { filter: 'drop-shadow(0 0 6px rgba(34,197,94,0.5))' } }}
                  animationDuration={1200} />
                {/* คงที่ — เส้นรอง ส้มประ */}
                <Area type="natural" dataKey="stable" name="คงที่" stroke="#F59E0B" strokeWidth={2} strokeDasharray="6 3" fill="none"
                  dot={false}
                  activeDot={{ r: 6, fill: '#F59E0B', strokeWidth: 2, stroke: '#fff', style: { filter: 'drop-shadow(0 0 4px rgba(245,158,11,0.5))' } }}
                  animationDuration={1200} animationBegin={300} />
                {/* แย่ลง — เส้นรอง แดงประ */}
                <Area type="natural" dataKey="worse" name="แย่ลง" stroke="#EF4444" strokeWidth={2} strokeDasharray="6 3" fill="none"
                  dot={false}
                  activeDot={{ r: 6, fill: '#EF4444', strokeWidth: 2, stroke: '#fff', style: { filter: 'drop-shadow(0 0 4px rgba(239,68,68,0.5))' } }}
                  animationDuration={1200} animationBegin={500} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Outcome ตามกลุ่มเป้าหมาย — 3D Bars */}
      <Outcome3DBarCard />
    </div>
  );
}

/* ══════════════════════════════════════════
   TAB 4: รายละเอียดผู้ป่วย
   ══════════════════════════════════════════ */
function TabPatients() {
  const { openPatient } = useContext(PatientContext);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 10;

  const filtered = PATIENT_TABLE.filter(p =>
    !search || p.hn.toLowerCase().includes(search.toLowerCase()) || p.name.includes(search) || p.disease.includes(search) || p.group.includes(search)
  );
  const totalPages = Math.ceil(filtered.length / perPage);
  const rows = filtered.slice((page - 1) * perPage, page * perPage);

  const outcomeMeta = {
    'ดีขึ้น': { bg: 'rgba(52,199,89,0.2)', color: '#34C759' },
    'คงที่': { bg: 'rgba(232,128,42,0.2)', color: '#E8802A' },
    'แย่ลง': { bg: 'rgba(255,56,60,0.2)', color: '#FF383C' },
  };

  const headers = ['HN', 'ชื่อ-สกุล', 'อายุ', 'เพศ', 'กลุ่ม', 'โรค', 'ทีม', 'เยี่ยม', 'ADL', 'เยี่ยมล่าสุด', 'Outcome'];
  const gridCols = '1fr 2fr 1fr 1fr 2fr 2fr 1fr 1fr 1fr 1fr 1fr';

  const cellBase = { fontSize: 12, fontFamily: font, fontWeight: 500, color: '#1E1B39', lineHeight: 'normal' };

  return (
    <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Search */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ position: 'relative', width: 300 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', zIndex: 1 }}>
            <circle cx="11" cy="11" r="7" stroke="#8E8E93" strokeWidth="2" />
            <path d="M16 16L20 20" stroke="#8E8E93" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            type="text" placeholder="ค้นหา HN, ชื่อ, โรค, กลุ่ม..."
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            style={{
              width: '100%', height: 36, padding: '4px 16px 4px 40px', borderRadius: 100,
              border: '1px solid rgba(116,116,128,0.08)', fontSize: 12, fontFamily: font, color: BLACK,
              outline: 'none', background: 'white', backdropFilter: 'blur(2px)',
              boxSizing: 'border-box', letterSpacing: -0.23,
            }}
            onFocus={e => { e.target.style.borderColor = '#8B5CF6'; e.target.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.1)'; }}
            onBlur={e => { e.target.style.borderColor = 'rgba(116,116,128,0.08)'; e.target.style.boxShadow = 'none'; }}
          />
        </div>
      </div>

      {/* Table */}
      <div style={{ background: 'white', border: '1px solid rgba(255,255,255,0.5)', borderRadius: 16, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{
          display: 'grid', gridTemplateColumns: gridCols, gap: 10, padding: 16,
          background: 'rgba(139,92,246,0.1)', fontSize: 12, fontWeight: 700, fontFamily: font, color: '#1E1B39',
        }}>
          {headers.map((h, i) => (
            <span key={h} style={{ textAlign: [0, 4].includes(i) ? 'left' : [1].includes(i) ? 'left' : 'center' }}>{h}</span>
          ))}
        </div>

        {/* Rows */}
        {rows.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: GRAY, fontFamily: font, fontSize: 14 }}>ไม่พบข้อมูล</div>
        ) : rows.map((p, i) => {
          const om = outcomeMeta[p.outcome] || outcomeMeta['คงที่'];
          return (
            <div key={p.hn + i} className="hover-row" style={{
              display: 'grid', gridTemplateColumns: gridCols, gap: 10, padding: 16,
              alignItems: 'center', cursor: 'pointer', transition: 'background 0.15s ease',
            }}
              onClick={() => openPatient(p)}
              onMouseEnter={e => e.currentTarget.style.background = '#F5F3FF'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{ ...cellBase }}>{p.hn}</span>
              <span style={{ ...cellBase, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
              <span style={{ ...cellBase, textAlign: 'center' }}>{p.age}</span>
              <span style={{ ...cellBase, textAlign: 'center' }}>{p.gender}</span>
              <span style={{ ...cellBase }}>{p.group}</span>
              <span style={{ ...cellBase, textAlign: 'center' }}>{p.disease}</span>
              <span style={{ ...cellBase, textAlign: 'center' }}>{p.team}</span>
              <span style={{ ...cellBase, textAlign: 'center' }}>{p.visits}</span>
              <span style={{ ...cellBase, textAlign: 'center' }}>{p.adl}</span>
              <span style={{ ...cellBase, fontWeight: 400, textAlign: 'center' }}>{p.lastVisit}</span>
              <span style={{ display: 'flex', justifyContent: 'center' }}>
                <span style={{
                  fontSize: 10, fontFamily: font, color: om.color,
                  background: om.bg, padding: '4px 10px', borderRadius: 100,
                  whiteSpace: 'nowrap', lineHeight: '16px',
                }}>{p.outcome}</span>
              </span>
            </div>
          );
        })}

        {/* Pagination */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: 16, overflow: 'hidden',
        }}>
          <span style={{ fontSize: 12, color: '#615E83', fontFamily: font, lineHeight: '16px' }}>
            แสดง {(page-1)*perPage+1}-{Math.min(page*perPage, filtered.length)} จาก {filtered.length} รายการ
          </span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page <= 1} style={{
              width: 24, height: 24, borderRadius: '50%', border: 'none', cursor: page <= 1 ? 'default' : 'pointer',
              background: 'rgba(116,116,128,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: page <= 1 ? 0.3 : 1, fontSize: 12, color: GRAY,
            }}>‹</button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button key={i+1} onClick={() => setPage(i+1)} style={{
                width: 24, height: 24, borderRadius: '50%', border: 'none', cursor: 'pointer',
                background: page === i+1 ? '#7C3AED' : 'rgba(116,116,128,0.08)',
                color: page === i+1 ? 'white' : '#8E8E93',
                fontSize: 14, fontWeight: 500, fontFamily: font,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{i+1}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page >= totalPages} style={{
              width: 24, height: 24, borderRadius: '50%', border: 'none', cursor: page >= totalPages ? 'default' : 'pointer',
              background: 'rgba(116,116,128,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: page >= totalPages ? 0.3 : 1, fontSize: 12, color: GRAY,
            }}>›</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════ */
const TABS = ['ภาพรวม', 'ประชากร & สถานะสุขภาพ', 'ผลลัพธ์การดูแล', 'รายละเอียดผู้ป่วย'];

const YEAR_OPTIONS = ['ปี 2569', 'ปี 2568', 'ปี 2567'];
const MONTH_OPTIONS = ['ทุกเดือน', 'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
const UNIT_OPTIONS = ['ทุกหน่วยบริการ', 'PCU เมือง', 'PCU บ้านนา', 'PCU ท่าศาลา', 'PCU หนองนค', 'PCU บายบา'];
const TEAM_OPTIONS = ['ทุกทีม', 'ทีม A', 'ทีม B', 'ทีม C'];
const GROUP_OPTIONS = ['ทุกกลุ่ม', 'NCD', 'LTC', 'Palliative', 'Intermediate', 'หญิงตั้งครรภ์'];
const GENDER_OPTIONS = ['ทุกเพศ', 'ชาย', 'หญิง'];

const ChevronDown = () => (
  <svg className="dropdown-chevron" viewBox="0 0 10 6" fill="none">
    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function FilterDropdown({ value, options, onChange, isOpen, onToggle }) {
  return (
    <div style={{ flex: '1 0 0', position: 'relative', zIndex: isOpen ? 100 : 1 }}>
      <div className={`dropdown-trigger${isOpen ? ' open' : ''}`} onClick={onToggle}>
        <span style={{ lineHeight: '20px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</span>
        <ChevronDown />
      </div>
      {isOpen && (
        <>
          <div className="dropdown-backdrop" onClick={e => { e.stopPropagation(); onToggle(); }} />
          <div className="dropdown-menu">
            {options.map(opt => (
              <div key={opt}
                className={`dropdown-item${opt === value ? ' active' : ''}`}
                onClick={e => { e.stopPropagation(); onChange(opt); }}
              >{opt}</div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function HomeVisitReport() {
  const [activeTab, setActiveTab] = useState(0);
  const [showFilter, setShowFilter] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [filters, setFilters] = useState({
    year: 'ปี 2569', month: 'มกราคม', unit: 'ทุกหน่วยบริการ',
    team: 'ทุกทีม', group: 'ทุกกลุ่ม', gender: 'ทุกเพศ',
  });
  const updateFilter = (key, val) => { setFilters(f => ({ ...f, [key]: val })); setOpenDropdown(null); };
  const toggleDropdown = (key) => setOpenDropdown(prev => prev === key ? null : key);

  return (
    <div style={{ fontFamily: font, display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Hero / Header — ตาม Figma เป๊ะ */}
      <div className="anim-slide-up" style={{
        borderRadius: 24, position: 'relative',
        boxShadow: '0 4px 4px rgba(0,0,0,0.1)',
        minHeight: 130,
      }}>
        {/* Background layer — overflow hidden */}
        <div style={{ position: 'absolute', inset: 0, borderRadius: 24, overflow: 'hidden', pointerEvents: 'none' }}>
          {/* Blur avatars */}
          <div style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%) translateY(62px)', width: 228, height: 228 }}>
            <img src={imgAvatarBlur} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%', opacity: 0.5, filter: 'blur(25px)' }} />
          </div>
          <div style={{ position: 'absolute', left: -60, top: '50%', transform: 'translateY(-50%)', width: 228, height: 228 }}>
            <img src={imgAvatarBlur} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%', opacity: 0.5, filter: 'blur(25px)' }} />
          </div>
          {/* Grid */}
          <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: 1483, height: 315 }}>
            <img src={imgGrid} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }} />
          </div>
          {/* 3D illustration */}
          <div style={{ position: 'absolute', right: 0, top: 0, width: 200, height: 200 }}>
            <img src={imgReport3d} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
        </div>

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 1, padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
          <div>
            <p style={{ fontSize: 16, fontWeight: 500, color: 'black', fontFamily: font }}>ติดตาม</p>
            <p style={{
              fontSize: 24, fontWeight: 700, fontFamily: font, margin: '2px 0 0',
              background: 'linear-gradient(90deg, #245ADE, #8B5CF6)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>รายงานเยี่ยมบ้าน</p>
          </div>

          {/* Tabs + buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
            {/* Tab pills */}
            <div style={{
              backdropFilter: 'blur(10px)', background: 'rgba(255,255,255,0.5)',
              borderRadius: 100, padding: 4, display: 'flex',
              boxShadow: '0 4px 4px rgba(0,0,0,0.05)',
            }}>
              {TABS.map((t, i) => (
                <button key={t} className="hover-btn" onClick={() => setActiveTab(i)} style={{
                  border: 'none', borderRadius: 100, cursor: 'pointer',
                  padding: '4px 10px', minWidth: i === activeTab ? 80 : undefined,
                  fontSize: 12, fontFamily: font, whiteSpace: 'nowrap',
                  fontWeight: activeTab === i ? 600 : 400,
                  letterSpacing: -0.23,
                  background: activeTab === i ? '#0088FF' : 'transparent',
                  color: activeTab === i ? 'white' : 'black',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s ease',
                }}>{t}</button>
              ))}
            </div>

            {/* ตัวกรอง */}
            <button className="hover-btn" onClick={() => setShowFilter(f => !f)} style={{
              backdropFilter: 'blur(2px)', background: showFilter ? 'linear-gradient(135deg, #8B5CF6, #6658E1)' : 'rgba(255,255,255,0.8)',
              border: showFilter ? '1px solid rgba(139,92,246,0.3)' : '1px solid white', borderRadius: 100,
              padding: '4px 16px', height: 36,
              display: 'flex', alignItems: 'center', gap: 8,
              fontSize: 12, color: showFilter ? 'white' : 'black', fontFamily: font, cursor: 'pointer',
              transition: 'all 0.25s ease',
              boxShadow: showFilter ? '0 4px 14px rgba(139,92,246,0.3)' : 'none',
            }}>
              <img src={iconFilter} alt="" style={{ width: 12, height: 12, filter: showFilter ? 'brightness(10)' : 'none', transition: 'filter 0.25s ease' }} />
              ตัวกรอง
            </button>

            {/* Export */}
            <button
              className="hover-btn"
              onMouseEnter={e => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #8B5CF6, #6658E1)';
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.borderColor = 'rgba(139,92,246,0.3)';
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(139,92,246,0.3)';
                e.currentTarget.querySelector('img').style.filter = 'brightness(10)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.8)';
                e.currentTarget.style.color = 'black';
                e.currentTarget.style.borderColor = 'white';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.querySelector('img').style.filter = 'none';
              }}
              style={{
                backdropFilter: 'blur(2px)', background: 'rgba(255,255,255,0.8)',
                border: '1px solid white', borderRadius: 100,
                padding: '4px 16px', height: 36,
                display: 'flex', alignItems: 'center', gap: 8,
                fontSize: 12, color: 'black', fontFamily: font, cursor: 'pointer',
                transition: 'all 0.25s ease',
              }}>
              <img src={iconExport} alt="" style={{ width: 11, height: 14, transition: 'filter 0.25s ease' }} />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilter && (
        <div style={{
          background: 'white', borderRadius: 16, padding: 16,
          display: 'flex', flexDirection: 'column', gap: 10,
          overflow: 'visible',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            <span style={{ fontSize: 14, fontWeight: 500, color: 'black', fontFamily: font }}>ตัวกรอง</span>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <FilterDropdown value={filters.year} options={YEAR_OPTIONS} onChange={v => updateFilter('year', v)} isOpen={openDropdown === 'year'} onToggle={() => toggleDropdown('year')} />
            <FilterDropdown value={filters.month} options={MONTH_OPTIONS} onChange={v => updateFilter('month', v)} isOpen={openDropdown === 'month'} onToggle={() => toggleDropdown('month')} />
            <FilterDropdown value={filters.unit} options={UNIT_OPTIONS} onChange={v => updateFilter('unit', v)} isOpen={openDropdown === 'unit'} onToggle={() => toggleDropdown('unit')} />
            <FilterDropdown value={filters.team} options={TEAM_OPTIONS} onChange={v => updateFilter('team', v)} isOpen={openDropdown === 'team'} onToggle={() => toggleDropdown('team')} />
            <FilterDropdown value={filters.group} options={GROUP_OPTIONS} onChange={v => updateFilter('group', v)} isOpen={openDropdown === 'group'} onToggle={() => toggleDropdown('group')} />
            <FilterDropdown value={filters.gender} options={GENDER_OPTIONS} onChange={v => updateFilter('gender', v)} isOpen={openDropdown === 'gender'} onToggle={() => toggleDropdown('gender')} />
          </div>
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 0 && <TabOverview />}
      {activeTab === 1 && <TabPopulation />}
      {activeTab === 2 && <TabOutcome />}
      {activeTab === 3 && <TabPatients />}
    </div>
  );
}
