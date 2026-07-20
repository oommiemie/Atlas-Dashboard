/* ═══ Smart Village — รายละเอียดหมู่บ้าน (แท็บ บ้าน | รปภ. | ตั้งค่า) — spec 5.3 ═══ */
import { useState, useRef, useEffect } from 'react';
import {
  getVillage, housesOf, guardsOf, devicesOfHouse, alertsOfHouse, villageStats, villageStatus, SV_STATUS_META,
} from '../../data/smartVillage';
import {
  font, BLACK, GRAY, GRAY2, PURPLE, GREEN, RED, ORANGE, BLUE,
  card, btnPrimary, btnGhost, btnDanger, Pill, SearchBox, Modal, Field, TextInput, SVMap, THead, TRow, CopyBtn, EmptyState, OnlinePill, VizBar,
} from './shared';
import {
  IconAlertTriangle, IconBuildingCommunity, IconHome, IconAntennaBars5,
  IconCircleFilled, IconShield, IconUrgent, IconDoor, IconDeviceWatch, IconMapPinPlus,
  IconInfoCircle, IconBan,
} from '@tabler/icons-react';
import imgHouseAdd from '../../assets/images/sv-house-add-3d.png';
import imgGuardAdd from '../../assets/images/sv-guard-add-3d.png';
import vidScenery from '../../assets/images/sv-village-scene.mp4';
import imgHouse3d from '../../assets/images/sv-house-3d.png';
import imgDevice3d from '../../assets/images/sv-device-3d.png';
import imgWarn3d from '../../assets/images/sv-warn-3d.png';

const genPassword = () => {
  const c = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let p = '';
  for (let i = 0; i < 10; i++) p += c[Math.floor(Math.random() * c.length)];
  return p;
};

