/* ═══ Smart Village — รายละเอียดบ้าน (ศูนย์รวมทุกอย่างของบ้านหลังเดียว) — spec 5.4 ═══ */
import { useState, useRef, useEffect } from 'react';
import {
  getVillage, getHouse, devicesOfHouse, alertsOfHouse, ALERT_RESULT_META, ALERT_STATUS_META,
} from '../../data/smartVillage';
import {
  font, BLACK, GRAY, GRAY2, PURPLE, GREEN, RED, ORANGE, BLUE,
  card, btnPrimary, btnGhost, btnDanger, SectionTitle, Pill, Modal, Field, TextInput, SVMap, CopyBtn, EmptyState, FakeQR, ElapsedSince,
} from './shared';
import {
  IconAlertTriangle, IconHourglass, IconUrgent, IconCheck, IconHome, IconNote, IconPencil,
  IconMapPin, IconUsers, IconUser, IconDeviceWatch, IconAntennaBars5, IconRadar2, IconSos,
  IconDoor, IconPhone, IconPhoneOff, IconGripVertical, IconLink, IconDownload, IconRefresh,
  IconUsersGroup, IconKeyboard, IconHistory, IconCircleCheck, IconPlayerStopFilled, IconArrowLeft,
} from '@tabler/icons-react';
import { IconClockHour3 } from '@tabler/icons-react';
import imgFallScene from '../../assets/images/sv-fall-scene.png';
import imgFamily3d from '../../assets/images/sv-family-3d.png';
import imgDevice3d from '../../assets/images/sv-device-3d.png';
import imgContact3d from '../../assets/images/sv-contact-3d.png';
import imgHistory3d from '../../assets/images/sv-history-3d.png';
import vidScenery from '../../assets/images/sv-village-scene.mp4';
import imgHouse3d from '../../assets/images/sv-house-3d.png';
import imgNote3d from '../../assets/images/sv-note-3d.png';
import imgLocation3d from '../../assets/images/sv-location-3d.png';

const AVATAR_COLORS = ['linear-gradient(135deg,#8B81F2,#6658E1)', 'linear-gradient(135deg,#4FC3F7,#1398D8)', 'linear-gradient(135deg,#F2A254,#E8802A)'];

