// Shared mock patient database for Atlas Dashboard
// All pages should import from this file for consistent data

// 15 patients with consistent data across all pages
export const PATIENTS = [
  { hn: 'HN001234', name: 'นายสมชาย แก้วมณี', age: 72, gender: 'ชาย', phone: '081-234-5678', address: '99/1 หมู่ 5 ต.ในเมือง อ.เมือง จ.เชียงใหม่ 50000', group: 'NCD', disease: 'DM, HT', team: 'ทีม A', adl: 55, visits: 4, lastVisit: '2026-03-28', outcome: 'ดีขึ้น' },
  { hn: 'HN001235', name: 'นางสมศรี ดีใจ', age: 65, gender: 'หญิง', phone: '082-345-6789', address: '123/4 หมู่ 3 ต.หนองไผ่ อ.เมือง จ.เชียงใหม่ 50000', group: 'LTC', disease: 'Stroke', team: 'ทีม B', adl: 35, visits: 6, lastVisit: '2026-03-27', outcome: 'คงที่' },
  { hn: 'HN001236', name: 'นายประยูร ทองคำ', age: 80, gender: 'ชาย', phone: '083-456-7890', address: '456/7 หมู่ 2 ต.บ้านนา อ.เมือง จ.เชียงใหม่ 50000', group: 'Palliative', disease: 'Ca Lung', team: 'ทีม A', adl: 20, visits: 8, lastVisit: '2026-03-26', outcome: 'แย่ลง' },
  { hn: 'HN001237', name: 'นางบุญมา สุขใจ', age: 58, gender: 'หญิง', phone: '084-567-8901', address: '321/5 หมู่ 8 ต.ท่าศาลา อ.เมือง จ.เชียงใหม่ 50000', group: 'NCD', disease: 'DM', team: 'ทีม C', adl: 70, visits: 3, lastVisit: '2026-03-28', outcome: 'ดีขึ้น' },
  { hn: 'HN001238', name: 'นายวิชัย พงษ์สุวรรณ', age: 45, gender: 'ชาย', phone: '085-678-9012', address: '654/9 หมู่ 1 ต.หนองนค อ.เมือง จ.เชียงใหม่ 50000', group: 'Intermediate', disease: 'Fracture Hip', team: 'ทีม B', adl: 45, visits: 5, lastVisit: '2026-03-25', outcome: 'ดีขึ้น' },
  { hn: 'HN001239', name: 'นางสุนีย์ รักษาศรี', age: 70, gender: 'หญิง', phone: '086-789-0123', address: '987/2 หมู่ 4 ต.บายบา อ.เมือง จ.เชียงใหม่ 50000', group: 'LTC', disease: 'HT, CKD', team: 'ทีม A', adl: 40, visits: 4, lastVisit: '2026-03-27', outcome: 'คงที่' },
  { hn: 'HN001240', name: 'นางจันทร์เพ็ญ ดวงแก้ว', age: 32, gender: 'หญิง', phone: '087-890-1234', address: '147/6 หมู่ 7 ต.ในเมือง อ.เมือง จ.เชียงใหม่ 50000', group: 'หญิงตั้งครรภ์', disease: 'ANC', team: 'ทีม C', adl: 95, visits: 2, lastVisit: '2026-03-28', outcome: 'ดีขึ้น' },
  { hn: 'HN001241', name: 'นายสมศักดิ์ แสงจันทร์', age: 68, gender: 'ชาย', phone: '088-901-2345', address: '258/3 หมู่ 6 ต.หนองไผ่ อ.เมือง จ.เชียงใหม่ 50000', group: 'NCD', disease: 'DM, HT', team: 'ทีม B', adl: 60, visits: 3, lastVisit: '2026-03-26', outcome: 'ดีขึ้น' },
  { hn: 'HN001242', name: 'นางปราณี วงค์เทพ', age: 75, gender: 'หญิง', phone: '089-012-3456', address: '369/8 หมู่ 9 ต.บ้านนา อ.เมือง จ.เชียงใหม่ 50000', group: 'Palliative', disease: 'Ca Breast', team: 'ทีม A', adl: 25, visits: 7, lastVisit: '2026-03-25', outcome: 'แย่ลง' },
  { hn: 'HN001243', name: 'นายอำนวย ชัยชนะ', age: 62, gender: 'ชาย', phone: '090-123-4567', address: '741/1 หมู่ 10 ต.ท่าศาลา อ.เมือง จ.เชียงใหม่ 50000', group: 'Intermediate', disease: 'Stroke', team: 'ทีม C', adl: 50, visits: 5, lastVisit: '2026-03-27', outcome: 'คงที่' },
];

