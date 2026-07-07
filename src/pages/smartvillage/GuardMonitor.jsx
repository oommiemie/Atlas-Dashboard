/* ═══ Smart Village — Guard Portal — spec 5.6 login + 5.7 จอมอนิเตอร์ ═══
   Layout แบบจอ monitoring: รายชื่อบ้านซ้าย + แผนที่เต็มจอขวา + การ์ดเหตุลอยบนแผนที่
   Design language เดียวกับ dashboard หลัก (theme สว่าง) */
import { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  SV_GUARDS, getVillage, housesOf, devicesOfHouse, getHouse, getDevice, alertsOfVillage,
} from '../../data/smartVillage';
import { font, BLACK, GRAY, GRAY2, PURPLE, GREEN, RED, ORANGE, ElapsedSince, SVMap, SVMap3D } from './shared';
import {
  IconShield, IconMoon, IconPlayerPlayFilled, IconAlertTriangleFilled, IconMapPin, IconInfoCircle,
  IconAntennaBars5, IconCheck, IconPlayerStopFilled, IconUsers, IconNavigation, IconPhone,
  IconAlertTriangle, IconBellRinging, IconVolume, IconVolumeOff, IconUserShield, IconX,
  IconCircleCheck, IconHome, IconHistory,
} from '@tabler/icons-react';

const BORDER = '1px solid rgba(255,255,255,0.75)';
const GREEN_DARK = '#1D9A46';
/* liquid-glass tokens เดียวกับ dashboard หลัก (.gc / body) */
const BG = 'rgba(116,116,128,0.07)'; // กล่องย่อยในการ์ด
const PAGE_BG = {
  background: '#EAE6FF',
  backgroundImage: `
    radial-gradient(ellipse 120% 80% at 15% 10%, rgba(162,155,254,0.35) 0%, transparent 50%),
    radial-gradient(ellipse 80% 60% at 85% 85%, rgba(116,185,255,0.25) 0%, transparent 45%),
    radial-gradient(ellipse 60% 50% at 50% 0%, rgba(232,229,255,0.5) 0%, transparent 40%)`,
};
const GLASS = {
  background: 'rgba(255,255,255,0.72)',
  backdropFilter: 'blur(30px) saturate(180%)',
  border: '1.5px solid rgba(255,255,255,0.85)',
  boxShadow: '0 4px 32px rgba(108,92,231,0.05)',
};

