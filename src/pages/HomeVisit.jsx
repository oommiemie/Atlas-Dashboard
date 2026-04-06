import { useState, useEffect, useRef, useContext } from 'react';
import { PatientContext } from '../App';
import { HOME_VISITS, getPatient, getAvatar } from '../data/patients';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

import imgGrid from '../assets/images/grid-bg.png';
import imgAvatarBlur from '../assets/images/avatar-blur.png';
import imgHero3d from '../assets/images/homevisit-3d.png';
import iconRefresh from '../assets/icons/refresh.svg';
import vsMap from '../assets/icons/vs-map.svg';

/* -- shared styles -- */
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

/* ══════════════════════════════════════════
   MAP POINTS - patient locations across Thailand
   ══════════════════════════════════════════ */
const MAP_POINTS = [
  // เยี่ยมแล้ว (green)
  { lng: 100.5018, lat: 13.7563, status: 'visited', name: 'นายสมชาย แก้วมณี', info: 'กลุ่ม NCD', age: 72, gender: 'ชาย' },
  { lng: 98.9853, lat: 18.7883, status: 'visited', name: 'นางบุญมา สุขใจ', info: 'กลุ่ม NCD', age: 58, gender: 'หญิง' },
  { lng: 100.4733, lat: 7.0086, status: 'visited', name: 'นางจันทร์เพ็ญ ดวงแก้ว', info: 'กลุ่ม หญิงตั้งครรภ์', age: 32, gender: 'หญิง' },
  { lng: 102.8360, lat: 16.4322, status: 'visited', name: 'นายสมศักดิ์ แสงจันทร์', info: 'กลุ่ม NCD', age: 68, gender: 'ชาย' },
  { lng: 100.9925, lat: 12.9236, status: 'visited', name: 'นายอำนวย ชัยชนะ', info: 'กลุ่ม Intermediate', age: 62, gender: 'ชาย' },
  { lng: 99.0087, lat: 18.5590, status: 'visited', name: 'นางปราณี วงค์เทพ', info: 'กลุ่ม Palliative', age: 75, gender: 'หญิง' },
  { lng: 100.5166, lat: 13.6513, status: 'visited', name: 'นางสุนีย์ รักษาศรี', info: 'กลุ่ม LTC', age: 70, gender: 'หญิง' },
  { lng: 104.1348, lat: 17.1533, status: 'visited', name: 'นางสมศรี ดีใจ', info: 'กลุ่ม LTC', age: 65, gender: 'หญิง' },
  // ยังไม่เยี่ยม (red)
  { lng: 100.5382, lat: 13.7248, status: 'notVisited', name: 'นายประยูร ทองคำ', info: 'กลุ่ม Palliative', age: 80, gender: 'ชาย' },
  { lng: 100.4394, lat: 13.7200, status: 'notVisited', name: 'นายวิชัย พงษ์สุวรรณ', info: 'กลุ่ม Intermediate', age: 45, gender: 'ชาย' },
  { lng: 102.1044, lat: 14.9666, status: 'notVisited', name: 'นางสาวพิมพ์ วรรณวงศ์', info: 'กลุ่ม NCD', age: 55, gender: 'หญิง' },
  { lng: 99.8266, lat: 19.9105, status: 'notVisited', name: 'นายทองดี ศรีสุข', info: 'กลุ่ม NCD', age: 78, gender: 'ชาย' },
  { lng: 99.0956, lat: 9.1382, status: 'notVisited', name: 'นางแสงจันทร์ ใจดี', info: 'กลุ่ม LTC', age: 67, gender: 'หญิง' },
  { lng: 100.0800, lat: 9.9608, status: 'notVisited', name: 'นายบุญเลิศ มาลัย', info: 'กลุ่ม NCD', age: 63, gender: 'ชาย' },
  { lng: 103.6500, lat: 16.4400, status: 'notVisited', name: 'นางสุภา เจริญสุข', info: 'กลุ่ม Intermediate', age: 60, gender: 'หญิง' },
  { lng: 104.8000, lat: 15.8600, status: 'notVisited', name: 'นายเสน่ห์ พงศ์พิศ', info: 'กลุ่ม NCD', age: 71, gender: 'ชาย' },
  // รอรับงาน (orange)
  { lng: 99.0100, lat: 14.0200, status: 'pending', name: 'นายณรงค์ พรมแดน', info: 'กลุ่ม NCD', age: 50, gender: 'ชาย' },
  { lng: 100.9900, lat: 14.3500, status: 'pending', name: 'นางมาลี ดอกไม้', info: 'กลุ่ม LTC', age: 66, gender: 'หญิง' },
  { lng: 102.0000, lat: 15.2300, status: 'pending', name: 'นายสุรชัย วงศ์สวัสดิ์', info: 'กลุ่ม Palliative', age: 73, gender: 'ชาย' },
  { lng: 103.5000, lat: 15.2500, status: 'pending', name: 'นางวิไล แสงทอง', info: 'กลุ่ม NCD', age: 48, gender: 'หญิง' },
  { lng: 100.5000, lat: 13.5000, status: 'pending', name: 'นายธนวัฒน์ กิตติ', info: 'กลุ่ม Intermediate', age: 56, gender: 'ชาย' },
  { lng: 98.4000, lat: 8.0000, status: 'pending', name: 'นางอรุณ สุนทร', info: 'กลุ่ม NCD', age: 64, gender: 'หญิง' },
  { lng: 101.1500, lat: 12.6800, status: 'pending', name: 'นายประเสริฐ ดีมาก', info: 'กลุ่ม LTC', age: 77, gender: 'ชาย' },
];

