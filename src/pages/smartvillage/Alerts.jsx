/* ═══ Smart Village — เหตุการณ์ทั้งหมด (Alert Cases) ═══ */
import { useState } from 'react';
import CountUp from '../../components/CountUp';
import {
  IconAlertTriangleFilled, IconRun, IconCircleCheckFilled, IconConfetti, IconRadar2, IconCheck, IconAlertTriangle,
} from '@tabler/icons-react';
import {
  SV_ALERTS, SV_VILLAGES, getVillage, getHouse, ALERT_STATUS_META, ALERT_RESULT_META,
} from '../../data/smartVillage';
import {
  font, BLACK, GRAY, GRAY2, GREEN, RED, ORANGE, BLUE,
  card, PageHead, Pill, SearchBox, THead, TRow, LivePill, ElapsedSince, EmptyState, FilterSelect,
} from './shared';

const STATUS_TABS = ['ทั้งหมด', 'ใหม่', 'รับทราบแล้ว', 'ปิดแล้ว'];

export default function Alerts({ onDrillHouse, onGoSection }) {
  const [q, setQ] = useState('');
  const [tab, setTab] = useState('ทั้งหมด');
  const [villageFilter, setVillageFilter] = useState('ทั้งหมด');

  const counts = {
    'ใหม่': SV_ALERTS.filter(a => a.status === 'ใหม่').length,
    'รับทราบแล้ว': SV_ALERTS.filter(a => a.status === 'รับทราบแล้ว').length,
    'ปิดแล้ว': SV_ALERTS.filter(a => a.status === 'ปิดแล้ว').length,
  };

  const rows = SV_ALERTS.filter(a => {
    const h = getHouse(a.houseId);
    return (tab === 'ทั้งหมด' || a.status === tab)
      && (villageFilter === 'ทั้งหมด' || a.villageId === villageFilter)
      && (a.no + h.no + (h.nickname || '')).toLowerCase().includes(q.toLowerCase());
  });

  const COLS = '120px 110px 1.3fr 1fr 130px 1.4fr';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="anim-slide-up">
        <PageHead thai="เหตุการณ์" right={<LivePill />} section="sv-alerts" onGoSection={onGoSection} />
      </div>

      {/* สรุปสถานะ — anatomy เดียวกับ StatCards หน้า Dashboard */}
      <div className="anim-slide-up delay-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {[
          ['ใหม่ (ยังไม่มีผู้รับทราบ)', counts['ใหม่'], 'linear-gradient(149deg, #E8432A 0%, #D0381A 100%)', '0 4px 14px rgba(232,67,42,0.3)', <IconAlertTriangleFilled size={20} style={{ flexShrink: 0 }} />],
          ['รับทราบแล้ว (กำลังช่วยเหลือ)', counts['รับทราบแล้ว'], 'linear-gradient(149deg, #E8802A 0%, #D06A1A 100%)', '0 4px 14px rgba(232,128,42,0.3)', <IconRun size={20} style={{ flexShrink: 0 }} />],
          ['ปิดแล้ว (30 วัน)', counts['ปิดแล้ว'], 'linear-gradient(149deg, #8B5CF6 0%, #7C3AED 100%)', '0 4px 14px rgba(139,92,246,0.3)', <IconCircleCheckFilled size={20} style={{ flexShrink: 0 }} />],
        ].map(([l, v, g, sh, ic], i) => (
          <div key={l} className="hover-stat" style={{
            background: g, borderRadius: 24, padding: 16, color: 'white',
            overflow: 'hidden', position: 'relative', boxShadow: sh,
            display: 'flex', flexDirection: 'column', gap: 8,
            animation: `cardPop 0.5s cubic-bezier(.22,1,.36,1) ${i * 80}ms both`,
          }}>
            <div style={{ width: 40, height: 40, borderRadius: 14, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{ic}</div>
            <span style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.6)', fontFamily: font, letterSpacing: 0.22 }}>{l}</span>
            <CountUp end={v} style={{ fontSize: 26, fontWeight: 700, color: 'white', fontFamily: font, lineHeight: '26px' }} />
          </div>
        ))}
      </div>

      <div className="anim-slide-up delay-2" style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <SearchBox value={q} onChange={setQ} placeholder="ค้นหาเลขเคส / บ้าน…" width={230} />
        <FilterSelect value={villageFilter} onChange={setVillageFilter} options={[{ value: 'ทั้งหมด', label: 'ทุกหมู่บ้าน' }, ...SV_VILLAGES.map(v => ({ value: v.id, label: v.name }))]} />
        <div className="seg">
          {STATUS_TABS.map(s => (
            <button key={s} className={`seg-btn${tab === s ? ' active' : ''}`} onClick={() => setTab(s)}>
              {s}{s !== 'ทั้งหมด' ? ` (${counts[s]})` : ''}
            </button>
          ))}
        </div>
      </div>

      <div className="anim-slide-up delay-3" style={{ ...card, padding: 0, overflow: 'hidden' }}>
        {rows.length === 0 ? <div style={{ padding: 8 }}><EmptyState icon={<IconConfetti size={26} style={{ flexShrink: 0 }} />} title="ไม่มีเหตุการณ์ตามเงื่อนไข" sub="ลองปรับ filter" /></div> : (
          <div style={{ overflowX: 'auto' }}>
            <div style={{ minWidth: 960 }}>
              <THead cols={COLS} labels={['เลขเคส', 'เวลา', 'บ้าน · หมู่บ้าน', 'เหตุ', 'สถานะ', 'การจัดการ / ผล']} />
              {rows.map(a => {
                const h = getHouse(a.houseId);
                const active = a.status !== 'ปิดแล้ว';
                return (
                  <TRow key={a.id} cols={COLS} onClick={() => onDrillHouse(a.villageId, a.houseId)} style={active ? { background: 'rgba(255,56,60,0.04)' } : undefined}>
                    <div className="num" style={{ fontSize: 11.5, fontWeight: 600, color: active ? RED : BLACK }}>{a.no}</div>
                    <div>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: BLACK, fontFamily: font }}>{a.time} น.</div>
                      <div style={{ fontSize: 10.5, color: GRAY2, fontFamily: font }}>{a.date}</div>
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: BLACK, fontFamily: font }}>บ้าน {h.no}{h.nickname ? ` · ${h.nickname}` : ''}</div>
                      <div style={{ fontSize: 10.5, color: GRAY2, fontFamily: font }}>{getVillage(a.villageId).name}</div>
                    </div>
                    <div style={{ fontSize: 11.5 }}>
                      {a.detectType} · {a.location}
                      {a.recovered && <div style={{ fontSize: 10, color: BLUE, fontFamily: font }}><IconRadar2 size={12} style={{ verticalAlign: '-2px' }} /> เครื่องรายงานกลับสู่ปกติ</div>}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'flex-start' }}>
                      <Pill color={ALERT_STATUS_META[a.status].color} bg={ALERT_STATUS_META[a.status].bg}>{a.status}</Pill>
                      {a.status === 'ใหม่' && <span style={{ fontSize: 10, color: RED, fontWeight: 700, fontFamily: font }}><ElapsedSince minAgo={a.minAgo} /></span>}
                    </div>
                    <div style={{ fontSize: 11, lineHeight: 1.55 }}>
                      {a.ackBy && <div><IconCheck size={12} style={{ verticalAlign: '-2px' }} /> {a.ackBy} · {a.ackAt} น.</div>}
                      {a.result && <div style={{ marginTop: 2 }}><Pill color={ALERT_RESULT_META[a.result].color} bg={ALERT_RESULT_META[a.result].bg} dot={false}>{a.result}</Pill></div>}
                      {a.status === 'ใหม่' && <span style={{ color: RED, fontWeight: 700 }}><IconAlertTriangle size={12} style={{ verticalAlign: '-2px' }} /> ยังไม่มีผู้รับทราบ</span>}
                    </div>
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