/* ── ฟอร์มเพิ่มบัญชี รปภ. — รหัสผ่าน generate แสดงครั้งเดียว ── */
function AddGuardModal({ village, onClose }) {
  const [name, setName] = useState('');
  const [pw] = useState(genPassword);
  const [created, setCreated] = useState(false);
  const uname = `${village.code.toLowerCase()}-${name ? 'somchai' : ''}`;

  if (created) {
    return (
      <Modal title="สร้างบัญชี รปภ. สำเร็จ" sub="รหัสผ่านแสดงครั้งเดียวเท่านั้น — คัดลอกส่งมอบให้ รปภ. ทันที" onClose={onClose} width={460}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ background: 'rgba(232,128,42,0.08)', border: '1px solid rgba(232,128,42,0.25)', borderRadius: 14, padding: '10px 14px', fontSize: 11.5, color: ORANGE, fontFamily: font, lineHeight: 1.6 }}>
            <IconAlertTriangle size={12} style={{ verticalAlign: '-2px' }} /> ปิดหน้าต่างนี้แล้วจะดูรหัสผ่านอีกไม่ได้ — ถ้ารหัสหาย ต้องรีเซ็ตใหม่เท่านั้น
          </div>
          {[['ชื่อผู้ใช้ (username)', uname || 'vlg001-somchai'], ['รหัสผ่าน (แสดงครั้งเดียว)', pw]].map(([l, val]) => (
            <div key={l} style={{ background: 'rgba(102,88,225,0.06)', borderRadius: 14, padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
              <div>
                <div style={{ fontSize: 10.5, color: GRAY2, fontFamily: font }}>{l}</div>
                <div className="num" style={{ fontSize: 16, fontWeight: 700, color: BLACK, letterSpacing: 0.5 }}>{val}</div>
              </div>
              <CopyBtn text={val} />
            </div>
          ))}
          <button className="hover-btn" style={{ ...btnPrimary, justifyContent: 'center' }} onClick={onClose}>คัดลอกแล้ว ปิดหน้าต่าง</button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal title="+ เพิ่มบัญชี รปภ." sub={`${village.name} · บัญชีรายบุคคล เพื่อ audit ได้ว่าใครรับทราบ/ปิดเหตุ`} onClose={onClose} width={480}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Field label="ชื่อ-นามสกุล" required>
          <TextInput value={name} onChange={e => setName(e.target.value)} placeholder="เช่น ทดลอง ทดสอบ" />
        </Field>
        <Field label="username" required hint={`ระบบเติม prefix รหัสหมู่บ้านให้อัตโนมัติ · unique ทั้งระบบ`}>
          <TextInput value={name ? uname : ''} readOnly placeholder={`${village.code.toLowerCase()}-…`} style={{ background: 'rgba(116,116,128,0.05)' }} />
        </Field>
        <Field label="เบอร์โทร"><TextInput placeholder="(ไม่บังคับ)" /></Field>
        <Field label="รหัสผ่าน" hint="ระบบสร้างให้อัตโนมัติ เพื่อป้องกันรหัสอ่อน — จะแสดงครั้งเดียวหลังบันทึก">
          <TextInput value="สร้างอัตโนมัติหลังกดบันทึก" readOnly style={{ background: 'rgba(116,116,128,0.05)', color: GRAY2 }} />
        </Field>
        <div style={{ display: 'flex', gap: 10, background: 'rgba(102,88,225,0.06)', border: '1px solid rgba(102,88,225,0.14)', borderRadius: 14, padding: '11px 13px' }}>
          <IconInfoCircle size={16} color={PURPLE} style={{ flexShrink: 0, marginTop: 1 }} />
          <div style={{ fontSize: 11.5, color: GRAY, fontFamily: font, lineHeight: 1.6 }}>
            <span style={{ fontWeight: 700, color: PURPLE }}>หมายเหตุ</span> — บัญชีรายบุคคล (กะเช้า/กะดึก) · central สร้าง-ระงับ-รีเซ็ตรหัสผ่านเท่านั้น เพื่อ audit ว่าใครรับทราบ/ปิดเหตุ
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button className="hover-btn" style={btnGhost} onClick={onClose}>ยกเลิก</button>
          <button className="hover-btn" style={{ ...btnPrimary, opacity: name ? 1 : 0.45 }} onClick={() => name && setCreated(true)}>สร้างบัญชี</button>
        </div>
      </div>
    </Modal>
  );
}

/* ── ฟอร์มเพิ่มบ้าน ── */
function AddHouseModal({ village, onClose }) {
  const [no, setNo] = useState('');
  const [pin, setPin] = useState(null);
  const canSave = no && pin;
  return (
    <Modal title="+ เพิ่มบ้าน" sub={`${village.name} · แผนที่เปิดมาที่หมู่บ้าน ซูมระดับโครงการ`} onClose={onClose} width={620}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 12 }}>
          <Field label="บ้านเลขที่" required><TextInput value={no} onChange={e => setNo(e.target.value)} placeholder="เช่น 42/1" /></Field>
          <Field label="ชื่อเรียก"><TextInput placeholder={'เช่น "บ้านคุณยายสมศรี" (ไม่บังคับ)'} /></Field>
        </div>
        <Field label="ปักหมุดตำแหน่งบ้าน" required hint="คลิกวางหมุด · ลากปรับได้">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {pin
              ? <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><span className="num" style={{ fontSize: 11.5, color: GRAY }}>{pin.lat}, {pin.lng}</span><CopyBtn text={`${pin.lat}, ${pin.lng}`} label="copy พิกัด" /></div>
              : <span style={{ fontSize: 11.5, color: RED, fontFamily: font }}>ยังไม่ได้ปักหมุด</span>}
            <SVMap picker pin={pin} onPick={setPin} center={[village.lng, village.lat]} zoom={15.5} height={230} radius={14} />
          </div>
        </Field>
        <Field label="หมายเหตุ"><TextInput placeholder={'เช่น "ประตูรั้วสีเขียว ตรงข้ามสวนหย่อม" (ไม่บังคับ)'} /></Field>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button className="hover-btn" style={btnGhost} onClick={onClose}>ยกเลิก</button>
          <button className="hover-btn" style={{ ...btnPrimary, opacity: canSave ? 1 : 0.45 }} onClick={() => canSave && onClose()}>บันทึกบ้าน</button>
        </div>
      </div>
    </Modal>
  );
}

