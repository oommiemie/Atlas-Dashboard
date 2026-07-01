import { useState } from 'react';
import { createPortal } from 'react-dom';
import { PATIENTS, getAvatar } from '../data/patients';

const font = "'IBM Plex Sans Thai Looped', sans-serif";
const BLACK = '#1E1B39';
const GRAY = '#615E83';
const PURPLE = '#6658E1';

/* ── Option lists (transcribed from the HOSxP HomeVisitPlanEntryForm screenshots) ── */
const VISIT_TYPES = ['เยี่ยมครั้งแรก', 'เยี่ยมต่อเนื่อง'];
// รายชื่อเจ้าหน้าที่สำหรับเลือกเป็นทีมผู้เยี่ยม
const STAFF = ['พว.สมหญิง รักษ์ชุมชน', 'พว.สมชาย ใจดี', 'นายวิชัย พงษ์สุวรรณ', 'ภก.สมศักดิ์ แสงจันทร์', 'นักกายภาพ อรุณ สุขใจ', 'อสม.มาลี ดอกไม้', 'นพ.ธนวัฒน์ กิตติ'];
const ROOMS = ['999 กลับบ้าน', 'ห้องตรวจ 1', 'ห้องตรวจ 2', 'PCU'];
// วัตถุประสงค์การเยี่ยม — checklist (ถอดจากรูป HOSxP)
const OBJECTIVES = [
  'ติดตามระดับความดันโลหิต ให้อยู่ในเกณฑ์เป้าหมายตามกลุ่มอายุและโรคร่วม',
  'ติดตามสัญญาณชีพอย่างใกล้ชิดและเฝ้าระวังอาการแสดงของภาวะแทรกซ้อนเฉียบพลันจากความดันโลหิต',
  'ประเมินผลข้างเคียงจากยาลดความดันโลหิต และให้ความรู้เรื่องการปรับเปลี่ยนวิถีการดำเนินชีวิตที่เหมาะสม',
  'ตรวจสอบว่าผู้ป่วยกินยาตามแพทย์สั่งหรือไม่ มีการจัดยาที่ถูกต้องไหม และค้นหาปัจจัยที่ทำให้ไม่ยอมกินยา',
  'สังเกตอาการเตือนระยะเริ่มแรก (Early Warning Signs)',
  'ค้นหาความเสี่ยงในการทำร้ายตนเอง (Suicide risk) หรือพฤติกรรมรุนแรงต่อผู้อื่น รวมถึงประเมินสภาพแวดล้อม',
  'ส่งเสริมให้ผู้ป่วยสามารถกลับมาทำกิจวัตรประจำวัน (ADL) และมีปฏิสัมพันธ์กับคนในชุมชนได้ตามปกติ',
  'ให้ความรู้แก่ญาติเกี่ยวกับธรรมชาติของโรค และการประเมินภาวะความเครียดของญาติเพื่อป้องกันการทอดทิ้ง',
];
// หัตถการ — ชื่อตามบัญชี ICD-9-CM ในระบบ
const PROCEDURES = [
  'Administration of psychologic test',
  'Amputation and disarticulation of thumb',
  'Aspiration curettage following delivery or abortion',
  'Biopsy of anus',
  'Biopsy of cervix (Other cervical biopsy)',
  'Biopsy of lip (lower lip)',
  'Biopsy of lip (upper lip)',
  'Biopsy of nose',
  'Biopsy of oral tissue (Hard/Soft)',
  'Biopsy of axillary lymph node',
];
const HEALTH_PROBLEMS = [
  'ความเสี่ยงต่อความดันโลหิตต่ำที่บ้าน (Hypotension) จากการได้รับยามากเกินไป (Overtreatment)',
  'การใช้ยาลดความดันเกินความจำเป็น หรือทำงานผิดปกติจากความดันโลหิตต่ำ',
  'ความเสี่ยงสูงต่อโรคหัวใจและหลอดเลือด (CVD Risk > 40%) เช่น หัวใจล้มเหลว หรือโรคหลอดเลือดสมอง (Stroke)',
  'ความเสี่ยงต่อภาวะแทรกซ้อนเฉียบพลัน (Hypertension urgencies/emergencies)',
  'มีอาการทางจิต หูแว่ว ประสาทหลอน หรือก้าวร้าว',
  'ไม่ดูแลตนเอง (Self-neglect) แยกตัวจากสังคม',
];
// ข้อมูลเพิ่มเติม (ถอดจากรูป HOSxP)
const CAREGIVER = ['มี', 'ไม่มี'];
const EATING = ['ทางปาก', 'ทางสายอาหาร'];
const CAREGIVER_READY = ['พร้อมดูแล', 'ต้องการความช่วยเหลือเพิ่มเติม'];
const EXCRETION = ['ปกติ', 'มีสายสวน', 'ต้องช่วยเหลือ'];
const SELFCARE = ['ช่วยเหลือตนเองได้', 'ต้องมีผู้ช่วยบางส่วน', 'พึ่งพาผู้อื่นทั้งหมด'];
const MED_EQUIP = ['สายสวนปัสสาวะ', 'NG tube', 'ออกซิเจน', 'อื่นๆ'];
const WOUND = ['ไม่มีแผล', 'มีแผล'];

// ข้อมูลด้านสังคมและสิ่งแวดล้อม (ถอดจากรูป HOSxP)
const HOUSEHOLD_INCOME = ['เพียงพอ', 'ไม่เพียงพอ'];
const WELFARE = ['บัตรทอง', 'ประกันสังคม', 'ข้าราชการ', 'อื่นๆ'];
const HOME_ENV = ['มีไฟฟ้า', 'น้ำประปา', 'ห้องน้ำสะอาด', 'อยู่ในสภาพปลอดภัย', 'อื่นๆ'];
const MENTAL_RISK = ['ไม่มี', 'มี'];

/* ── Reusable field pieces ── */
const inputStyle = {
  width: '100%', minHeight: 44, padding: '0 14px', borderRadius: 12,
  border: '1px solid rgba(116,116,128,0.2)', background: 'rgba(116,116,128,0.03)',
  fontSize: 14, fontFamily: font, color: BLACK, boxSizing: 'border-box', outline: 'none',
};

