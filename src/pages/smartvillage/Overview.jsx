/* ═══ Smart Village — ภาพรวม (Central Overview) — spec 5.1 ═══
   Layout จอมอนิเตอร์: แผนที่เป็น dominant เต็มพื้นที่ · element อื่นลอย + compact
   คงข้อมูลเดิม (KPI, หมู่บ้าน, attention, เหตุการณ์ล่าสุด) */
import imgHero3d from '../../assets/images/homevisit-hero-3d.png';
import imgVillage3d from '../../assets/images/sv-village-3d.png';
import imgAlert3d from '../../assets/images/sv-alert-3d.png';
import {
  SV_VILLAGES, SV_HOUSES, SV_DEVICES, SV_ALERTS,
  activeAlerts, getHouse, getVillage, getDevice, buildAttention,
  villageStatus, villageStats, SV_STATUS_META, ALERT_RESULT_META,
} from '../../data/smartVillage';
import {
  font, BLACK, GRAY, GRAY2, RED, GREEN, ORANGE, PURPLE,
  card, btnPrimary, btnGhost, PageHead, Pill, LivePill, SVMap, SectionTitle, ElapsedSince, EmptyState,
} from './shared';
import {
  IconAlertTriangleFilled, IconBuildingCommunity, IconHome,
  IconAntennaBars5, IconCalendar, IconClipboardList, IconHistory, IconDeviceDesktop,
  IconWifiOff, IconLink, IconPhoneOff, IconShield, IconCircleCheck, IconChevronRight,
} from '@tabler/icons-react';

const ATTENTION_ICONS = { offline: IconWifiOff, nofamily: IconLink, nocontact: IconPhoneOff, noguard: IconShield };

/* panel glass ลอย — compact */
const FLOAT = {
  background: 'rgba(255,255,255,0.78)', backdropFilter: 'blur(24px) saturate(180%)',
  border: '1.5px solid rgba(255,255,255,0.9)', borderRadius: 18,
  boxShadow: '0 8px 28px rgba(108,92,231,0.15)',
  display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden',
};

/* KPI pill compact ลอยบนแผนที่ */
function KpiPill({ icon, label, value, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 13px', borderRadius: 100, background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(16px) saturate(180%)', border: '1px solid rgba(255,255,255,0.9)', boxShadow: '0 2px 10px rgba(13,10,44,0.08)', flexShrink: 0 }}>
      <span style={{ width: 26, height: 26, borderRadius: 9, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{icon}</span>
      <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
        <span style={{ fontSize: 15, fontWeight: 800, color: BLACK, fontFamily: font }}>{value}</span>
        <span style={{ fontSize: 9.5, color: GRAY2, fontFamily: font }}>{label}</span>
      </span>
    </div>
  );
}

