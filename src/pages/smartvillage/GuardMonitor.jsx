/* ═══ Smart Village — Guard Portal (demo overlay) — spec 5.6 login + 5.7 จอมอนิเตอร์ ═══
   จอเฝ้าระวังจอเดียวจบ: ตัวหนังสือใหญ่ contrast สูง เปิดทิ้งไว้ทั้งกะ */
import { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  SV_GUARDS, getVillage, housesOf, devicesOfHouse, getHouse, getDevice, alertsOfVillage,
} from '../../data/smartVillage';
import { font, GREEN, RED, ORANGE, ElapsedSince, SVMap } from './shared';
import {
  IconShield, IconMoon, IconPlayerPlayFilled, IconAlertTriangleFilled, IconMapPin, IconInfoCircle,
  IconAntennaBars5, IconCheck, IconPlayerStopFilled, IconUsers, IconNavigation, IconPhone,
  IconAlertTriangle, IconBellRinging, IconVolume, IconVolumeOff, IconUserShield, IconX,
  IconCircleCheck, IconHome, IconMap2, IconLayoutGrid,
} from '@tabler/icons-react';

const DARK = '#12102E';
const CARD_DARK = 'rgba(255,255,255,0.06)';
const BORDER_DARK = '1px solid rgba(255,255,255,0.1)';

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

  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div className="anim-scale-in" style={{ width: 400, maxWidth: '92vw', background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(30px)', border: BORDER_DARK, borderRadius: 28, padding: '36px 32px', textAlign: 'center' }}>
        <div style={{
          width: 64, height: 64, borderRadius: 20, margin: '0 auto 14px', fontSize: 28,
          background: 'linear-gradient(180deg,#8B81F2,#6658E1)', boxShadow: '0 8px 28px rgba(102,88,225,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}><IconShield size={28} color="white" style={{ flexShrink: 0 }} /></div>
        <div style={{ fontSize: 20, fontWeight: 800, color: 'white', fontFamily: font }}>Smart Village — จอเฝ้าระวัง</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', fontFamily: font, marginTop: 4 }}>ระบบเฝ้าระวังและแจ้งเหตุประจำหมู่บ้าน</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 24, textAlign: 'left' }}>
          <div>
            <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.6)', fontFamily: font, marginBottom: 6 }}>ชื่อผู้ใช้</div>
            <input value={u} onChange={e => { setU(e.target.value); setError(null); }} style={{ width: '100%', height: 48, borderRadius: 14, border: `1.5px solid ${error ? 'rgba(255,56,60,0.55)' : 'rgba(255,255,255,0.15)'}`, background: 'rgba(255,255,255,0.08)', color: 'white', fontSize: 15, fontFamily: 'Inter', padding: '0 16px', outline: 'none' }} />
          </div>
          <div>
            <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.6)', fontFamily: font, marginBottom: 6 }}>รหัสผ่าน</div>
            <input type="password" value={p} onChange={e => { setP(e.target.value); setError(null); }} onKeyDown={e => e.key === 'Enter' && submit()} style={{ width: '100%', height: 48, borderRadius: 14, border: `1.5px solid ${error ? 'rgba(255,56,60,0.55)' : 'rgba(255,255,255,0.15)'}`, background: 'rgba(255,255,255,0.08)', color: 'white', fontSize: 15, padding: '0 16px', outline: 'none' }} />
          </div>
          {error && (
            <div role="alert" className="anim-slide-up" style={{
              display: 'flex', gap: 8, alignItems: 'flex-start', background: 'rgba(255,56,60,0.14)',
              border: '1px solid rgba(255,56,60,0.4)', borderRadius: 12, padding: '10px 14px',
              fontSize: 12.5, color: '#FF8A80', fontFamily: font, lineHeight: 1.55,
            }}>
              <IconAlertTriangle size={14} color="#FF8A80" style={{ flexShrink: 0 }} /><span>{error}</span>
            </div>
          )}
          <button className="hover-btn" onClick={submit} style={{
            height: 52, borderRadius: 100, border: 'none', cursor: 'pointer', marginTop: 6,
            background: 'linear-gradient(135deg,#4438AD,#6658E1 50%,#8B5CF6)', color: 'white',
            fontSize: 16, fontWeight: 700, fontFamily: font, boxShadow: '0 8px 24px rgba(102,88,225,0.45)',
          }}>เข้าสู่ระบบ</button>
          <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.4)', fontFamily: font, textAlign: 'center', lineHeight: 1.7, marginTop: 4 }}>
            ลืมรหัสผ่าน? ติดต่อนิติบุคคล/ผู้ดูแลระบบ Atlas เท่านั้น<br />(ไม่มีการรีเซ็ตด้วยตนเอง)
          </div>
          <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.3)', fontFamily: font, textAlign: 'center', lineHeight: 1.7, borderTop: BORDER_DARK, paddingTop: 10 }}>
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
      <div className="anim-scale-in" style={{ textAlign: 'center', maxWidth: 460 }}>
        <div style={{ fontSize: 46 }}><IconMoon size={46} color="white" style={{ flexShrink: 0 }} /></div>
        <div style={{ fontSize: 22, fontWeight: 800, color: 'white', fontFamily: font, marginTop: 10 }}>สวัสดี {guardName}</div>
        <div style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.6)', fontFamily: font, marginTop: 8, lineHeight: 1.8 }}>
          กด "เริ่มกะเฝ้าระวัง" เพื่อเปิดเสียงแจ้งเหตุ (siren)<br />
          เบราว์เซอร์ต้องการการกดจากผู้ใช้ก่อนจึงเล่นเสียงได้ — ปุ่มนี้คือจุดเปิดเสียงของทั้งกะ
        </div>
        <button className="hover-btn" onClick={onStart} style={{
          marginTop: 20, height: 58, padding: '0 40px', borderRadius: 100, border: 'none', cursor: 'pointer',
          background: 'linear-gradient(135deg,#34C759,#19A589)', color: 'white',
          fontSize: 17, fontWeight: 800, fontFamily: font, boxShadow: '0 8px 28px rgba(52,199,89,0.4)',
        }}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><IconPlayerPlayFilled size={17} style={{ flexShrink: 0 }} /> เริ่มกะเฝ้าระวัง · เปิดเสียง</span></button>
      </div>
    </div>
  );
}

