/* ═══ Smart Village — ภาพรวม (Central Overview) — spec 5.1 ═══
   Layout จอมอนิเตอร์: แผนที่เป็น dominant เต็มพื้นที่ · element อื่นลอย + compact
   คงข้อมูลเดิม (KPI, หมู่บ้าน, attention, เหตุการณ์ล่าสุด) */
import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import CountUp from '../../components/CountUp';
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

/* ── Outcome status card + donut — reuse จาก OutcomeDonutCard หน้ารายงานเยี่ยมบ้าน ── */
function SvOutcomeCard({ d, idx, hoverIdx, setHoverIdx, total, onClick }) {
  const isActive = hoverIdx === idx;
  const pct = Math.round((d.count / total) * 100);
  return (
    <div
      onMouseEnter={() => setHoverIdx(idx)} onMouseLeave={() => setHoverIdx(null)} onClick={onClick}
      style={{
        width: 128, position: 'relative', overflow: 'hidden',
        background: `linear-gradient(145deg, ${d.bg}, rgba(255,255,255,0.95))`,
        border: `1.5px solid ${isActive ? d.color : d.borderC}`,
        borderRadius: 18, padding: '12px 14px',
        boxShadow: isActive ? `0 10px 30px ${d.color}30` : '0 2px 10px rgba(0,0,0,0.04)',
        transform: isActive ? 'scale(1.06) translateY(-2px)' : 'scale(1) translateY(0)',
        transition: 'all 0.3s cubic-bezier(.22,1,.36,1)', cursor: 'pointer',
      }}
    >
      <div style={{ position: 'absolute', top: -15, right: -15, width: 50, height: 50, borderRadius: '50%', background: `${d.color}12`, transition: 'transform 0.3s ease', transform: isActive ? 'scale(1.8)' : 'scale(1)' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, position: 'relative' }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, flexShrink: 0, boxShadow: isActive ? `0 0 8px ${d.color}80` : 'none', transition: 'box-shadow 0.3s ease' }} />
        <span style={{ fontSize: 11.5, fontWeight: 600, color: BLACK, fontFamily: font, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.name}</span>
        <div style={{ marginLeft: 'auto', background: isActive ? d.color : 'rgba(255,255,255,0.7)', borderRadius: 99, padding: '2px 8px', transition: 'background 0.3s ease' }}>
          <span style={{ fontSize: 10, fontWeight: 700, fontFamily: font, color: isActive ? 'white' : d.dark, transition: 'color 0.3s ease' }}>{pct}%</span>
        </div>
      </div>
      <CountUp end={d.count} style={{ fontSize: 28, fontWeight: 700, color: d.dark, fontFamily: font, lineHeight: 1, position: 'relative', display: 'block' }} />
      <div style={{ marginTop: 9, height: 4, borderRadius: 100, overflow: 'hidden', background: `${d.color}15`, position: 'relative' }}>
        <div style={{ height: '100%', borderRadius: 100, background: `linear-gradient(90deg, ${d.light}, ${d.color})`, width: isActive ? `${pct}%` : `${pct * 0.7}%`, transition: 'width 0.5s cubic-bezier(.22,1,.36,1)' }} />
      </div>
    </div>
  );
}

