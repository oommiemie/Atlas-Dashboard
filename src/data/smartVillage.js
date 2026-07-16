/* ═══════════════════════════════════════════════════════════
   Mock data — Smart Village (ระบบเฝ้าระวังและแจ้งเหตุประจำหมู่บ้าน)
   อิง requirement spec 2026-07-03
   ═══════════════════════════════════════════════════════════ */

export const SV_VILLAGES = [
  {
    id: 'vlg-001', code: 'VLG001',
    name: 'เดอะแกรนด์ วิลล่า ขอนแก่น', type: 'หมู่บ้านจัดสรร',
    province: 'ขอนแก่น', district: 'เมืองขอนแก่น', address: '199 ถ.มิตรภาพ ต.ในเมือง',
    lat: 16.4419, lng: 102.8360, guardPost: { lat: 16.4404, lng: 102.8357 },
    juristic: { name: 'คุณอรทัย แสงมณี (นิติบุคคล)', phone: '084-221-8890' },
    status: 'ใช้งาน', note: 'โครงการนำร่อง เฟส 1',
  },
  {
    id: 'vlg-002', code: 'VLG002',
    name: 'ศุภฤกษ์ การ์เด้นโฮม', type: 'หมู่บ้านจัดสรร',
    province: 'นนทบุรี', district: 'บางบัวทอง', address: '88/8 ถ.บางกรวย-ไทรน้อย',
    lat: 13.9173, lng: 100.4243, guardPost: { lat: 13.9161, lng: 100.4240 },
    juristic: { name: 'คุณธนกร พูลสวัสดิ์', phone: '081-334-7712' },
    status: 'ใช้งาน', note: '',
  },
  {
    id: 'vlg-003', code: 'VLG003',
    name: 'เดอะริเวอร์ เรสซิเดนซ์', type: 'คอนโด/อาคาร',
    province: 'เชียงใหม่', district: 'เมืองเชียงใหม่', address: '45 ถ.เจริญประเทศ ต.ช้างคลาน',
    lat: 18.7756, lng: 98.9986, guardPost: { lat: 18.7749, lng: 98.9980 },
    juristic: { name: 'คุณพิมพ์ลดา วงศ์คำ', phone: '086-990-1123' },
    status: 'ใช้งาน', note: 'ติดตั้งเฉพาะชั้นผู้สูงอายุ (ชั้น 3)',
  },
  {
    id: 'vlg-004', code: 'VLG004',
    name: 'ชุมชนบ้านหนองใหญ่', type: 'ชุมชน',
    province: 'ขอนแก่น', district: 'น้ำพอง', address: 'หมู่ 4 ต.หนองใหญ่',
    lat: 16.7062, lng: 102.8452, guardPost: { lat: 16.7050, lng: 102.8448 },
    juristic: { name: 'ผู้ใหญ่บ้าน สมพงษ์ ทองดี', phone: '087-445-2201' },
    status: 'ใช้งาน', note: 'โครงการร่วมกับ อบต. — ยังไม่มีบัญชี รปภ.',
  },
  {
    id: 'vlg-005', code: 'VLG005',
    name: 'พาราไดซ์ ฮิลล์ พัทยา', type: 'หมู่บ้านจัดสรร',
    province: 'ชลบุรี', district: 'บางละมุง', address: '311 ม.5 ถ.พัทยาเหนือ',
    lat: 12.9581, lng: 100.8930, guardPost: { lat: 12.9570, lng: 100.8926 },
    juristic: { name: 'คุณวีระ ชัยมงคล', phone: '089-112-8845' },
    status: 'ระงับ', note: 'พักบริการชั่วคราว — รอต่อสัญญา',
  },
];

