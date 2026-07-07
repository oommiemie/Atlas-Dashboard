/* ═══ Smart Village — shared UI primitives (ตามธีม Atlas Dashboard) ═══ */
import { useEffect, useRef, useState } from 'react';
import { IconInbox, IconX, IconCopy, IconCheck } from '@tabler/icons-react';
import { createPortal } from 'react-dom';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import imgAvatarBlur from '../../assets/images/avatar-blur.png';
import imgGrid from '../../assets/images/grid-bg.png';
import imgHero3d from '../../assets/images/homevisit-hero-3d.png';

export const font = "'IBM Plex Sans Thai Looped', sans-serif";
export const BLACK = '#1E1B39';
export const GRAY = '#615E83';
export const GRAY2 = '#9291A5';
export const PURPLE = '#6658E1';
export const RED = '#FF383C';
export const GREEN = '#34C759';
export const ORANGE = '#E8802A';
export const BLUE = '#0088FF';

export const card = {
  background: 'rgba(255,255,255,0.5)',
  backdropFilter: 'blur(5px)',
  border: '1px solid rgba(255,255,255,0.5)',
  borderRadius: 24,
  boxShadow: '0 2px 6px rgba(13,10,44,0.08)',
  padding: 16,
};

export const btnPrimary = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  background: 'linear-gradient(135deg, #4438AD 0%, #6658E1 50%, #8B5CF6 100%)',
  color: 'white', border: 'none', borderRadius: 100,
  padding: '9px 18px', fontSize: 13, fontWeight: 600, fontFamily: font,
  cursor: 'pointer', boxShadow: '0 4px 12px rgba(102,88,225,0.3)',
};

export const btnGhost = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  background: 'rgba(255,255,255,0.7)', color: PURPLE,
  border: '1px solid rgba(102,88,225,0.25)', borderRadius: 100,
  padding: '8px 16px', fontSize: 13, fontWeight: 600, fontFamily: font,
  cursor: 'pointer',
};

export const btnDanger = {
  ...btnGhost, color: RED, border: '1px solid rgba(255,56,60,0.3)',
};

/* ── หัวข้อ page — hero banner ตาม design language หน้าหลัก (blur circles + grid + gradient title)
      wording ตาม pattern หน้าอื่น: คำนำสั้น + ชื่อหน้า (วงเล็บไทย) + แถว control — ไม่มีประโยคอธิบาย ── */
/* tabs ของโมดูล — pill group ใน hero แบบเดียวกับหน้ารายงานเยี่ยมบ้าน */
export const SV_TABS = [
  ['sv-overview', 'ภาพรวม'],
  ['sv-villages', 'หมู่บ้าน'],
  ['sv-devices', 'อุปกรณ์'],
  ['sv-alerts', 'เหตุการณ์'],
];