/* ── หน้า login รปภ. (spec 5.6) ── */
function GuardLogin({ onLogin }) {
  const [u, setU] = useState('vlg001-somsak');
  const [p, setP] = useState('••••••••••');
  const [error, setError] = useState(null);

  const submit = () => {
    const guard = SV_GUARDS.find(g => g.username === u.trim());
    if (!guard || !p) { setError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'); return; }
    if (guard.status === 'ระงับ') { setError('บัญชีถูกระงับ กรุณาติดต่อนิติบุคคล/ผู้ดูแลระบบ'); return; }
    onLogin(guard);
  };

  const inputStyle = (err) => ({
    width: '100%', height: 48, borderRadius: 14, border: `1.5px solid ${err ? 'rgba(255,56,60,0.5)' : 'rgba(13,10,44,0.12)'}`,
    background: 'rgba(255,255,255,0.7)', color: BLACK, fontSize: 15, padding: '0 16px', outline: 'none', boxSizing: 'border-box',
  });

  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div className="anim-scale-in" style={{ width: 400, maxWidth: '92vw', ...GLASS, borderRadius: 28, padding: '36px 32px', textAlign: 'center', boxShadow: '0 12px 40px rgba(108,92,231,0.14)' }}>
        <div style={{
          width: 64, height: 64, borderRadius: 20, margin: '0 auto 14px',
          background: 'linear-gradient(180deg,#8B81F2,#6658E1)', boxShadow: '0 8px 28px rgba(102,88,225,0.35)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}><IconShield size={28} color="white" style={{ flexShrink: 0 }} /></div>
        <div style={{ fontSize: 20, fontWeight: 800, color: BLACK, fontFamily: font }}>Smart Village — จอเฝ้าระวัง</div>
        <div style={{ fontSize: 13, color: GRAY, fontFamily: font, marginTop: 4 }}>ระบบเฝ้าระวังและแจ้งเหตุประจำหมู่บ้าน</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 24, textAlign: 'left' }}>
          <div>
            <div style={{ fontSize: 12.5, color: GRAY, fontFamily: font, marginBottom: 6 }}>ชื่อผู้ใช้</div>
            <input value={u} onChange={e => { setU(e.target.value); setError(null); }} style={{ ...inputStyle(error), fontFamily: 'Inter' }} />
          </div>
          <div>
            <div style={{ fontSize: 12.5, color: GRAY, fontFamily: font, marginBottom: 6 }}>รหัสผ่าน</div>
            <input type="password" value={p} onChange={e => { setP(e.target.value); setError(null); }} onKeyDown={e => e.key === 'Enter' && submit()} style={inputStyle(error)} />
          </div>
          {error && (
            <div role="alert" className="anim-slide-up" style={{
              display: 'flex', gap: 8, alignItems: 'flex-start', background: 'rgba(255,56,60,0.08)',
              border: '1px solid rgba(255,56,60,0.3)', borderRadius: 12, padding: '10px 14px',
              fontSize: 12.5, color: '#D0342C', fontFamily: font, lineHeight: 1.55,
            }}>
              <IconAlertTriangle size={14} color="#D0342C" style={{ flexShrink: 0 }} /><span>{error}</span>
            </div>
          )}
          <button className="hover-btn" onClick={submit} style={{
            height: 52, borderRadius: 100, border: 'none', cursor: 'pointer', marginTop: 6,
            background: 'linear-gradient(135deg,#4438AD,#6658E1 50%,#8B5CF6)', color: 'white',
            fontSize: 16, fontWeight: 700, fontFamily: font, boxShadow: '0 8px 24px rgba(102,88,225,0.35)',
          }}>เข้าสู่ระบบ</button>
          <div style={{ fontSize: 11.5, color: GRAY2, fontFamily: font, textAlign: 'center', lineHeight: 1.7, marginTop: 4 }}>
            ลืมรหัสผ่าน? ติดต่อนิติบุคคล/ผู้ดูแลระบบ Atlas เท่านั้น<br />(ไม่มีการรีเซ็ตด้วยตนเอง)
          </div>
          <div style={{ fontSize: 10.5, color: GRAY2, fontFamily: font, textAlign: 'center', lineHeight: 1.7, borderTop: BORDER, paddingTop: 10 }}>
            demo: <span style={{ fontFamily: 'Inter' }}>vlg001-somsak</span> (ใช้งาน) · <span style={{ fontFamily: 'Inter' }}>vlg003-prayut</span> (ถูกระงับ) · username อื่น = รหัสผิด
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── จุด "เริ่มกะ" = user interaction เปิดเสียง (NFR ข้อเสียง) ── */
function StartShift({ guardName, onStart }) {
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div className="anim-scale-in" style={{ textAlign: 'center', maxWidth: 460, ...GLASS, borderRadius: 28, padding: '40px 36px', boxShadow: '0 12px 40px rgba(108,92,231,0.14)' }}>
        <IconMoon size={44} color={PURPLE} style={{ flexShrink: 0 }} />
        <div style={{ fontSize: 22, fontWeight: 800, color: BLACK, fontFamily: font, marginTop: 10 }}>สวัสดี {guardName}</div>
        <div style={{ fontSize: 13.5, color: GRAY, fontFamily: font, marginTop: 8, lineHeight: 1.8 }}>
          กด "เริ่มกะเฝ้าระวัง" เพื่อเปิดเสียงแจ้งเหตุ (siren)<br />
          เบราว์เซอร์ต้องการการกดจากผู้ใช้ก่อนจึงเล่นเสียงได้ — ปุ่มนี้คือจุดเปิดเสียงของทั้งกะ
        </div>
        <button className="hover-btn" onClick={onStart} style={{
          marginTop: 20, height: 58, padding: '0 40px', borderRadius: 100, border: 'none', cursor: 'pointer',
          background: 'linear-gradient(135deg,#34C759,#19A589)', color: 'white',
          fontSize: 17, fontWeight: 800, fontFamily: font, boxShadow: '0 8px 28px rgba(52,199,89,0.35)',
        }}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><IconPlayerPlayFilled size={17} style={{ flexShrink: 0 }} /> เริ่มกะเฝ้าระวัง · เปิดเสียง</span></button>
      </div>
    </div>
  );
}

/* ── การ์ดเหตุ active — ลอยบนแผนที่ ภาวะสำคัญที่สุดของทั้งระบบ ── */
function AlertPanel({ alert, house, device, phase, onAck, onClose, onNavigate }) {
  const [closeResult, setCloseResult] = useState('');
  const [closing, setClosing] = useState(false);
  /* compact โดย default — ไม่บังแผนที่ กดขยายเมื่อต้องดูรายชื่อ/โทร/ปิดเหตุ */
  const [expanded, setExpanded] = useState(false);
  const isNew = phase === 'new';
  return (
    <div className="anim-slide-up" style={{
      background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(24px) saturate(180%)', borderRadius: 20, overflow: 'hidden', pointerEvents: 'auto',
      boxShadow: '0 16px 48px rgba(108,92,231,0.3)',
      border: `2px solid ${isNew ? '#FF383C' : ORANGE}`,
      animation: isNew ? 'svSirenGlow 1.2s ease-in-out infinite' : 'none',
    }}>
      {/* header สีตามภาวะ — ลำดับข้อมูล: สถานะ+เวลาที่ผ่าน → บ้าน → ตำแหน่ง → action */}
      <div style={{
        padding: '12px 16px 13px',
        background: isNew ? 'linear-gradient(125deg,#D0262B,#FF5A3C)' : 'linear-gradient(125deg,#C96A12,#E8802A)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <IconAlertTriangleFilled size={14} color="white" style={{ flexShrink: 0, animation: isNew ? 'svShake 0.9s infinite' : 'none' }} />
          <span style={{ fontSize: 11.5, fontWeight: 800, color: 'rgba(255,255,255,0.95)', fontFamily: font }}>{isNew ? 'ตรวจพบการล้ม' : 'รับทราบแล้ว — กำลังช่วยเหลือ'}</span>
          <ElapsedSince minAgo={alert.minAgo} style={{ marginLeft: 'auto', fontSize: 11.5, fontWeight: 800, color: 'white', background: 'rgba(0,0,0,0.16)', borderRadius: 100, padding: '3px 10px', flexShrink: 0 }} />
        </div>
        <div style={{ fontSize: 18, fontWeight: 900, color: 'white', fontFamily: font, lineHeight: 1.3, marginTop: 5 }}>
          บ้าน {house.no}{house.nickname && <span style={{ fontSize: 12.5, fontWeight: 500, color: 'rgba(255,255,255,0.85)' }}> · {house.nickname}</span>}
        </div>
        <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.88)', fontFamily: font, marginTop: 2 }}>
          <IconMapPin size={12} color="rgba(255,255,255,0.88)" style={{ verticalAlign: '-2px' }} /> {device.attach.kind === 'person' ? `ติดตัว ${device.attach.residentName}` : device.attach.location} · เกิดเหตุ {alert.time} น.
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          {isNew ? (
            <button className="hover-btn" onClick={onAck} style={{
              flex: 1, height: 42, borderRadius: 100, border: 'none', cursor: 'pointer',
              background: 'white', color: '#C62828', fontSize: 13.5, fontWeight: 900, fontFamily: font,
              boxShadow: '0 6px 18px rgba(0,0,0,0.25)',
            }}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><IconCheck size={15} style={{ flexShrink: 0 }} /> รับทราบ กำลังไปช่วย</span></button>
          ) : (
            <button className="hover-btn" onClick={() => setExpanded(e => !e)} style={{
              flex: 1, height: 38, borderRadius: 100, border: '1.5px solid rgba(255,255,255,0.55)', cursor: 'pointer',
              background: 'rgba(255,255,255,0.14)', color: 'white', fontSize: 12.5, fontWeight: 700, fontFamily: font,
            }}>{expanded ? 'ย่อ' : 'จัดการเหตุ'}</button>
          )}
          {isNew && (
            <button className="hover-btn" onClick={() => setExpanded(e => !e)} style={{
              height: 42, padding: '0 15px', borderRadius: 100, border: '1.5px solid rgba(255,255,255,0.55)', cursor: 'pointer',
              background: 'rgba(255,255,255,0.14)', color: 'white', fontSize: 12.5, fontWeight: 700, fontFamily: font, flexShrink: 0,
            }}>{expanded ? 'ย่อ' : 'รายละเอียด'}</button>
          )}
        </div>
      </div>

      {/* ภาพรวมขั้นตอน — เห็นตลอดว่าอยู่ขั้นไหน ต้องทำอะไรต่อ */}
      {(() => {
        const step = isNew ? 0 : closing ? 2 : 1;
        const STEPS = ['รับทราบเหตุ', 'เข้าช่วยเหลือ', 'ปิดเหตุ + บันทึกผล'];
        const HINTS = [
          <>กด <b>รับทราบ</b> — siren หยุด ครอบครัวเห็นว่ากำลังไป</>,
          <>ไปบ้าน {house.no} · โทรผู้ติดต่อ · เสร็จแล้ว<b>ปิดเหตุ</b></>,
          <>เลือกผลแล้วกด<b>ยืนยัน</b> — ส่งถึงครอบครัวทันที</>,
        ];
        return (
          <div style={{ padding: '11px 16px', background: 'rgba(255,255,255,0.7)', borderBottom: '1px solid rgba(13,10,44,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {STEPS.map((s, i) => (
                <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none', minWidth: 0 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, width: 76, flexShrink: 0 }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      background: i < step ? GREEN : i === step ? (isNew ? '#D0262B' : '#C96A12') : 'rgba(13,10,44,0.08)',
                      color: i <= step ? 'white' : GRAY2,
                      fontSize: 11.5, fontWeight: 800, fontFamily: font,
                      animation: i === step ? 'svBlink 1.6s infinite' : 'none',
                    }}>{i < step ? <IconCheck size={13} style={{ flexShrink: 0 }} /> : i + 1}</div>
                    <div style={{ fontSize: 9.5, fontWeight: i === step ? 800 : 600, color: i === step ? BLACK : i < step ? GREEN_DARK : GRAY2, fontFamily: font, textAlign: 'center', lineHeight: 1.3 }}>{s}</div>
                  </div>
                  {i < STEPS.length - 1 && <div style={{ flex: 1, height: 2, borderRadius: 2, background: i < step ? GREEN : 'rgba(13,10,44,0.08)', margin: '0 2px', marginBottom: 16 }} />}
                </div>
              ))}
            </div>
            <div style={{ marginTop: 7, fontSize: 11.5, color: GRAY, fontFamily: font, lineHeight: 1.6, background: BG, borderRadius: 10, padding: '6px 11px' }}>
              <b style={{ color: isNew ? '#D0342C' : '#C96A12' }}>ตอนนี้:</b> {HINTS[step]}
            </div>
          </div>
        );
      })()}

      {expanded && (
      <div style={{ padding: '12px 16px 14px', display: 'flex', flexDirection: 'column', gap: 11 }}>
        {/* บริบทเหตุ — บรรทัดเดียวพอ */}
        {(device.attach.kind === 'house' || alert.recovered) && (
          <div style={{ fontSize: 11, color: GRAY2, fontFamily: font, lineHeight: 1.6 }}>
            {device.attach.kind === 'house' && <><IconInfoCircle size={12} color={GRAY2} style={{ verticalAlign: '-2px' }} /> เรดาร์ระบุห้อง ไม่ระบุตัวบุคคล</>}
            {device.attach.kind === 'house' && alert.recovered && ' · '}
            {alert.recovered && <span style={{ color: GREEN_DARK }}>เครื่องรายงานกลับสู่ปกติ — รอคนยืนยันปิด</span>}
          </div>
        )}

        {/* คนในบ้าน */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: GRAY2, fontFamily: font, marginBottom: 4 }}>คนในบ้าน ({house.residents.length})</div>
          {house.residents.map(r => (
            <div key={r.id} style={{ fontSize: 13, color: BLACK, fontFamily: font, lineHeight: 1.6 }}>
              <b>{r.name}</b> · {r.age} ปี{r.note && <span style={{ color: '#C96A12' }}> — {r.note}</span>}
            </div>
          ))}
        </div>

        {/* โทรตามลำดับ */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: GRAY2, fontFamily: font, marginBottom: 4 }}>โทรตามลำดับ</div>
          {house.contacts.length === 0 ? (
            <div style={{ fontSize: 12.5, color: '#C96A12', fontFamily: font }}>ไม่มีผู้ติดต่อ — โทรนิติบุคคล/ทีม central</div>
          ) : house.contacts.map((c, i) => (
            <a key={c.id} href={`tel:${c.phone}`} className="hover-btn" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', padding: '4px 0' }}>
              <span style={{ fontSize: 12, fontWeight: 800, fontFamily: font, color: i === 0 ? '#D0342C' : GRAY2, width: 15, flexShrink: 0 }}>{i + 1}.</span>
              <span style={{ fontSize: 13, fontWeight: i === 0 ? 700 : 500, fontFamily: font, color: BLACK, flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {c.name} <span style={{ fontWeight: 400, fontSize: 11, color: GRAY2 }}>({c.relation})</span>
              </span>
              <span className="num" style={{ fontSize: 13, fontWeight: 800, color: i === 0 ? '#D0342C' : PURPLE, flexShrink: 0 }}><IconPhone size={12} style={{ verticalAlign: '-2px' }} /> {c.phone}</span>
            </a>
          ))}
        </div>

        {/* action หลัก */}
        {!closing && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="hover-btn" onClick={onNavigate} style={{
              flex: 1, height: 40, borderRadius: 100, border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg,#4438AD,#6658E1 50%,#8B5CF6)', color: 'white',
              fontSize: 12.5, fontWeight: 700, fontFamily: font, boxShadow: '0 4px 14px rgba(102,88,225,0.3)',
            }}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><IconNavigation size={14} style={{ flexShrink: 0 }} /> นำทาง</span></button>
            {phase === 'acked' && (
              <button className="hover-btn" onClick={() => setClosing(true)} style={{
                flex: 1, height: 40, borderRadius: 100, border: `1.5px solid ${ORANGE}`, cursor: 'pointer',
                background: 'rgba(255,255,255,0.8)', color: '#C96A12', fontSize: 12.5, fontWeight: 800, fontFamily: font,
              }}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><IconPlayerStopFilled size={13} style={{ flexShrink: 0 }} /> ปิดเหตุ…</span></button>
            )}
          </div>
        )}
        {phase === 'acked' && closing && (
          <div className="anim-expand" style={{ marginTop: 12, background: BG, borderRadius: 14, padding: 14 }}>
            <div style={{ fontSize: 12.5, fontWeight: 800, color: BLACK, fontFamily: font, marginBottom: 8 }}>ปิดเหตุ — เลือกผล</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['ช่วยเหลือแล้ว', 'แจ้งเตือนผิดพลาด', 'เหตุทดสอบ'].map(r => (
                <button key={r} onClick={() => setCloseResult(r)} className="hover-btn" style={{
                  height: 38, padding: '0 16px', borderRadius: 100, cursor: 'pointer', fontSize: 12.5, fontWeight: 700, fontFamily: font,
                  border: `1.5px solid ${closeResult === r ? PURPLE : 'rgba(13,10,44,0.12)'}`,
                  background: closeResult === r ? PURPLE : 'rgba(255,255,255,0.8)',
                  color: closeResult === r ? 'white' : GRAY,
                }}>{r}</button>
              ))}
            </div>
            <input placeholder="โน้ตสั้นๆ เช่น อาการ ผู้ที่มาช่วย การส่งต่อ… (ไม่บังคับ)" style={{
              width: '100%', height: 40, borderRadius: 10, border: '1.5px solid rgba(13,10,44,0.1)', boxSizing: 'border-box',
              background: 'rgba(255,255,255,0.8)', color: BLACK, fontSize: 12.5, fontFamily: font, padding: '0 12px', outline: 'none', marginTop: 10,
            }} />
            <button
              className="hover-btn" onClick={() => closeResult && onClose(closeResult)}
              style={{
                marginTop: 10, height: 42, width: '100%', borderRadius: 100, border: 'none',
                cursor: closeResult ? 'pointer' : 'not-allowed', opacity: closeResult ? 1 : 0.45,
                background: 'linear-gradient(135deg,#4438AD,#6658E1 50%,#8B5CF6)', color: 'white', fontSize: 13.5, fontWeight: 800, fontFamily: font,
              }}
            >ยืนยันปิดเหตุ</button>
          </div>
        )}
      </div>
      )}
    </div>
  );
}