/* residents / contacts / familyLinks ฝังอยู่ในบ้านแต่ละหลัง */
export const SV_HOUSES = [
  {
    id: 'h-101', villageId: 'vlg-001', no: '42/1', nickname: 'บ้านคุณยายสมศรี',
    lat: 16.4427, lng: 102.8372, note: 'ประตูรั้วสีเขียว ตรงข้ามสวนหย่อม',
    houseCode: 'ATLS-7K2M-9QX4',
    residents: [
      { id: 'r-1', name: 'สมศรี ทดสอบ11', age: 78, gender: 'หญิง', note: 'หูตึง มีโรคความดันโลหิตสูง', wearable: false },
      { id: 'r-2', name: 'บุญมี ทดสอบ11', age: 81, gender: 'ชาย', note: 'เดินช้า ใช้ไม้เท้า', wearable: false },
    ],
    contacts: [
      { id: 'c-1', name: 'น้ำฝน ทดสอบ11', relation: 'ลูกสาว', phone: '081-234-5678', note: 'อยู่ กทม. — โทรเบอร์นี้ก่อน' },
      { id: 'c-2', name: 'ต้นกล้า ทดสอบ11', relation: 'หลาน', phone: '062-887-1234', note: 'อยู่ในหมู่บ้าน ซอย 3' },
      { id: 'c-3', name: 'นิติบุคคลหมู่บ้าน', relation: 'นิติบุคคล', phone: '084-221-8890', note: '' },
    ],
    familyLinks: [
      { id: 'fl-1', groupName: 'ครอบครัวทดสอบ***', members: 4, status: 'เชื่อมแล้ว', source: 'ลูกบ้านเชื่อมเอง', date: '12 มิ.ย. 2569' },
      { id: 'fl-2', groupName: 'บ้านทดสอบ***', members: 2, status: 'รออนุมัติ', source: 'ทีมงานเชื่อมให้', date: '2 ก.ค. 2569', expires: 'หมดอายุใน 58 ชม.' },
    ],
  },
  {
    id: 'h-102', villageId: 'vlg-001', no: '42/5', nickname: 'บ้านลุงประเสริฐ',
    lat: 16.4431, lng: 102.8355, note: '',
    houseCode: 'ATLS-3M8W-2ZR7',
    residents: [
      { id: 'r-3', name: 'ประเสริฐ ทดสอบ12', age: 84, gender: 'ชาย', note: 'มีโรคหัวใจ อยู่คนเดียวช่วงกลางวัน', wearable: true },
    ],
    contacts: [
      { id: 'c-4', name: 'มาลี ทดสอบ12', relation: 'ภรรยา', phone: '089-556-7788', note: 'ขายของตลาดเช้า กลับบ่าย' },
      { id: 'c-5', name: 'ประพันธ์ ทดสอบ12', relation: 'ลูกชาย', phone: '081-990-2233', note: '' },
    ],
    familyLinks: [
      { id: 'fl-3', groupName: 'ครอบครัวทดสอบ***', members: 5, status: 'เชื่อมแล้ว', source: 'ลูกบ้านเชื่อมเอง', date: '15 มิ.ย. 2569' },
    ],
  },
  {
    id: 'h-103', villageId: 'vlg-001', no: '17/2', nickname: '',
    lat: 16.4408, lng: 102.8349, note: '',
    houseCode: 'ATLS-9P4T-6KD2',
    residents: [
      { id: 'r-4', name: 'ทองใบ ทดสอบ13', age: 72, gender: 'หญิง', note: 'เบาหวาน ตาเริ่มมองไม่ชัด', wearable: false },
      { id: 'r-5', name: 'อุทัย ทดสอบ13', age: 45, gender: 'ชาย', note: 'ลูกชาย ทำงานกลางคืน', wearable: false },
    ],
    contacts: [
      { id: 'c-6', name: 'อุทัย ทดสอบ13', relation: 'ลูกชาย', phone: '085-443-9911', note: 'อยู่บ้านเดียวกัน' },
    ],
    familyLinks: [],
  },
  {
    id: 'h-104', villageId: 'vlg-001', no: '88/10', nickname: 'บ้านป้าแตงโม',
    lat: 16.4415, lng: 102.8381, note: 'บ้านหัวมุม ใกล้ป้อมยาม 2',
    houseCode: 'ATLS-5R2X-8WM3',
    residents: [
      { id: 'r-6', name: 'แตงโม ทดสอบ14', age: 69, gender: 'หญิง', note: 'แข็งแรงดี แต่เคยล้มในห้องน้ำปีที่แล้ว', wearable: false },
    ],
    contacts: [],
    familyLinks: [
      { id: 'fl-4', groupName: 'บ้านทดสอบ***', members: 3, status: 'เชื่อมแล้ว', source: 'ทีมงานเชื่อมให้', date: '20 มิ.ย. 2569' },
    ],
  },
  {
    id: 'h-105', villageId: 'vlg-001', no: '9/3', nickname: '',
    lat: 16.4422, lng: 102.8340, note: '',
    houseCode: 'ATLS-2H7N-4QF9',
    residents: [],
    contacts: [
      { id: 'c-7', name: 'สายใจ มีสุข', relation: 'เจ้าของบ้าน', phone: '081-777-8899', note: '' },
    ],
    familyLinks: [
      { id: 'fl-5', groupName: 'ครอบครัวทดสอบ***', members: 2, status: 'เชื่อมแล้ว', source: 'ลูกบ้านเชื่อมเอง', date: '28 มิ.ย. 2569' },
    ],
  },
  {
    id: 'h-106', villageId: 'vlg-001', no: '55/7', nickname: 'บ้านครูวิชัย',
    lat: 16.4412, lng: 102.8367, note: '',
    houseCode: 'ATLS-6D3V-1PL8',
    residents: [
      { id: 'r-7', name: 'วิชัย ทดสอบ15', age: 75, gender: 'ชาย', note: 'ข้าราชการเกษียณ มีโรคพาร์กินสันระยะแรก', wearable: false },
    ],
    contacts: [
      { id: 'c-8', name: 'วิภา ทดสอบ15', relation: 'ลูกสาว', phone: '086-234-1100', note: '' },
    ],
    familyLinks: [
      { id: 'fl-6', groupName: 'ครอบครัวทดสอบ***', members: 6, status: 'เชื่อมแล้ว', source: 'ลูกบ้านเชื่อมเอง', date: '10 มิ.ย. 2569' },
    ],
  },
  /* ── หมู่บ้านอื่น (ข้อมูลย่อ) ── */
  {
    id: 'h-201', villageId: 'vlg-002', no: '12/4', nickname: 'บ้านยายทองสุข',
    lat: 13.9180, lng: 100.4251, note: '', houseCode: 'ATLS-8B2K-5TN6',
    residents: [{ id: 'r-8', name: 'ทองสุข ทดสอบ16', age: 80, gender: 'หญิง', note: 'อยู่คนเดียว ลูกหลานมาเสาร์-อาทิตย์', wearable: false }],
    contacts: [{ id: 'c-9', name: 'สุรีย์ ทดสอบ16', relation: 'ลูกสาว', phone: '081-445-6677', note: '' }],
    familyLinks: [{ id: 'fl-7', groupName: 'ครอบครัวทดสอบ***', members: 4, status: 'เชื่อมแล้ว', source: 'ลูกบ้านเชื่อมเอง', date: '18 มิ.ย. 2569' }],
  },
  {
    id: 'h-202', villageId: 'vlg-002', no: '25/1', nickname: '',
    lat: 13.9169, lng: 100.4237, note: '', houseCode: 'ATLS-4W9M-7RC2',
    residents: [{ id: 'r-9', name: 'จำรัส ทดสอบ17', age: 77, gender: 'ชาย', note: 'หลังผ่าตัดสะโพก เดินด้วย walker', wearable: false }],
    contacts: [{ id: 'c-10', name: 'จินดา ทดสอบ17', relation: 'ภรรยา', phone: '089-223-4455', note: '' }],
    familyLinks: [],
  },
  {
    id: 'h-203', villageId: 'vlg-002', no: '30/9', nickname: 'บ้านหมอเกษม',
    lat: 13.9177, lng: 100.4260, note: '', houseCode: 'ATLS-1F6H-3XD8',
    residents: [{ id: 'r-10', name: 'เกษม ทดสอบ18', age: 82, gender: 'ชาย', note: 'หมอเกษียณ มีภาวะหัวใจเต้นผิดจังหวะ', wearable: true }],
    contacts: [{ id: 'c-11', name: 'กันยา ทดสอบ18', relation: 'ลูกสาว', phone: '086-778-9900', note: '' }],
    familyLinks: [{ id: 'fl-8', groupName: 'บ้านทดสอบ***', members: 3, status: 'เชื่อมแล้ว', source: 'ลูกบ้านเชื่อมเอง', date: '22 มิ.ย. 2569' }],
  },
  {
    id: 'h-204', villageId: 'vlg-002', no: '7/7', nickname: '',
    lat: 13.9165, lng: 100.4248, note: '', houseCode: 'ATLS-7C4J-9VB1',
    residents: [],
    contacts: [],
    familyLinks: [],
  },
  {
    id: 'h-301', villageId: 'vlg-003', no: '304', nickname: 'ห้องคุณยายบัวคำ',
    lat: 18.7758, lng: 98.9989, note: 'ชั้น 3 ปีกตะวันออก', houseCode: 'ATLS-3T8Q-2GK5',
    residents: [{ id: 'r-11', name: 'บัวคำ ทดสอบ19', age: 86, gender: 'หญิง', note: 'ติดเตียงบางช่วง มีผู้ดูแลมาเช้า-เย็น', wearable: false }],
    contacts: [{ id: 'c-12', name: 'พิมพ์ลดา วงศ์คำ', relation: 'หลาน', phone: '086-990-1123', note: '' }],
    familyLinks: [{ id: 'fl-9', groupName: 'ครอบครัวทดสอบ***', members: 5, status: 'เชื่อมแล้ว', source: 'ทีมงานเชื่อมให้', date: '25 มิ.ย. 2569' }],
  },
  {
    id: 'h-302', villageId: 'vlg-003', no: '312', nickname: '',
    lat: 18.7754, lng: 98.9982, note: 'ชั้น 3 ปีกตะวันตก', houseCode: 'ATLS-6M1Z-8SW4',
    residents: [{ id: 'r-12', name: 'คำปัน ทดสอบ20', age: 79, gender: 'ชาย', note: 'หูตึงมาก ต้องกดกริ่งค้าง', wearable: false }],
    contacts: [{ id: 'c-13', name: 'ดวงใจ ทดสอบ20', relation: 'ลูกสาว', phone: '084-556-7712', note: '' }],
    familyLinks: [],
  },
  {
    id: 'h-303', villageId: 'vlg-003', no: '318', nickname: '',
    lat: 18.7752, lng: 98.9992, note: '', houseCode: 'ATLS-9K5D-4HN7',
    residents: [],
    contacts: [{ id: 'c-14', name: 'นิติบุคคลอาคาร', relation: 'นิติบุคคล', phone: '053-812-334', note: '' }],
    familyLinks: [],
  },
  {
    id: 'h-401', villageId: 'vlg-004', no: '112', nickname: 'บ้านยายคำ',
    lat: 16.7068, lng: 102.8458, note: 'ข้างวัดหนองใหญ่', houseCode: 'ATLS-2V7B-6JM9',
    residents: [{ id: 'r-13', name: 'คำ ทดสอบ21', age: 88, gender: 'หญิง', note: 'อสม.แวะดูทุกเช้า', wearable: false }],
    contacts: [{ id: 'c-15', name: 'บุญช่วย ทดสอบ21', relation: 'ลูกชาย', phone: '087-334-5566', note: 'อยู่หมู่บ้านเดียวกัน' }],
    familyLinks: [{ id: 'fl-10', groupName: 'ครอบครัวทดสอบ***', members: 2, status: 'เชื่อมแล้ว', source: 'ทีมงานเชื่อมให้', date: '30 มิ.ย. 2569' }],
  },
  {
    id: 'h-402', villageId: 'vlg-004', no: '89', nickname: '',
    lat: 16.7055, lng: 102.8447, note: '', houseCode: 'ATLS-5N3G-1FT8',
    residents: [{ id: 'r-14', name: 'สี ทดสอบ22', age: 74, gender: 'หญิง', note: '', wearable: false }],
    contacts: [],
    familyLinks: [],
  },
  {
    id: 'h-501', villageId: 'vlg-005', no: '66/2', nickname: '',
    lat: 12.9585, lng: 100.8938, note: '', houseCode: 'ATLS-8Q2W-5YU3',
    residents: [{ id: 'r-15', name: 'อนงค์ ทดสอบ23', age: 71, gender: 'หญิง', note: '', wearable: false }],
    contacts: [{ id: 'c-16', name: 'วีระ ชัยมงคล', relation: 'นิติบุคคล', phone: '089-112-8845', note: '' }],
    familyLinks: [],
  },
];