// Medication delivery jobs - uses patients from PATIENTS array
export const MED_JOBS = [
  { id: 'JOB001', rx: 'RX20260402001', hn: 'HN001234', assignee: 'สมหญิง รักษ์ชุมชน', status: 'ส่งสำเร็จ', date: '2026-03-27' },
  { id: 'JOB002', rx: 'RX20260402002', hn: 'HN001235', assignee: 'สมหญิง รักษ์ชุมชน', status: 'กำลังนำส่ง', date: '2026-03-27' },
  { id: 'JOB003', rx: 'RX20260402003', hn: 'HN001236', assignee: 'สมหญิง รักษ์ชุมชน', status: 'ส่งไม่สำเร็จ', date: '2026-03-27' },
  { id: 'JOB004', rx: 'RX20260402004', hn: 'HN001237', assignee: 'วิชัย พงษ์สุวรรณ', status: 'รอแพ็กยา', date: '2026-03-27' },
  { id: 'JOB005', rx: 'RX20260402005', hn: 'HN001238', assignee: 'วิชัย พงษ์สุวรรณ', status: 'รับงานแล้ว', date: '2026-03-27' },
  { id: 'JOB006', rx: 'RX20260402006', hn: 'HN001239', assignee: 'สมหญิง รักษ์ชุมชน', status: 'พร้อมรับยา', date: '2026-03-27' },
  { id: 'JOB007', rx: 'RX20260402007', hn: 'HN001240', assignee: 'วิชัย พงษ์สุวรรณ', status: 'รอ Telepharmacy', date: '2026-03-27' },
  { id: 'JOB008', rx: 'RX20260402008', hn: 'HN001241', assignee: 'สมหญิง รักษ์ชุมชน', status: 'รับยาแล้ว', date: '2026-03-27' },
  { id: 'JOB009', rx: 'RX20260402009', hn: 'HN001242', assignee: 'วิชัย พงษ์สุวรรณ', status: 'ส่งสำเร็จ', date: '2026-03-27' },
  { id: 'JOB010', rx: 'RX20260402010', hn: 'HN001243', assignee: 'สมหญิง รักษ์ชุมชน', status: 'ส่งสำเร็จ', date: '2026-03-27' },
];

// Telepharmacy items
export const MED_TELEPHARMACY = [
  { id: 'JOB002', rx: 'RX20260402002', hn: 'HN001235', drugs: 'Metformin 500mg, Glibenclamide 5mg', status: 'รอให้คำแนะนำ', date: '2026-04-02' },
  { id: 'JOB007', rx: 'RX20260402007', hn: 'HN001240', drugs: 'Amlodipine 5mg, Losartan 50mg', status: 'รอให้คำแนะนำ', date: '2026-04-02' },
  { id: 'JOB001', rx: 'RX20260402001', hn: 'HN001234', drugs: 'Metformin 500mg', status: 'ให้คำแนะนำแล้ว', date: '2026-04-01' },
  { id: 'JOB003', rx: 'RX20260402003', hn: 'HN001236', drugs: 'Enalapril 5mg, HCTZ 25mg', status: 'ให้คำแนะนำแล้ว', date: '2026-04-01' },
  { id: 'JOB009', rx: 'RX20260402009', hn: 'HN001242', drugs: 'Simvastatin 20mg', status: 'ให้คำแนะนำแล้ว', date: '2026-03-30' },
  { id: 'JOB006', rx: 'RX20260402006', hn: 'HN001239', drugs: 'Omeprazole 20mg, Domperidone 10mg', status: 'ให้คำแนะนำแล้ว', date: '2026-03-31' },
  { id: 'JOB008', rx: 'RX20260402008', hn: 'HN001241', drugs: 'Aspirin 81mg, Atorvastatin 40mg', status: 'ให้คำแนะนำแล้ว', date: '2026-03-29' },
  { id: 'JOB010', rx: 'RX20260402010', hn: 'HN001243', drugs: 'Metformin 500mg, Glipizide 5mg', status: 'ให้คำแนะนำแล้ว', date: '2026-03-29' },
];