/* ── การ์ดเหตุ active บนจอ รปภ. — ภาวะสำคัญที่สุดของทั้งระบบ ── */
function AlertPanel({ alert, house, device, phase, onAck, onClose }) {
  const [closeResult, setCloseResult] = useState('');
  const [closing, setClosing] = useState(false);
  return (
    <div style={{
      borderRadius: 26, overflow: 'hidden', position: 'relative', flexShrink: 0,
      background: phase === 'new' ? 'linear-gradient(125deg,#B71C1C,#E0262B 45%,#FF5A3C)' : 'linear-gradient(125deg,#8A4A0B,#C96A12 45%,#E8802A)',
      animation: phase === 'new' ? 'svSirenGlow 1.2s ease-in-out infinite' : 'none',
      border: '1.5px solid rgba(255,255,255,0.25)',
    }}>
      <div style={{ padding: '22px 26px', position: 'relative' }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ width: 62, height: 62, borderRadius: 20, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, flexShrink: 0, animation: phase === 'new' ? 'svShake 0.9s infinite' : 'none' }}><IconAlertTriangleFilled size={32} color="white" style={{ flexShrink: 0 }} /></div>
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ fontSize: 24, fontWeight: 900, color: 'white', fontFamily: font, lineHeight: 1.25 }}>
              ตรวจพบการล้ม! — บ้าน {house.no}{house.nickname ? ` (${house.nickname})` : ''}
            </div>
            <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.95)', fontFamily: font, marginTop: 6, fontWeight: 600 }}>
              <IconMapPin size={14} color="rgba(255,255,255,0.95)" style={{ verticalAlign: '-2px' }} /> {device.attach.kind === 'person' ? `อุปกรณ์ติดตัว — ${device.attach.residentName}` : `ตำแหน่ง: ${device.attach.location}`} · เกิดเหตุ {alert.time} น. · <ElapsedSince minAgo={alert.minAgo} style={{ fontWeight: 800 }} />
            </div>
            {device.attach.kind === 'house' && (
              <div style={{ display: 'inline-block', fontSize: 12, color: 'rgba(255,255,255,0.92)', fontFamily: font, background: 'rgba(0,0,0,0.18)', borderRadius: 100, padding: '4px 14px', marginTop: 8 }}>
                <IconInfoCircle size={13} color="rgba(255,255,255,0.92)" style={{ verticalAlign: '-2px' }} /> เรดาร์เพดานระบุ<b>ห้อง</b>ที่เกิดเหตุ — <b>ไม่ระบุตัวบุคคล</b> · ตรวจสอบจากรายชื่อคนในบ้านด้านล่าง
              </div>
            )}
            {alert.recovered && (
              <div style={{ display: 'inline-block', fontSize: 12.5, color: 'white', fontFamily: font, background: 'rgba(255,255,255,0.18)', borderRadius: 100, padding: '4px 14px', marginTop: 8 }}>
                <IconAntennaBars5 size={14} color="white" style={{ verticalAlign: '-2px' }} /> เครื่องรายงานว่ากลับสู่ปกติแล้ว — เหตุยังไม่ปิดจนกว่าคนจะกดปิด (กันเคสล้มแล้วลุกไม่ได้)
              </div>
            )}
          </div>
          {phase === 'new' ? (
            <button className="hover-btn" onClick={onAck} style={{
              height: 62, padding: '0 34px', borderRadius: 100, border: 'none', cursor: 'pointer', flexShrink: 0,
              background: 'white', color: '#C62828', fontSize: 18, fontWeight: 900, fontFamily: font,
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            }}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><IconCheck size={18} style={{ flexShrink: 0 }} /> รับทราบ กำลังไปช่วย</span></button>
          ) : !closing ? (
            <button className="hover-btn" onClick={() => setClosing(true)} style={{
              height: 54, padding: '0 28px', borderRadius: 100, border: '2px solid rgba(255,255,255,0.7)', cursor: 'pointer', flexShrink: 0,
              background: 'rgba(255,255,255,0.12)', color: 'white', fontSize: 15, fontWeight: 800, fontFamily: font,
            }}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><IconPlayerStopFilled size={15} style={{ flexShrink: 0 }} /> ปิดเหตุ…</span></button>
          ) : null}
        </div>

        {/* ใครอยู่ในบ้าน + ผู้ติดต่อ + นำทาง */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.5fr', gap: 12, marginTop: 16 }}>
          <div style={{ background: 'rgba(0,0,0,0.18)', borderRadius: 18, padding: '14px 16px' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.7)', fontFamily: font, marginBottom: 8 }}><IconUsers size={13} color="rgba(255,255,255,0.7)" style={{ verticalAlign: '-2px' }} /> คนในบ้าน ({house.residents.length})</div>
            {house.residents.map(r => (
              <div key={r.id} style={{ fontSize: 14, color: 'white', fontFamily: font, marginBottom: 5, lineHeight: 1.5 }}>
                <b>{r.name}</b> · {r.age} ปี {r.note && <span style={{ color: '#FFD54F' }}>· <IconAlertTriangle size={13} color="#FFD54F" style={{ verticalAlign: '-2px' }} /> {r.note}</span>}
              </div>
            ))}
            {/* แผนที่ย่อพิกัดบ้าน — เห็นตำแหน่งทันทีโดยไม่ต้องสลับไปแผนที่หลัก */}
            <div style={{ marginTop: 8, borderRadius: 12, overflow: 'hidden' }}>
              <SVMap
                points={[{ lat: house.lat, lng: house.lng, name: `บ้าน ${house.no}`, color: '#FF383C', big: true, status: 'alert' }]}
                center={[house.lng, house.lat]} zoom={16.5} height={130} radius={12}
              />
            </div>
            <button className="hover-btn" style={{
              marginTop: 8, width: '100%', height: 42, borderRadius: 12, border: '1.5px solid rgba(255,255,255,0.4)',
              background: 'rgba(255,255,255,0.1)', color: 'white', fontSize: 13.5, fontWeight: 700, fontFamily: font, cursor: 'pointer',
            }}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><IconNavigation size={14} style={{ flexShrink: 0 }} /> นำทางไปบ้าน {house.no} (เปิด Google Maps)</span></button>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.18)', borderRadius: 18, padding: '14px 16px' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.7)', fontFamily: font, marginBottom: 8 }}><IconPhone size={13} color="rgba(255,255,255,0.7)" style={{ verticalAlign: '-2px' }} /> ผู้ติดต่อ (เรียงลำดับ) — กดโทรได้ทันที</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {house.contacts.length === 0 && (
                <div style={{ fontSize: 13, color: '#FFD54F', fontFamily: font, lineHeight: 1.6 }}>
                  <IconAlertTriangle size={13} color="#FFD54F" style={{ verticalAlign: '-2px' }} /> บ้านนี้ไม่มีผู้ติดต่อในระบบ — ติดต่อนิติบุคคล/ทีม central แทน
                </div>
              )}
              {house.contacts.map((c, i) => (
                <a key={c.id} href={`tel:${c.phone}`} className="hover-btn" style={{
                  display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none',
                  background: i === 0 ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.12)',
                  borderRadius: 12, padding: '9px 14px',
                }}>
                  <span style={{ fontSize: 13, fontWeight: 800, fontFamily: font, color: i === 0 ? '#C62828' : 'white', width: 18 }}>{i + 1}.</span>
                  <span style={{ fontSize: 13.5, fontWeight: 700, fontFamily: font, color: i === 0 ? '#1E1B39' : 'white', flex: 1 }}>
                    {c.name} <span style={{ fontWeight: 400, fontSize: 11.5, opacity: 0.7 }}>({c.relation})</span>
                  </span>
                  <span className="num" style={{ fontSize: 14, fontWeight: 800, color: i === 0 ? '#C62828' : '#FFD54F' }}><IconPhone size={13} style={{ verticalAlign: '-2px' }} /> {c.phone}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* ฟอร์มปิดเหตุ */}
        {phase === 'acked' && closing && (
          <div className="anim-expand" style={{ marginTop: 14, background: 'rgba(0,0,0,0.22)', borderRadius: 18, padding: 16 }}>
            <div style={{ fontSize: 13.5, fontWeight: 800, color: 'white', fontFamily: font, marginBottom: 10 }}>ปิดเหตุ — เลือกผล</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['ช่วยเหลือแล้ว', 'แจ้งเตือนผิดพลาด', 'เหตุทดสอบ'].map(r => (
                <button key={r} onClick={() => setCloseResult(r)} className="hover-btn" style={{
                  height: 44, padding: '0 20px', borderRadius: 100, cursor: 'pointer', fontSize: 13.5, fontWeight: 700, fontFamily: font,
                  border: `2px solid ${closeResult === r ? 'white' : 'rgba(255,255,255,0.35)'}`,
                  background: closeResult === r ? 'white' : 'transparent',
                  color: closeResult === r ? '#C96A12' : 'white',
                }}>{r}</button>
              ))}
            </div>
            <input placeholder="โน้ตสั้นๆ เช่น อาการ ผู้ที่มาช่วย การส่งต่อ… (ไม่บังคับ)" style={{
              width: '100%', height: 44, borderRadius: 12, border: '1.5px solid rgba(255,255,255,0.25)',
              background: 'rgba(255,255,255,0.1)', color: 'white', fontSize: 13, fontFamily: font, padding: '0 14px', outline: 'none', marginTop: 10,
            }} />
            <button
              className="hover-btn" onClick={() => closeResult && onClose(closeResult)}
              style={{
                marginTop: 10, height: 48, width: '100%', borderRadius: 100, border: 'none',
                cursor: closeResult ? 'pointer' : 'not-allowed', opacity: closeResult ? 1 : 0.45,
                background: 'white', color: '#C96A12', fontSize: 15, fontWeight: 900, fontFamily: font,
              }}
            >ยืนยันปิดเหตุ</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function GuardMonitor({ onExit }) {
  const [guard, setGuard] = useState(null);
  const [screen, setScreen] = useState('login'); // login → shift → monitor
  const [muted, setMuted] = useState(false);
  const [view, setView] = useState('map'); // map | cards — spec แนะนำ: แผนที่หลักบน desktop
  /* วงจรเหตุรายตัว: ใหม่ → รับทราบแล้ว → ปิดแล้ว — เก็บ override เป็น map ต่อ alert id */
  const [alertStates, setAlertStates] = useState({});
  const [closedResults, setClosedResults] = useState({});

  const villageId = guard ? guard.villageId : 'vlg-001';
  const village = getVillage(villageId);
  const houses = housesOf(villageId);
  const monitored = houses.filter(h => devicesOfHouse(h.id).length > 0);

  const allAlerts = alertsOfVillage(villageId);
  const phaseOf = (a) => alertStates[a.id] || (a.status === 'ใหม่' ? 'new' : a.status === 'รับทราบแล้ว' ? 'acked' : 'closed');
  /* หลายเหตุพร้อมกัน: ซ้อนเป็นรายการ เหตุใหม่สุดอยู่บน */
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

  const mapPoints = monitored.map(h => {
    const devs = devicesOfHouse(h.id);
    const al = houseAlertOf(h.id);
    const hasOffline = devs.some(d => !d.online);
    const color = al ? RED : hasOffline ? ORANGE : GREEN;
    return {
      lat: h.lat, lng: h.lng, color, big: !!al, status: al ? 'alert' : 'ok',
      name: `บ้าน ${h.no}${h.nickname ? ' · ' + h.nickname : ''}`,
      subHtml: `<div style="font-size:11.5px;color:#615E83;">${al ? (phaseOf(al) === 'new' ? 'ตรวจพบการล้ม!' : 'กำลังช่วยเหลือ…') : hasOffline ? 'อุปกรณ์ offline' : 'ปกติ'} · อุปกรณ์ ${devs.filter(d => d.online).length}/${devs.length} online</div>`,
    };
  });

  const segBtn = (active) => ({
    height: 32, padding: '0 14px', borderRadius: 100, cursor: 'pointer',
    fontSize: 12, fontWeight: 700, fontFamily: font,
    border: '1px solid rgba(255,255,255,0.15)',
    background: active ? 'rgba(255,255,255,0.16)' : 'transparent',
    color: active ? 'white' : 'rgba(255,255,255,0.55)',
  });

  /* portal ไป document.body — จอเฝ้าระวังต้องเต็ม viewport จริง ไม่โดน .main-inner clip */
  return createPortal(
    <div className="anim-backdrop" style={{
      position: 'fixed', inset: 0, zIndex: 3000, display: 'flex', flexDirection: 'column',
      background: `linear-gradient(160deg, #1A1340 0%, ${DARK} 55%, #0D0B24 100%)`,
    }}>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 22px', borderBottom: BORDER_DARK, flexWrap: 'wrap' }}>
        <div style={{ width: 36, height: 36, borderRadius: 12, background: 'linear-gradient(180deg,#8B81F2,#6658E1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}><IconShield size={18} color="white" style={{ flexShrink: 0 }} /></div>
        <div>
          <div style={{ fontSize: 14.5, fontWeight: 800, color: 'white', fontFamily: font }}>Guard Portal{guard ? ` — ${village.name}` : ''}</div>
          <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.45)', fontFamily: font }}>/guard · portal แยกจาก dashboard (login คนละระบบ) · ตัวอย่างจอ Desktop ป้อมยาม</div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
          {screen === 'monitor' && (
            <>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11.5, fontFamily: font, color: '#7CF5A4', background: 'rgba(52,199,89,0.15)', border: '1px solid rgba(52,199,89,0.3)', borderRadius: 100, padding: '5px 12px' }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: GREEN, animation: 'svBlink 1.6s infinite' }} />เชื่อมต่อแล้ว
              </span>
              {unacked > 0 && !muted && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11.5, fontWeight: 700, fontFamily: font, color: '#FF8A80', background: 'rgba(255,56,60,0.15)', border: '1px solid rgba(255,56,60,0.35)', borderRadius: 100, padding: '5px 12px', animation: 'svBlink 1.2s infinite' }}>
                  <IconBellRinging size={13} style={{ flexShrink: 0 }} /> siren ดังจนกว่ารับทราบครบ — รออีก {unacked} เหตุ
                </span>
              )}
              <button className="hover-btn" onClick={() => setMuted(m => !m)} style={{
                height: 34, padding: '0 14px', borderRadius: 100, cursor: 'pointer', fontSize: 12, fontWeight: 700, fontFamily: font,
                border: '1px solid rgba(255,255,255,0.2)', background: muted ? 'rgba(255,56,60,0.15)' : 'rgba(255,255,255,0.08)',
                color: muted ? '#FF8A80' : 'white',
              }}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>{muted ? <><IconVolumeOff size={14} style={{ flexShrink: 0 }} /> ปิดเสียงชั่วคราว</> : <><IconVolume size={14} style={{ flexShrink: 0 }} /> เสียงเปิดอยู่</>}</span></button>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontFamily: font }}><IconUserShield size={13} color="rgba(255,255,255,0.7)" style={{ verticalAlign: '-2px' }} /> {guard.name}</span>
            </>
          )}
          <button className="hover-btn" onClick={onExit} style={{
            height: 34, padding: '0 16px', borderRadius: 100, border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer',
            background: 'rgba(255,255,255,0.08)', color: 'white', fontSize: 12, fontWeight: 600, fontFamily: font,
          }}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><IconX size={14} style={{ flexShrink: 0 }} /> ออกจาก demo</span></button>
        </div>
      </div>

      {screen === 'login' && <GuardLogin onLogin={(g) => { setGuard(g); setScreen('shift'); }} />}
      {screen === 'shift' && <StartShift guardName={guard.name} onStart={() => setScreen('monitor')} />}

      {screen === 'monitor' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: 22, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* เหตุ active — ซ้อนเป็นรายการ ใหม่สุดอยู่บน */}
          {openAlerts.map(a => (
            <AlertPanel
              key={a.id} alert={a} house={getHouse(a.houseId)} device={getDevice(a.deviceId)} phase={phaseOf(a)}
              onAck={() => ack(a.id)}
              onClose={(r) => close(a.id, r)}
            />
          ))}
          {closedNow.map(a => (
            <div key={a.id} className="anim-slide-up" style={{ borderRadius: 20, padding: '16px 20px', background: 'rgba(52,199,89,0.12)', border: '1.5px solid rgba(52,199,89,0.35)', display: 'flex', gap: 12, alignItems: 'center', flexShrink: 0 }}>
              <IconCircleCheck size={24} color="#7CF5A4" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#7CF5A4', fontFamily: font }}>ปิดเหตุแล้ว — บ้าน {getHouse(a.houseId).no} · ผล: {closedResults[a.id]}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', fontFamily: font, marginTop: 2 }}>บันทึกผู้ปิดเหตุ: {guard.name} · ครอบครัวในแอป MyAtlas เห็นผลนี้ทันที (realtime)</div>
              </div>
            </div>
          ))}

          {/* แถบสรุป */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', flexShrink: 0 }}>
            {[
              [IconHome, 'บ้านที่เฝ้าระวัง', monitored.length + ' หลัง'],
              [IconAntennaBars5, 'อุปกรณ์ online', `${online}/${devTotal.length}`],
              [IconAlertTriangleFilled, 'เหตุวันนี้', `${todayCount} เหตุ`],
            ].map(([Ic, l, v]) => (
              <div key={l} style={{ background: CARD_DARK, border: BORDER_DARK, borderRadius: 16, padding: '12px 20px' }}>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontFamily: font }}><Ic size={12} color="rgba(255,255,255,0.5)" style={{ verticalAlign: '-2px' }} /> {l}</div>
                <div className="num" style={{ fontSize: 21, fontWeight: 800, color: 'white', marginTop: 2 }}>{v}</div>
              </div>
            ))}
          </div>

          {/* ผังบ้าน — แผนที่ (หลักบน desktop) / การ์ด (หลักบนมือถือ) */}
          <div style={{ flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.65)', fontFamily: font }}>ผังบ้านที่มีอุปกรณ์ ({monitored.length} หลัง)</div>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                <button className="hover-btn" style={segBtn(view === 'map')} onClick={() => setView('map')}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><IconMap2 size={13} style={{ flexShrink: 0 }} /> แผนที่</span></button>
                <button className="hover-btn" style={segBtn(view === 'cards')} onClick={() => setView('cards')}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><IconLayoutGrid size={13} style={{ flexShrink: 0 }} /> การ์ด</span></button>
              </div>
            </div>

            {view === 'map' ? (
              <div style={{ background: CARD_DARK, border: BORDER_DARK, borderRadius: 20, padding: 10 }}>
                <SVMap points={mapPoints} center={[village.lng, village.lat]} zoom={15.4} height={380} radius={14} />
                <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', padding: '10px 6px 2px' }}>
                  {[[RED, 'มีเหตุ active'], [ORANGE, 'มีอุปกรณ์ offline'], [GREEN, 'ปกติ']].map(([c, l]) => (
                    <span key={l} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'rgba(255,255,255,0.6)', fontFamily: font }}>
                      <span style={{ width: 9, height: 9, borderRadius: '50%', background: c }} />{l}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 10 }}>
                {monitored.map(h => {
                  const devs = devicesOfHouse(h.id);
                  const al = houseAlertOf(h.id);
                  const alPhase = al ? phaseOf(al) : null;
                  const hasOffline = devs.some(d => !d.online);
                  return (
                    <div key={h.id} style={{
                      background: al ? 'rgba(255,56,60,0.18)' : CARD_DARK,
                      border: al ? '2px solid #FF5A3C' : hasOffline ? '1.5px solid rgba(232,128,42,0.45)' : BORDER_DARK,
                      borderRadius: 18, padding: '14px 16px',
                      animation: alPhase === 'new' ? 'svSirenGlow 1.2s infinite' : 'none',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {al ? <IconAlertTriangleFilled size={17} color="#FF8A80" style={{ flexShrink: 0 }} /> : <IconHome size={17} color="white" style={{ flexShrink: 0 }} />}
                        <span style={{ fontSize: 16, fontWeight: 800, color: 'white', fontFamily: font }}>{h.no}</span>
                        <span style={{
                          marginLeft: 'auto', width: 10, height: 10, borderRadius: '50%',
                          background: al ? RED : hasOffline ? ORANGE : GREEN,
                          animation: al ? 'svBlink 0.8s infinite' : 'none',
                        }} />
                      </div>
                      {h.nickname && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', fontFamily: font, marginTop: 3 }}>{h.nickname}</div>}
                      <div style={{ fontSize: 11.5, fontWeight: 600, fontFamily: font, marginTop: 6, color: al ? '#FF8A80' : hasOffline ? '#FFB74D' : 'rgba(255,255,255,0.7)' }}>
                        {al ? (alPhase === 'new' ? <><IconAlertTriangle size={13} style={{ verticalAlign: '-2px' }} /> ตรวจพบการล้ม!</> : 'กำลังช่วยเหลือ…') : hasOffline ? `อุปกรณ์ offline ${devs.filter(d => !d.online).length} เครื่อง` : 'ปกติ'}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ประวัติเหตุการณ์ */}
          <div style={{ flexShrink: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.65)', fontFamily: font, marginBottom: 10 }}>ประวัติเหตุการณ์ของหมู่บ้าน</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {history.map(a => {
                const h = getHouse(a.houseId);
                return (
                  <div key={a.id} style={{ display: 'flex', gap: 12, alignItems: 'center', background: CARD_DARK, border: BORDER_DARK, borderRadius: 14, padding: '11px 16px', flexWrap: 'wrap' }}>
                    <span className="num" style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{a.no}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'white', fontFamily: font }}>บ้าน {h.no}</span>
                    <span style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.55)', fontFamily: font }}>{a.detectType} · {a.date} {a.time} น.</span>
                    <span style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.55)', fontFamily: font }}>รับทราบ: {a.ackBy}</span>
                    <span style={{
                      marginLeft: 'auto', fontSize: 11, fontWeight: 700, fontFamily: font, borderRadius: 100, padding: '3px 12px',
                      color: a.result === 'ช่วยเหลือแล้ว' ? '#7CF5A4' : a.result === 'แจ้งเตือนผิดพลาด' ? '#FFB74D' : '#81D4FA',
                      background: 'rgba(255,255,255,0.08)',
                    }}>{a.result}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
}
