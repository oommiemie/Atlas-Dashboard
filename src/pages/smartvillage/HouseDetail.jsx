/* ═══ Smart Village — รายละเอียดบ้าน (ศูนย์รวมทุกอย่างของบ้านหลังเดียว) — spec 5.4 ═══ */
import { useState } from 'react';
import {
  getVillage, getHouse, devicesOfHouse, alertsOfHouse, ALERT_RESULT_META, ALERT_STATUS_META,
} from '../../data/smartVillage';
import {
  font, BLACK, GRAY, GRAY2, PURPLE, GREEN, RED, ORANGE, BLUE,
  card, btnPrimary, btnGhost, btnDanger, SectionTitle, Pill, Modal, Field, TextInput, SVMap, CopyBtn, EmptyState, FakeQR, ElapsedSince,
} from './shared';

const AVATAR_COLORS = ['linear-gradient(135deg,#8B81F2,#6658E1)', 'linear-gradient(135deg,#4FC3F7,#1398D8)', 'linear-gradient(135deg,#F2A254,#E8802A)'];

function ConfirmModal({ title, body, confirmLabel, onClose }) {
  return (
    <Modal title={title} onClose={onClose} width={440}>
      <div style={{ fontSize: 13, color: GRAY, fontFamily: font, lineHeight: 1.7 }}>{body}</div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 18 }}>
        <button className="hover-btn" style={btnGhost} onClick={onClose}>ยกเลิก</button>
        <button className="hover-btn" style={{ ...btnPrimary, background: 'linear-gradient(135deg,#E0262B,#FF5A3C)', boxShadow: '0 4px 12px rgba(255,56,60,0.3)' }} onClick={onClose}>{confirmLabel}</button>
      </div>
    </Modal>
  );
}

/* ── ทิศที่ 2: ทีมงานเชื่อมให้ — กรอกรหัสครอบครัว ── */
function LinkFamilyModal({ onClose }) {
  const [code, setCode] = useState('');
  const [step, setStep] = useState(1); // 1 กรอก → 2 ยืนยัน masked → 3 ส่งคำขอแล้ว
  return (
    <Modal
      title="เชื่อมครอบครัวให้ลูกบ้าน (ทิศที่ 2)"
      sub="ลูกบ้านเปิดหน้า 'รหัสครอบครัว' ในแอป MyAtlas มาให้ดู หรือบอกทางโทรศัพท์"
      onClose={onClose} width={480}
    >
      {step === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label="รหัสครอบครัว" required hint="รูปแบบ FAM-XXXX-XXXX">
            <TextInput value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="FAM-____-____" style={{ fontFamily: 'Inter', letterSpacing: 1.5, fontWeight: 600 }} />
          </Field>
          <button className="hover-btn" style={{ ...btnPrimary, justifyContent: 'center', opacity: code.length >= 8 ? 1 : 0.45 }} onClick={() => code.length >= 8 && setStep(2)}>ตรวจสอบรหัส</button>
        </div>
      )}
      {step === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ background: 'rgba(102,88,225,0.06)', border: '1px solid rgba(102,88,225,0.15)', borderRadius: 16, padding: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: GRAY2, fontFamily: font }}>ข้อมูลยืนยัน (masked กันกรอกผิด)</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: BLACK, fontFamily: font, marginTop: 6 }}>กลุ่ม "ครอบครัวสุขใ***"</div>
            <div style={{ fontSize: 12, color: GRAY, fontFamily: font, marginTop: 2 }}>สมาชิก 4 คน · สร้างเมื่อ มี.ค. 2569</div>
          </div>
          <div style={{ fontSize: 11.5, color: ORANGE, fontFamily: font, background: 'rgba(232,128,42,0.08)', borderRadius: 12, padding: '9px 12px', lineHeight: 1.6 }}>
            ⚠ ต้องรอ<b>ผู้ดูแลครอบครัวกดอนุมัติในแอป</b>เสมอ — กันคนรู้รหัสเอาไปผูกบ้านอื่นโดยเจ้าตัวไม่ยินยอม · คำขอหมดอายุใน 72 ชม.
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button className="hover-btn" style={btnGhost} onClick={() => setStep(1)}>← กรอกใหม่</button>
            <button className="hover-btn" style={btnPrimary} onClick={() => setStep(3)}>ส่งคำขอเชื่อม</button>
          </div>
        </div>
      )}
      {step === 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center', textAlign: 'center', padding: '8px 0' }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(232,128,42,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>⏳</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: BLACK, fontFamily: font }}>ส่งคำขอแล้ว — รออนุมัติจากผู้ดูแลครอบครัว</div>
          <div style={{ fontSize: 12, color: GRAY, fontFamily: font, lineHeight: 1.7 }}>
            ผู้ดูแลได้รับ push ในแอป MyAtlas แล้ว เมื่อกดยืนยันสถานะจะเปลี่ยนเป็น "เชื่อมแล้ว" อัตโนมัติ<br />คำขอหมดอายุใน 72 ชม. · ยกเลิกคำขอได้จากหน้านี้
          </div>
          <button className="hover-btn" style={btnPrimary} onClick={onClose}>ปิด</button>
        </div>
      )}
    </Modal>
  );
}

