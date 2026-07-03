/* ═══ Smart Village — เหตุการณ์ทั้งหมด (Alert Cases) ═══ */
import { useState } from 'react';
import CountUp from '../../components/CountUp';
import {
  SV_ALERTS, SV_VILLAGES, getVillage, getHouse, ALERT_STATUS_META, ALERT_RESULT_META,
} from '../../data/smartVillage';
import {
  font, BLACK, GRAY, GRAY2, GREEN, RED, ORANGE, BLUE,
  card, PageHead, Pill, SearchBox, THead, TRow, LivePill, ElapsedSince, EmptyState,
} from './shared';

const STATUS_TABS = ['ทั้งหมด', 'ใหม่', 'รับทราบแล้ว', 'ปิดแล้ว'];

export default function Alerts({ onDrillHouse }) {
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
        <PageHead title="เหตุการณ์" sub="Alert Case ทุกหมู่บ้าน · วงจร: ใหม่ → รับทราบแล้ว → ปิดแล้ว (พร้อมผล)" right={<LivePill />} />
      </div>

      {/* สรุปสถานะ */}
      <div className="anim-slide-up delay-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {[
          ['ใหม่ (ยังไม่มีผู้รับทราบ)', counts['ใหม่'], 'linear-gradient(135deg,#E0262B,#FF7A45)', '🚨'],
          ['รับทราบแล้ว (กำลังช่วยเหลือ)', counts['รับทราบแล้ว'], 'linear-gradient(135deg,#C96A12,#F2A254)', '🏃'],
          ['ปิดแล้ว (30 วัน)', counts['ปิดแล้ว'], 'linear-gradient(135deg,#4438AD,#8B5CF6)', '✅'],
        ].map(([l, v, g, ic]) => (
          <div key={l} className="hover-stat" style={{ borderRadius: 22, padding: '16px 20px', color: 'white', background: g, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -30, right: -18, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.13)' }} />
            <div style={{ fontSize: 11.5, fontFamily: font, opacity: 0.92 }}>{ic} {l}</div>
            <div style={{ fontSize: 30, fontWeight: 800, fontFamily: font, marginTop: 6 }}><CountUp end={v} /></div>
          </div>
        ))}
      </div>

      <div className="anim-slide-up delay-2" style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <SearchBox value={q} onChange={setQ} placeholder="ค้นหาเลขเคส / บ้าน…" width={230} />
        <select value={villageFilter} onChange={e => setVillageFilter(e.target.value)} className="f-select" style={{ borderRadius: 100, fontFamily: font }}>
          <option value="ทั้งหมด">ทุกหมู่บ้าน</option>
          {SV_VILLAGES.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
        </select>
        <div className="seg">
          {STATUS_TABS.map(s => (
            <button key={s} className={`seg-btn${tab === s ? ' active' : ''}`} onClick={() => setTab(s)}>
              {s}{s !== 'ทั้งหมด' ? ` (${counts[s]})` : ''}
            </button>
          ))}
        </div>
      </div>

      <div className="anim-slide-up delay-3" style={{ ...card, padding: 8 }}>
        {rows.length === 0 ? <EmptyState icon="🎉" title="ไม่มีเหตุการณ์ตามเงื่อนไข" sub="ลองปรับ filter" /> : (
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
                      {a.recovered && <div style={{ fontSize: 10, color: BLUE, fontFamily: font }}>📡 เครื่องรายงานกลับสู่ปกติ</div>}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'flex-start' }}>
                      <Pill color={ALERT_STATUS_META[a.status].color} bg={ALERT_STATUS_META[a.status].bg}>{a.status}</Pill>
                      {a.status === 'ใหม่' && <span style={{ fontSize: 10, color: RED, fontWeight: 700, fontFamily: font }}><ElapsedSince minAgo={a.minAgo} /></span>}
                    </div>
                    <div style={{ fontSize: 11, lineHeight: 1.55 }}>
                      {a.ackBy && <div>✓ {a.ackBy} · {a.ackAt} น.</div>}
                      {a.result && <div style={{ marginTop: 2 }}><Pill color={ALERT_RESULT_META[a.result].color} bg={ALERT_RESULT_META[a.result].bg} dot={false}>{a.result}</Pill></div>}
                      {a.status === 'ใหม่' && <span style={{ color: RED, fontWeight: 700 }}>⚠ ยังไม่มีผู้รับทราบ</span>}
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
