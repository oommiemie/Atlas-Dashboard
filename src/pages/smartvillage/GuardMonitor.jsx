/* ═══ Smart Village — Guard Portal (demo overlay) — spec 5.6 login + 5.7 จอมอนิเตอร์ ═══
   จอเฝ้าระวังจอเดียวจบ: ตัวหนังสือใหญ่ contrast สูง เปิดทิ้งไว้ทั้งกะ */
import { useState } from 'react';
import {
  getVillage, housesOf, devicesOfHouse, getHouse, getDevice, alertsOfVillage,
} from '../../data/smartVillage';
import { font, GREEN, RED, ORANGE, ElapsedSince } from './shared';

const DARK = '#12102E';
const CARD_DARK = 'rgba(255,255,255,0.06)';
const BORDER_DARK = '1px solid rgba(255,255,255,0.1)';

/* ── หน้า login รปภ. (spec 5.6) ── */
function GuardLogin({ village, onLogin }) {
  const [u, setU] = useState('vlg001-somsak');
  const [p, setP] = useState('••••••••••');
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div className="anim-scale-in" style={{ width: 400, maxWidth: '92vw', background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(30px)', border: BORDER_DARK, borderRadius: 28, padding: '36px 32px', textAlign: 'center' }}>
        <div style={{
          width: 64, height: 64, borderRadius: 20, margin: '0 auto 14px', fontSize: 28,
          background: 'linear-gradient(180deg,#8B81F2,#6658E1)', boxShadow: '0 8px 28px rgba(102,88,225,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>🛡️</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: 'white', fontFamily: font }}>Smart Village — จอเฝ้าระวัง</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', fontFamily: font, marginTop: 4 }}>{village.name}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 24, textAlign: 'left' }}>
          <div>
            <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.6)', fontFamily: font, marginBottom: 6 }}>ชื่อผู้ใช้</div>
            <input value={u} onChange={e => setU(e.target.value)} style={{ width: '100%', height: 48, borderRadius: 14, border: '1.5px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.08)', color: 'white', fontSize: 15, fontFamily: 'Inter', padding: '0 16px', outline: 'none' }} />
          </div>
          <div>
            <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.6)', fontFamily: font, marginBottom: 6 }}>รหัสผ่าน</div>
            <input type="password" value={p} onChange={e => setP(e.target.value)} style={{ width: '100%', height: 48, borderRadius: 14, border: '1.5px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.08)', color: 'white', fontSize: 15, padding: '0 16px', outline: 'none' }} />
          </div>
          <button className="hover-btn" onClick={onLogin} style={{
            height: 52, borderRadius: 100, border: 'none', cursor: 'pointer', marginTop: 6,
            background: 'linear-gradient(135deg,#4438AD,#6658E1 50%,#8B5CF6)', color: 'white',
            fontSize: 16, fontWeight: 700, fontFamily: font, boxShadow: '0 8px 24px rgba(102,88,225,0.45)',
          }}>เข้าสู่ระบบ</button>
          <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.4)', fontFamily: font, textAlign: 'center', lineHeight: 1.7, marginTop: 4 }}>
            ลืมรหัสผ่าน? ติดต่อนิติบุคคล/ผู้ดูแลระบบ Atlas เท่านั้น<br />(ไม่มีการรีเซ็ตด้วยตนเอง)
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
        <div style={{ fontSize: 46 }}>🌙</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: 'white', fontFamily: font, marginTop: 10 }}>สวัสดี {guardName}</div>
        <div style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.6)', fontFamily: font, marginTop: 8, lineHeight: 1.8 }}>
          กด "เริ่มกะเฝ้าระวัง" เพื่อเปิดเสียงแจ้งเหตุ (siren)<br />
          เบราว์เซอร์ต้องการการกดจากผู้ใช้ก่อนจึงเล่นเสียงได้ — ปุ่มนี้คือจุดเปิดเสียงของทั้งกะ
        </div>
        <button className="hover-btn" onClick={onStart} style={{
          marginTop: 20, height: 58, padding: '0 40px', borderRadius: 100, border: 'none', cursor: 'pointer',
          background: 'linear-gradient(135deg,#34C759,#19A589)', color: 'white',
          fontSize: 17, fontWeight: 800, fontFamily: font, boxShadow: '0 8px 28px rgba(52,199,89,0.4)',
        }}>▶ เริ่มกะเฝ้าระวัง · เปิดเสียง</button>
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
      borderRadius: 26, overflow: 'hidden', position: 'relative',
      background: phase === 'new' ? 'linear-gradient(125deg,#B71C1C,#E0262B 45%,#FF5A3C)' : 'linear-gradient(125deg,#8A4A0B,#C96A12 45%,#E8802A)',
      animation: phase === 'new' ? 'svSirenGlow 1.2s ease-in-out infinite' : 'none',
      border: '1.5px solid rgba(255,255,255,0.25)',
    }}>
      <div style={{ padding: '22px 26px', position: 'relative' }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ width: 62, height: 62, borderRadius: 20, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, flexShrink: 0, animation: phase === 'new' ? 'svShake 0.9s infinite' : 'none' }}>🚨</div>
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ fontSize: 24, fontWeight: 900, color: 'white', fontFamily: font, lineHeight: 1.25 }}>
              ตรวจพบการล้ม! — บ้าน {house.no}{house.nickname ? ` (${house.nickname})` : ''}
            </div>
            <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.95)', fontFamily: font, marginTop: 6, fontWeight: 600 }}>
              📍 {device.attach.kind === 'person' ? `อุปกรณ์ติดตัว — ${device.attach.residentName}` : `ตำแหน่ง: ${device.attach.location}`} · เกิดเหตุ {alert.time} น. · <ElapsedSince minAgo={alert.minAgo} style={{ fontWeight: 800 }} />
            </div>
            {alert.recovered && (
              <div style={{ display: 'inline-block', fontSize: 12.5, color: 'white', fontFamily: font, background: 'rgba(255,255,255,0.18)', borderRadius: 100, padding: '4px 14px', marginTop: 8 }}>
                📡 เครื่องรายงานว่ากลับสู่ปกติแล้ว — เหตุยังไม่ปิดจนกว่าคนจะกดปิด (กันเคสล้มแล้วลุกไม่ได้)
              </div>
            )}
          </div>
          {phase === 'new' ? (
            <button className="hover-btn" onClick={onAck} style={{
              height: 62, padding: '0 34px', borderRadius: 100, border: 'none', cursor: 'pointer', flexShrink: 0,
              background: 'white', color: '#C62828', fontSize: 18, fontWeight: 900, fontFamily: font,
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            }}>✓ รับทราบ กำลังไปช่วย</button>
          ) : !closing ? (
            <button className="hover-btn" onClick={() => setClosing(true)} style={{
              height: 54, padding: '0 28px', borderRadius: 100, border: '2px solid rgba(255,255,255,0.7)', cursor: 'pointer', flexShrink: 0,
              background: 'rgba(255,255,255,0.12)', color: 'white', fontSize: 15, fontWeight: 800, fontFamily: font,
            }}>⏹ ปิดเหตุ…</button>
          ) : null}
        </div>

        {/* ใครอยู่ในบ้าน + ผู้ติดต่อ + นำทาง */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.5fr', gap: 12, marginTop: 16 }}>
          <div style={{ background: 'rgba(0,0,0,0.18)', borderRadius: 18, padding: '14px 16px' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.7)', fontFamily: font, marginBottom: 8 }}>👥 คนในบ้าน ({house.residents.length})</div>
            {house.residents.map(r => (
              <div key={r.id} style={{ fontSize: 14, color: 'white', fontFamily: font, marginBottom: 5, lineHeight: 1.5 }}>
                <b>{r.name}</b> · {r.age} ปี {r.note && <span style={{ color: '#FFD54F' }}>· ⚠ {r.note}</span>}
              </div>
            ))}
            <button className="hover-btn" style={{
              marginTop: 8, width: '100%', height: 42, borderRadius: 12, border: '1.5px solid rgba(255,255,255,0.4)',
              background: 'rgba(255,255,255,0.1)', color: 'white', fontSize: 13.5, fontWeight: 700, fontFamily: font, cursor: 'pointer',
            }}>🧭 นำทางไปบ้าน {house.no} (เปิด Google Maps)</button>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.18)', borderRadius: 18, padding: '14px 16px' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.7)', fontFamily: font, marginBottom: 8 }}>📞 ผู้ติดต่อ (เรียงลำดับ) — กดโทรได้ทันที</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
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
                  <span className="num" style={{ fontSize: 14, fontWeight: 800, color: i === 0 ? '#C62828' : '#FFD54F' }}>📞 {c.phone}</span>
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
  const village = getVillage('vlg-001');
  const houses = housesOf('vlg-001');
  const guard = { name: 'สมศักดิ์ เข้มแข็ง' };
  const [screen, setScreen] = useState('login'); // login → shift → monitor
  const [muted, setMuted] = useState(false);
  const [alertPhase, setAlertPhase] = useState('new'); // new → acked → closed
  const [closedResult, setClosedResult] = useState(null);

  const alert = alertsOfVillage('vlg-001').find(a => a.status !== 'ปิดแล้ว');
  const alertHouse = alert ? getHouse(alert.houseId) : null;
  const alertDevice = alert ? getDevice(alert.deviceId) : null;
  const showAlert = alert && alertPhase !== 'closed';

  const devTotal = houses.flatMap(h => devicesOfHouse(h.id));
  const online = devTotal.filter(d => d.online).length;
  const history = alertsOfVillage('vlg-001').filter(a => a.status === 'ปิดแล้ว');

  return (
    <div className="anim-backdrop" style={{
      position: 'fixed', inset: 0, zIndex: 3000, display: 'flex', flexDirection: 'column',
      background: `linear-gradient(160deg, #1A1340 0%, ${DARK} 55%, #0D0B24 100%)`,
    }}>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 22px', borderBottom: BORDER_DARK, flexWrap: 'wrap' }}>
        <div style={{ width: 36, height: 36, borderRadius: 12, background: 'linear-gradient(180deg,#8B81F2,#6658E1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🛡️</div>
        <div>
          <div style={{ fontSize: 14.5, fontWeight: 800, color: 'white', fontFamily: font }}>Guard Portal — {village.name}</div>
          <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.45)', fontFamily: font }}>/guard · portal แยกจาก dashboard (login คนละระบบ) · ตัวอย่างจอ Desktop ป้อมยาม</div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
          {screen === 'monitor' && (
            <>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11.5, fontFamily: font, color: '#7CF5A4', background: 'rgba(52,199,89,0.15)', border: '1px solid rgba(52,199,89,0.3)', borderRadius: 100, padding: '5px 12px' }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: GREEN, animation: 'svBlink 1.6s infinite' }} />เชื่อมต่อแล้ว
              </span>
              <button className="hover-btn" onClick={() => setMuted(m => !m)} style={{
                height: 34, padding: '0 14px', borderRadius: 100, cursor: 'pointer', fontSize: 12, fontWeight: 700, fontFamily: font,
                border: '1px solid rgba(255,255,255,0.2)', background: muted ? 'rgba(255,56,60,0.15)' : 'rgba(255,255,255,0.08)',
                color: muted ? '#FF8A80' : 'white',
              }}>{muted ? '🔇 ปิดเสียงชั่วคราว' : '🔊 เสียงเปิดอยู่'}</button>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontFamily: font }}>👮 {guard.name}</span>
            </>
          )}
          <button className="hover-btn" onClick={onExit} style={{
            height: 34, padding: '0 16px', borderRadius: 100, border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer',
            background: 'rgba(255,255,255,0.08)', color: 'white', fontSize: 12, fontWeight: 600, fontFamily: font,
          }}>✕ ออกจาก demo</button>
        </div>
      </div>

      {screen === 'login' && <GuardLogin village={village} onLogin={() => setScreen('shift')} />}
      {screen === 'shift' && <StartShift guardName={guard.name} onStart={() => setScreen('monitor')} />}

      {screen === 'monitor' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: 22, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* เหตุ active */}
          {showAlert && (
            <AlertPanel
              alert={alert} house={alertHouse} device={alertDevice} phase={alertPhase}
              onAck={() => setAlertPhase('acked')}
              onClose={(r) => { setAlertPhase('closed'); setClosedResult(r); }}
            />
          )}
          {alertPhase === 'closed' && (
            <div className="anim-slide-up" style={{ borderRadius: 20, padding: '16px 20px', background: 'rgba(52,199,89,0.12)', border: '1.5px solid rgba(52,199,89,0.35)', display: 'flex', gap: 12, alignItems: 'center' }}>
              <span style={{ fontSize: 24 }}>✅</span>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#7CF5A4', fontFamily: font }}>ปิดเหตุแล้ว — ผล: {closedResult}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', fontFamily: font, marginTop: 2 }}>บันทึกผู้ปิดเหตุ: {guard.name} · ครอบครัวในแอป MyAtlas เห็นผลนี้ทันที (realtime)</div>
              </div>
            </div>
          )}

          {/* แถบสรุป */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {[
              ['🏠 บ้านที่เฝ้าระวัง', houses.filter(h => devicesOfHouse(h.id).length > 0).length + ' หลัง'],
              ['📡 อุปกรณ์ online', `${online}/${devTotal.length}`],
              ['🚨 เหตุวันนี้', showAlert || alertPhase === 'closed' ? '1 เหตุ' : '0 เหตุ'],
            ].map(([l, v]) => (
              <div key={l} style={{ background: CARD_DARK, border: BORDER_DARK, borderRadius: 16, padding: '12px 20px' }}>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontFamily: font }}>{l}</div>
                <div className="num" style={{ fontSize: 21, fontWeight: 800, color: 'white', marginTop: 2 }}>{v}</div>
              </div>
            ))}
          </div>

          {/* ผังบ้าน */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.65)', fontFamily: font, marginBottom: 10 }}>ผังบ้านที่มีอุปกรณ์ ({houses.filter(h => devicesOfHouse(h.id).length > 0).length} หลัง)</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 10 }}>
              {houses.filter(h => devicesOfHouse(h.id).length > 0).map(h => {
                const devs = devicesOfHouse(h.id);
                const isAlertHouse = showAlert && alertHouse.id === h.id;
                const hasOffline = devs.some(d => !d.online);
                return (
                  <div key={h.id} style={{
                    background: isAlertHouse ? 'rgba(255,56,60,0.18)' : CARD_DARK,
                    border: isAlertHouse ? '2px solid #FF5A3C' : hasOffline ? '1.5px solid rgba(232,128,42,0.45)' : BORDER_DARK,
                    borderRadius: 18, padding: '14px 16px',
                    animation: isAlertHouse && alertPhase === 'new' ? 'svSirenGlow 1.2s infinite' : 'none',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 17 }}>{isAlertHouse ? '🚨' : '🏠'}</span>
                      <span style={{ fontSize: 16, fontWeight: 800, color: 'white', fontFamily: font }}>{h.no}</span>
                      <span style={{
                        marginLeft: 'auto', width: 10, height: 10, borderRadius: '50%',
                        background: isAlertHouse ? RED : hasOffline ? ORANGE : GREEN,
                        animation: isAlertHouse ? 'svBlink 0.8s infinite' : 'none',
                      }} />
                    </div>
                    {h.nickname && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', fontFamily: font, marginTop: 3 }}>{h.nickname}</div>}
                    <div style={{ fontSize: 11.5, fontWeight: 600, fontFamily: font, marginTop: 6, color: isAlertHouse ? '#FF8A80' : hasOffline ? '#FFB74D' : 'rgba(255,255,255,0.7)' }}>
                      {isAlertHouse ? (alertPhase === 'new' ? '⚠ ตรวจพบการล้ม!' : 'กำลังช่วยเหลือ…') : hasOffline ? `อุปกรณ์ offline ${devs.filter(d => !d.online).length} เครื่อง` : 'ปกติ'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ประวัติเหตุการณ์ */}
          <div>
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
    </div>
  );
}
