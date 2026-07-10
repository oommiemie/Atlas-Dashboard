/* ═══ Smart Village — รายการหมู่บ้าน — spec 5.2 ═══ */
import { useState, useEffect } from 'react';
import {
  SV_VILLAGES, villageStats, villageStatus, SV_STATUS_META,
} from '../../data/smartVillage';
import {
  font, BLACK, GRAY, GRAY2, PURPLE, GREEN, RED,
  card, btnPrimary, btnGhost, PageHead, Pill, SearchBox, Modal, Field, TextInput, Select, SVMap, THead, TRow, CopyBtn,
} from './shared';
import { IconBuildingCommunity, IconMapPin, IconConfetti, IconList, IconLayoutGrid, IconMap2, IconCheck, IconChevronLeft, IconChevronRight, IconInfoCircle, IconAddressBook } from '@tabler/icons-react';

const TYPES = ['หมู่บ้านจัดสรร', 'คอนโด/อาคาร', 'ชุมชน', 'อื่นๆ'];

/* ── ฟอร์มเพิ่มหมู่บ้าน — ปักหมุดบนแผนที่ (จำเป็น) ── */
function AddVillageModal({ onClose }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('หมู่บ้านจัดสรร');
  const [address, setAddress] = useState('');
  const [pin, setPin] = useState(null);
  const [saved, setSaved] = useState(false);
  const [step, setStep] = useState(1); // 1 ข้อมูล · 2 ตำแหน่ง · 3 ผู้ติดต่อ
  /* geocode autocomplete (Nominatim/OSM — ฟรี ไม่ต้อง key) */
  const [geoResults, setGeoResults] = useState([]);
  const [geoLoading, setGeoLoading] = useState(false);
  const [focusNonce, setFocusNonce] = useState(0);
  const [pickedName, setPickedName] = useState(''); // ชื่อที่เพิ่งเลือกพิกัดแล้ว — กันเปิด dropdown ซ้ำ

  /* debounce ค้นพิกัดจากชื่อหมู่บ้านที่พิมพ์ (autocomplete ในช่องเดียว) */
  useEffect(() => {
    const q = name.trim();
    if (q.length < 3 || q === pickedName) { setGeoResults([]); setGeoLoading(false); return; }
    setGeoLoading(true);
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&countrycodes=th&limit=6&addressdetails=1&q=${encodeURIComponent(q)}`, { headers: { 'Accept-Language': 'th' } });
        const j = await r.json();
        setGeoResults(Array.isArray(j) ? j : []);
      } catch { setGeoResults([]); }
      setGeoLoading(false);
    }, 400);
    return () => clearTimeout(t);
  }, [name, pickedName]);

  const pickGeo = (res) => {
    setPin({ lat: +(+res.lat).toFixed(6), lng: +(+res.lon).toFixed(6) });
    setFocusNonce(n => n + 1);
    setPickedName(name.trim());
    setGeoResults([]);
  };

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

  const STEPS = [
    { n: 1, label: 'ข้อมูล & ตำแหน่ง', icon: IconInfoCircle },
    { n: 2, label: 'ผู้ติดต่อ', icon: IconAddressBook },
  ];
  const step1ok = name.trim() && address.trim() && !!type && !!pin;
  const step2ok = true; // ผู้ติดต่อ/หมายเหตุ ไม่บังคับ
  const stepOk = { 1: step1ok, 2: step2ok };
  const canSave = step1ok;
  const goNext = () => { if (stepOk[step] && step < 2) setStep(step + 1); };
  const goBack = () => { if (step > 1) setStep(step - 1); };

  return (
    <Modal title="+ เพิ่มหมู่บ้าน" onClose={onClose} width={640}>
      {/* ── stepper ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
        {STEPS.map((s, i) => {
          const done = s.n < step;
          const active = s.n === step;
          const Ic = s.icon;
          return (
            <div key={s.n} style={{ display: 'flex', alignItems: 'center', flex: 'none' }}>
              <div
                onClick={() => s.n <= step && setStep(s.n)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: s.n <= step ? 'pointer' : 'default' }}
              >
                <div style={{
                  width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: done ? GREEN : active ? PURPLE : 'rgba(116,116,128,0.12)',
                  color: done || active ? 'white' : GRAY2,
                  boxShadow: active ? '0 4px 12px rgba(102,88,225,0.35)' : 'none', transition: 'all .2s',
                }}>
                  {done ? <IconCheck size={17} style={{ flexShrink: 0 }} /> : <Ic size={16} style={{ flexShrink: 0 }} />}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 9.5, color: GRAY2, fontFamily: font, lineHeight: 1.1 }}>ขั้นที่ {s.n}</div>
                  <div style={{ fontSize: 12.5, fontWeight: active || done ? 700 : 500, color: active ? PURPLE : done ? '#1E9E4B' : GRAY, fontFamily: font }}>{s.label}</div>
                </div>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ width: 56, height: 2, margin: '0 10px', borderRadius: 2, background: done ? GREEN : 'rgba(116,116,128,0.15)', transition: 'all .2s' }} />
              )}
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minHeight: 260 }}>
        {/* ── ขั้นที่ 1 · ข้อมูล ── */}
        {step === 1 && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 12 }}>
              <Field label="ชื่อหมู่บ้าน/โครงการ" required hint="พิมพ์ชื่อ ระบบค้นพิกัดให้อัตโนมัติ — กดเลือกเพื่อปักหมุด">
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'relative' }}>
                    <input
                      value={name} onChange={e => setName(e.target.value)}
                      placeholder="เช่น เดอะแกรนด์ วิลล่า ขอนแก่น"
                      style={{ width: '100%', height: 40, borderRadius: 12, padding: '0 34px 0 12px', boxSizing: 'border-box', border: '1.5px solid rgba(116,116,128,0.15)', fontSize: 13, fontFamily: font, outline: 'none' }}
                    />
                    {geoLoading && <span style={{ position: 'absolute', right: 12, top: '50%', width: 14, height: 14, marginTop: -7, border: `2px solid ${PURPLE}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'svSpin 0.7s linear infinite' }} />}
                  </div>
                  {geoResults.length > 0 && (
                    <div style={{ position: 'absolute', top: 44, left: 0, right: 0, zIndex: 20, background: 'white', borderRadius: 12, border: '1px solid rgba(13,10,44,0.1)', boxShadow: '0 12px 32px rgba(13,10,44,0.14)', overflow: 'hidden', maxHeight: 220, overflowY: 'auto' }}>
                      {geoResults.map(r => (
                        <div key={r.place_id} className="hover-btn" onClick={() => pickGeo(r)} style={{ display: 'flex', gap: 9, alignItems: 'flex-start', padding: '9px 12px', cursor: 'pointer', borderBottom: '1px solid rgba(13,10,44,0.05)' }}>
                          <IconMapPin size={14} color={PURPLE} style={{ flexShrink: 0, marginTop: 2 }} />
                          <span style={{ fontSize: 12, color: BLACK, fontFamily: font, lineHeight: 1.45 }}>{r.display_name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Field>
              <Field label="ประเภทสถานที่" required>
                <Select options={TYPES} value={type} onChange={setType} />
              </Field>
            </div>
            <Field label="ที่อยู่ + จังหวัด/อำเภอ/ตำบล" required>
              <TextInput value={address} onChange={e => setAddress(e.target.value)} placeholder="เลขที่ ถนน ตำบล อำเภอ จังหวัด" />
            </Field>

            <Field label="ปักหมุดตำแหน่งบนแผนที่" required hint="เลือกจากผลค้นหา · หรือคลิก/ลากหมุดบนแผนที่เพื่อปรับ">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  {pin ? (
                    <>
                      <span className="num" style={{ fontSize: 11.5, color: GRAY, fontFamily: font }}>{pin.lat}, {pin.lng}</span>
                      <CopyBtn text={`${pin.lat}, ${pin.lng}`} label="copy พิกัด" />
                    </>
                  ) : (
                    <span style={{ fontSize: 11.5, color: RED, fontFamily: font }}>ยังไม่ได้ปักหมุด</span>
                  )}
                </div>
                <SVMap picker pin={pin} onPick={setPin} focus={pin} focusNonce={focusNonce} center={[102.836, 16.442]} zoom={12.5} height={230} radius={14} />
              </div>
            </Field>
          </>
        )}

        {/* ── ขั้นที่ 2 · ผู้ติดต่อ ── */}
        {step === 2 && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="ผู้ติดต่อนิติบุคคล"><TextInput placeholder="ชื่อ (ไม่บังคับ)" /></Field>
              <Field label="เบอร์โทร"><TextInput placeholder="08x-xxx-xxxx (ไม่บังคับ)" /></Field>
            </div>
            <Field label="หมายเหตุ"><TextInput placeholder="(ไม่บังคับ)" /></Field>
          </>
        )}
      </div>

      {/* ── footer ── */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between', marginTop: 18 }}>
        <button className="hover-btn" style={btnGhost} onClick={step === 1 ? onClose : goBack}>
          {step === 1 ? 'ยกเลิก' : <><IconChevronLeft size={14} style={{ verticalAlign: '-2px' }} /> ย้อนกลับ</>}
        </button>
        {step < 2 ? (
          <button className="hover-btn" style={{ ...btnPrimary, opacity: stepOk[step] ? 1 : 0.45 }} onClick={goNext}>
            ถัดไป <IconChevronRight size={14} style={{ verticalAlign: '-2px' }} />
          </button>
        ) : (
          <button className="hover-btn" style={{ ...btnPrimary, opacity: canSave ? 1 : 0.45, cursor: canSave ? 'pointer' : 'not-allowed' }} onClick={() => canSave && setSaved(true)}>บันทึกหมู่บ้าน</button>
        )}
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

  const mapPoints = rows.map(v => {
    const st = villageStatus(v.id);
    const s = villageStats(v.id);
    return {
      lat: v.lat, lng: v.lng, name: v.name, color: SV_STATUS_META[st].color, status: st, big: st === 'alert',
      subHtml: `<div style="font-size:11.5px;color:${GRAY};">${SV_STATUS_META[st].label} · บ้าน ${s.houses} · online ${s.online}/${s.devices}</div>
        <div style="font-size:11px;color:${PURPLE};font-weight:600;margin-top:4px;">คลิกเพื่อเปิดหมู่บ้าน →</div>`,
      onClick: () => onDrillVillage(v.id),
    };
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="anim-slide-up">
        <PageHead thai="หมู่บ้าน" section="sv-villages" onGoSection={onGoSection} />
      </div>

      <div className="anim-slide-up delay-1" style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <button className="hover-btn" style={btnPrimary} onClick={() => setAdding(true)}>+ เพิ่มหมู่บ้าน</button>
        <SearchBox value={q} onChange={setQ} placeholder="ค้นหาชื่อหมู่บ้าน / จังหวัด…" width={220} />
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="f-select" style={{ borderRadius: 100, fontFamily: font }}>
          <option value="ทั้งหมด">ทุกประเภท</option>
          {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="f-select" style={{ borderRadius: 100, fontFamily: font }}>
          <option value="ทั้งหมด">ทุกสถานะ</option>
          <option value="ใช้งาน">ใช้งาน</option>
          <option value="ระงับ">ระงับ</option>
        </select>
        <div className="seg" style={{ marginLeft: 'auto' }}>
          <button className={`seg-btn${view === 'table' ? ' active' : ''}`} onClick={() => setView('table')}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><IconList size={13} style={{ flexShrink: 0 }} /> ตาราง</span></button>
          <button className={`seg-btn${view === 'card' ? ' active' : ''}`} onClick={() => setView('card')}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><IconLayoutGrid size={13} style={{ flexShrink: 0 }} /> การ์ด</span></button>
          <button className={`seg-btn${view === 'map' ? ' active' : ''}`} onClick={() => setView('map')}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><IconMap2 size={13} style={{ flexShrink: 0 }} /> แผนที่</span></button>
        </div>
      </div>

      {view === 'map' ? (
        <div className="anim-slide-up delay-2" style={{ ...card, padding: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', padding: '2px 4px' }}>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: BLACK, fontFamily: font }}>{rows.length} หมู่บ้าน</span>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginLeft: 'auto' }}>
              {Object.entries(SV_STATUS_META).map(([k, m]) => (
                <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, color: GRAY, fontFamily: font }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: m.color }} />{m.label}
                </span>
              ))}
            </div>
          </div>
          <SVMap points={mapPoints} center={[100.9, 15.2]} zoom={5.0} height={520} radius={16} />
        </div>
      ) : view === 'table' ? (
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
