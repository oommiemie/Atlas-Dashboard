/* ═══ Smart Village — ภาพรวม (Central Overview) — spec 5.1 ═══ */
import CountUp from '../../components/CountUp';
import {
  SV_VILLAGES, SV_HOUSES, SV_DEVICES, SV_ALERTS,
  activeAlerts, getHouse, getVillage, getDevice, buildAttention,
  villageStatus, villageStats, SV_STATUS_META, ALERT_STATUS_META, ALERT_RESULT_META,
} from '../../data/smartVillage';
import {
  font, BLACK, GRAY, GRAY2, RED, GREEN, ORANGE, PURPLE,
  card, btnPrimary, btnGhost, PageHead, SectionTitle, Pill, LivePill, SVMap, ElapsedSince, EmptyState,
} from './shared';

/* ── แถบเหตุ active — เด่นสุดของหน้า ── */
function ActiveAlertBar({ alert, onOpenHouse, onOpenGuard }) {
  const house = getHouse(alert.houseId);
  const village = getVillage(alert.villageId);
  const device = getDevice(alert.deviceId);
  const isNew = alert.status === 'ใหม่';
  return (
    <div style={{
      borderRadius: 24, padding: '18px 22px', color: 'white', position: 'relative', overflow: 'hidden',
      background: isNew
        ? 'linear-gradient(120deg, #E0262B 0%, #FF5A3C 60%, #FF7A45 100%)'
        : 'linear-gradient(120deg, #C96A12 0%, #E8802A 70%, #F2A254 100%)',
      animation: isNew ? 'svSirenGlow 1.6s ease-in-out infinite' : 'none',
      boxShadow: '0 8px 32px rgba(255,56,60,0.3)',
    }}>
      <div style={{ position: 'absolute', top: -50, right: -30, width: 190, height: 190, borderRadius: '50%', background: 'rgba(255,255,255,0.12)' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, position: 'relative', flexWrap: 'wrap' }}>
        <div style={{
          width: 52, height: 52, borderRadius: 18, background: 'rgba(255,255,255,0.2)', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26,
          animation: isNew ? 'svShake 0.9s ease-in-out infinite' : 'none',
        }}>🚨</div>
        <div style={{ flex: 1, minWidth: 260 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 16.5, fontWeight: 700, fontFamily: font }}>
              {alert.detectType} — บ้าน {house.no}{house.nickname ? ` (${house.nickname})` : ''}
            </span>
            <Pill color="white" bg="rgba(255,255,255,0.22)" dot={false} style={{ fontSize: 10.5 }}>
              {isNew ? '⚠ ยังไม่มีผู้รับทราบ' : `✓ ${alert.ackBy} รับทราบ ${alert.ackAt}`}
            </Pill>
          </div>
          <div style={{ fontSize: 12.5, fontFamily: font, opacity: 0.92, marginTop: 5 }}>
            {village.name} · {device.attach.kind === 'person' ? `อุปกรณ์ติดตัว — ${device.attach.residentName}` : `ตำแหน่ง${alert.location}`} · เกิดเหตุ {alert.time} น. · <ElapsedSince minAgo={alert.minAgo} style={{ fontWeight: 700 }} />
            {alert.recovered && <span style={{ marginLeft: 8, opacity: 0.95 }}>· 📡 เครื่องรายงานว่ากลับสู่ปกติแล้ว (เหตุยังไม่ปิดจนกว่าคนจะกดปิด)</span>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <button className="hover-btn" onClick={onOpenGuard} style={{ ...btnGhost, background: 'rgba(255,255,255,0.18)', color: 'white', border: '1px solid rgba(255,255,255,0.4)' }}>
            จอ รปภ.
          </button>
          <button className="hover-btn" onClick={onOpenHouse} style={{ ...btnGhost, background: 'white', color: isNew ? '#E0262B' : '#C96A12', border: 'none', fontWeight: 700 }}>
            ดูรายละเอียด →
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── การ์ด KPI ── */
function KpiCard({ icon, label, value, sub, grad, delay = 0, subColor }) {
  return (
    <div className="hover-stat" style={{
      borderRadius: 24, padding: '18px 20px', color: 'white', position: 'relative', overflow: 'hidden',
      background: grad, boxShadow: '0 6px 18px rgba(30,27,57,0.18)', minWidth: 0,
    }}>
      <div style={{ position: 'absolute', top: -34, right: -20, width: 110, height: 110, borderRadius: '50%', background: 'rgba(255,255,255,0.14)' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, position: 'relative' }}>
        <span style={{ fontSize: 16 }}>{icon}</span>
        <span style={{ fontSize: 12, fontWeight: 500, fontFamily: font, opacity: 0.92 }}>{label}</span>
      </div>
      <div style={{ fontSize: 32, fontWeight: 800, fontFamily: font, marginTop: 8, position: 'relative', letterSpacing: -1 }}>
        <CountUp end={value} delay={delay} />
      </div>
      {sub && <div style={{ fontSize: 11, fontFamily: font, opacity: 0.92, marginTop: 3, position: 'relative', color: subColor }}>{sub}</div>}
    </div>
  );
}

export default function Overview({ onDrillHouse, onDrillVillage, onGoSection, onOpenGuard }) {
  /* Empty state ระดับหน้า — ยังไม่มีหมู่บ้านเลย → CTA เพิ่มหมู่บ้านแรก (spec 5.1) */
  if (SV_VILLAGES.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="anim-slide-up">
          <PageHead
            title="Smart Village — ภาพรวม"
            sub="ระบบเฝ้าระวังและแจ้งเหตุประจำหมู่บ้าน · สุขภาพทั้งระบบในหน้าเดียว"
            right={<LivePill />}
          />
        </div>
        <div className="anim-slide-up delay-1">
          <EmptyState
            icon="🏘️"
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
          title="Smart Village — ภาพรวม"
          sub="ระบบเฝ้าระวังและแจ้งเหตุประจำหมู่บ้าน · สุขภาพทั้งระบบในหน้าเดียว"
          right={<>
            <LivePill />
            <button className="hover-btn" style={btnGhost} onClick={onOpenGuard}>🖥️ จอ รปภ. (ตัวอย่าง)</button>
            <button className="hover-btn" style={btnPrimary} onClick={() => onGoSection('sv-devices', { addDevice: true })}>+ เพิ่มอุปกรณ์</button>
          </>}
        />
      </div>

      {/* แถบเหตุ active */}
      {actives.length > 0 && (
        <div className="anim-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {actives.map(a => (
            <ActiveAlertBar key={a.id} alert={a} onOpenHouse={() => onDrillHouse(a.villageId, a.houseId)} onOpenGuard={onOpenGuard} />
          ))}
        </div>
      )}

      {/* KPI */}
      <div className="anim-slide-up delay-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12 }}>
        <KpiCard icon="🏘️" label="หมู่บ้านทั้งหมด" value={SV_VILLAGES.length} sub={`ใช้งาน ${SV_VILLAGES.filter(v => v.status === 'ใช้งาน').length} · ระงับ ${SV_VILLAGES.filter(v => v.status === 'ระงับ').length}`} grad="linear-gradient(135deg, #4438AD, #6658E1)" />
        <KpiCard icon="🏠" label="บ้านที่ติดตั้งแล้ว" value={installedHouses} sub={`จากทะเบียนบ้าน ${SV_HOUSES.length} หลัง`} grad="linear-gradient(135deg, #6658E1, #8B5CF6)" delay={80} />
        <KpiCard icon="📡" label="อุปกรณ์ทั้งหมด" value={totalDevices} sub={`● online ${online} · ○ offline ${totalDevices - online}`} grad="linear-gradient(135deg, #1398D8, #4FC3F7)" delay={160} />
        <KpiCard icon="🚨" label="เหตุล้มวันนี้" value={today} sub={`active อยู่ ${actives.length} เหตุ`} grad="linear-gradient(135deg, #E0262B, #FF7A45)" delay={240} />
        <KpiCard icon="🗓️" label="เหตุล้มเดือนนี้" value={month} sub="กรกฎาคม 2569" grad="linear-gradient(135deg, #E8802A, #F2C94C)" delay={320} />
      </div>

      {/* แผนที่ + attention list */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: 16, alignItems: 'stretch' }}>
        <div className="anim-slide-up delay-2" style={{ ...card, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <SectionTitle
            icon="🗺️" title="แผนที่หมู่บ้าน" sub="สีหมุดตามสถานะ · คลิกหมุดเพื่อเปิดหมู่บ้าน"
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
          <SectionTitle icon="📋" title="ต้องตามงาน" sub={`${attention.length} รายการ`} />
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
                <span style={{ fontSize: 15, marginTop: 1 }}>{it.icon}</span>
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
          icon="🕘" title="เหตุการณ์ล่าสุด" sub="10 รายการล่าสุดจากทุกหมู่บ้าน"
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
