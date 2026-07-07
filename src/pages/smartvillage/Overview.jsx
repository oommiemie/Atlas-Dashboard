/* ═══ Smart Village — ภาพรวม (Central Overview) — spec 5.1 ═══ */
import CountUp from '../../components/CountUp';
import imgHero3d from '../../assets/images/homevisit-hero-3d.png';
import {
  SV_VILLAGES, SV_HOUSES, SV_DEVICES, SV_ALERTS,
  activeAlerts, getHouse, getVillage, getDevice, buildAttention,
  villageStatus, villageStats, SV_STATUS_META, ALERT_STATUS_META, ALERT_RESULT_META,
} from '../../data/smartVillage';
import {
  font, BLACK, GRAY, GRAY2, RED, GREEN, ORANGE, PURPLE,
  card, btnPrimary, btnGhost, PageHead, SectionTitle, Pill, LivePill, SVMap, ElapsedSince, EmptyState,
} from './shared';
import {
  IconAlertTriangleFilled, IconAlertTriangle, IconCheck, IconBuildingCommunity, IconHome,
  IconAntennaBars5, IconCalendar, IconMap2, IconClipboardList, IconHistory, IconDeviceDesktop,
  IconWifiOff, IconLink, IconPhoneOff, IconShield,
} from '@tabler/icons-react';

const ATTENTION_ICONS = {
  offline: IconWifiOff,
  nofamily: IconLink,
  nocontact: IconPhoneOff,
  noguard: IconShield,
};