export function PageHead({ title = 'Smart Village', thai, right, greeting = 'เฝ้าระวัง', image = imgHero3d, section, onGoSection, topRight }) {
  const now = new Date();
  const date = now.toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  return (
    <div style={{
      borderRadius: 24, position: 'relative', overflow: 'visible',
      boxShadow: '0 4px 4px rgba(0,0,0,0.1)', minHeight: 150, marginBottom: 16,
    }}>
      {/* Background layer — overflow hidden เฉพาะส่วนนี้ (pattern เดียวกับ hero หน้า Dashboard) */}
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
        {image && (
          <div style={{ position: 'absolute', right: 0, top: -14, width: 200, height: 200 }}>
            <img src={image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}
      </div>
      {/* action มุมขวาบน */}
      {topRight && (
        <div style={{ position: 'absolute', top: 14, right: 14, zIndex: 2, display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {topRight}
        </div>
      )}
      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 8, padding: 16 }}>
        <span style={{ fontSize: 16, fontWeight: 500, color: 'black', fontFamily: font }}>{greeting}</span>
        <div style={{ display: 'flex', gap: 10, alignItems: 'baseline', flexWrap: 'wrap' }}>
          <span style={{
            fontSize: 24, fontWeight: 700, fontFamily: font,
            background: 'linear-gradient(270deg, #0088FF 0%, #6658E1 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>{title}</span>
          {thai && <span style={{ fontSize: 16, fontWeight: 500, color: 'black', fontFamily: font }}>({thai})</span>}
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          {onGoSection && (
            <div style={{
              backdropFilter: 'blur(10px)', background: 'rgba(255,255,255,0.5)',
              borderRadius: 100, padding: 4, display: 'flex',
              boxShadow: '0 4px 4px rgba(0,0,0,0.05)',
            }}>
              {SV_TABS.map(([key, label]) => {
                const active = section === key;
                return (
                  <button key={key} className="hover-btn" onClick={() => onGoSection(key)} style={{
                    border: 'none', borderRadius: 100, cursor: 'pointer',
                    padding: '4px 10px', minWidth: active ? 80 : undefined,
                    fontSize: 12, fontFamily: font, whiteSpace: 'nowrap',
                    fontWeight: active ? 600 : 400, letterSpacing: -0.23,
                    background: active ? '#0088FF' : 'transparent',
                    color: active ? 'white' : 'black',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s ease',
                  }}>{label}</button>
                );
              })}
            </div>
          )}
          <div style={{
            backdropFilter: 'blur(2px)', background: 'rgba(255,255,255,0.8)',
            border: '1px solid white', borderRadius: 100, padding: '8px 14px', height: 36,
            display: 'flex', alignItems: 'center', boxSizing: 'border-box',
          }}>
            <span style={{ fontSize: 12, color: 'rgba(60,60,67,0.6)', fontFamily: font }}>{date}</span>
          </div>
          {right}
        </div>
      </div>
    </div>
  );
}

export function SectionTitle({ icon, title, sub, right }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {icon && (
          <div style={{
            width: 40, height: 40, borderRadius: 14, flexShrink: 0,
            background: 'linear-gradient(180deg, #8B81F2, #6658E1)', color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15,
            boxShadow: '0 4px 10px rgba(102,88,225,0.3)',
          }}>{icon}</div>
        )}
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: BLACK, fontFamily: font }}>{title}</div>
          {sub && <div style={{ fontSize: 12, color: GRAY, fontFamily: font, marginTop: 1 }}>{sub}</div>}
        </div>
      </div>
      {right}
    </div>
  );
}

/* ── ป้ายสถานะ (pill) ── */
export function Pill({ color, bg, children, dot = true, style }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: bg, color, borderRadius: 100, padding: '3px 10px',
      fontSize: 11.5, fontWeight: 600, fontFamily: font, whiteSpace: 'nowrap', ...style,
    }}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0 }} />}
      {children}
    </span>
  );
}

export const OnlinePill = ({ online }) => online
  ? <Pill color={GREEN} bg="rgba(52,199,89,0.12)">online</Pill>
  : <Pill color={GRAY2} bg="rgba(146,145,165,0.15)">offline</Pill>;

/* ── ช่องค้นหา ── */
export function SearchBox({ value, onChange, placeholder, width = 240 }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8, width,
      background: 'rgba(116,116,128,0.06)', border: '1px solid rgba(120,120,128,0.12)',
      borderRadius: 100, padding: '8px 14px',
    }}>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <circle cx="6" cy="6" r="4.5" stroke={GRAY2} strokeWidth="1.5" />
        <path d="M9.5 9.5 L13 13" stroke={GRAY2} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <input
        value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 12.5, fontFamily: font, color: BLACK, width: '100%' }}
      />
    </div>
  );
}

/* ── Empty state ── */
export function EmptyState({ icon = <IconInbox size={26} />, title, sub, warn = false, cta }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
      padding: '32px 16px', textAlign: 'center',
      background: warn ? 'rgba(232,128,42,0.06)' : 'rgba(116,116,128,0.04)',
      border: `1.5px dashed ${warn ? 'rgba(232,128,42,0.35)' : 'rgba(120,120,128,0.2)'}`,
      borderRadius: 18,
    }}>
      <div style={{ fontSize: 26 }}>{icon}</div>
      <div style={{ fontSize: 13.5, fontWeight: 700, color: warn ? ORANGE : BLACK, fontFamily: font }}>{title}</div>
      {sub && <div style={{ fontSize: 12, color: GRAY, fontFamily: font, maxWidth: 380, lineHeight: 1.6 }}>{sub}</div>}
      {cta}
    </div>
  );
}

/* ── Modal — portal ไป document.body กัน ancestor ที่มี backdrop-filter/transform
      (เช่น .main-inner) จับ position:fixed เป็น containing block แล้ว clip ทิ้ง ── */