/* ── หัวการ์ดแนวนอนสไตล์ hero banner (PatientProfile tab เยี่ยมบ้าน): icon ซ้าย · title+sub ซ้อน · action pill ขวา ── */
function VitalHead({ grad, shadow, icon, bigIcon, img, imgW = 128, imgMB = -16, title, value, unit, action }) {
  return (
    <div style={{
      background: grad, borderRadius: 16, padding: 16, color: 'white',
      position: 'relative', boxShadow: `0 6px 18px ${shadow}`,
      display: 'flex', gap: 14, alignItems: 'center', marginBottom: 14,
    }}>
      {/* watermark bigIcon — clip ในกรอบ banner */}
      <div aria-hidden style={{ position: 'absolute', inset: 0, borderRadius: 16, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', right: -14, bottom: -22, opacity: 0.18, transform: 'rotate(-12deg)' }}>{bigIcon}</div>
      </div>
      {img
        ? <img src={img} alt="" aria-hidden style={{ width: imgW, height: 'auto', flexShrink: 0, alignSelf: 'flex-end', marginBottom: imgMB, marginTop: -28, marginLeft: -4, objectFit: 'contain', pointerEvents: 'none', position: 'relative', WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 94%)', maskImage: 'linear-gradient(to bottom, black 60%, transparent 94%)' }} />
        : <div style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(255,255,255,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{icon}</div>}
      <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>
        <div style={{ fontSize: 16, fontWeight: 700, fontFamily: font, lineHeight: 1.3 }}>{title}</div>
        <div style={{ fontSize: 12, fontFamily: font, marginTop: 3, opacity: 0.9 }}>
          <span className="num" style={{ fontWeight: 700 }}>{value}</span>{unit ? ` ${unit}` : ''}
        </div>
      </div>
      {action && <div style={{ flexShrink: 0, position: 'relative' }}>{action}</div>}
    </div>
  );
}

/* ── แถวข้อมูลมาตรฐานเดียวทั้งหน้า: leading 38px · title+sub · right actions ── */
function InfoRow({ leading, title, titleExtra, sub, note, right, dragProps, style }) {
  return (
    <div {...(dragProps || {})} style={{
      display: 'flex', gap: 10, alignItems: 'center',
      background: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.7)',
      borderRadius: 16, padding: '10px 12px', minHeight: 58, ...style,
    }}>
      {leading}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: BLACK, fontFamily: font }}>{title}</span>
          {titleExtra}
        </div>
        {sub && <div style={{ fontSize: 11, color: GRAY2, fontFamily: font, marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sub}</div>}
        {note && <div style={{ fontSize: 11, color: ORANGE, fontFamily: font, marginTop: 1 }}><IconAlertTriangle size={12} style={{ verticalAlign: '-2px' }} /> {note}</div>}
      </div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>{right}</div>
    </div>
  );
}

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
            <IconAlertTriangle size={12} style={{ verticalAlign: '-2px' }} /> ต้องรอ<b>ผู้ดูแลครอบครัวกดอนุมัติในแอป</b>เสมอ — กันคนรู้รหัสเอาไปผูกบ้านอื่นโดยเจ้าตัวไม่ยินยอม · คำขอหมดอายุใน 72 ชม.
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button className="hover-btn" style={btnGhost} onClick={() => setStep(1)}><IconArrowLeft size={12} style={{ verticalAlign: '-2px' }} /> กรอกใหม่</button>
            <button className="hover-btn" style={btnPrimary} onClick={() => setStep(3)}>ส่งคำขอเชื่อม</button>
          </div>
        </div>
      )}
      {step === 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center', textAlign: 'center', padding: '8px 0' }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(232,128,42,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}><IconHourglass size={28} color={ORANGE} style={{ flexShrink: 0 }} /></div>
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
  const [tab, setTab] = useState(0);
  const vidRef = useRef(null);
  useEffect(() => { if (vidRef.current) vidRef.current.playbackRate = 0.4; }, []);

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: 'calc(100vh - 112px)', minHeight: 560 }}>
      {/* ── Layout ยกเครื่อง: profile rail ซ้ายเต็มความสูง + scroll เฉพาะขวา ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '400px minmax(0, 1fr)', gap: 16, flex: 1, minHeight: 0 }}>

        {/* ══ ซ้าย: โปรไฟล์บ้าน — เต็มความสูง ══ */}
        <div className="anim-slide-up" style={{ ...card, padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0, position: 'relative' }}>
          <SVMap points={[{ lat: house.lat, lng: house.lng, name: `บ้าน ${house.no}`, color: activeAlert ? RED : PURPLE, big: true, status: activeAlert ? 'alert' : 'ok' }]} center={[house.lng, house.lat]} zoom={16.5} height={180} radius={0} />
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12, flex: 1, minHeight: 0, overflowY: 'auto', position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: BLACK, fontFamily: font, lineHeight: 1.3 }}>บ้าน {house.no}</h2>
                {house.nickname && <div style={{ fontSize: 13, color: GRAY, fontFamily: font }}>{house.nickname}</div>}
              </div>
              <button className="hover-btn" style={{ ...btnGhost, padding: '5px 12px', fontSize: 11.5, flexShrink: 0 }}><IconPencil size={12} style={{ verticalAlign: '-2px' }} /> แก้ไข</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {/* card หมู่บ้าน — bg ขาว, รูปบ้าน 3D ล้นซ้าย (Figma 437-7809) */}
              <div style={{ background: 'white', borderRadius: 16, padding: '12px 14px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'relative', zIndex: 1, paddingRight: 84 }}>
                  <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.6)', fontFamily: font }}>หมู่บ้าน</div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: BLACK, fontFamily: font, lineHeight: 1.35, wordBreak: 'break-word' }}>{village.name} · {village.province}</div>
                </div>
                <img src={imgHouse3d} alt="" aria-hidden style={{ position: 'absolute', right: -6, bottom: -8, width: 84, height: 'auto', objectFit: 'contain', pointerEvents: 'none', zIndex: 0, WebkitMaskImage: 'linear-gradient(to bottom, black 45%, transparent 96%)', maskImage: 'linear-gradient(to bottom, black 45%, transparent 96%)' }} />
              </div>
              {/* card โน้ต — bg ขาว, รูปสมุด+ดินสอ 3D มุมขวาล่าง (Figma 437-7816) */}
              {house.note && (
                <div style={{ background: 'white', borderRadius: 16, padding: '12px 14px', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'relative', zIndex: 1, paddingRight: 84 }}>
                    <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.6)', fontFamily: font }}>โน้ต</div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: BLACK, fontFamily: font, lineHeight: 1.35, wordBreak: 'break-word' }}>{house.note}</div>
                  </div>
                  <img src={imgNote3d} alt="" aria-hidden style={{ position: 'absolute', right: 4, bottom: -8, width: 70, height: 'auto', objectFit: 'contain', pointerEvents: 'none', zIndex: 0, WebkitMaskImage: 'linear-gradient(to bottom, black 45%, transparent 96%)', maskImage: 'linear-gradient(to bottom, black 45%, transparent 96%)' }} />
                </div>
              )}
              {/* card พิกัด — bg ขาว, รูปแผนที่+หมุด 3D มุมขวาล่าง (Figma 437-7823) */}
              <div style={{ background: 'white', borderRadius: 16, padding: '12px 14px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 10, paddingRight: 78 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.6)', fontFamily: font }}>พิกัด</div>
                    <div className="num" style={{ fontSize: 14, fontWeight: 500, color: BLACK, fontFamily: font, lineHeight: 1.35 }}>{house.lat}, {house.lng}</div>
                  </div>
                  <CopyBtn text={`${house.lat}, ${house.lng}`} label="copy" />
                </div>
                <img src={imgLocation3d} alt="" aria-hidden style={{ position: 'absolute', right: 2, bottom: -8, width: 60, height: 'auto', objectFit: 'contain', pointerEvents: 'none', zIndex: 0, WebkitMaskImage: 'linear-gradient(to bottom, black 45%, transparent 96%)', maskImage: 'linear-gradient(to bottom, black 45%, transparent 96%)' }} />
              </div>
            </div>

          </div>
          {/* วิดีโอฉากหมู่บ้าน — absolute ชิดล่างสุด, อยู่หลัง list */}
          <video ref={vidRef} src={vidScenery} autoPlay loop muted playsInline aria-hidden style={{
            position: 'absolute', left: 0, right: 0, bottom: -60, width: '100%', height: 'auto', display: 'block',
            pointerEvents: 'none', zIndex: 0,
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 45%)',
            maskImage: 'linear-gradient(to bottom, transparent 0%, black 45%)',
          }} />
        </div>

        {/* ══ ขวา: งานหลัก — scroll เฉพาะฝั่งนี้ ══ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0, minHeight: 0, overflowY: 'auto', paddingRight: 24, marginRight: -20, paddingLeft: 24, marginLeft: -24, paddingBottom: 4, paddingTop: activeAlert ? 26 : 0, marginTop: activeAlert ? -26 : 0 }}>
        {/* เหตุ active ของบ้านนี้ — banner ในคอลัมน์ขวา */}
        {activeAlert && (
          <div className="sv-fall-banner" style={{
            borderRadius: 24, padding: '14px 18px',
            background: 'linear-gradient(90deg, rgba(255,255,255,0.55) 0%, rgba(243,111,96,0.5) 166%)',
            backdropFilter: 'blur(24px) saturate(180%)', WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            border: '1px solid rgba(255,255,255,0.6)',
            position: 'relative', overflow: 'visible', flexShrink: 0, minHeight: 108,
            display: 'flex', flexDirection: 'column', gap: 8,
          }}>
            {/* ข้อความ — ขนาดเดียวกับ widget อื่น (Figma 420-7648 แบบ compact) */}
            <div style={{ maxWidth: '60%', display: 'flex', flexDirection: 'column', gap: 6, position: 'relative', zIndex: 2, flex: 1 }}>
              <div style={{ fontSize: 14.5, fontWeight: 700, color: '#E0301E', fontFamily: font, lineHeight: 1.25 }}>{activeAlert.detectType}</div>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: 4, alignItems: 'center', color: '#E0301E', fontSize: 12, fontFamily: font }}>
                  <IconMapPin size={15} style={{ flexShrink: 0 }} /> ตำแหน่ง <span style={{ fontWeight: 700 }}>{activeAlert.location}</span>
                </div>
                <div style={{ display: 'flex', gap: 4, alignItems: 'center', color: '#E0301E', fontSize: 12, fontFamily: font }}>
                  <IconClockHour3 size={15} style={{ flexShrink: 0 }} /> ตรวจพบเมื่อ <span className="num" style={{ fontWeight: 700 }}>{activeAlert.time} น.</span>
                </div>
              </div>
              <div style={{ marginTop: 'auto', display: 'flex', gap: 4, alignItems: 'center', fontSize: 11.5, fontFamily: font, color: 'rgba(0,0,0,0.6)' }}>
                {activeAlert.status === 'ใหม่'
                  ? <span style={{ color: '#E0301E', fontWeight: 600 }}><IconAlertTriangle size={13} style={{ verticalAlign: '-2px', animation: 'svShake 0.9s infinite' }} /> ยังไม่มีผู้รับทราบ — siren ที่ป้อมยามยังดังอยู่ · <span style={{ animation: 'svBlink 1.2s infinite', display: 'inline-block' }}><ElapsedSince minAgo={activeAlert.minAgo} /></span></span>
                  : <><IconCheck size={14} color={GREEN} style={{ flexShrink: 0 }} /> {activeAlert.ackBy} รับทราบเมื่อ {activeAlert.ackAt} น.</>}
              </div>
            </div>
            {/* watermark ลาย warning เอียง — pattern มุมขวา, clip ในกรอบ banner */}
            <div aria-hidden style={{ position: 'absolute', inset: 0, borderRadius: 24, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
              {[
                { right: -18, top: -22, size: 92, rot: -18, op: 0.10 },
                { right: 78, top: 26, size: 56, rot: 14, op: 0.09 },
                { right: 176, top: -14, size: 44, rot: -24, op: 0.08 },
                { right: 20, top: 64, size: 40, rot: 22, op: 0.08 },
                { right: 130, top: 78, size: 64, rot: -12, op: 0.07 },
                { right: 240, top: 52, size: 36, rot: 18, op: 0.06 },
              ].map((w, i) => (
                <IconAlertTriangle key={i} size={w.size} color="#E0301E" style={{ position: 'absolute', right: w.right, top: w.top, opacity: w.op, transform: `rotate(${w.rot}deg)` }} />
              ))}
            </div>
            {/* รูปรวม scene (Figma 420-7660) — เล็กลง ชิดล่างขวา หัวล้นบนนิด */}
            <img src={imgFallScene} alt="" aria-hidden className="sv-bubble-out" style={{ position: 'absolute', right: 14, bottom: 0, height: 'calc(100% + 26px)', width: 'auto', maxWidth: '38%', objectFit: 'contain', objectPosition: 'bottom right', pointerEvents: 'none', zIndex: 1 }} />
          </div>
        )}
        {/* ── Tabs แยกตามหัวข้อ widget — pill style เดียวกับหน้า PatientProfile ── */}
        <div style={{ background: 'rgba(255,255,255,0.5)', borderRadius: 100, padding: 4, display: 'inline-flex', gap: 4, alignSelf: 'flex-start', flexShrink: 0 }}>
          {['คนในบ้าน', 'อุปกรณ์', 'ผู้ติดต่อเมื่อเกิดเหตุ', 'การเชื่อมครอบครัว', 'ประวัติเหตุการณ์'].map((t, i) => (
            <button
              key={i}
              className="hover-btn"
              onClick={() => setTab(i)}
              style={{
                padding: '8px 18px', borderRadius: 100, border: 'none', cursor: 'pointer',
                fontSize: 12, fontWeight: tab === i ? 600 : 400, fontFamily: font,
                background: tab === i ? '#0088FF' : 'transparent',
                color: tab === i ? '#fff' : BLACK,
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* (ข) คนในบ้าน */}
        {tab === 0 && (
        <div className="anim-slide-up" style={{ ...card }}>
          <VitalHead
            grad="linear-gradient(149deg, #8B5CF6 0%, #7C3AED 100%)" shadow="rgba(139,92,246,0.35)"
            icon={<IconUsers size={26} color="white" style={{ flexShrink: 0 }} />}
            bigIcon={<IconUsers size={110} color="white" style={{ flexShrink: 0 }} />}
            img={imgFamily3d}
            title="คนในบ้าน"
            value={house.residents.length} unit="คน"
            action={<button className="hover-btn" onClick={() => setModal('resident')} style={{ background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: 100, padding: '9px 16px', fontSize: 12, fontWeight: 700, fontFamily: font, color: PURPLE, cursor: 'pointer', whiteSpace: 'nowrap' }}>+ เพิ่มคน</button>}
          />
          {house.residents.length === 0 ? (
            <EmptyState icon={<IconUser size={15} />} title="ยังไม่มีทะเบียนคนในบ้าน" sub="จำเป็นสำหรับอุปกรณ์ติดตัวคน และช่วยผู้ช่วยเหลือรู้ว่าในบ้านมีใครบ้าง" />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {house.residents.map((r, i) => (
                <InfoRow
                  key={r.id}
                  leading={<div style={{
                    width: 38, height: 38, borderRadius: '50%', flexShrink: 0, color: 'white', fontSize: 14, fontWeight: 700, fontFamily: font,
                    background: AVATAR_COLORS[i % AVATAR_COLORS.length], display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{r.name[0]}</div>}
                  title={r.name}
                  titleExtra={r.wearable && <Pill color={BLUE} bg="rgba(19,152,216,0.1)" dot={false}><IconDeviceWatch size={12} style={{ flexShrink: 0 }} /> ติดตัว</Pill>}
                  sub={`${r.age} ปี · ${r.gender}`}
                  note={r.note}
                  right={<button className="hover-btn" style={{ ...btnGhost, padding: '4px 12px', fontSize: 11 }}>แก้ไข</button>}
                />
              ))}
            </div>
          )}
        </div>
        )}

        {/* (ค) อุปกรณ์ */}
        {tab === 1 && (
        <div className="anim-slide-up" style={{ ...card }}>
          <VitalHead
            grad="linear-gradient(183deg, #26C1A2 6%, #0D7C66 112%)" shadow="rgba(25,165,137,0.35)"
            icon={<IconAntennaBars5 size={26} color="white" style={{ flexShrink: 0 }} />}
            bigIcon={<IconRadar2 size={110} color="white" style={{ flexShrink: 0 }} />}
            img={imgDevice3d} imgW={104}
            title="อุปกรณ์"
            value={`${devices.filter(d => d.online).length}/${devices.length}`} unit="online"
            action={<button className="hover-btn" onClick={onAddDevice} style={{ background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: 100, padding: '9px 16px', fontSize: 12, fontWeight: 700, fontFamily: font, color: '#0D7C66', cursor: 'pointer', whiteSpace: 'nowrap' }}>+ เพิ่มอุปกรณ์</button>}
          />
          {devices.length === 0 ? (
            <EmptyState icon={<IconAntennaBars5 size={15} />} warn title="ยังไม่ติดตั้งอุปกรณ์" sub="บ้านนี้ยังไม่มีการเฝ้าระวัง" />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {devices.map(d => (
                <InfoRow
                  key={d.id}
                  style={!d.online ? { border: '1px solid rgba(232,128,42,0.35)' } : undefined}
                  leading={<div style={{
                    width: 38, height: 38, borderRadius: 12, flexShrink: 0,
                    background: d.type === 'radar' ? 'rgba(102,88,225,0.1)' : 'rgba(19,152,216,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{d.type === 'radar' ? <IconRadar2 size={18} color={PURPLE} style={{ flexShrink: 0 }} /> : <IconSos size={18} color={BLUE} style={{ flexShrink: 0 }} />}</div>}
                  title={d.typeName}
                  titleExtra={<>
                    {d.online ? <Pill color={GREEN} bg="rgba(52,199,89,0.12)">online</Pill> : <Pill color={ORANGE} bg="rgba(232,128,42,0.12)">offline</Pill>}
                    {d.presence === 'มีคน' && <Pill color={BLUE} bg="rgba(19,152,216,0.1)" dot={false}><IconUser size={12} style={{ flexShrink: 0 }} /> มีคนในห้อง</Pill>}
                  </>}
                  sub={`${d.attach.kind === 'house' ? `ติดกับบ้าน — ${d.attach.location}` : `ติดกับคน — ${d.attach.residentName}`} · เห็นล่าสุด ${d.lastSeen}`}
                  right={<button className="hover-btn" style={{ ...btnDanger, padding: '4px 12px', fontSize: 11 }} onClick={() => setModal('remove-device')}>ถอด/ย้าย</button>}
                />
              ))}
            </div>
          )}
        </div>
        )}

        {/* (ง) ผู้ติดต่อเมื่อเกิดเหตุ */}
        {tab === 2 && (
        <div className="anim-slide-up" style={{ ...card }}>
          <VitalHead
            grad="linear-gradient(149deg, #3B82F6 0%, #1D4ED8 100%)" shadow="rgba(59,130,246,0.35)"
            icon={<IconPhone size={26} color="white" style={{ flexShrink: 0 }} />}
            bigIcon={<IconPhone size={110} color="white" style={{ flexShrink: 0 }} />}
            img={imgContact3d} imgW={76} imgMB={6}
            title="ผู้ติดต่อเมื่อเกิดเหตุ"
            value={contacts.length} unit="รายการ"
            action={<button className="hover-btn" onClick={() => setModal('contact')} style={{ background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: 100, padding: '9px 16px', fontSize: 12, fontWeight: 700, fontFamily: font, color: '#1D4ED8', cursor: 'pointer', whiteSpace: 'nowrap' }}>+ เพิ่ม</button>}
          />
          {contacts.length === 0 ? (
            <EmptyState icon={<IconPhoneOff size={15} />} warn title="ยังไม่มีผู้ติดต่อ" sub="เมื่อเกิดเหตุ รปภ. จะไม่รู้ว่าต้องโทรหาใคร — ควรเพิ่มอย่างน้อย 1 รายการ"
              cta={<button className="hover-btn" style={btnPrimary} onClick={() => setModal('contact')}>+ เพิ่มผู้ติดต่อแรก</button>} />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {contacts.map((c, i) => (
                <InfoRow
                  key={c.id}
                  dragProps={{
                    draggable: true,
                    onDragStart: () => setDragIdx(i),
                    onDragOver: (e) => onDragOverContact(e, i),
                    onDragEnd: () => setDragIdx(null),
                  }}
                  style={{
                    cursor: 'grab',
                    border: `1px solid ${dragIdx === i ? 'rgba(102,88,225,0.5)' : 'rgba(255,255,255,0.7)'}`,
                    opacity: dragIdx === i ? 0.65 : 1,
                    boxShadow: dragIdx === i ? '0 6px 18px rgba(102,88,225,0.25)' : 'none',
                  }}
                  leading={<span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <IconGripVertical size={14} color={GRAY2} style={{ flexShrink: 0 }} />
                    <span style={{
                      width: 38, height: 38, borderRadius: '50%', flexShrink: 0, fontSize: 13, fontWeight: 700, fontFamily: font,
                      background: i === 0 ? 'linear-gradient(180deg,#8B81F2,#6658E1)' : 'rgba(102,88,225,0.12)',
                      color: i === 0 ? 'white' : PURPLE,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>{i + 1}</span>
                  </span>}
                  title={c.name}
                  sub={`${c.relation}${c.note ? ` · ${c.note}` : ''}`}
                  right={<a href={`tel:${c.phone}`} className="hover-btn" style={{ ...btnGhost, padding: '5px 12px', fontSize: 11.5, textDecoration: 'none' }}><IconPhone size={12} style={{ verticalAlign: '-2px' }} /> {c.phone}</a>}
                />
              ))}
            </div>
          )}
        </div>
        )}

        {/* (จ) การเชื่อมครอบครัว */}
        {tab === 3 && (
        <div className="anim-slide-up" style={{ ...card }}>
          <VitalHead
            grad="linear-gradient(149deg, #34B4E3 0%, #1398D8 100%)" shadow="rgba(19,152,216,0.35)"
            icon={<IconLink size={26} color="white" style={{ flexShrink: 0 }} />}
            bigIcon={<IconUsersGroup size={110} color="white" style={{ flexShrink: 0 }} />}
            img={imgFamily3d}
            title="การเชื่อมครอบครัว"
            value={linked.length} unit="กลุ่ม"
          />
          {/* ทิศที่ 1: รหัสบ้าน + QR */}
          <div style={{ display: 'flex', gap: 14, background: 'rgba(102,88,225,0.05)', border: '1px solid rgba(102,88,225,0.12)', borderRadius: 18, padding: 14 }}>
            <FakeQR code={house.houseCode} size={92} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ fontSize: 11, color: GRAY2, fontFamily: font }}>ทิศที่ 1 — ลูกบ้านเชื่อมเอง (เส้นทางหลัก) · สแกน QR ในแอป MyAtlas</div>
              <div className="num" style={{ fontSize: 18, fontWeight: 800, color: BLACK, letterSpacing: 1 }}>{house.houseCode}</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <CopyBtn text={house.houseCode} label="copy รหัส" />
                <button className="hover-btn" style={{ ...btnGhost, padding: '5px 12px', fontSize: 11.5 }}><IconDownload size={12} style={{ verticalAlign: '-2px' }} /> ดาวน์โหลด QR</button>
                <button className="hover-btn" style={{ ...btnDanger, padding: '5px 12px', fontSize: 11.5 }} onClick={() => setModal('regen')}><IconRefresh size={12} style={{ verticalAlign: '-2px' }} /> สร้างรหัสใหม่</button>
              </div>
            </div>
          </div>
          {/* ทิศที่ 2 + รายการ group */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
            {house.familyLinks.map(f => (
              <InfoRow
                key={f.id}
                leading={<div style={{
                  width: 38, height: 38, borderRadius: 12, flexShrink: 0,
                  background: f.status === 'เชื่อมแล้ว' ? 'rgba(52,199,89,0.12)' : 'rgba(232,128,42,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{f.status === 'เชื่อมแล้ว' ? <IconUsersGroup size={18} color={GREEN} style={{ flexShrink: 0 }} /> : <IconHourglass size={18} color={ORANGE} style={{ flexShrink: 0 }} />}</div>}
                title={f.groupName}
                titleExtra={f.status === 'เชื่อมแล้ว'
                  ? <Pill color={GREEN} bg="rgba(52,199,89,0.12)">เชื่อมแล้ว</Pill>
                  : <Pill color={ORANGE} bg="rgba(232,128,42,0.12)">รออนุมัติ</Pill>}
                sub={`${f.members} สมาชิก · ${f.source} · ${f.date}${f.expires ? ` · ${f.expires}` : ''}`}
                right={<button className="hover-btn" style={{ ...btnDanger, padding: '4px 12px', fontSize: 11 }} onClick={() => setModal('unlink')}>
                  {f.status === 'เชื่อมแล้ว' ? 'ยกเลิกเชื่อม' : 'ยกเลิกคำขอ'}
                </button>}
              />
            ))}
            {house.familyLinks.length === 0 && (
              <EmptyState icon={<IconLink size={15} />} warn title="ยังไม่เชื่อมครอบครัว" sub="ให้ลูกบ้านสแกน QR ด้านบนในแอป MyAtlas หรือทีมงานกรอกรหัสครอบครัวเชื่อมให้" />
            )}
            <button className="hover-btn" style={{ ...btnGhost, justifyContent: 'center' }} onClick={() => setModal('linkfam')}>
              <IconKeyboard size={13} style={{ verticalAlign: '-2px' }} /> ทีมงานเชื่อมให้ — กรอกรหัสครอบครัว (ทิศที่ 2)
            </button>
          </div>
        </div>
        )}

        {/* (ฉ) ประวัติเหตุการณ์ของบ้าน */}
        {tab === 4 && (
        <div className="anim-slide-up" style={{ ...card }}>
        <VitalHead
          grad="linear-gradient(149deg, #8B81F2 0%, #6658E1 100%)" shadow="rgba(102,88,225,0.35)"
          icon={<IconHistory size={26} color="white" style={{ flexShrink: 0 }} />}
          bigIcon={<IconHistory size={110} color="white" style={{ flexShrink: 0 }} />}
          img={imgHistory3d} imgW={84}
          title="ประวัติเหตุการณ์ของบ้าน"
          value={alerts.length} unit="เหตุการณ์"
        />
        {alerts.length === 0 ? (
          <EmptyState icon={<IconCircleCheck size={15} />} title="ยังไม่เคยมีเหตุ" sub="บ้านนี้ไม่เคยมีการแจ้งเหตุ" />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {alerts.map((a, ai) => {
              const active = a.status !== 'ปิดแล้ว';
              const [dd, mm] = a.date === 'วันนี้' ? ['วันนี้', ''] : a.date.split(' ');
              return (
                <div key={a.id} style={{ display: 'flex', gap: 10 }}>
                  {/* date tile + เส้นเชื่อม — pattern เดียวกับ timeline หน้า PatientProfile */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, paddingBottom: 12 }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: 16, flexShrink: 0,
                      background: active ? 'linear-gradient(135deg, #E8432A, #D0381A)' : 'linear-gradient(135deg, #8B81F2, #6658E1)',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
                    }}>
                      <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.8)', fontFamily: font }}>{mm || a.time + ' น.'}</span>
                      <span style={{ fontSize: dd === 'วันนี้' ? 12 : 16, fontWeight: 700, color: 'white', fontFamily: font }}>{dd}</span>
                    </div>
                    {ai < alerts.length - 1 && <div style={{ width: 1, flex: 1, minHeight: 12, background: active ? 'rgba(232,67,42,0.3)' : 'rgba(102,88,225,0.3)' }} />}
                  </div>

                  {/* การ์ดเหตุ */}
                  <div style={{
                    flex: 1, minWidth: 0, borderRadius: 16, padding: 16, position: 'relative', overflow: 'hidden',
                    border: `1px solid ${active ? 'rgba(255,56,60,0.25)' : 'white'}`, marginBottom: 12,
                    background: active ? 'rgba(255,56,60,0.04)' : 'white',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: BLACK, fontFamily: font }}>{a.detectType} · {a.location} <span style={{ fontWeight: 400, fontSize: 11.5, color: GRAY2 }}>{a.time} น.</span></span>
                      <span className="num" style={{ fontSize: 10.5, color: GRAY2 }}>{a.no}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', fontSize: 10.5, color: GRAY2, fontFamily: font }}>
                      {a.recovered && <span><IconAntennaBars5 size={12} style={{ verticalAlign: '-2px' }} /> เครื่องกลับสู่ปกติ</span>}
                      {a.ackBy && <span><IconCheck size={12} style={{ verticalAlign: '-2px' }} /> รับทราบ: {a.ackBy} · {a.ackAt} น.</span>}
                      {a.closedBy && <span><IconPlayerStopFilled size={12} style={{ verticalAlign: '-2px' }} /> ปิดเหตุ: {a.closedBy} · {a.closedAt} น.{a.note ? ` — "${a.note}"` : ''}</span>}
                      {!a.ackBy && <span style={{ color: RED, fontWeight: 600 }}><IconAlertTriangle size={12} style={{ verticalAlign: '-2px' }} /> ยังไม่มีผู้รับทราบ</span>}
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <Pill color={ALERT_STATUS_META[a.status].color} bg={ALERT_STATUS_META[a.status].bg}>{a.status}</Pill>
                      {a.result && <Pill color={ALERT_RESULT_META[a.result].color} bg={ALERT_RESULT_META[a.result].bg} dot={false}>{a.result}</Pill>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        </div>
        )}
        </div>
      </div>

      {/* Modals */}
      {modal === 'linkfam' && <LinkFamilyModal onClose={() => setModal(null)} />}
      {modal === 'regen' && <ConfirmModal title="สร้างรหัสบ้านใหม่?" body="รหัสเดิมและ QR ที่พิมพ์แจกไปแล้วจะใช้ไม่ได้ทันที — ใช้กรณีรหัสหลุดเท่านั้น" confirmLabel="สร้างรหัสใหม่" onClose={() => setModal(null)} />}
      {modal === 'unlink' && <ConfirmModal title="ยกเลิกการเชื่อมครอบครัว?" body="กลุ่มนี้จะไม่ได้รับแจ้งเตือนเหตุของบ้านนี้อีก" confirmLabel="ยกเลิกการเชื่อม" onClose={() => setModal(null)} />}
      {modal === 'remove-device' && <ConfirmModal title="ถอด/ย้ายอุปกรณ์?" body="อุปกรณ์จะหยุดเฝ้าระวังบ้านนี้ — เลือกย้ายไปบ้านอื่นได้ในหน้าอุปกรณ์" confirmLabel="ถอดอุปกรณ์" onClose={() => setModal(null)} />}
      {modal === 'resident' && (
        <Modal title="+ เพิ่มคนในบ้าน" onClose={() => setModal(null)} width={480}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Field label="ชื่อ-นามสกุล หรือชื่อเรียก" required><TextInput placeholder="เช่น ทดลอง ทดสอบ" /></Field>
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
              <Field label="ชื่อ" required><TextInput placeholder="เช่น สมมุติ ทดสอบ2" /></Field>
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
