import { useState } from 'react';
import { getAvatar } from '../data/patients';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import logoHomeCare from '../assets/images/logo-atlas-homecare.png';
import logoMyAtlas from '../assets/images/logo-my-atlas.png';

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

/* ── VitalRow helper ── */
function VitalRow({ label, value, unit, color = '#34C759', time = '10:00 น.' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 16, height: 16, borderRadius: '50%', background: `linear-gradient(135deg, ${color}, ${color})`, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '0.5px solid white', flexShrink: 0 }} />
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
    <svg width="160" height="90" viewBox="0 0 160 90">
      <path d="M10 80 A 70 70 0 0 1 150 80" fill="none" stroke="#E5E7EB" strokeWidth="12" strokeLinecap="round" />
      <path d="M10 80 A 70 70 0 0 1 150 80" fill="none" stroke="url(#bmiGrad)" strokeWidth="12" strokeLinecap="round" strokeDasharray="220" strokeDashoffset={220 - (angle / 180) * 220} />
      <defs>
        <linearGradient id="bmiGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#34C759" />
          <stop offset="40%" stopColor="#FFCC00" />
          <stop offset="70%" stopColor="#FF9500" />
          <stop offset="100%" stopColor="#FF383C" />
        </linearGradient>
      </defs>
      <text x="80" y="70" textAnchor="middle" fontSize="28" fontWeight="700" fill={BLACK}>{bmi}</text>
      <text x="80" y="85" textAnchor="middle" fontSize="10" fill="#8E8E93">ค่าปกติอยู่ในเกณฑ์</text>
    </svg>
  );
}

/* ── Chart mock data ── */
const chartData = [
  { day: '15 มี.ค.', systolic: 138, diastolic: 82 },
  { day: '16 มี.ค.', systolic: 145, diastolic: 78 },
  { day: '17 มี.ค.', systolic: 150, diastolic: 85 },
  { day: '18 มี.ค.', systolic: 142, diastolic: 80 },
  { day: '19 มี.ค.', systolic: 135, diastolic: 77 },
  { day: '20 มี.ค.', systolic: 148, diastolic: 83 },
  { day: '21 มี.ค.', systolic: 140, diastolic: 79 },
];

const chartFilterTabs = ['ทั้งหมด', 'ชีพจร', 'อุณหภูมิ', 'ออกซิเจน', 'น้ำตาล', 'น้ำหนัก', 'CGM'];