// Native <select> with a custom chevron pinned to the right edge (consistent across browsers)
const CHEVRON = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8' fill='none'%3E%3Cpath d='M1 1.5 6 6.5 11 1.5' stroke='%23615E83' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E";
const selectStyle = {
  ...inputStyle,
  appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none',
  cursor: 'pointer', paddingRight: 34,
  background: `rgba(116,116,128,0.03) url("${CHEVRON}") no-repeat right 12px center`,
};

// Sub-section heading inside a plan card
const subHeadStyle = {
  fontSize: 13, fontWeight: 700, color: BLACK, fontFamily: font,
  marginTop: 6, paddingTop: 14, borderTop: '1px solid rgba(116,116,128,0.14)',
};

function Field({ label, required, hint, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: BLACK, fontFamily: font }}>
        {label}{required && <span style={{ color: '#E8432A' }}> *</span>}
        {hint && <span style={{ fontSize: 11, fontWeight: 400, color: GRAY, marginLeft: 8 }}>{hint}</span>}
      </label>
      {children}
    </div>
  );
}

// Read-only display field (auto-filled, not editable)
function ReadOnly({ label, value }) {
  return (
    <Field label={label}>
      <div style={{ ...inputStyle, display: 'flex', alignItems: 'center', background: 'rgba(116,116,128,0.06)', fontWeight: 500 }}>{value}</div>
    </Field>
  );
}

function RadioGroup({ options, value, onChange }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {options.map(opt => {
        const active = value === opt;
        return (
          <button key={opt} type="button" onClick={() => onChange(opt)} style={{
            padding: '9px 16px', borderRadius: 100, cursor: 'pointer', fontFamily: font, fontSize: 13,
            border: active ? `1.5px solid ${PURPLE}` : '1px solid rgba(116,116,128,0.2)',
            background: active ? 'rgba(102,88,225,0.08)' : 'white',
            color: active ? PURPLE : GRAY, fontWeight: active ? 600 : 400,
            transition: 'all 0.15s ease',
          }}>{opt}</button>
        );
      })}
    </div>
  );
}

