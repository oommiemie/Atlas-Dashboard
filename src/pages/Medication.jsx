import { useState, useContext } from 'react';
import { CallContext, PatientContext } from '../App';
import { MED_JOBS, MED_TELEPHARMACY, enrichWithPatient, getPatient, getAvatar } from '../data/patients';

import imgMedicine3d from '../assets/images/medicine-3d.png';
import imgGrid from '../assets/images/grid-bg.png';
import imgAvatarBlur from '../assets/images/avatar-blur.png';
import imgEvidence from '../assets/images/evidence-photo.png';
import iconMedClipboard from '../assets/icons/med-clipboard.svg';
import iconMedPills from '../assets/icons/med-pills-circle.svg';
import iconMedTruck from '../assets/icons/med-truck.svg';
import iconMedCheck from '../assets/icons/med-checkmark.svg';
import iconMedXCircle from '../assets/icons/med-xcircle.svg';
import iconMedInfo from '../assets/icons/med-info-circle.svg';
import iconMedWarning from '../assets/icons/med-warning-triangle.svg';
import iconMedCheckCircle from '../assets/icons/med-checkmark-circle.svg';
import iconMedArrowFwd from '../assets/icons/med-arrow-forward.svg';
import iconMedPhone from '../assets/icons/med-phone.svg';
import iconMedClock from '../assets/icons/med-clock.svg';
import iconTelePhone from '../assets/icons/tele-phone.svg';
import iconTelePhoneArrow from '../assets/icons/tele-phone-arrow.svg';
import iconTeleEcgText from '../assets/icons/tele-ecg-text.svg';
import iconTeleCalendar from '../assets/icons/tele-calendar.svg';
import iconTeleCalendar2 from '../assets/icons/tele-calendar2.svg';
import iconTelePills from '../assets/icons/tele-pills.svg';
import iconTeleXmark from '../assets/icons/tele-xmark.svg';
import iconTeleChevron from '../assets/icons/tele-chevron-down.svg';

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

const TABS = ['สรุปภาพรวม', 'Telepharmacy'];

/* ══════════════════════════════════════════
   STATUS CONFIG
   ══════════════════════════════════════════ */
const STATUS_MAP = {
  'ส่งสำเร็จ': { bg: 'linear-gradient(90deg, rgba(52,199,89,0.2), rgba(52,199,89,0.2)), linear-gradient(90deg, #fff, #fff)', color: '#34C759' },
  'กำลังนำส่ง': { bg: 'linear-gradient(90deg, rgba(19,152,216,0.2), rgba(19,152,216,0.2)), linear-gradient(90deg, #fff, #fff)', color: '#1398D8' },
  'ส่งไม่สำเร็จ': { bg: 'linear-gradient(90deg, rgba(255,56,60,0.1), rgba(255,56,60,0.1)), linear-gradient(90deg, #fff, #fff)', color: '#FF383C' },
  'รอแพ็กยา': { bg: 'linear-gradient(90deg, rgba(29,78,216,0.1), rgba(29,78,216,0.1)), linear-gradient(90deg, #fff, #fff)', color: '#1D4ED8' },
  'รับงานแล้ว': { bg: 'linear-gradient(90deg, rgba(232,128,42,0.1), rgba(232,128,42,0.1)), linear-gradient(90deg, #fff, #fff)', color: '#E8802A' },
  'พร้อมรับยา': { bg: 'linear-gradient(90deg, rgba(139,92,246,0.2), rgba(139,92,246,0.2)), linear-gradient(90deg, #fff, #fff)', color: '#8B5CF6' },
  'รอ Telepharmacy': { bg: 'linear-gradient(90deg, rgba(172,70,167,0.1), rgba(172,70,167,0.1)), linear-gradient(90deg, #fff, #fff)', color: '#7C2471' },
  'รับยาแล้ว': { bg: 'linear-gradient(90deg, rgba(255,204,0,0.1), rgba(255,204,0,0.1)), linear-gradient(90deg, #fff, #fff)', color: '#D2AA09' },
};

const TELEPHARMACY_STATUS_MAP = {
  'รอให้คำแนะนำ': { bg: 'linear-gradient(90deg, rgba(232,128,42,0.1), rgba(232,128,42,0.1)), linear-gradient(90deg, #fff, #fff)', color: '#E8802A' },
  'ให้คำแนะนำแล้ว': { bg: 'linear-gradient(90deg, rgba(52,199,89,0.2), rgba(52,199,89,0.2)), linear-gradient(90deg, #fff, #fff)', color: '#34C759' },
};

/* ══════════════════════════════════════════
   MOCK DATA
   ══════════════════════════════════════════ */
const JOBS = MED_JOBS.map(enrichWithPatient);

const TELEPHARMACY_ITEMS = MED_TELEPHARMACY.map(enrichWithPatient);

const TIMELINE_STEPS = [
  { name: 'ร่าง', time: '2 เม.ย. 08:30' },
  { name: 'รอแพ็กยา', time: '2 เม.ย. 08:30' },
  { name: 'พร้อมรับยา', time: '2 เม.ย. 08:30' },
  { name: 'รับงานแล้ว', time: '2 เม.ย. 08:30' },
  { name: 'รับยาแล้ว', time: '2 เม.ย. 08:30' },
  { name: 'กำลังนำส่ง', time: '2 เม.ย. 08:30' },
  { name: 'ส่งสำเร็จ', time: '2 เม.ย. 08:30' },
];

/* ══════════════════════════════════════════
   INLINE SVG ICONS
   ══════════════════════════════════════════ */
const FigmaIcon = ({ src, size = 20 }) => (
  <img src={src} alt="" style={{ width: size, height: size }} />
);

const IconSearch = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <circle cx="6" cy="6" r="4.5" stroke="#8E8E93" strokeWidth="1.5" />
    <line x1="9.5" y1="9.5" x2="13" y2="13" stroke="#8E8E93" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const IconChevronDown = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
    <path d="M2 3.5l3 3 3-3" stroke="#8E8E93" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconInfoRed = () => (
  <img src={iconMedInfo} alt="" style={{ width: 16, height: 16 }} />
);

const IconWarning = () => (
  <svg width="16" height="16" viewBox="0 0 16 16">
    <path d="M8 1L15 14H1L8 1z" fill="#E8802A" />
    <text x="8" y="12.5" textAnchor="middle" fill="white" fontSize="9" fontWeight="700">!</text>
  </svg>
);