export default function Overview({ onDrillHouse, onDrillVillage, onGoSection, onOpenGuard }) {
  /* Empty state ระดับหน้า */
  if (SV_VILLAGES.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="anim-slide-up">
          <PageHead thai="ภาพรวม" image={imgHero3d} right={<LivePill />} section="sv-overview" onGoSection={onGoSection} />
        </div>
        <div className="anim-slide-up delay-1">
          <EmptyState
            icon={<IconBuildingCommunity size={26} style={{ flexShrink: 0 }} />}
            title="ยังไม่มีหมู่บ้านในระบบ"
            sub="เริ่มจากเพิ่มหมู่บ้านแรก แล้วทำตาม flow ติดตั้ง: สร้างบัญชี รปภ. → เพิ่มบ้าน → ติดตั้งอุปกรณ์ → เชื่อม Family"
            cta={<button className="hover-btn" style={btnPrimary} onClick={() => onGoSection('sv-villages')}>+ เพิ่มหมู่บ้านแรก</button>}
          />
        </div>
      </div>
    );
  }

  const actives = activeAlerts();
  const newCount = actives.filter(a => a.status === 'ใหม่').length;
  const attention = buildAttention();
  const totalDevices = SV_DEVICES.length;
  const online = SV_DEVICES.filter(d => d.online).length;
  const installedHouses = SV_HOUSES.filter(h => SV_DEVICES.some(d => d.houseId === h.id)).length;
  const today = SV_ALERTS.filter(a => a.date === 'วันนี้').length;
  const month = SV_ALERTS.filter(a => a.date === 'วันนี้' || a.date.includes('ก.ค.')).length;
  /* ประวัติ = เหตุที่ปิดแล้ว (เหตุ active อยู่ใน panel ขวาแล้ว — ไม่ซ้ำ) */
  const recent = SV_ALERTS.filter(a => a.status === 'ปิดแล้ว').slice(0, 8);

  const mapPoints = SV_VILLAGES.map(v => {
    const st = villageStatus(v.id);
    const s = villageStats(v.id);
    return {
      lat: v.lat, lng: v.lng, name: v.name, color: SV_STATUS_META[st].color, status: st, big: st === 'alert',
      subHtml: `
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
          <span style="width:8px;height:8px;border-radius:50%;background:${SV_STATUS_META[st].color};display:inline-block;"></span>
          <span style="font-size:11.5px;color:${GRAY};">${SV_STATUS_META[st].label}</span>
        </div>
        <div style="font-size:11.5px;color:${GRAY};">บ้าน ${s.houses} หลัง · อุปกรณ์ ${s.online}/${s.devices} online</div>
        <div style="font-size:11px;color:${PURPLE};font-weight:600;margin-top:5px;">คลิกเพื่อเปิดหมู่บ้าน →</div>`,
      onClick: () => onDrillVillage(v.id),
    };
  });

  const rank = { alert: 0, offline: 1, ok: 2, suspended: 3 };
  const sortedVillages = [...SV_VILLAGES].sort((a, b) => (rank[villageStatus(a.id)] ?? 9) - (rank[villageStatus(b.id)] ?? 9));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div className="anim-slide-up">
        <PageHead
          thai="ภาพรวม" image={imgHero3d} right={<LivePill />} section="sv-overview" onGoSection={onGoSection}
          topRight={<>
            <button className="hover-btn" style={btnGhost} onClick={onOpenGuard}><IconDeviceDesktop size={14} style={{ verticalAlign: '-2px' }} /> จอ รปภ. (ตัวอย่าง)</button>
            <button className="hover-btn" style={btnPrimary} onClick={() => onGoSection('sv-devices', { addDevice: true })}>+ เพิ่มอุปกรณ์</button>
          </>}
        />
      </div>

      {/* KPI compact — แถวเหนือแผนที่ (ไม่ลอยทับ panel) */}
      <div className="anim-slide-up delay-1" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <KpiPill icon={<IconBuildingCommunity size={14} color="white" style={{ flexShrink: 0 }} />} value={SV_VILLAGES.length} label="หมู่บ้าน" color="linear-gradient(149deg,#8B5CF6,#7C3AED)" />
        <KpiPill icon={<IconHome size={14} color="white" style={{ flexShrink: 0 }} />} value={installedHouses} label="ติดตั้งแล้ว" color="linear-gradient(149deg,#19A589,#0D7C66)" />
        <KpiPill icon={<IconAntennaBars5 size={14} color="white" style={{ flexShrink: 0 }} />} value={`${online}/${totalDevices}`} label="อุปกรณ์ online" color="linear-gradient(149deg,#3B82F6,#1D4ED8)" />
        <KpiPill icon={<IconAlertTriangleFilled size={14} color="white" style={{ flexShrink: 0 }} />} value={today} label="เหตุวันนี้" color="linear-gradient(149deg,#E8432A,#D0381A)" />
        <KpiPill icon={<IconCalendar size={14} color="white" style={{ flexShrink: 0 }} />} value={month} label="เหตุเดือนนี้" color="linear-gradient(149deg,#E8802A,#D06A1A)" />
      </div>

      {/* ── Console: หมู่บ้าน · แผนที่ (card) · เหตุการณ์ ── */}
      <div className="anim-slide-up delay-2" style={{ display: 'flex', gap: 14, height: 'calc(100vh - 300px)', minHeight: 560 }}>

        {/* ── ซ้าย: รายการหมู่บ้าน (Figma 390:6174) ── */}
        <aside style={{ width: 270, flexShrink: 0, background: 'white', borderRadius: 24, overflow: 'hidden', border: '1.5px solid rgba(255,255,255,0.9)', boxShadow: '0 8px 28px rgba(108,92,231,0.12)', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {/* header น้ำเงิน + ภาพบ้าน 3D */}
          <div style={{ position: 'relative', background: 'linear-gradient(149deg, #2A7DF5 0%, #0546C9 100%)', padding: '16px 16px 30px', flexShrink: 0, overflow: 'hidden' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'white', fontFamily: font, position: 'relative', zIndex: 1 }}>หมู่บ้านทั้งหมด</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', fontFamily: font, marginTop: 4, position: 'relative', zIndex: 1 }}>ออนไลน์ {online}/{totalDevices}</div>
            <img src={imgVillage3d} alt="" style={{ position: 'absolute', right: -12, top: 4, width: 130, height: 100, objectFit: 'cover', objectPosition: '54% 42%', pointerEvents: 'none' }} />
          </div>
          {/* list — stack ทับ header + top rounded */}
          <div style={{ overflowY: 'auto', minHeight: 0, background: 'white', marginTop: -20, borderTopLeftRadius: 24, borderTopRightRadius: 24, position: 'relative', zIndex: 1 }}>
            {sortedVillages.map(v => {
              const st = villageStatus(v.id);
              const s = villageStats(v.id);
              const isAlert = st === 'alert';
              return (
                <button key={v.id} onClick={() => onDrillVillage(v.id)} className="hover-btn" style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, width: '100%', textAlign: 'left', cursor: 'pointer',
                  padding: '10px 16px', border: 'none', borderBottom: '0.5px solid #CCC',
                  background: isAlert ? 'rgba(255,56,60,0.06)' : 'white',
                }}>
                  <span style={{ minWidth: 0 }}>
                    <span style={{ display: 'block', fontSize: 14, fontWeight: 600, color: isAlert ? '#D0342C' : '#000', fontFamily: font, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{v.name}</span>
                    <span style={{ display: 'block', fontSize: 12, color: 'rgba(0,0,0,0.6)', fontFamily: font, marginTop: 6 }}>ให้บริการอยู่ {s.houses} ครัวเรือน</span>
                  </span>
                  <IconChevronRight size={20} color="rgba(0,0,0,0.45)" style={{ flexShrink: 0 }} />
                </button>
              );
            })}
          </div>
        </aside>

        {/* ── กลาง: แผนที่ (card) ── */}
        <main style={{ ...FLOAT, flex: 1, minWidth: 0 }}>
          <div style={{ padding: '11px 16px 9px', borderBottom: '1px solid rgba(13,10,44,0.06)', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <IconBuildingCommunity size={15} color={PURPLE} style={{ flexShrink: 0 }} />
            <div style={{ fontSize: 14, fontWeight: 800, color: BLACK, fontFamily: font }}>แผนที่หมู่บ้าน</div>
            <div style={{ fontSize: 10.5, color: GRAY2, fontFamily: font }}>คลิกหมุดเพื่อเปิด</div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {Object.entries(SV_STATUS_META).map(([k, m]) => (
                <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 10.5, color: GRAY, fontFamily: font }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: m.color }} />{m.label}
                </span>
              ))}
            </div>
          </div>
          <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
            <div style={{ position: 'absolute', inset: 0 }}>
              <SVMap points={mapPoints} center={[100.9, 15.2]} zoom={5.0} height="100%" radius={0} />
            </div>
          </div>
        </main>

        {/* ── ขวา: เหตุการณ์ active (blue header + stack) ── */}
        <aside style={{ flexShrink: 0, width: 320, background: 'white', borderRadius: 24, overflow: 'hidden', border: '1.5px solid rgba(255,255,255,0.9)', boxShadow: '0 8px 28px rgba(108,92,231,0.12)', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {/* header แดง — context เหตุการณ์/แจ้งเตือน */}
          <div style={{ position: 'relative', background: 'linear-gradient(149deg, #E8432A 0%, #D0381A 100%)', padding: '16px 16px 30px', flexShrink: 0, overflow: 'hidden' }}>
            <img src={imgAlert3d} alt="" style={{ position: 'absolute', right: -18, top: 6, width: 150, height: 96, objectFit: 'contain', objectPosition: 'center', pointerEvents: 'none' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, position: 'relative', zIndex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'white', fontFamily: font }}>เหตุการณ์</div>
              <button className="hover-btn" onClick={onOpenGuard} style={{ marginLeft: 'auto', height: 28, padding: '0 12px', borderRadius: 100, cursor: 'pointer', border: '1px solid rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(10px) saturate(180%)', WebkitBackdropFilter: 'blur(10px) saturate(180%)', color: 'white', fontSize: 11, fontWeight: 700, fontFamily: font }}><IconDeviceDesktop size={12} style={{ verticalAlign: '-2px' }} /> จอ รปภ.</button>
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', fontFamily: font, marginTop: 4, position: 'relative', zIndex: 1 }}>
              {actives.length > 0 ? `active ${actives.length}${newCount > 0 ? ` · ยังไม่รับทราบ ${newCount}` : ''}` : 'ไม่มีเหตุ active'}
            </div>
          </div>
          {/* list — stack ทับ header + top rounded */}
          <div style={{ flex: 1, overflowY: 'auto', minHeight: 0, background: 'white', marginTop: -20, borderTopLeftRadius: 24, borderTopRightRadius: 24, position: 'relative', zIndex: 1, padding: '16px 11px 11px', display: 'flex', flexDirection: 'column', gap: 9 }}>
            {actives.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '22px 16px' }}>
                <IconCircleCheck size={26} color={GREEN} style={{ flexShrink: 0 }} />
                <div style={{ fontSize: 12.5, fontWeight: 700, color: BLACK, fontFamily: font, marginTop: 7 }}>ไม่มีเหตุ active</div>
                <div style={{ fontSize: 11, color: GRAY2, fontFamily: font, marginTop: 3 }}>ทุกหมู่บ้านทำงานปกติ</div>
              </div>
            ) : actives.map(a => {
              const house = getHouse(a.houseId);
              const village = getVillage(a.villageId);
              const device = getDevice(a.deviceId);
              const isNew = a.status === 'ใหม่';
              const accent = isNew ? RED : ORANGE;
              return (
                <div key={a.id} className="hover-btn" onClick={() => onDrillHouse(a.villageId, a.houseId)} style={{
                  cursor: 'pointer', flexShrink: 0, background: 'rgba(255,255,255,0.92)', borderRadius: 13, padding: '10px 12px',
                  borderLeft: `4px solid ${accent}`, boxShadow: '0 4px 16px rgba(108,92,231,0.1)',
                  animation: isNew ? 'svSirenGlow 1.6s ease-in-out infinite' : 'none',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <IconAlertTriangleFilled size={11} color={accent} style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: 10, fontWeight: 700, color: accent, fontFamily: font }}>{isNew ? 'ยังไม่รับทราบ' : 'รับทราบแล้ว'}</span>
                    <ElapsedSince minAgo={a.minAgo} style={{ marginLeft: 'auto', fontSize: 10.5, fontWeight: 800, color: accent }} />
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: BLACK, fontFamily: font, marginTop: 3 }}>บ้าน {house.no}{house.nickname ? ` · ${house.nickname}` : ''}</div>
                  <div style={{ fontSize: 10.5, color: GRAY, fontFamily: font, marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {village.name} · {device.attach.kind === 'person' ? `ติดตัว ${device.attach.residentName}` : a.location} · {a.time} น.
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

      </div>

      {/* ── ใต้แผนที่: รายละเอียด — ต้องตามงาน + เหตุการณ์ล่าสุด ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 14, alignItems: 'stretch' }}>
        {/* ต้องตามงาน */}
        <div className="anim-slide-up delay-3" style={{ ...card, display: 'flex', flexDirection: 'column' }}>
          <SectionTitle icon={<IconClipboardList size={15} style={{ flexShrink: 0 }} />} title="ต้องตามงาน" sub={`${attention.length} รายการ`} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto', flex: 1, minHeight: 0, paddingRight: 2 }}>
            {attention.length === 0 && <div style={{ fontSize: 12, color: GRAY2, fontFamily: font, padding: '8px 2px' }}>ไม่มีรายการค้าง</div>}
            {attention.map((it, i) => {
              const AttIcon = ATTENTION_ICONS[it.kind] || IconClipboardList;
              return (
                <div key={i} className="hover-card" onClick={() => it.houseId ? onDrillHouse(it.villageId, it.houseId) : onDrillVillage(it.villageId)} style={{
                  display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer',
                  background: it.severity === 'warn' ? 'rgba(232,128,42,0.07)' : 'rgba(102,88,225,0.06)',
                  border: `1px solid ${it.severity === 'warn' ? 'rgba(232,128,42,0.2)' : 'rgba(102,88,225,0.15)'}`,
                  borderRadius: 14, padding: '10px 12px',
                }}>
                  <AttIcon size={15} color={it.severity === 'warn' ? '#C96A12' : PURPLE} style={{ flexShrink: 0, marginTop: 1 }} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: BLACK, fontFamily: font, lineHeight: 1.45 }}>{it.title}</div>
                    <div style={{ fontSize: 10.5, color: GRAY, fontFamily: font, marginTop: 2 }}>{it.sub}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* เหตุการณ์ล่าสุด */}
        <div className="anim-slide-up delay-4" style={{ ...card }}>
          <SectionTitle
            icon={<IconHistory size={15} style={{ flexShrink: 0 }} />} title="ประวัติเหตุที่ปิดแล้ว" sub={`${recent.length} รายการล่าสุด`}
            right={<button className="hover-btn" style={{ ...btnGhost, padding: '6px 14px', fontSize: 12 }} onClick={() => onGoSection('sv-alerts')}>ดูทั้งหมด →</button>}
          />
          <div style={{ overflowX: 'auto' }}>
            <div style={{ minWidth: 560 }}>
              {recent.map(a => {
                const h = getHouse(a.houseId);
                return (
                  <div key={a.id} className="hover-row" onClick={() => onDrillHouse(a.villageId, a.houseId)} style={{
                    display: 'grid', gridTemplateColumns: '110px 1.5fr 1.2fr 130px', gap: 12, alignItems: 'center',
                    padding: '11px 12px', borderTop: '1px solid rgba(0,0,0,0.04)', borderRadius: 14, cursor: 'pointer',
                  }}>
                    <div>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: BLACK, fontFamily: font }}>{a.time} น.</div>
                      <div style={{ fontSize: 10.5, color: GRAY2, fontFamily: font }}>{a.date}</div>
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: BLACK, fontFamily: font }}>บ้าน {h.no}{h.nickname ? ` · ${h.nickname}` : ''}</div>
                      <div style={{ fontSize: 11, color: GRAY, fontFamily: font }}>{getVillage(a.villageId).name}</div>
                    </div>
                    <div style={{ fontSize: 11.5, color: GRAY, fontFamily: font }}>{a.detectType} · {a.location}</div>
                    <div>
                      {a.result
                        ? <Pill color={ALERT_RESULT_META[a.result].color} bg={ALERT_RESULT_META[a.result].bg} dot={false}>{a.result}</Pill>
                        : <span style={{ fontSize: 11, color: GRAY2, fontFamily: font }}>—</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