/* ── ระงับหมู่บ้าน — ต้องพิมพ์ชื่อหมู่บ้านให้ตรงก่อนยืนยัน (กัน action พลาด) ── */
function SuspendVillageModal({ village, guards, devices, onClose, onConfirm }) {
  const [typed, setTyped] = useState('');
  const match = typed.trim() === village.name;
  return (
    <Modal title="ยืนยันการระงับหมู่บ้าน?" onClose={onClose} width={460}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ fontSize: 13, color: GRAY, fontFamily: font, lineHeight: 1.7 }}>
          ผลกระทบ: <b>รปภ. {guards} บัญชี login ไม่ได้ทันที</b> และ<b>ไม่รับเหตุใหม่</b>จากอุปกรณ์ {devices} เครื่อง — ครอบครัวที่เชื่อมไว้จะไม่ได้รับแจ้งเตือนจากระบบหมู่บ้าน (แจ้งเตือนฝั่งแอปยังทำงาน)
        </div>
        <div style={{ fontSize: 11.5, color: ORANGE, fontFamily: font, background: 'rgba(232,128,42,0.08)', borderRadius: 12, padding: '9px 12px', lineHeight: 1.6 }}>
          <IconAlertTriangle size={12} style={{ verticalAlign: '-2px' }} /> พิมพ์ชื่อหมู่บ้าน <b style={{ color: RED }}>{village.name}</b> ให้ตรงเพื่อยืนยัน
        </div>
        <Field label="ชื่อหมู่บ้าน" required>
          <TextInput value={typed} onChange={e => setTyped(e.target.value)} placeholder={village.name} autoFocus />
        </Field>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button className="hover-btn" style={btnGhost} onClick={onClose}>ยกเลิก</button>
          <button className="hover-btn" disabled={!match} style={{ ...btnPrimary, background: 'linear-gradient(135deg,#E0262B,#FF5A3C)', boxShadow: '0 4px 12px rgba(255,56,60,0.3)', opacity: match ? 1 : 0.4, cursor: match ? 'pointer' : 'not-allowed' }} onClick={() => match && (onConfirm ? onConfirm() : onClose())}>ระงับหมู่บ้าน</button>
        </div>
      </div>
    </Modal>
  );
}

/* ── ยืนยันการระงับ ── */
function ConfirmModal({ title, body, confirmLabel, onClose, danger = true }) {
  return (
    <Modal title={title} onClose={onClose} width={440}>
      <div style={{ fontSize: 13, color: GRAY, fontFamily: font, lineHeight: 1.7 }}>{body}</div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 18 }}>
        <button className="hover-btn" style={btnGhost} onClick={onClose}>ยกเลิก</button>
        <button className="hover-btn" style={{ ...(danger ? { ...btnPrimary, background: 'linear-gradient(135deg,#E0262B,#FF5A3C)', boxShadow: '0 4px 12px rgba(255,56,60,0.3)' } : btnPrimary) }} onClick={onClose}>{confirmLabel}</button>
      </div>
    </Modal>
  );
}