export const SV_DEVICES = [
  /* vlg-001 */
  { id: 'dev-01', imei: '861230051234671', type: 'radar', typeName: 'เรดาร์ตรวจล้ม RT-W03', villageId: 'vlg-001', houseId: 'h-101', attach: { kind: 'house', location: 'ห้องนอน' }, online: true, presence: 'มีคน', lastSeen: 'เมื่อสักครู่', installedAt: '10 มิ.ย. 2569' },
  { id: 'dev-02', imei: '861230051234689', type: 'radar', typeName: 'เรดาร์ตรวจล้ม RT-W03', villageId: 'vlg-001', houseId: 'h-101', attach: { kind: 'house', location: 'ห้องน้ำ' }, online: true, presence: 'ไม่มีคน', lastSeen: 'เมื่อสักครู่', installedAt: '10 มิ.ย. 2569' },
  { id: 'dev-03', imei: '861230051234702', type: 'radar', typeName: 'เรดาร์ตรวจล้ม RT-W03', villageId: 'vlg-001', houseId: 'h-102', attach: { kind: 'house', location: 'ห้องนั่งเล่น' }, online: true, presence: 'มีคน', lastSeen: '1 นาทีที่แล้ว', installedAt: '11 มิ.ย. 2569' },
  { id: 'dev-04', imei: '861230058800154', type: 'sos', typeName: 'ปุ่ม SOS พกพา', villageId: 'vlg-001', houseId: 'h-102', attach: { kind: 'person', residentId: 'r-3', residentName: 'ประเสริฐ ทดสอบ12' }, online: true, presence: null, lastSeen: '5 นาทีที่แล้ว', installedAt: '11 มิ.ย. 2569' },
  { id: 'dev-05', imei: '861230051234718', type: 'radar', typeName: 'เรดาร์ตรวจล้ม RT-W03', villageId: 'vlg-001', houseId: 'h-103', attach: { kind: 'house', location: 'ห้องนอน' }, online: false, presence: null, lastSeen: '14 ชม.ที่แล้ว', installedAt: '12 มิ.ย. 2569' },
  { id: 'dev-06', imei: '861230051234733', type: 'radar', typeName: 'เรดาร์ตรวจล้ม RT-W03', villageId: 'vlg-001', houseId: 'h-104', attach: { kind: 'house', location: 'ห้องน้ำ' }, online: true, presence: 'มีคน', lastSeen: 'เมื่อสักครู่', installedAt: '18 มิ.ย. 2569' },
  { id: 'dev-07', imei: '861230051234749', type: 'radar', typeName: 'เรดาร์ตรวจล้ม RT-W03', villageId: 'vlg-001', houseId: 'h-105', attach: { kind: 'house', location: 'ห้องนอน' }, online: true, presence: 'ไม่มีคน', lastSeen: '2 นาทีที่แล้ว', installedAt: '28 มิ.ย. 2569' },
  { id: 'dev-08', imei: '861230051234755', type: 'radar', typeName: 'เรดาร์ตรวจล้ม RT-W03', villageId: 'vlg-001', houseId: 'h-106', attach: { kind: 'house', location: 'ห้องนอน' }, online: true, presence: 'มีคน', lastSeen: 'เมื่อสักครู่', installedAt: '10 มิ.ย. 2569' },
  /* vlg-002 */
  { id: 'dev-09', imei: '861230051235001', type: 'radar', typeName: 'เรดาร์ตรวจล้ม RT-W03', villageId: 'vlg-002', houseId: 'h-201', attach: { kind: 'house', location: 'ห้องนอน' }, online: true, presence: 'มีคน', lastSeen: 'เมื่อสักครู่', installedAt: '18 มิ.ย. 2569' },
  { id: 'dev-10', imei: '861230051235018', type: 'radar', typeName: 'เรดาร์ตรวจล้ม RT-W03', villageId: 'vlg-002', houseId: 'h-202', attach: { kind: 'house', location: 'ห้องน้ำ' }, online: true, presence: 'ไม่มีคน', lastSeen: '3 นาทีที่แล้ว', installedAt: '19 มิ.ย. 2569' },
  { id: 'dev-11', imei: '861230058800233', type: 'sos', typeName: 'ปุ่ม SOS พกพา', villageId: 'vlg-002', houseId: 'h-203', attach: { kind: 'person', residentId: 'r-10', residentName: 'เกษม ทดสอบ18' }, online: true, presence: null, lastSeen: '8 นาทีที่แล้ว', installedAt: '22 มิ.ย. 2569' },
  { id: 'dev-12', imei: '861230051235033', type: 'radar', typeName: 'เรดาร์ตรวจล้ม RT-W03', villageId: 'vlg-002', houseId: 'h-203', attach: { kind: 'house', location: 'ห้องนอน' }, online: true, presence: 'มีคน', lastSeen: 'เมื่อสักครู่', installedAt: '22 มิ.ย. 2569' },
  /* vlg-003 */
  { id: 'dev-13', imei: '861230051236107', type: 'radar', typeName: 'เรดาร์ตรวจล้ม RT-W03', villageId: 'vlg-003', houseId: 'h-301', attach: { kind: 'house', location: 'ห้องนอน' }, online: true, presence: 'มีคน', lastSeen: 'เมื่อสักครู่', installedAt: '25 มิ.ย. 2569' },
  { id: 'dev-14', imei: '861230051236115', type: 'radar', typeName: 'เรดาร์ตรวจล้ม RT-W03', villageId: 'vlg-003', houseId: 'h-302', attach: { kind: 'house', location: 'ห้องนอน' }, online: false, presence: null, lastSeen: '26 ชม.ที่แล้ว', installedAt: '25 มิ.ย. 2569' },
  { id: 'dev-15', imei: '861230051236122', type: 'radar', typeName: 'เรดาร์ตรวจล้ม RT-W03', villageId: 'vlg-003', houseId: 'h-303', attach: { kind: 'house', location: 'ห้องน้ำ' }, online: false, presence: null, lastSeen: '26 ชม.ที่แล้ว', installedAt: '26 มิ.ย. 2569' },
  /* vlg-004 */
  { id: 'dev-16', imei: '861230051237204', type: 'radar', typeName: 'เรดาร์ตรวจล้ม RT-W03', villageId: 'vlg-004', houseId: 'h-401', attach: { kind: 'house', location: 'ห้องนอน' }, online: true, presence: 'ไม่มีคน', lastSeen: '1 นาทีที่แล้ว', installedAt: '30 มิ.ย. 2569' },
  /* vlg-005 */
  { id: 'dev-17', imei: '861230051238311', type: 'radar', typeName: 'เรดาร์ตรวจล้ม RT-W03', villageId: 'vlg-005', houseId: 'h-501', attach: { kind: 'house', location: 'ห้องนอน' }, online: false, presence: null, lastSeen: '5 วันที่แล้ว', installedAt: '2 มิ.ย. 2569' },
];