const MAP_STATUS_META = {
  visited:    { color: '#34C759', label: 'เยี่ยมแล้ว', icon: '\u2713' },
  notVisited: { color: '#FF383C', label: 'ยังไม่เยี่ยม', icon: '\u23F0' },
  pending:    { color: '#E8802A', label: 'รอรับงาน', icon: '\u23F3' },
};

/* ═══════════════════════════════════════════
   1. HERO SECTION
   ═══════════════════════════════════════════ */
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
      fontFamily: font, zIndex: monthOpen ? 50 : 10,
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
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
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
              <img src={iconRefresh} alt="" style={{ width: 16, height: 19 }} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   2. STAT CARDS
   ═══════════════════════════════════════════ */
function StatCards() {
  const cards = [
    { label: 'เคสส่งเยี่ยมทั้งหมด', value: '200', growth: '+4.1%', bg: 'linear-gradient(154deg, #19A589 0%, #0D7C66 100%)', shadow: '0 4px 14px rgba(59,130,246,0.3)', iconBg: 'rgba(255,255,255,0.2)',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 10.5L12 3l9 7.5V21a1 1 0 01-1 1h-4a1 1 0 01-1-1v-5a1 1 0 00-1-1h-4a1 1 0 00-1 1v5a1 1 0 01-1 1H4a1 1 0 01-1-1V10.5z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><circle cx="18" cy="6" r="4" fill="white" fillOpacity="0.3"/></svg> },
    { label: 'ยังไม่ไปเยี่ยม', value: '190', growth: '+6.3%', bg: 'linear-gradient(154deg, #E8432A 0%, #D0381A 100%)', shadow: '0 4px 14px rgba(25,165,137,0.3)', iconBg: 'rgba(255,255,255,0.2)',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="white" strokeWidth="1.5"/><path d="M12 7v5l3 3" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg> },
    { label: 'เยี่ยมแล้ว', value: '50', growth: '+7.8%', bg: 'linear-gradient(154deg, #34D65D 0%, #21AB44 100%)', shadow: '0 4px 14px rgba(52,199,89,0.3)', iconBg: 'rgba(255,255,255,0.2)',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="white" strokeWidth="1.5"/><path d="M8 12.5l2.5 2.5L16 9.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> },
    { label: 'รอรับงาน', value: '25', growth: '+7.8%', bg: 'linear-gradient(154deg, #E8802A 0%, #D06A1A 100%)', shadow: '0 4px 14px rgba(232,128,42,0.3)', iconBg: 'rgba(255,255,255,0.2)',
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
            <div style={{ fontSize: 26, fontWeight: 700, color: 'white', fontFamily: font }}>{c.value}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════
   3. MAP SECTION
   ═══════════════════════════════════════════ */
function MapSection() {
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
    return f === 'all' ? MAP_POINTS : MAP_POINTS.filter(pt => pt.status === f);
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
      el.onmouseenter = () => { el.style.transform = 'scale(1.25)'; };
      el.onmouseleave = () => { el.style.transform = 'scale(1)'; };

      const popup = new maplibregl.Popup({ offset: 20, closeButton: false, maxWidth: '280px' })
        .setHTML(
          '<div style="font-family:IBM Plex Sans Thai Looped,sans-serif;padding:10px;min-width:220px">' +
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
          '</div>'
        );

      const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([pt.lng, pt.lat])
        .setPopup(popup)
        .addTo(map);
      markersRef.current.push(marker);
    });
  };

  // Init map - simple direct approach
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
      center: [101.0, 13.0],
      zoom: 5.2,
      attributionControl: false,
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-left');
    mapRef.current = map;

    // Add markers directly after map is ready
    map.on('load', function() {
      MAP_POINTS.forEach(function(pt, i) {
        var pc = PIN_COLORS[pt.status] || PIN_COLORS.pending;
        var meta = MAP_STATUS_META[pt.status] || MAP_STATUS_META.pending;
        var el = document.createElement('div');
        el.style.cssText = 'width:22px;height:32px;cursor:pointer;';
        el.innerHTML = '<svg width="22" height="32" viewBox="0 0 22 32" style="filter:drop-shadow(0 2px 3px rgba(0,0,0,0.3));transition:transform 0.15s ease;transform-origin:bottom center;">' +
          '<path d="M11 0C4.9 0 0 4.9 0 11c0 8.3 11 21 11 21s11-12.7 11-21C22 4.9 17.1 0 11 0z" fill="' + pc.color + '"/>' +
          '<circle cx="11" cy="10" r="4" fill="white" opacity="0.85"/>' +
        '</svg>';
        var svgEl = el.querySelector('svg');
        var avatarUrl = getAvatar(pt.age || 45, pt.gender || 'ชาย');
        var popupHtml = '<div style="font-family:IBM Plex Sans Thai Looped,sans-serif;padding:10px;min-width:200px">' +
          '<div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">' +
            '<span style="width:8px;height:8px;border-radius:50%;background:' + meta.color + ';box-shadow:0 0 6px ' + meta.color + '60"></span>' +
            '<span style="font-size:10px;font-weight:500;color:' + meta.color + '">' + meta.label + '</span>' +
            '<span style="font-size:9px;color:#8E8E93;margin-left:auto">' + (pt.info || '') + '</span>' +
          '</div>' +
          '<div style="display:flex;align-items:center;gap:10px">' +
            '<img src="' + avatarUrl + '" style="width:36px;height:36px;border-radius:50%;object-fit:cover;border:2px solid ' + meta.color + '30;flex-shrink:0" />' +
            '<div>' +
              '<div style="font-size:13px;font-weight:600;color:#1E1B39">' + pt.name + '</div>' +
              '<div style="font-size:10px;color:#8E8E93;margin-top:1px">ตำแหน่งบ้านผู้ป่วย</div>' +
            '</div>' +
          '</div>' +
        '</div>';

        var hoverPopup = null;
        el.onmouseenter = function() {
          svgEl.style.transform = 'scale(1.2)';
          if (hoverPopup) hoverPopup.remove();
          hoverPopup = new maplibregl.Popup({ offset: [0, -42], closeButton: false, maxWidth: '280px' })
            .setLngLat([pt.lng, pt.lat])
            .setHTML(popupHtml)
            .addTo(map);
        };
        el.onmouseleave = function() {
          svgEl.style.transform = 'scale(1)';
          if (hoverPopup) { hoverPopup.remove(); hoverPopup = null; }
        };

        new maplibregl.Marker({ element: el, anchor: 'bottom' })
          .setLngLat([pt.lng, pt.lat])
          .addTo(map);
      });
    });
    return () => { if (mapRef.current) { markersRef.current.forEach(m => m.remove()); mapRef.current.remove(); mapRef.current = null; } };
  }, []);

  const handleMapStyleChange = (idx) => {
    setActiveMapStyle(idx);
    if (!mapRef.current) return;
    mapRef.current.setStyle(mapStyles[idx].url);
    mapRef.current.once('style.load', () => {
      addPinMarkers(mapRef.current, getFilteredPoints());
    });
  };

  /* Patient list data */
  const patientList = VISITS.map(v => ({
    ...v,
    displayStatus: displayStatus(v.status),
    cfg: getStatusCfg(v.status),
  }));
  const filteredList = activeFilter === 0
    ? patientList
    : patientList.filter(p => {
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
              {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => (
                <span key={i} onClick={() => setListPage(i + 1)} style={{
                  width: 24, height: 24, borderRadius: 100, cursor: 'pointer',
                  background: listPage === i + 1 ? '#7C3AED' : undefined,
                  backgroundImage: listPage === i + 1 ? 'none' : 'linear-gradient(90deg, rgba(116,116,128,0.08), rgba(116,116,128,0.08)), linear-gradient(90deg, #fff, #fff)',
                  color: listPage === i + 1 ? 'white' : '#8E8E93',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 500, fontFamily: font,
                }}>{i + 1}</span>
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
   MAIN PAGE
   ═══════════════════════════════════════════ */
export default function HomeVisit() {
  return (
    <div style={{ fontFamily: font }}>
      <Hero />
      <StatCards />
      <MapSection />
    </div>
  );
}