const IconCloseX = () => (
  <svg width="8" height="8" viewBox="0 0 8 8">
    <path d="M1 1l6 6M7 1l-6 6" stroke="#8E8E93" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const IconCheckCircleGreen = () => (
  <svg width="24" height="24" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="12" fill="#34C759" />
    <path d="M7 12l3 3 7-7" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconGrayCircle = () => (
  <svg width="24" height="24" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="12" fill="#C7C7CC" />
  </svg>
);

const IconPillModal = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <rect x="3" y="7" width="14" height="6" rx="3" fill="white" />
    <line x1="10" y1="7" x2="10" y2="13" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
  </svg>
);

const IconCalendar = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <rect x="1" y="2" width="12" height="11" rx="2" stroke="#8E8E93" strokeWidth="1.2" />
    <line x1="1" y1="5.5" x2="13" y2="5.5" stroke="#8E8E93" strokeWidth="1.2" />
    <line x1="4.5" y1="1" x2="4.5" y2="3" stroke="#8E8E93" strokeWidth="1.2" strokeLinecap="round" />
    <line x1="9.5" y1="1" x2="9.5" y2="3" stroke="#8E8E93" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

/* ══════════════════════════════════════════
   STATUS BADGE
   ══════════════════════════════════════════ */
function StatusBadge({ status, map }) {
  const cfg = (map || STATUS_MAP)[status] || { bg: '#eee', color: '#666' };
  return (
    <span style={{
      backgroundImage: cfg.bg, color: cfg.color, borderRadius: 100,
      padding: '4px 10px', fontSize: 10, fontWeight: 400, fontFamily: font,
      whiteSpace: 'nowrap', lineHeight: '16px',
    }}>{status}</span>
  );
}

/* ══════════════════════════════════════════
   SECTION TITLE WITH PURPLE BAR
   ══════════════════════════════════════════ */
function SectionTitle({ title }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ width: 3, height: 14, borderRadius: 2, background: '#8B5CF6' }} />
      <span style={{ fontSize: 14, fontWeight: 700, color: 'black', fontFamily: font }}>{title}</span>
    </div>
  );
}

/* ══════════════════════════════════════════
   STAT CARD
   ══════════════════════════════════════════ */