export const SV_GUARDS = [
  { id: 'g-1', villageId: 'vlg-001', name: 'สมศักดิ์ เข้มแข็ง', username: 'vlg001-somsak', phone: '082-334-5511', status: 'ใช้งาน', lastLogin: 'วันนี้ 07:02', shift: 'กะเช้า' },
  { id: 'g-2', villageId: 'vlg-001', name: 'สมหมาย กล้าหาญ', username: 'vlg001-sommai', phone: '083-445-6622', status: 'ใช้งาน', lastLogin: 'เมื่อวาน 19:05', shift: 'กะดึก' },
  { id: 'g-3', villageId: 'vlg-002', name: 'วิรัตน์ มั่นคง', username: 'vlg002-wirat', phone: '084-556-7733', status: 'ใช้งาน', lastLogin: 'วันนี้ 06:55', shift: 'กะเช้า' },
  { id: 'g-4', villageId: 'vlg-003', name: 'ประยุทธ ยืนยง', username: 'vlg003-prayut', phone: '085-667-8844', status: 'ระงับ', lastLogin: '25 มิ.ย. 2569', shift: 'กะเช้า' },
  { id: 'g-5', villageId: 'vlg-005', name: 'ชาญ รักษาดี', username: 'vlg005-chan', phone: '086-778-9955', status: 'ระงับ', lastLogin: '1 มิ.ย. 2569', shift: 'กะเช้า' },
];