/* ── แถบเหตุ active — การ์ดเดียวรวมทุกเหตุ แถวละรายการ (กระชับ + anatomy เดียวกับ StatCards) ── */
function ActiveAlertStrip({ alerts, onDrillHouse, onOpenGuard }) {
  const newCount = alerts.filter(a => a.status === 'ใหม่').length;
  return (
    <div style={{
      background: 'linear-gradient(149deg, #E8432A 0%, #D0381A 100%)',
      borderRadius: 24, padding: 16, color: 'white',
      boxShadow: '0 4px 14px rgba(232,67,42,0.3)',
      animation: newCount > 0 ? 'svSirenGlow 1.6s ease-in-out infinite' : 'none',
    }}>
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 14, background: 'rgba(255,255,255,0.2)', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: newCount > 0 ? 'svShake 0.9s ease-in-out infinite' : 'none',
        }}><IconAlertTriangleFilled size={20} style={{ flexShrink: 0 }} /></div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, fontFamily: font }}>เหตุ active · {alerts.length} รายการ</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontFamily: font }}>
            {newCount > 0 ? `ยังไม่มีผู้รับทราบ ${newCount} เหตุ — siren ที่ป้อมยามยังดังอยู่` : 'รับทราบครบทุกเหตุ · กำลังช่วยเหลือ'}
          </div>
        </div>
        <button className="hover-btn" onClick={onOpenGuard} style={{
          ...btnGhost, background: 'rgba(255,255,255,0.18)', color: 'white',
          border: '1px solid rgba(255,255,255,0.4)', padding: '6px 14px', fontSize: 12,
        }}>จอ รปภ.</button>
      </div>
      {/* rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 10 }}>
        {alerts.map(a => {
          const house = getHouse(a.houseId);
          const village = getVillage(a.villageId);
          const device = getDevice(a.deviceId);
          const isNew = a.status === 'ใหม่';
          return (
            <div
              key={a.id} className="hover-btn" onClick={() => onDrillHouse(a.villageId, a.houseId)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
                background: 'rgba(255,255,255,0.12)', borderRadius: 14, padding: '8px 12px', flexWrap: 'wrap',
              }}
            >
              <Pill color={isNew ? '#D0381A' : 'white'} bg={isNew ? 'white' : 'rgba(255,255,255,0.22)'} dot={false} style={{ fontSize: 10, flexShrink: 0 }}>
                {isNew ? 'ยังไม่รับทราบ' : 'รับทราบแล้ว'}
              </Pill>
              <span style={{ fontSize: 13, fontWeight: 700, fontFamily: font, flexShrink: 0 }}>
                บ้าน {house.no}{house.nickname ? ` · ${house.nickname}` : ''}
              </span>
              <span style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.85)', fontFamily: font, flex: 1, minWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {village.name} · {device.attach.kind === 'person' ? `ติดตัว — ${device.attach.residentName}` : a.location} · {a.time} น.
              </span>
              <ElapsedSince minAgo={a.minAgo} style={{ fontSize: 11.5, fontWeight: 700, flexShrink: 0 }} />
              <span style={{ fontSize: 11.5, fontWeight: 700, fontFamily: font, flexShrink: 0 }}>ดูรายละเอียด →</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── การ์ด KPI — anatomy เดียวกับ StatCards หน้า Dashboard (icon box + growth badge + 26/700) ── */
function KpiCard({ icon, label, value, sub, grad, shadow, trend, index = 0, delay = 0 }) {
  return (
    <div className="hover-stat" style={{
      background: grad, borderRadius: 24, padding: 16, color: 'white',
      overflow: 'hidden', position: 'relative', boxShadow: shadow, minWidth: 0,
      display: 'flex', flexDirection: 'column', gap: 8,
      animation: `cardPop 0.5s cubic-bezier(.22,1,.36,1) ${index * 80}ms both`,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', height: 40 }}>
        <div style={{ width: 40, height: 40, borderRadius: 14, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
        </div>
        {trend && (
          <div style={{ background: 'rgba(255,255,255,0.18)', borderRadius: 999, padding: '4px 10px', display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.9)', fontFamily: font }}>{trend}</span>
          </div>
        )}
      </div>
      <span style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.6)', fontFamily: font, letterSpacing: 0.22 }}>{label}</span>
      <CountUp end={value} delay={delay} style={{ fontSize: 26, fontWeight: 700, color: 'white', fontFamily: font, lineHeight: '26px' }} />
      {sub && <div style={{ fontSize: 11, fontFamily: font, color: 'rgba(255,255,255,0.75)' }}>{sub}</div>}
    </div>
  );
}

export default function Overview({ onDrillHouse, onDrillVillage, onGoSection, onOpenGuard }) {
  /* Empty state ระดับหน้า — ยังไม่มีหมู่บ้านเลย → CTA เพิ่มหมู่บ้านแรก (spec 5.1) */
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
  const attention = buildAttention();
  const totalDevices = SV_DEVICES.length;
  const online = SV_DEVICES.filter(d => d.online).length;
  const installedHouses = SV_HOUSES.filter(h => SV_DEVICES.some(d => d.houseId === h.id)).length;
  const today = SV_ALERTS.filter(a => a.date === 'วันนี้').length;
  const month = SV_ALERTS.filter(a => a.date === 'วันนี้' || a.date.includes('ก.ค.')).length;
  const recent = SV_ALERTS.slice(0, 6);

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="anim-slide-up">
        <PageHead
          thai="ภาพรวม" image={imgHero3d} right={<LivePill />} section="sv-overview" onGoSection={onGoSection}
          topRight={<>
            <button className="hover-btn" style={btnGhost} onClick={onOpenGuard}><IconDeviceDesktop size={14} style={{ verticalAlign: '-2px' }} /> จอ รปภ. (ตัวอย่าง)</button>
            <button className="hover-btn" style={btnPrimary} onClick={() => onGoSection('sv-devices', { addDevice: true })}>+ เพิ่มอุปกรณ์</button>
          </>}
        />
      </div>

      {/* แถบเหตุ active — การ์ดเดียวรวมทุกเหตุ */}
      {actives.length > 0 && (
        <div className="anim-slide-up">
          <ActiveAlertStrip alerts={actives} onDrillHouse={onDrillHouse} onOpenGuard={onOpenGuard} />
        </div>
      )}

      {/* KPI — gradient/shadow ชุดเดียวกับ StatCards หน้า Dashboard */}
      <div className="anim-slide-up delay-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 16 }}>
        <KpiCard index={0} icon={<IconBuildingCommunity size={20} style={{ flexShrink: 0 }} />} label="หมู่บ้านทั้งหมด" value={SV_VILLAGES.length} trend="↑ +1" sub={`ใช้งาน ${SV_VILLAGES.filter(v => v.status === 'ใช้งาน').length} · ระงับ ${SV_VILLAGES.filter(v => v.status === 'ระงับ').length}`} grad="linear-gradient(149deg, #8B5CF6 0%, #7C3AED 100%)" shadow="0 4px 14px rgba(139,92,246,0.3)" />
        <KpiCard index={1} icon={<IconHome size={20} style={{ flexShrink: 0 }} />} label="บ้านที่ติดตั้งแล้ว" value={installedHouses} trend="↑ +6.3%" sub={`จากทะเบียนบ้าน ${SV_HOUSES.length} หลัง`} grad="linear-gradient(149deg, #19A589 0%, #0D7C66 100%)" shadow="0 4px 14px rgba(25,165,137,0.3)" delay={80} />
        <KpiCard index={2} icon={<IconAntennaBars5 size={20} style={{ flexShrink: 0 }} />} label="อุปกรณ์ทั้งหมด" value={totalDevices} trend="↑ +8.5%" sub={`online ${online} · offline ${totalDevices - online}`} grad="linear-gradient(149deg, #3B82F6 0%, #1D4ED8 100%)" shadow="0 4px 14px rgba(59,130,246,0.3)" delay={160} />
        <KpiCard index={3} icon={<IconAlertTriangleFilled size={20} style={{ flexShrink: 0 }} />} label="เหตุล้มวันนี้" value={today} sub={`active อยู่ ${actives.length} เหตุ`} grad="linear-gradient(149deg, #E8432A 0%, #D0381A 100%)" shadow="0 4px 14px rgba(232,67,42,0.3)" delay={240} />
        <KpiCard index={4} icon={<IconCalendar size={20} style={{ flexShrink: 0 }} />} label="เหตุล้มเดือนนี้" value={month} trend="↓ -2.4%" sub="กรกฎาคม 2569" grad="linear-gradient(149deg, #E8802A 0%, #D06A1A 100%)" shadow="0 4px 14px rgba(232,128,42,0.3)" delay={320} />
      </div>

      {/* แผนที่ + attention list */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: 16, alignItems: 'stretch' }}>
        <div className="anim-slide-up delay-2" style={{ ...card, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <SectionTitle
            icon={<IconMap2 size={15} style={{ flexShrink: 0 }} />} title="แผนที่หมู่บ้าน" sub="สีหมุดตามสถานะ · คลิกหมุดเพื่อเปิดหมู่บ้าน"
            right={
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {Object.entries(SV_STATUS_META).map(([k, m]) => (
                  <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, color: GRAY, fontFamily: font }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: m.color }} />{m.label}
                  </span>
                ))}
              </div>
            }
          />
          <SVMap points={mapPoints} center={[100.9, 15.2]} zoom={5.0} height={330} radius={18} />
        </div>

        <div className="anim-slide-up delay-3" style={{ ...card, display: 'flex', flexDirection: 'column' }}>
          <SectionTitle icon={<IconClipboardList size={15} style={{ flexShrink: 0 }} />} title="ต้องตามงาน" sub={`${attention.length} รายการ`} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto', maxHeight: 330, paddingRight: 2 }}>
            {attention.map((it, i) => (
              <div
                key={i} className="hover-card"
                onClick={() => it.houseId ? onDrillHouse(it.villageId, it.houseId) : onDrillVillage(it.villageId)}
                style={{
                  display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer',
                  background: it.severity === 'warn' ? 'rgba(232,128,42,0.07)' : 'rgba(102,88,225,0.06)',
                  border: `1px solid ${it.severity === 'warn' ? 'rgba(232,128,42,0.2)' : 'rgba(102,88,225,0.15)'}`,
                  borderRadius: 14, padding: '10px 12px',
                }}
              >
                <span style={{ fontSize: 15, marginTop: 1 }}>
                  {(() => { const AttIcon = ATTENTION_ICONS[it.kind] || IconClipboardList; return <AttIcon size={15} style={{ flexShrink: 0 }} />; })()}
                </span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: BLACK, fontFamily: font, lineHeight: 1.45 }}>{it.title}</div>
                  <div style={{ fontSize: 10.5, color: GRAY, fontFamily: font, marginTop: 2 }}>{it.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* เหตุการณ์ล่าสุด */}
      <div className="anim-slide-up delay-4" style={{ ...card }}>
        <SectionTitle
          icon={<IconHistory size={15} style={{ flexShrink: 0 }} />} title="เหตุการณ์ล่าสุด" sub="10 รายการล่าสุดจากทุกหมู่บ้าน"
          right={<button className="hover-btn" style={{ ...btnGhost, padding: '6px 14px', fontSize: 12 }} onClick={() => onGoSection('sv-alerts')}>ดูทั้งหมด →</button>}
        />
        <div style={{ overflowX: 'auto' }}>
          <div style={{ minWidth: 760 }}>
            {recent.map((a) => {
              const h = getHouse(a.houseId);
              const stMeta = ALERT_STATUS_META[a.status];
              return (
                <div key={a.id} className="hover-row" onClick={() => onDrillHouse(a.villageId, a.houseId)} style={{
                  display: 'grid', gridTemplateColumns: '110px 1.4fr 1.2fr 120px 130px', gap: 12, alignItems: 'center',
                  padding: '12px 14px', borderTop: '1px solid rgba(0,0,0,0.04)', borderRadius: 14, cursor: 'pointer',
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
                  <Pill color={stMeta.color} bg={stMeta.bg}>{a.status}</Pill>
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
  );
}