/* ── Mock vital history ── */
const makeVitals = (bp, hr, temp, spo2, sugar, height, weight, waist) => [
  { label: 'ความดันโลหิต', value: bp, unit: 'mmHg', color: '#34C759' },
  { label: 'ชีพจร', value: `${hr}`, unit: 'bpm', color: '#34C759' },
  { label: 'อุณหภูมิ', value: `${temp}`, unit: '°C', color: '#34C759' },
  { label: 'ออกซิเจน', value: `${spo2}%`, unit: '', color: '#34C759' },
  { label: 'น้ำตาล', value: `${sugar}`, unit: 'mg/dL', color: '#34C759' },
  { label: 'ส่วนสูง', value: `${height}`, unit: 'cm', color: '#34C759' },
  { label: 'น้ำหนัก', value: `${weight}`, unit: 'kg', color: '#34C759' },
  { label: 'รอบเอว', value: `${waist}`, unit: 'inch', color: '#34C759' },
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
const statCards = [
  { label: 'ความดันโลหิต', value: '150/77', unit: 'mmHg', gradient: 'linear-gradient(135deg, #34C759, #30B050)' },
  { label: 'ชีพจร', value: '103', unit: 'bpm', gradient: 'linear-gradient(135deg, #FF2D55, #FF6B8A)' },
  { label: 'อุณหภูมิ', value: '36', unit: '°C', gradient: 'linear-gradient(135deg, #FF9500, #FFB340)' },
  { label: 'ออกซิเจน', value: '98%', unit: '', gradient: 'linear-gradient(135deg, #00C7BE, #5AC8FA)' },
  { label: 'น้ำตาล', value: '142', unit: 'mg/dL', gradient: 'linear-gradient(135deg, #FF383C, #FF6961)' },
  { label: 'BMI', value: '142', unit: 'mg/dL', gradient: 'linear-gradient(135deg, #AF52DE, #DA8FFF)' },
];

/* ── Tabs ── */
const tabLabels = ['Vital Signs', 'ประวัติการเยี่ยมบ้าน', 'ประวัติการจ่ายยา', 'ผลตรวจทางการแพทย์'];

/* ═══════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════ */
export default function PatientProfile({ patient, onClose }) {
  const [activeTab, setActiveTab] = useState(0);
  const [chartFilter, setChartFilter] = useState(0);
  const [historyPage, setHistoryPage] = useState(1);

  if (!patient) return null;

  const avatar = getAvatar(patient.age, patient.gender);

  /* ── Info rows for patient card ── */
  const infoRows = [
    { label: 'วันเกิด', value: '14 ก.ค. 2544' },
    { label: 'เพศ', value: patient.gender },
    { label: 'อายุ', value: `${patient.age} ปี` },
    { label: 'เบอร์โทร', value: patient.phone },
  ];

  /* ── Pagination ── */
  const totalItems = 25;
  const perPage = 10;
  const totalPages = Math.ceil(totalItems / perPage);
  const startItem = (historyPage - 1) * perPage + 1;
  const endItem = Math.min(historyPage * perPage, totalItems);

  return (
    <div style={{ fontFamily: font, display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* ── Back button ── */}
        <button
          className="hover-btn"
          onClick={onClose}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 14, color: '#0088FF', fontWeight: 600, fontFamily: font,
            marginBottom: 12, padding: '4px 0', display: 'flex', alignItems: 'center', gap: 4,
          }}
        >
          {'<'} กลับ
        </button>

        {/* ── Tabs row ── */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {tabLabels.map((t, i) => (
            <button
              key={i}
              className="hover-btn"
              onClick={() => setActiveTab(i)}
              style={{
                padding: '8px 18px', borderRadius: 20, border: 'none', cursor: 'pointer',
                fontSize: 12, fontWeight: 600, fontFamily: font,
                background: activeTab === i ? '#0088FF' : 'rgba(0,0,0,0.05)',
                color: activeTab === i ? '#fff' : GRAY,
                transition: 'all 0.2s ease',
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* ── 2-column layout ── */}
        <div style={{ display: 'flex', gap: 20 }}>

          {/* ════ LEFT SIDEBAR ════ */}
          <div style={{ width: 250, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* Patient card */}
            <div className="hover-card anim-slide-up delay-1" style={{
              ...glassCard,
              background: 'linear-gradient(135deg, rgba(175,82,222,0.08), rgba(90,200,250,0.06))',
              borderRadius: 24, textAlign: 'center', padding: 20,
            }}>
              <img src={avatar} alt="avatar" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(255,255,255,0.8)', marginBottom: 10 }} />
              <div style={{ fontSize: 18, fontWeight: 700, color: BLACK, marginBottom: 2 }}>{patient.name}</div>
              <div style={{ fontSize: 12, color: GRAY, marginBottom: 12 }}>{patient.age} ปี | {patient.gender}</div>
              <div style={{ height: 1, background: 'rgba(0,0,0,0.06)', margin: '0 -20px 12px' }} />
              {infoRows.map((r, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0' }}>
                  <span style={{ fontSize: 11, color: GRAY }}>{r.label}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: BLACK }}>{r.value}</span>
                </div>
              ))}
            </div>

            {/* หลัก card */}
            <div className="hover-card anim-slide-up delay-2" style={{ ...glassCard, borderRadius: 24 }}>
              <div style={{ fontSize: 10, color: GRAY, marginBottom: 4 }}>หลัก</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: BLACK, marginBottom: 2 }}>อยู่ในความดูแลของ</div>
              <div style={{ fontSize: 11, color: '#0088FF', fontWeight: 500 }}>รพ.สต.ในเมือง เชียงใหม่</div>
            </div>

            {/* โรงพยาบาลต้นสังกัด card */}
            <div className="hover-card anim-slide-up delay-3" style={{ ...glassCard, borderRadius: 24 }}>
              <div style={{ fontSize: 10, color: GRAY, marginBottom: 4 }}>โรงพยาบาลต้นสังกัด</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: BLACK }}>โรงพยาบาลมหาราชนครเชียงใหม่</div>
            </div>

            {/* ที่อยู่ card */}
            <div className="hover-card anim-slide-up delay-4" style={{ ...glassCard, borderRadius: 24 }}>
              <div style={{ fontSize: 10, color: GRAY, marginBottom: 4 }}>ที่อยู่</div>
              <div style={{ fontSize: 11, fontWeight: 500, color: BLACK, lineHeight: 1.6 }}>{patient.address}</div>
            </div>
          </div>

          {/* ════ MAIN CONTENT ════ */}
          <div style={{ flex: 1, minWidth: 0 }}>

            {activeTab === 0 && (
              <div className="anim-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                {/* ── 6 Stat Cards (3x2) ── */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                  {statCards.map((s, i) => (
                    <div key={i} className={`hover-stat anim-slide-up delay-${i + 1}`} style={{
                      background: s.gradient, borderRadius: 20, padding: 14, height: 90,
                      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                      color: '#fff', position: 'relative', overflow: 'hidden',
                    }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: 16 }}>{['🫀', '💓', '🌡', '🫁', '🩸', '⚖'][i]}</span>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, opacity: 0.85 }}>{s.label}</div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                          <span style={{ fontSize: 20, fontWeight: 700 }}>{s.value}</span>
                          <span style={{ fontSize: 10, opacity: 0.8 }}>{s.unit}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* ── Chart + BMI row ── */}
                <div style={{ display: 'flex', gap: 12 }}>

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
                            background: chartFilter === i ? '#0088FF' : 'rgba(0,0,0,0.04)',
                            color: chartFilter === i ? '#fff' : GRAY,
                          }}
                        >
                          {t}
                        </button>
                      ))}
                    </div>

                    <ResponsiveContainer width="100%" height={180}>
                      <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                        <XAxis dataKey="day" tick={{ fontSize: 10, fill: GRAY }} />
                        <YAxis tick={{ fontSize: 10, fill: GRAY }} domain={[60, 170]} />
                        <Tooltip content={<Tip />} />
                        <Line type="monotone" dataKey="systolic" name="Systolic" stroke="#FF383C" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3, fill: '#FF383C' }} />
                        <Line type="monotone" dataKey="diastolic" name="Diastolic" stroke="#0088FF" strokeWidth={2} dot={{ r: 3, fill: '#0088FF' }} />
                      </LineChart>
                    </ResponsiveContainer>

                    {/* Legend */}
                    <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#FF383C' }} />
                        <span style={{ fontSize: 10, color: GRAY }}>Systolic</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#0088FF' }} />
                        <span style={{ fontSize: 10, color: GRAY }}>Diastolic</span>
                      </div>
                    </div>
                  </div>

                  {/* BMI section */}
                  <div className="hover-card anim-slide-up delay-6" style={{ ...glassCard, width: 200, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: BLACK, marginBottom: 2 }}>BMI</div>
                    <div style={{ fontSize: 10, color: GRAY, marginBottom: 10 }}>Body Mass Index</div>
                    <BMIGauge bmi={19.5} />
                    <div style={{ display: 'flex', gap: 20, marginTop: 12 }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: BLACK }}>60</div>
                        <div style={{ fontSize: 9, color: GRAY }}>น้ำหนัก (kg)</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: BLACK }}>175</div>
                        <div style={{ fontSize: 9, color: GRAY }}>ส่วนสูง (cm)</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── ประวัติการวัด Vital Signs ── */}
                <div className="anim-slide-up delay-7" style={{ ...glassCard }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: BLACK }}>ประวัติการวัด Vital Signs</div>
                    <select style={{
                      fontSize: 10, color: GRAY, background: 'rgba(0,0,0,0.04)', border: 'none',
                      borderRadius: 10, padding: '4px 10px', fontFamily: font, cursor: 'pointer',
                    }}>
                      <option>เพิ่มเติม</option>
                    </select>
                  </div>

                  {vitalHistory.map((group, gi) => (
                    <div key={gi} style={{ marginBottom: 16 }}>
                      {/* Source header */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                        <img
                          src={group.logo === 'homecare' ? logoHomeCare : logoMyAtlas}
                          alt={group.source}
                          style={{ width: 20, height: 20, borderRadius: 4, objectFit: 'contain' }}
                        />
                        <span style={{ fontSize: 12, fontWeight: 600, color: BLACK }}>{group.source}</span>
                      </div>

                      {/* Visit cards */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingLeft: 28 }}>
                        {group.visits.map((visit, vi) => (
                          <div key={vi} className="hover-card" style={{
                            background: '#fff', borderRadius: 16, padding: 16,
                            border: '1px solid rgba(0,0,0,0.04)',
                            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                          }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: BLACK, marginBottom: 10 }}>
                              Visit: {visit.id} ({visit.date})
                            </div>
                            {visit.vitals.map((v, vii) => (
                              <div key={vii}>
                                <VitalRow label={v.label} value={v.value} unit={v.unit} color={v.color} time={visit.time} />
                                {vii < visit.vitals.length - 1 && (
                                  <div style={{ height: 1, background: 'rgba(0,0,0,0.04)', margin: '0 0 0 24px' }} />
                                )}
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Pagination */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, paddingTop: 12, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                    <span style={{ fontSize: 11, color: GRAY }}>แสดง {startItem}-{endItem} จาก {totalItems} รายการ</span>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button
                        className="hover-btn"
                        onClick={() => setHistoryPage(p => Math.max(1, p - 1))}
                        style={{ width: 28, height: 28, borderRadius: 8, border: '1px solid rgba(0,0,0,0.08)', background: '#fff', cursor: 'pointer', fontSize: 12, color: GRAY, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        {'‹'}
                      </button>
                      {[1, 2, 3].map(p => (
                        <button
                          key={p}
                          className="hover-btn"
                          onClick={() => setHistoryPage(p)}
                          style={{
                            width: 28, height: 28, borderRadius: 8, border: 'none', cursor: 'pointer',
                            fontSize: 11, fontWeight: 600, fontFamily: font,
                            background: historyPage === p ? '#0088FF' : 'rgba(0,0,0,0.04)',
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
                        style={{ width: 28, height: 28, borderRadius: 8, border: '1px solid rgba(0,0,0,0.08)', background: '#fff', cursor: 'pointer', fontSize: 12, color: GRAY, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
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
          </div>{/* end main content */}
        </div>{/* end 2-column flex */}
    </div>/* end root */
  );
}