function StatCard({ label, value, gradient, icon }) {
  return (
    <div className="hover-stat anim-slide-up" style={{
      background: gradient, border: '1px solid rgba(255,255,255,0.7)',
      borderRadius: 24, padding: 16, color: 'white', fontFamily: font,
      height: 130, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      boxShadow: '0 4px 4px rgba(0,0,0,0.1)',
    }}>
      <div style={{ width: 40, height: 40, borderRadius: 14, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </div>
      <span style={{ fontSize: 11, fontWeight: 500, color: 'white', letterSpacing: 0.22 }}>{label}</span>
      <span style={{ fontSize: 26, fontWeight: 700, lineHeight: '26px' }}>{value}</span>
    </div>
  );
}

/* ══════════════════════════════════════════
   PAGINATION
   ══════════════════════════════════════════ */
function Pagination({ current, total, onChange, totalItems, perPage }) {
  const pages = Array.from({ length: total }, (_, i) => i + 1);
  const from = (current - 1) * perPage + 1;
  const to = Math.min(current * perPage, totalItems);
  const pageBtnStyle = (active) => ({
    width: 24, height: 24, borderRadius: 100, border: 'none', cursor: 'pointer',
    backgroundImage: active
      ? 'none'
      : 'linear-gradient(90deg, rgba(116,116,128,0.08), rgba(116,116,128,0.08)), linear-gradient(90deg, #fff, #fff)',
    background: active ? '#7C3AED' : undefined,
    color: active ? 'white' : '#8E8E93',
    fontSize: 14, fontWeight: 500, fontFamily: font,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  });
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16, overflow: 'hidden' }}>
      <span style={{ fontSize: 12, color: GRAY, fontFamily: font, lineHeight: '16px' }}>
        แสดง {from}-{to} จาก {totalItems} รายการ
      </span>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button onClick={() => onChange(Math.max(1, current - 1))} disabled={current <= 1} style={{
          ...pageBtnStyle(false), opacity: current <= 1 ? 0.3 : 1,
        }}>‹</button>
        {pages.map(p => (
          <button key={p} onClick={() => onChange(p)} style={pageBtnStyle(p === current)}>{p}</button>
        ))}
        <button onClick={() => onChange(Math.min(total, current + 1))} disabled={current >= total} style={{
          ...pageBtnStyle(false), opacity: current >= total ? 0.3 : 1,
        }}>›</button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   JOB DETAIL MODAL
   ══════════════════════════════════════════ */
const EVIDENCE_PHOTOS = [imgEvidence, imgEvidence, imgEvidence];

function PhotoLightbox({ src, onClose: closeLb }) {
  return (
    <div onClick={closeLb} style={{
      position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'zoom-out',
    }}>
      <img src={src} alt="" style={{
        maxWidth: '85vw', maxHeight: '85vh', borderRadius: 16,
        boxShadow: '0 16px 64px rgba(0,0,0,0.5)', objectFit: 'contain',
      }} />
      <button onClick={closeLb} style={{
        position: 'absolute', top: 24, right: 24,
        width: 40, height: 40, borderRadius: '50%', border: 'none',
        background: 'rgba(255,255,255,0.15)', color: 'white', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 20, backdropFilter: 'blur(8px)',
      }}>✕</button>
    </div>
  );
}

function JobDetailModal({ job, onClose }) {
  if (!job) return null;
  const { openPatient } = useContext(PatientContext);
  const [lightboxIdx, setLightboxIdx] = useState(null);

  // Dynamic timeline based on status
  const STATUS_TO_STEP = {
    'ร่าง': 0, 'รอแพ็กยา': 1, 'พร้อมรับยา': 2, 'รับงานแล้ว': 3,
    'รับยาแล้ว': 4, 'กำลังนำส่ง': 5, 'ส่งสำเร็จ': 6, 'ส่งไม่สำเร็จ': 5,
    'รอ Telepharmacy': 2,
  };
  const completedIdx = STATUS_TO_STEP[job.status] ?? 5;
  const isCompleted = job.status === 'ส่งสำเร็จ';

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
        backdropFilter: 'blur(4px)', zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: 700, maxHeight: '90vh', overflowY: 'auto',
          background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(35px)',
          borderRadius: 24, border: '1px solid rgba(255,255,255,0.8)',
          padding: 16, boxShadow: '0 4px 4px rgba(0,0,0,0.1)',
          fontFamily: font,
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 14, flexShrink: 0,
            background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <IconPillModal />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 16, fontWeight: 700, color: BLACK, margin: 0 }}>รายละเอียดงานส่งยา</p>
            <p style={{ fontSize: 12, color: GRAY, margin: 0 }}>รหัสงาน: {job.id}</p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: 16, border: 'none',
              background: '#F2F2F7', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <IconCloseX />
          </button>
        </div>

        {/* Body */}
        <div style={{ display: 'flex', gap: 16 }}>
          {/* Left */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Patient Info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                ['ชื่อผู้ป่วย', job.patient],
                ['HN', 'HN-650001'],
                ['VN', '6704010001'],
                ['RX Number', job.rx],
                ['เบอร์โทรศัพท์', job.phone],
              ].map(([label, val]) => (
                <div key={label}>
                  <p style={{ fontSize: 12, color: GRAY, margin: 0 }}>{label}</p>
                  {label === 'ชื่อผู้ป่วย' ? (
                    <p onClick={() => openPatient({ name: job.patient, age: job.age || 45, gender: job.gender || (job.patient?.startsWith('นาย') ? 'ชาย' : 'หญิง'), hn: job.hn || '', phone: job.phone || '', address: job.address || '', group: '', disease: '', team: '', adl: 0, visits: 0, lastVisit: '', outcome: '' })} style={{ fontSize: 14, fontWeight: 500, color: '#0088FF', margin: 0, cursor: 'pointer' }}>{val}</p>
                  ) : (
                    <p style={{ fontSize: 14, fontWeight: 500, color: BLACK, margin: 0 }}>{val}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Address */}
            <div style={{ background: 'white', borderRadius: 16, padding: 16 }}>
              <SectionTitle title="ที่อยู่จัดส่ง" />
              <p style={{ fontSize: 12, color: BLACK, margin: '10px 0 8px', lineHeight: 1.6 }}>{job.address}</p>
              <a href="#" style={{ fontSize: 12, color: '#0088FF', textDecoration: 'underline', fontFamily: font }}>ดูแผนที่ใน Google Maps</a>
            </div>

            {/* Drug List */}
            <div style={{ background: 'white', borderRadius: 16, padding: 16 }}>
              <SectionTitle title="รายการยา" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 12 }}>
                {/* Drug 1 */}
                <div style={{ display: 'flex', gap: 10 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 16, flexShrink: 0,
                    background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontSize: 14, fontWeight: 700,
                  }}>1</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: BLACK, margin: 0 }}>Metformin 500 mg</p>
                    <p style={{ fontSize: 11, color: GRAY, margin: '2px 0 8px' }}>รหัสยา: D001 | จำนวน: 60 เม็ด</p>
                    <div style={{ background: 'rgba(116,116,128,0.08)', borderRadius: 16, padding: 16 }}>
                      <p style={{ fontSize: 12, color: BLACK, margin: 0, fontWeight: 500 }}>วิธีใช้</p>
                      <p style={{ fontSize: 12, color: GRAY, margin: '4px 0 0' }}>ครั้งละ 1 เม็ด วันละ 2 ครั้ง หลังอาหาร</p>
                    </div>
                    <p style={{ fontSize: 11, color: '#FF383C', margin: '6px 0 0', fontWeight: 500 }}>คำเตือน: ห้ามใช้ร่วมกับแอลกอฮอล์</p>
                  </div>
                </div>
                {/* Drug 2 */}
                <div style={{ display: 'flex', gap: 10 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 16, flexShrink: 0,
                    background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontSize: 14, fontWeight: 700,
                  }}>2</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: BLACK, margin: 0 }}>Glibenclamide 5 mg</p>
                    <p style={{ fontSize: 11, color: GRAY, margin: '2px 0 8px' }}>รหัสยา: D002 | จำนวน: 30 เม็ด</p>
                    <div style={{ background: 'rgba(116,116,128,0.08)', borderRadius: 16, padding: 16 }}>
                      <p style={{ fontSize: 12, color: BLACK, margin: 0, fontWeight: 500 }}>วิธีใช้</p>
                      <p style={{ fontSize: 12, color: GRAY, margin: '4px 0 0' }}>ครั้งละ 1 เม็ด วันละ 1 ครั้ง ก่อนอาหารเช้า</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div style={{ background: 'white', borderRadius: 16, padding: 16 }}>
              <SectionTitle title="หมายเหตุ" />
              <p style={{ fontSize: 14, color: 'black', margin: '16px 0 0', lineHeight: 1.6, fontFamily: font }}>ผู้ป่วยโรคเบาหวาน ต้องการคำแนะนำการใช้ยา</p>
            </div>

            {/* Evidence - only show when completed */}
            {isCompleted && (
              <div style={{ background: 'white', borderRadius: 16, padding: 16 }}>
                <SectionTitle title="หลักฐานการส่งยา" />
                <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <span style={{ fontSize: 12, color: 'black', fontFamily: font }}>ผู้รับยา</span>
                    <span style={{ fontSize: 14, fontWeight: 500, color: 'black', fontFamily: font }}>{job.patient}</span>
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <span style={{ fontSize: 12, color: 'black', fontFamily: font }}>ความสัมพันธ์</span>
                    <span style={{ fontSize: 14, fontWeight: 500, color: 'black', fontFamily: font }}>ผู้ป่วยเอง</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                  {EVIDENCE_PHOTOS.map((src, i) => (
                    <div key={i}
                      onClick={() => setLightboxIdx(i)}
                      style={{
                        width: 112, height: 112, borderRadius: 16, overflow: 'hidden',
                        cursor: 'pointer', position: 'relative',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
                    >
                      <img src={src} alt={`หลักฐาน ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 16 }} />
                      <div style={{
                        position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)', borderRadius: 16,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'background 0.2s ease',
                      }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.2)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0)'}
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ opacity: 0, transition: 'opacity 0.2s' }}
                          ref={el => { if (el) el.parentElement.onmouseenter = () => el.style.opacity = '1'; el?.parentElement?.addEventListener('mouseleave', () => { if(el) el.style.opacity = '0'; }); }}
                        >
                          <circle cx="11" cy="11" r="7" stroke="white" strokeWidth="2" />
                          <path d="M16 16l4 4" stroke="white" strokeWidth="2" strokeLinecap="round" />
                          <path d="M11 8v6M8 11h6" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
                {lightboxIdx !== null && (
                  <PhotoLightbox src={EVIDENCE_PHOTOS[lightboxIdx]} onClose={() => setLightboxIdx(null)} />
                )}
              </div>
            )}
          </div>

          {/* Right */}
          <div style={{ width: 220, display: 'flex', flexDirection: 'column', gap: 16, flexShrink: 0 }}>
            {/* Assignment Info */}
            <div style={{ background: 'white', borderRadius: 16, padding: 16 }}>
              <SectionTitle title="ข้อมูลการมอบหมาย" />
              <div style={{ marginTop: 12 }}>
                <p style={{ fontSize: 12, color: GRAY, margin: 0 }}>ผู้รับผิดชอบ</p>
                <p style={{ fontSize: 14, fontWeight: 500, color: BLACK, margin: '2px 0 10px' }}>สมหญิง รักษ์ชุมชน</p>
                <p style={{ fontSize: 12, color: GRAY, margin: 0 }}>วันที่กำหนดส่ง</p>
                <p style={{ fontSize: 14, fontWeight: 500, color: BLACK, margin: '2px 0 0' }}>2 เมษายน 2569</p>
              </div>
              <div style={{ height: 1, background: 'rgba(116,116,128,0.08)', margin: '12px 0' }} />
              <p style={{ fontSize: 10, color: '#8E8E93', margin: 0 }}>สร้างเมื่อ: 01/04/2569 08:00</p>
              <p style={{ fontSize: 10, color: '#8E8E93', margin: '4px 0 0' }}>อัปเดตล่าสุด: 02/04/2569 08:30</p>
            </div>

            {/* Timeline */}
            <div style={{ background: 'white', borderRadius: 16, padding: 16 }}>
              <SectionTitle title="ขั้นตอนการส่งยา" />
              <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column' }}>
                {TIMELINE_STEPS.map((step, i) => {
                  const completed = i <= completedIdx;
                  const isLast = i === TIMELINE_STEPS.length - 1;
                  return (
                    <div key={i} style={{ display: 'flex', gap: 10 }}>
                      {/* Line + Circle */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 24 }}>
                        <div style={{
                          width: 24, height: 24, borderRadius: 12, flexShrink: 0,
                          background: completed ? 'rgba(52,199,89,0.1)' : 'rgba(142,142,147,0.1)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          {completed ? <IconCheckCircleGreen /> : <IconGrayCircle />}
                        </div>
                        {!isLast && (
                          <div style={{
                            width: 1, flex: 1, minHeight: 20,
                            borderLeft: completed ? '2px solid #34C759' : '2px dashed #C7C7CC',
                          }} />
                        )}
                      </div>
                      {/* Text */}
                      <div style={{ paddingBottom: isLast ? 0 : 10 }}>
                        <p style={{ fontSize: 14, fontWeight: 500, color: completed ? BLACK : '#8E8E93', margin: 0, fontFamily: font }}>{step.name}</p>
                        <p style={{ fontSize: 12, color: '#8E8E93', margin: '2px 0 0', fontFamily: font }}>{completed ? step.time : '-'}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   TELEPHARMACY MODAL
   ══════════════════════════════════════════ */
function TeleDropdown({ value, options, onChange, icon, label }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ border: '1px solid rgba(116,116,128,0.08)', borderRadius: 16, padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <img src={icon} alt="" style={{ width: 14, height: 14 }} />
        <span style={{ fontSize: 12, fontFamily: font, color: 'black', lineHeight: '12px' }}>{label}</span>
      </div>
      <div style={{ position: 'relative' }}>
        <div onClick={() => setOpen(!open)} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'rgba(116,116,128,0.08)', borderRadius: 100, padding: '8px 16px',
          backdropFilter: 'blur(2px)', cursor: 'pointer',
        }}>
          <span style={{ fontSize: 14, fontWeight: 500, fontFamily: font, color: 'black', letterSpacing: -0.23, lineHeight: '20px' }}>{value}</span>
          <img src={iconTeleChevron} alt="" style={{ width: 10, height: 6, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
        </div>
        {open && (
          <>
            <div style={{ position: 'fixed', inset: 0, zIndex: 90 }} onClick={() => setOpen(false)} />
            <div className="dropdown-menu" style={{ zIndex: 100 }}>
              {options.map(opt => (
                <div key={opt} className={`dropdown-item${opt === value ? ' active' : ''}`}
                  onClick={() => { onChange(opt); setOpen(false); }}
                >{opt}</div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function TelepharmacyModal({ item, onClose }) {
  if (!item) return null;

  const [contactMethod, setContactMethod] = useState('โทรศัพท์');
  const [contactResult, setContactResult] = useState('ติดต่อได้');
  const [followUpDate, setFollowUpDate] = useState('');

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
        backdropFilter: 'blur(4px)', zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: 700, maxHeight: '90vh', overflowY: 'auto',
          background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(50px)',
          borderRadius: 24, border: '1px solid rgba(255,255,255,0.8)',
          padding: 16, boxShadow: '0 4px 4px rgba(0,0,0,0.1)',
          fontFamily: font, display: 'flex', flexDirection: 'column', gap: 16,
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{
              width: 40, height: 40, borderRadius: 14, flexShrink: 0,
              background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <img src={iconTelePills} alt="" style={{ width: 20, height: 20 }} />
            </div>
            <div>
              <p style={{ fontSize: 16, fontWeight: 700, color: '#1E1B39', margin: 0 }}>บันทึกการให้คำแนะนำ Telepharmacy</p>
              <p style={{ fontSize: 12, color: '#615E83', margin: 0, lineHeight: '16px' }}>งาน: {item.id} - {item.patient}</p>
            </div>
          </div>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: 100, border: 'none', flexShrink: 0, padding: 10,
            backgroundImage: 'linear-gradient(90deg, #F2F2F7, #F2F2F7), linear-gradient(90deg, rgba(142,142,147,0.1), rgba(142,142,147,0.1))',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
          }}>
            <img src={iconTeleXmark} alt="" style={{ width: 8, height: 8 }} />
          </button>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'rgba(116,116,128,0.12)' }} />

        {/* Body - 2 columns */}
        <div style={{ display: 'flex', gap: 16 }}>
          {/* Left */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Patient Info - Blue gradient card */}
            <div style={{
              background: 'linear-gradient(153deg, #3B82F6 0%, #1D4ED8 100%)',
              borderRadius: 16, padding: 16, color: 'white',
              display: 'flex', flexDirection: 'column', gap: 16,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 3, height: 14, borderRadius: 2, background: 'white' }} />
                <span style={{ fontSize: 14, fontWeight: 700 }}>ข้อมูลผู้ป่วย</span>
              </div>
              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <span style={{ fontSize: 12, lineHeight: '12px' }}>ชื่อ</span>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>สมศรี ดีใจ</span>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <span style={{ fontSize: 12, lineHeight: '12px' }}>HN</span>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>HN-650001</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <span style={{ fontSize: 12, lineHeight: '12px' }}>เบอร์โทร</span>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>082-345-6789</span>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <span style={{ fontSize: 12, lineHeight: '12px' }}>VN</span>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>6704010001</span>
                </div>
              </div>
            </div>

            {/* Counseling Record */}
            <div style={{ background: 'white', border: '1px solid white', borderRadius: 16, padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <SectionTitle title="บันทึกการให้คำแนะนำ" />

              <TeleDropdown
                icon={iconTelePhone} label="วิธีติดต่อ"
                value={contactMethod} onChange={setContactMethod}
                options={['โทรศัพท์', 'Video Call', 'LINE', 'อื่นๆ']}
              />

              <TeleDropdown
                icon={iconTelePhoneArrow} label="ผลการติดต่อ"
                value={contactResult} onChange={setContactResult}
                options={['ติดต่อได้', 'ติดต่อไม่ได้', 'ไม่รับสาย', 'หมายเลขผิด']}
              />

              {/* รายละเอียดการให้คำแนะนำ */}
              <div style={{ border: '1px solid rgba(116,116,128,0.08)', borderRadius: 16, padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <img src={iconTeleEcgText} alt="" style={{ width: 11, height: 14 }} />
                  <span style={{ fontSize: 12, fontFamily: font, color: 'black', lineHeight: '12px' }}>รายละเอียดการให้คำแนะนำ</span>
                </div>
                <textarea
                  placeholder={'ระบุรายละเอียดการให้คำแนะนำ เช่น\n- อธิบายวิธีใช้ยาแต่ละตัว\n- ตอบคำถามเกี่ยวกับยา\n- แจ้งข้อควรระวัง\n- ผู้ป่วยเข้าใจดีแล้ว'}
                  style={{
                    width: '100%', height: 140, borderRadius: 16,
                    background: 'rgba(116,116,128,0.08)', padding: '8px 16px',
                    fontSize: 14, fontFamily: font, resize: 'none', border: 'none',
                    outline: 'none', color: '#8E8E93', boxSizing: 'border-box',
                    backdropFilter: 'blur(2px)',
                  }}
                  onFocus={e => e.target.style.color = BLACK}
                />
              </div>

              {/* วันนัดติดตามผล */}
              <div style={{ border: '1px solid rgba(116,116,128,0.08)', borderRadius: 16, padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <img src={iconTeleCalendar} alt="" style={{ width: 16, height: 14 }} />
                  <span style={{ fontSize: 12, fontFamily: font, color: 'black', lineHeight: '12px' }}>วันนัดติดตามผล (ถ้ามี)</span>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type="date" value={followUpDate} onChange={e => setFollowUpDate(e.target.value)}
                    style={{
                      width: '100%', background: 'rgba(116,116,128,0.08)', borderRadius: 100,
                      padding: '8px 16px', border: 'none', outline: 'none', boxSizing: 'border-box',
                      fontSize: 14, fontWeight: 500, fontFamily: font, color: BLACK,
                      backdropFilter: 'blur(2px)', letterSpacing: -0.23,
                      WebkitAppearance: 'none', appearance: 'none',
                    }}
                    placeholder="วว/ดด/ปปปป"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right - Drug list */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ background: 'white', border: '1px solid white', borderRadius: 16, padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <SectionTitle title="รายการยา" />
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 10, color: '#8E8E93', fontFamily: font }}>2 รายการ</span>
                  <IconChevronDown />
                </div>
              </div>

              {/* Drug 1 */}
              <div style={{ border: '1px solid rgba(116,116,128,0.08)', borderRadius: 16, padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                    backgroundImage: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontSize: 14, fontWeight: 500, fontFamily: font,
                  }}>1</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span style={{ fontSize: 14, fontWeight: 500, color: 'black', fontFamily: font }}>Metformin 500 mg</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 12, color: 'black', fontFamily: font }}>รหัสยา: D001</span>
                      <span style={{ fontSize: 12, color: 'black', fontFamily: font }}>จำนวน: 60 เม็ด</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'black', fontFamily: font }}>
                  <span>รหัสยา: D001</span><span>จำนวน: 60 เม็ด</span>
                </div>
                <div style={{ background: 'rgba(116,116,128,0.08)', borderRadius: 16, padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <span style={{ fontSize: 12, color: 'black', fontFamily: font, lineHeight: '12px' }}>วิธีใช้</span>
                  <span style={{ fontSize: 14, fontWeight: 500, color: 'black', fontFamily: font }}>ครั้งละ 1 เม็ด วันละ 2 ครั้ง หลังอาหาร</span>
                </div>
                <span style={{ fontSize: 14, color: '#FF383C', fontFamily: font }}>คำเตือน: อาจมีอาการท้องเสีย</span>
              </div>

              {/* Drug 2 */}
              <div style={{ border: '1px solid rgba(116,116,128,0.08)', borderRadius: 16, padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                    backgroundImage: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontSize: 14, fontWeight: 500, fontFamily: font,
                  }}>2</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span style={{ fontSize: 14, fontWeight: 500, color: 'black', fontFamily: font }}>Glibenclamide 5 mg</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 12, color: 'black', fontFamily: font }}>รหัสยา: D002</span>
                      <span style={{ fontSize: 12, color: 'black', fontFamily: font }}>จำนวน: 30 เม็ด</span>
                    </div>
                  </div>
                </div>
                <div style={{ background: 'rgba(116,116,128,0.08)', borderRadius: 16, padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <span style={{ fontSize: 12, color: 'black', fontFamily: font, lineHeight: '12px' }}>วิธีใช้</span>
                  <span style={{ fontSize: 14, fontWeight: 500, color: 'black', fontFamily: font }}>ครั้งละ 1 เม็ด วันละ 1 ครั้ง ก่อนอาหารเช้า</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom buttons - full width flex 1 */}
        <div style={{ display: 'flex', gap: 16 }}>
          <button onClick={onClose} style={{
            flex: 1, border: '1px solid rgba(120,120,128,0.16)', borderRadius: 100,
            backgroundImage: 'linear-gradient(90deg, rgba(118,118,128,0.12), rgba(118,118,128,0.12)), linear-gradient(90deg, #fff, #fff)',
            padding: '8px 16px', backdropFilter: 'blur(2px)',
            fontSize: 14, fontWeight: 500, color: 'black', fontFamily: font, cursor: 'pointer',
            textAlign: 'center', lineHeight: '20px', letterSpacing: -0.23,
          }}>ยกเลิก</button>
          <button onClick={onClose} style={{
            flex: 1, border: '1px solid white', borderRadius: 100,
            backgroundImage: 'linear-gradient(173deg, #34D65D, #21AB44)',
            padding: '8px 16px', backdropFilter: 'blur(2px)',
            fontSize: 14, fontWeight: 500, color: 'white', fontFamily: font, cursor: 'pointer',
            textAlign: 'center', lineHeight: '20px', letterSpacing: -0.23,
          }}>บันทึกและปิดงาน</button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   TAB: สรุปภาพรวม
   ══════════════════════════════════════════ */
const STATUS_OPTIONS = ['สถานะทั้งหมด', ...Object.keys(STATUS_MAP)];

function TabOverview({ onGoToTelepharmacy }) {
  const { openPatient } = useContext(PatientContext);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('สถานะทั้งหมด');
  const [statusFilterOpen, setStatusFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedJob, setSelectedJob] = useState(null);
  const [hoveredRow, setHoveredRow] = useState(null);

  const pendingTeleCount = TELEPHARMACY_ITEMS.filter(t => t.status === 'รอให้คำแนะนำ').length;

  const STATS = [
    { label: 'งานทั้งหมด', value: '78.5', gradient: 'linear-gradient(148deg, #8B5CF6 0%, #7C3AED 100%)', icon: <FigmaIcon src={iconMedClipboard} /> },
    { label: 'รอแพ็กยา', value: '1,247', gradient: 'linear-gradient(148deg, #3B82F6 0%, #1D4ED8 100%)', icon: <FigmaIcon src={iconMedPills} /> },
    { label: 'กำลังนำส่ง', value: '67.3', gradient: 'linear-gradient(148deg, #34B4E3 0%, #1398D8 100%)', icon: <FigmaIcon src={iconMedTruck} size={26} /> },
    { label: 'ส่งสำเร็จ', value: '438', gradient: 'linear-gradient(148deg, #34D65D 0%, #21AB44 100%)', icon: <FigmaIcon src={iconMedCheck} /> },
    { label: 'ส่งไม่สำเร็จ', value: '23', gradient: 'linear-gradient(180deg, #FF383C 0%, #992224 100%)', icon: <FigmaIcon src={iconMedXCircle} /> },
  ];

  const filteredJobs = JOBS.filter(job => {
    const matchSearch = !searchText ||
      job.patient.includes(searchText) ||
      job.id.toLowerCase().includes(searchText.toLowerCase()) ||
      job.rx.toLowerCase().includes(searchText.toLowerCase());
    const matchStatus = statusFilter === 'สถานะทั้งหมด' || job.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const HEADERS = [
    { label: 'รหัสงาน', align: 'left' },
    { label: 'ผู้ป่วย', align: 'left' },
    { label: 'ที่อยู่', align: 'left' },
    { label: 'ผู้รับผิดชอบ', align: 'left' },
    { label: 'สถานะ', align: 'center' },
    { label: 'วันที่', align: 'center' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}>
        {STATS.map(s => (
          <StatCard key={s.label} label={s.label} value={s.value} gradient={s.gradient} icon={s.icon} />
        ))}
      </div>

      {/* Alert Banner */}
      <div className="anim-slide-up delay-6" style={{
        background: 'linear-gradient(90deg, rgba(255,56,60,0.1), rgba(255,255,255,0.3))',
        backdropFilter: 'blur(10px)',
        borderRadius: 24, padding: 16,
        boxShadow: '0 4px 4px rgba(0,0,0,0.1)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <IconInfoRed />
            <p style={{ fontSize: 14, fontWeight: 500, color: '#992224', margin: 0, fontFamily: font }}>มี {pendingTeleCount} รายการรอ Telepharmacy</p>
          </div>
          <p style={{ fontSize: 12, color: BLACK, margin: 0, fontFamily: font, width: '100%' }}>กรุณาให้คำแนะนำการใช้ยาแก่ผู้ป่วย</p>
        </div>
        <button className="hover-btn" onClick={onGoToTelepharmacy} style={{
          border: 'none', borderRadius: 100, background: '#992224',
          color: 'white', padding: '4px 10px', fontSize: 12, fontWeight: 600,
          fontFamily: font, cursor: 'pointer', whiteSpace: 'nowrap',
          lineHeight: '20px', letterSpacing: -0.23,
        }}>ดูรายละเอียด</button>
      </div>

      {/* Table Section */}
      <div className="anim-slide-up delay-7" style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Search + Filter */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{
            width: 300, height: 36, display: 'flex', alignItems: 'center', gap: 10,
            background: 'white', borderRadius: 100, padding: '4px 16px',
            border: '1px solid rgba(116,116,128,0.08)', backdropFilter: 'blur(2px)',
          }}>
            <IconSearch />
            <input
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              placeholder="ค้นหา ชื่อ, รหัสงาน, RX Number..."
              style={{
                border: 'none', outline: 'none', flex: 1, fontSize: 12,
                fontFamily: font, color: '#8E8E93', background: 'transparent',
                letterSpacing: -0.23,
              }}
            />
          </div>
          <div style={{ position: 'relative', zIndex: statusFilterOpen ? 100 : 1 }}>
            <div
              onClick={() => setStatusFilterOpen(!statusFilterOpen)}
              style={{
                width: 150, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: 'white', borderRadius: 100, padding: '4px 16px',
                border: '1px solid rgba(120,120,128,0.16)', cursor: 'pointer', backdropFilter: 'blur(2px)',
              }}>
              <span style={{ fontSize: 12, color: BLACK, fontFamily: font, letterSpacing: -0.23 }}>{statusFilter}</span>
              <IconChevronDown />
            </div>
            {statusFilterOpen && (
              <>
                <div className="dropdown-backdrop" onClick={() => setStatusFilterOpen(false)} />
                <div className="dropdown-menu" style={{ width: 180 }}>
                  {STATUS_OPTIONS.map(opt => (
                    <div key={opt}
                      className={`dropdown-item${opt === statusFilter ? ' active' : ''}`}
                      onClick={() => { setStatusFilter(opt); setStatusFilterOpen(false); setCurrentPage(1); }}
                    >{opt}</div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Table */}
        <div style={{ background: 'white', border: '1px solid rgba(255,255,255,0.5)', borderRadius: 16, overflow: 'hidden' }}>
          {/* Header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 2fr 3fr 2fr 1fr 1fr',
            gap: 10, padding: 16, background: 'rgba(139,92,246,0.1)',
          }}>
            {HEADERS.map(h => (
              <span key={h.label} style={{ fontSize: 12, fontWeight: 700, color: BLACK, fontFamily: font, textAlign: h.align }}>{h.label}</span>
            ))}
          </div>

          {/* Rows */}
          {filteredJobs.map((job, i) => (
            <div
              key={i}
              className="hover-row"
              onClick={() => setSelectedJob(job)}
              onMouseEnter={() => setHoveredRow(i)}
              onMouseLeave={() => setHoveredRow(null)}
              style={{
                display: 'grid', gridTemplateColumns: '1fr 2fr 3fr 2fr 1fr 1fr',
                gap: 10, padding: 16, cursor: 'pointer', alignItems: 'center',
                background: hoveredRow === i ? '#F5F3FF' : 'transparent',
                transition: 'background 0.15s ease',
              }}
            >
              {/* รหัสงาน */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: BLACK, fontFamily: font, lineHeight: 'normal' }}>{job.id}</span>
                <span style={{ fontSize: 10, fontWeight: 400, color: BLACK, fontFamily: font, lineHeight: 'normal' }}>{job.rx}</span>
              </div>
              {/* ผู้ป่วย */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, overflow: 'hidden' }}>
                <span onClick={(e) => { e.stopPropagation(); openPatient({ name: job.patient, age: job.age || 45, gender: job.gender || (job.patient?.startsWith('นาย') ? 'ชาย' : 'หญิง'), hn: job.hn || '', phone: job.phone || '', address: job.address || '', group: '', disease: '', team: '', adl: 0, visits: 0, lastVisit: '', outcome: '' }); }} style={{ fontSize: 12, fontWeight: 500, color: BLACK, fontFamily: font, lineHeight: 'normal', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', cursor: 'pointer' }}>{job.patient}</span>
                <span style={{ fontSize: 10, fontWeight: 400, color: BLACK, fontFamily: font, lineHeight: 'normal', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.phone}</span>
              </div>
              {/* ที่อยู่ */}
              <span style={{ fontSize: 12, fontWeight: 500, color: BLACK, fontFamily: font, lineHeight: 'normal' }}>{job.address}</span>
              {/* ผู้รับผิดชอบ */}
              <span style={{ fontSize: 12, fontWeight: 500, color: BLACK, fontFamily: font, lineHeight: 'normal' }}>{job.assignee}</span>
              {/* สถานะ */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <StatusBadge status={job.status} />
              </div>
              {/* วันที่ */}
              <span style={{ fontSize: 12, fontWeight: 400, color: BLACK, fontFamily: font, textAlign: 'center', lineHeight: 'normal' }}>{job.date}</span>
            </div>
          ))}

          {/* Pagination */}
          <Pagination current={currentPage} total={3} onChange={setCurrentPage} totalItems={25} perPage={10} />
        </div>
      </div>

      {/* Job Detail Modal */}
      {selectedJob && <JobDetailModal job={selectedJob} onClose={() => setSelectedJob(null)} />}
    </div>
  );
}

/* ══════════════════════════════════════════
   TAB: Telepharmacy
   ══════════════════════════════════════════ */
const DRUG_DB = {
  'HN001234': [
    { name: 'Metformin 500 mg', code: 'D001', qty: '60 เม็ด', usage: 'วิธีใช้: ครั้งละ 1 เม็ด วันละ 2 ครั้ง หลังอาหาร' },
    { name: 'Glibenclamide 5 mg', code: 'D002', qty: '30 เม็ด', usage: 'ครั้งละ 1 เม็ด วันละ 1 ครั้ง ก่อนอาหารเช้า' },
  ],
  'HN001235': [
    { name: 'Metformin 500 mg', code: 'D001', qty: '60 เม็ด', usage: 'วิธีใช้: ครั้งละ 1 เม็ด วันละ 2 ครั้ง หลังอาหาร' },
    { name: 'Atorvastatin 20 mg', code: 'D003', qty: '30 เม็ด', usage: 'ครั้งละ 1 เม็ด วันละ 1 ครั้ง ก่อนนอน' },
    { name: 'Aspirin 81 mg', code: 'D004', qty: '30 เม็ด', usage: 'ครั้งละ 1 เม็ด วันละ 1 ครั้ง หลังอาหารเช้า' },
  ],
  'HN001236': [
    { name: 'Enalapril 5 mg', code: 'D005', qty: '30 เม็ด', usage: 'ครั้งละ 1 เม็ด วันละ 1 ครั้ง เช้า' },
    { name: 'HCTZ 25 mg', code: 'D006', qty: '30 เม็ด', usage: 'ครั้งละ 1 เม็ด วันละ 1 ครั้ง เช้า' },
    { name: 'Morphine 10 mg', code: 'D007', qty: '20 เม็ด', usage: 'ครั้งละ 1 เม็ด ทุก 4-6 ชม. เมื่อปวด' },
  ],
  'HN001240': [
    { name: 'Amlodipine 5 mg', code: 'D008', qty: '30 เม็ด', usage: 'ครั้งละ 1 เม็ด วันละ 1 ครั้ง เช้า' },
    { name: 'Ferrous fumarate 200 mg', code: 'D009', qty: '30 เม็ด', usage: 'ครั้งละ 1 เม็ด วันละ 1 ครั้ง หลังอาหาร' },
  ],
};
const DEFAULT_DRUGS = DRUG_DB['HN001234'];

const TELE_CARDS = MED_TELEPHARMACY
  .filter(t => t.status === 'รอให้คำแนะนำ' || t.status === 'ให้คำแนะนำแล้ว')
  .slice(0, 4)
  .map(t => {
    const p = getPatient(t.hn);
    return {
      id: t.id, patient: p?.name || '-', hn: t.hn.replace('HN00', ''), vn: '6704010002',
      phone: p?.phone || '-', date: '2 เม.ย. 2569 11:30',
      drugs: DRUG_DB[t.hn] || DEFAULT_DRUGS,
    };
  });

function TeleCard({ item, onCall, onCounsel, onDetail }) {
  const { openPatient } = useContext(PatientContext);
  // Detect gender from name prefix
  const isMale = item.patient?.startsWith('นาย');
  const patientAge = isMale ? 65 : 60; // estimate from patient names
  const avatarSrc = getAvatar(patientAge, isMale ? 'ชาย' : 'หญิง');
  return (
    <div className="hover-card anim-slide-up" style={{
      ...cardStyle, display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <img src={avatarSrc} alt="" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
          <div>
            <p onClick={(e) => { e.stopPropagation(); openPatient({ name: item.patient, age: patientAge, gender: isMale ? 'ชาย' : 'หญิง', hn: item.hn || '', phone: item.phone || '', address: '', group: '', disease: '', team: '', adl: 0, visits: 0, lastVisit: '', outcome: '' }); }} style={{ fontSize: 16, fontWeight: 700, color: BLACK, margin: 0, fontFamily: font, cursor: 'pointer' }}>{item.patient}</p>
            <p style={{ fontSize: 11, color: GRAY, margin: '2px 0 0', fontFamily: font }}>
              รหัสงาน: {item.id} &nbsp; HN: {item.hn} &nbsp; VN: {item.vn} &nbsp; {item.phone}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <button className="hover-btn" onClick={onCall} style={{
            border: 'none', borderRadius: 100, cursor: 'pointer',
            background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
            color: 'white', padding: '6px 14px', fontSize: 11, fontWeight: 500, fontFamily: font,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <img src={iconMedPhone} alt="" style={{ width: 12, height: 12 }} />
            โทรติดต่อ
          </button>
          <button className="hover-btn" onClick={onCounsel} style={{
            border: 'none', borderRadius: 100, cursor: 'pointer',
            background: 'linear-gradient(135deg, #34D65D, #21AB44)',
            color: 'white', padding: '6px 14px', fontSize: 11, fontWeight: 500, fontFamily: font,
          }}>ให้คำแนะนำ</button>
          <button className="hover-btn" onClick={onDetail} style={{
            border: '1px solid rgba(116,116,128,0.2)', borderRadius: 100,
            background: 'white', color: BLACK, padding: '6px 14px',
            fontSize: 11, fontWeight: 500, fontFamily: font, cursor: 'pointer',
          }}>ดูรายละเอียด</button>
        </div>
      </div>

      {/* Drug cards - horizontal scroll */}
      <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4 }}>
        {item.drugs.map((d, i) => (
          <div key={i} style={{
            minWidth: 220, background: 'rgba(116,116,128,0.04)', borderRadius: 16,
            padding: 12, display: 'flex', flexDirection: 'column', gap: 6,
            border: '1px solid rgba(116,116,128,0.06)',
          }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{
                width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 500, color: 'white', fontFamily: font,
              }}>{i + 1}</div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 500, color: BLACK, margin: 0, fontFamily: font }}>{d.name}</p>
                <p style={{ fontSize: 10, color: GRAY, margin: '1px 0 0', fontFamily: font }}>
                  รหัสยา: {d.code} &nbsp; จำนวน: {d.qty}
                </p>
              </div>
            </div>
            <p style={{ fontSize: 11, color: GRAY, margin: 0, fontFamily: font }}>{d.usage}</p>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <img src={iconMedClock} alt="" style={{ width: 14, height: 14, opacity: 0.5 }} />
        <span style={{ fontSize: 11, color: '#8E8E93', fontFamily: font }}>ส่งยาเมื่อ: {item.date}</span>
      </div>
    </div>
  );
}

function TabTelepharmacy() {
  const [selectedJob, setSelectedJob] = useState(null);
  const [counselingItem, setCounselingItem] = useState(null);
  const { startCall } = useContext(CallContext);

  const TELE_STATS = [
    { label: 'รอให้คำแนะนำ', value: '438', sub: 'รายการ', gradient: 'linear-gradient(148deg, #8B5CF6 0%, #7C3AED 100%)', icon: <FigmaIcon src={iconMedClipboard} /> },
    { label: 'เกิน SLA 24 ชม.', value: '438', sub: 'ต้องติดตามด่วน', gradient: 'linear-gradient(148deg, #E8802A 0%, #D97706 100%)', icon: <FigmaIcon src={iconMedWarning} /> },
    { label: 'เสร็จสิ้นวันนี้', value: '438', sub: 'รายการ', gradient: 'linear-gradient(148deg, #34D65D 0%, #21AB44 100%)', icon: <FigmaIcon src={iconMedCheckCircle} /> },
    { label: 'รวมสัปดาห์นี้', value: '1,247', sub: '', gradient: 'linear-gradient(148deg, #3B82F6 0%, #1D4ED8 100%)', icon: <FigmaIcon src={iconMedArrowFwd} /> },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {TELE_STATS.map(s => (
          <div key={s.label} className="hover-stat anim-slide-up" style={{
            background: s.gradient, border: '1px solid rgba(255,255,255,0.7)',
            borderRadius: 24, padding: 16, color: 'white', fontFamily: font,
            height: 130, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            boxShadow: '0 4px 4px rgba(0,0,0,0.1)',
          }}>
            <div style={{ width: 40, height: 40, borderRadius: 14, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {s.icon}
            </div>
            <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: 0.22 }}>{s.label}</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ fontSize: 26, fontWeight: 700, lineHeight: '26px' }}>{s.value}</span>
              {s.sub && <span style={{ fontSize: 12 }}>{s.sub}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Section title */}
      <p style={{ fontSize: 16, fontWeight: 700, color: BLACK, fontFamily: font, margin: 0 }}>รายการรอดำเนินการ</p>

      {/* Cards */}
      {TELE_CARDS.map((item, i) => (
        <TeleCard
          key={i}
          item={item}
          onCall={() => startCall({ name: item.patient, hn: item.hn, phone: item.phone })}
          onCounsel={() => setCounselingItem(TELEPHARMACY_ITEMS[0])}
          onDetail={() => setSelectedJob(JOBS[0])}
        />
      ))}

      {/* Modals */}
      {selectedJob && <JobDetailModal job={selectedJob} onClose={() => setSelectedJob(null)} />}
      {counselingItem && <TelepharmacyModal item={counselingItem} onClose={() => setCounselingItem(null)} />}
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════ */
export default function Medication() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div style={{ fontFamily: font, display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Hero / Header */}
      <div className="anim-slide-up" style={{
        borderRadius: 24, position: 'relative',
        boxShadow: '0 4px 4px rgba(0,0,0,0.1)',
        minHeight: 130,
      }}>
        {/* Background layer */}
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
          <div style={{ position: 'absolute', right: 0, top: 30, width: 200, height: 200 }}>
            <img src={imgMedicine3d} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
        </div>

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 1, padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
          <div>
            <p style={{ fontSize: 16, fontWeight: 500, color: 'black', fontFamily: font, margin: 0 }}>ติดตาม</p>
            <p style={{
              fontSize: 24, fontWeight: 700, fontFamily: font, margin: '2px 0 0',
              background: 'linear-gradient(90deg, #245ADE, #8B5CF6)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>ระบบส่งยาที่บ้าน</p>
          </div>

          {/* Tab pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
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
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 0 && <TabOverview onGoToTelepharmacy={() => setActiveTab(1)} />}
      {activeTab === 1 && <TabTelepharmacy />}
    </div>
  );
}
