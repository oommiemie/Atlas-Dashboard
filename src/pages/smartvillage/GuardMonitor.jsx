/* ═══ Smart Village — Guard Portal — spec 5.6 login + 5.7 จอมอนิเตอร์ ═══
   Layout แบบจอ monitoring: รายชื่อบ้านซ้าย + แผนที่เต็มจอขวา + การ์ดเหตุลอยบนแผนที่
   Design language เดียวกับ dashboard หลัก (theme สว่าง) */
import { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  SV_GUARDS, getVillage, housesOf, devicesOfHouse, getHouse, getDevice, alertsOfVillage,
} from '../../data/smartVillage';
import { font, BLACK, GRAY, GRAY2, PURPLE, GREEN, RED, ORANGE, ElapsedSince, SVMap, SVMap3D, Modal } from './shared';
import {
  IconShield, IconAlertTriangleFilled, IconMapPin, IconInfoCircle,
  IconAntennaBars5, IconCheck, IconPlayerStopFilled, IconUsers, IconNavigation, IconPhone,
  IconAlertTriangle, IconBellRinging, IconVolume, IconVolumeOff, IconUserShield, IconX,
  IconCircleCheck, IconHome, IconHistory, IconDeviceDesktop,
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

/* ── การ์ดเหตุ active — ลอยบนแผนที่ ภาวะสำคัญที่สุดของทั้งระบบ ── */
function AlertPanel({ alert, house, device, phase, onAck, onClose, onNavigate }) {
  const [closeResult, setCloseResult] = useState('');
  const [closing, setClosing] = useState(false);
  /* compact โดย default — ไม่บังแผนที่ กดขยายเมื่อต้องดูรายชื่อ/โทร/ปิดเหตุ */
  const [expanded, setExpanded] = useState(false);
  const isNew = phase === 'new';
  const accent = isNew ? '#FF383C' : ORANGE;
  return (
    <div className="anim-slide-up" style={{
      background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(24px) saturate(180%)', borderRadius: 16, overflow: 'hidden', pointerEvents: 'auto',
      boxShadow: '0 8px 28px rgba(108,92,231,0.16)',
      borderLeft: `4px solid ${accent}`,
      animation: isNew ? 'svSirenGlow 1.4s ease-in-out infinite' : 'none',
    }}>
      {/* header minimal — เฉพาะข้อมูลตัดสินใจ: บ้าน · ห้อง · เวลาที่ผ่าน */}
      <div style={{ padding: '12px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <IconAlertTriangleFilled size={13} color={accent} style={{ flexShrink: 0, animation: isNew ? 'svShake 0.9s infinite' : 'none' }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: accent, fontFamily: font }}>{isNew ? 'ตรวจพบการล้ม' : 'กำลังช่วยเหลือ'}</span>
          <ElapsedSince minAgo={alert.minAgo} style={{ marginLeft: 'auto', fontSize: 11.5, fontWeight: 800, color: accent, flexShrink: 0 }} />
        </div>
        <div style={{ fontSize: 17, fontWeight: 900, color: BLACK, fontFamily: font, lineHeight: 1.25, marginTop: 4 }}>
          บ้าน {house.no}
        </div>
        <div style={{ fontSize: 11.5, color: GRAY, fontFamily: font, marginTop: 1 }}>
          {house.nickname ? `${house.nickname} · ` : ''}{device.attach.kind === 'person' ? `ติดตัว ${device.attach.residentName}` : device.attach.location}
        </div>

        {/* CTA เด่น — ปุ่มคือจุดโฟกัส ไม่ใช่การ์ด */}
        <div style={{ display: 'flex', gap: 8, marginTop: 11 }}>
          {isNew ? (
            <button className="hover-btn" onClick={onAck} style={{
              flex: 1, height: 44, borderRadius: 100, border: 'none', cursor: 'pointer',
              background: accent, color: 'white', fontSize: 14, fontWeight: 800, fontFamily: font,
              boxShadow: `0 6px 18px ${accent}55`,
            }}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><IconCheck size={16} style={{ flexShrink: 0 }} /> รับทราบ กำลังไปช่วย</span></button>
          ) : (
            <button className="hover-btn" onClick={() => { setClosing(true); setExpanded(true); }} style={{
              flex: 1, height: 44, borderRadius: 100, border: 'none', cursor: 'pointer',
              background: closing ? 'rgba(13,10,44,0.06)' : accent, color: closing ? GRAY : 'white', fontSize: 14, fontWeight: 800, fontFamily: font,
              boxShadow: closing ? 'none' : `0 6px 18px ${accent}55`,
            }}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><IconPlayerStopFilled size={14} style={{ flexShrink: 0 }} /> ปิดเหตุ</span></button>
          )}
          <button className="hover-btn" onClick={() => setExpanded(e => !e)} style={{
            height: 44, padding: '0 14px', borderRadius: 100, cursor: 'pointer', flexShrink: 0,
            border: `1.5px solid ${expanded ? accent : 'rgba(13,10,44,0.12)'}`, background: 'transparent',
            color: expanded ? accent : GRAY, fontSize: 12.5, fontWeight: 700, fontFamily: font,
          }}>{expanded ? 'ย่อ' : 'ข้อมูล'}</button>
        </div>
      </div>

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

        {/* นำทาง */}
        {!closing && (
          <button className="hover-btn" onClick={onNavigate} style={{
            width: '100%', height: 40, borderRadius: 100, border: '1.5px solid rgba(102,88,225,0.3)', cursor: 'pointer',
            background: 'rgba(255,255,255,0.8)', color: PURPLE,
            fontSize: 12.5, fontWeight: 700, fontFamily: font,
          }}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><IconNavigation size={14} style={{ flexShrink: 0 }} /> นำทางไปบ้าน {house.no}</span></button>
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

export default function GuardMonitor({ onExit, standalone = false, guardUsername }) {
  /* login ผ่าน shortcut หน้า login หลักแล้ว (guardUsername) → เข้าหน้าเริ่มกะทันที ไม่มี GuardLogin แยก */
  const preAuth = guardUsername ? SV_GUARDS.find(g => g.username === guardUsername) : null;
  const [guard, setGuard] = useState(preAuth || null);
  const [screen, setScreen] = useState(preAuth ? 'monitor' : 'login'); // preAuth → เข้าจอตรง (ตัดหน้าเริ่มกะ)
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
      labelTitle: `บ้าน ${h.no}`,
      labelSub: `${s.label} · ${devs.filter(d => d.online).length}/${devs.length}`,
      onClick: () => setSelected(prev => prev === h.id ? null : h.id),
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
      {/* Top bar — เฉพาะจอ login/เริ่มกะ (จอ monitor ใช้ sidebar แบบหน้าหลักแทน) */}
      {screen !== 'monitor' && (
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
      )}

      {screen === 'login' && <GuardLogin onLogin={(g) => { setGuard(g); setScreen('monitor'); }} />}

      {screen === 'monitor' && (
        <div style={{ flex: 1, display: 'flex', gap: 14, minHeight: 0 }}>
          {/* ── Sidebar หลัก — โครง/โทนเดียวกับ sidebar หน้าหลัก (.sidebar-inner) ── */}
          <aside style={{
            width: 232, flexShrink: 0, display: 'flex', flexDirection: 'column', minHeight: 0,
            background: 'linear-gradient(180deg, #1A1340 0%, #231A5E 35%, #1E1550 70%, #160F38 100%)',
            borderRadius: 24, border: '1.5px solid rgba(108,92,231,0.15)', boxShadow: '0 12px 48px rgba(22,15,56,0.5)',
            padding: '24px 14px 14px', position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: -60, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(108,92,231,0.2), transparent 70%)', filter: 'blur(30px)', pointerEvents: 'none' }} />
            {/* logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 6px', marginBottom: 24, position: 'relative' }}>
              <div style={{ width: 42, height: 42, borderRadius: 14, background: 'linear-gradient(135deg,#8B7CF8,#6C5CE7)', boxShadow: '0 8px 24px rgba(108,92,231,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <IconShield size={20} color="white" style={{ flexShrink: 0 }} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: 'white', fontFamily: font }}>Guard Portal</div>
                <div style={{ fontSize: 9.5, color: 'rgba(162,155,254,0.6)', fontFamily: font, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{village.name}</div>
              </div>
            </div>

            <span style={{ fontSize: 10, color: 'white', fontFamily: font, padding: '0 6px' }}>Menu</span>
            <button className="hover-nav" style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: 8, borderRadius: 100, border: '1px solid rgba(255,255,255,0.6)',
              cursor: 'default', width: '100%', textAlign: 'left', fontFamily: font, fontSize: 14, marginTop: 8,
              color: '#4438AD', background: 'white', boxShadow: '0 4px 4px rgba(0,0,0,0.1)',
            }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(180deg, #8B81F2, #6658E1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <IconDeviceDesktop size={13} color="white" style={{ flexShrink: 0 }} />
              </div>
              จอเฝ้าระวัง
            </button>

            {/* สถานะระบบ — card เดียว compact */}
            <div style={{ marginTop: 16, padding: 10, borderRadius: 14, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: GREEN, animation: 'svBlink 1.6s infinite', flexShrink: 0 }} />
                <span style={{ fontSize: 11.5, fontWeight: 600, fontFamily: font, color: '#7CF5A4' }}>เชื่อมต่อแล้ว</span>
                <span style={{ fontSize: 10, fontFamily: font, color: 'rgba(255,255,255,0.4)' }}>realtime</span>
                <button className="hover-btn" onClick={() => setMuted(m => !m)} title={muted ? 'ปิดเสียงอยู่' : 'เสียงเปิดอยู่'} style={{
                  marginLeft: 'auto', width: 28, height: 28, borderRadius: 8, cursor: 'pointer', flexShrink: 0,
                  border: '1px solid rgba(255,255,255,0.15)', background: muted ? 'rgba(255,56,60,0.14)' : 'rgba(255,255,255,0.08)',
                  color: muted ? '#FF8A80' : 'rgba(255,255,255,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{muted ? <IconVolumeOff size={14} style={{ flexShrink: 0 }} /> : <IconVolume size={14} style={{ flexShrink: 0 }} />}</button>
              </div>
              {unacked > 0 && !muted && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, fontSize: 11, fontWeight: 700, fontFamily: font, color: '#FF8A80', background: 'rgba(255,56,60,0.14)', border: '1px solid rgba(255,56,60,0.3)', borderRadius: 8, padding: '5px 10px', animation: 'svBlink 1.2s infinite' }}>
                  <IconBellRinging size={12} style={{ flexShrink: 0 }} /> siren — รออีก {unacked} เหตุ
                </div>
              )}
            </div>

            <div style={{ flex: 1 }} />

            {/* user + ออกจากระบบ */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 10, position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 6px' }}>
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,#74B9FF,#6C5CE7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 14, fontWeight: 700, fontFamily: font, flexShrink: 0 }}>
                  {guard.name.charAt(0)}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: 'rgba(255,255,255,0.9)', fontFamily: font, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{guard.name}</div>
                  <div style={{ fontSize: 10, color: 'rgba(162,155,254,0.5)', fontFamily: font }}>รปภ. ประจำหมู่บ้าน{standalone ? '' : ' · demo'}</div>
                </div>
              </div>
              <button className="hover-btn" onClick={onExit} style={{
                height: 36, borderRadius: 100, border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer', width: '100%',
                background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: 600, fontFamily: font,
              }}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><IconX size={13} style={{ flexShrink: 0 }} /> {standalone ? 'ออกจากระบบ' : 'ออกจาก demo'}</span></button>
            </div>
          </aside>

          {/* ── แผนที่เต็มพื้นที่ ── */}
          <main style={{ flex: 1, position: 'relative', minWidth: 0, borderRadius: 24, overflow: 'hidden', border: '1.5px solid rgba(255,255,255,0.85)', boxShadow: '0 8px 32px rgba(108,92,231,0.08)' }}>
            <div style={{ position: 'absolute', inset: 0 }}>
              {map3d
                ? <SVMap3D points={mapPoints} center={[village.lng, village.lat]} zoom={16.4} height="100%" radius={0} guardPost={village.guardPost} route={route} navPosition="bottom-right" labels />
                : <SVMap points={mapPoints} center={[village.lng, village.lat]} zoom={15.4} height="100%" radius={0} guardPost={village.guardPost} route={route} navPosition="bottom-right" labels />}
            </div>

            {/* panel บ้านที่เฝ้าระวัง — ลอยบนแผนที่ compact */}
            <div style={{
              position: 'absolute', top: 14, left: 14, zIndex: 5, width: 236,
              maxHeight: 'calc(100% - 28px)', display: 'flex', flexDirection: 'column',
              background: 'rgba(255,255,255,0.78)', backdropFilter: 'blur(20px) saturate(180%)',
              border: '1.5px solid rgba(255,255,255,0.9)', borderRadius: 18, boxShadow: '0 8px 28px rgba(108,92,231,0.15)', overflow: 'hidden',
            }}>
              <div style={{ padding: '11px 14px 9px', borderBottom: '1px solid rgba(13,10,44,0.06)', flexShrink: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: BLACK, fontFamily: font }}>บ้านที่เฝ้าระวัง ({monitored.length})</div>
                <div style={{ fontSize: 10.5, color: GRAY2, fontFamily: font, marginTop: 2 }}>อุปกรณ์ online {online}/{devTotal.length} · เหตุวันนี้ {todayCount}</div>
              </div>
              <div style={{ overflowY: 'auto', minHeight: 0 }}>
                {sorted.map(h => {
                  const st = statusOf(h);
                  const isSel = selected === h.id;
                  const isAlert = st.color === RED;
                  return (
                    <button key={h.id} onClick={() => setSelected(isSel ? null : h.id)} className="hover-btn" style={{
                      display: 'flex', alignItems: 'center', gap: 9, width: '100%', textAlign: 'left', cursor: 'pointer',
                      padding: '8px 12px', border: 'none', borderBottom: '1px solid rgba(13,10,44,0.04)',
                      background: isSel ? 'rgba(0,136,255,0.08)' : isAlert ? 'rgba(255,56,60,0.07)' : 'transparent',
                    }}>
                      <span style={{ fontSize: 13.5, fontWeight: 800, fontFamily: font, color: st.color, width: 44, flexShrink: 0 }}>{h.no}</span>
                      <span style={{ flex: 1, minWidth: 0, fontSize: 11, color: isAlert ? '#D0342C' : GRAY, fontFamily: font, fontWeight: isAlert ? 700 : 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {isAlert ? st.label : h.nickname || st.label}
                      </span>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: st.color, flexShrink: 0, animation: isAlert ? 'svBlink 0.8s infinite' : 'none' }} />
                    </button>
                  );
                })}
              </div>
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
              {openAlerts.length === 0 && closedNow.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <IconCircleCheck size={30} color={GREEN} style={{ flexShrink: 0 }} />
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: BLACK, fontFamily: font, marginTop: 8 }}>ไม่มีเหตุ active</div>
                  <div style={{ fontSize: 11.5, color: GRAY2, fontFamily: font, marginTop: 3, lineHeight: 1.7 }}>ระบบเฝ้าระวังทำงานปกติ<br />เหตุใหม่จะเด้งขึ้นที่นี่พร้อมเสียง siren</div>
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

              {/* ประวัติเหตุการณ์ */}
              {history.length > 0 && (
                <div style={{ marginTop: 'auto', paddingTop: 8, borderTop: '1px solid rgba(13,10,44,0.06)', flexShrink: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: GRAY, fontFamily: font, marginBottom: 4 }}>
                    <IconHistory size={11} color={GRAY} style={{ verticalAlign: '-2px' }} /> ประวัติเหตุการณ์
                  </div>
                  {history.map(a => {
                    const h = getHouse(a.houseId);
                    return (
                      <div key={a.id} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '4px 0' }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: BLACK, fontFamily: font, width: 44, flexShrink: 0 }}>{h.no}</span>
                        <span style={{ fontSize: 10, color: GRAY2, fontFamily: font, flex: 1 }}>{a.date} {a.time} น.</span>
                        <span style={{
                          fontSize: 9.5, fontWeight: 700, fontFamily: font, borderRadius: 100, padding: '2px 8px', flexShrink: 0,
                          color: a.result === 'ช่วยเหลือแล้ว' ? GREEN_DARK : a.result === 'แจ้งเตือนผิดพลาด' ? '#C96A12' : '#0088FF',
                          background: a.result === 'ช่วยเหลือแล้ว' ? 'rgba(52,199,89,0.1)' : a.result === 'แจ้งเตือนผิดพลาด' ? 'rgba(232,128,42,0.1)' : 'rgba(0,136,255,0.08)',
                        }}>{a.result}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </aside>

          {/* Modal รายละเอียดพื้นฐานบ้าน — กดจากรายชื่อใน sidebar */}
          {selHouse && (() => {
            const al = houseAlertOf(selHouse.id);
            const devs = devicesOfHouse(selHouse.id);
            const off = devs.some(d => !d.online);
            return (
              <Modal
                title={`บ้าน ${selHouse.no}${selHouse.nickname ? ` · ${selHouse.nickname}` : ''}`}
                sub={selHouse.note ? `จุดสังเกต: ${selHouse.note}` : undefined}
                onClose={() => setSelected(null)} width={430} zIndex={4000}
              >
                <span style={{ display: 'inline-block', fontSize: 11.5, fontWeight: 700, fontFamily: font, borderRadius: 100, padding: '4px 14px', marginBottom: 14, color: al ? '#D0342C' : off ? '#C96A12' : GREEN_DARK, background: al ? 'rgba(255,56,60,0.1)' : off ? 'rgba(232,128,42,0.12)' : 'rgba(52,199,89,0.12)' }}>
                  {al ? 'มีเหตุ active — ดูการ์ดเหตุใน panel ขวา' : off ? 'อุปกรณ์ offline' : 'ปกติ'}
                </span>

                <div style={{ fontSize: 11, fontWeight: 700, color: GRAY2, fontFamily: font, marginBottom: 4 }}>คนในบ้าน ({selHouse.residents.length})</div>
                {selHouse.residents.length === 0 && <div style={{ fontSize: 12.5, color: GRAY2, fontFamily: font }}>—</div>}
                {selHouse.residents.map(r => (
                  <div key={r.id} style={{ fontSize: 13, color: BLACK, fontFamily: font, lineHeight: 1.6 }}>
                    <b>{r.name}</b> · {r.age} ปี{r.note && <span style={{ color: '#C96A12' }}> — {r.note}</span>}
                  </div>
                ))}

                <div style={{ fontSize: 11, fontWeight: 700, color: GRAY2, fontFamily: font, margin: '12px 0 4px' }}>อุปกรณ์ ({devs.filter(d => d.online).length}/{devs.length} online)</div>
                {devs.map(d => (
                  <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: BLACK, fontFamily: font, lineHeight: 1.7 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: d.online ? GREEN : ORANGE, flexShrink: 0 }} />
                    <span style={{ flex: 1 }}>{d.typeName} · {d.attach.kind === 'person' ? `ติดตัว ${d.attach.residentName}` : d.attach.location}</span>
                    <span style={{ fontSize: 11, color: d.online ? GREEN_DARK : '#C96A12', fontWeight: 700 }}>{d.online ? 'online' : 'offline'}</span>
                  </div>
                ))}

                <div style={{ fontSize: 11, fontWeight: 700, color: GRAY2, fontFamily: font, margin: '12px 0 4px' }}>โทรตามลำดับ</div>
                {selHouse.contacts.length === 0 && <div style={{ fontSize: 12.5, color: '#C96A12', fontFamily: font }}>ไม่มีผู้ติดต่อ — โทรนิติบุคคล/ทีม central</div>}
                {selHouse.contacts.map((c, i) => (
                  <a key={c.id} href={`tel:${c.phone}`} className="hover-btn" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', padding: '4px 0' }}>
                    <span style={{ fontSize: 12, fontWeight: 800, fontFamily: font, color: i === 0 ? '#D0342C' : GRAY2, width: 15, flexShrink: 0 }}>{i + 1}.</span>
                    <span style={{ fontSize: 13, fontWeight: i === 0 ? 700 : 500, fontFamily: font, color: BLACK, flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {c.name} <span style={{ fontWeight: 400, fontSize: 11, color: GRAY2 }}>({c.relation})</span>
                    </span>
                    <span className="num" style={{ fontSize: 13, fontWeight: 800, color: i === 0 ? '#D0342C' : PURPLE, flexShrink: 0 }}><IconPhone size={12} style={{ verticalAlign: '-2px' }} /> {c.phone}</span>
                  </a>
                ))}

                <button className="hover-btn" onClick={() => { navigateTo(selHouse); setSelected(null); }} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 16, height: 42, width: '100%',
                  borderRadius: 100, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#4438AD,#6658E1 50%,#8B5CF6)',
                  color: 'white', fontSize: 13, fontWeight: 700, fontFamily: font, boxShadow: '0 6px 18px rgba(102,88,225,0.3)',
                }}><IconNavigation size={14} style={{ flexShrink: 0 }} /> นำทางไปบ้าน {selHouse.no} — แสดงเส้นทางบนแผนที่</button>
              </Modal>
            );
          })()}
        </div>
      )}
    </div>,
    document.body
  );
}