/* วงจรเหตุ: ใหม่ → รับทราบแล้ว → ปิดแล้ว (ผล: ช่วยเหลือแล้ว / แจ้งเตือนผิดพลาด / เหตุทดสอบ) */
export const SV_ALERTS = [
  {
    id: 'al-000', no: 'AC-260703-003', villageId: 'vlg-001', houseId: 'h-104', deviceId: 'dev-06',
    date: 'วันนี้', time: '09:43', minAgo: 1, status: 'ใหม่',
    detectType: 'ตรวจพบการล้ม', location: 'ห้องน้ำ', recovered: false,
  },
  {
    id: 'al-001', no: 'AC-260703-002', villageId: 'vlg-001', houseId: 'h-101', deviceId: 'dev-01',
    date: 'วันนี้', time: '09:41', minAgo: 3, status: 'ใหม่',
    detectType: 'ตรวจพบการล้ม', location: 'ห้องนอน', recovered: false,
  },
  {
    id: 'al-002', no: 'AC-260703-001', villageId: 'vlg-002', houseId: 'h-201', deviceId: 'dev-09',
    date: 'วันนี้', time: '08:12', minAgo: 92, status: 'รับทราบแล้ว',
    detectType: 'ตรวจพบการล้ม', location: 'ห้องนอน', recovered: true,
    ackBy: 'วิรัตน์ มั่นคง (รปภ.)', ackAt: '08:14',
  },
  {
    id: 'al-003', no: 'AC-260701-001', villageId: 'vlg-001', houseId: 'h-106', deviceId: 'dev-08',
    date: '1 ก.ค. 2569', time: '22:47', status: 'ปิดแล้ว',
    detectType: 'ตรวจพบการล้ม', location: 'ห้องนอน', recovered: false,
    ackBy: 'สมหมาย กล้าหาญ (รปภ.)', ackAt: '22:48', closedBy: 'สมหมาย กล้าหาญ (รปภ.)', closedAt: '23:10',
    result: 'ช่วยเหลือแล้ว', note: 'ครูวิชัยลื่นข้างเตียง ญาติ+รปภ.ช่วยพยุง เรียก EMS ตรวจ ปลอดภัยดี',
  },
  {
    id: 'al-004', no: 'AC-260628-001', villageId: 'vlg-002', houseId: 'h-203', deviceId: 'dev-11',
    date: '28 มิ.ย. 2569', time: '14:20', status: 'ปิดแล้ว',
    detectType: 'กดปุ่ม SOS', location: 'ติดตัว — เกษม ทดสอบ18', recovered: false,
    ackBy: 'วิรัตน์ มั่นคง (รปภ.)', ackAt: '14:21', closedBy: 'Central (สมชาย ใจดี)', closedAt: '14:38',
    result: 'ช่วยเหลือแล้ว', note: 'ใจสั่น เวียนหัว — ประสานลูกสาวพาส่ง รพ.',
  },
  {
    id: 'al-005', no: 'AC-260626-002', villageId: 'vlg-001', houseId: 'h-104', deviceId: 'dev-06',
    date: '26 มิ.ย. 2569', time: '06:03', status: 'ปิดแล้ว',
    detectType: 'ตรวจพบการล้ม', location: 'ห้องน้ำ', recovered: true,
    ackBy: 'สมศักดิ์ เข้มแข็ง (รปภ.)', ackAt: '06:05', closedBy: 'สมศักดิ์ เข้มแข็ง (รปภ.)', closedAt: '06:15',
    result: 'แจ้งเตือนผิดพลาด', note: 'ป้าแตงโมนั่งยองซักผ้านานจนเครื่องแจ้ง — ตรวจแล้วปกติดี',
  },
  {
    id: 'al-006', no: 'AC-260626-001', villageId: 'vlg-003', houseId: 'h-301', deviceId: 'dev-13',
    date: '26 มิ.ย. 2569', time: '11:32', status: 'ปิดแล้ว',
    detectType: 'ตรวจพบการล้ม', location: 'ห้องนอน', recovered: false,
    ackBy: 'Central (สมชาย ใจดี)', ackAt: '11:35', closedBy: 'Central (สมชาย ใจดี)', closedAt: '11:36',
    result: 'เหตุทดสอบ', note: 'ทดสอบหลังติดตั้ง — โหมดทดสอบเหตุ',
  },
  {
    id: 'al-007', no: 'AC-260618-001', villageId: 'vlg-002', houseId: 'h-201', deviceId: 'dev-09',
    date: '18 มิ.ย. 2569', time: '16:44', status: 'ปิดแล้ว',
    detectType: 'ตรวจพบการล้ม', location: 'ห้องนอน', recovered: false,
    ackBy: 'วิรัตน์ มั่นคง (รปภ.)', ackAt: '16:45', closedBy: 'วิรัตน์ มั่นคง (รปภ.)', closedAt: '16:50',
    result: 'เหตุทดสอบ', note: 'ทดสอบหลังติดตั้งเสร็จ',
  },
  {
    id: 'al-008', no: 'AC-260612-001', villageId: 'vlg-001', houseId: 'h-101', deviceId: 'dev-02',
    date: '12 มิ.ย. 2569', time: '05:18', status: 'ปิดแล้ว',
    detectType: 'ตรวจพบการล้ม', location: 'ห้องน้ำ', recovered: false,
    ackBy: 'สมศักดิ์ เข้มแข็ง (รปภ.)', ackAt: '05:20', closedBy: 'สมศักดิ์ เข้มแข็ง (รปภ.)', closedAt: '05:41',
    result: 'ช่วยเหลือแล้ว', note: 'ยายสมศรีล้มในห้องน้ำ ฟกช้ำเล็กน้อย แจ้งลูกสาวแล้ว',
  },
];

