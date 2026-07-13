/* ═══ Smart Village — อุปกรณ์ (global) + ฟอร์มเพิ่มอุปกรณ์ — spec 5.5 ═══ */
import { useState } from 'react';
import {
  IconBolt, IconAlertTriangle, IconDoor, IconDeviceWatch, IconRadar2, IconAntennaBars5, IconSos, IconUser,
  IconCheck, IconChevronLeft, IconChevronRight, IconCpu, IconMapPin, IconTool,
} from '@tabler/icons-react';
import {
  SV_DEVICES, SV_VILLAGES, getVillage, getHouse, housesOf,
} from '../../data/smartVillage';
import {
  font, BLACK, GRAY, GRAY2, PURPLE, GREEN, RED, ORANGE, BLUE,
  card, btnPrimary, btnGhost, PageHead, Pill, SearchBox, Modal, Field, TextInput, Select, THead, TRow, LivePill, EmptyState,
  FormPageHeader, FormSection, FilterSelect,
} from './shared';

const DEVICE_TYPES = ['เรดาร์ตรวจล้ม RT-W03', 'ปุ่ม SOS พกพา', 'เซ็นเซอร์ควัน/แก๊ส (อนาคต)'];
const LOCATIONS = ['ห้องนอน', 'ห้องน้ำ', 'ห้องนั่งเล่น', 'ห้องครัว', 'อื่นๆ'];

