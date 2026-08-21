import { useState, useEffect, useRef, useContext } from 'react';
import { createPortal } from 'react-dom';
import { PatientContext } from '../App';
import CountUp from '../components/CountUp';
import { HOME_VISITS, getPatient, getAvatar } from '../data/patients';
import { pageWindow } from '../utils/pagination';
import PlanVisitPage from './PlanVisitPage';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

import imgGrid from '../assets/images/grid-bg.png';
import imgAvatarBlur from '../assets/images/avatar-blur.png';
import imgHero3d from '../assets/images/homevisit-3d.png';
import vsMap from '../assets/icons/vs-map.svg';

/* -- shared styles -- */
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

const VS_MONTHS = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];

/* ══════════════════════════════════════════
   STATUS CONFIG
   ══════════════════════════════════════════ */
const STATUS_CFG = {
  'เยี่ยมแล้ว':  { color: '#34C759', bg: 'linear-gradient(90deg, rgba(52,199,89,0.15), rgba(52,199,89,0.15)), linear-gradient(90deg, #fff, #fff)', mapColor: '#34C759', mapStatus: 'visited' },
  'ยังไม่เยี่ยม': { color: '#FF383C', bg: 'linear-gradient(90deg, rgba(255,56,60,0.15), rgba(255,56,60,0.15)), linear-gradient(90deg, #fff, #fff)', mapColor: '#FF383C', mapStatus: 'notVisited' },
  'รอเยี่ยม':    { color: '#FF383C', bg: 'linear-gradient(90deg, rgba(255,56,60,0.15), rgba(255,56,60,0.15)), linear-gradient(90deg, #fff, #fff)', mapColor: '#FF383C', mapStatus: 'notVisited' },
  'รอรับงาน':   { color: '#E8802A', bg: 'linear-gradient(90deg, rgba(232,128,42,0.15), rgba(232,128,42,0.15)), linear-gradient(90deg, #fff, #fff)', mapColor: '#E8802A', mapStatus: 'pending' },
  'เลื่อนนัด':   { color: '#E8802A', bg: 'linear-gradient(90deg, rgba(232,128,42,0.15), rgba(232,128,42,0.15)), linear-gradient(90deg, #fff, #fff)', mapColor: '#E8802A', mapStatus: 'pending' },
};

const getStatusCfg = (s) => STATUS_CFG[s] || STATUS_CFG['รอรับงาน'];

/* normalise status for display */
const displayStatus = (s) => {
  if (s === 'รอเยี่ยม') return 'ยังไม่เยี่ยม';
  if (s === 'เลื่อนนัด') return 'รอรับงาน';
  return s;
};

/* ══════════════════════════════════════════
   VISIT DATA
   ══════════════════════════════════════════ */
const VISITS = (HOME_VISITS || []).map(v => {
  try {
    const p = getPatient(v.hn);
    if (!p) return null;
    return {
      hn: v.hn,
      name: p.name,
      age: p.age,
      gender: p.gender,
      group: p.group,
      address: p.address,
      hospital: 'รพ.สต.',
      visitDate: v.visitDate,
      status: v.status,
      team: p.team,
    };
  } catch { return null; }
}).filter(Boolean);

/* ประเภทผู้ป่วยเยี่ยมบ้าน — ใช้ทั้งตัวกรองใน Hero, แผนที่ และหน้าทะเบียน */
const PATIENT_GROUPS = [
  { label: 'ทุกประเภท', value: 'all', color: '#6658E1' },
  { label: 'NCD', value: 'NCD', color: '#0088FF', desc: 'โรคเรื้อรัง' },
  { label: 'LTC', value: 'LTC', color: '#34C759', desc: 'ผู้สูงอายุติดเตียง' },
  { label: 'Palliative', value: 'Palliative', color: '#8B5CF6', desc: 'ประคับประคอง' },
  { label: 'Intermediate', value: 'Intermediate', color: '#E8802A', desc: 'ระยะกลาง' },
  { label: 'หญิงตั้งครรภ์', value: 'หญิงตั้งครรภ์', color: '#FF375F', desc: 'ฝากครรภ์' },
];
const groupMeta = (g) => PATIENT_GROUPS.find(x => x.value === g) || { label: g, color: GRAY };

/* ══════════════════════════════════════════
   MAP POINTS - patient locations across Thailand
   ══════════════════════════════════════════ */