/* ═══ Helpers ═══ */
export const getVillage = (id) => SV_VILLAGES.find(v => v.id === id);
export const getHouse = (id) => SV_HOUSES.find(h => h.id === id);
export const getDevice = (id) => SV_DEVICES.find(d => d.id === id);
export const housesOf = (villageId) => SV_HOUSES.filter(h => h.villageId === villageId);
export const devicesOfVillage = (villageId) => SV_DEVICES.filter(d => d.villageId === villageId);
export const devicesOfHouse = (houseId) => SV_DEVICES.filter(d => d.houseId === houseId);
export const guardsOf = (villageId) => SV_GUARDS.filter(g => g.villageId === villageId);
export const alertsOfVillage = (villageId) => SV_ALERTS.filter(a => a.villageId === villageId);
export const alertsOfHouse = (houseId) => SV_ALERTS.filter(a => a.houseId === houseId);
export const activeAlerts = () => SV_ALERTS.filter(a => a.status !== 'ปิดแล้ว');

export function villageStats(villageId) {
  const houses = housesOf(villageId);
  const devices = devicesOfVillage(villageId);
  return {
    houses: houses.length,
    installedHouses: houses.filter(h => devicesOfHouse(h.id).length > 0).length,
    devices: devices.length,
    online: devices.filter(d => d.online).length,
    offline: devices.filter(d => !d.online).length,
    guards: guardsOf(villageId).filter(g => g.status === 'ใช้งาน').length,
    alerts30d: alertsOfVillage(villageId).length,
  };
}

