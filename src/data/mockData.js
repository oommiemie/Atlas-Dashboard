/* ═══ ATLAS DASHBOARD — Mock Data (สมจริง) ═══ */

export const DASHBOARD_STATS = {
  totalPatients: 1847,
  totalVisits: 923,
  totalVitalSigns: 3256,
  abnormalVitalSigns: 187,
  hospitalsActive: 12,
  totalHospitals: 14,
  growthPatients: 4.1,
  growthVisits: 6.3,
  growthVitalSigns: 12.5,
  growthAbnormal: 7.8,
  growthHospitals: 9.2,
};

export const USAGE_CHART_DATA = [
  { label: 'Jan', vitalsign: 42500, visit: 28300 },
  { label: 'Feb', vitalsign: 51200, visit: 35600 },
  { label: 'Mar', vitalsign: 48700, visit: 41200 },
  { label: 'Apr', vitalsign: 63400, visit: 52800 },
  { label: 'May', vitalsign: 58100, visit: 47500 },
  { label: 'Jun', vitalsign: 72300, visit: 61900 },
];

export const HOSPITAL_COMPARISON = [
  { name: 'รพ.ศิริราช', visited: 245, notVisited: 82, pending: 53 },
  { name: 'รพ.รามาธิบดี', visited: 198, notVisited: 67, pending: 45 },
  { name: 'รพ.จุฬาลงกรณ์', visited: 176, notVisited: 94, pending: 62 },
  { name: 'รพ.สกลนคร', visited: 152, notVisited: 108, pending: 38 },
  { name: 'รพ.ขอนแก่น', visited: 210, notVisited: 75, pending: 55 },
  { name: 'รพ.เชียงใหม่', visited: 189, notVisited: 61, pending: 48 },
];

export const DISEASE_GROUPS = [
  { name: 'ความดันโลหิตสูง', count: 482, pct: 40, color: '#818CF8' },
  { name: 'เบาหวาน', count: 356, pct: 25, color: '#F9A8D4' },
  { name: 'IMC Stroke', count: 198, pct: 10, color: '#3B82F6' },
  { name: 'อื่นๆ', count: 127, pct: 25, color: '#A78BFA' },
];

export const CRITICAL_CASES = [
  { id: 1, name: 'นางสาวพิมพ์ใจ สุขสวัสดิ์', group: 'ผู้ป่วยติดเตียง', hospital: 'รพ.ศิริราช', severity: 'normal' },
  { id: 2, name: 'นายสมศักดิ์ วงศ์ประเสริฐ', group: 'ผู้สูงอายุติดบ้าน', hospital: 'รพ.รามาธิบดี', severity: 'normal' },
  { id: 3, name: 'นางมาลี ทองคำ', detail: 'BP Systolic: 182 mmHg', hospital: 'รพ.จุฬาลงกรณ์', severity: 'high' },
  { id: 4, name: 'นายประเสริฐ แก้วมณี', detail: 'Glucose: 312 mg/dL', hospital: 'รพ.สกลนคร', severity: 'high' },
  { id: 5, name: 'นางบุญมี จันทร์เพ็ง', detail: 'SpO2: 88% HR: 128 bpm', hospital: 'รพ.ขอนแก่น', severity: 'critical' },
];

export const CGM_PATIENTS = [
  { id: 1, name: 'นางวิภา เจริญสุข', avg: 215, readings: 42180, status: 'high' },
  { id: 2, name: 'นายธนกร ศรีสมบูรณ์', avg: 62, readings: 18750, status: 'low' },
  { id: 3, name: 'นางสาวรัตนา พลอยงาม', avg: 108, readings: 35420, status: 'normal' },
  { id: 4, name: 'นายวิชัย อินทรภักดี', avg: 95, readings: 28960, status: 'normal' },
  { id: 5, name: 'นางพรทิพย์ สว่างจิต', avg: 112, readings: 31840, status: 'normal' },
  { id: 6, name: 'นายสุรชัย มานะกิจ', avg: 102, readings: 26510, status: 'normal' },
  { id: 7, name: 'นางกัลยา ธรรมรักษ์', avg: 248, readings: 39200, status: 'high' },
];

export const PROVINCES_TOP10 = [
  { name: 'กรุงเทพมหานคร', total: 487, visited: 312, notVisited: 98, pending: 77 },
  { name: 'สกลนคร', total: 356, visited: 228, notVisited: 74, pending: 54 },
  { name: 'เชียงใหม่', total: 298, visited: 185, notVisited: 68, pending: 45 },
  { name: 'ขอนแก่น', total: 274, visited: 196, notVisited: 42, pending: 36 },
  { name: 'นครราชสีมา', total: 251, visited: 162, notVisited: 55, pending: 34 },
  { name: 'เชียงราย', total: 218, visited: 148, notVisited: 41, pending: 29 },
  { name: 'สุราษฎร์ธานี', total: 195, visited: 138, notVisited: 32, pending: 25 },
  { name: 'อำนาจเจริญ', total: 172, visited: 115, notVisited: 35, pending: 22 },
  { name: 'ชลบุรี', total: 164, visited: 108, notVisited: 34, pending: 22 },
  { name: 'สมุทรปราการ', total: 148, visited: 92, notVisited: 38, pending: 18 },
];

const HOSPITAL_NAMES = [
  'รพ.ศิริราช', 'รพ.รามาธิบดี', 'รพ.จุฬาลงกรณ์', 'รพ.สกลนคร', 'รพ.ขอนแก่น',
  'รพ.เชียงใหม่', 'รพ.สุราษฎร์ธานี', 'รพ.อำนาจเจริญ', 'รพ.ชลบุรี', 'รพ.นครราชสีมา',
  'รพ.เชียงราย', 'รพ.สมุทรปราการ', 'รพ.ระยอง', 'รพ.ภูเก็ต',
];

export const FEATURE_USAGE = HOSPITAL_NAMES.map((hospital, i) => ({
  hospital,
  vitalsign: Math.max(0, Math.round(380 - i * 28 + (Math.sin(i * 1.7) * 45))),
  visit: Math.max(0, Math.round(210 - i * 15 + (Math.cos(i * 2.1) * 30))),
  appointment: Math.max(0, Math.round(145 - i * 10 + (Math.sin(i * 0.9) * 25))),
  assessment: Math.max(0, Math.round(92 - i * 7 + (Math.cos(i * 1.3) * 18))),
  cgm: Math.max(0, Math.round(64 - i * 5 + (Math.sin(i * 2.5) * 12))),
}));