const MAP_POINTS = [
  // เยี่ยมแล้ว (green)
  { lng: 100.5018, lat: 13.7563, status: 'visited', name: 'นายสมชาย ทดสอบ', info: 'กลุ่ม NCD', age: 72, gender: 'ชาย' },
  { lng: 98.9853, lat: 18.7883, status: 'visited', name: 'นางบุญมา ทดสอบ4', info: 'กลุ่ม NCD', age: 58, gender: 'หญิง' },
  { lng: 100.4733, lat: 7.0086, status: 'visited', name: 'นางจันทร์เพ็ญ ทดสอบ7', info: 'กลุ่ม หญิงตั้งครรภ์', age: 32, gender: 'หญิง' },
  { lng: 102.8360, lat: 16.4322, status: 'visited', name: 'นายสมศักดิ์ ทดสอบ8', info: 'กลุ่ม NCD', age: 68, gender: 'ชาย' },
  { lng: 100.9925, lat: 12.9236, status: 'visited', name: 'นายอำนวย ทดสอบ10', info: 'กลุ่ม Intermediate', age: 62, gender: 'ชาย' },
  { lng: 99.0087, lat: 18.5590, status: 'visited', name: 'นางปราณี ทดสอบ9', info: 'กลุ่ม Palliative', age: 75, gender: 'หญิง' },
  { lng: 100.5166, lat: 13.6513, status: 'visited', name: 'นางสุนีย์ ทดสอบ6', info: 'กลุ่ม LTC', age: 70, gender: 'หญิง' },
  { lng: 104.1348, lat: 17.1533, status: 'visited', name: 'นางสมศรี ทดสอบ2', info: 'กลุ่ม LTC', age: 65, gender: 'หญิง' },
  // ยังไม่เยี่ยม (red)
  { lng: 100.5382, lat: 13.7248, status: 'notVisited', name: 'นายประยูร ทดสอบ3', info: 'กลุ่ม Palliative', age: 80, gender: 'ชาย' },
  { lng: 100.4394, lat: 13.7200, status: 'notVisited', name: 'นายวิชัย ทดสอบ5', info: 'กลุ่ม Intermediate', age: 45, gender: 'ชาย' },
  { lng: 102.1044, lat: 14.9666, status: 'notVisited', name: 'นางสาวพิมพ์ ทดสอบ26', info: 'กลุ่ม NCD', age: 55, gender: 'หญิง' },
  { lng: 99.8266, lat: 19.9105, status: 'notVisited', name: 'นายทองดี ทดสอบ24', info: 'กลุ่ม NCD', age: 78, gender: 'ชาย' },
  { lng: 99.0956, lat: 9.1382, status: 'notVisited', name: 'นางแสงจันทร์ ทดสอบ25', info: 'กลุ่ม LTC', age: 67, gender: 'หญิง' },
  { lng: 100.0800, lat: 9.9608, status: 'notVisited', name: 'นายบุญเลิศ ทดสอบ27', info: 'กลุ่ม NCD', age: 63, gender: 'ชาย' },
  { lng: 103.6500, lat: 16.4400, status: 'notVisited', name: 'นางสุภา ทดสอบ28', info: 'กลุ่ม Intermediate', age: 60, gender: 'หญิง' },
  { lng: 104.8000, lat: 15.8600, status: 'notVisited', name: 'นายเสน่ห์ ทดสอบ29', info: 'กลุ่ม NCD', age: 71, gender: 'ชาย' },
  // รอรับงาน (orange)
  { lng: 99.0100, lat: 14.0200, status: 'pending', name: 'นายณรงค์ ทดสอบ30', info: 'กลุ่ม NCD', age: 50, gender: 'ชาย' },
  { lng: 100.9900, lat: 14.3500, status: 'pending', name: 'นางมาลี ทดสอบ31', info: 'กลุ่ม LTC', age: 66, gender: 'หญิง' },
  { lng: 102.0000, lat: 15.2300, status: 'pending', name: 'นายสุรชัย ทดสอบ32', info: 'กลุ่ม Palliative', age: 73, gender: 'ชาย' },
  { lng: 103.5000, lat: 15.2500, status: 'pending', name: 'นางวิไล ทดสอบ33', info: 'กลุ่ม NCD', age: 48, gender: 'หญิง' },
  { lng: 100.5000, lat: 13.5000, status: 'pending', name: 'นายธนวัฒน์ ทดสอบ34', info: 'กลุ่ม Intermediate', age: 56, gender: 'ชาย' },
  { lng: 98.4000, lat: 8.0000, status: 'pending', name: 'นางอรุณ ทดสอบ35', info: 'กลุ่ม NCD', age: 64, gender: 'หญิง' },
  { lng: 101.1500, lat: 12.6800, status: 'pending', name: 'นายประเสริฐ ทดสอบ36', info: 'กลุ่ม LTC', age: 77, gender: 'ชาย' },
];

const MAP_STATUS_META = {
  visited:    { color: '#34C759', label: 'เยี่ยมแล้ว', icon: '\u2713' },
  notVisited: { color: '#FF383C', label: 'ยังไม่เยี่ยม', icon: '\u23F0' },
  pending:    { color: '#E8802A', label: 'รอรับงาน', icon: '\u23F3' },
};


/* ══════════════════════════════════════════
   ทะเบียนผู้ป่วยเยี่ยมบ้าน — รวมเคสที่มีข้อมูลผู้ป่วยเต็ม (VISITS)
   กับผู้ป่วยที่ปักหมุดบนแผนที่ (เติม HN/ทีม/นัดหมายแบบ deterministic)
   ══════════════════════════════════════════ */
const MAP_TO_STATUS = { visited: 'เยี่ยมแล้ว', notVisited: 'ยังไม่เยี่ยม', pending: 'รอรับงาน' };
const TEAMS = ['ทีม A', 'ทีม B', 'ทีม C'];
const REGISTRY = (() => {
  const rows = VISITS.map(v => ({ ...v, source: 'visit' }));
  const seen = new Set(rows.map(r => r.name));
  MAP_POINTS.forEach((pt, i) => {
    if (seen.has(pt.name)) return;
    seen.add(pt.name);
    rows.push({
      hn: `HN0013${String(10 + i).padStart(2, '0')}`,
      name: pt.name,
      age: pt.age,
      gender: pt.gender,
      group: (pt.info || '').replace('กลุ่ม ', '') || 'NCD',
      address: 'ตำแหน่งบ้านผู้ป่วยบนแผนที่',
      hospital: 'รพ.สต.',
      visitDate: `2026-04-${String(2 + (i % 24)).padStart(2, '0')}`,
      status: MAP_TO_STATUS[pt.status] || 'รอรับงาน',
      team: TEAMS[i % 3],
      source: 'map',
    });
  });
  return rows;
})();

/* แท็บใน hero: ภาพรวม / ทะเบียนรายชื่อผู้ป่วย */
const HERO_TABS = [
  { label: 'ภาพรวมการเยี่ยมบ้าน' },
  { label: 'ทะเบียนรายชื่อผู้ป่วย' },
];

/* ═══════════════════════════════════════════
   1. HERO SECTION
   ═══════════════════════════════════════════ */
