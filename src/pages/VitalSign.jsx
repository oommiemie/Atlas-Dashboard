import { useState, useEffect, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

/* ── Tooltip ── */
const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'rgba(255,255,255,0.95)', borderRadius: 12, padding: '8px 12px', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.04)' }}>
      <p style={{ fontSize: 10, fontWeight: 600, color: '#B2BEC3', marginBottom: 3 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ fontSize: 11, fontWeight: 700, color: p.color }}>{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

/* ═══════════════════════════════════════════
   1. HERO — lavender→blue gradient, 150px
   ═══════════════════════════════════════════ */
const VS_MONTHS = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];

function Hero() {
  const [now, setNow] = useState(new Date());
  const [monthOpen, setMonthOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);
  const date = now.toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  const time = now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div className="anim-up" style={{ borderRadius: 20, padding: '24px 28px', position: 'relative', overflow: 'visible', background: 'linear-gradient(135deg, #DAD5FF 0%, #C9E8FF 100%)', minHeight: 150, display: 'flex', alignItems: 'center' }}>
      <div style={{ position: 'absolute', top: -40, left: -20, width: 228, height: 228, borderRadius: '50%', background: 'rgba(139,92,246,0.12)', filter: 'blur(40px)', pointerEvents: 'none' }} />
      <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
        <p style={{ fontSize: 20, fontWeight: 500, color: '#000' }}>ติดตาม</p>
        <p style={{ fontSize: 24, fontWeight: 600, background: 'linear-gradient(90deg, #245ADE, #8B5CF6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', margin: '2px 0 6px' }}>Vital Sign</p>
        <p style={{ fontSize: 14, color: 'rgba(60,60,67,0.6)' }}>ระบบติดตาม Vital Sign ผู้ป่วย</p>
      </div>
      <div style={{ position: 'absolute', top: 20, right: 28, display: 'flex', alignItems: 'center', gap: 8, zIndex: 10 }}>
        <div style={{ position: 'relative', zIndex: monthOpen ? 100 : 1 }}>
          <div className={`dropdown-trigger${monthOpen ? ' open' : ''}`}
            onClick={() => setMonthOpen(!monthOpen)}
            style={{ background: 'rgba(255,255,255,0.8)', borderColor: 'transparent' }}>
            <span style={{ whiteSpace: 'nowrap' }}>{VS_MONTHS[selectedMonth]}</span>
            <svg className="dropdown-chevron" viewBox="0 0 10 6" fill="none">
              <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          {monthOpen && (
            <>
              <div className="dropdown-backdrop" onClick={() => setMonthOpen(false)} />
              <div className="dropdown-menu" style={{ minWidth: 200, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, padding: 6, right: 0, left: 'auto' }}>
                {VS_MONTHS.map((m, i) => (
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.8)', fontSize: 12, color: '#636E72' }}>
          <span>{date}</span>
          <strong style={{ color: '#000', fontFamily: 'var(--mono)' }}>{time}</strong>
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: -10, right: 30, width: 200, height: 200, zIndex: 1, pointerEvents: 'none' }}>
        <div className="anim-float" style={{ position: 'absolute', top: 30, left: 30, width: 65, height: 65, borderRadius: 16, background: 'linear-gradient(135deg, #EF4444, #F87171)', boxShadow: '0 10px 24px rgba(239,68,68,0.25)', animationDuration: '4s' }} />
        <div className="anim-float" style={{ position: 'absolute', top: 60, left: 100, width: 50, height: 50, borderRadius: '50%', background: 'linear-gradient(135deg, #F59E0B, #FCD34D)', boxShadow: '0 8px 18px rgba(245,158,11,0.25)', animationDelay: '0.5s', animationDuration: '3.5s' }} />
        <div className="anim-float" style={{ position: 'absolute', top: 10, left: 105, width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg, #8B5CF6, #A78BFA)', boxShadow: '0 6px 14px rgba(139,92,246,0.25)', animationDelay: '1s', animationDuration: '4.5s' }} />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   2. STAT CARDS — exact Figma order & values
   ═══════════════════════════════════════════ */
function StatCards() {
  const cards = [
    { label: 'ผู้ป่วยทั้งหมด', value: '200', growth: '4.1', icon: '👤', bg: 'linear-gradient(135deg, #3B82F6, #1D4ED8)' },
    { label: 'การวัดวันนี้', value: '150', growth: '6.3', icon: '📊', bg: 'linear-gradient(135deg, #FC9BBA, #DB677E)' },
    { label: 'เคสผิดปกติ', value: '50', growth: '7.8', icon: '⚠️', bg: 'linear-gradient(135deg, #E8802A, #D06A1A)' },
    { label: 'วิกฤต', value: '25', growth: '7.8', icon: '🚨', bg: 'linear-gradient(135deg, #E8432A, #D0381A)' },
    { label: 'อัตราการวัด', value: '15%', growth: '9.2', icon: '📈', bg: 'linear-gradient(135deg, #8B5CF6, #7C3AED)' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14 }}>
      {cards.map((c, i) => (
        <div key={c.label} className="sc anim-up" style={{ background: c.bg, animationDelay: `${(i + 1) * 60}ms`, height: 131, padding: 20 }}>
          <div className="shimmer" />
          <div className="sc-in">
            <div className="sc-top" style={{ marginBottom: 12 }}>
              <div className="ic" style={{ width: 36, height: 36, borderRadius: 10, fontSize: 15 }}>{c.icon}</div>
              <div className="tr" style={{ fontSize: 11 }}>↑ +{c.growth}%</div>
            </div>
            <div className="lbl" style={{ fontSize: 11, marginBottom: 4 }}>{c.label}</div>
            <div className="val" style={{ fontSize: 26, fontWeight: 700 }}>{c.value}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════
   3. CHARTS ROW — Left 564x486 + Right 564x486
   ═══════════════════════════════════════════ */
function ChartsRow() {
  const vitalTypes = [
    { name: 'ความดันโลหิต', count: '193 ครั้ง', color: '#6C5CE7', icon: '💜', normalBars: [80, 60, 90, 70], abnormalBars: [20, 40, 10, 30] },
    { name: 'ชีพจร', count: '193 ครั้ง', color: '#D63031', icon: '❤️', normalBars: [70, 55, 85, 60], abnormalBars: [30, 45, 15, 40] },
    { name: 'อุณหภูมิ', count: '175 ครั้ง', color: '#E17055', icon: '🌡️', normalBars: [85, 70, 90, 80], abnormalBars: [15, 30, 10, 20] },
    { name: 'ออกซิเจน', count: '193 ครั้ง', color: '#0984E3', icon: '🫁', normalBars: [90, 80, 95, 85], abnormalBars: [10, 20, 5, 15] },
    { name: 'น้ำตาล', count: '193 ครั้ง', color: '#00B894', icon: '🩸', normalBars: [65, 50, 75, 55], abnormalBars: [35, 50, 25, 45] },
  ];

  const yearlyData = [
    { month: 'ม.ค.', thisYear: 45, lastYear: 38 },
    { month: 'ก.พ.', thisYear: 52, lastYear: 42 },
    { month: 'มี.ค.', thisYear: 48, lastYear: 35 },
    { month: 'เม.ย.', thisYear: 60, lastYear: 45 },
    { month: 'พ.ค.', thisYear: 55, lastYear: 40 },
    { month: 'มิ.ย.', thisYear: 50, lastYear: 43 },
    { month: 'ก.ค.', thisYear: 58, lastYear: 48 },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      {/* ═══ LEFT: สรุป Vital Signs แยกประเภท (564x486) ═══ */}
      <div className="gc anim-up" style={{ animationDelay: '350ms' }}>
        <div style={{ padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, padding: '0 0 12px', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(108,92,231,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>💓</div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#2D3436' }}>สรุป Vital Signs แยกประเภท</h3>
              <p style={{ fontSize: 12, color: '#B2BEC3', marginTop: 1 }}>จำนวนการวัดและค่าผิดปกติ</p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {vitalTypes.map((v) => (
              <div key={v.name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 12, background: 'white', border: '1px solid rgba(0,0,0,0.03)', minHeight: 64 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: `${v.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 14 }}>{v.icon}</div>
                <div style={{ width: 80, flexShrink: 0 }}>
                  <p style={{ fontSize: 12, fontWeight: 500, color: '#2D3436' }}>{v.name}</p>
                  <p style={{ fontSize: 10, color: '#B2BEC3' }}>{v.count}</p>
                </div>
                {/* Mini grouped bars — green (normal) + red (abnormal) */}
                <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: 3, height: 42 }}>
                  {v.normalBars.map((h, i) => (
                    <div key={`n${i}`} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                      <div style={{ width: '100%', maxWidth: 12, height: `${h * 0.4}px`, borderRadius: '2px 2px 0 0', background: '#00B894' }} />
                      <div style={{ width: '100%', maxWidth: 12, height: `${v.abnormalBars[i] * 0.4}px`, borderRadius: '0 0 2px 2px', background: '#D63031' }} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ RIGHT: ผลลัพธ์วิเคราะห์ (177px) + เปรียบเทียบ 1 ปี (293px) ═══ */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* ── ผลลัพธ์วิเคราะห์ (564x177) ── */}
        <div className="gc anim-up" style={{ animationDelay: '400ms' }}>
          <div style={{ padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, padding: '0 0 12px', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(214,48,49,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>📋</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#2D3436' }}>ผลลัพธ์วิเคราะห์</h3>
            </div>
            {/* Horizontal bars with big numbers — matching Figma */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              {/* ผิดปกติ */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 11, color: '#636E72' }}>● ผิดปกติ</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ flex: 1, height: 8, borderRadius: 99, background: 'rgba(214,48,49,0.1)', overflow: 'hidden' }}>
                    <div style={{ width: '28%', height: '100%', borderRadius: 99, background: '#D63031' }} />
                  </div>
                  <span className="num" style={{ fontSize: 28, fontWeight: 900, color: '#D63031' }}>20</span>
                </div>
              </div>
              {/* ปกติ */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 11, color: '#636E72' }}>● ปกติ</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ flex: 1, height: 8, borderRadius: 99, background: 'rgba(0,184,148,0.1)', overflow: 'hidden' }}>
                    <div style={{ width: '78%', height: '100%', borderRadius: 99, background: '#00B894' }} />
                  </div>
                  <span className="num" style={{ fontSize: 28, fontWeight: 900, color: '#00B894' }}>70</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── ผลลัพธ์ของกราฟเปรียบเทียบ 1 ปี (564x293) ── */}
        <div className="gc anim-up" style={{ animationDelay: '450ms', flex: 1 }}>
          <div style={{ padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, padding: '0 0 10px', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(0,184,148,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>📊</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#2D3436' }}>ผลลัพธ์ของกราฟเปรียบเทียบ 1 ปี</h3>
              </div>
              <span style={{ fontSize: 12, color: '#636E72', cursor: 'pointer' }}>ดูเพิ่มเติม</span>
            </div>
            <div style={{ display: 'flex', gap: 14, marginBottom: 8, fontSize: 11 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#636E72' }}><span className="dot" style={{ background: '#6C5CE7' }} /> ปีนี้</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#636E72' }}><span className="dot" style={{ background: '#E17055' }} /> ปีที่แล้ว</span>
            </div>
            <div style={{ height: 170 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={yearlyData} margin={{ top: 5, right: 5, bottom: 5, left: -15 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#B2BEC3' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: '#B2BEC3' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<Tip />} />
                  <Bar dataKey="thisYear" name="ปีนี้" fill="#6C5CE7" radius={[3, 3, 0, 0]} barSize={10} />
                  <Bar dataKey="lastYear" name="ปีที่แล้ว" fill="#E17055" radius={[3, 3, 0, 0]} barSize={10} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   4. MAP (MapLibre) + PATIENT LIST
   ═══════════════════════════════════════════ */
function MapSection() {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);

  const mapPatients = [
    { name: 'กรุงเทพมหานคร', lat: 13.7563, lng: 100.5018, normal: 120, abnormal: 15 },
    { name: 'สกลนคร', lat: 17.1545, lng: 104.1348, normal: 80, abnormal: 10 },
    { name: 'เชียงใหม่', lat: 18.7883, lng: 98.9853, normal: 45, abnormal: 8 },
    { name: 'ขอนแก่น', lat: 16.4322, lng: 102.8236, normal: 38, abnormal: 6 },
    { name: 'นครราชสีมา', lat: 14.9799, lng: 102.0978, normal: 30, abnormal: 5 },
    { name: 'สุราษฎร์ธานี', lat: 9.1382, lng: 99.3217, normal: 25, abnormal: 4 },
    { name: 'ชลบุรี', lat: 13.3611, lng: 100.9847, normal: 20, abnormal: 3 },
    { name: 'ภูเก็ต', lat: 7.8804, lng: 98.3923, normal: 15, abnormal: 2 },
  ];

  useEffect(() => {
    if (mapRef.current) return;
    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
      center: [101.0, 13.0],
      zoom: 5.2,
    });
    map.addControl(new maplibregl.NavigationControl(), 'top-left');
    map.on('load', () => {
      mapPatients.forEach(p => {
        const total = p.normal + p.abnormal;
        const size = Math.max(14, Math.min(36, total / 4));
        const color = p.abnormal / total > 0.15 ? '#D63031' : '#00B894';
        const el = document.createElement('div');
        el.style.cssText = `width:${size}px;height:${size}px;border-radius:50%;background:${color};opacity:0.7;border:2px solid white;box-shadow:0 2px 8px ${color}40;cursor:pointer;`;
        new maplibregl.Marker({ element: el }).setLngLat([p.lng, p.lat])
          .setPopup(new maplibregl.Popup({ offset: 12, closeButton: false }).setHTML(`<div style="font-family:Sarabun,sans-serif"><strong>${p.name}</strong><br/><span style="color:#00B894">ปกติ: ${p.normal}</span> · <span style="color:#D63031">ผิดปกติ: ${p.abnormal}</span></div>`))
          .addTo(map);
      });
    });
    mapRef.current = map;
    return () => map.remove();
  }, []);

  const patientList = [
    { name: 'คุณทดลอง ทดสอบ', condition: 'ความดันโลหิตสูง', severity: 95 },
    { name: 'คุณทดลอง ทดสอบ', condition: 'ต่ำ', severity: 85 },
    { name: 'คุณทดลอง ทดสอบ', condition: 'มีไข้', severity: 75 },
    { name: 'คุณทดลอง ทดสอบ', condition: 'หัวใจเต้นเร็ว', severity: 70 },
    { name: 'คุณทดลอง ทดสอบ', condition: 'ระบบดับน้ำตาลสูงมาก', severity: 65 },
    { name: 'คุณทดลอง ทดสอบ', condition: 'ระบบดับน้ำตาลสูงมาก', severity: 60 },
    { name: 'คุณทดลอง ทดสอบ', condition: 'ระบบดับน้ำตาลสูงมาก', severity: 55 },
    { name: 'คุณทดลอง ทดสอบ', condition: 'มีไข้', severity: 45 },
    { name: 'คุณทดลอง ทดสอบ', condition: 'มีไข้', severity: 35 },
    { name: 'คุณทดลอง ทดสอบ', condition: 'ความดันโลหิตสูง', severity: 25 },
  ];

  return (
    <div className="gc anim-up" style={{ animationDelay: '500ms', overflow: 'hidden' }}>
      <div className="gc-head">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(108,92,231,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>🗺️</div>
          <div className="gc-title"><h3 style={{ fontSize: 16 }}>แผนที่ผู้ป่วย</h3><p>แสดงตำแหน่งและสถานะผู้ป่วยทั่วประเทศ</p></div>
        </div>
        <div className="seg">
          {['ทั้งหมด', 'ความดันโลหิต', 'ชีพจร', 'อุณหภูมิ', 'ออกซิเจน', 'น้ำตาล'].map((f, i) => (
            <button key={f} className={`seg-btn ${i === 0 ? 'active' : ''}`}>{f}</button>
          ))}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
        {/* Map */}
        <div style={{ position: 'relative' }}>
          <div ref={mapContainer} style={{ height: 520, borderRadius: '0 0 0 24px' }} />
          <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 10 }}>
            <div className="seg" style={{ background: 'rgba(255,255,255,0.9)', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
              <button className="seg-btn active" style={{ fontSize: 11 }}>แผนที่</button>
              <button className="seg-btn" style={{ fontSize: 11 }}>ดาวเทียม</button>
              <button className="seg-btn" style={{ fontSize: 11 }}>ภูมิประเทศ</button>
            </div>
          </div>
        </div>
        {/* Patient list */}
        <div style={{ borderLeft: '1px solid rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 14 }}>🏆</span>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: '#2D3436' }}>คนไข้ที่ต้องดูแล</h4>
            </div>
            <span style={{ fontSize: 12, color: '#636E72', cursor: 'pointer' }}>ดูเพิ่มเติม</span>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {patientList.map((p, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 20px', height: 52, borderBottom: '1px solid rgba(0,0,0,0.02)' }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #f0abfc, #c084fc)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 11, fontWeight: 600 }}>👤</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className="truncate" style={{ fontSize: 12, fontWeight: 500, color: '#2D3436' }}>{p.name}</p>
                  <p style={{ fontSize: 10, color: '#B2BEC3' }}>{p.condition}</p>
                </div>
                <div style={{ width: 80, height: 6, borderRadius: 99, background: 'rgba(214,48,49,0.08)', overflow: 'hidden', flexShrink: 0 }}>
                  <div style={{ height: '100%', borderRadius: 99, background: `linear-gradient(90deg, #E8432A, #FC9BBA)`, width: `${p.severity}%` }} />
                </div>
              </div>
            ))}
            <div style={{ padding: '8px 20px', fontSize: 12, color: '#B2BEC3' }}>แสดง 1-10 จาก 25 รายการ</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   5. PATIENT TABLE
   ═══════════════════════════════════════════ */
function PatientTable() {
  const [page, setPage] = useState(1);
  const patients = Array.from({ length: 15 }, (_, i) => ({
    id: i + 1,
    name: 'คุณทดลอง ทดสอบ',
    hospital: 'รพ.ทดสอบ BMS',
    status: i === 0 || i === 3 || i === 4 ? 'normal' : 'abnormal',
    severity: Math.max(20, 100 - i * 7),
  }));
  const perPage = 10;
  const totalPages = Math.ceil(patients.length / perPage);
  const rows = patients.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="gc anim-up" style={{ animationDelay: '600ms', overflow: 'hidden' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(108,92,231,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>📋</div>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#2D3436' }}>รายชื่อผู้ป่วยวัด Vitalsign</h3>
            <p style={{ fontSize: 12, color: '#B2BEC3', marginTop: 1 }}>รายการผู้ป่วยที่มีการบันทึกสัญญาณชีพ เพื่อใช้ติดตามและประเมินสุขภาพ</p>
          </div>
        </div>
      </div>
      {/* Table rows — each 56px, matching Figma layout with avatar + name + condition + severity bar */}
      <div>
        {rows.map((r) => {
          const isNormal = r.status === 'normal';
          const statusLabel = isNormal ? 'ปกติ' : 'ผิดปกติ';
          const statusColor = isNormal ? '#00B894' : '#D63031';
          const statusBg = isNormal ? 'rgba(0,184,148,0.08)' : 'rgba(214,48,49,0.08)';
          return (
            <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 20px', height: 56, borderBottom: '1px solid rgba(0,0,0,0.02)' }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #f0abfc, #c084fc)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 11 }}>👤</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p className="truncate" style={{ fontSize: 12, fontWeight: 500, color: '#2D3436' }}>{r.name}</p>
              </div>
              <span style={{ padding: '3px 12px', borderRadius: 99, fontSize: 10, fontWeight: 600, color: statusColor, background: statusBg, flexShrink: 0 }}>{statusLabel}</span>
              <div style={{ width: 100, height: 6, borderRadius: 99, background: 'rgba(214,48,49,0.06)', overflow: 'hidden', flexShrink: 0 }}>
                <div style={{ height: '100%', borderRadius: 99, background: isNormal ? 'linear-gradient(90deg, #00B894, #55EFC4)' : 'linear-gradient(90deg, #E8432A, #FC9BBA)', width: `${r.severity}%` }} />
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px' }}>
        <span style={{ fontSize: 12, color: '#B2BEC3' }}>แสดง {(page - 1) * perPage + 1}-{Math.min(page * perPage, patients.length)} จาก {patients.length} รายการ</span>
        <div className="pag">
          <button className="pg" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>‹</button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button key={i + 1} className={`pg ${page === i + 1 ? 'active' : ''}`} onClick={() => setPage(i + 1)}>{i + 1}</button>
          ))}
          <button className="pg" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>›</button>
        </div>
      </div>
    </div>
  );
}

/* ═══ MAIN ═══ */
export default function VitalSign() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 1300, margin: '0 auto' }}>
      <Hero />
      <StatCards />
      <ChartsRow />
      <MapSection />
      <PatientTable />
    </div>
  );
}
