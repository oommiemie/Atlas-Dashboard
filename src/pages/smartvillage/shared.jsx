/* ═══ Smart Village — shared UI primitives (ตามธีม Atlas Dashboard) ═══ */
import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

export const font = "'IBM Plex Sans Thai Looped', sans-serif";
export const BLACK = '#1E1B39';
export const GRAY = '#615E83';
export const GRAY2 = '#9291A5';
export const PURPLE = '#6658E1';
export const RED = '#FF383C';
export const GREEN = '#34C759';
export const ORANGE = '#E8802A';
export const BLUE = '#1398D8';

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

/* ── หัวข้อ page/section ── */
export function PageHead({ title, sub, right }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
      <div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: BLACK, fontFamily: font }}>{title}</h2>
        {sub && <div style={{ fontSize: 12.5, color: GRAY, fontFamily: font, marginTop: 4 }}>{sub}</div>}
      </div>
      {right && <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>{right}</div>}
    </div>
  );
}

export function SectionTitle({ icon, title, sub, right }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {icon && (
          <div style={{
            width: 34, height: 34, borderRadius: 12, flexShrink: 0,
            background: 'linear-gradient(180deg, #8B81F2, #6658E1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15,
            boxShadow: '0 4px 10px rgba(102,88,225,0.3)',
          }}>{icon}</div>
        )}
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: BLACK, fontFamily: font }}>{title}</div>
          {sub && <div style={{ fontSize: 11, color: GRAY2, fontFamily: font, marginTop: 1 }}>{sub}</div>}
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
export function EmptyState({ icon = '📭', title, sub, warn = false, cta }) {
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

/* ── Modal ── */
export function Modal({ title, sub, onClose, children, width = 520 }) {
  return (
    <div className="anim-backdrop" onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 2000,
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
          }}>✕</button>
        </div>
        {children}
      </div>
    </div>
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

export function SVMap({ points = [], center, zoom = 5.1, height = 300, picker = false, onPick, pin, radius = 24 }) {
  const el = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const pickMarkerRef = useRef(null);
  const pointsKey = JSON.stringify(points.map(p => [p.lat, p.lng, p.color]));
  const pinKey = pin ? `${pin.lat},${pin.lng}` : '';

  const renderMarkers = (map) => {
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    points.forEach(pt => {
      const elm = document.createElement('div');
      const pulse = pt.status === 'alert';
      elm.style.cssText = `width:${pt.big ? 22 : 16}px;height:${pt.big ? 22 : 16}px;border-radius:50%;background:${pt.color};border:2.5px solid white;box-shadow:0 2px 8px ${pt.color}66;cursor:pointer;${pulse ? 'animation: svPulseRed 1.4s ease-out infinite;' : ''}`;
      const popup = new maplibregl.Popup({ offset: 14, closeButton: false, maxWidth: '230px' })
        .setHTML(`<div style="font-family:${font};padding:4px 2px;">
          <div style="font-weight:700;font-size:12.5px;color:${BLACK};margin-bottom:4px;">${pt.name}</div>
          ${pt.subHtml || ''}
        </div>`);
      const mk = new maplibregl.Marker({ element: elm, anchor: 'center' }).setLngLat([pt.lng, pt.lat]).setPopup(popup).addTo(map);
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
  /* eslint-enable react-hooks/exhaustive-deps */

  return <div ref={el} style={{ width: '100%', height, borderRadius: radius, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.7)', boxShadow: '0 2px 8px rgba(13,10,44,0.06)' }} />;
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
      {ok ? '✓ คัดลอกแล้ว' : `⧉ ${label}`}
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