/* ── ฟอร์มเพิ่มอุปกรณ์ (เรียกได้จาก 3 ที่ ต่างกันที่ prefill) ── */
export function AddDeviceModal({ prefill = {}, onClose }) {
  const [type, setType] = useState(DEVICE_TYPES[0]);
  const [imei, setImei] = useState('');
  const [villageId, setVillageId] = useState(prefill.villageId || '');
  const [houseId, setHouseId] = useState(prefill.houseId || '');
  const [installKind, setInstallKind] = useState('house');
  const [location, setLocation] = useState('ห้องนอน');
  const [residentId, setResidentId] = useState('');
  const [saved, setSaved] = useState(false);
  const [step, setStep] = useState(1); // 1 อุปกรณ์ · 2 ตำแหน่ง · 3 ติดตั้ง

  const dupDevice = SV_DEVICES.find(d => d.imei === imei.trim());
  const houses = villageId ? housesOf(villageId) : [];
  const house = houseId ? getHouse(houseId) : null;
  const residents = house ? house.residents : [];

  const canSave = imei.trim().length >= 10 && !dupDevice && !!type && !!villageId && !!houseId && (installKind === 'house' ? !!location : !!residentId);

  /* แผงสถานะ live หลังบันทึก — ทีมติดตั้งยืนยันหน้างานว่าเครื่องส่งข้อมูลจริง */
  if (saved) {
    return (
      <Modal title="บันทึกอุปกรณ์แล้ว — ทดสอบหลังติดตั้ง" sub="ยืนยันหน้างานว่าเครื่องส่งข้อมูลเข้าระบบแล้วจริง ก่อนออกจากบ้านลูกค้า" onClose={onClose} width={480}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ background: 'rgba(52,199,89,0.08)', border: '1px solid rgba(52,199,89,0.3)', borderRadius: 18, padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 12, height: 12, borderRadius: '50%', background: GREEN, animation: 'svBlink 1.6s infinite' }} />
              <span style={{ fontSize: 14.5, fontWeight: 700, color: '#1E9E4B', fontFamily: font }}>เครื่อง online — ส่งข้อมูลเข้าระบบแล้ว</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12 }}>
              {[['IMEI', imei || '861230051239999'], ['สัญญาณล่าสุด', 'เมื่อ 2 วินาทีที่แล้ว'], ['สถานะห้อง', 'ไม่มีคน'], ['ความแรงสัญญาณ', '-67 dBm (ดี)']].map(([l, v]) => (
                <div key={l} style={{ background: 'white', borderRadius: 12, padding: '8px 12px' }}>
                  <div style={{ fontSize: 10, color: GRAY2, fontFamily: font }}>{l}</div>
                  <div className="num" style={{ fontSize: 12.5, fontWeight: 700, color: BLACK, marginTop: 1 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
          <button className="hover-btn" style={{ ...btnGhost, justifyContent: 'center' }}><IconBolt size={14} style={{ flexShrink: 0 }} /> โหมดทดสอบเหตุ — ยิงเหตุทดสอบ (ไม่แจ้งครอบครัว/ไม่นับสถิติ)</button>
          <button className="hover-btn" style={{ ...btnPrimary, justifyContent: 'center' }} onClick={onClose}>เสร็จสิ้นการติดตั้ง</button>
        </div>
      </Modal>
    );
  }

  return (
    <div style={{ fontFamily: font }}>
      <FormPageHeader
        icon={<IconCpu size={22} style={{ flexShrink: 0 }} />}
        title="เพิ่มอุปกรณ์" sub="ลงทะเบียนอุปกรณ์ตรวจจับการล้มเข้าระบบเฝ้าระวัง"
        onCancel={onClose} onSave={() => setSaved(true)} saveLabel="บันทึก + ทดสอบเครื่อง" saveDisabled={!canSave}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'start' }}>
        {/* ── ซ้าย ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <FormSection icon={<IconCpu size={20} style={{ flexShrink: 0 }} />} title="ข้อมูลอุปกรณ์" desc="ชนิดและรหัสเครื่อง">
            <Field label="ชนิดอุปกรณ์" required><Select options={DEVICE_TYPES} value={type} onChange={setType} /></Field>
            <Field label="IMEI / Serial" required hint={dupDevice ? undefined : 'ระบบตรวจซ้ำอัตโนมัติ'}>
              <TextInput value={imei} onChange={e => setImei(e.target.value)} placeholder="เช่น 861230051234671" style={dupDevice ? { borderColor: RED } : undefined} />
              {dupDevice && (
                <div style={{ fontSize: 11, color: RED, fontFamily: font, background: 'rgba(255,56,60,0.07)', borderRadius: 10, padding: '7px 10px', marginTop: 2 }}>
                  <IconAlertTriangle size={12} style={{ verticalAlign: '-2px' }} /> IMEI นี้ลงทะเบียนแล้วที่ บ้าน {getHouse(dupDevice.houseId).no} — {getVillage(dupDevice.villageId).name}
                </div>
              )}
            </Field>
          </FormSection>

          <FormSection icon={<IconTool size={20} style={{ flexShrink: 0 }} />} title="การติดตั้ง" desc="ติดกับบ้าน หรือ พกติดตัว">
            <Field label="รูปแบบการติดตั้ง" required>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[['house', <IconDoor size={13} style={{ verticalAlign: '-2px' }} />, 'ติดกับบ้าน', 'เช่น เรดาร์ติดเพดานห้อง'], ['person', <IconDeviceWatch size={13} style={{ verticalAlign: '-2px' }} />, 'ติดกับคน', 'อุปกรณ์พกติดตัว เห็นว่า "ใคร" ล้ม']].map(([k, ic, t, s]) => (
                  <div key={k} onClick={() => setInstallKind(k)} style={{
                    border: `1.5px solid ${installKind === k ? PURPLE : 'rgba(116,116,128,0.15)'}`,
                    background: installKind === k ? 'rgba(102,88,225,0.06)' : 'white',
                    borderRadius: 14, padding: '10px 12px', cursor: 'pointer',
                  }}>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: installKind === k ? PURPLE : BLACK, fontFamily: font }}>{ic} {t}</div>
                    <div style={{ fontSize: 10.5, color: GRAY2, fontFamily: font, marginTop: 2 }}>{s}</div>
                  </div>
                ))}
              </div>
            </Field>
            {installKind === 'house' ? (
              <Field label="ตำแหน่งติดตั้ง" required><Select options={LOCATIONS} value={location} onChange={setLocation} /></Field>
            ) : (
              <Field label="คนในบ้านที่ถืออุปกรณ์" required hint={house && residents.length === 0 ? undefined : 'เมื่อเกิดเหตุ รปภ. เห็นว่าใครล้ม ไม่ใช่แค่บ้านไหน'}>
                <Select
                  value={residentId} onChange={setResidentId} disabled={!houseId} placeholder="— เลือกคนในบ้าน —"
                  options={residents.map(r => ({ value: r.id, label: `${r.name} (${r.age} ปี)` }))}
                />
                {house && residents.length === 0 && <div style={{ fontSize: 10.5, color: ORANGE, fontFamily: font, marginTop: 2 }}>บ้านนี้ยังไม่มีทะเบียนคน — <span style={{ color: PURPLE, cursor: 'pointer' }}>+ เพิ่มคนในบ้านก่อน</span></div>}
              </Field>
            )}
            <Field label="หมายเหตุ"><TextInput placeholder="(ไม่บังคับ)" /></Field>
          </FormSection>
        </div>

        {/* ── ขวา ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <FormSection icon={<IconMapPin size={20} style={{ flexShrink: 0 }} />} title="ตำแหน่ง" desc="เลือกหมู่บ้านและบ้านที่ติดตั้ง">
            <Field label="หมู่บ้าน" required>
              <Select
                value={villageId} onChange={v => { setVillageId(v); setHouseId(''); }} placeholder="— เลือกหมู่บ้าน —"
                options={SV_VILLAGES.filter(v => v.status === 'ใช้งาน').map(v => ({ value: v.id, label: v.name }))}
              />
            </Field>
            <Field label="บ้าน" required hint={villageId && houses.length === 0 ? undefined : 'lookup จากบ้านที่สร้างไว้เท่านั้น'}>
              <Select
                value={houseId} onChange={setHouseId} disabled={!villageId} placeholder="— เลือกบ้าน —"
                options={houses.map(h => ({ value: h.id, label: `บ้าน ${h.no}${h.nickname ? ` (${h.nickname})` : ''}` }))}
              />
              {villageId && <div style={{ fontSize: 10.5, color: PURPLE, fontFamily: font, marginTop: 2, cursor: 'pointer' }}>ยังไม่มีบ้านนี้? + เพิ่มบ้าน</div>}
            </Field>
          </FormSection>
        </div>
      </div>
    </div>
  );
}

export default function Devices({ onDrillHouse, autoOpenAdd = false, onGoSection }) {
  const [q, setQ] = useState('');
  const [villageFilter, setVillageFilter] = useState('ทั้งหมด');
  const [statusFilter, setStatusFilter] = useState('ทั้งหมด');
  const [adding, setAdding] = useState(autoOpenAdd);

  const rows = SV_DEVICES.filter(d => {
    const v = getVillage(d.villageId);
    return (villageFilter === 'ทั้งหมด' || v.id === villageFilter)
      && (statusFilter === 'ทั้งหมด' || (statusFilter === 'online' ? d.online : !d.online))
      && (d.imei + d.typeName).toLowerCase().includes(q.toLowerCase());
  });

  const COLS = '150px 1.3fr 1.2fr 1.1fr 130px 110px';

  /* เพิ่มอุปกรณ์ = full page (แทน list) แบบหน้าวางแผนเยี่ยมบ้าน */
  if (adding) return <div className="anim-slide-up"><AddDeviceModal onClose={() => setAdding(false)} /></div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="anim-slide-up">
        <PageHead thai="อุปกรณ์" right={<LivePill />} section="sv-devices" onGoSection={onGoSection} />
      </div>

      <div className="anim-slide-up delay-1" style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <button className="hover-btn" style={btnPrimary} onClick={() => setAdding(true)}>+ เพิ่มอุปกรณ์</button>
        <SearchBox value={q} onChange={setQ} placeholder="ค้นหาด้วย IMEI / ชนิด…" width={240} />
        <FilterSelect value={villageFilter} onChange={setVillageFilter} options={[{ value: 'ทั้งหมด', label: 'ทุกหมู่บ้าน' }, ...SV_VILLAGES.map(v => ({ value: v.id, label: v.name }))]} />
        <div className="seg">
          {['ทั้งหมด', 'online', 'offline'].map(s => (
            <button key={s} className={`seg-btn${statusFilter === s ? ' active' : ''}`} onClick={() => setStatusFilter(s)}>{s}</button>
          ))}
        </div>
      </div>

      <div className="anim-slide-up delay-2" style={{ ...card, padding: 0, overflow: 'hidden' }}>
        {rows.length === 0 ? <EmptyState icon={<IconRadar2 size={26} style={{ flexShrink: 0 }} />} title="ไม่พบอุปกรณ์" sub="ลองปรับคำค้นหรือ filter" /> : (
          <div style={{ overflowX: 'auto' }}>
            <div style={{ minWidth: 900 }}>
              <THead cols={COLS} labels={['IMEI', 'ชนิด', 'หมู่บ้าน · บ้าน', 'ติดกับ', 'สถานะ', 'เห็นล่าสุด']} />
              {rows.map(d => {
                const h = getHouse(d.houseId);
                return (
                  <TRow key={d.id} cols={COLS} onClick={() => onDrillHouse(d.villageId, d.houseId)}>
                    <div className="num" style={{ fontSize: 11.5, fontWeight: 600, color: BLACK }}>{d.imei}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {d.type === 'radar' ? <IconAntennaBars5 size={15} style={{ flexShrink: 0 }} /> : <IconSos size={15} style={{ flexShrink: 0 }} />}
                      <span style={{ fontSize: 12 }}>{d.typeName}</span>
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: BLACK, fontFamily: font }}>บ้าน {h.no}{h.nickname ? ` · ${h.nickname}` : ''}</div>
                      <div style={{ fontSize: 10.5, color: GRAY2, fontFamily: font }}>{getVillage(d.villageId).name}</div>
                    </div>
                    <div style={{ fontSize: 11.5 }}>{d.attach.kind === 'house' ? <><IconDoor size={12} style={{ verticalAlign: '-2px' }} /> {d.attach.location}</> : <><IconDeviceWatch size={12} style={{ verticalAlign: '-2px' }} /> {d.attach.residentName}</>}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'flex-start' }}>
                      {d.online ? <Pill color={GREEN} bg="rgba(52,199,89,0.12)">online</Pill> : <Pill color={ORANGE} bg="rgba(232,128,42,0.12)">offline</Pill>}
                      {d.presence && <span style={{ fontSize: 10, color: d.presence === 'มีคน' ? BLUE : GRAY2, fontFamily: font }}>{d.presence === 'มีคน' ? <><IconUser size={12} style={{ verticalAlign: '-2px' }} /> มีคนในห้อง</> : '— ไม่มีคน'}</span>}
                    </div>
                    <div className="num" style={{ fontSize: 11.5 }}>{d.lastSeen}</div>
                  </TRow>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
