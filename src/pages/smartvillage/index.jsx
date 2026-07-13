/* ═══ Smart Village — container + navigation ภายในโมดูล ═══
   sidebar เลือก section (ภาพรวม/หมู่บ้าน/อุปกรณ์/เหตุการณ์)
   drill-down: หมู่บ้าน → รายละเอียดหมู่บ้าน → รายละเอียดบ้าน (มี breadcrumb) */
import { useState } from 'react';
import { IconBuildingCommunity } from '@tabler/icons-react';
import { getVillage, getHouse } from '../../data/smartVillage';
import { font, GRAY, GRAY2, PURPLE, BLACK } from './shared';
import Overview from './Overview';
import Villages from './Villages';
import VillageDetail from './VillageDetail';
import HouseDetail from './HouseDetail';
import Devices, { AddDeviceModal } from './Devices';
import Alerts from './Alerts';
import GuardMonitor from './GuardMonitor';

/* ฝากเป้าหมาย drill ข้ามการ remount (เปลี่ยน section จาก sidebar = component ถูก mount ใหม่) */
let pendingDrill = null;
function setPendingDrill(d) { pendingDrill = d; }
function consumePendingDrill() { const d = pendingDrill; pendingDrill = null; return d; }

function Crumb({ items }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 14, flexWrap: 'wrap' }}>
      {items.map((it, i) => {
        const last = i === items.length - 1;
        return (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
            <span
              onClick={!last ? it.onClick : undefined}
              className={!last ? 'hover-btn' : undefined}
              style={{
                fontSize: 12, fontFamily: font, cursor: last ? 'default' : 'pointer',
                color: last ? BLACK : PURPLE, fontWeight: last ? 700 : 500,
                background: last ? 'transparent' : 'rgba(102,88,225,0.08)',
                borderRadius: 100, padding: last ? '3px 2px' : '3px 12px',
              }}
            >{it.label}</span>
            {!last && <span style={{ color: GRAY2, fontSize: 11 }}>›</span>}
          </span>
        );
      })}
    </div>
  );
}

export default function SmartVillage({ section, onNavigate }) {
  const [drill, setDrill] = useState(() => consumePendingDrill() || {}); // { villageId?, houseId?, addDevice? }
  const [guardOpen, setGuardOpen] = useState(false);
  const [quickAdd, setQuickAdd] = useState(!!drill.addDevice);

  const goHouse = (villageId, houseId) => setDrill({ villageId, houseId });
  const goVillage = (villageId) => setDrill({ villageId });
  const goSection = (sec, opts = {}) => {
    if (sec === section) { setDrill({}); if (opts.addDevice) setQuickAdd(true); return; }
    setPendingDrill(opts.addDevice ? { addDevice: true } : null);
    onNavigate(sec);
  };

  const village = drill.villageId ? getVillage(drill.villageId) : null;
  const house = drill.houseId ? getHouse(drill.houseId) : null;

  let body;
  if (house) {
    body = (
      <>
        <Crumb items={[
          { label: <><IconBuildingCommunity size={14} style={{ verticalAlign: '-2px' }} /> หมู่บ้าน</>, onClick: () => setDrill({}) },
          { label: village.name, onClick: () => setDrill({ villageId: village.id }) },
          { label: `บ้าน ${house.no}` },
        ]} />
        <HouseDetail key={house.id} villageId={village.id} houseId={house.id} onAddDevice={() => setQuickAdd(true)} />
      </>
    );
  } else if (village) {
    body = (
      <>
        <Crumb items={[
          { label: <><IconBuildingCommunity size={14} style={{ verticalAlign: '-2px' }} /> หมู่บ้าน</>, onClick: () => setDrill({}) },
          { label: village.name },
        ]} />
        <VillageDetail villageId={village.id} onDrillHouse={(houseId) => goHouse(village.id, houseId)} />
      </>
    );
  } else if (section === 'sv-villages') {
    body = <Villages onDrillVillage={goVillage} onGoSection={goSection} />;
  } else if (section === 'sv-devices') {
    body = <Devices onDrillHouse={goHouse} onGoSection={goSection} />;
  } else if (section === 'sv-alerts') {
    body = <Alerts onDrillHouse={goHouse} onGoSection={goSection} />;
  } else {
    body = (
      <Overview
        onDrillHouse={(villageId, houseId) => { setPendingDrill({ villageId, houseId }); onNavigate('sv-villages'); }}
        onDrillVillage={(villageId) => { setPendingDrill({ villageId }); onNavigate('sv-villages'); }}
        onGoSection={goSection}
        onOpenGuard={() => setGuardOpen(true)}
      />
    );
  }

  /* เพิ่มอุปกรณ์ = full page (แทน body) */
  if (quickAdd) {
    return <div className="anim-slide-up"><AddDeviceModal prefill={house ? { villageId: village.id, houseId: house.id } : {}} onClose={() => setQuickAdd(false)} /></div>;
  }

  return (
    <div>
      {body}
      {guardOpen && <GuardMonitor onExit={() => setGuardOpen(false)} />}
    </div>
  );
}