function SvOutcomeDonut({ data, onGoSection }) {
  const [hoverIdx, setHoverIdx] = useState(null);
  const total = data.reduce((a, d) => a + d.count, 0);
  const active = hoverIdx !== null ? data[hoverIdx] : null;
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      {/* legend */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 6, flexWrap: 'wrap' }}>
        {data.map((d, i) => (
          <div key={i} onMouseEnter={() => setHoverIdx(i)} onMouseLeave={() => setHoverIdx(null)} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', opacity: hoverIdx === null || hoverIdx === i ? 1 : 0.4, transition: 'opacity 0.2s ease' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color }} />
            <span style={{ fontSize: 12, color: GRAY, fontFamily: font }}>{d.name} {Math.round(d.count / (total || 1) * 100)}%</span>
          </div>
        ))}
      </div>
      {/* donut + cards */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap', justifyContent: 'center' }}>
          {data[0] && <SvOutcomeCard d={data[0]} idx={0} hoverIdx={hoverIdx} setHoverIdx={setHoverIdx} total={total} onClick={() => onGoSection('sv-alerts')} />}
          <div style={{ position: 'relative', width: 180, height: 180, flexShrink: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data} dataKey="count" cx="50%" cy="50%"
                  innerRadius="58%" outerRadius="88%" paddingAngle={5} cornerRadius={6}
                  strokeWidth={0} startAngle={90} endAngle={-270}
                  onMouseEnter={(_, i) => setHoverIdx(i)} onMouseLeave={() => setHoverIdx(null)}
                  animationDuration={1000} animationBegin={200}
                >
                  {data.map((d, i) => (
                    <Cell key={i} fill={d.color} opacity={hoverIdx === null || hoverIdx === i ? 1 : 0.25}
                      style={{ filter: hoverIdx === i ? `drop-shadow(0 0 12px ${d.color}90)` : 'none', transition: 'all 0.3s ease' }} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
              <CountUp end={active ? active.count : total} duration={800} style={{ fontSize: 38, fontWeight: 700, fontFamily: font, lineHeight: 1, color: active ? active.dark : BLACK, transition: 'color 0.3s ease' }} />
              <span style={{ fontSize: 11, fontWeight: 500, fontFamily: font, marginTop: 6, color: active ? active.color : GRAY, transition: 'color 0.3s ease' }}>{active ? active.name : 'ทั้งหมด'}</span>
            </div>
          </div>
          {data.length > 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {data.slice(1).map((d, idx) => (
                <SvOutcomeCard key={idx + 1} d={d} idx={idx + 1} hoverIdx={hoverIdx} setHoverIdx={setHoverIdx} total={total} onClick={() => onGoSection('sv-alerts')} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* Stat card — anatomy เดียวกับ StatCard หน้ารายงานเยี่ยมบ้าน */
function StatCard({ icon, label, value, unit, growth, bg }) {
  const numeric = typeof value === 'number';
  return (
    <div className="hover-stat anim-slide-up" style={{
      background: bg, border: '1px solid rgba(255,255,255,0.7)',
      borderRadius: 24, padding: 16, color: 'white', fontFamily: font,
      position: 'relative', overflow: 'hidden', height: 130,
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      boxShadow: '0 4px 4px rgba(0,0,0,0.1)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', height: 40 }}>
        <div style={{ width: 40, height: 40, borderRadius: 14, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
        {growth && (
          <div style={{ background: 'rgba(255,255,255,0.18)', borderRadius: 999, padding: '4px 10px', display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>{growth}</span>
          </div>
        )}
      </div>
      <span style={{ fontSize: 11, fontWeight: 500, color: 'white', letterSpacing: 0.22 }}>{label}</span>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
        {numeric
          ? <CountUp end={value} style={{ fontSize: 26, fontWeight: 700, lineHeight: '26px' }} />
          : <span style={{ fontSize: 26, fontWeight: 700, lineHeight: '26px' }}>{value}</span>}
        {unit && <span style={{ fontSize: 12, lineHeight: '12px' }}>{unit}</span>}
      </div>
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
  /* breakdown ต้องตามงานตามชนิด — สำหรับ pie */
  const ATT_META = {
    offline: { label: 'อุปกรณ์ offline', color: ORANGE },
    nocontact: { label: 'ไม่มีผู้ติดต่อ', color: RED },
    noguard: { label: 'ไม่มีบัญชี รปภ.', color: PURPLE },
    nofamily: { label: 'ยังไม่เชื่อม Family', color: '#0088FF' },
  };
  const attBreakdown = Object.keys(ATT_META)
    .map(k => ({ k, ...ATT_META[k], count: attention.filter(a => a.kind === k).length }))
    .filter(x => x.count > 0);
  const attTotal = attention.length || 1;
  const totalDevices = SV_DEVICES.length;
  const online = SV_DEVICES.filter(d => d.online).length;
  const installedHouses = SV_HOUSES.filter(h => SV_DEVICES.some(d => d.houseId === h.id)).length;
  const today = SV_ALERTS.filter(a => a.date === 'วันนี้').length;
  const month = SV_ALERTS.filter(a => a.date === 'วันนี้' || a.date.includes('ก.ค.')).length;
  /* ประวัติ = เหตุที่ปิดแล้ว (เหตุ active อยู่ใน panel ขวาแล้ว — ไม่ซ้ำ) */
  const closedAll = SV_ALERTS.filter(a => a.status === 'ปิดแล้ว');
  const recent = closedAll.slice(0, 8);
  /* breakdown ผลการปิดเหตุ — สำหรับ visualize */
  const outcomeBreakdown = Object.keys(ALERT_RESULT_META)
    .map(k => ({ k, color: ALERT_RESULT_META[k].color, count: closedAll.filter(a => a.result === k).length }))
    .filter(x => x.count > 0);
  const closedTotal = closedAll.length || 1;
  /* ตารางผลการปิดเหตุ แยกหมู่บ้าน (แบบ FeatureTable "แยก รพ." หน้า Dashboard) */
  const OUTCOME_COLS = [
    { key: 'ช่วยเหลือแล้ว', label: 'ช่วยเหลือ', color: '#34C759' },
    { key: 'แจ้งเตือนผิดพลาด', label: 'ผิดพลาด', color: '#E8802A' },
    { key: 'เหตุทดสอบ', label: 'ทดสอบ', color: '#1398D8' },
  ];
  const closedByVillage = SV_VILLAGES.map(v => {
    const cs = closedAll.filter(a => a.villageId === v.id);
    return { id: v.id, name: v.name, vals: OUTCOME_COLS.map(c => cs.filter(a => a.result === c.key).length), total: cs.length };
  }).filter(r => r.total > 0);

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
          thai="ภาพรวม" image={imgHero3d} section="sv-overview" onGoSection={onGoSection}
          topRight={<LivePill />}
        />
      </div>

      {/* Stat cards — anatomy เดียวกับหน้ารายงานเยี่ยมบ้าน */}
      <div className="anim-slide-up delay-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
        <StatCard icon={<IconBuildingCommunity size={20} color="white" style={{ flexShrink: 0 }} />} label="หมู่บ้านทั้งหมด" value={SV_VILLAGES.length} unit="หมู่บ้าน" growth="↑ +1" bg="linear-gradient(149deg, #8B5CF6 0%, #7C3AED 100%)" />
        <StatCard icon={<IconHome size={20} color="white" style={{ flexShrink: 0 }} />} label="บ้านที่ติดตั้งแล้ว" value={installedHouses} unit="หลัง" growth="↑ +6.3%" bg="linear-gradient(183deg, #26C1A2 6%, #0D7C66 112%)" />
        <StatCard icon={<IconAntennaBars5 size={20} color="white" style={{ flexShrink: 0 }} />} label="อุปกรณ์ online" value={`${online}/${totalDevices}`} growth="↑ +8.5%" bg="linear-gradient(149deg, #3B82F6 0%, #1D4ED8 100%)" />
        <StatCard icon={<IconAlertTriangleFilled size={20} color="white" style={{ flexShrink: 0 }} />} label="เหตุล้มวันนี้" value={today} unit="เหตุ" bg="linear-gradient(180deg, #FF383C 0%, #992224 100%)" />
        <StatCard icon={<IconCalendar size={20} color="white" style={{ flexShrink: 0 }} />} label="เหตุล้มเดือนนี้" value={month} unit="เหตุ" growth="↓ -2.4%" bg="linear-gradient(149deg, #E8802A 0%, #D06A1A 100%)" />
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
                <div key={a.id} className="hover-card" onClick={() => onDrillHouse(a.villageId, a.houseId)} style={{
                  cursor: 'pointer', flexShrink: 0, background: 'white', borderRadius: 12, padding: '11px 13px',
                  border: '1px solid rgba(13,10,44,0.09)',
                  boxShadow: '0 1px 2px rgba(13,10,44,0.05)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: accent, flexShrink: 0 }} />
                    <span style={{ fontSize: 11, fontWeight: 600, color: accent, fontFamily: font }}>{isNew ? 'ยังไม่รับทราบ' : 'รับทราบแล้ว'}</span>
                    <ElapsedSince minAgo={a.minAgo} style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 600, color: GRAY2 }} />
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: BLACK, fontFamily: font, marginTop: 4 }}>บ้าน {house.no}{house.nickname ? ` · ${house.nickname}` : ''}</div>
                  <div style={{ fontSize: 11, color: GRAY, fontFamily: font, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {village.name} · {device.attach.kind === 'person' ? `ติดตัว ${device.attach.residentName}` : a.location} · {a.time} น.
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

      </div>

      {/* ── ใต้แผนที่: รายละเอียด — ต้องตามงาน + เหตุการณ์ล่าสุด ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 14 }}>
        {/* ต้องตามงาน */}
        <div className="anim-slide-up delay-3" style={{ ...card, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Hero banner — pattern เดียวกับหัว "ประวัติการเยี่ยมบ้าน" (PatientProfile) */}
          <div style={{
            background: 'linear-gradient(175deg, #E8802A 0%, #D06A1A 100%)',
            borderRadius: 16, padding: 16, position: 'relative', overflow: 'hidden',
            backdropFilter: 'blur(10px)', boxShadow: '0 4px 4px rgba(0,0,0,0.1)',
            display: 'flex', gap: 16, alignItems: 'center',
          }}>
            <img src={imgHero3d} alt="" style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', width: 84, height: 84, objectFit: 'cover', pointerEvents: 'none' }} />
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 96 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'white', fontFamily: font }}>ต้องตามงาน</div>
                <div style={{ fontSize: 12, color: 'white', fontFamily: font, marginTop: 4 }}>งานค้างที่ต้องติดตามจากทุกหมู่บ้าน</div>
              </div>
              <div style={{
                backdropFilter: 'blur(2px)', background: 'rgba(255,255,255,0.8)',
                border: '1px solid white', borderRadius: 100, padding: '4px 16px',
                height: 36, display: 'flex', alignItems: 'center',
                fontSize: 12, fontWeight: 600, fontFamily: font, color: BLACK,
              }}>{attention.length} รายการ</div>
            </div>
          </div>
          {attention.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: 12, color: GRAY2, fontFamily: font }}>ไม่มีรายการค้าง</div>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 18, alignItems: 'center', flex: 1, minHeight: 0 }}>
              <div style={{ width: 150, height: 150, flexShrink: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={attBreakdown} dataKey="count" cx="50%" cy="50%" outerRadius={72} startAngle={90} endAngle={-270} strokeWidth={0} animationDuration={800}>
                      {attBreakdown.map(b => <Cell key={b.k} fill={b.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {attBreakdown.map(b => (
                  <div key={b.k} className="hover-btn" onClick={() => onGoSection('sv-alerts')} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                    <span style={{ width: 9, height: 9, borderRadius: '50%', background: b.color, flexShrink: 0 }} />
                    <span style={{ flex: 1, minWidth: 0, fontSize: 13, color: BLACK, fontFamily: font, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.label}</span>
                    <span className="num" style={{ fontSize: 13, fontWeight: 700, color: GRAY, flexShrink: 0 }}>{b.count} <span style={{ color: GRAY2, fontWeight: 500 }}>({Math.round(b.count / attTotal * 100)}%)</span></span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ประวัติเหตุที่ปิดแล้ว — ตารางผลการปิดเหตุ แยกหมู่บ้าน (แบบ FeatureTable) */}
        <div className="anim-slide-up delay-4" style={{ ...card, display: 'flex', flexDirection: 'column' }}>
          <SectionTitle
            icon={<IconHistory size={15} style={{ flexShrink: 0 }} />} title="สถิติเหตุที่ปิดแล้ว แยกหมู่บ้าน" sub={`${closedAll.length} เหตุทั้งหมด`}
            right={<button className="hover-btn" style={{ ...btnGhost, padding: '6px 14px', fontSize: 12 }} onClick={() => onGoSection('sv-alerts')}>ดูทั้งหมด →</button>}
          />
          <div style={{ overflowX: 'auto' }}>
            <div style={{ minWidth: 420, background: 'white', border: '1px solid rgba(0,0,0,0.05)', borderRadius: 14, overflow: 'hidden' }}>
              {/* header */}
              <div style={{ display: 'grid', gridTemplateColumns: `1.6fr repeat(${OUTCOME_COLS.length}, 1fr) 0.8fr`, gap: 10, padding: 16, background: 'rgba(139,92,246,0.1)', fontWeight: 700, fontSize: 12, color: BLACK, fontFamily: font }}>
                <span>หมู่บ้าน</span>
                {OUTCOME_COLS.map(c => <span key={c.key} style={{ textAlign: 'center' }}>{c.label}</span>)}
                <span style={{ textAlign: 'center' }}>รวม</span>
              </div>
              {/* rows */}
              {closedByVillage.map(r => {
                const maxVal = Math.max(...r.vals);
                return (
                  <div key={r.id} className="hover-row" onClick={() => onDrillVillage(r.id)} style={{ display: 'grid', gridTemplateColumns: `1.6fr repeat(${OUTCOME_COLS.length}, 1fr) 0.8fr`, gap: 10, padding: 16, fontSize: 12, fontFamily: font, color: BLACK, cursor: 'pointer', borderTop: '1px solid rgba(0,0,0,0.04)' }}>
                    <span style={{ fontWeight: 500, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.name}</span>
                    {r.vals.map((v, j) => {
                      const c = OUTCOME_COLS[j];
                      const hi = v > 0 && v === maxVal;
                      return (
                        <span key={j} style={{ textAlign: 'center' }}>
                          <span className="num" style={{ display: 'inline-block', padding: '2px 9px', borderRadius: 8, background: hi ? `${c.color}18` : 'transparent', color: hi ? c.color : (v ? BLACK : GRAY2), fontWeight: hi ? 700 : 500 }}>{v}</span>
                        </span>
                      );
                    })}
                    <span className="num" style={{ textAlign: 'center', fontWeight: 700 }}>{r.total}</span>
                  </div>
                );
              })}
              {/* legend สี */}
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', padding: '10px 14px', borderTop: '1px solid rgba(0,0,0,0.04)' }}>
                {OUTCOME_COLS.map(c => (
                  <span key={c.key} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, color: GRAY, fontFamily: font }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: c.color }} />{c.key}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
