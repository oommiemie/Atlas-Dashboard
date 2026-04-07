import { useState, useEffect, useRef, useContext } from 'react';
import { PatientContext, UserContext } from '../App';
import CountUp from '../components/CountUp';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { PATIENTS, VITALSIGN_PATIENTS, getPatient, getAvatar, getStatusBadge } from '../data/patients';

import vsIconPerson from '../assets/icons/vs-icon-person.svg';
import vsIconEcg from '../assets/icons/vs-icon-ecg.svg';
import vsIconWarning from '../assets/icons/vs-icon-warning.svg';
import vsIconStar from '../assets/icons/vs-icon-star.svg';
import vsIconHeart from '../assets/icons/vs-icon-heart.svg';
import vsBp from '../assets/icons/vs-bp.svg';
import vsPulse from '../assets/icons/vs-pulse.svg';
import vsTemp from '../assets/icons/vs-temp.svg';
import vsDrop from '../assets/icons/vs-drop.svg';
import vsSparkles from '../assets/icons/vs-sparkles.svg';
import imgVitalBp from '../assets/images/vital-bp.png';
import imgVitalPulse from '../assets/images/vital-pulse.png';
import imgVitalTemp from '../assets/images/vital-temp.png';
import imgVitalOxygen from '../assets/images/vital-oxygen.png';
import imgVitalSugar from '../assets/images/vital-sugar.png';
import vsSparkleIcon from '../assets/images/vital-sparkle-icon.svg';
import vsRefresh from '../assets/icons/vs-refresh.svg';
import vsMap from '../assets/icons/vs-map.svg';
import vsInfo from '../assets/icons/vs-info.svg';
import vsWarning2 from '../assets/icons/vs-warning2.svg';
import vsHero3d from '../assets/images/vitalsign-3d.png';
import imgGrid from '../assets/images/grid-bg.png';
import imgAvatarBlur from '../assets/images/avatar-blur.png';
import logoHomeCare from '../assets/images/logo-atlas-homecare.png';
import logoMyAtlas from '../assets/images/logo-my-atlas.png';
import vsBolt from '../assets/icons/vs-bolt.svg';
import vsArrowUp from '../assets/icons/vs-arrow-up.svg';

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

const VS_MONTHS = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];

/* -- Tooltip -- */
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

/* =============================================
   1. HERO SECTION
   ============================================= */
