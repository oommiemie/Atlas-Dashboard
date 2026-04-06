import { useState, useEffect, useRef, useContext } from 'react';
import { PatientContext } from '../App';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {
  LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  DASHBOARD_STATS, USAGE_CHART_DATA, HOSPITAL_COMPARISON,
  DISEASE_GROUPS, CRITICAL_CASES, CGM_PATIENTS,
  PROVINCES_TOP10, FEATURE_USAGE,
} from '../data/mockData';
import { getAvatar, getStatusBadge } from '../data/patients';

import iconPatients from '../assets/icons/patients.svg';
import iconHouseCircle from '../assets/icons/house-circle.svg';
import iconHeartCircle from '../assets/icons/heart-circle.svg';
import iconWarning from '../assets/icons/warning-triangle.svg';
import iconCrossCase from '../assets/icons/cross-case.svg';
import iconChart from '../assets/icons/chart-icon.svg';
import iconInfoCircle from '../assets/icons/info-circle.svg';
import iconGaugeChart from '../assets/icons/gauge-chart.svg';
import iconHeartClipboard from '../assets/icons/heart-clipboard.svg';
import iconEcgRect from '../assets/icons/ecg-rect.svg';
import iconMapFill from '../assets/icons/map-fill.svg';
import iconFeature from '../assets/icons/feature-icon.svg';
import iconRefresh from '../assets/icons/refresh.svg';
import iconChevronBack from '../assets/icons/chevron-back.svg';
import iconChevronForward from '../assets/icons/chevron-forward.svg';
import iconEcgSmall from '../assets/icons/ecg-small.svg';
import iconHouseSmall from '../assets/icons/house-small.svg';
import imgGrid from '../assets/images/grid-bg.png';
import imgHero3d from '../assets/images/hero-3d.png';
import imgAvatarBlur from '../assets/images/avatar-blur.png';

/* ── shared styles ── */
const font = "'IBM Plex Sans Thai Looped', sans-serif";
const BLACK = '#1E1B39';
const GRAY = '#615E83';
const CARD_BG = 'rgba(255,255,255,0.5)';
const CARD_BORDER = '1px solid rgba(255,255,255,0.5)';
const CARD_RADIUS = 24;
const CARD_SHADOW = '0 2px 6px rgba(13,10,44,0.08)';

const cardStyle = {
  background: CARD_BG, backdropFilter: 'blur(5px)',
  border: CARD_BORDER, borderRadius: CARD_RADIUS,
  boxShadow: CARD_SHADOW, padding: 16,
};

const iconBoxStyle = (bg) => ({
  width: 40, height: 40, borderRadius: 14,
  background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
});

const chartTitleStyle = { fontSize: 16, fontWeight: 700, color: BLACK, fontFamily: font, lineHeight: 1.4 };
const chartSubStyle = { fontSize: 12, color: GRAY, fontFamily: font, lineHeight: '16px' };
const labelStyle = { fontSize: 12, color: GRAY, fontFamily: font };

/* ── Tooltip ── */
const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'rgba(255,255,255,0.95)', borderRadius: 14, padding: '10px 14px', boxShadow: '0 8px 32px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.04)' }}>
      <p style={{ fontSize: 11, fontWeight: 600, color: GRAY, marginBottom: 4, fontFamily: font }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ fontSize: 12, fontWeight: 700, color: p.color, fontFamily: font }}>{p.name}: {p.value.toLocaleString()}</p>
      ))}
    </div>
  );
};

/* ═══════════════════════════════════
   1. HERO SECTION
   ═══════════════════════════════════ */
const THAI_MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
];