function Hero({ onPlanVisit, groupFilter, onGroupChange, tab, onTabChange }) {
  const [monthOpen, setMonthOpen] = useState(false);
  const [groupOpen, setGroupOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const gm = groupMeta(groupFilter);

  return (
    <div className="anim-slide-up" style={{
      borderRadius: 24, position: 'relative', overflow: 'visible',
      boxShadow: '0 4px 4px rgba(0,0,0,0.1)', minHeight: 150,
      fontFamily: font, zIndex: (monthOpen || groupOpen) ? 50 : 10,
    }}>
      {/* Background layer */}
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
          <img src={imgHero3d} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
      </div>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 8, padding: 16 }}>
        <span style={{ fontSize: 16, fontWeight: 500, color: 'black', fontFamily: font }}>ติดตาม</span>
        <div style={{ display: 'flex', gap: 10, alignItems: 'baseline' }}>
          <span style={{
            fontSize: 24, fontWeight: 700, fontFamily: font,
            background: 'linear-gradient(270deg, #0088FF 0%, #6658E1 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>Home Visit</span>
          <span style={{ fontSize: 16, fontWeight: 500, color: 'black', fontFamily: font }}>(เยี่ยมบ้าน)</span>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* แท็บหน้า — สไตล์เดียวกับแท็บหน้าอื่น: ปุ่มกว้างเท่ากัน + ไฮไลต์ gradient เลื่อนตาม */}
          <div style={{
            position: 'relative', display: 'inline-flex', padding: 4, borderRadius: 100, flexShrink: 0,
            background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.7)',
            boxShadow: 'inset 0 1px 3px rgba(30,27,57,0.05)',
          }}>
            <span aria-hidden style={{
              position: 'absolute', top: 4, left: 4 + tab * 158, width: 158, height: 28,
              borderRadius: 100, background: 'linear-gradient(160deg, #3FA9FF 0%, #0088FF 55%, #0070E0 100%)',
              boxShadow: '0 4px 12px rgba(0,136,255,0.35), inset 0 1px 0 rgba(255,255,255,0.3)',
              transition: 'left 0.3s cubic-bezier(0.34, 1.25, 0.64, 1)',
            }} />
            {HERO_TABS.map((t, i) => (
              <button key={t.label} onClick={() => onTabChange(i)} style={{
                position: 'relative', zIndex: 1, width: 158, height: 28,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 100, border: 'none', cursor: 'pointer', background: 'transparent',
                fontSize: 12, fontFamily: font, whiteSpace: 'nowrap',
                color: tab === i ? '#fff' : '#615E83',
                fontWeight: tab === i ? 600 : 500,
                transition: 'color 0.25s ease',
              }}>{t.label}</button>
            ))}
          </div>

          {/* Month dropdown */}
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

          {/* ตัวกรองประเภทผู้ป่วย — มีผลทั้งการ์ดสรุป แผนที่ รายชื่อ และหน้าทะเบียน */}
          <div style={{ position: 'relative', zIndex: groupOpen ? 100 : 1 }}>
            <div onClick={() => setGroupOpen(!groupOpen)} style={{
              height: 36, display: 'flex', alignItems: 'center', gap: 8,
              padding: '4px 14px', borderRadius: 100, cursor: 'pointer',
              backdropFilter: 'blur(2px)', background: 'rgba(255,255,255,0.8)',
              border: '1px solid white', boxSizing: 'border-box', whiteSpace: 'nowrap',
            }}>
              {/* จุดสีบอกกลุ่มที่เลือก — ตัวปุ่มคงพื้นขาวเสมอ */}
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: gm.color, flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: 'black', fontFamily: font, lineHeight: '20px' }}>
                {groupFilter === 'all' ? 'ประเภทผู้ป่วย' : gm.label}
              </span>
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={{ transform: groupOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                <path d="M1 1L5 5L9 1" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            {groupOpen && (
              <>
                <div className="dropdown-backdrop" onClick={() => setGroupOpen(false)} />
                <div className="dropdown-menu" style={{ minWidth: 210, padding: 6 }}>
                  {PATIENT_GROUPS.map(g => {
                    const n = g.value === 'all' ? REGISTRY.length : REGISTRY.filter(r => r.group === g.value).length;
                    return (
                      <div key={g.value} className={`dropdown-item${groupFilter === g.value ? ' active' : ''}`}
                        onClick={() => { onGroupChange(g.value); setGroupOpen(false); }}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: g.color, flexShrink: 0 }} />
                        <span style={{ flex: 1 }}>{g.label}{g.desc && <span style={{ color: GRAY, fontSize: 10 }}> · {g.desc}</span>}</span>
                        <span style={{ fontSize: 10, color: GRAY, background: 'rgba(116,116,128,0.1)', borderRadius: 100, padding: '1px 7px' }}>{n}</span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Plan visit CTA */}
          <button className="hover-btn" onClick={onPlanVisit} style={{
            height: 36, display: 'flex', alignItems: 'center', gap: 8,
            padding: '0 16px', borderRadius: 100, border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg, #6658E1, #0088FF)', color: 'white',
            fontFamily: font, fontSize: 13, fontWeight: 600,
            boxShadow: '0 4px 14px rgba(102,88,225,0.35)', whiteSpace: 'nowrap',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="4.5" width="18" height="16" rx="3" stroke="white" strokeWidth="1.8"/>
              <path d="M3 9h18M8 2.5v4M16 2.5v4M12 12.5v4M10 14.5h4" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            วางแผนเยี่ยมบ้าน
          </button>
        </div>

      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   2. STAT CARDS
   ═══════════════════════════════════════════ */
function StatCards({ plannedVisits = [], groupFilter = 'all' }) {
  // Derive counts from the actual map data so cards stay in sync with the map legend.
  // Newly planned visits count toward the total and the "not visited yet" bucket.
  const pts = groupFilter === 'all' ? MAP_POINTS : MAP_POINTS.filter(p => (p.info || '').includes(groupFilter));
  const planned = groupFilter === 'all' ? plannedVisits : plannedVisits.filter(p => p.group === groupFilter);
  const total = pts.length + planned.length;
  const notVisited = pts.filter(p => p.status === 'notVisited').length + planned.length;
  const visited = pts.filter(p => p.status === 'visited').length;
  const pending = pts.filter(p => p.status === 'pending').length;
  const cards = [
    { label: 'เคสส่งเยี่ยมทั้งหมด', value: String(total), growth: '+4.1%', bg: 'linear-gradient(154deg, #19A589 0%, #0D7C66 100%)', shadow: '0 4px 14px rgba(59,130,246,0.3)', iconBg: 'rgba(255,255,255,0.2)',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 10.5L12 3l9 7.5V21a1 1 0 01-1 1h-4a1 1 0 01-1-1v-5a1 1 0 00-1-1h-4a1 1 0 00-1 1v5a1 1 0 01-1 1H4a1 1 0 01-1-1V10.5z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><circle cx="18" cy="6" r="4" fill="white" fillOpacity="0.3"/></svg> },
    { label: 'ยังไม่ไปเยี่ยม', value: String(notVisited), growth: '+6.3%', bg: 'linear-gradient(154deg, #E8432A 0%, #D0381A 100%)', shadow: '0 4px 14px rgba(25,165,137,0.3)', iconBg: 'rgba(255,255,255,0.2)',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="white" strokeWidth="1.5"/><path d="M12 7v5l3 3" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg> },
    { label: 'เยี่ยมแล้ว', value: String(visited), growth: '+7.8%', bg: 'linear-gradient(154deg, #34D65D 0%, #21AB44 100%)', shadow: '0 4px 14px rgba(52,199,89,0.3)', iconBg: 'rgba(255,255,255,0.2)',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="white" strokeWidth="1.5"/><path d="M8 12.5l2.5 2.5L16 9.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> },
    { label: 'รอรับงาน', value: String(pending), growth: '+7.8%', bg: 'linear-gradient(154deg, #E8802A 0%, #D06A1A 100%)', shadow: '0 4px 14px rgba(232,128,42,0.3)', iconBg: 'rgba(255,255,255,0.2)',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="9" cy="7" r="3.5" stroke="white" strokeWidth="1.5"/><circle cx="16" cy="7" r="3.5" stroke="white" strokeWidth="1.5"/><path d="M2 19c0-3.3 2.7-6 6-6h2c3.3 0 6 2.7 6 6" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg> },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginTop: 16 }}>
      {cards.map((c, i) => (
        <div key={c.label} className={`hover-stat anim-slide-up delay-${i + 1}`} style={{
          background: c.bg, borderRadius: 24, padding: 16, color: 'white',
          overflow: 'hidden', position: 'relative', boxShadow: c.shadow,
          border: '1px solid rgba(255,255,255,0.7)',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          fontFamily: font,
        }}>
          {/* Top: icon + growth */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ width: 40, height: 40, borderRadius: 14, background: c.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {c.icon}
            </div>
            <div style={{ background: 'rgba(255,255,255,0.18)', borderRadius: 999, padding: '4px 10px', display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.9)', fontFamily: font }}>
                &uarr; {c.growth}
              </span>
            </div>
          </div>
          {/* Bottom: label + value */}
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.6)', fontFamily: font }}>{c.label}</div>
            <CountUp end={c.value} delay={i * 100} style={{ fontSize: 26, fontWeight: 700, color: 'white', fontFamily: font, display: 'block' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════
   3. MAP SECTION
   ═══════════════════════════════════════════ */
function MapSection({ plannedVisits = [], groupFilter = 'all' }) {
  const { openPatient } = useContext(PatientContext);
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const [activeFilter, setActiveFilter] = useState(0);
  const [activeMapStyle, setActiveMapStyle] = useState(0);
  const [listPage, setListPage] = useState(1);

  const filters = [
    { label: 'ทั้งหมด', value: 'all' },
    { label: 'รอรับงาน', value: 'pending' },
    { label: 'ยังไม่เยี่ยม', value: 'notVisited' },
    { label: 'เยี่ยมแล้ว', value: 'visited' },
  ];

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

  const getFilteredPoints = () => {
    const f = filters[activeFilter].value;
    const byGroup = groupFilter === 'all' ? MAP_POINTS : MAP_POINTS.filter(pt => (pt.info || '').includes(groupFilter));
    return f === 'all' ? byGroup : byGroup.filter(pt => pt.status === f);
  };

  /* Build GeoJSON source */

  const markersRef = useRef([]);

  const PIN_COLORS = {
    visited: { color: '#34C759', darker: '#15B03C' },
    notVisited: { color: '#FF383C', darker: '#D0381A' },
    pending: { color: '#E8802A', darker: '#D06A1A' },
  };

  const addPinMarkers = (map, points) => {
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    points.forEach((pt, i) => {
      const meta = MAP_STATUS_META[pt.status] || MAP_STATUS_META.pending;
      const pc = PIN_COLORS[pt.status] || PIN_COLORS.pending;
      const el = document.createElement('div');
      el.style.width = '30px';
      el.style.height = '40px';
      el.style.cursor = 'pointer';
      el.style.transition = 'transform 0.2s cubic-bezier(.4,0,.2,1)';
      el.style.transformOrigin = 'bottom center';
      el.style.animation = 'pinDrop 0.4s cubic-bezier(.34,1.56,.64,1) both';
      el.style.animationDelay = (i * 0.03) + 's';
      el.innerHTML = '<svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg">' +
        '<path d="M15 0C6.7 0 0 6.7 0 15c0 11.2 15 25 15 25s15-13.8 15-25C30 6.7 23.3 0 15 0z" fill="' + pc.color + '" style="filter:drop-shadow(0 2px 3px rgba(0,0,0,0.3))"/>' +
        '<circle cx="15" cy="14" r="6" fill="white" opacity="0.9"/>' +
        '<circle cx="15" cy="14" r="3.5" fill="' + pc.darker + '" opacity="0.8"/>' +
      '</svg>';
      const popupHtml =
          '<div style="font-family:Sarabun,sans-serif;padding:10px;min-width:220px">' +
            '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">' +
              '<div style="display:flex;align-items:center;gap:6px">' +
                '<span style="width:8px;height:8px;border-radius:50%;background:' + meta.color + ';display:inline-block;box-shadow:0 0 6px ' + meta.color + '60"></span>' +
                '<span style="font-size:10px;font-weight:500;color:' + meta.color + '">' + meta.label + '</span>' +
              '</div>' +
              '<span style="font-size:9px;color:#8E8E93">' + (pt.info || '') + '</span>' +
            '</div>' +
            '<div style="display:flex;align-items:center;gap:10px">' +
              '<div style="position:relative;width:40px;height:40px;flex-shrink:0">' +
                '<img src="' + getAvatar(pt.age || 45, pt.gender || 'ชาย') + '" style="width:40px;height:40px;border-radius:50%;object-fit:cover;border:2px solid ' + meta.color + '30" />' +
                '<div style="position:absolute;bottom:-1px;right:-1px;width:14px;height:14px;border-radius:50%;background:' + meta.color + ';border:1.5px solid white;display:flex;align-items:center;justify-content:center">' +
                  '<span style="font-size:8px;color:white">' + meta.icon + '</span>' +
                '</div>' +
              '</div>' +
              '<div style="flex:1;min-width:0">' +
                '<div style="font-size:14px;font-weight:600;color:#1E1B39;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + pt.name + '</div>' +
                '<div style="font-size:10px;color:#8E8E93;margin-top:2px">ตำแหน่งบ้านผู้ป่วย</div>' +
              '</div>' +
            '</div>' +
          '</div>';

      /* popup แสดงตอน hover (ไม่ต้องคลิก) */
      let hoverPopup = null;
      el.onmouseenter = () => {
        el.style.transform = 'scale(1.25)';
        if (hoverPopup) hoverPopup.remove();
        hoverPopup = new maplibregl.Popup({ offset: [0, -42], closeButton: false, maxWidth: '280px' })
          .setLngLat([pt.lng, pt.lat]).setHTML(popupHtml).addTo(map);
      };
      el.onmouseleave = () => {
        el.style.transform = 'scale(1)';
        if (hoverPopup) { hoverPopup.remove(); hoverPopup = null; }
      };

      const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([pt.lng, pt.lat])
        .addTo(map);
      markersRef.current.push(marker);
    });
  };

  // Init map - simple direct approach
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;
    let cancelled = false; // guards against React StrictMode double-mount teardown race
    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
      center: [101.0, 13.0],
      zoom: 5.2,
      attributionControl: false,
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-left');
    mapRef.current = map;

    // หมุดทั้งหมดสร้างผ่าน addPinMarkers เพื่อให้ลบ/สร้างใหม่ตามตัวกรองได้
    map.on('load', function() {
      if (cancelled) return;
      addPinMarkers(map, getFilteredPoints());
    });
    return () => {
      cancelled = true;
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];
      try { map.remove(); } catch { /* ignore StrictMode teardown race */ }
      mapRef.current = null;
    };
  }, []);

  const handleMapStyleChange = (idx) => {
    setActiveMapStyle(idx);
    if (!mapRef.current) return;
    mapRef.current.setStyle(mapStyles[idx].url);
    mapRef.current.once('style.load', () => {
      addPinMarkers(mapRef.current, getFilteredPoints());
    });
  };

  /* หมุดบนแผนที่ตามตัวกรองสถานะ + ประเภทผู้ป่วย */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    addPinMarkers(map, getFilteredPoints());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilter, groupFilter]);

  /* Patient list data — newly planned visits appear first */
  const patientList = [...plannedVisits, ...VISITS].map(v => ({
    ...v,
    displayStatus: displayStatus(v.status),
    cfg: getStatusCfg(v.status),
  }));
  const byGroupList = groupFilter === 'all' ? patientList : patientList.filter(p => p.group === groupFilter);
  const filteredList = activeFilter === 0
    ? byGroupList
    : byGroupList.filter(p => {
        const fv = filters[activeFilter].value;
        if (fv === 'visited') return p.status === 'เยี่ยมแล้ว';
        if (fv === 'notVisited') return p.status === 'รอเยี่ยม' || p.status === 'ยังไม่เยี่ยม';
        if (fv === 'pending') return p.status === 'รอรับงาน' || p.status === 'เลื่อนนัด';
        return true;
      });

  const perPage = 10;
  const totalPatients = filteredList.length;
  const totalPages = Math.max(1, Math.ceil(totalPatients / perPage));
  const visiblePatients = filteredList.slice((listPage - 1) * perPage, listPage * perPage);

  /* Status badge dot SVG */
  const StatusDot = ({ status }) => {
    const ds = displayStatus(status);
    if (ds === 'เยี่ยมแล้ว') return (
      <div style={{ position: 'absolute', bottom: 0, right: 0, width: 16, height: 16, borderRadius: '50%', border: '0.5px solid white', overflow: 'hidden', background: 'linear-gradient(135deg, #34C759, #15B03C)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="8" height="8" viewBox="0 0 12 12" fill="none"><path d="M3 6.5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </div>
    );
    if (ds === 'ยังไม่เยี่ยม') return (
      <div style={{ position: 'absolute', bottom: 0, right: 0, width: 16, height: 16, borderRadius: '50%', border: '0.5px solid white', overflow: 'hidden', background: 'linear-gradient(135deg, #E8432A, #D0381A)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="8" height="8" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="4.5" stroke="white" strokeWidth="1"/><path d="M6 3.5v3" stroke="white" strokeWidth="1" strokeLinecap="round"/><path d="M4 8l4-4" stroke="white" strokeWidth="0.8" strokeLinecap="round"/></svg>
      </div>
    );
    return (
      <div style={{ position: 'absolute', bottom: 0, right: 0, width: 16, height: 16, borderRadius: '50%', border: '0.5px solid white', overflow: 'hidden', background: 'linear-gradient(135deg, #E8802A, #D06A1A)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="8" height="8" viewBox="0 0 12 12" fill="none"><circle cx="4.5" cy="4" r="2" stroke="white" strokeWidth="0.8"/><circle cx="7.5" cy="4" r="2" stroke="white" strokeWidth="0.8"/><path d="M1.5 10c0-1.7 1.3-3 3-3h3c1.7 0 3 1.3 3 3" stroke="white" strokeWidth="0.8" strokeLinecap="round"/></svg>
      </div>
    );
  };

  return (
    <div className="hover-card anim-slide-up delay-6" style={{ ...glassCard, marginTop: 16 }}>
      <style>{`
        @keyframes pinDrop {
          0% { transform: translateY(-30px) scale(0.3); opacity: 0; }
          60% { transform: translateY(2px) scale(1.05); opacity: 1; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
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
            <p style={{ fontSize: 12, color: GRAY, margin: 0, lineHeight: '16px', fontFamily: font }}>แสดงตำแหน่งและสถานะการเยี่ยมบ้านทั่วประเทศ</p>
          </div>
        </div>

        {/* Filter tabs */}
        <div style={{ background: 'rgba(255,255,255,0.5)', borderRadius: 100, padding: 4, display: 'flex', gap: 2 }}>
          {filters.map((f, i) => (
            <button key={f.label} className="hover-btn" onClick={() => setActiveFilter(i)} style={{
              padding: '6px 14px', borderRadius: 100, fontSize: 12, fontWeight: 500,
              border: 'none', cursor: 'pointer', fontFamily: font,
              background: activeFilter === i ? '#0088FF' : 'transparent',
              color: activeFilter === i ? 'white' : BLACK,
              transition: 'all 0.2s ease',
            }}>{f.label}</button>
          ))}
        </div>
      </div>

      {/* Grid 2 columns - fixed height */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, height: 700 }}>
        {/* Left: Map */}
        <div style={{ position: 'relative', background: 'white', borderRadius: 24, overflow: 'hidden' }}>
          <div ref={mapContainer} style={{ position: 'absolute', inset: 0 }} />

          {/* Map style selector */}
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
              backgroundImage: 'linear-gradient(90deg, rgba(52,199,89,0.2), rgba(52,199,89,0.2)), linear-gradient(90deg, #fff, #fff)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="20" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="9" cy="7" r="3.5" stroke="#34C759" strokeWidth="1.5"/>
                <circle cx="16" cy="7" r="3.5" stroke="#34C759" strokeWidth="1.5"/>
                <path d="M2 19c0-3.3 2.7-6 6-6h2c3.3 0 6 2.7 6 6" stroke="#34C759" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: BLACK, margin: 0, fontFamily: font }}>รายชื่อผู้ป่วย</p>
              <p style={{ fontSize: 12, color: GRAY, margin: 0, lineHeight: '16px', fontFamily: font }}>ข้อมูลผู้ป่วยเยี่ยมบ้าน</p>
            </div>
          </div>

          {/* Patient rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, overflowY: 'auto' }}>
            {visiblePatients.map((p, i) => {
              const borderColor = p.cfg.color;
              return (
                <div key={p.hn + i} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  background: 'white', border: '1.5px solid transparent',
                  borderRadius: 16, padding: '8px 16px 8px 8px', cursor: 'pointer',
                  transition: 'border 0.15s ease, box-shadow 0.15s ease',
                  animation: 'countUp 0.3s ease both',
                  animationDelay: `${i * 0.03}s`,
                }}
                  onClick={() => openPatient({ name: p.name, age: p.age, gender: p.gender, hn: p.hn, phone: '', address: p.address || '', group: p.group, disease: '', team: p.team, adl: 0, visits: 0, lastVisit: p.visitDate, outcome: '' })}
                  onMouseEnter={e => { e.currentTarget.style.border = `1.5px solid ${borderColor}`; e.currentTarget.style.boxShadow = `0 0 0 2px ${borderColor}18`; }}
                  onMouseLeave={e => { e.currentTarget.style.border = '1.5px solid transparent'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  {/* Avatar + status badge */}
                  <div style={{ position: 'relative', width: 40, height: 40, flexShrink: 0 }}>
                    <img src={getAvatar(p.age, p.gender)} alt="" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
                    <StatusDot status={p.status} />
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 12, color: 'black', fontFamily: font, lineHeight: '16px', fontWeight: 500 }}>{p.name}</span>
                      <span style={{
                        fontSize: 10, color: GRAY, fontFamily: font, lineHeight: '16px',
                        background: 'rgba(116,116,128,0.08)', borderRadius: 100, padding: '1px 8px',
                      }}>{p.age} ปี</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                      <span style={{ fontSize: 10, color: GRAY, fontFamily: font }}>{p.group}</span>
                      <span style={{ fontSize: 10, color: '#C7C7CC' }}>|</span>
                      <span style={{ fontSize: 10, color: GRAY, fontFamily: font }}>{p.team}</span>
                      <span style={{ fontSize: 10, color: '#C7C7CC' }}>|</span>
                      <span style={{ fontSize: 10, color: GRAY, fontFamily: font }}>{p.visitDate}</span>
                    </div>
                  </div>

                  {/* Status badge */}
                  <span style={{
                    padding: '4px 10px', borderRadius: 100, flexShrink: 0,
                    fontSize: 10, fontWeight: 600, fontFamily: font, lineHeight: '16px',
                    color: p.cfg.color,
                    backgroundImage: p.cfg.bg,
                  }}>{p.displayStatus}</span>
                </div>
              );
            })}

            {visiblePatients.length === 0 && (
              <div style={{ textAlign: 'center', padding: 32, color: GRAY, fontFamily: font, fontSize: 13 }}>ไม่มีข้อมูล</div>
            )}
          </div>

          {/* Pagination */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px 0', flex: 'none' }}>
            <span style={{ fontSize: 12, color: GRAY, fontFamily: font, lineHeight: '16px' }}>
              แสดง {totalPatients === 0 ? 0 : (listPage - 1) * perPage + 1}-{Math.min(listPage * perPage, totalPatients)} จาก {totalPatients} รายการ
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span onClick={() => setListPage(Math.max(1, listPage - 1))} style={{
                width: 24, height: 24, borderRadius: 100, cursor: 'pointer',
                backgroundImage: 'linear-gradient(90deg, rgba(116,116,128,0.08), rgba(116,116,128,0.08)), linear-gradient(90deg, #fff, #fff)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: listPage <= 1 ? 0.3 : 1, fontSize: 12, color: GRAY,
              }}>&lsaquo;</span>
              {pageWindow(listPage, totalPages).map((n) => (
                <span key={n} onClick={() => setListPage(n)} style={{
                  width: 24, height: 24, borderRadius: 100, cursor: 'pointer',
                  background: listPage === n ? '#7C3AED' : undefined,
                  backgroundImage: listPage === n ? 'none' : 'linear-gradient(90deg, rgba(116,116,128,0.08), rgba(116,116,128,0.08)), linear-gradient(90deg, #fff, #fff)',
                  color: listPage === n ? 'white' : '#8E8E93',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 500, fontFamily: font,
                }}>{n}</span>
              ))}
              <span onClick={() => setListPage(Math.min(totalPages, listPage + 1))} style={{
                width: 24, height: 24, borderRadius: 100, cursor: 'pointer',
                backgroundImage: 'linear-gradient(90deg, rgba(116,116,128,0.08), rgba(116,116,128,0.08)), linear-gradient(90deg, #fff, #fff)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: listPage >= totalPages ? 0.3 : 1, fontSize: 12, color: GRAY,
              }}>&rsaquo;</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   4. ทะเบียนรายชื่อผู้ป่วยเยี่ยมบ้าน (แท็บที่ 2)
   ═══════════════════════════════════════════ */
function RegistryTable({ plannedVisits = [], groupFilter = 'all', query = '', onQueryChange = () => {} }) {
  const { openPatient } = useContext(PatientContext);
  const q = query;
  const [statusF, setStatusF] = useState('all');
  /* หน้าปัจจุบันผูกกับเงื่อนไขกรอง — เปลี่ยนตัวกรอง/คำค้นแล้วกลับหน้าแรกเองโดยไม่ต้อง setState ใน effect */
  const filterKey = `${query}|${groupFilter}|${statusF}`;
  const [pageState, setPageState] = useState({ key: filterKey, page: 1 });
  const page = pageState.key === filterKey ? pageState.page : 1;
  const setPage = (n) => setPageState({ key: filterKey, page: n });
  const perPage = 12;

  const statusTabs = [
    { label: 'ทั้งหมด', value: 'all' },
    { label: 'รอรับงาน', value: 'รอรับงาน' },
    { label: 'ยังไม่เยี่ยม', value: 'ยังไม่เยี่ยม' },
    { label: 'เยี่ยมแล้ว', value: 'เยี่ยมแล้ว' },
  ];

  const rows = [...plannedVisits.map(v => ({ ...v, source: 'plan' })), ...REGISTRY]
    .map(r => ({ ...r, ds: displayStatus(r.status), cfg: getStatusCfg(r.status) }))
    .filter(r => groupFilter === 'all' || r.group === groupFilter)
    .filter(r => statusF === 'all' || r.ds === statusF)
    .filter(r => !q.trim() || `${r.name} ${r.hn} ${r.group} ${r.team}`.toLowerCase().includes(q.trim().toLowerCase()));

  const total = rows.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const cur = Math.min(page, totalPages);
  const visible = rows.slice((cur - 1) * perPage, cur * perPage);

  const th = { fontSize: 11, fontWeight: 600, color: GRAY, textAlign: 'left', padding: '0 12px 10px', whiteSpace: 'nowrap' };
  const td = { fontSize: 12, color: BLACK, padding: '10px 12px', verticalAlign: 'middle' };

  return (
    <div className="anim-slide-up" style={{ ...glassCard, marginTop: 16, display: 'flex', flexDirection: 'column' }}>
      {/* หัวข้อ */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 14, flexShrink: 0, background: 'rgba(102,88,225,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <rect x="4" y="3" width="16" height="18" rx="3" stroke="#6658E1" strokeWidth="1.6" />
            <path d="M8 8h8M8 12h8M8 16h5" stroke="#6658E1" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: BLACK, margin: 0 }}>ทะเบียนรายชื่อผู้ป่วยเยี่ยมบ้าน</p>
          <p style={{ fontSize: 12, color: GRAY, margin: 0, lineHeight: '16px' }}>
            รายชื่อผู้ป่วยในความดูแล {groupFilter === 'all' ? 'ทุกประเภท' : `กลุ่ม ${groupFilter}`} · ทั้งหมด {total} ราย
          </p>
        </div>
      </div>

      {/* แถบสถานะ (ซ้าย) + ค้นหา (ขวา) อยู่แถวเดียวกัน */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
        <div style={{
          display: 'inline-flex', gap: 4, padding: 4, borderRadius: 100, flexShrink: 0,
          background: 'rgba(116,116,128,0.08)', border: '1px solid rgba(255,255,255,0.5)',
        }}>
          {statusTabs.map(t => {
            const n = t.value === 'all'
              ? [...plannedVisits, ...REGISTRY].filter(r => groupFilter === 'all' || r.group === groupFilter).length
              : [...plannedVisits, ...REGISTRY].filter(r => (groupFilter === 'all' || r.group === groupFilter) && displayStatus(r.status) === t.value).length;
            const on = statusF === t.value;
            return (
              <button key={t.value} onClick={() => { setStatusF(t.value); setPage(1); }} style={{
                border: 'none', borderRadius: 100, padding: '5px 14px', cursor: 'pointer',
                fontSize: 12, fontFamily: font, fontWeight: on ? 600 : 400,
                background: on ? '#0088FF' : 'transparent', color: on ? 'white' : BLACK,
                display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
              }}>
                {t.label}
                <span style={{
                  fontSize: 10, borderRadius: 100, padding: '0 6px', fontWeight: 600,
                  background: on ? 'rgba(255,255,255,0.25)' : 'rgba(116,116,128,0.12)', color: on ? 'white' : GRAY,
                }}>{n}</span>
              </button>
            );
          })}
        </div>

        {/* ช่องค้นหา */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, height: 36, padding: '0 14px', marginLeft: 'auto',
          borderRadius: 100, background: 'white', border: '1px solid rgba(30,27,57,0.08)', minWidth: 220,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
            <circle cx="11" cy="11" r="7" stroke="#9291A5" strokeWidth="1.8" />
            <path d="M16.5 16.5L21 21" stroke="#9291A5" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <input value={query} onChange={e => onQueryChange(e.target.value)}
            placeholder="ค้นหาชื่อ / HN / ทีม"
            style={{ border: 'none', outline: 'none', background: 'transparent', fontFamily: font, fontSize: 12, color: BLACK, width: '100%' }} />
          {query && <span onClick={() => onQueryChange('')} style={{ cursor: 'pointer', color: '#9291A5', fontSize: 13 }}>✕</span>}
        </div>
      </div>

      {/* ตาราง */}
      <div className="no-scrollbar" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 720 }}>
          <thead>
            <tr>
              <th style={th}>ผู้ป่วย</th>
              <th style={th}>HN</th>
              <th style={th}>ประเภท</th>
              <th style={th}>ทีมผู้ดูแล</th>
              <th style={th}>วันที่นัดเยี่ยม</th>
              <th style={th}>สถานะ</th>
              <th style={{ ...th, textAlign: 'right' }}>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((r, i) => {
              const gm = groupMeta(r.group);
              return (
                <tr key={r.hn + i} className="hover-row" style={{ background: 'white', animation: 'countUp 0.25s ease both', animationDelay: `${i * 0.02}s` }}>
                  <td style={{ ...td, borderRadius: '12px 0 0 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <img src={getAvatar(r.age, r.gender)} alt="" style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{r.name}</div>
                        <div style={{ fontSize: 10, color: GRAY }}>{r.age} ปี · {r.gender}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ ...td, color: GRAY, fontSize: 11.5 }}>{r.hn}</td>
                  <td style={td}>
                    <span style={{
                      fontSize: 10.5, fontWeight: 600, padding: '3px 10px', borderRadius: 100, whiteSpace: 'nowrap',
                      background: `${gm.color}16`, color: gm.color,
                    }}>{r.group}</span>
                  </td>
                  <td style={{ ...td, color: GRAY, fontSize: 11.5 }}>{r.team}</td>
                  <td style={{ ...td, color: GRAY, fontSize: 11.5, whiteSpace: 'nowrap' }}>{r.visitDate}</td>
                  <td style={td}>
                    <span style={{
                      fontSize: 10, fontWeight: 600, padding: '4px 10px', borderRadius: 100, whiteSpace: 'nowrap',
                      color: r.cfg.color, backgroundImage: r.cfg.bg,
                    }}>{r.ds}</span>
                  </td>
                  <td style={{ ...td, textAlign: 'right', borderRadius: '0 12px 12px 0' }}>
                    <button className="hover-btn"
                      onClick={() => openPatient({ name: r.name, age: r.age, gender: r.gender, hn: r.hn, phone: '', address: r.address || '', group: r.group, disease: '', team: r.team, adl: 0, visits: 0, lastVisit: r.visitDate, outcome: '' })}
                      style={{
                        border: '1px solid rgba(0,136,255,0.3)', background: 'rgba(0,136,255,0.08)', color: '#0088FF',
                        borderRadius: 100, padding: '5px 12px', cursor: 'pointer', fontFamily: font, fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap',
                      }}>ดูข้อมูล</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {visible.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: GRAY, fontSize: 13 }}>ไม่พบผู้ป่วยตามเงื่อนไขที่เลือก</div>
        )}
      </div>

      {/* แบ่งหน้า */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 14, marginTop: 4, borderTop: '1px solid rgba(30,27,57,0.06)' }}>
        <span style={{ fontSize: 12, color: GRAY }}>
          แสดง {total === 0 ? 0 : (cur - 1) * perPage + 1}-{Math.min(cur * perPage, total)} จาก {total} รายการ
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span onClick={() => setPage(Math.max(1, cur - 1))} style={{
            width: 24, height: 24, borderRadius: 100, cursor: 'pointer', background: 'rgba(116,116,128,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: cur <= 1 ? 0.3 : 1, fontSize: 12, color: GRAY,
          }}>&lsaquo;</span>
          {pageWindow(cur, totalPages).map(n => (
            <span key={n} onClick={() => setPage(n)} style={{
              width: 24, height: 24, borderRadius: 100, cursor: 'pointer',
              background: cur === n ? '#7C3AED' : 'rgba(116,116,128,0.08)',
              color: cur === n ? 'white' : '#8E8E93',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 500,
            }}>{n}</span>
          ))}
          <span onClick={() => setPage(Math.min(totalPages, cur + 1))} style={{
            width: 24, height: 24, borderRadius: 100, cursor: 'pointer', background: 'rgba(116,116,128,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: cur >= totalPages ? 0.3 : 1, fontSize: 12, color: GRAY,
          }}>&rsaquo;</span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════ */
export default function HomeVisit() {
  const [plannedVisits, setPlannedVisits] = useState([]);
  const [toast, setToast] = useState(null);
  const [planning, setPlanning] = useState(false);
  const [tab, setTab] = useState(0);                 // 0 = ภาพรวม · 1 = ทะเบียนผู้ป่วย
  const [groupFilter, setGroupFilter] = useState('all'); // ตัวกรองประเภทผู้ป่วยจาก Hero
  const [query, setQuery] = useState('');                // คำค้นหาผู้ป่วย (แถบใน hero)

  const handlePlanVisit = (visit) => {
    setPlannedVisits(prev => [visit, ...prev]);
    setToast(`เพิ่มแผนเยี่ยมบ้าน "${visit.name}" วันที่ ${visit.visitDate} แล้ว`);
    setPlanning(false);
  };

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  if (planning) {
    return <PlanVisitPage onCancel={() => setPlanning(false)} onSave={handlePlanVisit} />;
  }

  return (
    <div style={{ fontFamily: font }}>
      <Hero onPlanVisit={() => setPlanning(true)} groupFilter={groupFilter} onGroupChange={setGroupFilter}
        tab={tab} onTabChange={setTab} />

      {tab === 0 ? (
        <>
          <StatCards plannedVisits={plannedVisits} groupFilter={groupFilter} />
          <MapSection plannedVisits={plannedVisits} groupFilter={groupFilter} />
        </>
      ) : (
        <RegistryTable plannedVisits={plannedVisits} groupFilter={groupFilter} query={query} onQueryChange={setQuery} />
      )}

      {/* Success toast — portaled to body so it sits at the true viewport bottom */}
      {toast && createPortal(
        <div style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          zIndex: 2000, display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 18px', borderRadius: 100, fontFamily: font, fontSize: 13, fontWeight: 500,
          background: 'linear-gradient(135deg, #34D65D, #21AB44)', color: 'white',
          boxShadow: '0 8px 28px rgba(33,171,68,0.4)',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="1.8"/>
            <path d="M7.5 12.5l3 3 6-6.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {toast}
        </div>,
        document.body
      )}
    </div>
  );
}