function Hero() {
  const [now, setNow] = useState(new Date());
  const [monthOpen, setMonthOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);
  const date = now.toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  const time = now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div className="anim-slide-up" style={{
      borderRadius: 24, position: 'relative', overflow: 'visible',
      boxShadow: '0 4px 4px rgba(0,0,0,0.1)', minHeight: 150,
      backdropFilter: 'blur(10px)', fontFamily: font,
      padding: 16, display: 'flex', alignItems: 'center',
      zIndex: monthOpen ? 50 : 10,
    }}>
      {/* Background layer - overflow hidden to clip blurs/grid */}
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
        <div style={{ position: 'absolute', right: 0, top: 30, width: 200, height: 200 }}>
          <img src={vsHero3d} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
      </div>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <p style={{ fontSize: 16, fontWeight: 500, color: 'black', margin: 0 }}>ติดตาม</p>
          <p style={{ fontSize: 24, fontWeight: 700, background: 'linear-gradient(90deg, #245ADE, #8B5CF6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>Vital Sign</p>
        </div>

        {/* Controls row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
          {/* เดือน dropdown */}
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
                  {VS_MONTHS.map((m, i) => (
                    <div key={m} className={`dropdown-item${selectedMonth === i ? ' active' : ''}`}
                      onClick={() => { setSelectedMonth(i); setMonthOpen(false); }}
                      style={{ justifyContent: 'center', textAlign: 'center', fontSize: 11 }}
                    >{m}</div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Date + Time + Refresh */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 16, height: 36,
            padding: '8px 10px', borderRadius: 100,
            backdropFilter: 'blur(2px)', background: 'rgba(255,255,255,0.8)',
            border: '1px solid white',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontFamily: font }}>
              <span style={{ color: 'rgba(60,60,67,0.6)' }}>{date}</span>
              <span style={{ color: 'black', fontWeight: 600 }}>{time}</span>
            </div>
            <button onClick={() => setNow(new Date())} style={{
              width: 20, height: 20, borderRadius: 8, border: 'none', padding: 0,
              background: 'transparent', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <img src={vsRefresh} alt="" style={{ width: 16, height: 19 }} />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}

/* =============================================
   2. STAT CARDS - 5 cards
   ============================================= */
function StatCards() {
  const cards = [
    { label: 'ผู้ป่วยทั้งหมด', value: '200', growth: '+4.3%', icon: vsIconPerson, bg: 'linear-gradient(148deg, #3B82F6, #1D4ED8)', shadow: '0 4px 14px rgba(59,130,246,0.3)' },
    { label: 'ค่าผิดปกติ', value: '190', growth: '+6.3%', icon: vsIconEcg, bg: 'linear-gradient(148deg, #FC9BBA, #DB677E)', shadow: '0 4px 14px rgba(252,155,186,0.3)' },
    { label: 'ค่าผิดปกติวิกฤต', value: '50', growth: null, icon: vsIconWarning, bg: 'linear-gradient(148deg, #E8802A, #D06A1A)', shadow: '0 4px 14px rgba(232,128,42,0.3)' },
    { label: 'ใกล้วิกฤต', value: '25', growth: '+7.8%', icon: vsIconStar, bg: 'linear-gradient(148deg, #E8432A, #D0381A)', shadow: '0 4px 14px rgba(208,56,26,0.3)' },
    { label: 'ส่งรพ', value: '15%', growth: '+9.2%', icon: vsIconHeart, bg: 'linear-gradient(148deg, #8B5CF6, #7C3AED)', shadow: '0 4px 14px rgba(139,92,246,0.3)' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14 }}>
      {cards.map((c, i) => (
        <div key={c.label} className={`hover-stat anim-slide-up delay-${i + 1}`} style={{
          background: c.bg,
          height: 130,
          borderRadius: 24,
          padding: 16,
          border: '1px solid rgba(255,255,255,0.7)',
          boxShadow: c.shadow,
          position: 'relative',
          overflow: 'hidden',
          fontFamily: font,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
          {/* Top: icon + growth */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src={c.icon} alt="" style={{ width: 16, height: 16 }} />
            </div>
            {c.growth && (
              <div style={{ borderRadius: 999, background: 'rgba(255,255,255,0.18)', padding: '4px 10px', fontSize: 11, color: 'white', fontWeight: 600 }}>↑ {c.growth}</div>
            )}
          </div>
          {/* Bottom: label + value */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 500, color: 'white', margin: 0, opacity: 0.9 }}>{c.label}</p>
            <CountUp end={parseFloat(c.value)} suffix={String(c.value).includes('%') ? '%' : ''} delay={i * 100} style={{ fontSize: 26, fontWeight: 700, color: 'white', margin: '2px 0 0', display: 'block' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* =============================================
   3. CHARTS ROW - 2 columns
   ============================================= */
function ChartsRow() {
  const [hoveredVital, setHoveredVital] = useState(null);
  const [hoveredBar, setHoveredBar] = useState(null);
  const vitalTypes = [
    { name: 'ความดันโลหิต', count: '193 ครั้ง', img: imgVitalBp, normal: 100, abnormal: 35, unit: 'mmHg', range: '120/80 - 140/90', avg: '132/85', critical: 8, warning: 12 },
    { name: 'ชีพจร', count: '193 ครั้ง', img: imgVitalPulse, normal: 100, abnormal: 35, unit: 'bpm', range: '60 - 100', avg: '78', critical: 5, warning: 10 },
    { name: 'อุณหภูมิ', count: '175 ครั้ง', img: imgVitalTemp, normal: 100, abnormal: 35, unit: '°C', range: '36.1 - 37.2', avg: '36.8', critical: 3, warning: 7 },
    { name: 'ออกซิเจน', count: '193 ครั้ง', img: imgVitalOxygen, normal: 100, abnormal: 35, unit: '%SpO2', range: '95 - 100', avg: '97', critical: 4, warning: 8 },
    { name: 'น้ำตาล', count: '193 ครั้ง', img: imgVitalSugar, normal: 100, abnormal: 35, unit: 'mg/dL', range: '70 - 130', avg: '118', critical: 6, warning: 9 },
  ];

  const weeklyData = [
    { day: '17 มี.ค.', critical: 5, normal: 45 },
    { day: '18 มี.ค.', critical: 8, normal: 50 },
    { day: '19 มี.ค.', critical: 3, normal: 55 },
    { day: '20 มี.ค.', critical: 10, normal: 48 },
    { day: '21 มี.ค.', critical: 6, normal: 52 },
    { day: '22 มี.ค.', critical: 4, normal: 58 },
    { day: '23 มี.ค.', critical: 7, normal: 60 },
  ];

  return (
    <div style={{ display: 'flex', gap: 16 }}>
      {/* LEFT: vital signs summary (~530px) */}
      <div className="hover-card anim-slide-up delay-3" style={{ ...glassCard, flex: 1 }}>
        {/* Header with icon */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 40, height: 40, borderRadius: 14, background: '#6658E1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <img src={vsSparkleIcon} alt="" style={{ width: 20, height: 23 }} />
          </div>
          <div>
            <p style={{ fontSize: 16, fontWeight: 700, color: BLACK, margin: 0, fontFamily: font }}>สรุป Vital Signs แยกประเภท</p>
            <p style={{ fontSize: 12, color: GRAY, margin: 0, lineHeight: '16px', fontFamily: font }}>จำนวนการวัดและค่าผิดปกติ</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
          {vitalTypes.map((v, vi) => (
            <div key={v.name} className="hover-card" style={{
              display: 'flex', alignItems: 'center', gap: 16,
              background: 'white', borderRadius: 16, padding: '8px 16px 8px 8px',
              cursor: 'pointer', position: 'relative',
            }}
              onMouseEnter={() => setHoveredVital(vi)}
              onMouseLeave={() => setHoveredVital(null)}
            >
              {/* 3D Image */}
              <img src={v.img} alt="" style={{ width: 56, height: 56, objectFit: 'cover', flexShrink: 0 }} />
              {/* Name + count */}
              <div style={{ width: 80, flexShrink: 0 }}>
                <p style={{ fontSize: 12, color: 'black', margin: 0, fontFamily: font, lineHeight: '16px' }}>{v.name}</p>
                <p style={{ fontSize: 10, color: '#8E8E93', margin: 0, fontFamily: font, lineHeight: '16px' }}>{v.count}</p>
              </div>
              {/* Bar */}
              <div style={{ flex: 1, display: 'flex', height: 10, borderRadius: 100, overflow: 'hidden', background: 'rgba(116,116,128,0.08)' }}>
                <div style={{ flex: 1, height: '100%', borderRadius: 100, backgroundImage: 'linear-gradient(174deg, #19A589, #0D7C66)' }} />
                <div style={{ flex: 1, height: '100%', borderRadius: 100, backgroundImage: 'linear-gradient(180deg, #FF383C, #992224)' }} />
              </div>
              {/* ปกติ / ผิดปกติ badges */}
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <div style={{ width: 60, background: 'rgba(116,116,128,0.08)', borderRadius: 16, padding: '4px 0', textAlign: 'center' }}>
                  <p style={{ fontSize: 8, color: '#8E8E93', margin: 0, fontFamily: font }}>ปกติ</p>
                  <p style={{ fontSize: 10, color: 'black', margin: 0, fontFamily: font }}>{v.normal}</p>
                </div>
                <div style={{ width: 60, background: 'rgba(116,116,128,0.08)', borderRadius: 16, padding: '4px 0', textAlign: 'center' }}>
                  <p style={{ fontSize: 8, color: '#8E8E93', margin: 0, fontFamily: font }}>ผิดปกติ</p>
                  <p style={{ fontSize: 10, color: 'black', margin: 0, fontFamily: font }}>{v.abnormal}</p>
                </div>
              </div>

              {/* Hover Detail Tooltip */}
              {hoveredVital === vi && (
                <div style={{
                  position: 'absolute', left: '50%', bottom: '100%', transform: 'translateX(-50%)',
                  marginBottom: 8, zIndex: 100, width: 280,
                  background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(20px) saturate(180%)',
                  borderRadius: 16, padding: 14, fontFamily: font,
                  boxShadow: '0 12px 40px rgba(30,27,57,0.14), 0 0 0 1px rgba(255,255,255,0.7)',
                  border: '1px solid rgba(0,0,0,0.04)',
                  animation: 'slideUp 0.18s cubic-bezier(.2,0,.38,.9)',
                }}>
                  {/* Header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <img src={v.img} alt="" style={{ width: 36, height: 36, objectFit: 'cover' }} />
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: BLACK, margin: 0 }}>{v.name}</p>
                      <p style={{ fontSize: 10, color: '#8E8E93', margin: 0 }}>หน่วย: {v.unit}</p>
                    </div>
                  </div>
                  {/* Stats grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div style={{ background: 'rgba(52,199,89,0.08)', borderRadius: 10, padding: '8px 10px' }}>
                      <p style={{ fontSize: 9, color: '#8E8E93', margin: 0 }}>ค่าเฉลี่ย</p>
                      <p style={{ fontSize: 14, fontWeight: 700, color: '#34C759', margin: '2px 0 0' }}>{v.avg} <span style={{ fontSize: 9, fontWeight: 400 }}>{v.unit}</span></p>
                    </div>
                    <div style={{ background: 'rgba(139,92,246,0.08)', borderRadius: 10, padding: '8px 10px' }}>
                      <p style={{ fontSize: 9, color: '#8E8E93', margin: 0 }}>ช่วงปกติ</p>
                      <p style={{ fontSize: 14, fontWeight: 700, color: '#8B5CF6', margin: '2px 0 0' }}>{v.range}</p>
                    </div>
                    <div style={{ background: 'rgba(255,56,60,0.08)', borderRadius: 10, padding: '8px 10px' }}>
                      <p style={{ fontSize: 9, color: '#8E8E93', margin: 0 }}>วิกฤต</p>
                      <p style={{ fontSize: 14, fontWeight: 700, color: '#FF383C', margin: '2px 0 0' }}>{v.critical} <span style={{ fontSize: 9, fontWeight: 400 }}>ราย</span></p>
                    </div>
                    <div style={{ background: 'rgba(232,128,42,0.08)', borderRadius: 10, padding: '8px 10px' }}>
                      <p style={{ fontSize: 9, color: '#8E8E93', margin: 0 }}>เฝ้าระวัง</p>
                      <p style={{ fontSize: 14, fontWeight: 700, color: '#E8802A', margin: '2px 0 0' }}>{v.warning} <span style={{ fontSize: 9, fontWeight: 400 }}>ราย</span></p>
                    </div>
                  </div>
                  {/* Arrow */}
                  <div style={{
                    position: 'absolute', bottom: -6, left: '50%', transform: 'translateX(-50%)',
                    width: 12, height: 12, background: 'rgba(255,255,255,0.97)',
                    borderRadius: 2, transform: 'translateX(-50%) rotate(45deg)',
                    boxShadow: '2px 2px 4px rgba(0,0,0,0.04)',
                  }} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT COLUMN (~530px) - 2 stacked cards */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Top right: severity */}
        <div className="hover-card anim-slide-up delay-4" style={{ ...glassCard, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Header with bolt icon */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 40, height: 40, borderRadius: 14, backgroundImage: 'linear-gradient(135deg, #E8432A, #D0381A)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <img src={vsBolt} alt="" style={{ width: 14, height: 22 }} />
            </div>
            <div>
              <p style={{ fontSize: 16, fontWeight: 700, color: BLACK, margin: 0, fontFamily: font }}>ระดับความรุนแรง</p>
              <p style={{ fontSize: 12, color: GRAY, margin: 0, lineHeight: '16px', fontFamily: font }}>แบ่งตามความเร่งด่วน</p>
            </div>
          </div>
          {/* 3 severity cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {[
              { label: 'วิกฤต', value: 25, color: '#D0381A', borderColor: 'rgba(208,56,26,0.5)', dotGradient: 'linear-gradient(135deg, #FB6D51, #D0381A)', desc: 'ต้องดูแลทันที' },
              { label: 'เฝ้าระวัง', value: 20, color: '#D06A1A', borderColor: 'rgba(208,106,26,0.5)', dotGradient: 'linear-gradient(135deg, #E8802A, #D06A1A)', desc: 'ติดตามใกล้ชิด' },
              { label: 'ปกติ', value: 70, color: '#19A589', borderColor: 'rgba(25,165,137,0.5)', dotGradient: 'linear-gradient(184deg, #26C1A2, #0D7C66)', desc: 'ค่าอยู่ในเกณฑ์' },
            ].map((s, si) => (
              <div key={s.label} className="hover-card" style={{
                backdropFilter: 'blur(5px)', background: 'rgba(255,255,255,0.5)',
                border: `1px solid ${s.borderColor}`, borderRadius: 16,
                padding: 16, display: 'flex', flexDirection: 'column', gap: 8,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 10, backgroundImage: s.dotGradient, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, fontWeight: 500, color: 'black', fontFamily: font, letterSpacing: 0.22 }}>{s.label}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                  <CountUp end={s.value} delay={si * 150} style={{ fontSize: 26, fontWeight: 700, color: s.color, lineHeight: '26px', fontFamily: font }} />
                  <span style={{ fontSize: 8, color: '#8E8E93', fontFamily: font, lineHeight: '16.5px' }}>{s.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom right: weekly trend - BAR CHART per Figma */}
        <div className="hover-card anim-slide-up delay-5" style={{ ...glassCard, flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Header with icon */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 40, height: 40, borderRadius: 14, backgroundImage: 'linear-gradient(135deg, #FC9BBA, #DB677E)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <img src={vsArrowUp} alt="" style={{ width: 20, height: 20 }} />
            </div>
            <div>
              <p style={{ fontSize: 16, fontWeight: 700, color: BLACK, margin: 0, fontFamily: font }}>แนวโน้มการวัด 7 วัน</p>
              <p style={{ fontSize: 12, color: GRAY, margin: 0, lineHeight: '16px', fontFamily: font }}>จำนวนการวัดรายวัน</p>
            </div>
          </div>

          {/* Legend + ดูเพิ่มเติม */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: GRAY, fontFamily: font }}>
                <span style={{ width: 8, height: 8, borderRadius: 10, backgroundImage: 'linear-gradient(135deg, #FC9BBA, #DB677E)', display: 'inline-block' }} /> วัดทั้งหมด
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 12, color: GRAY, fontFamily: font }}>
                <span style={{ width: 8, height: 8, borderRadius: 10, backgroundImage: 'linear-gradient(180deg, #FF383C, #992224)', display: 'inline-block' }} /> ผิดปกติ
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <img src={vsInfo} alt="" style={{ width: 14, height: 14 }} />
              <span style={{ fontSize: 12, color: 'black', fontFamily: font, letterSpacing: -0.23 }}>ดูเพิ่มเติม</span>
            </div>
          </div>

          {/* Bar chart */}
          <div style={{ display: 'flex', gap: 0, height: 160 }}>
            {/* Y axis */}
            <div style={{ width: 44, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', paddingBottom: 22, flexShrink: 0 }}>
              {['500k', '100k', '50k', '0'].map(l => (
                <span key={l} style={{ fontSize: 10, color: GRAY, fontFamily: font, lineHeight: '14px' }}>{l}</span>
              ))}
            </div>
            {/* Chart area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              {/* Grid + bars */}
              <div style={{ flex: 1, position: 'relative', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                {/* Grid lines */}
                {[0, 33, 66].map(t => (
                  <div key={t} style={{ position: 'absolute', left: 0, right: 0, top: `${t}%`, height: 1, background: 'rgba(0,0,0,0.06)' }} />
                ))}
                {/* Bars row */}
                <div style={{ position: 'absolute', inset: 0, display: 'flex', gap: 6, alignItems: 'flex-end', padding: '0 4px' }}>
                  {[
                    { total: 40, abnormal: 10, tVal: '200k', aVal: '50k', day: '17 มี.ค.', normal: 150, crit: 12, warn: 38 },
                    { total: 85, abnormal: 25, tVal: '425k', aVal: '125k', day: '18 มี.ค.', normal: 300, crit: 45, warn: 80 },
                    { total: 65, abnormal: 33, tVal: '325k', aVal: '165k', day: '19 มี.ค.', normal: 160, crit: 65, warn: 100 },
                    { total: 85, abnormal: 52, tVal: '425k', aVal: '260k', day: '20 มี.ค.', normal: 165, crit: 110, warn: 150 },
                    { total: 60, abnormal: 28, tVal: '300k', aVal: '140k', day: '21 มี.ค.', normal: 160, crit: 50, warn: 90 },
                    { total: 77, abnormal: 36, tVal: '385k', aVal: '180k', day: '22 มี.ค.', normal: 205, crit: 70, warn: 110 },
                    { total: 72, abnormal: 52, tVal: '360k', aVal: '260k', day: '23 มี.ค.', normal: 100, crit: 110, warn: 150 },
                  ].map((d, i) => (
                    <div key={i}
                      onMouseEnter={() => setHoveredBar(i)}
                      onMouseLeave={() => setHoveredBar(null)}
                      style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, position: 'relative', cursor: 'pointer' }}
                    >
                      {/* Value labels on bars */}
                      <div style={{
                        display: 'flex', gap: 2, alignItems: 'flex-end', justifyContent: 'center',
                        opacity: hoveredBar === i ? 1 : 0.7,
                        transition: 'opacity 0.15s ease, transform 0.15s ease',
                        transform: hoveredBar === i ? 'scaleY(1.03)' : 'scaleY(1)',
                        transformOrigin: 'bottom',
                      }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <span style={{ fontSize: 8, color: '#DB677E', fontWeight: 600, fontFamily: font, marginBottom: 2 }}>{d.tVal}</span>
                          <div className="anim-bar" style={{
                            width: 14, height: `${d.total * 1.1}px`, maxHeight: 100,
                            borderRadius: '6px 6px 0 0',
                            backgroundImage: 'linear-gradient(108deg, #FC9BBA, #DB677E)',
                            animationDelay: `${i * 0.08}s`,
                          }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <span style={{ fontSize: 8, color: '#D0381A', fontWeight: 600, fontFamily: font, marginBottom: 2 }}>{d.aVal}</span>
                          <div className="anim-bar" style={{
                            width: 14, height: `${d.abnormal * 1.1}px`, maxHeight: 100,
                            borderRadius: '6px 6px 0 0',
                            backgroundImage: 'linear-gradient(143deg, #E8432A, #D0381A)',
                            animationDelay: `${i * 0.08 + 0.04}s`,
                          }} />
                        </div>
                      </div>

                      {/* Hover tooltip */}
                      {hoveredBar === i && (
                        <div style={{
                          position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)',
                          marginBottom: 4, zIndex: 50, width: 160, padding: 10,
                          background: 'rgba(30,27,57,0.92)', backdropFilter: 'blur(12px)',
                          borderRadius: 12, fontFamily: font,
                          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                          animation: 'slideUp 0.15s ease',
                        }}>
                          <p style={{ fontSize: 11, fontWeight: 600, color: 'white', margin: '0 0 6px' }}>{d.day}</p>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'rgba(255,255,255,0.7)' }}>
                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#FC9BBA' }} /> วัดทั้งหมด
                              </span>
                              <span style={{ fontSize: 11, fontWeight: 600, color: '#FC9BBA' }}>{d.tVal}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'rgba(255,255,255,0.7)' }}>
                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#E8432A' }} /> ผิดปกติ
                              </span>
                              <span style={{ fontSize: 11, fontWeight: 600, color: '#E8432A' }}>{d.aVal}</span>
                            </div>
                            <div style={{ height: 1, background: 'rgba(255,255,255,0.1)', margin: '2px 0' }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)' }}>ปกติ</span>
                              <span style={{ fontSize: 10, color: '#34C759', fontWeight: 600 }}>{d.normal}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)' }}>วิกฤต</span>
                              <span style={{ fontSize: 10, color: '#FF383C', fontWeight: 600 }}>{d.crit}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)' }}>เฝ้าระวัง</span>
                              <span style={{ fontSize: 10, color: '#E8802A', fontWeight: 600 }}>{d.warn}</span>
                            </div>
                          </div>
                          <div style={{ position: 'absolute', bottom: -4, left: '50%', transform: 'translateX(-50%) rotate(45deg)', width: 8, height: 8, background: 'rgba(30,27,57,0.92)' }} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              {/* X axis labels */}
              <div style={{ display: 'flex', gap: 6, padding: '6px 4px 0' }}>
                {['17 มี.ค.', '18 มี.ค.', '19 มี.ค.', '20 มี.ค.', '21 มี.ค.', '22 มี.ค.', '23 มี.ค.'].map(d => (
                  <span key={d} style={{ flex: 1, fontSize: 10, color: GRAY, fontFamily: font, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =============================================
   4. MAP SECTION + PATIENT LIST
   ============================================= */
function MapSection() {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const [activeFilter, setActiveFilter] = useState(0);
  const [mapListPage, setMapListPage] = useState(1);
  const [activeMapStyle, setActiveMapStyle] = useState(0);

  const filters = ['ทั้งหมด', 'ความดันโลหิต', 'ชีพจร', 'อุณหภูมิ', 'ออกซิเจน', 'น้ำตาล'];

  const rasterStyle = (tiles, attr = '') => ({
    version: 8,
    sources: { raster: { type: 'raster', tiles, tileSize: 256, attribution: attr } },
    layers: [{ id: 'raster-layer', type: 'raster', source: 'raster' }],
  });
  const mapStyles = [
    { label: 'แผนที่', url: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json' },
    { label: 'ดาวเทียม', url: rasterStyle(['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'], '&copy; Esri') },
    { label: 'ภูมิประเทศ', url: rasterStyle(['https://tile.opentopomap.org/{z}/{x}/{y}.png'], '&copy; OpenTopoMap') },
  ];

  // ตำแหน่งบ้านผู้ป่วย + อายุ/เพศ สำหรับ avatar
  const MAP_POINTS = [
    // ปกติ (green)
    { lng: 100.5018, lat: 13.7563, status: 'normal', name: 'นายวิชัย พงษ์สุวรรณ', vital: 'BP 120/80 mmHg', vtype: 'ความดันโลหิต', age: 45, gender: 'ชาย' },
    { lng: 98.9853, lat: 18.7883, status: 'normal', name: 'นางบุญมา สุขใจ', vital: 'อุณหภูมิ 36.5 °C', vtype: 'อุณหภูมิ', age: 58, gender: 'หญิง' },
    { lng: 100.4733, lat: 7.0086, status: 'normal', name: 'นางจันทร์เพ็ญ ดวงแก้ว', vital: 'BP 118/75 mmHg', vtype: 'ความดันโลหิต', age: 32, gender: 'หญิง' },
    { lng: 102.8360, lat: 16.4322, status: 'normal', name: 'นายสมศักดิ์ แสงจันทร์', vital: 'ชีพจร 72 bpm', vtype: 'ชีพจร', age: 68, gender: 'ชาย' },
    { lng: 100.9925, lat: 12.9236, status: 'normal', name: 'นายอำนวย ชัยชนะ', vital: 'SpO2 98%', vtype: 'ออกซิเจน', age: 62, gender: 'ชาย' },
    { lng: 99.0087, lat: 18.5590, status: 'normal', name: 'นางปราณี วงค์เทพ', vital: 'น้ำตาล 95 mg/dL', vtype: 'น้ำตาล', age: 75, gender: 'หญิง' },
    { lng: 100.5166, lat: 13.6513, status: 'normal', name: 'นางสุนีย์ รักษาศรี', vital: 'BP 125/82 mmHg', vtype: 'ความดันโลหิต', age: 70, gender: 'หญิง' },
    // ผิดปกติ (red)
    { lng: 100.5382, lat: 13.7248, status: 'abnormal', name: 'นายสมชาย แก้วมณี', vital: 'BP 150/92 mmHg', vtype: 'ความดันโลหิต', badge: 'ความดันสูง', age: 72, gender: 'ชาย' },
    { lng: 100.4394, lat: 13.7200, status: 'abnormal', name: 'นางสมศรี ดีใจ', vital: 'SpO2 80%', vtype: 'ออกซิเจน', badge: 'ออกซิเจนต่ำ', age: 65, gender: 'หญิง' },
    { lng: 104.1348, lat: 17.1533, status: 'abnormal', name: 'นายประยูร ทองคำ', vital: 'อุณหภูมิ 38.5 °C', vtype: 'อุณหภูมิ', badge: 'มีไข้สูง', age: 80, gender: 'ชาย' },
    { lng: 100.5652, lat: 13.6800, status: 'abnormal', name: 'นางบุญมา สุขใจ', vital: 'ชีพจร 110 bpm', vtype: 'ชีพจร', badge: 'หัวใจเต้นเร็ว', age: 58, gender: 'หญิง' },
    { lng: 102.1044, lat: 14.9666, status: 'abnormal', name: 'นายวิชัย พงษ์สุวรรณ', vital: 'น้ำตาล 280 mg/dL', vtype: 'น้ำตาล', badge: 'น้ำตาลสูงมาก', age: 45, gender: 'ชาย' },
    { lng: 99.8266, lat: 19.9105, status: 'abnormal', name: 'นางสุนีย์ รักษาศรี', vital: 'BP 165/100 mmHg', vtype: 'ความดันโลหิต', badge: 'ความดันวิกฤต', age: 70, gender: 'หญิง' },
    { lng: 99.0956, lat: 9.1382, status: 'abnormal', name: 'นางจันทร์เพ็ญ ดวงแก้ว', vital: 'อุณหภูมิ 39.2 °C', vtype: 'อุณหภูมิ', badge: 'ไข้สูงมาก', age: 32, gender: 'หญิง' },
    { lng: 100.0800, lat: 9.9608, status: 'abnormal', name: 'นายสมศักดิ์ แสงจันทร์', vital: 'SpO2 85%', vtype: 'ออกซิเจน', badge: 'ออกซิเจนต่ำ', age: 68, gender: 'ชาย' },
    { lng: 98.3923, lat: 7.8804, status: 'abnormal', name: 'นางปราณี วงค์เทพ', vital: 'ชีพจร 120 bpm', vtype: 'ชีพจร', badge: 'หัวใจเต้นเร็วมาก', age: 75, gender: 'หญิง' },
    { lng: 101.1453, lat: 12.6817, status: 'abnormal', name: 'นายอำนวย ชัยชนะ', vital: 'น้ำตาล 320 mg/dL', vtype: 'น้ำตาล', badge: 'น้ำตาลวิกฤต', age: 62, gender: 'ชาย' },
    { lng: 103.5038, lat: 15.2500, status: 'abnormal', name: 'นายสมชาย แก้วมณี', vital: 'BP 180/110 mmHg', vtype: 'ความดันโลหิต', badge: 'ความดันวิกฤต', age: 72, gender: 'ชาย' },
  ];

  const abnormalPatients = [
    { name: 'สมชาย แก้วมณี', type: 'ความดันโลหิต', reading: '150/77 mmHg', badge: 'ความดันโลหิตสูง', age: 72, gender: 'ชาย' },
    { name: 'สมศรี ดีใจ', type: 'ออกซิเจน', reading: '80%', badge: 'ต่ำ', age: 65, gender: 'หญิง' },
    { name: 'ประยูร ทองคำ', type: 'อุณหภูมิ', reading: '38.00 °C', badge: 'มีไข้', age: 80, gender: 'ชาย' },
    { name: 'บุญมา สุขใจ', type: 'ชีพจร', reading: '103 bpm', badge: 'หัวใจเต้นเร็ว', age: 58, gender: 'หญิง' },
    { name: 'สุนีย์ รักษาศรี', type: 'น้ำตาล', reading: '220 mg/dL', badge: 'ระดับน้ำตาลสูงมาก', age: 70, gender: 'หญิง' },
    { name: 'จันทร์เพ็ญ ดวงแก้ว', type: 'น้ำตาล', reading: '220 mg/dL', badge: 'ระดับน้ำตาลสูงมาก', age: 32, gender: 'หญิง' },
    { name: 'สมศักดิ์ แสงจันทร์', type: 'น้ำตาล', reading: '220 mg/dL', badge: 'ระดับน้ำตาลสูงมาก', age: 68, gender: 'ชาย' },
    { name: 'ปราณี วงค์เทพ', type: 'อุณหภูมิ', reading: '38.00 °C', badge: 'มีไข้', age: 75, gender: 'หญิง' },
    { name: 'อำนวย ชัยชนะ', type: 'อุณหภูมิ', reading: '38.00 °C', badge: 'มีไข้', age: 62, gender: 'ชาย' },
    { name: 'วิชัย พงษ์สุวรรณ', type: 'ความดันโลหิต', reading: '150/77 mmHg', badge: 'ความดันโลหิตสูง', age: 45, gender: 'ชาย' },
  ];

  const vitalTypeIcon = {
    'ความดันโลหิต': vsBp,
    'ชีพจร': vsPulse,
    'อุณหภูมิ': vsTemp,
    'ออกซิเจน': vsDrop,
    'น้ำตาล': vsSparkles,
  };

  const selectedFilter = filters[activeFilter];
  const filteredAbnormal = selectedFilter === 'ทั้งหมด'
    ? abnormalPatients
    : abnormalPatients.filter(p => p.type === selectedFilter);
  const filteredMapPoints = selectedFilter === 'ทั้งหมด'
    ? MAP_POINTS
    : MAP_POINTS.filter(p => p.vtype === selectedFilter);

  const perPage = 10;
  const totalPatients = filteredAbnormal.length;
  const totalPages = Math.ceil(totalPatients / perPage);
  const visiblePatients = filteredAbnormal.slice((mapListPage - 1) * perPage, mapListPage * perPage);

  const markersRef = useRef([]);

  const addMarkers = (map) => {
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    MAP_POINTS.forEach(pt => {
      const el = document.createElement('div');
      el.className = pt.status === 'abnormal' ? 'map-marker-red' : 'map-marker-green';
      el.title = pt.name;
      const popup = new maplibregl.Popup({ offset: 12, closeButton: false, maxWidth: '200px' })
        .setHTML(`<div style="font-family:${font};font-size:12px;padding:2px"><strong>${pt.name}</strong><br/><span style="color:${pt.status === 'abnormal' ? '#FF383C' : '#34C759'};font-size:11px">${pt.status === 'abnormal' ? '⚠ ค่าผิดปกติ' : '✓ ค่าปกติ'}</span></div>`);
      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([pt.lng, pt.lat])
        .setPopup(popup)
        .addTo(map);
      markersRef.current.push(marker);
    });
  };

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;
    try {
      const map = new maplibregl.Map({
        container: mapContainer.current,
        style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
        center: [101.0, 13.0],
        zoom: 5.2,
        attributionControl: false,
      });
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-left');
      const addLayers = () => {
        // Remove existing if any
        ['pts-glow-red','pts-red','pts-green','pts-glow-green'].forEach(id => { try { map.removeLayer(id); } catch(e){} });
        try { map.removeSource('patients'); } catch(e){}

        map.addSource('patients', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: MAP_POINTS.map(pt => ({
              type: 'Feature',
              geometry: { type: 'Point', coordinates: [pt.lng, pt.lat] },
              properties: { status: pt.status, name: pt.name, vital: pt.vital || '', vtype: pt.vtype || '', badge: pt.badge || '', avatar: getAvatar(pt.age || 45, pt.gender || 'ชาย') },
            })),
          },
        });
        // === RED: ambient halo + 3 radar rings + core ===
        map.addLayer({ id: 'pts-halo-red', type: 'circle', source: 'patients', filter: ['==', 'status', 'abnormal'],
          paint: { 'circle-radius': 20, 'circle-color': 'rgba(255,56,60,0.06)', 'circle-blur': 1.2 } });
        map.addLayer({ id: 'pts-wave3', type: 'circle', source: 'patients', filter: ['==', 'status', 'abnormal'],
          paint: { 'circle-radius': 8, 'circle-color': 'rgba(255,56,60,0.12)', 'circle-blur': 0.4, 'circle-opacity': 0 } });
        map.addLayer({ id: 'pts-wave2', type: 'circle', source: 'patients', filter: ['==', 'status', 'abnormal'],
          paint: { 'circle-radius': 8, 'circle-color': 'rgba(255,56,60,0.18)', 'circle-blur': 0.3, 'circle-opacity': 0 } });
        map.addLayer({ id: 'pts-wave1', type: 'circle', source: 'patients', filter: ['==', 'status', 'abnormal'],
          paint: { 'circle-radius': 8, 'circle-color': 'rgba(255,56,60,0.25)', 'circle-blur': 0.2, 'circle-opacity': 0 } });
        map.addLayer({ id: 'pts-red', type: 'circle', source: 'patients', filter: ['==', 'status', 'abnormal'],
          paint: { 'circle-radius': 5.5, 'circle-color': '#FF383C', 'circle-stroke-width': 2.5, 'circle-stroke-color': 'rgba(255,255,255,0.9)' } });

        // === GREEN: soft aura + core ===
        map.addLayer({ id: 'pts-aura-green', type: 'circle', source: 'patients', filter: ['==', 'status', 'normal'],
          paint: { 'circle-radius': 16, 'circle-color': 'rgba(52,199,89,0.06)', 'circle-blur': 1.2 } });
        map.addLayer({ id: 'pts-glow-green', type: 'circle', source: 'patients', filter: ['==', 'status', 'normal'],
          paint: { 'circle-radius': 10, 'circle-color': 'rgba(52,199,89,0.1)', 'circle-blur': 0.6 } });
        map.addLayer({ id: 'pts-green', type: 'circle', source: 'patients', filter: ['==', 'status', 'normal'],
          paint: { 'circle-radius': 5, 'circle-color': '#34C759', 'circle-stroke-width': 2.5, 'circle-stroke-color': 'rgba(255,255,255,0.9)' } });

        // Hover popup (not click)
        let hoverPopup = null;
        const showHover = (e) => {
          const f = e.features[0];
          const p = f.properties;
          const isRed = p.status === 'abnormal';
          const c = isRed ? '#FF383C' : '#34C759';
          const bg = isRed ? 'rgba(255,56,60,0.05)' : 'rgba(52,199,89,0.05)';
          const bg2 = isRed ? 'rgba(255,56,60,0.08)' : 'rgba(52,199,89,0.08)';
          const statusLabel = isRed ? (p.badge || 'ผิดปกติ') : 'ค่าปกติ';
          const statusIcon = isRed ? '⚠' : '✓';
          // Parse vital value + unit
          const vitalParts = (p.vital || '').split(' ');
          const vitalLabel = vitalParts[0] || '';
          const vitalValue = vitalParts.slice(1, -1).join(' ') || vitalParts[1] || '';
          const vitalUnit = vitalParts[vitalParts.length - 1] || '';
          map.getCanvas().style.cursor = 'pointer';
          if (hoverPopup) hoverPopup.remove();
          hoverPopup = new maplibregl.Popup({ offset: 16, closeButton: false, maxWidth: '280px' })
            .setLngLat(f.geometry.coordinates)
            .setHTML(
              '<div style="font-family:IBM Plex Sans Thai Looped,sans-serif;padding:10px;min-width:220px">' +
                // Status badge top
                '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">' +
                  '<div style="display:flex;align-items:center;gap:6px">' +
                    '<span style="width:8px;height:8px;border-radius:50%;background:' + c + ';display:inline-block;box-shadow:0 0 6px ' + c + '60"></span>' +
                    '<span style="font-size:10px;font-weight:500;color:' + c + '">' + statusIcon + ' ' + statusLabel + '</span>' +
                  '</div>' +
                  '<span style="font-size:9px;color:#8E8E93">' + (p.vtype || '') + '</span>' +
                '</div>' +
                // Patient info with avatar
                '<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">' +
                  '<div style="position:relative;width:40px;height:40px;flex-shrink:0">' +
                    '<img src="' + (p.avatar || '') + '" style="width:40px;height:40px;border-radius:50%;object-fit:cover;border:2px solid ' + c + '30" />' +
                    '<div style="position:absolute;bottom:-1px;right:-1px;width:14px;height:14px;border-radius:50%;background:' + c + ';border:1.5px solid white;display:flex;align-items:center;justify-content:center">' +
                      '<span style="font-size:8px;color:white">' + statusIcon + '</span>' +
                    '</div>' +
                  '</div>' +
                  '<div style="flex:1;min-width:0">' +
                    '<div style="font-size:14px;font-weight:600;color:#1E1B39;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + p.name + '</div>' +
                    '<div style="font-size:10px;color:#8E8E93;margin-top:2px">ตำแหน่งบ้านผู้ป่วย</div>' +
                  '</div>' +
                '</div>' +
                // Divider
                '<div style="height:1px;background:rgba(0,0,0,0.06);margin-bottom:10px"></div>' +
                // Vital sign reading card
                '<div style="background:' + bg2 + ';border-radius:12px;padding:10px 12px;border:1px solid ' + c + '15">' +
                  '<div style="font-size:10px;color:#8E8E93;margin-bottom:4px">ค่า Vital Sign ล่าสุด</div>' +
                  '<div style="display:flex;align-items:baseline;gap:6px">' +
                    '<span style="font-size:10px;color:#615E83">' + vitalLabel + '</span>' +
                    '<span style="font-size:20px;font-weight:700;color:' + c + ';line-height:1">' + vitalValue + '</span>' +
                    '<span style="font-size:10px;color:#8E8E93">' + vitalUnit + '</span>' +
                  '</div>' +
                '</div>' +
              '</div>'
            )
            .addTo(map);
        };
        const hideHover = () => {
          map.getCanvas().style.cursor = '';
          if (hoverPopup) { hoverPopup.remove(); hoverPopup = null; }
        };
        ['pts-red', 'pts-green'].forEach(id => {
          map.on('mouseenter', id, showHover);
          map.on('mousemove', id, showHover);
          map.on('mouseleave', id, hideHover);
        });

        // Water ripple animation - smooth sine-based
        const animate = () => {
          if (!mapRef.current) return;
          const now = performance.now();
          try {
            // 3 ripple waves - smooth sine easing like water drop
            const cycle = 2800; // slower = more elegant
            [['pts-wave1', 0, 0.35], ['pts-wave2', 930, 0.22], ['pts-wave3', 1860, 0.12]].forEach(([id, delay, maxOp]) => {
              const t = (((now + delay) % cycle) / cycle);
              // Smooth ease: fast start, very slow end (like water ripple fading)
              const ease = Math.sin(t * Math.PI * 0.5); // 0→1 sine quarter
              const fade = Math.cos(t * Math.PI * 0.5); // 1→0 cosine quarter
              map.setPaintProperty(id, 'circle-radius', 6 + ease * 35);
              map.setPaintProperty(id, 'circle-opacity', maxOp * fade * fade); // squared for smoother fade
            });
            // Halo: gentle breathing
            const hb = (Math.sin(now / 1200) + 1) / 2;
            map.setPaintProperty('pts-halo-red', 'circle-radius', 16 + hb * 8);
            map.setPaintProperty('pts-halo-red', 'circle-opacity', 0.3 + hb * 0.2);
            // Green: calm ocean breathing
            const gb = (Math.sin(now / 2000) + 1) / 2;
            map.setPaintProperty('pts-aura-green', 'circle-radius', 12 + gb * 6);
            map.setPaintProperty('pts-aura-green', 'circle-opacity', 0.3 + gb * 0.2);
            map.setPaintProperty('pts-glow-green', 'circle-radius', 8 + gb * 4);
            map.setPaintProperty('pts-glow-green', 'circle-opacity', 0.4 + gb * 0.2);
          } catch(e){}
          requestAnimationFrame(animate);
        };
        animate();
      };
      map.on('load', addLayers);
      mapRef.current = map;
    } catch (e) { console.error('Map init error:', e); }
    return () => { if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; } };
  }, []);

  // Update map points when filter changes
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    try {
      const src = map.getSource('patients');
      if (src) {
        src.setData({
          type: 'FeatureCollection',
          features: filteredMapPoints.map(pt => ({
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [pt.lng, pt.lat] },
            properties: { status: pt.status, name: pt.name, vital: pt.vital || '', vtype: pt.vtype || '', badge: pt.badge || '', avatar: getAvatar(pt.age || 45, pt.gender || 'ชาย') },
          })),
        });
      }
    } catch(e) {}
  }, [activeFilter]);

  const handleMapStyleChange = (idx) => {
    setActiveMapStyle(idx);
    if (!mapRef.current) return;
    mapRef.current.setStyle(mapStyles[idx].url);
    mapRef.current.once('style.load', () => {
      const m = mapRef.current;
      // Re-add source and layers after style change
      m.addSource('patients', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: MAP_POINTS.map(pt => ({
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [pt.lng, pt.lat] },
            properties: { status: pt.status, name: pt.name, vital: pt.vital || '', vtype: pt.vtype || '', badge: pt.badge || '' },
          })),
        },
      });
      // Red layers
      m.addLayer({ id: 'pts-halo-red', type: 'circle', source: 'patients', filter: ['==', 'status', 'abnormal'],
        paint: { 'circle-radius': 20, 'circle-color': 'rgba(255,56,60,0.06)', 'circle-blur': 1.2 } });
      m.addLayer({ id: 'pts-wave3', type: 'circle', source: 'patients', filter: ['==', 'status', 'abnormal'],
        paint: { 'circle-radius': 8, 'circle-color': 'rgba(255,56,60,0.12)', 'circle-blur': 0.4, 'circle-opacity': 0 } });
      m.addLayer({ id: 'pts-wave2', type: 'circle', source: 'patients', filter: ['==', 'status', 'abnormal'],
        paint: { 'circle-radius': 8, 'circle-color': 'rgba(255,56,60,0.18)', 'circle-blur': 0.3, 'circle-opacity': 0 } });
      m.addLayer({ id: 'pts-wave1', type: 'circle', source: 'patients', filter: ['==', 'status', 'abnormal'],
        paint: { 'circle-radius': 8, 'circle-color': 'rgba(255,56,60,0.25)', 'circle-blur': 0.2, 'circle-opacity': 0 } });
      m.addLayer({ id: 'pts-red', type: 'circle', source: 'patients', filter: ['==', 'status', 'abnormal'],
        paint: { 'circle-radius': 5.5, 'circle-color': '#FF383C', 'circle-stroke-width': 2.5, 'circle-stroke-color': 'rgba(255,255,255,0.9)' } });
      // Green layers
      m.addLayer({ id: 'pts-aura-green', type: 'circle', source: 'patients', filter: ['==', 'status', 'normal'],
        paint: { 'circle-radius': 16, 'circle-color': 'rgba(52,199,89,0.06)', 'circle-blur': 1.2 } });
      m.addLayer({ id: 'pts-glow-green', type: 'circle', source: 'patients', filter: ['==', 'status', 'normal'],
        paint: { 'circle-radius': 10, 'circle-color': 'rgba(52,199,89,0.1)', 'circle-blur': 0.6 } });
      m.addLayer({ id: 'pts-green', type: 'circle', source: 'patients', filter: ['==', 'status', 'normal'],
        paint: { 'circle-radius': 5, 'circle-color': '#34C759', 'circle-stroke-width': 2.5, 'circle-stroke-color': 'rgba(255,255,255,0.9)' } });
    });
  };

  return (
    <div className="hover-card anim-slide-up delay-6" style={{ ...glassCard }}>
      <style>{`
        .maplibregl-popup-content {
          border-radius: 14px !important;
          box-shadow: 0 8px 32px rgba(30,27,57,0.14), 0 0 0 1px rgba(255,255,255,0.7) !important;
          padding: 4px !important;
          backdrop-filter: blur(16px) saturate(180%) !important;
          background: rgba(255,255,255,0.92) !important;
          border: 1px solid rgba(255,255,255,0.5) !important;
        }
        .maplibregl-popup-tip { border-top-color: rgba(255,255,255,0.92) !important; }
        .maplibregl-popup-anchor-bottom .maplibregl-popup-tip { border-top-color: rgba(255,255,255,0.92) !important; }
        .maplibregl-popup-anchor-top .maplibregl-popup-tip { border-bottom-color: rgba(255,255,255,0.92) !important; }
      `}</style>

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 40, height: 40, borderRadius: 14, background: '#6658E1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <img src={vsMap} alt="" style={{ width: 20, height: 20 }} />
          </div>
          <div>
            <p style={{ fontSize: 16, fontWeight: 700, color: BLACK, margin: 0, fontFamily: font }}>แผนที่ผู้ป่วย</p>
            <p style={{ fontSize: 12, color: GRAY, margin: 0, lineHeight: '16px', fontFamily: font }}>แสดงตำแหน่งและสถานะผู้ป่วยทั่วประเทศ</p>
          </div>
        </div>

        {/* Filter tabs */}
        <div style={{ background: 'rgba(255,255,255,0.5)', borderRadius: 100, padding: 4, display: 'flex', gap: 2 }}>
          {filters.map((f, i) => (
            <button key={f} className="hover-btn" onClick={() => { setActiveFilter(i); setMapListPage(1); }} style={{
              padding: '6px 14px',
              borderRadius: 100,
              fontSize: 12,
              fontWeight: 500,
              border: 'none',
              cursor: 'pointer',
              fontFamily: font,
              background: activeFilter === i ? '#0088FF' : 'transparent',
              color: activeFilter === i ? 'white' : BLACK,
              transition: 'all 0.2s ease',
            }}>{f}</button>
          ))}
        </div>
      </div>

      {/* Grid 2 columns - fixed height */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, height: 700 }}>
        {/* Left: Map */}
        <div style={{ position: 'relative', background: 'white', borderRadius: 24, overflow: 'hidden' }}>
          <div ref={mapContainer} style={{ position: 'absolute', inset: 0 }} />

          {/* Map style selector - same as Dashboard */}
          <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 2 }}>
            <div style={{
              display: 'flex', padding: 4, borderRadius: 100,
              background: 'rgba(116,116,128,0.08)', backdropFilter: 'blur(5px)',
              border: '1px solid rgba(255,255,255,0.5)',
            }}>
              {mapStyles.map((ms, i) => (
                <button key={ms.label} onClick={() => handleMapStyleChange(i)} style={{
                  border: 'none', borderRadius: 100, padding: '4px 10px', cursor: 'pointer',
                  fontSize: 12, fontFamily: font, whiteSpace: 'nowrap',
                  fontWeight: activeMapStyle === i ? 600 : 400,
                  background: activeMapStyle === i ? 'rgba(0,136,255,0.7)' : 'transparent',
                  color: activeMapStyle === i ? 'white' : 'black',
                  minWidth: activeMapStyle === i ? 80 : undefined,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{ms.label}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Patient list */}
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Sub-header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 14, flexShrink: 0,
              backgroundImage: 'linear-gradient(90deg, rgba(232,128,42,0.2), rgba(232,128,42,0.2)), linear-gradient(90deg, #fff, #fff)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <img src={vsWarning2} alt="" style={{ width: 20, height: 18 }} />
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: BLACK, margin: 0, fontFamily: font }}>เคสผิดปกติ</p>
              <p style={{ fontSize: 12, color: GRAY, margin: 0, lineHeight: '16px', fontFamily: font }}>ผู้ป่วยที่วัดค่า Vitalsign ผิดปกติ</p>
            </div>
          </div>

          {/* Patient rows - card style per Figma */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, overflowY: 'auto' }}>
            {visiblePatients.map((p, i) => (
              <div key={i}
                onClick={() => openPatient({ name: p.name, age: p.age, gender: p.gender, hn: '', phone: '', address: '', group: '', disease: '', team: '', adl: 0, visits: 0, lastVisit: '', outcome: '' })}
                style={{
                display: 'flex', alignItems: 'center', gap: 16,
                background: 'white', border: '1.5px solid transparent',
                borderRadius: 16, padding: '8px 16px 8px 8px', cursor: 'pointer',
                transition: 'border 0.15s ease, box-shadow 0.15s ease',
                animation: 'countUp 0.3s ease both',
                animationDelay: `${i * 0.03}s`,
              }}
                onMouseEnter={e => { e.currentTarget.style.border = '1.5px solid #FF383C'; e.currentTarget.style.boxShadow = '0 0 0 2px rgba(255,56,60,0.12)'; }}
                onMouseLeave={e => { e.currentTarget.style.border = '1.5px solid transparent'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                {/* Avatar + status dot */}
                <div style={{ position: 'relative', width: 40, height: 40, flexShrink: 0 }}>
                  <img src={getAvatar(p.age, p.gender)} alt="" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
                  <div style={{
                    position: 'absolute', bottom: 0, right: 0, width: 16, height: 16, borderRadius: '50%',
                    border: '0.5px solid white', overflow: 'hidden',
                    backgroundImage: getStatusBadge('abnormal').dotBg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <img src={vitalTypeIcon[p.type] || vsBp} alt="" style={{ width: 8, height: 8, filter: 'brightness(10)' }} />
                  </div>
                </div>
                {/* Name + vital reading */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 12, color: 'black', margin: 0, fontFamily: font, lineHeight: '16px' }}>{p.name}</p>
                  <p style={{ fontSize: 10, color: '#8E8E93', margin: 0, fontFamily: font, lineHeight: '16px' }}>{p.type}: {p.reading}</p>
                </div>
                {/* Severity badge */}
                <span style={{
                  padding: '4px 10px', borderRadius: 100, flexShrink: 0,
                  fontSize: 10, fontFamily: font, lineHeight: '16px',
                  color: getStatusBadge('abnormal').color,
                  backgroundImage: getStatusBadge('abnormal').bg,
                }}>{p.badge}</span>
              </div>
            ))}
          </div>

          {/* Pagination - Figma style */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px 0', flex: 'none' }}>
            <span style={{ fontSize: 12, color: GRAY, fontFamily: font, lineHeight: '16px' }}>แสดง {(mapListPage - 1) * perPage + 1}-{Math.min(mapListPage * perPage, totalPatients)} จาก {totalPatients} รายการ</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span onClick={() => setMapListPage(Math.max(1, mapListPage - 1))} style={{
                width: 24, height: 24, borderRadius: 100, cursor: 'pointer',
                backgroundImage: 'linear-gradient(90deg, rgba(116,116,128,0.08), rgba(116,116,128,0.08)), linear-gradient(90deg, #fff, #fff)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: mapListPage <= 1 ? 0.3 : 1, fontSize: 12, color: GRAY,
              }}>‹</span>
              {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => (
                <span key={i} onClick={() => setMapListPage(i + 1)} style={{
                  width: 24, height: 24, borderRadius: 100, cursor: 'pointer',
                  background: mapListPage === i + 1 ? '#7C3AED' : undefined,
                  backgroundImage: mapListPage === i + 1 ? 'none' : 'linear-gradient(90deg, rgba(116,116,128,0.08), rgba(116,116,128,0.08)), linear-gradient(90deg, #fff, #fff)',
                  color: mapListPage === i + 1 ? 'white' : '#8E8E93',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 500, fontFamily: font,
                }}>{i + 1}</span>
              ))}
              <span onClick={() => setMapListPage(Math.min(totalPages, mapListPage + 1))} style={{
                width: 24, height: 24, borderRadius: 100, cursor: 'pointer',
                backgroundImage: 'linear-gradient(90deg, rgba(116,116,128,0.08), rgba(116,116,128,0.08)), linear-gradient(90deg, #fff, #fff)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: mapListPage >= totalPages ? 0.3 : 1, fontSize: 12, color: GRAY,
              }}>›</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =============================================
   5. PATIENT TABLE
   ============================================= */
const VITAL_DETAIL_ROWS = [
  { key: 'bp', label: 'ความดันโลหิต', unit: 'mmHg', icon: vsBp },
  { key: 'hr', label: 'ชีพจร', unit: 'bpm', icon: vsIconEcg },
  { key: 'temp', label: 'อุณหภูมิ', unit: '°C', icon: vsTemp },
  { key: 'spo2', label: 'ออกซิเจน', unit: '%', icon: vsSparkles },
  { key: 'glucose', label: 'น้ำตาล', unit: 'mg/dL', icon: vsDrop },
  { key: 'height', label: 'ส่วนสูง', unit: 'cm', icon: null },
  { key: 'weight', label: 'น้ำหนัก', unit: 'kg', icon: null },
  { key: 'waist', label: 'รอบเอว', unit: 'inch', icon: null },
];

function PatientTable() {
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState(null);
  const { openPatient } = useContext(PatientContext);
  const patients = VITALSIGN_PATIENTS
    .map((vs, i) => {
      const p = getPatient(vs.hn);
      const severityLabel = vs.severity >= 80 ? 'วิกฤต' : vs.severity >= 50 ? 'เฝ้าระวัง' : 'ปกติ';
      const severityColor = vs.severity >= 80 ? '#FF383C' : vs.severity >= 50 ? '#E8802A' : '#34C759';
      return {
        id: i + 1,
        name: p ? p.name : vs.hn,
        hn: vs.hn,
        hospital: vs.hospital,
        bp: vs.bp,
        hr: vs.hr,
        temp: vs.temp,
        spo2: vs.spo2,
        glucose: vs.glucose,
        severity: vs.severity,
        severityLabel,
        severityColor,
        age: p ? p.age : 45,
        gender: p ? p.gender : 'ชาย',
      };
    })
    .sort((a, b) => b.severity - a.severity);

  const perPage = 10;
  const totalPages = Math.ceil(patients.length / perPage);
  const rows = patients.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="hover-card anim-slide-up delay-7" style={{ ...glassCard, display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header - Figma style */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 40, height: 40, borderRadius: 14, background: '#6658E1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <img src={vsIconPerson} alt="" style={{ width: 20, height: 20 }} />
        </div>
        <div>
          <p style={{ fontSize: 16, fontWeight: 700, color: BLACK, margin: 0, fontFamily: font }}>รายชื่อผู้ป่วยวัด Vitalsign</p>
          <p style={{ fontSize: 12, color: GRAY, margin: 0, lineHeight: '16px', fontFamily: font }}>รายการผู้ป่วยที่มีการบันทึกสัญญาณชีพ เพื่อใช้ติดตามและประเมินสุขภาพ</p>
        </div>
      </div>

      {/* Patient rows - card style per Figma */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {rows.map((r) => {
          const sb = getStatusBadge(r.severity);
          const isExpanded = expandedId === r.id;
          const vitalValues = {
            bp: r.bp, hr: r.hr, temp: r.temp, spo2: r.spo2, glucose: r.glucose,
            height: '170', weight: '62', waist: '28',
          };
          return (
            <div key={r.id} style={{
              backgroundImage: isExpanded ? 'linear-gradient(90deg, rgba(139,92,246,0.1), rgba(139,92,246,0.1)), linear-gradient(90deg, #fff, #fff)' : 'none',
              borderRadius: 16, overflow: 'hidden',
              border: isExpanded ? '2px solid rgba(139,92,246,0.1)' : '2px solid transparent',
              transition: 'all 0.25s ease',
            }}>
              {/* Header row - clickable */}
              <div onClick={() => openPatient({ name: r.name, age: r.age, gender: r.gender, hn: r.hn, phone: '', group: '', disease: '', team: '', adl: 0, visits: 0, lastVisit: '', outcome: '' })} style={{
                display: 'flex', alignItems: 'center', gap: 16, height: 56,
                background: 'white', borderRadius: 16, padding: '8px 16px 8px 8px', cursor: 'pointer',
                border: '1px solid rgba(116,116,128,0.08)',
                transition: 'border 0.15s ease, box-shadow 0.15s ease',
              }}
                onMouseEnter={e => { if (!isExpanded) { e.currentTarget.style.border = '1px solid ' + sb.color; e.currentTarget.style.boxShadow = '0 0 0 2px ' + sb.color + '20'; } }}
                onMouseLeave={e => { if (!isExpanded) { e.currentTarget.style.border = '1px solid rgba(116,116,128,0.08)'; e.currentTarget.style.boxShadow = 'none'; } }}
              >
                <div style={{ position: 'relative', width: 40, height: 40, flexShrink: 0 }}>
                  <img src={getAvatar(r.age, r.gender)} alt="" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
                  <div style={{
                    position: 'absolute', bottom: 0, right: 0, width: 16, height: 16, borderRadius: '50%',
                    border: '0.5px solid white', backgroundImage: sb.dotBg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <img src={vsIconEcg} alt="" style={{ width: 8, height: 9, filter: 'brightness(10)' }} />
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 2 }}>
                  <p style={{ fontSize: 12, color: 'black', margin: 0, fontFamily: font, lineHeight: '16px' }}>{r.name}</p>
                  <div style={{ display: 'flex', gap: 10, fontSize: 10, color: '#8E8E93', fontFamily: font, lineHeight: '16px' }}>
                    <span>อายุ: {r.age} ปี</span>
                    <span>เพศ: {r.gender}</span>
                    <span style={{ opacity: 0.8 }}>อัพเดทล่าสุด: 25 มี.ค. 69</span>
                  </div>
                </div>
                <span style={{
                  padding: '4px 10px', borderRadius: 100, flexShrink: 0,
                  fontSize: 10, fontFamily: font, color: sb.color, lineHeight: '16px', backgroundImage: sb.bg,
                }}>{sb.label}</span>
                {/* Chevron */}
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={{ flexShrink: 0, transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                  <path d="M1 1L5 5L9 1" stroke="#8E8E93" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              {/* Expanded detail */}
              {isExpanded && (
                <div style={{ padding: 8, display: 'flex', flexDirection: 'column', gap: 10, animation: 'slideUp 0.25s ease' }}>
                  {/* Source: Atlas HomeCare */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <img src={logoHomeCare} alt="" style={{ width: 20, height: 20, borderRadius: '50%', objectFit: 'cover' }} />
                    <span style={{ fontSize: 10, fontWeight: 500, color: 'black', fontFamily: font }}>Atlas HomeCare</span>
                  </div>
                  <div style={{ background: 'white', borderRadius: 16, padding: 16, display: 'flex', flexDirection: 'column', gap: 0 }}>
                    <div style={{ display: 'flex', gap: 8, fontSize: 10, fontFamily: font, marginBottom: 8 }}>
                      <span style={{ fontWeight: 500, color: 'black' }}>Visit: 0001</span>
                      <span style={{ color: '#8E8E93' }}>(25 มี.ค. 69)</span>
                    </div>
                    {VITAL_DETAIL_ROWS.map((vr, vi) => {
                      const val = vitalValues[vr.key] || '-';
                      const isAbnormal = r.severity >= 50 && vi < 5;
                      const valColor = isAbnormal ? '#FF383C' : '#34C759';
                      const dotBg = isAbnormal ? 'linear-gradient(135deg, #E8432A, #D0381A)' : 'linear-gradient(135deg, #34C759, #15B03C)';
                      return (
                        <div key={vr.key}>
                          {vi > 0 && <div style={{ height: 1, background: 'rgba(0,0,0,0.04)', margin: '6px 0' }} />}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ width: 16, height: 16, borderRadius: '50%', border: '0.5px solid white', backgroundImage: dotBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {vr.icon && <img src={vr.icon} alt="" style={{ width: 8, height: 8, filter: 'brightness(10)' }} />}
                                {!vr.icon && <svg width="6" height="6" viewBox="0 0 12 12" fill="white"><circle cx="6" cy="6" r="5" /></svg>}
                              </div>
                              <span style={{ fontSize: 10, color: 'black', fontFamily: font, width: 80 }}>{vr.label}</span>
                              <span style={{ fontSize: 10, fontWeight: 500, color: valColor, fontFamily: font }}>{val} {vr.unit}</span>
                            </div>
                            <span style={{ fontSize: 8, color: '#8E8E93', fontFamily: font }}>อัพเดทล่าสุด: 10:00 น.</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Source: My Atlas */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <img src={logoMyAtlas} alt="" style={{ width: 20, height: 20, borderRadius: '50%', objectFit: 'cover' }} />
                    <span style={{ fontSize: 10, fontWeight: 500, color: 'black', fontFamily: font }}>My Atlas</span>
                  </div>
                  <div style={{ background: 'white', borderRadius: 16, padding: 16, display: 'flex', flexDirection: 'column', gap: 0 }}>
                    <div style={{ display: 'flex', gap: 8, fontSize: 10, fontFamily: font, marginBottom: 8 }}>
                      <span style={{ fontWeight: 500, color: 'black' }}>Visit: 0001</span>
                      <span style={{ color: '#8E8E93' }}>(25 มี.ค. 69)</span>
                    </div>
                    {VITAL_DETAIL_ROWS.map((vr, vi) => {
                      const val = vitalValues[vr.key] || '-';
                      const valColor = '#34C759';
                      const dotBg = 'linear-gradient(135deg, #34C759, #15B03C)';
                      return (
                        <div key={vr.key}>
                          {vi > 0 && <div style={{ height: 1, background: 'rgba(0,0,0,0.04)', margin: '6px 0' }} />}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ width: 16, height: 16, borderRadius: '50%', border: '0.5px solid white', backgroundImage: dotBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {vr.icon && <img src={vr.icon} alt="" style={{ width: 8, height: 8, filter: 'brightness(10)' }} />}
                                {!vr.icon && <svg width="6" height="6" viewBox="0 0 12 12" fill="white"><circle cx="6" cy="6" r="5" /></svg>}
                              </div>
                              <span style={{ fontSize: 10, color: 'black', fontFamily: font, width: 80 }}>{vr.label}</span>
                              <span style={{ fontSize: 10, fontWeight: 500, color: valColor, fontFamily: font }}>{val} {vr.unit}</span>
                            </div>
                            <span style={{ fontSize: 8, color: '#8E8E93', fontFamily: font }}>อัพเดทล่าสุด: 10:00 น.</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Pagination - Figma style */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px' }}>
        <span style={{ fontSize: 12, color: GRAY, fontFamily: font, lineHeight: '16px' }}>แสดง {(page - 1) * perPage + 1}-{Math.min(page * perPage, patients.length)} จาก {patients.length} รายการ</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span onClick={() => setPage(p => Math.max(1, p - 1))} style={{
            width: 24, height: 24, borderRadius: 100, cursor: 'pointer',
            backgroundImage: 'linear-gradient(90deg, rgba(116,116,128,0.08), rgba(116,116,128,0.08)), linear-gradient(90deg, #fff, #fff)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: page <= 1 ? 0.3 : 1, fontSize: 12, color: GRAY,
          }}>‹</span>
          {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => (
            <span key={i} onClick={() => setPage(i + 1)} style={{
              width: 24, height: 24, borderRadius: 100, cursor: 'pointer',
              background: page === i + 1 ? '#7C3AED' : undefined,
              backgroundImage: page === i + 1 ? 'none' : 'linear-gradient(90deg, rgba(116,116,128,0.08), rgba(116,116,128,0.08)), linear-gradient(90deg, #fff, #fff)',
              color: page === i + 1 ? 'white' : '#8E8E93',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 500, fontFamily: font,
            }}>{i + 1}</span>
          ))}
          <span onClick={() => setPage(p => Math.min(totalPages, p + 1))} style={{
            width: 24, height: 24, borderRadius: 100, cursor: 'pointer',
            backgroundImage: 'linear-gradient(90deg, rgba(116,116,128,0.08), rgba(116,116,128,0.08)), linear-gradient(90deg, #fff, #fff)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: page >= totalPages ? 0.3 : 1, fontSize: 12, color: GRAY,
          }}>›</span>
        </div>
      </div>
    </div>
  );
}

/* === MAIN === */
export default function VitalSign() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, fontFamily: font }}>
      <Hero />
      <StatCards />
      <ChartsRow />
      <MapSection />
      <PatientTable />
    </div>
  );
}