export default function VillageDetail({ villageId, onDrillHouse }) {
  const village = getVillage(villageId);
  const houses = housesOf(villageId);
  const guards = guardsOf(villageId);
  const stats = villageStats(villageId);
  const st = villageStatus(villageId);
  const [tab, setTab] = useState('บ้าน');
  const [q, setQ] = useState('');
  const [modal, setModal] = useState(null); // 'house' | 'guard' | 'suspend' | 'reset:<id>'
  const [suspended, setSuspended] = useState(false);

  // slow smooth forward loop
  const vidRef = useRef(null);
  useEffect(() => { if (vidRef.current) vidRef.current.playbackRate = 0.4; }, []);

  const houseRows = houses.filter(h => (h.no + h.nickname).toLowerCase().includes(q.toLowerCase()));
  const HCOLS = '110px 1.2fr 70px 110px 130px 1.1fr 1fr';
  const GCOLS = '1.4fr 1.2fr 110px 90px 120px 170px';

  const mapPoints = [
    { lat: village.lat, lng: village.lng, name: village.name, color: PURPLE, big: true, subHtml: `<div style="font-size:11px;color:${GRAY};">หมุดหมู่บ้าน</div>` },
    ...houses.map(h => {
      const hasAlert = alertsOfHouse(h.id).some(a => a.status !== 'ปิดแล้ว');
      const offline = devicesOfHouse(h.id).some(d => !d.online);
      const color = hasAlert ? RED : offline ? ORANGE : GREEN;
      return {
        lat: h.lat, lng: h.lng, name: `บ้าน ${h.no}${h.nickname ? ` · ${h.nickname}` : ''}`,
        color, status: hasAlert ? 'alert' : 'ok',
        subHtml: `<div style="font-size:11px;color:${GRAY};">${hasAlert ? 'มีเหตุ active' : offline ? 'มีอุปกรณ์ offline' : 'ปกติ'} · คลิกเพื่อเปิดบ้าน</div>`,
        onClick: () => onDrillHouse(h.id),
      };
    }),
  ];

  const statCards = [
    ['บ้าน', stats.houses, null, 'linear-gradient(149deg, #8B5CF6 0%, #7C3AED 100%)', 'rgba(139,92,246,0.3)', imgHouse3d, 92, null, -6],
    ['อุปกรณ์ online', `${stats.online}/${stats.devices}`, null, 'linear-gradient(149deg, #3B82F6 0%, #1D4ED8 100%)', 'rgba(59,130,246,0.3)', imgDevice3d, 98, `ติดตั้งแล้ว ${stats.installedHouses} หลัง`, -6],
    ['บัญชี รปภ.', stats.guards, null, 'linear-gradient(149deg, #34B4E3 0%, #1398D8 100%)', 'rgba(19,152,216,0.3)', imgGuardAdd, 58, null, -34, 16],
    ['เหตุ 30 วัน', stats.alerts30d, null, 'linear-gradient(149deg, #E8802A 0%, #D06A1A 100%)', 'rgba(232,128,42,0.3)', imgWarn3d, 80, null, -6],
  ];

  const toolbar = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
      <div className="seg">
        {['บ้าน', 'รปภ.', 'ตั้งค่า'].map(t => (
          <button key={t} className={`seg-btn${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
            {t === 'บ้าน' ? `บ้าน (${houses.length})` : t === 'รปภ.' ? `รปภ. (${guards.length})` : t}
          </button>
        ))}
      </div>
      {tab === 'บ้าน' && (
        <SearchBox value={q} onChange={setQ} placeholder="ค้นหาบ้านเลขที่ / ชื่อเรียก…" width={240} />
      )}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* แถบสถานะระงับ — แสดงเมื่อหมู่บ้านถูกระงับ */}
      {suspended && (
        <div className="anim-slide-up" style={{
          display: 'flex', alignItems: 'center', gap: 12, borderRadius: 16, padding: '12px 16px',
          background: 'rgba(146,145,165,0.12)', border: '1px solid rgba(146,145,165,0.3)',
        }}>
          <div style={{ width: 36, height: 36, borderRadius: 11, background: 'rgba(146,145,165,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <IconBan size={20} color={GRAY} style={{ flexShrink: 0 }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: BLACK, fontFamily: font }}>หมู่บ้านนี้ถูกระงับ</div>
            <div style={{ fontSize: 11.5, color: GRAY, fontFamily: font, marginTop: 1 }}>บัญชี รปภ. login ไม่ได้ · ระบบไม่รับเหตุใหม่จากอุปกรณ์ — ข้อมูลบ้าน/อุปกรณ์ยังอยู่ครบ</div>
          </div>
          <button className="hover-btn" style={{ ...btnPrimary, flexShrink: 0 }} onClick={() => setSuspended(false)}>เปิดใช้หมู่บ้านอีกครั้ง</button>
        </div>
      )}
      {/* Header + Map — row เดียวกัน, สอง widget แยก card */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 16, alignItems: 'stretch' }}>
      <div className="anim-slide-up" style={{ ...card, background: '#F0F0F0', position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, justifyContent: 'flex-start', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div style={{
              width: 54, height: 54, borderRadius: 18, fontSize: 24, flexShrink: 0,
              background: 'linear-gradient(180deg,#8B81F2,#6658E1)', boxShadow: '0 6px 16px rgba(102,88,225,0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}><IconBuildingCommunity size={26} color="white" style={{ flexShrink: 0 }} /></div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: 19, fontWeight: 700, color: BLACK, fontFamily: font }}>{village.name}</h2>
                {suspended
                  ? <Pill color={GRAY2} bg="rgba(146,145,165,0.18)"><IconBan size={12} style={{ flexShrink: 0 }} /> ระงับแล้ว</Pill>
                  : <Pill color={SV_STATUS_META[st].color} bg={`${SV_STATUS_META[st].color}1F`}>{SV_STATUS_META[st].label}</Pill>}
              </div>
              <div style={{ fontSize: 12, color: GRAY, fontFamily: font, marginTop: 4 }}>
                {village.type} · {village.address} อ.{village.district} จ.{village.province}
              </div>
              <div style={{ fontSize: 11.5, color: GRAY2, fontFamily: font, marginTop: 2 }}>
                นิติบุคคล: {village.juristic.name} · {village.juristic.phone}
              </div>
            </div>
          </div>
        </div>
        {/* ฉากหมู่บ้าน — video bg, absolute ไม่ดัน height card */}
        <video ref={vidRef} src={vidScenery} autoPlay loop muted playsInline aria-hidden style={{
          position: 'absolute', left: 0, right: 0, bottom: 0, width: '100%', height: 'auto',
          transform: 'translateY(55%)',
          pointerEvents: 'none', zIndex: 0,
          borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 40%)',
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 40%)',
        }} />
      </div>

      {/* Map — widget แยก, row เดียวกับ banner */}
      <div className="anim-slide-up" style={{ ...card, padding: 0, overflow: 'hidden' }}>
        <SVMap points={mapPoints} center={[village.lng, village.lat]} zoom={14.6} height={200} radius={24} />
      </div>
      </div>

      {/* Stats — ย้ายลงมาเหนือ table card */}
      <div className="anim-slide-up delay-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(104px, 1fr))', gap: 10 }}>
        {statCards.map(([l, v, ic, grad, shadow, img, imgW, sub, imgB = -6, imgR = -4]) => (
          <div key={l} className="hover-stat" style={{
            background: grad, border: '1px solid rgba(255,255,255,0.7)', borderRadius: 18, padding: '12px 14px',
            color: 'white', boxShadow: `0 4px 14px ${shadow}`, minWidth: 0,
            display: 'flex', flexDirection: 'column', gap: 5, position: 'relative', overflow: 'hidden', minHeight: 92,
          }}>
            <span style={{ fontSize: 10.5, fontWeight: 500, color: 'rgba(255,255,255,0.75)', fontFamily: font, letterSpacing: 0.22, whiteSpace: 'nowrap', position: 'relative', zIndex: 1 }}>{l}</span>
            <span className="num" style={{ fontSize: 22, fontWeight: 700, color: 'white', lineHeight: '22px', position: 'relative', zIndex: 1, marginTop: 'auto' }}>{v}</span>
            {sub && <span style={{ fontSize: 9.5, fontWeight: 500, color: 'rgba(255,255,255,0.72)', fontFamily: font, whiteSpace: 'nowrap', position: 'relative', zIndex: 1 }}>{sub}</span>}
            {img && <img src={img} alt="" aria-hidden style={{ position: 'absolute', right: imgR, bottom: imgB, width: imgW, height: 'auto', objectFit: 'contain', pointerEvents: 'none', zIndex: 0, opacity: 0.92, WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent 95%)', maskImage: 'linear-gradient(to bottom, black 50%, transparent 95%)' }} />}
          </div>
        ))}
      </div>

      {/* ── แท็บบ้าน ── */}
      {tab === 'บ้าน' && (
        <div className="anim-tab-enter" style={{ ...card, padding: 12, position: 'relative', overflow: 'visible' }}>
          {toolbar}
          {/* house 3d — ครึ่งบนโผล่ ครึ่งล่างจมหลัง table (Figma 412-2135) */}
          <img src={imgHouseAdd} alt="" className="sv-house-float" style={{ position: 'absolute', right: 8, top: -14, width: 138, height: 138, objectFit: 'contain', pointerEvents: 'none', zIndex: 1, filter: 'drop-shadow(0 8px 14px rgba(30,27,57,0.18))' }} />
          {/* speech-bubble ปุ่มเพิ่มบ้าน — ชี้ออกจาก house */}
          <button className="hover-btn sv-bubble-out" style={{ ...btnPrimary, position: 'absolute', right: 138, top: 10, zIndex: 4, display: 'inline-flex', alignItems: 'center', gap: 7 }} onClick={() => setModal('house')}>
            เพิ่มบ้าน <IconMapPinPlus size={16} style={{ flexShrink: 0 }} />
            <span style={{ position: 'absolute', right: -5, top: '50%', width: 13, height: 13, background: '#8B5CF6', borderRadius: 3, transform: 'translateY(-50%) rotate(45deg)', zIndex: -1 }} />
          </button>
          <div style={{ overflowX: 'auto', position: 'relative', zIndex: 2, marginTop: 4 }}>
            <div style={{ minWidth: 820, border: '1px solid rgba(0,0,0,0.05)', borderRadius: 14, overflow: 'hidden', background: 'white' }}>
              <THead cols={HCOLS} labels={['บ้านเลขที่', 'ชื่อเรียก', 'คนในบ้าน', 'อุปกรณ์', 'ชนิดติดตั้ง', 'สถานะเชื่อม Family', 'เหตุล่าสุด']} />
              {houseRows.map(h => {
                const devs = devicesOfHouse(h.id);
                const linked = h.familyLinks.filter(f => f.status === 'เชื่อมแล้ว').length;
                const pending = h.familyLinks.filter(f => f.status === 'รออนุมัติ').length;
                const lastAlert = alertsOfHouse(h.id)[0];
                const activeAlert = alertsOfHouse(h.id).find(a => a.status !== 'ปิดแล้ว');
                return (
                  <TRow key={h.id} cols={HCOLS} onClick={() => onDrillHouse(h.id)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {activeAlert && <span style={{ width: 8, height: 8, borderRadius: '50%', background: RED, animation: 'svBlink 1.2s infinite' }} />}
                      <span style={{ fontSize: 13, fontWeight: 700, color: BLACK, fontFamily: font }}>{h.no}</span>
                    </div>
                    <div style={{ fontSize: 12.5 }}>{h.nickname || <span style={{ color: GRAY2 }}>—</span>}</div>
                    <div className="num" style={{ fontSize: 13, fontWeight: 600, color: BLACK }}>{h.residents.length}</div>
                    <div className="num" style={{ fontSize: 12 }}>
                      {devs.length === 0 ? <span style={{ color: GRAY2 }}>ยังไม่ติดตั้ง</span> : <>
                        <span style={{ color: devs.every(d => d.online) ? GREEN : ORANGE, fontWeight: 700 }}>{devs.filter(d => d.online).length}</span>
                        <span style={{ color: GRAY2 }}>/{devs.length} online</span>
                      </>}
                    </div>
                    {devs.length === 0
                      ? <span style={{ fontSize: 11.5, color: GRAY2, fontFamily: font }}>—</span>
                      : <VizBar title="ชนิดติดตั้ง" segments={[
                        { label: 'ติดเพดาน', value: devs.filter(d => d.attach.kind === 'house').length, color: PURPLE },
                        { label: 'พกติดตัว', value: devs.filter(d => d.attach.kind === 'person').length, color: BLUE },
                      ]} />}
                    <VizBar title="สถานะเชื่อม Family" segments={[
                      { label: 'เชื่อมแล้ว', value: linked, color: GREEN },
                      { label: 'รออนุมัติ', value: pending, color: ORANGE },
                      { label: 'ยังไม่เชื่อม', value: Math.max(0, h.familyLinks.length - linked - pending), color: '#C7C7CC' },
                    ]} />
                    <div style={{ fontSize: 11.5 }}>
                      {activeAlert
                        ? <span style={{ color: RED, fontWeight: 700 }}><IconUrgent size={12} style={{ verticalAlign: '-2px' }} /> {activeAlert.detectType} {activeAlert.time} น.</span>
                        : lastAlert ? `${lastAlert.date} ${lastAlert.time}` : <span style={{ color: GRAY2 }}>—</span>}
                    </div>
                  </TRow>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── แท็บ รปภ. ── */}
      {tab === 'รปภ.' && (
        <div className="anim-tab-enter" style={{ ...card, padding: 12, position: 'relative', overflow: 'visible' }}>
          {toolbar}
          {/* guard 3d — โผล่ครึ่งบน ครึ่งล่างจมหลัง table (Figma 418-7517) */}
          <img src={imgGuardAdd} alt="" className="sv-house-float" style={{ position: 'absolute', right: 10, top: 2, width: 78, height: 'auto', objectFit: 'contain', pointerEvents: 'none', zIndex: 1, filter: 'drop-shadow(0 8px 14px rgba(30,27,57,0.18))' }} />
          {/* speech-bubble ปุ่มเพิ่มบัญชี — ชี้ออกจาก guard */}
          <button className="hover-btn sv-bubble-out" style={{ ...btnPrimary, position: 'absolute', right: 92, top: 8, zIndex: 4, display: 'inline-flex', alignItems: 'center', gap: 7 }} onClick={() => setModal('guard')}>
            เพิ่มบัญชี รปภ. <IconShield size={16} style={{ flexShrink: 0 }} />
            <span style={{ position: 'absolute', right: -5, top: '50%', width: 13, height: 13, background: '#8B5CF6', borderRadius: 3, transform: 'translateY(-50%) rotate(45deg)', zIndex: -1 }} />
          </button>
          {guards.length === 0 ? (
            <EmptyState
              icon={<IconShield size={15} />} warn
              title="ยังไม่มีบัญชี รปภ."
              sub="หมู่บ้านนี้จะไม่มีคนเฝ้าเหตุจนกว่าจะเพิ่มบัญชี — เมื่อเกิดเหตุจะมีเพียงครอบครัวและ central ที่เห็น"
              cta={<button className="hover-btn" style={btnPrimary} onClick={() => setModal('guard')}>+ เพิ่มบัญชีแรก</button>}
            />
          ) : (
            <div style={{ overflowX: 'auto', position: 'relative', zIndex: 2 }}>
              <div style={{ minWidth: 860, border: '1px solid rgba(0,0,0,0.05)', borderRadius: 14, overflow: 'hidden', background: 'white' }}>
                <THead cols={GCOLS} labels={['ชื่อ-นามสกุล', 'username', 'เบอร์โทร', 'สถานะ', 'เข้าใช้ล่าสุด', 'การกระทำ']} />
                {guards.map(g => (
                  <TRow key={g.id} cols={GCOLS}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: BLACK, fontFamily: font }}>{g.name}</div>
                      <div style={{ fontSize: 10.5, color: GRAY2, fontFamily: font }}>{g.shift}</div>
                    </div>
                    <div className="num" style={{ fontSize: 12 }}>{g.username}</div>
                    <div className="num" style={{ fontSize: 12 }}>{g.phone}</div>
                    <div>{g.status === 'ใช้งาน' ? <Pill color={GREEN} bg="rgba(52,199,89,0.12)">ใช้งาน</Pill> : <Pill color={GRAY2} bg="rgba(146,145,165,0.15)">ระงับ</Pill>}</div>
                    <div style={{ fontSize: 11.5 }}>{g.lastLogin}</div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="hover-btn" style={{ ...btnGhost, padding: '5px 10px', fontSize: 11 }} onClick={() => setModal('reset')}>รีเซ็ตรหัส</button>
                      <button className="hover-btn" style={{ ...btnDanger, padding: '5px 10px', fontSize: 11 }} onClick={() => setModal('suspend-guard')}>{g.status === 'ใช้งาน' ? 'ระงับ' : 'เปิดใช้'}</button>
                    </div>
                  </TRow>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── แท็บตั้งค่า ── */}
      {tab === 'ตั้งค่า' && (
        <div className="anim-tab-enter" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16, alignItems: 'start' }}>
          <div style={{ gridColumn: '1 / -1' }}>{toolbar}</div>
          <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ fontSize: 14.5, fontWeight: 700, color: BLACK, fontFamily: font }}>แก้ไขข้อมูลหมู่บ้าน</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 12 }}>
              <Field label="ชื่อหมู่บ้าน/โครงการ" required><TextInput defaultValue={village.name} /></Field>
              <Field label="ประเภทสถานที่" required><TextInput defaultValue={village.type} /></Field>
            </div>
            <Field label="ที่อยู่" required><TextInput defaultValue={`${village.address} อ.${village.district} จ.${village.province}`} /></Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="ผู้ติดต่อนิติบุคคล"><TextInput defaultValue={village.juristic.name} /></Field>
              <Field label="เบอร์โทร"><TextInput defaultValue={village.juristic.phone} /></Field>
            </div>
            <Field label="ย้ายหมุดตำแหน่ง" hint="ลากหมุดเพื่อปรับตำแหน่งหมู่บ้าน">
              <SVMap picker pin={{ lat: village.lat, lng: village.lng }} center={[village.lng, village.lat]} zoom={14.5} height={190} radius={14} />
            </Field>
            <button className="hover-btn" style={{ ...btnPrimary, alignSelf: 'flex-end' }}>บันทึกการแก้ไข</button>
          </div>
          {suspended ? (
            <div style={{ ...card, border: '1px solid rgba(146,145,165,0.3)', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontSize: 14.5, fontWeight: 700, color: BLACK, fontFamily: font }}><IconBan size={15} style={{ verticalAlign: '-2px' }} /> หมู่บ้านถูกระงับอยู่</div>
              <div style={{ fontSize: 12, color: GRAY, fontFamily: font, lineHeight: 1.7 }}>
                บัญชี รปภ. login ไม่ได้ และระบบไม่รับเหตุใหม่จากอุปกรณ์ — เปิดใช้อีกครั้งเพื่อกลับมาทำงานตามปกติ
              </div>
              <button className="hover-btn" style={{ ...btnPrimary, alignSelf: 'flex-start' }} onClick={() => setSuspended(false)}>เปิดใช้หมู่บ้านอีกครั้ง</button>
            </div>
          ) : (
            <div style={{ ...card, border: '1px solid rgba(255,56,60,0.25)', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontSize: 14.5, fontWeight: 700, color: RED, fontFamily: font }}><IconAlertTriangle size={15} style={{ verticalAlign: '-2px' }} /> ระงับหมู่บ้าน</div>
              <div style={{ fontSize: 12, color: GRAY, fontFamily: font, lineHeight: 1.7 }}>
                เมื่อระงับ: บัญชี รปภ. ทั้งหมดจะ login ไม่ได้ และระบบจะไม่รับเหตุใหม่จากอุปกรณ์ในหมู่บ้านนี้
                <br />ไม่มีการลบถาวร เพราะมีบ้าน {stats.houses} หลังและอุปกรณ์ {stats.devices} เครื่องผูกอยู่
              </div>
              <button className="hover-btn" style={{ ...btnDanger, alignSelf: 'flex-start' }} onClick={() => setModal('suspend')}>ระงับหมู่บ้านนี้…</button>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {modal === 'house' && <AddHouseModal village={village} onClose={() => setModal(null)} />}
      {modal === 'guard' && <AddGuardModal village={village} onClose={() => setModal(null)} />}
      {modal === 'suspend' && (
        <SuspendVillageModal village={village} guards={guards.length} devices={stats.devices} onClose={() => setModal(null)} onConfirm={() => { setSuspended(true); setModal(null); }} />
      )}
      {modal === 'suspend-guard' && (
        <ConfirmModal title="ยืนยันระงับบัญชี รปภ.?" body="บัญชีนี้จะ login เข้าจอมอนิเตอร์ไม่ได้จนกว่าจะเปิดใช้อีกครั้ง" confirmLabel="ระงับบัญชี" onClose={() => setModal(null)} />
      )}
      {modal === 'reset' && (
        <ConfirmModal
          title="รีเซ็ตรหัสผ่าน?"
          body="ระบบจะ generate รหัสใหม่และแสดงครั้งเดียว — รหัสเดิมใช้ไม่ได้ทันที"
          confirmLabel="รีเซ็ตรหัสผ่าน" danger={false} onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