export function Modal({ title, sub, onClose, children, width = 520, zIndex = 2000 }) {
  return createPortal(
    <div className="anim-backdrop" onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex,
      background: 'rgba(30,27,57,0.45)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <div className="anim-scale-in" onClick={e => e.stopPropagation()} style={{
        width, maxWidth: '94vw', maxHeight: '88vh', overflowY: 'auto',
        background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(30px)',
        borderRadius: 24, border: '1px solid rgba(255,255,255,0.8)',
        boxShadow: '0 24px 80px rgba(30,27,57,0.35)', padding: 24,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: BLACK, fontFamily: font }}>{title}</div>
            {sub && <div style={{ fontSize: 12, color: GRAY, fontFamily: font, marginTop: 3, lineHeight: 1.5 }}>{sub}</div>}
          </div>
          <button onClick={onClose} style={{
            width: 30, height: 30, borderRadius: '50%', border: 'none', cursor: 'pointer',
            background: 'rgba(116,116,128,0.1)', color: GRAY, fontSize: 14, fontFamily: font,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          }}><IconX size={14} style={{ flexShrink: 0 }} /></button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}

/* ── ฟอร์ม ── */
export function Field({ label, required, children, hint }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: BLACK, fontFamily: font }}>
        {label} {required && <span style={{ color: RED }}>*</span>}
      </label>
      {children}
      {hint && <div style={{ fontSize: 10.5, color: GRAY2, fontFamily: font }}>{hint}</div>}
    </div>
  );
}

export const inputStyle = {
  height: 40, borderRadius: 12, padding: '0 14px',
  border: '1.5px solid rgba(116,116,128,0.15)', background: 'white',
  fontSize: 13, fontFamily: font, color: BLACK, outline: 'none', width: '100%',
};

export function TextInput(props) {
  return <input {...props} style={{ ...inputStyle, ...props.style }} />;
}

export function Select({ options, value, onChange, placeholder }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} style={{ ...inputStyle, cursor: 'pointer', appearance: 'auto' }}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

/* ── ตาราง (div-based ให้คุมสไตล์ง่าย) ── */
export function THead({ cols, labels }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: cols, gap: 12, padding: '10px 14px',
      fontSize: 10.5, fontWeight: 700, color: GRAY2, fontFamily: font,
      textTransform: 'uppercase', letterSpacing: 0.6,
    }}>
      {labels.map((l, i) => <div key={i}>{l}</div>)}
    </div>
  );
}

export function TRow({ cols, onClick, children, style }) {
  return (
    <div
      className={onClick ? 'hover-row' : undefined}
      onClick={onClick}
      style={{
        display: 'grid', gridTemplateColumns: cols, gap: 12, alignItems: 'center',
        padding: '13px 14px', borderRadius: 14,
        borderTop: '1px solid rgba(0,0,0,0.04)',
        fontSize: 12.5, color: GRAY, fontFamily: font,
        cursor: onClick ? 'pointer' : 'default', ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ── ป้ายสถานะการเชื่อมต่อ realtime (SSE) ── */
export function LivePill({ dark = false }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: dark ? 'rgba(52,199,89,0.18)' : 'rgba(52,199,89,0.12)',
      border: '1px solid rgba(52,199,89,0.3)',
      color: dark ? '#7CF5A4' : '#1E9E4B', borderRadius: 100, padding: '4px 12px',
      fontSize: 11, fontWeight: 600, fontFamily: font,
    }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: GREEN, animation: 'svBlink 1.6s ease-in-out infinite' }} />
      เชื่อมต่อแล้ว · realtime
    </span>
  );
}

