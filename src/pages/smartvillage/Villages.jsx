/* ═══ Smart Village — รายการหมู่บ้าน — spec 5.2 ═══ */
import { useState } from 'react';
import {
  SV_VILLAGES, villageStats, villageStatus, SV_STATUS_META,
} from '../../data/smartVillage';
import {
  font, BLACK, GRAY, GRAY2, PURPLE, GREEN, RED,
  card, btnPrimary, btnGhost, PageHead, Pill, SearchBox, Modal, Field, TextInput, Select, SVMap, THead, TRow, CopyBtn,
} from './shared';
import { IconBuildingCommunity, IconMapPin, IconConfetti, IconList, IconLayoutGrid } from '@tabler/icons-react';

const TYPES = ['หมู่บ้านจัดสรร', 'คอนโด/อาคาร', 'ชุมชน', 'อื่นๆ'];

/* ── ฟอร์มเพิ่มหมู่บ้าน — ปักหมุดบนแผนที่ (จำเป็น) ── */
function AddVillageModal({ onClose }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('หมู่บ้านจัดสรร');
  const [address, setAddress] = useState('');
  const [pin, setPin] = useState(null);
  const [saved, setSaved] = useState(false);

  if (saved) {
    return (
      <Modal title={<>เพิ่มหมู่บ้านสำเร็จ <IconConfetti size={16} style={{ verticalAlign: '-2px' }} /></>} sub="ขั้นถัดไปตาม flow การติดตั้ง" onClose={onClose} width={440}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {['สร้างบัญชี รปภ. แล้วส่งมอบ username/รหัสผ่าน', 'เพิ่มบ้าน + ปักหมุดตำแหน่ง', 'เพิ่มคนในบ้านและผู้ติดต่อ', 'ติดตั้งอุปกรณ์ + ยืนยันเครื่อง online', 'ส่ง QR รหัสบ้านให้ลูกบ้านเชื่อม Family'].map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', background: 'rgba(102,88,225,0.06)', borderRadius: 12, padding: '10px 14px' }}>
              <span style={{
                width: 22, height: 22, borderRadius: '50%', flexShrink: 0, fontSize: 11, fontWeight: 700,
                background: 'linear-gradient(180deg,#8B81F2,#6658E1)', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: font,
              }}>{i + 1}</span>
              <span style={{ fontSize: 12.5, color: BLACK, fontFamily: font }}>{s}</span>
            </div>
          ))}
          <button className="hover-btn" style={{ ...btnPrimary, justifyContent: 'center', marginTop: 6 }} onClick={onClose}>เข้าใจแล้ว</button>
        </div>
      </Modal>
    );
  }

  const canSave = name && address && pin;
  return (
    <Modal title="+ เพิ่มหมู่บ้าน" sub="สร้างหมู่บ้าน/โครงการใหม่เข้าระบบเฝ้าระวัง" onClose={onClose} width={640}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 12 }}>
          <Field label="ชื่อหมู่บ้าน/โครงการ" required>
            <TextInput value={name} onChange={e => setName(e.target.value)} placeholder="เช่น เดอะแกรนด์ วิลล่า ขอนแก่น" />
          </Field>
          <Field label="ประเภทสถานที่" required>
            <Select options={TYPES} value={type} onChange={setType} />
          </Field>
        </div>
        <Field label="ที่อยู่ + จังหวัด/อำเภอ/ตำบล" required>
          <TextInput value={address} onChange={e => setAddress(e.target.value)} placeholder="เลขที่ ถนน ตำบล อำเภอ จังหวัด" />
        </Field>
        <Field label="ปักหมุดตำแหน่งบนแผนที่" required hint="คลิกบนแผนที่เพื่อวางหมุด · ลากหมุดปรับตำแหน่งได้">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <button className="hover-btn" style={{ ...btnGhost, padding: '6px 12px', fontSize: 11.5 }} onClick={() => setPin({ lat: 16.4419, lng: 102.8360 })}>
                <IconMapPin size={12} style={{ verticalAlign: '-2px' }} /> ใช้ตำแหน่งจากที่อยู่
              </button>
              {pin ? (
                <>
                  <span className="num" style={{ fontSize: 11.5, color: GRAY, fontFamily: font }}>{pin.lat}, {pin.lng}</span>
                  <CopyBtn text={`${pin.lat}, ${pin.lng}`} label="copy พิกัด" />
                </>
              ) : (
                <span style={{ fontSize: 11.5, color: RED, fontFamily: font }}>ยังไม่ได้ปักหมุด</span>
              )}
            </div>
            <SVMap picker pin={pin} onPick={setPin} center={[102.836, 16.442]} zoom={12.5} height={220} radius={14} />
          </div>
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="ผู้ติดต่อนิติบุคคล"><TextInput placeholder="ชื่อ (ไม่บังคับ)" /></Field>
          <Field label="เบอร์โทร"><TextInput placeholder="08x-xxx-xxxx (ไม่บังคับ)" /></Field>
        </div>
        <Field label="หมายเหตุ"><TextInput placeholder="(ไม่บังคับ)" /></Field>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
          <button className="hover-btn" style={btnGhost} onClick={onClose}>ยกเลิก</button>
          <button
            className="hover-btn"
            style={{ ...btnPrimary, opacity: canSave ? 1 : 0.45, cursor: canSave ? 'pointer' : 'not-allowed' }}
            onClick={() => canSave && setSaved(true)}
          >
            บันทึกหมู่บ้าน
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default function Villages({ onDrillVillage, onGoSection }) {
  const [q, setQ] = useState('');
  const [typeFilter, setTypeFilter] = useState('ทั้งหมด');
  const [statusFilter, setStatusFilter] = useState('ทั้งหมด');
  const [view, setView] = useState('table');
  const [adding, setAdding] = useState(false);

  const rows = SV_VILLAGES.filter(v =>
    (typeFilter === 'ทั้งหมด' || v.type === typeFilter) &&
    (statusFilter === 'ทั้งหมด' || v.status === statusFilter) &&
    (v.name + v.province).toLowerCase().includes(q.toLowerCase())
  );

  const COLS = '1.8fr 1fr 1fr 76px 110px 70px 90px 90px';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="anim-slide-up">
        <PageHead thai="หมู่บ้าน" section="sv-villages" onGoSection={onGoSection} />
      </div>

      <div className="anim-slide-up delay-1" style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <button className="hover-btn" style={btnPrimary} onClick={() => setAdding(true)}>+ เพิ่มหมู่บ้าน</button>
        <SearchBox value={q} onChange={setQ} placeholder="ค้นหาชื่อหมู่บ้าน / จังหวัด…" width={260} />
        <div className="seg">
          {['ทั้งหมด', ...TYPES].map(t => (
            <button key={t} className={`seg-btn${typeFilter === t ? ' active' : ''}`} onClick={() => setTypeFilter(t)}>{t}</button>
          ))}
        </div>
        <div className="seg">
          {['ทั้งหมด', 'ใช้งาน', 'ระงับ'].map(s => (
            <button key={s} className={`seg-btn${statusFilter === s ? ' active' : ''}`} onClick={() => setStatusFilter(s)}>
              {s === 'ทั้งหมด' ? 'สถานะ: ทั้งหมด' : s}
            </button>
          ))}
        </div>
        <div className="seg" style={{ marginLeft: 'auto' }}>
          <button className={`seg-btn${view === 'table' ? ' active' : ''}`} onClick={() => setView('table')}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><IconList size={13} style={{ flexShrink: 0 }} /> ตาราง</span></button>
          <button className={`seg-btn${view === 'card' ? ' active' : ''}`} onClick={() => setView('card')}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><IconLayoutGrid size={13} style={{ flexShrink: 0 }} /> การ์ด</span></button>
        </div>
      </div>

      {view === 'table' ? (
        <div className="anim-slide-up delay-2" style={{ ...card, padding: '8px 8px' }}>
          <div style={{ overflowX: 'auto' }}>
            <div style={{ minWidth: 860 }}>
              <THead cols={COLS} labels={['หมู่บ้าน', 'ประเภท', 'จังหวัด/อำเภอ', 'บ้าน', 'อุปกรณ์', 'รปภ.', 'เหตุ 30 วัน', 'สถานะ']} />
              {rows.map(v => {
                const s = villageStats(v.id);
                const st = villageStatus(v.id);
                return (
                  <TRow key={v.id} cols={COLS} onClick={() => onDrillVillage(v.id)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                      <span style={{ width: 9, height: 9, borderRadius: '50%', background: SV_STATUS_META[st].color, flexShrink: 0, animation: st === 'alert' ? 'svBlink 1.2s infinite' : 'none' }} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: BLACK, fontFamily: font }}>{v.name}</div>
                        <div className="num" style={{ fontSize: 10.5, color: GRAY2 }}>{v.code}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 12 }}>{v.type}</div>
                    <div style={{ fontSize: 12 }}>{v.province} · {v.district}</div>
                    <div className="num" style={{ fontSize: 13, fontWeight: 600, color: BLACK }}>{s.houses}</div>
                    <div className="num" style={{ fontSize: 12 }}>
                      <span style={{ color: GREEN, fontWeight: 700 }}>{s.online}</span>
                      <span style={{ color: GRAY2 }}>/{s.devices} online</span>
                    </div>
                    <div className="num" style={{ fontSize: 13, fontWeight: 600, color: s.guards === 0 ? RED : BLACK }}>{s.guards}</div>
                    <div className="num" style={{ fontSize: 13, fontWeight: 600, color: BLACK }}>{s.alerts30d}</div>
                    <div>
                      {v.status === 'ใช้งาน'
                        ? <Pill color={GREEN} bg="rgba(52,199,89,0.12)">ใช้งาน</Pill>
                        : <Pill color={GRAY2} bg="rgba(146,145,165,0.15)">ระงับ</Pill>}
                    </div>
                  </TRow>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="anim-slide-up delay-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
          {rows.map(v => {
            const s = villageStats(v.id);
            const st = villageStatus(v.id);
            return (
              <div key={v.id} className="hover-card" onClick={() => onDrillVillage(v.id)} style={{ ...card, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 16, fontSize: 20, flexShrink: 0,
                    background: 'linear-gradient(180deg,#8B81F2,#6658E1)', boxShadow: '0 4px 12px rgba(102,88,225,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}><IconBuildingCommunity size={20} style={{ flexShrink: 0 }} color="white" /></div>
                  <Pill color={SV_STATUS_META[st].color} bg={`${SV_STATUS_META[st].color}1F`}>{SV_STATUS_META[st].label}</Pill>
                </div>
                <div>
                  <div style={{ fontSize: 14.5, fontWeight: 700, color: BLACK, fontFamily: font }}>{v.name}</div>
                  <div style={{ fontSize: 11.5, color: GRAY, fontFamily: font, marginTop: 2 }}>{v.type} · {v.province}</div>
                </div>
                <div style={{ display: 'flex', gap: 14, borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: 10 }}>
                  {[['บ้าน', s.houses], ['อุปกรณ์', `${s.online}/${s.devices}`], ['รปภ.', s.guards], ['เหตุ 30 วัน', s.alerts30d]].map(([l, val]) => (
                    <div key={l}>
                      <div className="num" style={{ fontSize: 15, fontWeight: 700, color: BLACK }}>{val}</div>
                      <div style={{ fontSize: 10, color: GRAY2, fontFamily: font }}>{l}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {adding && <AddVillageModal onClose={() => setAdding(false)} />}
    </div>
  );
}