function Hero() {
  const [now, setNow] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [monthOpen, setMonthOpen] = useState(false);
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);

  const date = now.toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  const time = now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div className="anim-slide-up" style={{
      borderRadius: 24, position: 'relative', overflow: 'visible',
      boxShadow: '0 4px 4px rgba(0,0,0,0.1)',
      minHeight: 150, zIndex: monthOpen ? 50 : 10,
    }}>
      {/* Background layer — overflow hidden เฉพาะส่วนนี้ */}
      <div style={{ position: 'absolute', inset: 0, borderRadius: 24, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%) translateY(62px)', width: 228, height: 228 }}>
          <img src={imgAvatarBlur} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%', opacity: 0.5, filter: 'blur(25px)' }} />
        </div>
        <div style={{ position: 'absolute', left: -60, top: '50%', transform: 'translateY(-50%)', width: 228, height: 228 }}>
          <img src={imgAvatarBlur} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%', opacity: 0.5, filter: 'blur(25px)' }} />
        </div>
        <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: 1483, height: 315 }}>
          <img src={imgGrid} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }} />
        </div>
        {/* 3D illustration — อยู่ใน overflow:hidden layer */}
        <div style={{ position: 'absolute', right: 0, top: 30, width: 200, height: 200 }}>
          <img src={imgHero3d} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      </div>
      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 8, padding: 16 }}>
        <span style={{ fontSize: 16, fontWeight: 500, color: 'black', fontFamily: font }}>ยินดีต้อนรับสู่</span>
        <div style={{ display: 'flex', gap: 10, alignItems: 'baseline' }}>
          <span style={{
            fontSize: 24, fontWeight: 700, fontFamily: font,
            background: 'linear-gradient(270deg, #0088FF 0%, #6658E1 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>Atlas</span>
          <span style={{ fontSize: 24, fontWeight: 700, color: 'black', fontFamily: font }}>Dashboard</span>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ position: 'relative', zIndex: monthOpen ? 100 : 1 }}>
            <div onClick={() => setMonthOpen(!monthOpen)} style={{
              width: 100, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '4px 16px', borderRadius: 100, cursor: 'pointer',
              backdropFilter: 'blur(2px)', background: 'rgba(255,255,255,0.8)',
              border: '1px solid white', boxSizing: 'border-box',
            }}>
              <span style={{ fontSize: 12, color: 'black', fontFamily: font, letterSpacing: -0.23, lineHeight: '20px' }}>เดือน</span>
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={{ transform: monthOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                <path d="M1 1L5 5L9 1" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            {monthOpen && (
              <>
                <div className="dropdown-backdrop" onClick={() => setMonthOpen(false)} />
                <div className="dropdown-menu" style={{ minWidth: 200, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, padding: 6 }}>
                  {THAI_MONTHS.map((m, i) => (
                    <div key={m}
                      className={`dropdown-item${selectedMonth === i ? ' active' : ''}`}
                      onClick={() => { setSelectedMonth(i); setMonthOpen(false); }}
                      style={{ justifyContent: 'center', textAlign: 'center', fontSize: 11 }}
                    >{m}</div>
                  ))}
                </div>
              </>
            )}
          </div>
          <div style={{
            backdropFilter: 'blur(2px)', background: 'rgba(255,255,255,0.8)',
            border: '1px solid white', borderRadius: 100, padding: '8px 10px',
            display: 'flex', alignItems: 'center', gap: 16, height: 36,
          }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: 'rgba(60,60,67,0.6)', fontFamily: font }}>{date}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'black', fontFamily: font }}>{time}</span>
            </div>
            <div style={{ width: 20, height: 20, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src={iconRefresh} alt="" style={{ width: 16, height: 19 }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════
   2. STAT CARDS
   ═══════════════════════════════════ */
function StatCards() {
  const cards = [
    { icon: iconPatients, label: 'จำนวนผู้ป่วย', value: DASHBOARD_STATS.totalPatients, growth: DASHBOARD_STATS.growthPatients, bg: 'linear-gradient(149deg, #3B82F6 0%, #1D4ED8 100%)', shadow: '0 4px 14px rgba(59,130,246,0.3)' },
    { icon: iconHouseCircle, label: 'เคสส่งเยี่ยมบ้าน', value: DASHBOARD_STATS.totalVisits, growth: DASHBOARD_STATS.growthVisits, bg: 'linear-gradient(149deg, #19A589 0%, #0D7C66 100%)', shadow: '0 4px 14px rgba(25,165,137,0.3)' },
    { icon: iconHeartCircle, label: 'Vital Sign', value: DASHBOARD_STATS.totalVitalSigns, growth: '+7.8', bg: 'linear-gradient(149deg, #E8802A 0%, #D06A1A 100%)', shadow: '0 4px 14px rgba(232,128,42,0.3)' },
    { icon: iconWarning, label: 'Vital Sign ผิดปกติ', value: DASHBOARD_STATS.abnormalVitalSigns, growth: DASHBOARD_STATS.growthAbnormal, bg: 'linear-gradient(149deg, #E8432A 0%, #D0381A 100%)', shadow: '0 4px 14px rgba(232,128,42,0.3)' },
    { icon: iconCrossCase, label: 'รพ.ใช้งาน', value: `${DASHBOARD_STATS.hospitalsActive}/${DASHBOARD_STATS.totalHospitals}`, growth: DASHBOARD_STATS.growthHospitals, bg: 'linear-gradient(149deg, #8B5CF6 0%, #7C3AED 100%)', shadow: '0 4px 14px rgba(139,92,246,0.3)' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}>
      {cards.map((c, i) => (
        <div key={c.label} className="hover-stat" style={{
          background: c.bg, borderRadius: 24, padding: 16, color: 'white',
          overflow: 'hidden', position: 'relative', boxShadow: c.shadow,
          display: 'flex', flexDirection: 'column', gap: 8,
          animation: `cardPop 0.5s cubic-bezier(.22,1,.36,1) ${i * 80}ms both`,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', height: 40 }}>
            <div style={{ width: 40, height: 40, borderRadius: 14, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src={c.icon} alt="" style={{ width: 20, height: 20 }} />
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.18)', borderRadius: 999,
              padding: '4px 10px', display: 'flex', alignItems: 'center',
            }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.9)', fontFamily: font }}>
                ↑ +{typeof c.growth === 'number' ? c.growth : c.growth}%
              </span>
            </div>
          </div>
          <span style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.6)', fontFamily: font, letterSpacing: 0.22 }}>{c.label}</span>
          <span style={{ fontSize: 26, fontWeight: 700, color: 'white', fontFamily: font, lineHeight: '26px' }}>
            {typeof c.value === 'number' ? c.value.toLocaleString() : c.value}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════
   3. LINE CHART — ภาพรวมการใช้งาน
   ═══════════════════════════════════ */
function UsageChart() {
  return (
    <div className="hover-card anim-slide-up delay-3" style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: 16, height: 350 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={iconBoxStyle('#6658E1')}>
          <img src={iconChart} alt="" style={{ width: 20, height: 20 }} />
        </div>
        <div>
          <div style={chartTitleStyle}>ภาพรวมการใช้งาน</div>
          <div style={chartSubStyle}>Vital Signs & เยี่ยมบ้าน</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: 10, background: 'linear-gradient(180deg, #FF383C 0%, #992224 100%)' }} />
          <span style={labelStyle}>Vital Signs</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{ width: 8, height: 8, borderRadius: 10, background: 'linear-gradient(180deg, #4A3AFF 0%, #2C2399 100%)' }} />
          <span style={labelStyle}>เยี่ยมบ้าน</span>
        </div>
      </div>
      <div style={{ flex: 1 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={USAGE_CHART_DATA} margin={{ top: 5, right: 10, bottom: 5, left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 12, fill: GRAY, fontFamily: font }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: GRAY, fontFamily: font }} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? `${Math.round(v / 1000)}k` : v} />
            <Tooltip content={<Tip />} />
            <Line type="monotone" dataKey="vitalsign" name="Vital Signs" stroke="#FF383C" strokeWidth={3} dot={{ r: 5, fill: '#FF383C', strokeWidth: 3, stroke: '#fff' }} animationDuration={1200} animationBegin={200} />
            <Line type="monotone" dataKey="visit" name="เยี่ยมบ้าน" stroke="#4A3AFF" strokeWidth={3} dot={{ r: 5, fill: '#4A3AFF', strokeWidth: 3, stroke: '#fff' }} animationDuration={1200} animationBegin={400} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════
   4. HOSPITAL COMPARISON — Stacked Bar
   ═══════════════════════════════════ */
/* 3D isometric stacked bar — แท่งชิ้นเดียว gradient ต่อเนื่อง */
function BarWithTooltip({ h, total, barW, greenH, redH, orangeH }) {
  const [hover, setHover] = useState(false);
  const DEPTH = 10;
  const W = barW;
  const totalH = greenH + redH + orangeH;
  if (totalH <= 0) return null;

  // คำนวณ % สำหรับ gradient stops (บนลงล่าง: ส้ม → แดง → เขียว)
  const oPct = (orangeH / totalH) * 100;
  const rPct = oPct + (redH / totalH) * 100;

  // สี gradient ต่อเนื่อง — ด้านหน้า (สว่าง), ด้านข้าง (เข้ม), ด้านบน (อ่อนสุด)
  const frontGrad = `linear-gradient(180deg,
    #FFB347 0%, #E8802A ${oPct}%,
    #FF6B6B ${oPct}%, #D63031 ${rPct}%,
    #6EDCBF ${rPct}%, #0D7C66 100%)`;
  const sideGrad = `linear-gradient(180deg,
    #C0611A 0%, #C0611A ${oPct}%,
    #A01E1E ${oPct}%, #A01E1E ${rPct}%,
    #0A6350 ${rPct}%, #0A6350 100%)`;
  // ด้านบน = สีของส้ม (ชั้นบนสุด)
  const topColor = '#FFDAA0';

  return (
    <div style={{ flex: 1, display: 'flex', justifyContent: 'center', position: 'relative' }}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <div style={{
        position: 'relative', width: W + DEPTH, height: totalH + DEPTH,
        transition: 'transform 0.25s cubic-bezier(.4,0,.2,1), filter 0.25s ease',
        transform: hover ? 'translateY(-4px)' : 'translateY(0)',
        filter: hover ? 'drop-shadow(0 8px 16px rgba(0,0,0,0.18))' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.06))',
        cursor: 'default',
        animation: 'barGrow 0.8s cubic-bezier(.22,1,.36,1) both',
        transformOrigin: 'bottom center',
      }}>
        {/* ด้านหน้า */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0,
          width: W, height: totalH,
          background: frontGrad,
          borderRadius: '4px 4px 0 0',
        }} />
        {/* ด้านข้าง (ขวา) */}
        <div style={{
          position: 'absolute', bottom: 0, left: W,
          width: DEPTH, height: totalH,
          background: sideGrad,
          transform: 'skewY(-40deg)',
          transformOrigin: 'bottom left',
          borderRadius: '0 2px 0 0',
        }} />
        {/* ด้านบน */}
        <div style={{
          position: 'absolute', bottom: totalH, left: 0,
          width: W, height: DEPTH,
          background: topColor,
          transform: 'skewX(-50deg)',
          transformOrigin: 'bottom left',
          borderRadius: '2px 2px 0 0',
        }} />
      </div>
      {/* Tooltip */}
      {hover && (
        <div style={{
          position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)',
          marginBottom: 12, zIndex: 20, pointerEvents: 'none',
          background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)',
          borderRadius: 14, padding: '10px 14px', minWidth: 160,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)', border: '1px solid rgba(255,255,255,0.8)',
        }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: BLACK, fontFamily: font, marginBottom: 8 }}>{h.name}</div>
          {[
            { label: 'เยี่ยมแล้ว', value: h.visited, color: '#19A589' },
            { label: 'ยังไม่เยี่ยม', value: h.notVisited, color: '#FF383C' },
            { label: 'รอรับงาน', value: h.pending, color: '#E8802A' },
          ].map(r => (
            <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: GRAY, fontFamily: font }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: r.color, display: 'inline-block' }} />
                {r.label}
              </span>
              <span style={{ fontSize: 12, fontWeight: 600, color: r.color, fontFamily: font }}>{r.value}</span>
            </div>
          ))}
          <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', marginTop: 6, paddingTop: 6, display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, color: GRAY, fontFamily: font }}>รวม</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: BLACK, fontFamily: font }}>{total}</span>
          </div>
          <div style={{
            position: 'absolute', bottom: -6, left: '50%', transform: 'translateX(-50%) rotate(45deg)',
            width: 12, height: 12, background: 'rgba(255,255,255,0.95)',
            borderRight: '1px solid rgba(255,255,255,0.8)', borderBottom: '1px solid rgba(255,255,255,0.8)',
          }} />
        </div>
      )}
    </div>
  );
}