/* ── QR mock (deterministic จาก string) ── */
export function FakeQR({ code, size = 108 }) {
  const N = 21;
  let seed = 0;
  for (let i = 0; i < code.length; i++) seed = (seed * 31 + code.charCodeAt(i)) >>> 0;
  const rand = () => { seed = (seed * 1103515245 + 12345) >>> 0; return (seed >> 16) & 1; };
  const cells = [];
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const inFinder = (x < 7 && y < 7) || (x >= N - 7 && y < 7) || (x < 7 && y >= N - 7);
    if (!inFinder && rand()) cells.push([x, y]);
  }
  const finder = (fx, fy) => (
    <g key={`${fx}-${fy}`}>
      <rect x={fx} y={fy} width="7" height="7" fill={BLACK} />
      <rect x={fx + 1} y={fy + 1} width="5" height="5" fill="white" />
      <rect x={fx + 2} y={fy + 2} width="3" height="3" fill={BLACK} />
    </g>
  );
  return (
    <svg width={size} height={size} viewBox={`0 0 ${N} ${N}`} style={{ borderRadius: 8, background: 'white', border: '1px solid rgba(0,0,0,0.08)', padding: 4, boxSizing: 'content-box' }}>
      {cells.map(([x, y]) => <rect key={`${x}.${y}`} x={x} y={y} width="1" height="1" fill={BLACK} />)}
      {finder(0, 0)}{finder(N - 7, 0)}{finder(0, N - 7)}
    </svg>
  );
}

/* ── แผนที่ MapLibre (หมุดสถานะ + โหมดปักหมุดเลือกพิกัด) ── */
const CARTO_STYLE = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

/* หมุดป้อมยาม (จุดเริ่มนำทาง) — สี่เหลี่ยมม่วง + โล่ */
const GUARD_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a12 12 0 0 0 8.5 3a12 12 0 0 1 -8.5 15a12 12 0 0 1 -8.5 -15a12 12 0 0 0 8.5 -3"/></svg>';
function makeGuardMarker(map, gp) {
  const elm = document.createElement('div');
  elm.style.cssText = 'width:26px;height:26px;border-radius:9px;background:linear-gradient(180deg,#8B81F2,#6658E1);border:2.5px solid white;box-shadow:0 3px 10px rgba(102,88,225,0.5);display:flex;align-items:center;justify-content:center;cursor:pointer;';
  elm.innerHTML = GUARD_SVG;
  const popup = new maplibregl.Popup({ offset: 14, closeButton: false, maxWidth: '200px' })
    .setHTML(`<div style="font-family:${font};padding:4px 2px;"><div style="font-weight:700;font-size:12.5px;color:${BLACK};">ป้อมยาม</div><div style="font-size:11px;color:${GRAY};">จุดประจำการ รปภ. — จุดเริ่มเส้นทางนำทาง</div></div>`);
  const mk = new maplibregl.Marker({ element: elm, anchor: 'center' }).setLngLat([gp.lng, gp.lat]).setPopup(popup).addTo(map);
  elm.addEventListener('mouseenter', () => { if (!mk.getPopup().isOpen()) mk.togglePopup(); });
  elm.addEventListener('mouseleave', () => { if (mk.getPopup().isOpen()) mk.togglePopup(); });
  return mk;
}

/* pin บ้านที่มีเหตุล้ม — หมุดหยดน้ำแดง + วงกระเพื่อม ปักเหนือจุดบ้าน */
function makeAlertPinElement() {
  const wrap = document.createElement('div');
  wrap.style.cssText = 'position:relative;width:36px;height:46px;cursor:pointer;';
  wrap.innerHTML = `
    <div style="position:absolute;left:50%;bottom:1px;width:22px;height:22px;margin-left:-11px;margin-bottom:-11px;border-radius:50%;background:rgba(255,56,60,0.4);animation:svPulseRed 1.4s ease-out infinite;"></div>
    <div style="position:absolute;left:50%;bottom:8px;width:26px;height:26px;margin-left:-13px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);transform-origin:center;background:linear-gradient(135deg,#FF5A3C,#D0262B);border:2.5px solid white;box-shadow:0 4px 12px rgba(255,56,60,0.55);"></div>
    <div style="position:absolute;left:50%;bottom:19px;width:8px;height:8px;margin-left:-4px;border-radius:50%;background:white;"></div>`;
  return wrap;
}

/* เส้นทางนำทาง — วาด/อัปเดต layer บนแผนที่ + fitBounds */
function applyRoute(map, route) {
  const coords = route ? route.coords : [];
  const data = { type: 'Feature', geometry: { type: 'LineString', coordinates: coords } };
  const apply = () => {
    if (map.getSource('svroute')) {
      map.getSource('svroute').setData(data);
    } else {
      map.addSource('svroute', { type: 'geojson', data });
      map.addLayer({
        id: 'svroute-casing', type: 'line', source: 'svroute',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': 'white', 'line-width': 8, 'line-opacity': 0.9 },
      });
      map.addLayer({
        id: 'svroute-line', type: 'line', source: 'svroute',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': '#0088FF', 'line-width': 4.5, 'line-dasharray': [0.2, 1.6] },
      });
    }
    if (coords.length > 1) {
      const lngs = coords.map(c => c[0]), lats = coords.map(c => c[1]);
      map.fitBounds([[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]], {
        padding: 90, duration: 800, maxZoom: 17.2,
      });
    }
  };
  if (map.isStyleLoaded()) apply(); else map.once('load', apply);
}