// Home visit schedule - uses patients from PATIENTS array
export const HOME_VISITS = [
  { hn: 'HN001234', visitDate: '2026-04-02', status: 'เยี่ยมแล้ว' },
  { hn: 'HN001235', visitDate: '2026-04-02', status: 'เยี่ยมแล้ว' },
  { hn: 'HN001236', visitDate: '2026-04-02', status: 'รอเยี่ยม' },
  { hn: 'HN001237', visitDate: '2026-04-02', status: 'เยี่ยมแล้ว' },
  { hn: 'HN001238', visitDate: '2026-04-02', status: 'เลื่อนนัด' },
  { hn: 'HN001239', visitDate: '2026-04-02', status: 'เยี่ยมแล้ว' },
  { hn: 'HN001240', visitDate: '2026-04-02', status: 'เยี่ยมแล้ว' },
  { hn: 'HN001241', visitDate: '2026-04-02', status: 'รอเยี่ยม' },
  { hn: 'HN001242', visitDate: '2026-04-02', status: 'เยี่ยมแล้ว' },
  { hn: 'HN001243', visitDate: '2026-04-02', status: 'เยี่ยมแล้ว' },
];

// VitalSign patients - uses subset from PATIENTS
export const VITALSIGN_PATIENTS = [
  { hn: 'HN001234', bp: '145/92', hr: 82, temp: 36.8, spo2: 97, glucose: 142, severity: 65, hospital: 'รพ.สต.ในเมือง' },
  { hn: 'HN001235', bp: '160/100', hr: 78, temp: 37.1, spo2: 95, glucose: 180, severity: 80, hospital: 'รพ.สต.หนองไผ่' },
  { hn: 'HN001236', bp: '130/85', hr: 90, temp: 37.5, spo2: 93, glucose: 220, severity: 90, hospital: 'รพ.สต.บ้านนา' },
  { hn: 'HN001237', bp: '135/88', hr: 76, temp: 36.5, spo2: 98, glucose: 110, severity: 40, hospital: 'รพ.สต.ในเมือง' },
  { hn: 'HN001238', bp: '120/80', hr: 72, temp: 36.6, spo2: 99, glucose: 95, severity: 25, hospital: 'รพ.สต.หนองนค' },
  { hn: 'HN001239', bp: '155/95', hr: 85, temp: 36.9, spo2: 96, glucose: 165, severity: 75, hospital: 'รพ.สต.บายบา' },
  { hn: 'HN001240', bp: '118/75', hr: 80, temp: 36.4, spo2: 99, glucose: 88, severity: 15, hospital: 'รพ.สต.ในเมือง' },
  { hn: 'HN001241', bp: '140/90', hr: 88, temp: 36.7, spo2: 97, glucose: 148, severity: 55, hospital: 'รพ.สต.หนองไผ่' },
  { hn: 'HN001242', bp: '125/82', hr: 70, temp: 37.8, spo2: 94, glucose: 132, severity: 85, hospital: 'รพ.สต.บ้านนา' },
  { hn: 'HN001243', bp: '138/86', hr: 84, temp: 36.6, spo2: 96, glucose: 155, severity: 60, hospital: 'รพ.สต.ท่าศาลา' },
];

// Helper to get patient by HN
export function getPatient(hn) {
  return PATIENTS.find(p => p.hn === hn);
}

// Helper to enrich job/visit data with patient info
export function enrichWithPatient(record) {
  const p = getPatient(record.hn);
  return p ? { ...record, patient: p.name, phone: p.phone, address: p.address, age: p.age, gender: p.gender } : record;
}

// Re-export avatar helpers
export { getAvatar, getStatusBadge } from './avatars';