export default function HouseDetail({ villageId, houseId, onAddDevice }) {
  const village = getVillage(villageId);
  const house = getHouse(houseId);
  const devices = devicesOfHouse(houseId);
  const alerts = alertsOfHouse(houseId);
  const activeAlert = alerts.find(a => a.status !== 'ปิดแล้ว');
  const [modal, setModal] = useState(null);

  /* ลากจัดลำดับผู้ติดต่อ — ลำดับนี้คือลำดับที่ รปภ. เห็นตอนเกิดเหตุ */
  const [contacts, setContacts] = useState(house.contacts);
  const [dragIdx, setDragIdx] = useState(null);
  const onDragOverContact = (e, i) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === i) return;
    setContacts(cs => {
      const next = [...cs];
      const [moved] = next.splice(dragIdx, 1);
      next.splice(i, 0, moved);
      return next;
    });
    setDragIdx(i);
  };

  const linked = house.familyLinks.filter(f => f.status === 'เชื่อมแล้ว');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* เหตุ active ของบ้านนี้ */}
      {activeAlert && (
        <div className="anim-slide-up" style={{
          borderRadius: 20, padding: '14px 18px', color: 'white',
          background: 'linear-gradient(120deg, #E0262B, #FF5A3C)',
          animation: 'svSirenGlow 1.6s ease-in-out infinite',
          display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
        }}>
          <span style={{ fontSize: 22, animation: 'svShake 0.9s infinite' }}>🚨</span>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ fontSize: 14.5, fontWeight: 700, fontFamily: font }}>{activeAlert.detectType} — {activeAlert.location} · <ElapsedSince minAgo={activeAlert.minAgo} /></div>
            <div style={{ fontSize: 11.5, fontFamily: font, opacity: 0.92, marginTop: 2 }}>
              {activeAlert.status === 'ใหม่' ? '⚠ ยังไม่มีผู้รับทราบ — siren ที่ป้อมยามยังดังอยู่' : `✓ ${activeAlert.ackBy} รับทราบเมื่อ ${activeAlert.ackAt} น.`}
            </div>
          </div>
        </div>
      )}

      {/* (ก) ข้อมูลบ้าน */}
      <div className="anim-slide-up" style={{ ...card, display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div style={{
              width: 54, height: 54, borderRadius: 18, fontSize: 24, flexShrink: 0,
              background: 'linear-gradient(180deg,#8B81F2,#6658E1)', boxShadow: '0 6px 16px rgba(102,88,225,0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>🏠</div>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: 19, fontWeight: 700, color: BLACK, fontFamily: font }}>
                บ้าน {house.no}{house.nickname && <span style={{ fontWeight: 500, color: GRAY }}> · {house.nickname}</span>}
              </h2>
              <div style={{ fontSize: 12, color: GRAY, fontFamily: font, marginTop: 3 }}>{village.name} · {village.province}</div>
              {house.note && <div style={{ fontSize: 11.5, color: GRAY2, fontFamily: font, marginTop: 2 }}>📝 {house.note}</div>}
            </div>
            <button className="hover-btn" style={{ ...btnGhost, padding: '6px 14px', fontSize: 12 }}>✎ แก้ไข</button>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <span className="num" style={{ fontSize: 12, color: GRAY, fontFamily: font }}>📍 {house.lat}, {house.lng}</span>
            <CopyBtn text={`${house.lat}, ${house.lng}`} label="copy พิกัด" />
            <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
              {[['คนในบ้าน', house.residents.length], ['อุปกรณ์', devices.length], ['ผู้ติดต่อ', house.contacts.length], ['Family', linked.length]].map(([l, v]) => (
                <div key={l} style={{ background: 'rgba(102,88,225,0.06)', borderRadius: 14, padding: '8px 14px', textAlign: 'center' }}>
                  <div className="num" style={{ fontSize: 17, fontWeight: 800, color: BLACK }}>{v}</div>
                  <div style={{ fontSize: 10, color: GRAY2, fontFamily: font }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <SVMap points={[{ lat: house.lat, lng: house.lng, name: `บ้าน ${house.no}`, color: activeAlert ? RED : PURPLE, big: true, status: activeAlert ? 'alert' : 'ok' }]} center={[house.lng, house.lat]} zoom={16.5} height={170} radius={16} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'start' }}>
        {/* (ข) คนในบ้าน */}
        <div className="anim-slide-up delay-1" style={{ ...card }}>
          <SectionTitle icon="👥" title="คนในบ้าน (Resident)" sub="ข้อมูลช่วย รปภ./กู้ภัยตอนเข้าช่วยเหตุ — ไม่ใช่เวชระเบียน"
            right={<button className="hover-btn" style={{ ...btnGhost, padding: '6px 12px', fontSize: 11.5 }} onClick={() => setModal('resident')}>+ เพิ่มคน</button>} />
          {house.residents.length === 0 ? (
            <EmptyState icon="👤" title="ยังไม่มีทะเบียนคนในบ้าน" sub="จำเป็นสำหรับอุปกรณ์ติดตัวคน และช่วยผู้ช่วยเหลือรู้ว่าในบ้านมีใครบ้าง" />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {house.residents.map((r, i) => (
                <div key={r.id} style={{ display: 'flex', gap: 10, alignItems: 'center', background: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.7)', borderRadius: 16, padding: '10px 12px' }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: '50%', flexShrink: 0, color: 'white', fontSize: 14, fontWeight: 700, fontFamily: font,
                    background: AVATAR_COLORS[i % AVATAR_COLORS.length], display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{r.name[0]}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: BLACK, fontFamily: font }}>{r.name}</span>
                      <span style={{ fontSize: 11, color: GRAY2, fontFamily: font }}>{r.age} ปี · {r.gender}</span>
                      {r.wearable && <Pill color={BLUE} bg="rgba(19,152,216,0.1)" dot={false}>⌚ มีอุปกรณ์ติดตัว</Pill>}
                    </div>
                    {r.note && <div style={{ fontSize: 11, color: ORANGE, fontFamily: font, marginTop: 2 }}>⚠ {r.note}</div>}
                  </div>
                  <button className="hover-btn" style={{ ...btnGhost, padding: '4px 10px', fontSize: 10.5 }}>แก้ไข</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* (ค) อุปกรณ์ */}
        <div className="anim-slide-up delay-1" style={{ ...card }}>
          <SectionTitle icon="📡" title="อุปกรณ์" sub="สถานะ realtime จากเครื่อง"
            right={<button className="hover-btn" style={{ ...btnGhost, padding: '6px 12px', fontSize: 11.5 }} onClick={onAddDevice}>+ เพิ่มอุปกรณ์</button>} />
          {devices.length === 0 ? (
            <EmptyState icon="📡" warn title="ยังไม่ติดตั้งอุปกรณ์" sub="บ้านนี้ยังไม่มีการเฝ้าระวัง" />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {devices.map(d => (
                <div key={d.id} style={{
                  background: 'rgba(255,255,255,0.55)', borderRadius: 16, padding: '10px 12px',
                  border: `1px solid ${!d.online ? 'rgba(232,128,42,0.35)' : 'rgba(255,255,255,0.7)'}`,
                }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: 12, flexShrink: 0, fontSize: 17,
                      background: d.type === 'radar' ? 'rgba(102,88,225,0.1)' : 'rgba(19,152,216,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>{d.type === 'radar' ? '📶' : '🆘'}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: BLACK, fontFamily: font }}>{d.typeName}</div>
                      <div className="num" style={{ fontSize: 10.5, color: GRAY2 }}>IMEI {d.imei}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
                      {d.online ? <Pill color={GREEN} bg="rgba(52,199,89,0.12)">online</Pill> : <Pill color={ORANGE} bg="rgba(232,128,42,0.12)">offline · {d.lastSeen}</Pill>}
                      {d.presence && <Pill color={d.presence === 'มีคน' ? BLUE : GRAY2} bg={d.presence === 'มีคน' ? 'rgba(19,152,216,0.1)' : 'rgba(146,145,165,0.12)'} dot={false}>{d.presence === 'มีคน' ? '👤 มีคนในห้อง' : 'ไม่มีคนในห้อง'}</Pill>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 8, paddingTop: 8, borderTop: '1px dashed rgba(0,0,0,0.06)' }}>
                    <span style={{ fontSize: 11, color: GRAY, fontFamily: font }}>
                      {d.attach.kind === 'house' ? `🚪 ติดกับบ้าน — ${d.attach.location}` : `⌚ ติดกับคน — ${d.attach.residentName}`}
                    </span>
                    <span style={{ fontSize: 10.5, color: GRAY2, fontFamily: font, marginLeft: 'auto' }}>เห็นล่าสุด {d.lastSeen}</span>
                    <button className="hover-btn" style={{ ...btnDanger, padding: '3px 10px', fontSize: 10.5 }} onClick={() => setModal('remove-device')}>ถอด/ย้าย</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* (ง) ผู้ติดต่อเมื่อเกิดเหตุ */}
        <div className="anim-slide-up delay-2" style={{ ...card }}>
          <SectionTitle icon="📞" title="ผู้ติดต่อเมื่อเกิดเหตุ" sub="ลากจัดลำดับได้ — ลำดับนี้คือลำดับที่ รปภ. เห็นตอนเกิดเหตุ"
            right={<button className="hover-btn" style={{ ...btnGhost, padding: '6px 12px', fontSize: 11.5 }} onClick={() => setModal('contact')}>+ เพิ่มผู้ติดต่อ</button>} />
          {contacts.length === 0 ? (
            <EmptyState icon="📵" warn title="ยังไม่มีผู้ติดต่อ" sub="เมื่อเกิดเหตุ รปภ. จะไม่รู้ว่าต้องโทรหาใคร — ควรเพิ่มอย่างน้อย 1 รายการ"
              cta={<button className="hover-btn" style={btnPrimary} onClick={() => setModal('contact')}>+ เพิ่มผู้ติดต่อแรก</button>} />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {contacts.map((c, i) => (
                <div
                  key={c.id}
                  draggable
                  onDragStart={() => setDragIdx(i)}
                  onDragOver={(e) => onDragOverContact(e, i)}
                  onDragEnd={() => setDragIdx(null)}
                  style={{
                    display: 'flex', gap: 10, alignItems: 'center', background: 'rgba(255,255,255,0.55)',
                    border: `1px solid ${dragIdx === i ? 'rgba(102,88,225,0.5)' : 'rgba(255,255,255,0.7)'}`,
                    borderRadius: 16, padding: '10px 12px',
                    opacity: dragIdx === i ? 0.65 : 1,
                    boxShadow: dragIdx === i ? '0 6px 18px rgba(102,88,225,0.25)' : 'none',
                    cursor: 'grab',
                  }}
                >
                  <span title="ลากเพื่อจัดลำดับ" style={{ cursor: 'grab', color: GRAY2, fontSize: 13 }}>⠿</span>
                  <span style={{
                    width: 22, height: 22, borderRadius: '50%', flexShrink: 0, fontSize: 11, fontWeight: 700, fontFamily: font,
                    background: i === 0 ? 'linear-gradient(180deg,#8B81F2,#6658E1)' : 'rgba(102,88,225,0.12)',
                    color: i === 0 ? 'white' : PURPLE,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{i + 1}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: BLACK, fontFamily: font }}>
                      {c.name} <span style={{ fontWeight: 400, fontSize: 11, color: GRAY2 }}>· {c.relation}</span>
                    </div>
                    {c.note && <div style={{ fontSize: 10.5, color: GRAY, fontFamily: font }}>{c.note}</div>}
                  </div>
                  <a href={`tel:${c.phone}`} className="hover-btn" style={{ ...btnGhost, padding: '5px 12px', fontSize: 11.5, textDecoration: 'none' }}>📞 {c.phone}</a>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* (จ) การเชื่อมครอบครัว */}
        <div className="anim-slide-up delay-2" style={{ ...card }}>
          <SectionTitle icon="🔗" title="การเชื่อมครอบครัว (Family Link)" sub="บ้านเดียวเชื่อมได้หลายกลุ่ม — เกิดเหตุแจ้งทุกกลุ่ม" />
          {/* ทิศที่ 1: รหัสบ้าน + QR */}
          <div style={{ display: 'flex', gap: 14, background: 'rgba(102,88,225,0.05)', border: '1px solid rgba(102,88,225,0.12)', borderRadius: 18, padding: 14 }}>
            <FakeQR code={house.houseCode} size={92} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ fontSize: 11, color: GRAY2, fontFamily: font }}>ทิศที่ 1 — ลูกบ้านเชื่อมเอง (เส้นทางหลัก) · สแกน QR ในแอป MyAtlas</div>
              <div className="num" style={{ fontSize: 18, fontWeight: 800, color: BLACK, letterSpacing: 1 }}>{house.houseCode}</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <CopyBtn text={house.houseCode} label="copy รหัส" />
                <button className="hover-btn" style={{ ...btnGhost, padding: '5px 12px', fontSize: 11.5 }}>⬇ ดาวน์โหลด QR</button>
                <button className="hover-btn" style={{ ...btnDanger, padding: '5px 12px', fontSize: 11.5 }} onClick={() => setModal('regen')}>↻ สร้างรหัสใหม่</button>
              </div>
            </div>
          </div>
          {/* ทิศที่ 2 + รายการ group */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
            {house.familyLinks.map(f => (
              <div key={f.id} style={{ display: 'flex', gap: 10, alignItems: 'center', background: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.7)', borderRadius: 16, padding: '10px 12px' }}>
                <span style={{ fontSize: 16 }}>{f.status === 'เชื่อมแล้ว' ? '👨‍👩‍👧‍👦' : '⏳'}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: BLACK, fontFamily: font }}>{f.groupName} <span style={{ fontWeight: 400, fontSize: 11, color: GRAY2 }}>· {f.members} สมาชิก</span></div>
                  <div style={{ fontSize: 10.5, color: GRAY2, fontFamily: font }}>{f.source} · {f.date}{f.expires ? ` · ${f.expires}` : ''}</div>
                </div>
                {f.status === 'เชื่อมแล้ว'
                  ? <Pill color={GREEN} bg="rgba(52,199,89,0.12)">เชื่อมแล้ว</Pill>
                  : <Pill color={ORANGE} bg="rgba(232,128,42,0.12)">รออนุมัติ</Pill>}
                <button className="hover-btn" style={{ ...btnDanger, padding: '4px 10px', fontSize: 10.5 }} onClick={() => setModal('unlink')}>
                  {f.status === 'เชื่อมแล้ว' ? 'ยกเลิกเชื่อม' : 'ยกเลิกคำขอ'}
                </button>
              </div>
            ))}
            {house.familyLinks.length === 0 && (
              <EmptyState icon="🔗" warn title="ยังไม่เชื่อมครอบครัว" sub="ให้ลูกบ้านสแกน QR ด้านบนในแอป MyAtlas หรือทีมงานกรอกรหัสครอบครัวเชื่อมให้" />
            )}
            <button className="hover-btn" style={{ ...btnGhost, justifyContent: 'center' }} onClick={() => setModal('linkfam')}>
              ⌨ ทีมงานเชื่อมให้ — กรอกรหัสครอบครัว (ทิศที่ 2)
            </button>
          </div>
        </div>
      </div>

      {/* (ฉ) ประวัติเหตุการณ์ของบ้าน */}
      <div className="anim-slide-up delay-3" style={{ ...card }}>
        <SectionTitle icon="🕘" title="ประวัติเหตุการณ์ของบ้าน" sub={`${alerts.length} เหตุการณ์`} />
        {alerts.length === 0 ? (
          <EmptyState icon="✅" title="ยังไม่เคยมีเหตุ" sub="บ้านนี้ไม่เคยมีการแจ้งเหตุ" />
        ) : (
          <div style={{ position: 'relative', paddingLeft: 22 }}>
            <div style={{ position: 'absolute', left: 7, top: 8, bottom: 8, width: 2, background: 'linear-gradient(180deg, rgba(102,88,225,0.3), rgba(102,88,225,0.06))', borderRadius: 2 }} />
            {alerts.map(a => {
              const active = a.status !== 'ปิดแล้ว';
              return (
                <div key={a.id} style={{ position: 'relative', paddingBottom: 14 }}>
                  <span style={{
                    position: 'absolute', left: -22, top: 5, width: 16, height: 16, borderRadius: '50%',
                    background: active ? RED : 'white', border: `3px solid ${active ? RED : PURPLE}`,
                    boxShadow: active ? '0 0 0 4px rgba(255,56,60,0.15)' : 'none',
                    animation: active ? 'svBlink 1.2s infinite' : 'none',
                  }} />
                  <div style={{ background: active ? 'rgba(255,56,60,0.05)' : 'rgba(255,255,255,0.55)', border: `1px solid ${active ? 'rgba(255,56,60,0.2)' : 'rgba(255,255,255,0.7)'}`, borderRadius: 16, padding: '12px 14px' }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                      <span className="num" style={{ fontSize: 11, color: GRAY2 }}>{a.no}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: BLACK, fontFamily: font }}>{a.detectType} · {a.location}</span>
                      <span style={{ fontSize: 11.5, color: GRAY, fontFamily: font }}>{a.date} {a.time} น.</span>
                      <span style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                        <Pill color={ALERT_STATUS_META[a.status].color} bg={ALERT_STATUS_META[a.status].bg}>{a.status}</Pill>
                        {a.result && <Pill color={ALERT_RESULT_META[a.result].color} bg={ALERT_RESULT_META[a.result].bg} dot={false}>{a.result}</Pill>}
                      </span>
                    </div>
                    <div style={{ fontSize: 11.5, color: GRAY, fontFamily: font, marginTop: 6, lineHeight: 1.6 }}>
                      {a.recovered && <div>📡 เครื่องรายงานว่ากลับสู่ปกติ (ไม่ปิดเหตุอัตโนมัติ)</div>}
                      {a.ackBy && <div>✓ รับทราบโดย {a.ackBy} เมื่อ {a.ackAt} น.</div>}
                      {a.closedBy && <div>⏹ ปิดเหตุโดย {a.closedBy} เมื่อ {a.closedAt} น.{a.note ? ` — "${a.note}"` : ''}</div>}
                      {!a.ackBy && <div style={{ color: RED, fontWeight: 600 }}>⚠ ยังไม่มีผู้รับทราบ</div>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      {modal === 'linkfam' && <LinkFamilyModal onClose={() => setModal(null)} />}
      {modal === 'regen' && <ConfirmModal title="สร้างรหัสบ้านใหม่?" body="รหัสเดิมและ QR ที่พิมพ์แจกไปแล้วจะใช้ไม่ได้ทันที — ใช้กรณีรหัสหลุดเท่านั้น" confirmLabel="สร้างรหัสใหม่" onClose={() => setModal(null)} />}
      {modal === 'unlink' && <ConfirmModal title="ยกเลิกการเชื่อมครอบครัว?" body="กลุ่มนี้จะไม่ได้รับแจ้งเตือนเหตุของบ้านนี้อีก" confirmLabel="ยกเลิกการเชื่อม" onClose={() => setModal(null)} />}
      {modal === 'remove-device' && <ConfirmModal title="ถอด/ย้ายอุปกรณ์?" body="อุปกรณ์จะหยุดเฝ้าระวังบ้านนี้ — เลือกย้ายไปบ้านอื่นได้ในหน้าอุปกรณ์" confirmLabel="ถอดอุปกรณ์" onClose={() => setModal(null)} />}
      {modal === 'resident' && (
        <Modal title="+ เพิ่มคนในบ้าน" onClose={() => setModal(null)} width={480}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Field label="ชื่อ-นามสกุล หรือชื่อเรียก" required><TextInput placeholder="เช่น สมศรี บุญมาก" /></Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="อายุ/ปีเกิด"><TextInput placeholder="เช่น 78" /></Field>
              <Field label="เพศ"><TextInput placeholder="หญิง/ชาย" /></Field>
            </div>
            <Field label="โน้ตสำหรับผู้ช่วยเหลือ" hint='ข้อความสั้น เช่น "ติดเตียง", "หูตึง", "มีโรคหัวใจ" — ไม่ใช่เวชระเบียน'><TextInput placeholder="(ไม่บังคับ)" /></Field>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="hover-btn" style={btnGhost} onClick={() => setModal(null)}>ยกเลิก</button>
              <button className="hover-btn" style={btnPrimary} onClick={() => setModal(null)}>บันทึก</button>
            </div>
          </div>
        </Modal>
      )}
      {modal === 'contact' && (
        <Modal title="+ เพิ่มผู้ติดต่อ" sub="ลำดับผู้ติดต่อ = ลำดับที่ รปภ. เห็นตอนเกิดเหตุ" onClose={() => setModal(null)} width={480}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 12 }}>
              <Field label="ชื่อ" required><TextInput placeholder="เช่น น้ำฝน บุญมาก" /></Field>
              <Field label="ความสัมพันธ์"><TextInput placeholder="ลูก/หลาน/เพื่อนบ้าน/นิติฯ" /></Field>
            </div>
            <Field label="เบอร์โทร" required><TextInput placeholder="08x-xxx-xxxx" /></Field>
            <Field label="หมายเหตุ"><TextInput placeholder="(ไม่บังคับ)" /></Field>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="hover-btn" style={btnGhost} onClick={() => setModal(null)}>ยกเลิก</button>
              <button className="hover-btn" style={btnPrimary} onClick={() => setModal(null)}>บันทึก</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