export function SVMap({ points = [], center, zoom = 5.1, height = 300, picker = false, onPick, pin, radius = 24, guardPost, route }) {
  const el = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const pickMarkerRef = useRef(null);
  const guardMarkerRef = useRef(null);
  const pointsKey = JSON.stringify(points.map(p => [p.lat, p.lng, p.color]));
  const pinKey = pin ? `${pin.lat},${pin.lng}` : '';
  const routeKey = route ? `${route.coords.length},${route.coords[0]},${route.coords[route.coords.length - 1]}` : '';

  const renderMarkers = (map) => {
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    points.forEach(pt => {
      const alertPin = pt.status === 'alert';
      let elm;
      if (alertPin) {
        elm = makeAlertPinElement();
      } else {
        elm = document.createElement('div');
        elm.style.cssText = `width:${pt.big ? 22 : 16}px;height:${pt.big ? 22 : 16}px;border-radius:50%;background:${pt.color};border:2.5px solid white;box-shadow:0 2px 8px ${pt.color}66;cursor:pointer;`;
      }
      const popup = new maplibregl.Popup({ offset: alertPin ? 30 : 14, closeButton: false, maxWidth: '230px' })
        .setHTML(`<div style="font-family:${font};padding:4px 2px;">
          <div style="font-weight:700;font-size:12.5px;color:${BLACK};margin-bottom:4px;">${pt.name}</div>
          ${pt.subHtml || ''}
        </div>`);
      const mk = new maplibregl.Marker({ element: elm, anchor: alertPin ? 'bottom' : 'center' }).setLngLat([pt.lng, pt.lat]).setPopup(popup).addTo(map);
      elm.addEventListener('mouseenter', () => { if (!mk.getPopup().isOpen()) mk.togglePopup(); });
      elm.addEventListener('mouseleave', () => { if (mk.getPopup().isOpen()) mk.togglePopup(); });
      if (pt.onClick) elm.addEventListener('click', pt.onClick);
      markersRef.current.push(mk);
    });
    /* หมุดจากโหมด picker */
    if (pickMarkerRef.current) { pickMarkerRef.current.remove(); pickMarkerRef.current = null; }
    if (pin && pin.lat) {
      const elm = document.createElement('div');
      elm.style.cssText = 'width:22px;height:22px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:linear-gradient(135deg,#8B81F2,#6658E1);border:2.5px solid white;box-shadow:0 3px 10px rgba(102,88,225,0.5);';
      const mk = new maplibregl.Marker({ element: elm, anchor: 'center', draggable: !!picker })
        .setLngLat([pin.lng, pin.lat]).addTo(mapRef.current);
      if (picker) mk.on('dragend', () => {
        const p = mk.getLngLat();
        onPick && onPick({ lat: +p.lat.toFixed(6), lng: +p.lng.toFixed(6) });
      });
      pickMarkerRef.current = mk;
    }
  };

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    if (mapRef.current) return;
    const map = new maplibregl.Map({
      container: el.current, style: CARTO_STYLE,
      center: center || [100.8, 14.8], zoom, attributionControl: false,
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-left');
    if (picker) {
      map.on('click', (e) => onPick && onPick({ lat: +e.lngLat.lat.toFixed(6), lng: +e.lngLat.lng.toFixed(6) }));
    }
    mapRef.current = map;
    map.on('load', () => renderMarkers(map));
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  useEffect(() => { if (mapRef.current) renderMarkers(mapRef.current); }, [pointsKey, pinKey]);

  useEffect(() => {
    if (!mapRef.current || !guardPost) return;
    if (guardMarkerRef.current) guardMarkerRef.current.remove();
    guardMarkerRef.current = makeGuardMarker(mapRef.current, guardPost);
  }, [guardPost && `${guardPost.lat},${guardPost.lng}`]);

  useEffect(() => { if (mapRef.current) applyRoute(mapRef.current, route); }, [routeKey]);
  /* eslint-enable react-hooks/exhaustive-deps */

  return <div ref={el} style={{ width: '100%', height, borderRadius: radius, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.7)', boxShadow: '0 2px 8px rgba(13,10,44,0.06)' }} />;
}

/* ── แผนที่ 3D (fill-extrusion) — อาคารจริงจาก OpenStreetMap
   ดึง footprint อาคารรอบหมู่บ้านผ่าน Overpass API แล้ว extrude เป็น 3D — ตำแหน่งตรงถนนจริงเสมอ
   บ้านที่เฝ้าระวัง snap เข้า footprint ที่พิกัดตกอยู่ (หรือใกล้สุดใน 30m) → กล่องสีตามสถานะ กดได้
   พื้นที่ไม่มีข้อมูล OSM → fallback เป็น marker footprint ขนาดมาตรฐานเฉพาะบ้านที่เฝ้าระวัง ── */
const osmFpCache = new Map();

async function fetchOsmFootprints(lat, lng) {
  const key = `${lat.toFixed(4)},${lng.toFixed(4)}`;
  if (osmFpCache.has(key)) return osmFpCache.get(key);
  const q = `[out:json][timeout:25];(way["building"](around:450,${lat},${lng}););out geom;`;
  const promise = fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'data=' + encodeURIComponent(q),
  })
    .then(r => r.json())
    .then(json => (json.elements || [])
      .filter(e => e.type === 'way' && e.geometry && e.geometry.length >= 4)
      .map(e => {
        const ring = e.geometry.map(g => [g.lon, g.lat]);
        const [f0, l0] = [ring[0], ring[ring.length - 1]];
        if (f0[0] !== l0[0] || f0[1] !== l0[1]) ring.push(f0);
        const tags = e.tags || {};
        const h = parseFloat(tags.height) || (parseFloat(tags['building:levels']) || 0) * 3.2 || 0;
        return { ring, h };
      }))
    .catch(() => null);
  osmFpCache.set(key, promise);
  return promise;
}

/* point-in-polygon (ray casting) — pt = [lng, lat] */
function pointInRing(pt, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j];
    if ((yi > pt[1]) !== (yj > pt[1]) && pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

export function SVMap3D({ points = [], center, zoom = 16.1, height = 380, radius = 14, guardPost, route }) {
  const el = useRef(null);
  const mapRef = useRef(null);
  const pointsRef = useRef(points);
  pointsRef.current = points;
  const fpRef = useRef(null); // footprint OSM (null = ยังไม่มา / โหลดไม่สำเร็จ)
  const guardMarkerRef = useRef(null);
  const alertMarkersRef = useRef([]);
  const [source, setSource] = useState('loading'); // loading | osm | fallback
  const pointsKey = JSON.stringify(points.map(p => [p.lat, p.lng, p.color, p.status]));
  const routeKey = route ? `${route.coords.length},${route.coords[0]},${route.coords[route.coords.length - 1]}` : '';

  const buildData = () => {
    const pts = pointsRef.current;
    const clat = center[1];
    const mLat = 1 / 111320;
    const mLng = 1 / (111320 * Math.cos((clat * Math.PI) / 180));
    const rect = (lat, lng, w, d) => {
      const hw = (w / 2) * mLng, hd = (d / 2) * mLat;
      return [[
        [lng - hw, lat - hd], [lng + hw, lat - hd], [lng + hw, lat + hd], [lng - hw, lat + hd], [lng - hw, lat - hd],
      ]];
    };
    const feats = [];
    const matched = new Set(); // idx ของ point ที่ snap เข้า footprint แล้ว
    const fps = fpRef.current || [];
    /* ความสูง fallback แบบ deterministic ต่อหลัง — ไม่กระโดดตอน re-render */
    const hashH = (ring) => 3.8 + (Math.abs(Math.round(ring[0][0] * 1e6 + ring[0][1] * 1e6)) % 22) / 10;
    fps.forEach(fp => {
      /* หา point ที่ตกใน footprint นี้ หรือใกล้ centroid < 30m */
      let idx = -1;
      const cx = fp.ring.reduce((s, c) => s + c[0], 0) / fp.ring.length;
      const cy = fp.ring.reduce((s, c) => s + c[1], 0) / fp.ring.length;
      pts.forEach((p, i) => {
        if (matched.has(i) || idx !== -1) return;
        if (pointInRing([p.lng, p.lat], fp.ring)) { idx = i; return; }
        const dm = Math.hypot((p.lng - cx) / mLng, (p.lat - cy) / mLat);
        if (dm < 30) idx = i;
      });
      if (idx !== -1) matched.add(idx);
      const p = idx !== -1 ? pts[idx] : null;
      feats.push({
        type: 'Feature',
        properties: {
          h: fp.h || hashH(fp.ring),
          color: p ? p.color : '#DDDAEA',
          alert: p && p.status === 'alert' ? 1 : 0,
          idx,
        },
        geometry: { type: 'Polygon', coordinates: [fp.ring] },
      });
    });
    /* point ที่ไม่ตกใน footprint ไหนเลย → กล่องมาตรฐานที่พิกัดตรง ๆ */
    pts.forEach((p, i) => {
      if (matched.has(i)) return;
      feats.push({
        type: 'Feature',
        properties: { h: 6, color: p.color, alert: p.status === 'alert' ? 1 : 0, idx: i },
        geometry: { type: 'Polygon', coordinates: rect(p.lat, p.lng, 13, 11) },
      });
    });
    /* ป้อมยาม — กล่องม่วงเล็ก ใต้หมุดโล่ */
    if (guardPost) {
      feats.push({
        type: 'Feature',
        properties: { h: 3.4, color: PURPLE, alert: 0, idx: -1 },
        geometry: { type: 'Polygon', coordinates: rect(guardPost.lat, guardPost.lng, 5.5, 5.5) },
      });
    }
    return { type: 'FeatureCollection', features: feats };
  };

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    if (mapRef.current) return;
    let dead = false;
    const map = new maplibregl.Map({
      container: el.current, style: CARTO_STYLE,
      center, zoom, pitch: 58, bearing: -18, attributionControl: false, antialias: true,
    });
    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-left');
    /* ดึง footprint จริงจาก OSM — มาเมื่อไหร่ อัปเดต layer เมื่อนั้น */
    fetchOsmFootprints(center[1], center[0]).then(fps => {
      if (dead) return;
      if (fps && fps.length >= 5) { fpRef.current = fps; setSource('osm'); } else { setSource('fallback'); }
      const src = map.getSource('sv3d');
      if (src) src.setData(buildData());
    });
    map.on('load', () => {
      map.addSource('sv3d', { type: 'geojson', data: buildData() });
      map.addLayer({
        id: 'sv3d-bld', type: 'fill-extrusion', source: 'sv3d',
        paint: {
          'fill-extrusion-color': ['get', 'color'],
          'fill-extrusion-height': ['get', 'h'],
          'fill-extrusion-base': 0,
          'fill-extrusion-opacity': 0.95,
        },
      });
      /* กดบ้านที่เฝ้าระวัง → popup ชื่อ/สถานะ */
      map.on('click', 'sv3d-bld', (e) => {
        const f = e.features && e.features[0];
        if (!f || f.properties.idx === -1) return;
        const p = pointsRef.current[f.properties.idx];
        if (!p) return;
        new maplibregl.Popup({ offset: 10, closeButton: false, maxWidth: '230px' })
          .setLngLat([p.lng, p.lat])
          .setHTML(`<div style="font-family:${font};padding:4px 2px;">
            <div style="font-weight:700;font-size:12.5px;color:${BLACK};margin-bottom:4px;">${p.name}</div>
            ${p.subHtml || ''}
          </div>`)
          .addTo(map);
        if (p.onClick) p.onClick();
      });
      map.on('mousemove', 'sv3d-bld', (e) => {
        const f = e.features && e.features[0];
        map.getCanvas().style.cursor = f && f.properties.idx !== -1 ? 'pointer' : '';
      });
      map.on('mouseleave', 'sv3d-bld', () => { map.getCanvas().style.cursor = ''; });
    });
    /* เหตุ active กระพริบแดงเข้ม↔แดงสด */
    let flip = false;
    const flash = setInterval(() => {
      if (!map.getLayer('sv3d-bld')) return;
      flip = !flip;
      map.setPaintProperty('sv3d-bld', 'fill-extrusion-color',
        ['case', ['==', ['get', 'alert'], 1], flip ? '#FF383C' : '#8A1216', ['get', 'color']]);
    }, 550);
    mapRef.current = map;
    return () => { dead = true; clearInterval(flash); map.remove(); mapRef.current = null; };
  }, []);

  /* pin แดงปักบนบ้านที่มีเหตุล้ม */
  const renderAlertPins = (map) => {
    alertMarkersRef.current.forEach(m => m.remove());
    alertMarkersRef.current = [];
    pointsRef.current.forEach(p => {
      if (p.status !== 'alert') return;
      const elm = makeAlertPinElement();
      const popup = new maplibregl.Popup({ offset: 30, closeButton: false, maxWidth: '230px' })
        .setHTML(`<div style="font-family:${font};padding:4px 2px;">
          <div style="font-weight:700;font-size:12.5px;color:${BLACK};margin-bottom:4px;">${p.name}</div>
          ${p.subHtml || ''}
        </div>`);
      const mk = new maplibregl.Marker({ element: elm, anchor: 'bottom' }).setLngLat([p.lng, p.lat]).setPopup(popup).addTo(map);
      elm.addEventListener('mouseenter', () => { if (!mk.getPopup().isOpen()) mk.togglePopup(); });
      elm.addEventListener('mouseleave', () => { if (mk.getPopup().isOpen()) mk.togglePopup(); });
      if (p.onClick) elm.addEventListener('click', p.onClick);
      alertMarkersRef.current.push(mk);
    });
  };

  useEffect(() => {
    const map = mapRef.current;
    if (map && map.getSource('sv3d')) map.getSource('sv3d').setData(buildData());
    if (map) renderAlertPins(map);
  }, [pointsKey]);

  useEffect(() => {
    if (!mapRef.current || !guardPost) return;
    if (guardMarkerRef.current) guardMarkerRef.current.remove();
    guardMarkerRef.current = makeGuardMarker(mapRef.current, guardPost);
  }, [guardPost && `${guardPost.lat},${guardPost.lng}`]);

  useEffect(() => { if (mapRef.current) applyRoute(mapRef.current, route); }, [routeKey]);
  /* eslint-enable react-hooks/exhaustive-deps */

  const badge = source === 'loading' ? 'กำลังโหลดอาคาร…'
    : source === 'osm' ? 'อาคาร 3D จากข้อมูลจริง OpenStreetMap'
      : 'พื้นที่นี้ยังไม่มีข้อมูลอาคาร OSM — แสดงเฉพาะบ้านที่เฝ้าระวัง';
  return (
    <div style={{ position: 'relative', width: '100%', height, borderRadius: radius, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.7)', boxShadow: '0 2px 8px rgba(13,10,44,0.06)' }}>
      <div ref={el} style={{ width: '100%', height: '100%' }} />
      <div style={{
        position: 'absolute', right: 8, bottom: 8, background: 'rgba(30,27,57,0.72)', color: 'rgba(255,255,255,0.85)',
        fontSize: 10, fontFamily: font, borderRadius: 100, padding: '4px 10px', pointerEvents: 'none', backdropFilter: 'blur(4px)',
      }}>{badge}</div>
    </div>
  );
}

/* ── ปุ่ม copy ── */
export function CopyBtn({ text, label = 'คัดลอก' }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      className="hover-btn"
      onClick={() => { navigator.clipboard && navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 1500); }}
      style={{ ...btnGhost, padding: '5px 12px', fontSize: 11.5 }}
    >
      {ok ? <><IconCheck size={12} style={{ flexShrink: 0 }} /> คัดลอกแล้ว</> : <><IconCopy size={12} style={{ flexShrink: 0 }} /> {label}</>}
    </button>
  );
}

/* ── นาฬิกานับเวลาที่ผ่านไป (เหตุ active) ── */
export function ElapsedSince({ minAgo, style }) {
  const [sec, setSec] = useState(minAgo * 60);
  useEffect(() => {
    const t = setInterval(() => setSec(s => s + 1), 1000);
    return () => clearInterval(t);
  }, []);
  const mm = Math.floor(sec / 60), ss = sec % 60;
  return <span className="num" style={style}>ผ่านมา {mm}:{String(ss).padStart(2, '0')} นาที</span>;
}