function HospitalComparison() {
  const maxTotal = Math.max(...HOSPITAL_COMPARISON.map(h => h.visited + h.notVisited + h.pending));
  const BAR_W = 28;
  const CHART_H = 178;
  const yTicks = [
    { label: '500k', pct: 0 },
    { label: '100k', pct: 33.33 },
    { label: '50k', pct: 66.66 },
    { label: '0', pct: 100 },
  ];

  return (
    <div className="hover-card anim-slide-up delay-4" style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: 16, height: 350 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={iconBoxStyle('linear-gradient(135deg, #19A589 0%, #0D7C66 100%)')}>
          <img src={iconChart} alt="" style={{ width: 20, height: 20 }} />
        </div>
        <div>
          <div style={chartTitleStyle}>เปรียบเทียบ รพ.</div>
          <div style={chartSubStyle}>สถานะการเยี่ยมบ้าน</div>
        </div>
      </div>
      {/* Legend + link */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 16 }}>
          {[
            { label: 'เยี่ยมแล้ว', bg: 'linear-gradient(180deg, #6EDCBF, #0D7C66)' },
            { label: 'ยังไม่เยี่ยม', bg: 'linear-gradient(180deg, #FF6B6B, #C62828)' },
            { label: 'รอรับงาน', bg: 'linear-gradient(180deg, #F6A623, #C0611A)' },
          ].map(l => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: 10, background: l.bg }} />
              <span style={labelStyle}>{l.label}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <img src={iconInfoCircle} alt="" style={{ width: 14, height: 14 }} />
          <span style={{ fontSize: 12, color: 'black', fontFamily: font }}>ดูเพิ่มเติม</span>
        </div>
      </div>
      {/* Chart */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Y-axis + grid + bars */}
        <div style={{ flex: 1, display: 'flex' }}>
          {/* Y labels */}
          <div style={{ width: 40, position: 'relative', height: CHART_H }}>
            {yTicks.map(t => (
              <span key={t.label} style={{
                position: 'absolute', top: `${t.pct}%`, transform: 'translateY(-50%)',
                fontSize: 12, color: GRAY, fontFamily: font, lineHeight: '18px',
              }}>{t.label}</span>
            ))}
          </div>
          {/* Grid + bars */}
          <div style={{ flex: 1, position: 'relative', height: CHART_H }}>
            {/* Grid lines ตรงกับ Y labels */}
            {yTicks.map(t => (
              <div key={t.label} style={{
                position: 'absolute', top: `${t.pct}%`, left: 0, right: 0,
                borderBottom: '1px dashed rgba(0,0,0,0.08)',
              }} />
            ))}
            {/* Bars ยืนบน baseline (bottom) */}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0, top: 0,
              display: 'flex', gap: 8, justifyContent: 'space-around',
              alignItems: 'flex-end', padding: '0 8px',
            }}>
              {HOSPITAL_COMPARISON.map((h) => {
                const total = h.visited + h.notVisited + h.pending;
                const barH = (total / maxTotal) * CHART_H;
                const greenH = (h.visited / total) * barH;
                const redH = (h.notVisited / total) * barH;
                const orangeH = (h.pending / total) * barH;
                return (
                  <BarWithTooltip key={h.name} h={h} total={total}
                    barW={BAR_W} greenH={greenH} redH={redH} orangeH={orangeH} />
                );
              })}
            </div>
          </div>
        </div>
        {/* X-axis labels */}
        <div style={{ display: 'flex', paddingLeft: 40, paddingTop: 8 }}>
          <div style={{ flex: 1, display: 'flex', gap: 8, justifyContent: 'space-around', padding: '0 8px' }}>
            {HOSPITAL_COMPARISON.map(h => (
              <span key={h.name} style={{
                flex: 1, fontSize: 12, color: GRAY, fontFamily: font,
                textAlign: 'center', whiteSpace: 'nowrap',
                overflow: 'hidden', textOverflow: 'ellipsis',
              }}>{h.name}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════
   5. THAILAND MAP + TOP 10 PROVINCES
   ═══════════════════════════════════ */
const MAP_POINTS = [
  // เยี่ยมแล้ว (visited) — เขียว
  { lng: 100.52, lat: 13.78, name: 'กรุงเทพฯ เขตบางรัก', count: 180, status: 'visited' },
  { lng: 100.44, lat: 13.72, name: 'กรุงเทพฯ เขตธนบุรี', count: 120, status: 'visited' },
  { lng: 98.98, lat: 18.79, name: 'เชียงใหม่ อ.เมือง', count: 140, status: 'visited' },
  { lng: 99.01, lat: 18.55, name: 'เชียงใหม่ อ.หางดง', count: 65, status: 'visited' },
  { lng: 104.13, lat: 17.15, name: 'สกลนคร อ.เมือง', count: 170, status: 'visited' },
  { lng: 102.84, lat: 16.43, name: 'ขอนแก่น อ.เมือง', count: 150, status: 'visited' },
  { lng: 99.10, lat: 9.14, name: 'สุราษฎร์ธานี อ.เมือง', count: 130, status: 'visited' },
  { lng: 100.98, lat: 13.36, name: 'ชลบุรี อ.เมือง', count: 110, status: 'visited' },
  { lng: 100.49, lat: 7.01, name: 'สงขลา อ.หาดใหญ่', count: 90, status: 'visited' },
  { lng: 100.07, lat: 9.96, name: 'นครศรีฯ อ.เมือง', count: 80, status: 'visited' },
  { lng: 99.83, lat: 19.91, name: 'เชียงราย อ.เมือง', count: 100, status: 'visited' },
  { lng: 100.60, lat: 13.60, name: 'สมุทรปราการ อ.เมือง', count: 95, status: 'visited' },

  // ยังไม่เยี่ยม (notVisited) — แดง
  { lng: 100.60, lat: 13.85, name: 'กรุงเทพฯ เขตลาดพร้าว', count: 60, status: 'notVisited' },
  { lng: 102.10, lat: 14.97, name: 'นครราชสีมา อ.เมือง', count: 90, status: 'notVisited' },
  { lng: 99.83, lat: 19.70, name: 'เชียงราย อ.แม่สาย', count: 50, status: 'notVisited' },
  { lng: 104.80, lat: 15.86, name: 'อำนาจเจริญ อ.เมือง', count: 80, status: 'notVisited' },
  { lng: 103.65, lat: 16.44, name: 'มหาสารคาม อ.เมือง', count: 55, status: 'notVisited' },
  { lng: 100.52, lat: 7.20, name: 'สงขลา อ.สะเดา', count: 35, status: 'notVisited' },
  { lng: 104.30, lat: 17.40, name: 'สกลนคร อ.วานรนิวาส', count: 45, status: 'notVisited' },
  { lng: 99.00, lat: 18.30, name: 'ลำพูน อ.เมือง', count: 40, status: 'notVisited' },

  // รอรับงาน (pending) — ส้ม
  { lng: 99.01, lat: 14.02, name: 'กาญจนบุรี อ.เมือง', count: 70, status: 'pending' },
  { lng: 100.99, lat: 14.35, name: 'สระบุรี อ.เมือง', count: 55, status: 'pending' },
  { lng: 102.00, lat: 15.23, name: 'นครราชสีมา อ.ปากช่อง', count: 45, status: 'pending' },
  { lng: 103.50, lat: 15.25, name: 'บุรีรัมย์ อ.เมือง', count: 60, status: 'pending' },
  { lng: 100.50, lat: 13.50, name: 'สมุทรปราการ อ.บางพลี', count: 40, status: 'pending' },
  { lng: 98.40, lat: 8.00, name: 'ภูเก็ต อ.เมือง', count: 35, status: 'pending' },
  { lng: 101.15, lat: 12.68, name: 'ระยอง อ.เมือง', count: 50, status: 'pending' },
];

const RASTER_STYLE = (tiles, attribution = '') => ({
  version: 8,
  sources: {
    raster: {
      type: 'raster',
      tiles,
      tileSize: 256,
      attribution,
    },
  },
  layers: [{ id: 'raster-layer', type: 'raster', source: 'raster' }],
});

const MAP_STYLES = {
  แผนที่: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
  ดาวเทียม: RASTER_STYLE(
    ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
    '&copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics'
  ),
  ภูมิประเทศ: RASTER_STYLE(
    ['https://tile.opentopomap.org/{z}/{x}/{y}.png'],
    '&copy; OpenTopoMap (CC-BY-SA)'
  ),
};

const STATUS_META = {
  visited: { color: '#19A589', label: 'เยี่ยมแล้ว' },
  notVisited: { color: '#FF383C', label: 'ยังไม่เยี่ยม' },
  pending: { color: '#E8802A', label: 'รอรับงาน' },
};

/* Heatmap color schemes per type */
const HEAT_COLORS = {
  homevisit: ['rgba(139,92,246,0)', 'rgba(139,92,246,0.2)', 'rgba(139,92,246,0.5)', '#8B5CF6', '#7C3AED', '#5B21B6'],
  vitalsign: ['rgba(59,130,246,0)', 'rgba(59,130,246,0.2)', 'rgba(59,130,246,0.5)', '#3B82F6', '#1D4ED8', '#1E40AF'],
  cgm: ['rgba(25,165,137,0)', 'rgba(25,165,137,0.2)', 'rgba(25,165,137,0.5)', '#19A589', '#0D7C66', '#065F46'],
};

function ThailandMap({ statusFilter, heatFilter, isHeatmap }) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const [mapStyle, setMapStyle] = useState('แผนที่');

  useEffect(() => {
    if (mapRef.current) return;
    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: MAP_STYLES[mapStyle],
      center: [101.0, 13.0],
      zoom: 5.2,
      attributionControl: false,
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-left');
    mapRef.current = map;
    map.on('load', () => render(map));
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  useEffect(() => {
    if (mapRef.current) render(mapRef.current);
  }, [statusFilter, heatFilter, isHeatmap]);

  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.setStyle(MAP_STYLES[mapStyle]);
    mapRef.current.once('styledata', () => render(mapRef.current));
  }, [mapStyle]);

  function render(map) {
    // clear markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    // clear heatmap layers/sources
    ['heatmap-layer', 'heatmap-point-layer'].forEach(id => { if (map.getLayer(id)) map.removeLayer(id); });
    if (map.getSource('heatmap-src')) map.removeSource('heatmap-src');

    if (isHeatmap) {
      addHeatmapLayer(map, heatFilter);
    } else {
      addPosMarkers(map, statusFilter);
    }
  }

  /* ── โหมดตำแหน่ง: จุดกลมเหมือนเดิม ── */
  function addPosMarkers(map, filter) {
    const filtered = filter === 'all' ? MAP_POINTS : MAP_POINTS.filter(p => p.status === filter);
    const maxCount = Math.max(...MAP_POINTS.map(p => p.count));
    filtered.forEach(pt => {
      const { color, label } = STATUS_META[pt.status];
      const size = Math.max(14, Math.round((pt.count / maxCount) * 44));
      const pad = 12;
      const el = document.createElement('div');
      el.style.cssText = `width:${size+pad*2}px;height:${size+pad*2}px;display:flex;align-items:center;justify-content:center;cursor:pointer;`;
      const dot = document.createElement('div');
      dot.style.cssText = `width:${size}px;height:${size}px;border-radius:50%;background:${color};opacity:0.6;border:2px solid rgba(255,255,255,0.9);box-shadow:0 2px 8px ${color}40;pointer-events:none;transition:all 0.2s ease;`;
      el.appendChild(dot);

      const popup = new maplibregl.Popup({ offset: size/2+6, closeButton: false, maxWidth: '200px' })
        .setHTML(`<div style="font-family:${font};padding:6px 2px;"><div style="font-weight:700;font-size:13px;color:${BLACK};margin-bottom:6px;">${pt.name}</div><div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;"><span style="width:8px;height:8px;border-radius:50%;background:${color};display:inline-block;"></span><span style="font-size:12px;color:${GRAY};">${label}</span></div><div style="font-size:20px;font-weight:700;color:${color};">${pt.count} <span style="font-size:11px;font-weight:400;color:${GRAY};">ราย</span></div></div>`);

      el.addEventListener('mouseenter', () => {
        dot.style.opacity='1'; dot.style.transform='scale(1.35)'; dot.style.boxShadow=`0 0 0 4px ${color}30, 0 4px 14px ${color}50`;
        const w=el.closest('.maplibregl-marker'); if(w) w.style.zIndex='9999';
        if(!marker.getPopup().isOpen()) marker.togglePopup();
      });
      el.addEventListener('mouseleave', () => {
        dot.style.opacity='0.6'; dot.style.transform='scale(1)'; dot.style.boxShadow=`0 2px 8px ${color}40`;
        const w=el.closest('.maplibregl-marker'); if(w) w.style.zIndex='';
        if(marker.getPopup().isOpen()) marker.togglePopup();
      });

      const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat([pt.lng, pt.lat]).setPopup(popup).addTo(map);
      markersRef.current.push(marker);
    });
  }

  /* ── โหมด Heatmap: ใช้ MapLibre heatmap layer จริง ── */
  function addHeatmapLayer(map, filter) {
    const filtered = HEATMAP_POINTS.filter(p => p.type === filter);
    const colors = HEAT_COLORS[filter] || HEAT_COLORS.homevisit;
    const maxCount = Math.max(...filtered.map(p => p.count));

    const geojson = {
      type: 'FeatureCollection',
      features: filtered.map(pt => ({
        type: 'Feature',
        properties: { count: pt.count, name: pt.name, label: HEAT_TYPE_META[pt.type].label },
        geometry: { type: 'Point', coordinates: [pt.lng, pt.lat] },
      })),
    };

    map.addSource('heatmap-src', { type: 'geojson', data: geojson });

    // Heatmap layer — กระจายสีปกคลุมพื้นที่
    map.addLayer({
      id: 'heatmap-layer',
      type: 'heatmap',
      source: 'heatmap-src',
      paint: {
        'heatmap-weight': ['interpolate', ['linear'], ['get', 'count'], 0, 0, maxCount, 1],
        'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 4, 0.8, 8, 2.5],
        'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 4, 30, 6, 50, 8, 70],
        'heatmap-opacity': ['interpolate', ['linear'], ['zoom'], 4, 0.85, 10, 0.6],
        'heatmap-color': [
          'interpolate', ['linear'], ['heatmap-density'],
          0, colors[0], 0.2, colors[1], 0.4, colors[2],
          0.6, colors[3], 0.8, colors[4], 1, colors[5],
        ],
      },
    });

  }

  return (
    <div style={{ position: 'relative', borderRadius: 24, overflow: 'hidden', background: 'white', minHeight: 400 }}>
      <div ref={mapContainer} style={{ position: 'absolute', inset: 0 }} />
      {/* Map style selector */}
      <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 2 }}>
        <div style={{
          display: 'flex', padding: 4, borderRadius: 100,
          background: 'rgba(116,116,128,0.08)', backdropFilter: 'blur(5px)',
          border: '1px solid rgba(255,255,255,0.5)',
        }}>
          {Object.keys(MAP_STYLES).map(s => (
            <button key={s} onClick={() => setMapStyle(s)} style={{
              border: 'none', borderRadius: 100, padding: '4px 10px', cursor: 'pointer',
              fontSize: 12, fontFamily: font, whiteSpace: 'nowrap',
              fontWeight: mapStyle === s ? 600 : 400,
              background: mapStyle === s ? 'rgba(0,136,255,0.7)' : 'transparent',
              color: mapStyle === s ? 'white' : 'black',
              minWidth: mapStyle === s ? 80 : undefined,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{s}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* โหมดตำแหน่ง */
const FILTER_POS = [
  { key: 'all', label: 'ทั้งหมด' },
  { key: 'visited', label: 'เยี่ยมแล้ว', color: '#19A589' },
  { key: 'notVisited', label: 'ยังไม่เยี่ยม', color: '#FF383C' },
  { key: 'pending', label: 'รอรับงาน', color: '#E8802A' },
];
/* โหมด Heatmap */
const FILTER_HEAT = [
  { key: 'homevisit', label: 'เยี่ยมบ้าน', color: '#8B5CF6' },
  { key: 'vitalsign', label: 'Vitalsign', color: '#3B82F6' },
  { key: 'cgm', label: 'CGM', color: '#19A589' },
];

const HEATMAP_POINTS = [
  { lng: 100.52, lat: 13.78, name: 'กรุงเทพฯ เขตบางรัก', count: 200, type: 'homevisit' },
  { lng: 100.44, lat: 13.72, name: 'กรุงเทพฯ เขตธนบุรี', count: 160, type: 'vitalsign' },
  { lng: 100.56, lat: 13.68, name: 'กรุงเทพฯ เขตบางนา', count: 90, type: 'cgm' },
  { lng: 98.98, lat: 18.79, name: 'เชียงใหม่ อ.เมือง', count: 180, type: 'homevisit' },
  { lng: 99.01, lat: 18.55, name: 'เชียงใหม่ อ.หางดง', count: 110, type: 'vitalsign' },
  { lng: 98.75, lat: 18.90, name: 'เชียงใหม่ อ.แม่ริม', count: 60, type: 'cgm' },
  { lng: 104.13, lat: 17.15, name: 'สกลนคร อ.เมือง', count: 170, type: 'homevisit' },
  { lng: 104.30, lat: 17.40, name: 'สกลนคร อ.วานรนิวาส', count: 80, type: 'vitalsign' },
  { lng: 102.84, lat: 16.43, name: 'ขอนแก่น อ.เมือง', count: 150, type: 'homevisit' },
  { lng: 102.60, lat: 16.50, name: 'ขอนแก่น อ.น้ำพอง', count: 70, type: 'cgm' },
  { lng: 102.10, lat: 14.97, name: 'นครราชสีมา อ.เมือง', count: 140, type: 'vitalsign' },
  { lng: 99.83, lat: 19.91, name: 'เชียงราย อ.เมือง', count: 120, type: 'homevisit' },
  { lng: 99.10, lat: 9.14, name: 'สุราษฎร์ธานี อ.เมือง', count: 100, type: 'vitalsign' },
  { lng: 100.98, lat: 13.36, name: 'ชลบุรี อ.เมือง', count: 130, type: 'homevisit' },
  { lng: 101.15, lat: 12.68, name: 'ระยอง อ.เมือง', count: 85, type: 'cgm' },
  { lng: 100.49, lat: 7.01, name: 'สงขลา อ.หาดใหญ่', count: 95, type: 'homevisit' },
  { lng: 104.63, lat: 15.86, name: 'อำนาจเจริญ อ.เมือง', count: 75, type: 'vitalsign' },
  { lng: 100.60, lat: 13.60, name: 'สมุทรปราการ อ.เมือง', count: 110, type: 'homevisit' },
  { lng: 103.50, lat: 15.25, name: 'บุรีรัมย์ อ.เมือง', count: 65, type: 'cgm' },
  { lng: 100.07, lat: 9.96, name: 'นครศรีฯ อ.เมือง', count: 90, type: 'vitalsign' },
  { lng: 98.40, lat: 8.00, name: 'ภูเก็ต อ.เมือง', count: 55, type: 'cgm' },
];

const HEAT_TYPE_META = {
  homevisit: { color: '#8B5CF6', label: 'เยี่ยมบ้าน' },
  vitalsign: { color: '#3B82F6', label: 'Vitalsign' },
  cgm: { color: '#19A589', label: 'CGM' },
};

function FilterBar({ items, active, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {items.map(f => {
        const isActive = active === f.key;
        return (
          <button key={f.key} onClick={() => onChange(f.key)} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '6px 14px', borderRadius: 100, cursor: 'pointer',
            border: isActive ? `1.5px solid ${f.color || '#6658E1'}` : '1px solid white',
            background: isActive ? (f.color ? `${f.color}12` : 'rgba(102,88,225,0.08)') : 'transparent',
            transition: 'all 0.2s ease',
            fontFamily: font, fontSize: 12,
            fontWeight: isActive ? 600 : 400,
            color: isActive ? (f.color || '#6658E1') : GRAY,
          }}>
            {f.color && <span style={{
              width: 8, height: 8, borderRadius: '50%', display: 'inline-block',
              background: f.color, opacity: isActive ? 1 : 0.5,
            }} />}
            {f.label}
          </button>
        );
      })}
    </div>
  );
}

/* สรุป HEATMAP_POINTS ตามจังหวัด (ตัดเอาชื่อจังหวัดจากชื่อเต็ม) */
function getHeatTop10(filter) {
  const filtered = HEATMAP_POINTS.filter(p => p.type === filter);
  const byProv = {};
  filtered.forEach(pt => {
    const prov = pt.name.split(' ')[0]; // เช่น "กรุงเทพฯ"
    byProv[prov] = (byProv[prov] || 0) + pt.count;
  });
  return Object.entries(byProv)
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);
}

function Top10Ranking({ isHeatmap, heatFilter }) {
  const activeHeatColor = FILTER_HEAT.find(f => f.key === heatFilter)?.color || '#8B5CF6';
  const activeHeatLabel = FILTER_HEAT.find(f => f.key === heatFilter)?.label || 'เยี่ยมบ้าน';
  const heatTop10 = isHeatmap ? getHeatTop10(heatFilter) : [];
  const heatMax = heatTop10.length > 0 ? heatTop10[0].total : 1;

  const list = isHeatmap ? heatTop10 : PROVINCES_TOP10;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
        <div style={{
          ...iconBoxStyle(`${activeHeatColor}20`),
          background: isHeatmap
            ? `linear-gradient(90deg, ${activeHeatColor}20, ${activeHeatColor}20), white`
            : 'linear-gradient(90deg, rgba(232,128,42,0.2), rgba(232,128,42,0.2)), white',
        }}>
          <svg width="18" height="20" viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path opacity="0" d="M18 0H0V20H18V0Z" fill={isHeatmap ? activeHeatColor : '#E8802A'}/>
            <path d="M0 3.00958C0 6.77611 1.78825 9.12905 5.35575 10.2325C5.9157 10.9257 6.54792 11.482 7.16206 11.8741V15.8413H5.7441C4.47064 15.8413 3.81133 16.58 3.81133 17.793V19.2978C3.81133 19.7082 4.12744 19.9908 4.50677 19.9908H13.159C13.5384 19.9908 13.8545 19.7082 13.8545 19.2978V17.793C13.8545 16.58 13.1861 15.8413 11.9127 15.8413H10.5037V11.8741C11.1179 11.482 11.7501 10.9257 12.3011 10.2325C15.8776 9.12905 17.6659 6.77611 17.6659 3.00958C17.6659 2.07023 17.0878 1.49567 16.1214 1.49567H14.3693C14.2248 0.565436 13.5745 0 12.4817 0H5.18414C4.10035 0 3.44104 0.556316 3.29653 1.49567H1.5444C0.578023 1.49567 0 2.07023 0 3.00958ZM1.29152 3.13726C1.29152 2.99133 1.3999 2.87278 1.55344 2.87278H3.25137V4.66028C3.25137 6.05564 3.61264 7.35066 4.1726 8.47242C2.28499 7.50571 1.29152 5.73644 1.29152 3.13726ZM13.4842 8.47242C14.0532 7.35066 14.4144 6.05564 14.4144 4.66028V2.87278H16.1124C16.2659 2.87278 16.3743 2.99133 16.3743 3.13726C16.3743 5.73644 15.3809 7.50571 13.4842 8.47242Z" fill={isHeatmap ? activeHeatColor : '#E8802A'}/>
          </svg>
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: BLACK, fontFamily: font }}>10 อันดับจังหวัดใช้งาน</div>
          <div style={chartSubStyle}>{isHeatmap ? activeHeatLabel : 'เยี่ยมบ้าน'}</div>
        </div>
      </div>
      {list.map((p, i) => {
        const total = p.total;
        const accentColor = isHeatmap ? activeHeatColor : '#E8802A';
        const rankColor = i === 0 ? accentColor : i < 3 ? (i === 1 ? '#727272' : '#AC7F5E') : '#CCC';
        const barPct = isHeatmap ? (total / heatMax) * 100 : (total / 290) * 100;
        return (
          <div key={p.name + i} style={{
            background: 'white', borderRadius: 16, padding: '8px 16px 8px 8px',
            display: 'flex', gap: 4, alignItems: 'flex-start',
          }}>
            <div style={{ width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: rankColor, fontFamily: font }}>{i + 1}</span>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, justifyContent: 'center', alignSelf: 'stretch' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: 'black', fontFamily: font }}>{p.name}</span>
                <span style={{ fontSize: 12, fontWeight: i < 3 ? 700 : 500, color: i < 3 ? accentColor : GRAY, fontFamily: font }}>{total}</span>
              </div>
              {isHeatmap ? (
                <div style={{ display: 'flex', height: 10, borderRadius: 100, overflow: 'hidden', background: 'rgba(116,116,128,0.08)' }}>
                  <div style={{
                    width: `${barPct}%`, borderRadius: '0 100px 100px 0',
                    background: `linear-gradient(179deg, ${activeHeatColor} 0%, ${activeHeatColor}CC 100%)`,
                  }} />
                </div>
              ) : (
                <div style={{ display: 'flex', height: 10, borderRadius: 100, overflow: 'hidden', background: 'rgba(116,116,128,0.08)' }}>
                  <div style={{ width: `${(p.visited / p.total) * 100}%`, background: 'linear-gradient(180deg, #19A589, #0D7C66)' }} />
                  <div style={{ width: `${(p.notVisited / p.total) * 100}%`, background: 'linear-gradient(180deg, #FF383C, #992224)' }} />
                  <div style={{ width: `${(p.pending / p.total) * 100}%`, borderRadius: '0 100px 100px 0', background: 'linear-gradient(168deg, #E8802A, #D06A1A)' }} />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MapSection() {
  const [mapMode, setMapMode] = useState('position'); // 'position' | 'heatmap'
  const [statusFilter, setStatusFilter] = useState('all');
  const [heatFilter, setHeatFilter] = useState('homevisit');

  const isHeatmap = mapMode === 'heatmap';

  return (
    <div className="hover-card anim-scale-in delay-5" style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={iconBoxStyle('#6658E1')}>
            <img src={iconMapFill} alt="" style={{ width: 20, height: 19 }} />
          </div>
          <div>
            <div style={chartTitleStyle}>แผนที่ผู้ป่วย</div>
            <div style={chartSubStyle}>แสดงตำแหน่งและสถานะผู้ป่วยทั่วประเทศ</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          {/* Mode toggle */}
          <div style={{
            display: 'flex', padding: 4, borderRadius: 100,
            background: 'rgba(255,255,255,0.5)',
          }}>
            {[{ key: 'position', label: 'ตำแหน่ง' }, { key: 'heatmap', label: 'Heatmap' }].map(m => (
              <button key={m.key} onClick={() => setMapMode(m.key)} style={{
                border: 'none', borderRadius: 100, padding: '4px 10px', cursor: 'pointer',
                fontSize: 12, fontFamily: font, whiteSpace: 'nowrap',
                fontWeight: mapMode === m.key ? 600 : 400,
                background: mapMode === m.key ? '#0088FF' : 'transparent',
                color: mapMode === m.key ? 'white' : 'black',
                minWidth: mapMode === m.key ? 80 : undefined,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{m.label}</button>
            ))}
          </div>
        </div>
      </div>
      {/* Filter legend — เปลี่ยนตาม mode */}
      {isHeatmap
        ? <FilterBar items={FILTER_HEAT} active={heatFilter} onChange={setHeatFilter} />
        : <FilterBar items={FILTER_POS} active={statusFilter} onChange={setStatusFilter} />
      }
      {/* Map + Top 10 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'stretch' }}>
        <ThailandMap
          statusFilter={isHeatmap ? undefined : statusFilter}
          heatFilter={isHeatmap ? heatFilter : undefined}
          isHeatmap={isHeatmap}
        />
        <Top10Ranking isHeatmap={isHeatmap} heatFilter={heatFilter} />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════
   6. DISEASE DONUT
   ═══════════════════════════════════ */
function DiseaseDonut() {
  const [activeIdx, setActiveIdx] = useState(null);
  const totalCount = DISEASE_GROUPS.reduce((s, d) => s + d.count, 0);

  const COLORS_GRADIENT = [
    { from: '#8B5CF6', to: '#7C3AED' },
    { from: '#FC9BBA', to: '#DB677E' },
    { from: '#3B82F6', to: '#1D4ED8' },
    { from: '#CCC', to: '#8E8E93' },
  ];

  const DonutTip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    const pct = Math.round((d.count / totalCount) * 100);
    return (
      <div style={{
        background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)',
        borderRadius: 14, padding: '12px 16px', minWidth: 150,
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)', border: '1px solid rgba(255,255,255,0.8)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: d.color }} />
          <span style={{ fontWeight: 700, fontSize: 13, color: BLACK, fontFamily: font }}>{d.name}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 12, color: GRAY, fontFamily: font }}>จำนวน</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: d.color, fontFamily: font }}>{d.count}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 12, color: GRAY, fontFamily: font }}>สัดส่วน</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: BLACK, fontFamily: font }}>{pct}%</span>
        </div>
        <div style={{ marginTop: 8, height: 4, borderRadius: 100, background: 'rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '100%', borderRadius: 100, background: d.color }} />
        </div>
      </div>
    );
  };

  return (
    <div className="hover-card anim-slide-up delay-5" style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: 16, height: 500 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={iconBoxStyle('linear-gradient(135deg, #3B82F6, #1D4ED8)')}>
          <img src={iconGaugeChart} alt="" style={{ width: 20, height: 17 }} />
        </div>
        <div>
          <div style={chartTitleStyle}>สัดส่วนกลุ่มโรค</div>
          <div style={chartSubStyle}>การเยี่ยมบ้านตามกลุ่มโรค</div>
        </div>
      </div>
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10, overflow: 'hidden' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={DISEASE_GROUPS} cx="50%" cy="50%"
                innerRadius="45%" outerRadius="75%" paddingAngle={2}
                dataKey="count" strokeWidth={0}
                animationDuration={1000} animationBegin={300}
                onMouseEnter={(_, i) => setActiveIdx(i)}
                onMouseLeave={() => setActiveIdx(null)}
              >
                {DISEASE_GROUPS.map((d, i) => (
                  <Cell
                    key={i} fill={d.color}
                    opacity={activeIdx === null || activeIdx === i ? 1 : 0.35}
                    style={{
                      filter: activeIdx === i ? `drop-shadow(0 0 8px ${d.color}80)` : 'none',
                      transform: activeIdx === i ? 'scale(1.05)' : 'scale(1)',
                      transformOrigin: 'center',
                      transition: 'all 0.2s ease',
                    }}
                  />
                ))}
              </Pie>
              <Tooltip content={<DonutTip />} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, pointerEvents: 'none' }}>
            <span style={{ fontSize: 48, fontWeight: 700, color: 'black', fontFamily: font, lineHeight: '48px' }}>
              {activeIdx !== null ? DISEASE_GROUPS[activeIdx].count : totalCount}
            </span>
            <span style={{ fontSize: 12, fontWeight: 500, color: 'rgba(0,0,0,0.7)', fontFamily: font }}>
              {activeIdx !== null ? DISEASE_GROUPS[activeIdx].name : 'ทั้งหมด'}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, justifyContent: 'center' }}>
          {DISEASE_GROUPS.map((d, i) => (
            <div key={i}
              onMouseEnter={() => setActiveIdx(i)}
              onMouseLeave={() => setActiveIdx(null)}
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '6px 8px', borderRadius: 10, cursor: 'default',
                background: activeIdx === i ? `${d.color}10` : 'transparent',
                transition: 'background 0.2s ease',
              }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 8, height: 8, borderRadius: 10,
                  background: `linear-gradient(135deg, ${COLORS_GRADIENT[i].from}, ${COLORS_GRADIENT[i].to})`,
                  transform: activeIdx === i ? 'scale(1.5)' : 'scale(1)',
                  transition: 'transform 0.2s ease',
                }} />
                <span style={{
                  ...labelStyle,
                  fontWeight: activeIdx === i ? 600 : 400,
                  color: activeIdx === i ? BLACK : GRAY,
                }}>{d.name}</span>
              </div>
              <span style={{
                fontSize: 12, fontFamily: font,
                fontWeight: activeIdx === i ? 700 : 500,
                color: activeIdx === i ? d.color : 'black',
              }}>{d.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════
   7. CASES TO MONITOR
   ═══════════════════════════════════ */
function CasesMonitor() {
  const { openPatient } = useContext(PatientContext);
  const [filter, setFilter] = useState('ทั้งหมด');
  const filters = ['ทั้งหมด', 'ผิดปกติ', 'ยังไม่เยี่ยม'];

  const filtered = CRITICAL_CASES.filter(c => {
    if (filter === 'ทั้งหมด') return true;
    if (filter === 'ผิดปกติ') return c.severity === 'high' || c.severity === 'critical';
    if (filter === 'ยังไม่เยี่ยม') return c.severity === 'normal';
    return true;
  });

  const filterCounts = {
    'ทั้งหมด': CRITICAL_CASES.length,
    'ผิดปกติ': CRITICAL_CASES.filter(c => c.severity === 'high' || c.severity === 'critical').length,
    'ยังไม่เยี่ยม': CRITICAL_CASES.filter(c => c.severity === 'normal').length,
  };

  return (
    <div className="hover-card anim-slide-up delay-5" style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: 16, height: 500 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={iconBoxStyle('linear-gradient(135deg, #FC9BBA, #DB677E)')}>
            <img src={iconHeartClipboard} alt="" style={{ width: 13, height: 20 }} />
          </div>
          <div>
            <div style={chartTitleStyle}>เคสที่ต้องดูแล</div>
            <div style={chartSubStyle}>แจ้งเตือนค่าผิดปกติ</div>
          </div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.5)', borderRadius: 100, padding: 4, display: 'flex' }}>
          {filters.map((f) => (
            <button key={f} onClick={() => setFilter(f)} style={{
              border: 'none', borderRadius: 100, padding: '4px 10px', cursor: 'pointer',
              fontSize: 12, fontFamily: font, fontWeight: filter === f ? 600 : 400,
              background: filter === f ? '#0088FF' : 'transparent',
              color: filter === f ? 'white' : 'black',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              {f}
              {filter === f && (
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 99,
                  background: 'rgba(255,255,255,0.3)', color: 'white',
                }}>{filterCounts[f]}</span>
              )}
            </button>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 12, fontFamily: font, color: 'black' }}>
          แสดงอยู่ {filtered.length} จาก {CRITICAL_CASES.length} รายการ
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <img src={iconInfoCircle} alt="" style={{ width: 14, height: 14 }} />
          <span style={{ fontSize: 12, color: 'black', fontFamily: font }}>ดูเพิ่มเติม</span>
        </div>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: GRAY, fontSize: 13, fontFamily: font }}>
            ไม่มีข้อมูล
          </div>
        ) : filtered.map(c => {
          const isHomeVisit = !!c.group;
          const badge = c.severity === 'critical'
            ? { l: 'Critical', bg: 'linear-gradient(135deg, #FFF0F0, #FFE0E0)', border: '#FF383C30', c: '#FF383C', dot: '#FF383C' }
            : c.severity === 'high'
            ? { l: 'High', bg: 'linear-gradient(135deg, #FFF8F0, #FFEDD5)', border: '#E8802A30', c: '#E8802A', dot: '#E8802A' }
            : null;
          const borderColor = c.severity === 'critical' ? '#FF383C' : c.severity === 'high' ? '#E8802A' : '#19A589';
          return (
            <div key={c.id}
              onClick={() => openPatient({ name: c.name, age: 45, gender: c.name.startsWith('นาย') ? 'ชาย' : 'หญิง', hn: '', phone: '', address: '', group: c.group || '', disease: '', team: '', adl: 0, visits: 0, lastVisit: '', outcome: '' })}
              onMouseEnter={e => { e.currentTarget.style.border = `1.5px solid ${borderColor}`; e.currentTarget.style.boxShadow = `0 0 0 2px ${borderColor}20`; }}
              onMouseLeave={e => { e.currentTarget.style.border = '1.5px solid transparent'; e.currentTarget.style.boxShadow = 'none'; }}
              style={{
                background: 'white', borderRadius: 16,
                padding: '8px 16px 8px 8px', display: 'flex', gap: 16, alignItems: 'flex-start',
                animation: 'countUp 0.3s ease both',
                cursor: 'pointer', border: '1.5px solid transparent',
                transition: 'border 0.15s ease, box-shadow 0.15s ease',
              }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', position: 'relative', flexShrink: 0 }}>
                <img src={getAvatar(45, c.name.startsWith('นาย') ? 'ชาย' : 'หญิง')} alt="" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
                <div style={{
                  position: 'absolute', bottom: 0, right: 0, width: 16, height: 16,
                  borderRadius: '50%', border: '0.5px solid white',
                  background: isHomeVisit ? 'linear-gradient(135deg, #34C759, #15B03C)' : 'linear-gradient(135deg, #E8432A, #D0381A)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <img src={isHomeVisit ? iconHouseSmall : iconEcgSmall} alt="" style={{ width: 8, height: isHomeVisit ? 7 : 9, filter: 'brightness(10)' }} />
                </div>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, justifyContent: 'center', alignSelf: 'stretch' }}>
                <span style={{ fontSize: 12, color: 'black', fontFamily: font }}>นางมงลักษณ์มานะพล</span>
                <div style={{ display: 'flex', gap: 10, fontSize: 10, color: '#8E8E93', fontFamily: font }}>
                  <span>{isHomeVisit ? `กลุ่ม: ${c.group}` : c.detail}</span>
                  <span>{c.hospital}</span>
                </div>
              </div>
              {badge && (
                <div style={{
                  padding: '4px 12px', borderRadius: 100, alignSelf: 'center',
                  background: badge.bg, border: `1px solid ${badge.border}`,
                  display: 'flex', alignItems: 'center', gap: 5,
                }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: badge.dot, flexShrink: 0 }} />
                  <span style={{ fontSize: 10, fontWeight: 600, color: badge.c, fontFamily: font }}>{badge.l}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════
   8. CGM GAUGE + PATIENTS
   ═══════════════════════════════════ */
function CgmGauge({ normal = 70, total = 90 }) {
  const SIZE = 290, STROKE = 18;
  const R = (SIZE - STROKE) / 2;
  const CX = SIZE / 2, CY = SIZE / 2;
  const START_ANGLE = 135, SWEEP = 270, gapDeg = 6;
  const normalPct = normal / total;
  const polar = (deg) => { const r = (deg * Math.PI) / 180; return [CX + R * Math.cos(r), CY + R * Math.sin(r)]; };
  const arcPath = (s, e) => { const [x1,y1]=polar(s),[x2,y2]=polar(e); return `M ${x1} ${y1} A ${R} ${R} 0 ${e-s>180?1:0} 1 ${x2} ${y2}`; };
  const normalEnd = START_ANGLE + SWEEP * normalPct - gapDeg / 2;
  const abnormalStart = normalEnd + gapDeg;
  const abnormalEnd = START_ANGLE + SWEEP;
  const [dotX, dotY] = polar(normalEnd);

  return (
    <div style={{ position: 'relative', width: SIZE, height: SIZE }}>
      <svg width={SIZE} height={SIZE}>
        <defs>
          <linearGradient id="cgmGreen" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6EDCBF" /><stop offset="100%" stopColor="#0D7C66" />
          </linearGradient>
          <linearGradient id="cgmRed" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FB6D51" /><stop offset="100%" stopColor="#D0381A" />
          </linearGradient>
        </defs>
        <path d={arcPath(START_ANGLE, START_ANGLE + SWEEP)} fill="none" stroke="#E8E8EC" strokeWidth={STROKE} strokeLinecap="round" />
        <path d={arcPath(START_ANGLE, normalEnd)} fill="none" stroke="url(#cgmGreen)" strokeWidth={STROKE} strokeLinecap="round" />
        <path d={arcPath(abnormalStart, abnormalEnd)} fill="none" stroke="url(#cgmRed)" strokeWidth={STROKE} strokeLinecap="round" />
        <circle cx={dotX} cy={dotY} r={STROKE / 2 + 3} fill="#0D7C66" />
        <circle cx={dotX} cy={dotY} r={STROKE / 2 - 2} fill="white" />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: 10 }}>
        <span style={{ fontSize: 48, fontWeight: 700, color: 'black', fontFamily: font, lineHeight: '48px' }}>{total}</span>
        <span style={{ fontSize: 12, fontWeight: 500, color: 'rgba(0,0,0,0.7)', fontFamily: font, marginTop: 16 }}>ผู้ป่วยทั้งหมด</span>
      </div>
    </div>
  );
}

function CgmSection() {
  const { openPatient } = useContext(PatientContext);
  const total = CGM_PATIENTS.length;
  const normal = CGM_PATIENTS.filter(p => p.status === 'normal').length;
  const abnormal = total - normal;
  const normalPct = Math.round((normal / total) * 100);
  const abnormalPct = 100 - normalPct;

  return (
    <div className="hover-card anim-slide-up delay-6" style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={iconBoxStyle('linear-gradient(135deg, #E8802A, #D06A1A)')}>
            <img src={iconEcgRect} alt="" style={{ width: 20, height: 15 }} />
          </div>
          <div>
            <div style={chartTitleStyle}>ค่าน้ำตาลเฉลี่ย CGM</div>
            <div style={chartSubStyle}>Continuous Glucose Monitoring</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <img src={iconInfoCircle} alt="" style={{ width: 14, height: 14 }} />
          <span style={{ fontSize: 12, color: 'black', fontFamily: font }}>ดูเพิ่มเติม</span>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Gauge + cards — card position relative to gauge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 0' }}>
          <div style={{ position: 'relative', width: 290, height: 290 }}>
            <CgmGauge normal={normal} total={total} />
            {/* Normal card - ชิดบนซ้ายของ gauge */}
            <div
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px) scale(1.04)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(25,165,137,0.25)'; e.currentTarget.style.borderColor = 'rgba(25,165,137,0.4)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(25,165,137,0.1)'; e.currentTarget.style.borderColor = 'rgba(25,165,137,0.15)'; }}
              style={{
                position: 'absolute', top: -30, left: -50, cursor: 'pointer',
                backdropFilter: 'blur(10px)',
                background: 'linear-gradient(135deg, rgba(25,165,137,0.12) 0%, rgba(255,255,255,0.7) 100%)',
                border: '1px solid rgba(25,165,137,0.15)',
                borderRadius: 16, padding: '10px 14px',
                boxShadow: '0 8px 24px rgba(25,165,137,0.1)',
                transition: 'all 0.25s cubic-bezier(.22,1,.36,1)',
              }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'linear-gradient(135deg, #6EDCBF, #0D7C66)', flexShrink: 0 }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: BLACK, fontFamily: font }}>ปกติ</span>
                <div style={{ background: 'rgba(25,165,137,0.12)', borderRadius: 999, padding: '1px 8px', marginLeft: 4 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#0D7C66', fontFamily: font }}>{normalPct}%</span>
                </div>
              </div>
              <span style={{ fontSize: 28, fontWeight: 700, color: '#19A589', fontFamily: font, lineHeight: 1 }}>{normal}</span>
            </div>
            {/* Abnormal card - ชิดล่างขวาของ gauge */}
            <div
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px) scale(1.04)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(208,56,26,0.25)'; e.currentTarget.style.borderColor = 'rgba(208,56,26,0.4)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(208,56,26,0.1)'; e.currentTarget.style.borderColor = 'rgba(208,56,26,0.12)'; }}
              style={{
                position: 'absolute', bottom: -30, right: -50, cursor: 'pointer',
                backdropFilter: 'blur(10px)',
                background: 'linear-gradient(135deg, rgba(208,56,26,0.1) 0%, rgba(255,255,255,0.7) 100%)',
                border: '1px solid rgba(208,56,26,0.12)',
                borderRadius: 16, padding: '10px 14px',
                boxShadow: '0 8px 24px rgba(208,56,26,0.1)',
                transition: 'all 0.25s cubic-bezier(.22,1,.36,1)',
              }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'linear-gradient(135deg, #FB6D51, #D0381A)', flexShrink: 0 }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: BLACK, fontFamily: font }}>ผิดปกติ</span>
                <div style={{ background: 'rgba(208,56,26,0.1)', borderRadius: 999, padding: '1px 8px', marginLeft: 4 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#D0381A', fontFamily: font }}>{abnormalPct}%</span>
                </div>
              </div>
              <span style={{ fontSize: 28, fontWeight: 700, color: '#D0381A', fontFamily: font, lineHeight: 1 }}>{abnormal}</span>
            </div>
          </div>
        </div>
        {/* Patient list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {CGM_PATIENTS.map((p, idx) => {
            const sc = p.status === 'high' ? '#FF383C' : p.status === 'low' ? '#E8802A' : '#34C759';
            const sl = p.status === 'high' ? 'สูง' : p.status === 'low' ? 'ต่ำ' : 'ปกติ';
            const sb = p.status === 'high'
              ? { bg: 'linear-gradient(135deg, #FFF0F0, #FFE0E0)', border: '#FF383C30' }
              : p.status === 'low'
              ? { bg: 'linear-gradient(135deg, #FFF8F0, #FFEDD5)', border: '#E8802A30' }
              : { bg: 'linear-gradient(135deg, #F0FFF4, #DCFCE7)', border: '#34C75930' };
            return (
              <div key={idx}
                onClick={() => openPatient({ name: p.name, age: 45, gender: p.name.startsWith('นาย') ? 'ชาย' : 'หญิง', hn: '', phone: '', address: '', group: '', disease: '', team: '', adl: 0, visits: 0, lastVisit: '', outcome: '' })}
                onMouseEnter={e => { e.currentTarget.style.border = `1.5px solid ${sc}`; e.currentTarget.style.boxShadow = `0 0 0 2px ${sc}20`; e.currentTarget.style.transform = 'translateX(4px)'; }}
                onMouseLeave={e => { e.currentTarget.style.border = '1.5px solid transparent'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateX(0)'; }}
                style={{
                  background: 'white', borderRadius: 16,
                  padding: '8px 16px 8px 8px', display: 'flex', gap: 16, alignItems: 'flex-start',
                  border: '1.5px solid transparent', cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0 }}>
                  <img src={getAvatar(45, p.name.startsWith('นาย') ? 'ชาย' : 'หญิง')} alt="" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, justifyContent: 'center', alignSelf: 'stretch' }}>
                  <span style={{ fontSize: 12, color: 'black', fontFamily: font }}>{p.name}</span>
                  <div style={{ display: 'flex', gap: 10, fontSize: 10, color: '#8E8E93', fontFamily: font }}>
                    <span>avg: {p.avg}</span>
                    <span>{p.readings.toLocaleString()} Readings</span>
                  </div>
                </div>
                <div style={{
                  padding: '4px 12px', borderRadius: 100, alignSelf: 'center',
                  background: sb.bg, border: `1px solid ${sb.border}`,
                  display: 'flex', alignItems: 'center', gap: 5,
                }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: sc, flexShrink: 0 }} />
                  <span style={{ fontSize: 10, fontWeight: 600, color: sc, fontFamily: font }}>{sl}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════
   9. FEATURE TABLE + PAGINATION
   ═══════════════════════════════════ */
function FeatureTable() {
  const [page, setPage] = useState(1);
  const perPage = 10;
  const totalPages = Math.ceil(FEATURE_USAGE.length / perPage);
  const rows = FEATURE_USAGE.slice((page - 1) * perPage, page * perPage);
  const headers = ['Vital Signs', 'เยี่ยมบ้าน', 'นัดหมาย', 'แบบประเมิน', 'CGM'];

  return (
    <div className="hover-card anim-slide-up delay-7" style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={iconBoxStyle('#6658E1')}>
          <img src={iconFeature} alt="" style={{ width: 20, height: 20 }} />
        </div>
        <div>
          <div style={chartTitleStyle}>สถิติการใช้งานแต่ละฟีเจอร์ แยก รพ.</div>
          <div style={chartSubStyle}>Continuous Glucose Monitoring</div>
        </div>
      </div>
      <div style={{ background: 'white', border: '1px solid rgba(255,255,255,0.5)', borderRadius: 16, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{
          display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr',
          gap: 10, padding: 16,
          background: 'rgba(139,92,246,0.1)',
          fontWeight: 700, fontSize: 14, color: BLACK, fontFamily: font,
        }}>
          <span>โรงพยาบาล</span>
          {headers.map(h => <span key={h} style={{ textAlign: 'center' }}>{h}</span>)}
        </div>
        {/* Rows */}
        {rows.map((r, i) => {
          const rowTotal = r.vitalsign + r.visit + r.appointment + r.assessment + r.cgm;
          const maxVal = Math.max(r.vitalsign, r.visit, r.appointment, r.assessment, r.cgm);
          const vals = [
            { v: r.vitalsign, label: 'Vital Signs', color: '#FF383C' },
            { v: r.visit, label: 'เยี่ยมบ้าน', color: '#8B5CF6' },
            { v: r.appointment, label: 'นัดหมาย', color: '#3B82F6' },
            { v: r.assessment, label: 'แบบประเมิน', color: '#E8802A' },
            { v: r.cgm, label: 'CGM', color: '#19A589' },
          ];
          return (
            <div key={i}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.04)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
              style={{
                display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr',
                gap: 10, padding: '12px 16px', fontSize: 14, fontFamily: font, color: BLACK,
                cursor: 'default', transition: 'background 0.15s ease',
                borderBottom: '1px solid rgba(0,0,0,0.03)',
                position: 'relative',
              }}>
              <span style={{ fontWeight: 500 }}>{r.hospital}</span>
              {vals.map((cell, j) => (
                <span key={j} style={{ textAlign: 'center', fontWeight: 500, position: 'relative' }}
                  className="table-cell-hover"
                >
                  <span style={{
                    display: 'inline-block', padding: '2px 8px', borderRadius: 8,
                    background: cell.v === maxVal ? `${cell.color}12` : 'transparent',
                    color: cell.v === maxVal ? cell.color : BLACK,
                    fontWeight: cell.v === maxVal ? 700 : 500,
                    transition: 'all 0.15s ease',
                  }}>{cell.v}</span>
                </span>
              ))}
              {/* Hover tooltip — mini bar */}
              <div className="row-tooltip" style={{
                position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)',
                marginBottom: 4, zIndex: 20, pointerEvents: 'none',
                background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(12px)',
                borderRadius: 14, padding: '12px 16px', minWidth: 220,
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)', border: '1px solid rgba(255,255,255,0.8)',
                opacity: 0, transition: 'opacity 0.15s ease',
              }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: BLACK, fontFamily: font, marginBottom: 10 }}>{r.hospital}</div>
                {vals.map((cell, j) => (
                  <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: cell.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 11, color: GRAY, fontFamily: font, width: 70 }}>{cell.label}</span>
                    <div style={{ flex: 1, height: 6, borderRadius: 100, background: 'rgba(0,0,0,0.04)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: 100, background: cell.color, width: `${maxVal > 0 ? (cell.v / maxVal) * 100 : 0}%`, transition: 'width 0.3s ease' }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: cell.color, fontFamily: font, width: 32, textAlign: 'right' }}>{cell.v}</span>
                  </div>
                ))}
                <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', marginTop: 6, paddingTop: 6, display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 11, color: GRAY, fontFamily: font }}>รวมทั้งหมด</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: BLACK, fontFamily: font }}>{rowTotal.toLocaleString()}</span>
                </div>
                <div style={{
                  position: 'absolute', bottom: -6, left: '50%', transform: 'translateX(-50%) rotate(45deg)',
                  width: 12, height: 12, background: 'rgba(255,255,255,0.97)',
                  borderRight: '1px solid rgba(255,255,255,0.8)', borderBottom: '1px solid rgba(255,255,255,0.8)',
                }} />
              </div>
            </div>
          );
        })}
        {/* Pagination */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16 }}>
          <span style={{ fontSize: 12, color: GRAY, fontFamily: font }}>
            แสดง {(page - 1) * perPage + 1}-{Math.min(page * perPage, FEATURE_USAGE.length)} จาก {FEATURE_USAGE.length} รายการ
          </span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} style={{
              width: 24, height: 24, borderRadius: '50%', border: 'none', cursor: 'pointer',
              background: 'rgba(116,116,128,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: page <= 1 ? 0.3 : 1,
            }}>
              <img src={iconChevronBack} alt="" style={{ width: 7, height: 10 }} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button key={i + 1} onClick={() => setPage(i + 1)} style={{
                width: 24, height: 24, borderRadius: '50%', border: 'none', cursor: 'pointer',
                background: page === i + 1 ? '#7C3AED' : 'rgba(116,116,128,0.08)',
                color: page === i + 1 ? 'white' : '#8E8E93',
                fontSize: 14, fontWeight: 500, fontFamily: font,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{i + 1}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} style={{
              width: 24, height: 24, borderRadius: '50%', border: 'none', cursor: 'pointer',
              background: 'rgba(116,116,128,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: page >= totalPages ? 0.3 : 1,
            }}>
              <img src={iconChevronForward} alt="" style={{ width: 7, height: 10 }} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════
   MAIN DASHBOARD
   ═══════════════════════════════════ */
/* Scroll-triggered animate wrapper */
function AnimateIn({ children, delay = 0, style }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0.08 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className={`anim-in${visible ? ' visible' : ''}`}
      style={{ transitionDelay: `${delay}ms`, ...style }}>
      {children}
    </div>
  );
}

export default function Dashboard() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <AnimateIn style={{ zIndex: 10, position: 'relative' }}><Hero /></AnimateIn>
      <AnimateIn delay={80}><StatCards /></AnimateIn>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <AnimateIn delay={160}><UsageChart /></AnimateIn>
        <AnimateIn delay={240}><HospitalComparison /></AnimateIn>
      </div>
      <AnimateIn delay={100}><MapSection /></AnimateIn>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <AnimateIn delay={100}><DiseaseDonut /></AnimateIn>
        <AnimateIn delay={180}><CasesMonitor /></AnimateIn>
      </div>
      <AnimateIn delay={100}><CgmSection /></AnimateIn>
      <AnimateIn delay={100}><FeatureTable /></AnimateIn>
    </div>
  );
}