/* สถานะรวมของหมู่บ้าน — ใช้กำหนดสีหมุดบนแผนที่ */
export function villageStatus(villageId) {
  const v = getVillage(villageId);
  if (v.status === 'ระงับ') return 'suspended';
  if (activeAlerts().some(a => a.villageId === villageId)) return 'alert';
  if (devicesOfVillage(villageId).some(d => !d.online)) return 'offline';
  return 'ok';
}

export const SV_STATUS_META = {
  alert: { color: '#FF383C', label: 'มีเหตุ active' },
  offline: { color: '#E8802A', label: 'มีอุปกรณ์ offline' },
  ok: { color: '#34C759', label: 'ปกติ' },
  suspended: { color: '#9291A5', label: 'ระงับ' },
};

/* รายการที่ต้องตามงาน (attention list) */
export function buildAttention() {
  const items = [];
  SV_DEVICES.filter(d => !d.online && getVillage(d.villageId).status !== 'ระงับ').forEach(d => {
    const h = getHouse(d.houseId);
    items.push({
      kind: 'offline', icon: '📡', severity: 'warn',
      title: `อุปกรณ์ offline — บ้าน ${h.no} (${getVillage(d.villageId).name})`,
      sub: `${d.typeName} · หายไป ${d.lastSeen}`,
      villageId: d.villageId, houseId: d.houseId,
    });
  });
  SV_HOUSES.filter(h => h.familyLinks.filter(f => f.status === 'เชื่อมแล้ว').length === 0 && getVillage(h.villageId).status !== 'ระงับ').forEach(h => {
    items.push({
      kind: 'nofamily', icon: '🔗', severity: 'info',
      title: `ยังไม่เชื่อม Family — บ้าน ${h.no} (${getVillage(h.villageId).name})`,
      sub: 'ครอบครัวจะไม่ได้รับแจ้งเตือนเมื่อเกิดเหตุ',
      villageId: h.villageId, houseId: h.id,
    });
  });
  SV_HOUSES.filter(h => h.contacts.length === 0 && getVillage(h.villageId).status !== 'ระงับ').forEach(h => {
    items.push({
      kind: 'nocontact', icon: '📞', severity: 'warn',
      title: `ไม่มีผู้ติดต่อ — บ้าน ${h.no} (${getVillage(h.villageId).name})`,
      sub: 'เมื่อเกิดเหตุ รปภ. จะไม่รู้ว่าต้องโทรหาใคร',
      villageId: h.villageId, houseId: h.id,
    });
  });
  SV_VILLAGES.filter(v => v.status !== 'ระงับ' && guardsOf(v.id).filter(g => g.status === 'ใช้งาน').length === 0).forEach(v => {
    items.push({
      kind: 'noguard', icon: '🛡️', severity: 'warn',
      title: `ไม่มีบัญชี รปภ. — ${v.name}`,
      sub: 'หมู่บ้านนี้ไม่มีคนเฝ้าเหตุ',
      villageId: v.id,
    });
  });
  const order = { warn: 0, info: 1 };
  return items.sort((a, b) => order[a.severity] - order[b.severity]);
}

export const ALERT_RESULT_META = {
  'ช่วยเหลือแล้ว': { color: '#34C759', bg: 'rgba(52,199,89,0.12)' },
  'แจ้งเตือนผิดพลาด': { color: '#E8802A', bg: 'rgba(232,128,42,0.12)' },
  'เหตุทดสอบ': { color: '#1398D8', bg: 'rgba(19,152,216,0.12)' },
};

export const ALERT_STATUS_META = {
  'ใหม่': { color: '#FF383C', bg: 'rgba(255,56,60,0.12)' },
  'รับทราบแล้ว': { color: '#E8802A', bg: 'rgba(232,128,42,0.12)' },
  'ปิดแล้ว': { color: '#615E83', bg: 'rgba(97,94,131,0.1)' },
};