function CheckGroup({ options, values, onToggle, color = '#34D65D', activeColor = '#1E9E44', block = false }) {
  return (
    <div style={{ display: 'flex', flexDirection: block ? 'column' : 'row', flexWrap: block ? 'nowrap' : 'wrap', gap: 8 }}>
      {options.map(opt => {
        const active = values.includes(opt);
        return (
          <button key={opt} type="button" onClick={() => onToggle(opt)} style={{
            display: 'flex', alignItems: block ? 'flex-start' : 'center', gap: 8, textAlign: 'left',
            width: block ? '100%' : undefined,
            padding: block ? '5px 2px' : '9px 14px', borderRadius: 12, cursor: 'pointer', fontFamily: font, fontSize: 13,
            border: block ? 'none' : (active ? `1.5px solid ${color}` : '1px solid rgba(116,116,128,0.2)'),
            background: block ? 'transparent' : (active ? `${color}14` : 'white'),
            color: active ? activeColor : (block ? BLACK : GRAY), fontWeight: active ? 600 : 400,
            transition: 'all 0.15s ease', lineHeight: 1.5,
          }}>
            <span style={{
              width: 18, height: 18, borderRadius: 6, flexShrink: 0, marginTop: block ? 2 : 0,
              border: active ? 'none' : '1.5px solid #C7C7CC', background: active ? color : 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {active && <svg width="11" height="11" viewBox="0 0 12 12"><path d="M2.5 6.3l2.3 2.3L9.5 3.5" stroke="white" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>}
            </span>
            {opt}
          </button>
        );
      })}
    </div>
  );
}

// รายการ radio จริง (วงกลม + จุดม่วง) — ใช้ในส่วนข้อมูลเพิ่มเติม
function RadioList({ options, value, onChange }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 26px' }}>
      {options.map(opt => {
        const active = value === opt;
        return (
          <button key={opt} type="button" onClick={() => onChange(opt)} style={{
            display: 'flex', alignItems: 'center', gap: 9, textAlign: 'left', padding: '4px 0',
            border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: font, fontSize: 13.5,
            color: BLACK, fontWeight: active ? 600 : 400, lineHeight: 1, transition: 'color 0.15s ease',
          }}>
            <span style={{
              width: 20, height: 20, borderRadius: '50%', flexShrink: 0, boxSizing: 'border-box',
              border: active ? `2px solid ${PURPLE}` : '1.5px solid #CDCDD6', background: 'white',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: active ? '0 0 0 3px rgba(102,88,225,0.12)' : 'none', transition: 'all 0.15s ease',
            }}>
              {active && <span style={{ width: 9, height: 9, borderRadius: '50%', background: PURPLE }} />}
            </span>
            <span style={{ lineHeight: 1.3 }}>{opt}</span>
          </button>
        );
      })}
    </div>
  );
}

// รายการ checkbox จริง (กล่อง + เครื่องหมายถูก) — ใช้ในส่วนข้อมูลเพิ่มเติม
function CheckList({ options, values, onToggle }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 26px' }}>
      {options.map(opt => {
        const active = values.includes(opt);
        return (
          <button key={opt} type="button" onClick={() => onToggle(opt)} style={{
            display: 'flex', alignItems: 'center', gap: 9, textAlign: 'left', padding: '4px 0',
            border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: font, fontSize: 13.5,
            color: BLACK, fontWeight: active ? 600 : 400, lineHeight: 1, transition: 'color 0.15s ease',
          }}>
            <span style={{
              width: 20, height: 20, borderRadius: 7, flexShrink: 0, boxSizing: 'border-box',
              border: active ? 'none' : '1.5px solid #CDCDD6', background: active ? PURPLE : 'white',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: active ? '0 0 0 3px rgba(102,88,225,0.12)' : 'none', transition: 'all 0.15s ease',
            }}>
              {active && <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2.5 6.3l2.3 2.3L9.5 3.5" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>}
            </span>
            <span style={{ lineHeight: 1.3 }}>{opt}</span>
          </button>
        );
      })}
    </div>
  );
}

function Section({ id, icon, title, desc, action, children }) {
  return (
    <div id={`sec-${id}`} style={{
      background: 'white', borderRadius: 20, padding: 24, scrollMarginTop: 16,
      boxShadow: '0 2px 12px rgba(30,27,57,0.05)', border: '1px solid rgba(0,0,0,0.04)',
      display: 'flex', flexDirection: 'column', gap: 20,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0, color: 'white',
          background: 'linear-gradient(135deg, #6658E1, #0088FF)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: BLACK, fontFamily: font }}>{title}</div>
          {desc && <div style={{ fontSize: 12, color: GRAY, fontFamily: font }}>{desc}</div>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

const ic = (path) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none">{path}</svg>;

/* ══════════════════════════════════════════
   PLAN VISIT PAGE — full-page home visit plan
   ══════════════════════════════════════════ */
export default function PlanVisitPage({ onCancel, onSave }) {
  const [form, setForm] = useState({ hn: '', area: '', summary: '', objective: '' });
  // Each visit plan is a full planning entry (its own date + health problems + extra info + advice).
  const [plans, setPlans] = useState([]);
  const [regNo] = useState(() => String(Math.floor(10000000 + Math.random() * 90000000)));
  const [regDate] = useState(() => new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' }));
  const [error, setError] = useState('');

  const [modal, setModal] = useState(null); // { idx: number|null, initial } — plan-entry popup

  const selected = PATIENTS.find(p => p.hn === form.hn);
  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); if (error) setError(''); };

  const newPlan = () => ({
    visitType: VISIT_TYPES[1], visitDates: [], visitTime: '', room: ROOMS[0], members: [],
    area: selected?.address || '', objectives: [], objective: '', procedures: [],
    problems: [], problemNote: '',
    caregiver: '', eating: '', caregiverReady: '', excretion: '', selfCare: '',
    medEquip: [], wound: '', watchNote: '',
    householdMembers: '', income: '', welfare: '', homeEnv: [], mentalRisk: '',
    advice: '',
  });
  const openNew = () => { setModal({ idx: null, initial: newPlan() }); if (error) setError(''); };
  const openEdit = (i) => setModal({ idx: i, initial: plans[i] });
  const savePlan = (plan) => {
    setPlans(ps => (modal.idx === null ? [...ps, plan] : ps.map((p, idx) => (idx === modal.idx ? plan : p))));
    setModal(null); if (error) setError('');
  };
  // ลบเฉพาะวันที่เลือก — ถ้าแผนนั้นไม่เหลือวันแล้วให้ลบทั้งแผน
  const removeDate = (planIdx, dt) => setPlans(ps => ps
    .map((p, idx) => (idx === planIdx ? { ...p, visitDates: p.visitDates.filter(x => x !== dt) } : p))
    .filter(p => p.visitDates.length > 0));

  const goTo = (id) => document.getElementById(`sec-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const handleSave = () => {
    if (!form.hn) { setError('กรุณาเลือกผู้ป่วยก่อนบันทึก'); goTo('patient'); return; }
    const valid = plans.filter(p => p.visitDates.length > 0);
    if (valid.length === 0) { setError('กรุณาเพิ่มแผนการเยี่ยมอย่างน้อย 1 แผน พร้อมเลือกวันที่'); goTo('plans'); return; }
    const base = {
      hn: selected.hn, name: selected.name, age: selected.age, gender: selected.gender,
      group: selected.group, address: selected.address, hospital: 'รพ.สต.',
      status: 'รอเยี่ยม', planned: true, regNo, regDate,
      summary: form.summary, objective: form.objective,
    };
    // Each selected date becomes one visit occurrence (continuous visits = several dates).
    valid.forEach(p => p.visitDates.forEach(vd => onSave({
      ...base, visitType: p.visitType, visitDate: vd, visitTime: p.visitTime, room: p.room,
      team: p.members.length ? p.members.join(', ') : (selected.team || ''), members: p.members,
      area: p.area || selected.address, objectives: p.objectives, planObjective: p.objective, procedures: p.procedures,
      problems: p.problems, problemNote: p.problemNote,
      caregiver: p.caregiver, eating: p.eating, caregiverReady: p.caregiverReady, excretion: p.excretion,
      selfCare: p.selfCare, medEquip: p.medEquip, wound: p.wound, watchNote: p.watchNote,
      householdMembers: p.householdMembers, income: p.income, welfare: p.welfare, homeEnv: p.homeEnv, mentalRisk: p.mentalRisk,
      advice: p.advice,
    })));
  };

  const patientType = selected ? selected.group : '-';

  return (
    <div style={{ fontFamily: font, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header — fixed at the top; title on the left, actions on the right */}
      <div style={{ flexShrink: 0, paddingBottom: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg, #6658E1, #0088FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="3" y="4.5" width="18" height="16" rx="3" stroke="white" strokeWidth="1.6" /><path d="M3 9h18M8 2.5v4M16 2.5v4M12 12.5v4M10 14.5h4" stroke="white" strokeWidth="1.6" strokeLinecap="round" /></svg>
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: BLACK }}>วางแผนเยี่ยมบ้าน</div>
            <div style={{ fontSize: 13, color: GRAY }}>บันทึกแผนการเยี่ยมบ้านผู้ป่วยแบบละเอียด</div>
          </div>
        </div>
        {error && (
          <div style={{ fontSize: 13, color: '#E8432A', fontFamily: font, textAlign: 'right', maxWidth: 220 }}>{error}</div>
        )}
        <button onClick={onCancel} style={{
          height: 44, padding: '0 24px', borderRadius: 100, cursor: 'pointer', fontFamily: font, fontSize: 14,
          border: '1px solid rgba(116,116,128,0.2)', background: 'white', color: GRAY, flexShrink: 0,
        }}>ยกเลิก</button>
        <button className="hover-btn" onClick={handleSave} style={{
          height: 44, padding: '0 32px', borderRadius: 100, cursor: 'pointer', fontFamily: font, fontSize: 14, fontWeight: 600,
          border: 'none', color: 'white', background: 'linear-gradient(135deg, #6658E1, #0088FF)',
          boxShadow: '0 4px 14px rgba(102,88,225,0.35)', flexShrink: 0, whiteSpace: 'nowrap',
        }}>บันทึกแผนเยี่ยม</button>
      </div>

      {/* Body: two columns — patient context (left) + visit registration/plan (right) */}
      <div style={{ display: 'flex', gap: 20, flex: 1, overflow: 'hidden' }}>
        {/* ══ LEFT — everything about the patient ══ */}
        <div style={{ flex: '0 0 40%', minWidth: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16, paddingRight: 4, paddingBottom: 4 }}>
          {/* Patient info */}
          <Section id="patient" title="ข้อมูลผู้ป่วย" desc="เลือกผู้ป่วยที่ต้องการวางแผนเยี่ยม"
            icon={ic(<><circle cx="12" cy="8" r="4" stroke="white" strokeWidth="1.6" /><path d="M4 20c0-4 3.6-6 8-6s8 2 8 6" stroke="white" strokeWidth="1.6" strokeLinecap="round" /></>)}>
            <Field label="เลือกผู้ป่วย" required>
              <select value={form.hn} onChange={e => set('hn', e.target.value)} style={selectStyle}>
                <option value="">— เลือกผู้ป่วย —</option>
                {PATIENTS.map(p => <option key={p.hn} value={p.hn}>{p.name} ({p.hn})</option>)}
              </select>
            </Field>
            {selected && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, borderRadius: 14, background: 'rgba(102,88,225,0.05)' }}>
                <img src={getAvatar(selected.age, selected.gender)} alt="" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: BLACK }}>{selected.name}</div>
                  <div style={{ fontSize: 12, color: GRAY }}>{selected.hn} · {selected.age} ปี · {selected.gender}</div>
                </div>
              </div>
            )}
            {selected && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, padding: 16, borderRadius: 14, background: 'rgba(116,116,128,0.04)' }}>
                {[
                  ['กลุ่ม', selected.group], ['โรคประจำตัว', selected.disease],
                  ['เบอร์โทร', selected.phone], ['ทีมดูแล', selected.team],
                  ['ที่อยู่', selected.address, 2],
                ].map(([k, v, span]) => (
                  <div key={k} style={{ gridColumn: span ? `span ${span}` : undefined }}>
                    <div style={{ fontSize: 10, color: GRAY, marginBottom: 2 }}>{k}</div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: BLACK }}>{v}</div>
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* Medical summary */}
          <Section id="medical" title="สรุปข้อมูลทางการแพทย์" desc="ข้อมูลเพื่อประกอบการตัดสินใจในการเยี่ยม"
            icon={ic(<><path d="M8 3h8a2 2 0 012 2v14a2 2 0 01-2 2H8a2 2 0 01-2-2V5a2 2 0 012-2z" stroke="white" strokeWidth="1.6" /><path d="M12 8v6M9 11h6" stroke="white" strokeWidth="1.6" strokeLinecap="round" /></>)}>
            <Field label="สรุปทางการแพทย์" hint="ผลตรวจ / อาการ / ยา / ประวัติที่เกี่ยวข้อง">
              <textarea value={form.summary} onChange={e => set('summary', e.target.value)} rows={6}
                placeholder={'เช่น\nผลตรวจ: SpO2 97%\nอาการ: ปวดแน่นหน้าอก หายใจไม่เต็มปอด\nยา: Bisolvon, Losartan\nประวัติ: หายใจหอบเหนื่อย'}
                style={{ ...inputStyle, minHeight: 150, padding: 14, resize: 'vertical', lineHeight: 1.6 }} />
            </Field>
          </Section>

          {/* Reason for visit */}
          <Section id="reason" title="เหตุผลการเยี่ยม" desc="เหตุผลและวัตถุประสงค์ในการเยี่ยมครั้งนี้"
            icon={ic(<><path d="M12 2a10 10 0 100 20 10 10 0 000-20z" stroke="white" strokeWidth="1.6" /><path d="M12 8v4M12 16h.01" stroke="white" strokeWidth="1.8" strokeLinecap="round" /></>)}>
            <Field label="เหตุผล / วัตถุประสงค์การเยี่ยม">
              <textarea value={form.objective} onChange={e => set('objective', e.target.value)} rows={4}
                placeholder="เช่น ติดตามอาการ ประเมินภาวะแทรกซ้อน ให้ความรู้ผู้ดูแล วางแผนการดูแลต่อเนื่อง"
                style={{ ...inputStyle, minHeight: 110, padding: 14, resize: 'vertical', lineHeight: 1.6 }} />
            </Field>
          </Section>
        </div>

        {/* ══ RIGHT — visit registration / plan ══ */}
        <div style={{ flex: 1, minWidth: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16, paddingRight: 4, paddingBottom: 4 }}>
          {/* Visit registration — auto-generated */}
          <Section id="registration" title="การลงทะเบียนการเยี่ยม" desc="ข้อมูลการลงทะเบียน (สร้างอัตโนมัติ)"
            icon={ic(<><rect x="5" y="3" width="14" height="18" rx="2" stroke="white" strokeWidth="1.6" /><path d="M9 7h6M9 11h6M9 15h4" stroke="white" strokeWidth="1.6" strokeLinecap="round" /></>)}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
              <ReadOnly label="เลขที่" value={regNo} />
              <ReadOnly label="วันที่ลงทะเบียน" value={regDate} />
              <ReadOnly label="ประเภทผู้ป่วย" value={patientType} />
            </div>
            <Field label="พื้นที่รับผิดชอบ" hint="ดึงจากที่อยู่ผู้ป่วยอัตโนมัติ แก้ไขได้">
              <input value={form.area || selected?.address || ''} onChange={e => set('area', e.target.value)}
                placeholder="ที่อยู่/พื้นที่ที่รับผิดชอบ" style={inputStyle} />
            </Field>
          </Section>

          {/* Visit plans — add one or more, each with its own visit date */}
          <Section id="plans" title="แผนการเยี่ยม" desc="เพิ่มแผนการเยี่ยม แต่ละแผนกำหนดวันเยี่ยมได้ต่างกัน"
            icon={ic(<><rect x="3" y="4.5" width="18" height="16" rx="3" stroke="white" strokeWidth="1.6" /><path d="M3 9h18M8 2.5v4M16 2.5v4M12 12.5v4M10 14.5h4" stroke="white" strokeWidth="1.6" strokeLinecap="round" /></>)}
            action={
              <button onClick={openNew} className="hover-btn" style={{
                display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0,
                padding: '9px 16px', borderRadius: 100, border: '1.5px solid #6658E1', cursor: 'pointer',
                background: 'rgba(102,88,225,0.06)', color: PURPLE, fontFamily: font, fontSize: 13, fontWeight: 600,
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="#6658E1" strokeWidth="2" strokeLinecap="round" /></svg>
                เพิ่มแผนการเยี่ยม
              </button>
            }>
            {plans.length === 0 && (
              <div style={{ padding: '22px 16px', borderRadius: 14, border: '1.5px dashed rgba(116,116,128,0.3)', textAlign: 'center', color: GRAY, fontSize: 13, fontFamily: font }}>
                ยังไม่มีแผนการเยี่ยม — กด “เพิ่มแผนการเยี่ยม” เพื่อเริ่มกรอกข้อมูล
              </div>
            )}
            {plans.flatMap((p, i) => [...p.visitDates].sort().map(dt => ({ p, i, dt }))).map((row, n) => (
              <div key={`${row.i}-${row.dt}`} onClick={() => openEdit(row.i)} className="hover-card" style={{ display: 'flex', alignItems: 'center', gap: 12, borderRadius: 14, border: '1px solid rgba(116,116,128,0.18)', background: 'white', padding: '12px 14px', cursor: 'pointer' }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, background: 'rgba(102,88,225,0.1)', color: PURPLE, fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{n + 1}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: BLACK, fontFamily: font }}>{row.dt}{row.p.visitTime ? ` · ${row.p.visitTime} น.` : ''}</div>
                  <div style={{ fontSize: 11, color: GRAY, fontFamily: font, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {row.p.visitType}{row.p.members.length ? ` · ผู้เยี่ยม ${row.p.members.length} คน` : ''}{row.p.problems.length ? ` · ${row.p.problems.length} ความเสี่ยง` : ''}
                  </div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); openEdit(row.i); }} className="hover-btn" style={{ padding: '6px 12px', borderRadius: 100, border: '1px solid rgba(102,88,225,0.3)', background: 'rgba(102,88,225,0.06)', color: PURPLE, cursor: 'pointer', fontFamily: font, fontSize: 12, fontWeight: 600, flexShrink: 0 }}>ดูรายละเอียด</button>
                <button onClick={(e) => { e.stopPropagation(); removeDate(row.i, row.dt); }} title="ลบวันนี้" style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid rgba(232,67,42,0.3)', background: 'rgba(232,67,42,0.06)', color: '#E8432A', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, lineHeight: 1, flexShrink: 0 }}>✕</button>
              </div>
            ))}
          </Section>
        </div>
      </div>

      {modal && (
        <PlanEntryModal
          initial={modal.initial}
          isNew={modal.idx === null}
          patient={selected}
          onSave={savePlan}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   PLAN ENTRY MODAL — popup to add/edit one visit plan
   ══════════════════════════════════════════ */
/* ── Inline month calendar for picking the visit date ── */
const CAL_WEEKDAYS = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];
const CAL_MONTHS = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
const fmtDate = (y, m, d) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
const fmtThaiDate = (ds) => new Date(ds + 'T00:00:00').toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

function MiniCalendar({ selectedDates, onPick }) {
  const base = selectedDates[0] ? new Date(selectedDates[0] + 'T00:00:00') : new Date();
  const [view, setView] = useState({ y: base.getFullYear(), m: base.getMonth() });
  const now = new Date();
  const todayStr = fmtDate(now.getFullYear(), now.getMonth(), now.getDate());
  const firstDow = new Date(view.y, view.m, 1).getDay();
  const daysIn = new Date(view.y, view.m + 1, 0).getDate();
  const cells = [...Array(firstDow).fill(null), ...Array.from({ length: daysIn }, (_, i) => i + 1)];
  const prev = () => setView(v => (v.m === 0 ? { y: v.y - 1, m: 11 } : { y: v.y, m: v.m - 1 }));
  const next = () => setView(v => (v.m === 11 ? { y: v.y + 1, m: 0 } : { y: v.y, m: v.m + 1 }));
  const navBtn = { width: 26, height: 26, borderRadius: 8, border: '1px solid rgba(0,0,0,0.08)', background: 'white', cursor: 'pointer', color: GRAY, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, lineHeight: 1 };
  return (
    <div style={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: 12, padding: 10, background: 'white' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <button type="button" onClick={prev} style={navBtn}>‹</button>
        <div style={{ fontSize: 13, fontWeight: 600, color: BLACK, fontFamily: font }}>{CAL_MONTHS[view.m]} {view.y + 543}</div>
        <button type="button" onClick={next} style={navBtn}>›</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 4 }}>
        {CAL_WEEKDAYS.map(w => <div key={w} style={{ textAlign: 'center', fontSize: 10, color: GRAY, fontFamily: font }}>{w}</div>)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
        {cells.map((d, i) => {
          if (d === null) return <div key={i} />;
          const ds = fmtDate(view.y, view.m, d);
          const sel = selectedDates.includes(ds);
          const isToday = todayStr === ds;
          return (
            <button key={i} type="button" onClick={() => onPick(ds)} style={{
              height: 28, borderRadius: 8, cursor: 'pointer', fontFamily: font, fontSize: 12,
              border: isToday && !sel ? '1px solid #6658E1' : '1px solid transparent',
              background: sel ? '#6658E1' : 'transparent', color: sel ? 'white' : BLACK,
              fontWeight: sel ? 700 : 400, transition: 'background 0.1s',
            }}>{d}</button>
          );
        })}
      </div>
    </div>
  );
}

function PlanEntryModal({ initial, isNew, patient, onSave, onClose }) {
  const [d, setD] = useState(initial);
  const [err, setErr] = useState('');
  const set = (patch) => { setD(x => ({ ...x, ...patch })); if (err) setErr(''); };
  const tog = (key, val) => setD(x => ({ ...x, [key]: x[key].includes(val) ? x[key].filter(v => v !== val) : [...x[key], val] }));
  const addMember = (v) => { if (v && !d.members.includes(v)) { setD(x => ({ ...x, members: [...x.members, v] })); if (err) setErr(''); } };
  const removeMember = (i) => setD(x => ({ ...x, members: x.members.filter((_, idx) => idx !== i) }));
  const [procInput, setProcInput] = useState('');
  const addProc = () => { const v = procInput.trim(); if (v && !d.procedures.includes(v)) { setD(x => ({ ...x, procedures: [...x.procedures, v] })); setProcInput(''); } };
  const removeProc = (i) => setD(x => ({ ...x, procedures: x.procedures.filter((_, idx) => idx !== i) }));

  const genAdvice = () => {
    const g = patient?.group || 'ผู้ป่วย';
    const lines = [
      `คำแนะนำสำหรับผู้ป่วยกลุ่ม ${g}${patient ? ` (${patient.disease})` : ''}:`,
      '• ติดตามสัญญาณชีพและอาการเปลี่ยนแปลงอย่างสม่ำเสมอ',
      ...d.problems.map(x => `• เฝ้าระวัง ${x}`),
      d.selfCare && `• ระดับการช่วยเหลือตนเอง: ${d.selfCare} — วางแผนการดูแลให้เหมาะสม`,
      '• ให้ความรู้ผู้ดูแลเรื่องการดูแลต่อเนื่องที่บ้าน และการใช้ยาอย่างถูกต้อง',
      '• หากมีอาการฉุกเฉิน (เจ็บแน่นหน้าอก หายใจลำบาก ซึม) โทร 1669 ทันที',
    ].filter(Boolean);
    set({ advice: lines.join('\n') });
  };
  const save = () => { if (d.visitDates.length === 0) { setErr('กรุณาเลือกวันที่เยี่ยมอย่างน้อย 1 วัน'); return; } onSave(d); };

  return createPortal(
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, fontFamily: font, padding: 24,
    }}>
      <div className="anim-slide-up" onClick={e => e.stopPropagation()} style={{
        width: 1160, maxWidth: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column',
        background: '#F2F2F7', border: '1px solid rgba(0,0,0,0.06)',
        borderRadius: 24, boxShadow: '0 24px 60px rgba(30,27,57,0.22)', overflow: 'hidden',
      }}>
        {/* Header — inline, blends into the light modal surface (no strip) */}
        <div style={{ flexShrink: 0, padding: '16px 18px 4px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 14, flexShrink: 0, background: 'linear-gradient(135deg, #6658E1, #0088FF)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="3" y="4.5" width="18" height="16" rx="3" stroke="white" strokeWidth="1.6" /><path d="M3 9h18M8 2.5v4M16 2.5v4M12 12.5v4M10 14.5h4" stroke="white" strokeWidth="1.6" strokeLinecap="round" /></svg>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 16, fontWeight: 700, color: BLACK, margin: 0 }}>{isNew ? 'เพิ่มแผนการเยี่ยม' : 'แก้ไขแผนการเยี่ยม'}</p>
            <p style={{ fontSize: 12, color: GRAY, margin: 0 }}>{patient ? `${patient.name} · ${patient.hn}` : 'กรอกรายละเอียดการเยี่ยมครั้งนี้'}</p>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 16, border: 'none', cursor: 'pointer', background: 'white', color: GRAY, fontSize: 15, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>✕</button>
        </div>

        {/* Body: two separate white cards (stages | form) on the light surface */}
        <div style={{ flex: 1, display: 'flex', gap: 16, overflow: 'hidden', padding: 16 }}>
          {/* LEFT card — patient context + stage nav (fits its content) */}
          <div style={{ width: 240, flexShrink: 0, alignSelf: 'flex-start', maxHeight: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Card 1 — patient + schedule */}
            <div style={{ background: 'white', borderRadius: 16, border: '1px solid rgba(0,0,0,0.05)', padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {patient && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 12, borderRadius: 14, background: 'rgba(102,88,225,0.05)', border: '1px solid rgba(102,88,225,0.1)' }}>
                <img src={getAvatar(patient.age, patient.gender)} alt="" style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: BLACK, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{patient.name}</div>
                  <div style={{ fontSize: 11, color: GRAY }}>{patient.hn} · {patient.age} ปี</div>
                </div>
              </div>
            )}
            {patient && (
              <div style={{ padding: '10px 12px', borderRadius: 14, background: 'rgba(116,116,128,0.04)', border: '1px solid rgba(0,0,0,0.05)', fontSize: 11, color: GRAY, lineHeight: '19px' }}>
                <div>กลุ่ม: <span style={{ color: BLACK, fontWeight: 600 }}>{patient.group}</span></div>
                <div>โรคประจำตัว: <span style={{ color: BLACK, fontWeight: 600 }}>{patient.disease}</span></div>
                <div>ทีมดูแล: <span style={{ color: BLACK, fontWeight: 600 }}>{patient.team}</span></div>
              </div>
            )}
            <Field label="ประเภทการเยี่ยม">
              <select value={d.visitType} onChange={e => { const t = e.target.value; set({ visitType: t, visitDates: t === 'เยี่ยมต่อเนื่อง' ? d.visitDates : d.visitDates.slice(0, 1) }); }} style={selectStyle}>
                {VISIT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="วันที่เยี่ยม" required hint={d.visitType === 'เยี่ยมต่อเนื่อง' ? 'เลือกได้หลายวัน' : undefined}>
              <MiniCalendar selectedDates={d.visitDates} onPick={ds => {
                const cont = d.visitType === 'เยี่ยมต่อเนื่อง';
                set({ visitDates: cont ? (d.visitDates.includes(ds) ? d.visitDates.filter(x => x !== ds) : [...d.visitDates, ds].sort()) : [ds] });
              }} />
              {d.visitDates.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                  {[...d.visitDates].sort().map(dt => (
                    <div key={dt} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 2px' }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg, #6658E1, #0088FF)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="3" y="4.5" width="18" height="16" rx="3" stroke="white" strokeWidth="1.8" /><path d="M3 9h18M8 2.5v4M16 2.5v4" stroke="white" strokeWidth="1.8" strokeLinecap="round" /></svg>
                      </div>
                      <div style={{ flex: 1, minWidth: 0, fontSize: 12, fontWeight: 500, color: BLACK, fontFamily: font, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fmtThaiDate(dt)}</div>
                      <button type="button" onClick={() => set({ visitDates: d.visitDates.filter(x => x !== dt) })} title="นำออก" style={{ width: 22, height: 22, borderRadius: '50%', border: 'none', background: 'rgba(232,67,42,0.1)', color: '#E8432A', cursor: 'pointer', fontSize: 12, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>✕</button>
                    </div>
                  ))}
                </div>
              )}
            </Field>
            <Field label="เวลา">
              <input type="time" value={d.visitTime} onChange={e => set({ visitTime: e.target.value })} style={inputStyle} />
            </Field>
            </div>
            {/* Card 2 — visitor team (separate box) */}
            <div style={{ background: 'white', borderRadius: 16, border: '1px solid rgba(0,0,0,0.05)', padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Field label={`ทีมผู้เยี่ยม${d.members.length ? ` (${d.members.length})` : ''}`} hint="เลือกจากรายชื่อเจ้าหน้าที่">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <select value="" onChange={e => { addMember(e.target.value); }} style={selectStyle}>
                  <option value="">＋ เพิ่มผู้เยี่ยม</option>
                  {STAFF.filter(s => !d.members.includes(s)).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                {d.members.length === 0 ? (
                  <div style={{ padding: '14px 12px', borderRadius: 12, border: '1.5px dashed rgba(116,116,128,0.25)', textAlign: 'center', fontSize: 11, color: GRAY, fontFamily: font }}>
                    ยังไม่มีผู้เยี่ยม — เลือกจากรายชื่อด้านบน
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {d.members.map((m, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 2px' }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg, #6658E1, #0088FF)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="3.4" stroke="white" strokeWidth="1.8" /><path d="M5.5 19c0-3.2 2.9-5 6.5-5s6.5 1.8 6.5 5" stroke="white" strokeWidth="1.8" strokeLinecap="round" /></svg>
                        </div>
                        <div style={{ flex: 1, minWidth: 0, fontSize: 12, fontWeight: 500, color: BLACK, fontFamily: font, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m}</div>
                        <button onClick={() => removeMember(i)} title="นำออก" style={{ width: 22, height: 22, borderRadius: '50%', border: 'none', background: 'rgba(232,67,42,0.1)', color: '#E8432A', cursor: 'pointer', fontSize: 12, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Field>
            </div>
          </div>

          {/* RIGHT card — form (scrolls) */}
          <div style={{ flex: 1, minWidth: 0, background: 'white', borderRadius: 16, border: '1px solid rgba(0,0,0,0.05)', overflowY: 'auto', padding: 22, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div id="pe-detail" style={{ scrollMarginTop: 4, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Field label="ห้องตรวจที่วางแผน">
                <select value={d.room} onChange={e => set({ room: e.target.value })} style={selectStyle}>{ROOMS.map(r => <option key={r} value={r}>{r}</option>)}</select>
              </Field>
              <Field label="ที่อยู่ปัจจุบัน / พื้นที่รับผิดชอบ" hint="ดึงจากที่อยู่ผู้ป่วย แก้ไขได้"><input value={d.area} onChange={e => set({ area: e.target.value })} placeholder="ที่อยู่/พื้นที่ที่รับผิดชอบ" style={inputStyle} /></Field>
              <Field label="วัตถุประสงค์การเยี่ยม">
                <CheckGroup options={OBJECTIVES} values={d.objectives} onToggle={v => tog('objectives', v)} color={PURPLE} activeColor={PURPLE} block />
              </Field>
              <div style={{ height: 1, background: 'rgba(116,116,128,0.14)', marginTop: 4 }} />
              <Field label={`หัตถการที่ทำ${d.procedures.length ? ` (${d.procedures.length})` : ''}`} hint="ค้นหาชื่อหัตถการ แล้วกดเพิ่ม">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input list="proc-datalist" value={procInput} onChange={e => setProcInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addProc(); } }}
                      placeholder="ค้นหาหัตถการ (ICD-9)..." style={{ ...inputStyle, flex: 1 }} />
                    <datalist id="proc-datalist">{PROCEDURES.filter(x => !d.procedures.includes(x)).map(x => <option key={x} value={x} />)}</datalist>
                    <button onClick={addProc} className="hover-btn" style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6, padding: '0 18px', borderRadius: 12, border: '1.5px solid #6658E1', background: 'rgba(102,88,225,0.06)', color: PURPLE, cursor: 'pointer', fontFamily: font, fontSize: 14, fontWeight: 600 }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="#6658E1" strokeWidth="2" strokeLinecap="round" /></svg>เพิ่ม
                    </button>
                  </div>
                  {d.procedures.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {d.procedures.map((pr, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 2px' }}>
                          <div style={{ width: 24, height: 24, borderRadius: 7, flexShrink: 0, background: 'rgba(102,88,225,0.1)', color: PURPLE, fontWeight: 700, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</div>
                          <div style={{ flex: 1, minWidth: 0, fontSize: 13, color: BLACK, fontFamily: font }}>{pr}</div>
                          <button onClick={() => removeProc(i)} title="นำออก" style={{ width: 22, height: 22, borderRadius: '50%', border: 'none', background: 'rgba(232,67,42,0.1)', color: '#E8432A', cursor: 'pointer', fontSize: 12, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>✕</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Field>
            </div>

            <div id="pe-problems" style={{ scrollMarginTop: 4, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={subHeadStyle}>ปัญหาสุขภาพ / ความเสี่ยง</div>
              <CheckGroup options={HEALTH_PROBLEMS} values={d.problems} onToggle={v => tog('problems', v)} color="#E8802A" activeColor="#C4661A" block />
              <textarea value={d.problemNote} onChange={e => set({ problemNote: e.target.value })} rows={2}
                placeholder="ปัญหาสุขภาพเพิ่มเติม (พิมพ์เอง)" style={{ ...inputStyle, minHeight: 56, padding: 14, resize: 'vertical', lineHeight: 1.6 }} />
            </div>

            <div id="pe-extra" style={{ scrollMarginTop: 4, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={subHeadStyle}>ข้อมูลเพิ่มเติม</div>
              <div style={{ background: '#fff', border: '1px solid rgba(116,116,128,0.16)', borderRadius: 14, overflow: 'hidden' }}>
                {[
                  { l: 'ผู้ดูแลหลัก', c: <RadioList options={CAREGIVER} value={d.caregiver} onChange={v => set({ caregiver: v })} /> },
                  { l: 'การรับประทานอาหาร', c: <RadioList options={EATING} value={d.eating} onChange={v => set({ eating: v })} /> },
                  { l: 'ความพร้อมของผู้ดูแล', c: <RadioList options={CAREGIVER_READY} value={d.caregiverReady} onChange={v => set({ caregiverReady: v })} /> },
                  { l: 'การขับถ่าย', c: <RadioList options={EXCRETION} value={d.excretion} onChange={v => set({ excretion: v })} /> },
                  { l: 'การช่วยเหลือตนเอง', c: <RadioList options={SELFCARE} value={d.selfCare} onChange={v => set({ selfCare: v })} /> },
                  { l: 'อุปกรณ์ทางการแพทย์', c: <CheckList options={MED_EQUIP} values={d.medEquip} onToggle={v => tog('medEquip', v)} /> },
                  { l: 'แผล', c: <RadioList options={WOUND} value={d.wound} onChange={v => set({ wound: v })} /> },
                ].map((row, i) => (
                  <div key={row.l} style={{ display: 'flex', alignItems: 'flex-start', gap: 16, padding: '11px 16px', borderTop: i === 0 ? 'none' : '1px solid rgba(116,116,128,0.12)' }}>
                    <div style={{ width: 150, flexShrink: 0, fontSize: 13, fontWeight: 600, color: BLACK, fontFamily: font, paddingTop: 4 }}>{row.l}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>{row.c}</div>
                  </div>
                ))}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, padding: '11px 16px', borderTop: '1px solid rgba(116,116,128,0.12)' }}>
                  <div style={{ width: 150, flexShrink: 0, fontSize: 13, fontWeight: 600, color: BLACK, fontFamily: font, paddingTop: 10 }}>ข้อควรระวังพิเศษ</div>
                  <textarea value={d.watchNote} onChange={e => set({ watchNote: e.target.value })} rows={2}
                    placeholder="ระบุข้อควรระวังพิเศษ" style={{ ...inputStyle, flex: 1, minWidth: 0, minHeight: 50, padding: '10px 12px', resize: 'vertical', lineHeight: 1.6 }} />
                </div>
              </div>
            </div>

            <div id="pe-social" style={{ scrollMarginTop: 4, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={subHeadStyle}>ข้อมูลด้านสังคมและสิ่งแวดล้อม</div>
              <div style={{ background: '#fff', border: '1px solid rgba(116,116,128,0.16)', borderRadius: 14, overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '11px 16px' }}>
                  <div style={{ width: 168, flexShrink: 0, fontSize: 13, fontWeight: 600, color: BLACK, fontFamily: font }}>จำนวนสมาชิกในบ้าน</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input type="number" min="0" value={d.householdMembers} onChange={e => set({ householdMembers: e.target.value })}
                      placeholder="0" style={{ ...inputStyle, width: 96, padding: '8px 12px', textAlign: 'center' }} />
                    <span style={{ fontSize: 13, color: GRAY, fontFamily: font }}>คน</span>
                  </div>
                </div>
                {[
                  { l: 'รายได้ครัวเรือน', c: <RadioList options={HOUSEHOLD_INCOME} value={d.income} onChange={v => set({ income: v })} /> },
                  { l: 'สวัสดิการ', c: <RadioList options={WELFARE} value={d.welfare} onChange={v => set({ welfare: v })} /> },
                  { l: 'ลักษณะสิ่งแวดล้อมบ้าน', c: <CheckList options={HOME_ENV} values={d.homeEnv} onToggle={v => tog('homeEnv', v)} /> },
                  { l: 'ปัญหาสุขภาพจิต/พฤติกรรมเสี่ยง', c: <RadioList options={MENTAL_RISK} value={d.mentalRisk} onChange={v => set({ mentalRisk: v })} /> },
                ].map(row => (
                  <div key={row.l} style={{ display: 'flex', alignItems: 'flex-start', gap: 16, padding: '11px 16px', borderTop: '1px solid rgba(116,116,128,0.12)' }}>
                    <div style={{ width: 168, flexShrink: 0, fontSize: 13, fontWeight: 600, color: BLACK, fontFamily: font, paddingTop: 4 }}>{row.l}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>{row.c}</div>
                  </div>
                ))}
              </div>
            </div>

            <div id="pe-advice" style={{ scrollMarginTop: 4, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={subHeadStyle}>คำแนะนำสำหรับการเยี่ยมบ้าน</div>
              <button onClick={genAdvice} className="hover-btn" style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 8, padding: '9px 16px', borderRadius: 100, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #8B5CF6, #6658E1)', color: 'white', fontFamily: font, fontSize: 13, fontWeight: 600 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 3l1.8 4.6L18 9l-4.2 1.4L12 15l-1.8-4.6L6 9l4.2-1.4L12 3z" fill="white" /><path d="M19 14l.9 2.3L22 17l-2.1.7L19 20l-.9-2.3L16 17l2.1-.7L19 14z" fill="white" /></svg>
                ค้นหาคำแนะนำจาก AI
              </button>
              <Field label="คำแนะนำเสริมสำหรับการเยี่ยมบ้าน">
                <textarea value={d.advice} onChange={e => set({ advice: e.target.value })} rows={4} placeholder="คำแนะนำในการดูแลผู้ป่วยที่บ้าน หรือกดปุ่ม AI เพื่อให้ช่วยร่าง" style={{ ...inputStyle, minHeight: 96, padding: 14, resize: 'vertical', lineHeight: 1.6 }} />
              </Field>
            </div>
          </div>
        </div>

        {/* Footer — blends into the light surface (no strip) */}
        <div style={{ flexShrink: 0, padding: '4px 18px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ fontSize: 13, color: '#E8432A', fontFamily: font }}>{err}</div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={onClose} style={{ height: 44, padding: '0 24px', borderRadius: 100, cursor: 'pointer', fontFamily: font, fontSize: 14, border: '1px solid rgba(116,116,128,0.2)', background: 'white', color: GRAY }}>ยกเลิก</button>
            <button className="hover-btn" onClick={save} style={{ height: 44, padding: '0 32px', borderRadius: 100, cursor: 'pointer', fontFamily: font, fontSize: 14, fontWeight: 600, border: 'none', color: 'white', background: 'linear-gradient(135deg, #6658E1, #0088FF)', boxShadow: '0 4px 14px rgba(102,88,225,0.35)' }}>{isNew ? 'เพิ่มแผน' : 'บันทึกแผน'}</button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
