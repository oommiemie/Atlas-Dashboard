/* ═══ VITAL SIGN PAGE — Mock Data (Figma node 18-841) ═══ */

export const VS_STATS = {
  totalPatients: 200,
  todayMeasurements: 190,
  critical: 25,
  abnormalCases: 50,
  measurementRate: '15%',
};

export const VS_SUMMARY_CHART = [
  { label: 'ม.ค.', systolic: 140, diastolic: 85, hr: 78, temp: 36.5 },
  { label: 'ก.พ.', systolic: 135, diastolic: 82, hr: 75, temp: 36.6 },
  { label: 'มี.ค.', systolic: 145, diastolic: 88, hr: 80, temp: 36.4 },
  { label: 'เม.ย.', systolic: 138, diastolic: 84, hr: 76, temp: 36.7 },
  { label: 'พ.ค.', systolic: 142, diastolic: 86, hr: 82, temp: 36.5 },
  { label: 'มิ.ย.', systolic: 130, diastolic: 80, hr: 74, temp: 36.8 },
];

export const VS_ANALYSIS = {
  abnormal: 20,
  normal: 70,
};

export const VS_YEARLY_COMPARISON = [
  { month: 'ม.ค.', thisYear: 45, lastYear: 38 },
  { month: 'ก.พ.', thisYear: 52, lastYear: 42 },
  { month: 'มี.ค.', thisYear: 48, lastYear: 35 },
  { month: 'เม.ย.', thisYear: 60, lastYear: 45 },
  { month: 'พ.ค.', thisYear: 55, lastYear: 40 },
  { month: 'มิ.ย.', thisYear: 50, lastYear: 43 },
  { month: 'ก.ค.', thisYear: 58, lastYear: 48 },
  { month: 'ส.ค.', thisYear: 62, lastYear: 50 },
];

export const VS_MAP_PATIENTS = [
  { name: 'กรุงเทพมหานคร', lat: 13.7563, lng: 100.5018, normal: 120, abnormal: 15 },
  { name: 'สกลนคร', lat: 17.1545, lng: 104.1348, normal: 80, abnormal: 10 },
  { name: 'เชียงใหม่', lat: 18.7883, lng: 98.9853, normal: 45, abnormal: 8 },
  { name: 'ขอนแก่น', lat: 16.4322, lng: 102.8236, normal: 38, abnormal: 6 },
  { name: 'นครราชสีมา', lat: 14.9799, lng: 102.0978, normal: 30, abnormal: 5 },
  { name: 'สุราษฎร์ธานี', lat: 9.1382, lng: 99.3217, normal: 25, abnormal: 4 },
  { name: 'ชลบุรี', lat: 13.3611, lng: 100.9847, normal: 20, abnormal: 3 },
  { name: 'ภูเก็ต', lat: 7.8804, lng: 98.3923, normal: 15, abnormal: 2 },
];

export const VS_TOP_PATIENTS = [
  { rank: 1, name: 'คุณทดลอง ทดสอบ', hospital: 'รพ.ทดสอบ BMS', status: 'critical', value: 'BP 180/110' },
  { rank: 2, name: 'คุณทดลอง ทดสอบ', hospital: 'รพ.ทดสอบ BMS', status: 'critical', value: 'BP 175/105' },
  { rank: 3, name: 'คุณทดลอง ทดสอบ', hospital: 'รพ.ทดสอบ BMS', status: 'abnormal', value: 'BP 160/95' },
  { rank: 4, name: 'คุณทดลอง ทดสอบ', hospital: 'รพ.ทดสอบ BMS', status: 'abnormal', value: 'HR 110 bpm' },
  { rank: 5, name: 'คุณทดลอง ทดสอบ', hospital: 'รพ.ทดสอบ BMS', status: 'abnormal', value: 'Temp 38.5°C' },
  { rank: 6, name: 'คุณทดลอง ทดสอบ', hospital: 'รพ.ทดสอบ BMS', status: 'abnormal', value: 'BP 155/92' },
  { rank: 7, name: 'คุณทดลอง ทดสอบ', hospital: 'รพ.ทดสอบ BMS', status: 'warning', value: 'HR 95 bpm' },
  { rank: 8, name: 'คุณทดลอง ทดสอบ', hospital: 'รพ.ทดสอบ BMS', status: 'warning', value: 'BP 145/88' },
  { rank: 9, name: 'คุณทดลอง ทดสอบ', hospital: 'รพ.ทดสอบ BMS', status: 'warning', value: 'Temp 37.8°C' },
  { rank: 10, name: 'คุณทดลอง ทดสอบ', hospital: 'รพ.ทดสอบ BMS', status: 'normal', value: 'BP 120/80' },
];

export const VS_TABLE_PATIENTS = Array.from({ length: 15 }, (_, i) => ({
  id: i + 1,
  name: 'คุณทดลอง ทดสอบ',
  hospital: 'รพ.ทดสอบ BMS',
  bp: '120/80',
  hr: '72',
  temp: '36.5',
  o2: '98%',
  status: i < 3 ? 'critical' : i < 7 ? 'abnormal' : 'normal',
  time: '2 นาทีที่แล้ว',
}));