export default function GuardMonitor({ onExit, standalone = false }) {
  const [guard, setGuard] = useState(null);
  const [screen, setScreen] = useState('login'); // login → shift → monitor
  const [muted, setMuted] = useState(false);
  const [map3d, setMap3d] = useState(true); // ผัง 3D (footprint OSM extrude) | แผนที่ 2D หมุด
  const [selected, setSelected] = useState(null); // house id ที่เลือกจาก sidebar
  const [route, setRoute] = useState(null); // เส้นทางนำทาง ป้อมยาม → บ้าน (OSRM)
  /* วงจรเหตุรายตัว: ใหม่ → รับทราบแล้ว → ปิดแล้ว — เก็บ override เป็น map ต่อ alert id */
  const [alertStates, setAlertStates] = useState({});
  const [closedResults, setClosedResults] = useState({});

  const villageId = guard ? guard.villageId : 'vlg-001';
  const village = getVillage(villageId);
  const houses = housesOf(villageId);
  const monitored = houses.filter(h => devicesOfHouse(h.id).length > 0);

  const allAlerts = alertsOfVillage(villageId);
  const phaseOf = (a) => alertStates[a.id] || (a.status === 'ใหม่' ? 'new' : a.status === 'รับทราบแล้ว' ? 'acked' : 'closed');
  const actives = allAlerts.filter(a => a.status !== 'ปิดแล้ว').sort((x, y) => (x.minAgo ?? 0) - (y.minAgo ?? 0));
  const openAlerts = actives.filter(a => phaseOf(a) !== 'closed');
  const closedNow = actives.filter(a => phaseOf(a) === 'closed');
  const unacked = openAlerts.filter(a => phaseOf(a) === 'new').length;

  const devTotal = monitored.flatMap(h => devicesOfHouse(h.id));
  const online = devTotal.filter(d => d.online).length;
  const todayCount = allAlerts.filter(a => a.date === 'วันนี้').length;
  const history = allAlerts.filter(a => a.status === 'ปิดแล้ว');

  const ack = (id) => setAlertStates(s => ({ ...s, [id]: 'acked' }));
  const close = (id, result) => {
    setAlertStates(s => ({ ...s, [id]: 'closed' }));
    setClosedResults(r => ({ ...r, [id]: result }));
  };

  const houseAlertOf = (houseId) => openAlerts.find(a => a.houseId === houseId);

  /* นำทางจริง: ขอเส้นทางถนนจาก OSRM (ฟรี) ป้อมยาม → บ้าน
     ไม่วาดเส้นตรงมั่ว — รอเส้นทางจริงเท่านั้น คำนวณไม่ได้ก็บอกตรง ๆ + ส่งต่อ Google Maps */
  const navigateTo = async (h) => {
    const gp = village.guardPost;
    if (!gp) return;
    const base = { houseNo: h.no, lat: h.lat, lng: h.lng, distance: null, duration: null };
    setRoute({ ...base, coords: [], status: 'loading' });
    try {
      const r = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${gp.lng},${gp.lat};${h.lng},${h.lat}?overview=full&geometries=geojson`,
        { signal: AbortSignal.timeout(9000) },
      );
      const j = await r.json();
      const rt = j.routes && j.routes[0];
      if (!rt) throw new Error('no route');
      /* OSRM snap ปลายทางเข้าถนน — ต่อหัว/ท้ายให้แตะป้อมยามกับตัวบ้านจริง */
      const coords = [[gp.lng, gp.lat], ...rt.geometry.coordinates, [h.lng, h.lat]];
      setRoute({ ...base, coords, distance: rt.distance, duration: rt.duration, status: 'ok' });
    } catch {
      setRoute({ ...base, coords: [], status: 'error' });
    }
  };
  const statusOf = (h) => {
    const al = houseAlertOf(h.id);
    if (al) return { color: RED, label: phaseOf(al) === 'new' ? 'ตรวจพบการล้ม!' : 'กำลังช่วยเหลือ…', alert: al };
    if (devicesOfHouse(h.id).some(d => !d.online)) return { color: ORANGE, label: 'อุปกรณ์ offline', alert: null };
    return { color: GREEN, label: 'ปกติ', alert: null };
  };
  /* เรียง: มีเหตุ → offline → ปกติ */
  const sorted = [...monitored].sort((a, b) => {
    const rank = (h) => { const s = statusOf(h); return s.color === RED ? 0 : s.color === ORANGE ? 1 : 2; };
    return rank(a) - rank(b);
  });

  const mapPoints = monitored.map(h => {
    const devs = devicesOfHouse(h.id);
    const s = statusOf(h);
    return {
      lat: h.lat, lng: h.lng, color: s.color, big: !!s.alert, status: s.alert ? 'alert' : 'ok',
      name: `บ้าน ${h.no}${h.nickname ? ' · ' + h.nickname : ''}`,
      subHtml: `<div style="font-size:11.5px;color:#615E83;">${s.label} · อุปกรณ์ ${devs.filter(d => d.online).length}/${devs.length} online</div>`,
    };
  });

  const segBtn = (active) => ({
    height: 32, padding: '0 14px', borderRadius: 100, cursor: 'pointer',
    fontSize: 12, fontWeight: 700, fontFamily: font,
    border: active ? '1px solid transparent' : '1px solid rgba(13,10,44,0.1)',
    background: active ? 'linear-gradient(180deg,#8B81F2,#6658E1)' : 'rgba(255,255,255,0.72)',
    color: active ? 'white' : GRAY,
    boxShadow: active ? '0 4px 12px rgba(102,88,225,0.3)' : '0 1px 4px rgba(13,10,44,0.06)',
    backdropFilter: 'blur(12px)',
  });

  const selHouse = selected ? monitored.find(h => h.id === selected) : null;

  /* portal ไป document.body — จอเฝ้าระวังต้องเต็ม viewport จริง ไม่โดน .main-inner clip */
  return createPortal(
    <div className="anim-backdrop" style={{
      position: 'fixed', inset: 0, zIndex: 3000, display: 'flex', flexDirection: 'column', gap: 14, padding: 14, ...PAGE_BG,
    }}>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(30px) saturate(180%)', border: '1.5px solid rgba(255,255,255,0.85)', borderRadius: 22, boxShadow: '0 8px 32px rgba(108,92,231,0.08)', flexWrap: 'wrap', flexShrink: 0 }}>
        <div style={{ width: 36, height: 36, borderRadius: 12, background: 'linear-gradient(180deg,#8B81F2,#6658E1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IconShield size={18} color="white" style={{ flexShrink: 0 }} /></div>
        <div>
          <div style={{ fontSize: 14.5, fontWeight: 800, color: BLACK, fontFamily: font }}>Guard Portal{guard ? ` — ${village.name}` : ''}</div>
          <div style={{ fontSize: 10.5, color: GRAY2, fontFamily: font }}>/guard · portal แยกจาก dashboard (login คนละระบบ){standalone ? '' : ' · ตัวอย่างจอ Desktop ป้อมยาม'}</div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {screen === 'monitor' && (
            <>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11.5, fontFamily: font, color: GREEN_DARK, background: 'rgba(52,199,89,0.1)', border: '1px solid rgba(52,199,89,0.25)', borderRadius: 100, padding: '5px 12px' }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: GREEN, animation: 'svBlink 1.6s infinite' }} />เชื่อมต่อแล้ว
              </span>
              {unacked > 0 && !muted && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11.5, fontWeight: 700, fontFamily: font, color: '#D0342C', background: 'rgba(255,56,60,0.08)', border: '1px solid rgba(255,56,60,0.3)', borderRadius: 100, padding: '5px 12px', animation: 'svBlink 1.2s infinite' }}>
                  <IconBellRinging size={13} style={{ flexShrink: 0 }} /> siren ดังจนกว่ารับทราบครบ — รออีก {unacked} เหตุ
                </span>
              )}
              <button className="hover-btn" onClick={() => setMuted(m => !m)} style={{
                height: 34, padding: '0 14px', borderRadius: 100, cursor: 'pointer', fontSize: 12, fontWeight: 700, fontFamily: font,
                border: '1px solid rgba(255,255,255,0.85)', background: muted ? 'rgba(255,56,60,0.08)' : 'rgba(255,255,255,0.65)',
                color: muted ? '#D0342C' : GRAY,
              }}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>{muted ? <><IconVolumeOff size={14} style={{ flexShrink: 0 }} /> ปิดเสียงชั่วคราว</> : <><IconVolume size={14} style={{ flexShrink: 0 }} /> เสียงเปิดอยู่</>}</span></button>
              <span style={{ fontSize: 12, color: GRAY, fontFamily: font }}><IconUserShield size={13} color={GRAY} style={{ verticalAlign: '-2px' }} /> {guard.name}</span>
            </>
          )}
          <button className="hover-btn" onClick={onExit} style={{
            height: 34, padding: '0 16px', borderRadius: 100, border: '1px solid rgba(255,255,255,0.85)', cursor: 'pointer',
            background: 'rgba(255,255,255,0.65)', color: GRAY, fontSize: 12, fontWeight: 600, fontFamily: font,
          }}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><IconX size={14} style={{ flexShrink: 0 }} /> {standalone ? 'ออกจากระบบ' : 'ออกจาก demo'}</span></button>
        </div>
      </div>

      {screen === 'login' && <GuardLogin onLogin={(g) => { setGuard(g); setScreen('shift'); }} />}
      {screen === 'shift' && <StartShift guardName={guard.name} onStart={() => setScreen('monitor')} />}

      {screen === 'monitor' && (
        <div style={{ flex: 1, display: 'flex', gap: 14, minHeight: 0 }}>
          {/* ── Sidebar: รายชื่อบ้าน ── */}
          <aside style={{ width: 320, flexShrink: 0, background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(40px) saturate(180%)', border: '1.5px solid rgba(255,255,255,0.85)', borderRadius: 24, overflow: 'hidden', boxShadow: '0 8px 32px rgba(108,92,231,0.08)', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <div style={{ padding: '16px 18px 12px', borderBottom: BORDER, flexShrink: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: BLACK, fontFamily: font }}>บ้านที่เฝ้าระวัง</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                {[
                  ['บ้าน', monitored.length],
                  ['online', `${online}/${devTotal.length}`],
                  ['เหตุวันนี้', todayCount],
                ].map(([l, v]) => (
                  <div key={l} style={{ flex: 1, background: BG, borderRadius: 12, padding: '8px 10px', textAlign: 'center' }}>
                    <div className="num" style={{ fontSize: 17, fontWeight: 800, color: BLACK }}>{v}</div>
                    <div style={{ fontSize: 10, color: GRAY2, fontFamily: font }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
              {sorted.map(h => {
                const devs = devicesOfHouse(h.id);
                const s = statusOf(h);
                const isSel = selected === h.id;
                const isAlert = s.color === RED;
                return (
                  <button key={h.id} onClick={() => setSelected(isSel ? null : h.id)} className="hover-btn" style={{
                    display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left', cursor: 'pointer',
                    padding: '12px 18px', border: 'none', borderBottom: '1px solid rgba(13,10,44,0.05)',
                    background: isSel ? 'rgba(0,136,255,0.07)' : isAlert ? 'rgba(255,56,60,0.06)' : 'transparent',
                    borderLeft: isSel ? '3px solid #0088FF' : isAlert ? `3px solid ${RED}` : '3px solid transparent',
                  }}>
                    <span style={{ fontSize: 17, fontWeight: 800, fontFamily: font, color: s.color, width: 58, flexShrink: 0 }}>{h.no}</span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: BLACK, fontFamily: font, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.nickname || `บ้าน ${h.no}`}</span>
                      <span style={{ display: 'block', fontSize: 11, color: isAlert ? '#D0342C' : GRAY2, fontFamily: font, fontWeight: isAlert ? 700 : 400 }}>
                        {s.label} · อุปกรณ์ {devs.filter(d => d.online).length}/{devs.length}
                      </span>
                    </span>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: s.color, flexShrink: 0, animation: isAlert ? 'svBlink 0.8s infinite' : 'none' }} />
                  </button>
                );
              })}
            </div>

            {/* ประวัติเหตุการณ์ */}
            <div style={{ borderTop: BORDER, flexShrink: 0, maxHeight: 190, display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: GRAY, fontFamily: font, padding: '10px 18px 6px', flexShrink: 0 }}>
                <IconHistory size={12} color={GRAY} style={{ verticalAlign: '-2px' }} /> ประวัติเหตุการณ์
              </div>
              <div style={{ overflowY: 'auto', minHeight: 0, padding: '0 18px 12px' }}>
                {history.map(a => {
                  const h = getHouse(a.houseId);
                  return (
                    <div key={a.id} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '5px 0', borderBottom: '1px solid rgba(13,10,44,0.04)' }}>
                      <span style={{ fontSize: 11.5, fontWeight: 700, color: BLACK, fontFamily: font, width: 48, flexShrink: 0 }}>{h.no}</span>
                      <span style={{ fontSize: 10.5, color: GRAY2, fontFamily: font, flex: 1 }}>{a.date} {a.time} น.</span>
                      <span style={{
                        fontSize: 10, fontWeight: 700, fontFamily: font, borderRadius: 100, padding: '2px 9px', flexShrink: 0,
                        color: a.result === 'ช่วยเหลือแล้ว' ? GREEN_DARK : a.result === 'แจ้งเตือนผิดพลาด' ? '#C96A12' : '#0088FF',
                        background: a.result === 'ช่วยเหลือแล้ว' ? 'rgba(52,199,89,0.1)' : a.result === 'แจ้งเตือนผิดพลาด' ? 'rgba(232,128,42,0.1)' : 'rgba(0,136,255,0.08)',
                      }}>{a.result}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* ── แผนที่เต็มพื้นที่ ── */}
          <main style={{ flex: 1, position: 'relative', minWidth: 0, borderRadius: 24, overflow: 'hidden', border: '1.5px solid rgba(255,255,255,0.85)', boxShadow: '0 8px 32px rgba(108,92,231,0.08)' }}>
            <div style={{ position: 'absolute', inset: 0 }}>
              {map3d
                ? <SVMap3D points={mapPoints} center={[village.lng, village.lat]} zoom={16.4} height="100%" radius={0} guardPost={village.guardPost} route={route} />
                : <SVMap points={mapPoints} center={[village.lng, village.lat]} zoom={15.4} height="100%" radius={0} guardPost={village.guardPost} route={route} />}
            </div>

            {/* สลับ 3D/2D */}
            <div style={{ position: 'absolute', top: 14, right: 14, display: 'flex', gap: 6, zIndex: 5 }}>
              <button className="hover-btn" style={segBtn(map3d)} onClick={() => setMap3d(true)}>ผัง 3D</button>
              <button className="hover-btn" style={segBtn(!map3d)} onClick={() => setMap3d(false)}>แผนที่ 2D</button>
            </div>

            {/* legend */}
            <div style={{ position: 'absolute', left: 14, bottom: 14, display: 'flex', gap: 12, zIndex: 5, background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(16px) saturate(180%)', border: '1px solid rgba(255,255,255,0.85)', borderRadius: 100, padding: '7px 16px', boxShadow: '0 2px 10px rgba(13,10,44,0.1)' }}>
              {[[RED, 'มีเหตุ active'], [ORANGE, 'อุปกรณ์ offline'], [GREEN, 'ปกติ'], [PURPLE, 'ป้อมยาม']].map(([c, l]) => (
                <span key={l} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, color: GRAY, fontFamily: font }}>
                  <span style={{ width: 9, height: 9, borderRadius: '50%', background: c }} />{l}
                </span>
              ))}
            </div>

            {/* แถบเส้นทางนำทาง — ระยะ/เวลา + เปิด Google Maps + ปิดเส้นทาง */}
            {route && (
              <div className="anim-slide-up" style={{
                position: 'absolute', top: 14, left: '50%', transform: 'translateX(-50%)', zIndex: 6,
                display: 'flex', alignItems: 'center', gap: 10, maxWidth: 'calc(100% - 240px)',
                background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(16px) saturate(180%)',
                border: '1px solid rgba(255,255,255,0.9)', borderRadius: 100, padding: '7px 8px 7px 16px',
                boxShadow: '0 6px 20px rgba(108,92,231,0.18)',
              }}>
                <IconNavigation size={15} color={route.status === 'error' ? '#D0342C' : '#0088FF'} style={{ flexShrink: 0 }} />
                <span style={{ fontSize: 12.5, fontWeight: 800, color: BLACK, fontFamily: font, whiteSpace: 'nowrap' }}>
                  {route.status === 'loading' ? `กำลังคำนวณเส้นทางไปบ้าน ${route.houseNo}…`
                    : route.status === 'error' ? `คำนวณเส้นทางไปบ้าน ${route.houseNo} ไม่สำเร็จ — ใช้ Google Maps แทน`
                      : `เส้นทางป้อมยาม → บ้าน ${route.houseNo}`}
                </span>
                {route.distance != null && (
                  <span className="num" style={{ fontSize: 12, fontWeight: 700, color: '#0088FF', whiteSpace: 'nowrap' }}>
                    {route.distance >= 1000 ? (route.distance / 1000).toFixed(1) + ' กม.' : Math.round(route.distance) + ' ม.'} · ~{Math.max(1, Math.round(route.duration / 60))} นาที
                  </span>
                )}
                <a
                  href={`https://www.google.com/maps/dir/?api=1&origin=${village.guardPost.lat},${village.guardPost.lng}&destination=${route.lat},${route.lng}`}
                  target="_blank" rel="noreferrer" className="hover-btn"
                  style={{ fontSize: 11.5, fontWeight: 700, color: PURPLE, textDecoration: 'none', border: '1px solid rgba(102,88,225,0.3)', borderRadius: 100, padding: '5px 12px', fontFamily: font, whiteSpace: 'nowrap' }}
                >เปิด Google Maps</a>
                <button className="hover-btn" onClick={() => setRoute(null)} style={{ border: 'none', background: BG, borderRadius: 100, width: 26, height: 26, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><IconX size={13} color={GRAY} style={{ flexShrink: 0 }} /></button>
              </div>
            )}
          </main>

          {/* ── Panel เหตุการณ์ด้านขวา — โครงเดียวกับ panel บ้านที่เฝ้าระวัง ── */}
          <aside style={{ width: 360, flexShrink: 0, background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(40px) saturate(180%)', border: '1.5px solid rgba(255,255,255,0.85)', borderRadius: 24, overflow: 'hidden', boxShadow: '0 8px 32px rgba(108,92,231,0.08)', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <div style={{ padding: '16px 18px 12px', borderBottom: BORDER, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: BLACK, fontFamily: font }}>เหตุการณ์</div>
              {openAlerts.length > 0 && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11.5, fontWeight: 700, fontFamily: font, color: '#D0342C', background: 'rgba(255,56,60,0.08)', border: '1px solid rgba(255,56,60,0.3)', borderRadius: 100, padding: '4px 12px' }}>
                  <IconAlertTriangleFilled size={12} color="#D0342C" style={{ flexShrink: 0 }} /> active {openAlerts.length}{unacked > 0 ? ` · ยังไม่รับทราบ ${unacked}` : ''}
                </span>
              )}
            </div>
            <div style={{ flex: 1, overflowY: 'auto', minHeight: 0, padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {openAlerts.length === 0 && closedNow.length === 0 && !selHouse && (
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <IconCircleCheck size={30} color={GREEN} style={{ flexShrink: 0 }} />
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: BLACK, fontFamily: font, marginTop: 8 }}>ไม่มีเหตุ active</div>
                  <div style={{ fontSize: 11.5, color: GRAY2, fontFamily: font, marginTop: 3, lineHeight: 1.7 }}>ระบบเฝ้าระวังทำงานปกติ<br />เหตุใหม่จะเด้งขึ้นที่นี่พร้อมเสียง siren</div>
                </div>
              )}
                {selHouse && (
              <div className="anim-scale-in" style={{ flexShrink: 0, pointerEvents: 'auto', ...GLASS, background: 'rgba(255,255,255,0.82)', borderRadius: 20, boxShadow: '0 12px 36px rgba(108,92,231,0.25)', padding: '16px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 12, background: 'linear-gradient(180deg,#8B81F2,#6658E1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><IconHome size={18} color="white" style={{ flexShrink: 0 }} /></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15.5, fontWeight: 800, color: BLACK, fontFamily: font }}>บ้าน {selHouse.no}
                      {(() => { const al = houseAlertOf(selHouse.id); const off = devicesOfHouse(selHouse.id).some(d => !d.online);
                        return <span style={{ marginLeft: 8, fontSize: 10.5, fontWeight: 700, verticalAlign: '2px', borderRadius: 100, padding: '2.5px 10px', color: al ? '#D0342C' : off ? '#C96A12' : GREEN_DARK, background: al ? 'rgba(255,56,60,0.1)' : off ? 'rgba(232,128,42,0.12)' : 'rgba(52,199,89,0.12)' }}>{al ? 'มีเหตุ active' : off ? 'อุปกรณ์ offline' : 'ปกติ'}</span>; })()}
                    </div>
                    {selHouse.nickname && <div style={{ fontSize: 11.5, color: GRAY2, fontFamily: font }}>{selHouse.nickname}</div>}
                  </div>
                  <button className="hover-btn" onClick={() => setSelected(null)} style={{ border: 'none', background: BG, borderRadius: 100, width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><IconX size={14} color={GRAY} style={{ flexShrink: 0 }} /></button>
                </div>
                <div style={{ marginTop: 10, fontSize: 12, color: GRAY, fontFamily: font, lineHeight: 1.7 }}>
                  <div><IconUsers size={12} color={GRAY} style={{ verticalAlign: '-2px' }} /> คนในบ้าน: {selHouse.residents.map(r => `${r.name} (${r.age})`).join(', ') || '—'}</div>
                  {selHouse.note && <div><IconMapPin size={12} color={GRAY} style={{ verticalAlign: '-2px' }} /> จุดสังเกต: {selHouse.note}</div>}
                  <div><IconAntennaBars5 size={12} color={GRAY} style={{ verticalAlign: '-2px' }} /> อุปกรณ์ {devicesOfHouse(selHouse.id).filter(d => d.online).length}/{devicesOfHouse(selHouse.id).length} online
                    {devicesOfHouse(selHouse.id).map(d => (
                      <span key={d.id} style={{ display: 'block', fontSize: 11, color: d.online ? GRAY2 : '#C96A12', paddingLeft: 18 }}>
                        {d.model} · {d.attach.kind === 'person' ? `ติดตัว ${d.attach.residentName}` : d.attach.location} · {d.online ? 'online' : 'offline'}
                      </span>
                    ))}
                  </div>
                </div>
                <button className="hover-btn" onClick={() => navigateTo(selHouse)} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 12, height: 40, width: '100%',
                  borderRadius: 100, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#4438AD,#6658E1 50%,#8B5CF6)',
                  color: 'white', fontSize: 12.5, fontWeight: 700, fontFamily: font, boxShadow: '0 6px 18px rgba(102,88,225,0.3)',
                }}><IconNavigation size={14} style={{ flexShrink: 0 }} /> นำทางไปบ้าน {selHouse.no} — แสดงเส้นทางบนแผนที่</button>
                {selHouse.contacts.length > 0 && (
                  <a href={`tel:${selHouse.contacts[0].phone}`} className="hover-btn" style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 8, height: 40,
                    borderRadius: 100, textDecoration: 'none', border: '1.5px solid rgba(102,88,225,0.3)', background: 'white',
                    color: PURPLE, fontSize: 12.5, fontWeight: 700, fontFamily: font,
                  }}><IconPhone size={14} style={{ flexShrink: 0 }} /> โทร {selHouse.contacts[0].name} ({selHouse.contacts[0].relation})</a>
                )}
              </div>
                )}
                {openAlerts.map(a => (
                  <div key={a.id} style={{ flexShrink: 0 }}>
                    <AlertPanel
                      alert={a} house={getHouse(a.houseId)} device={getDevice(a.deviceId)} phase={phaseOf(a)}
                      onAck={() => ack(a.id)}
                      onClose={(r) => close(a.id, r)}
                      onNavigate={() => navigateTo(getHouse(a.houseId))}
                    />
                  </div>
                ))}
                {closedNow.map(a => (
                  <div key={a.id} className="anim-slide-up" style={{ flexShrink: 0, borderRadius: 16, padding: '12px 16px', background: 'rgba(255,255,255,0.82)', border: '1.5px solid rgba(52,199,89,0.35)', boxShadow: '0 4px 16px rgba(108,92,231,0.1)', display: 'flex', gap: 10, alignItems: 'center' }}>
                    <IconCircleCheck size={20} color={GREEN_DARK} style={{ flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: GREEN_DARK, fontFamily: font }}>ปิดเหตุแล้ว — บ้าน {getHouse(a.houseId).no} · ผล: {closedResults[a.id]}</div>
                      <div style={{ fontSize: 11, color: GRAY2, fontFamily: font, marginTop: 1 }}>บันทึกผู้ปิดเหตุ: {guard.name} · ครอบครัวในแอป MyAtlas เห็นผลนี้ทันที (realtime)</div>
                    </div>
                  </div>
                ))}
            </div>
          </aside>
        </div>
      )}
    </div>,
    document.body
  );
}
