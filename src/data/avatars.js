// Avatar system - เลือกภาพตามอายุ + เพศ
import earlyChildM from '../assets/avatars/early-child-m.png';
import earlyChildF from '../assets/avatars/early-child-f.png';
import schoolAgeM from '../assets/avatars/school-age-m.png';
import schoolAgeF from '../assets/avatars/school-age-f.png';
import adolescentM from '../assets/avatars/Adolescen.m.png';
import adolescentF from '../assets/avatars/Adolescent.f.png';
import workingM from '../assets/avatars/WorkingAge.m.png';
import workingF from '../assets/avatars/WorkingAge.f.png';
import elderlyM from '../assets/avatars/Elderly.m.png';
import elderlyF from '../assets/avatars/Elderly.f.png';

const AVATARS = {
  earlyChild: { m: earlyChildM, f: earlyChildF },   // 0-5
  schoolAge:  { m: schoolAgeM,  f: schoolAgeF },     // 5-14
  adolescent: { m: adolescentM, f: adolescentF },     // 15-21
  working:    { m: workingM,    f: workingF },         // 15-59
  elderly:    { m: elderlyM,    f: elderlyF },         // 60+
};

/**
 * เลือก avatar ตามอายุและเพศ
 * @param {number} age - อายุ
 * @param {string} gender - 'ชาย' | 'หญิง' | 'male' | 'female'
 * @returns {string} - image path
 */
export function getAvatar(age, gender) {
  const isMale = gender === 'ชาย' || gender === 'male' || gender === 'm';
  const g = isMale ? 'm' : 'f';

  if (age <= 5) return AVATARS.earlyChild[g];
  if (age <= 14) return AVATARS.schoolAge[g];
  if (age <= 21) return AVATARS.adolescent[g];
  if (age <= 59) return AVATARS.working[g];
  return AVATARS.elderly[g];
}

// Export individual avatars for direct use
export {
  earlyChildM, earlyChildF,
  schoolAgeM, schoolAgeF,
  adolescentM, adolescentF,
  workingM, workingF,
  elderlyM, elderlyF,
};

// Default fallback
export const defaultMale = workingM;
export const defaultFemale = workingF;

/**
 * สี status badge ตามความรุนแรง
 * @param {string} status - 'normal'|'abnormal'|'critical'|'ปกติ'|'ผิดปกติ'|'วิกฤต' หรือ severity number
 * @returns {{ color, bg, label, dotBg }}
 */
export function getStatusBadge(status) {
  const s = typeof status === 'number'
    ? (status >= 80 ? 'critical' : status >= 50 ? 'abnormal' : 'normal')
    : status;
  switch (s) {
    case 'critical': case 'วิกฤต':
      return { color: '#FF383C', bg: 'linear-gradient(90deg, rgba(255,56,60,0.2), rgba(255,56,60,0.2)), linear-gradient(90deg, #fff, #fff)', label: 'ผิดปกติ', dotBg: 'linear-gradient(135deg, #E8432A, #D0381A)' };
    case 'abnormal': case 'ผิดปกติ': case 'เฝ้าระวัง':
      return { color: '#FF383C', bg: 'linear-gradient(90deg, rgba(255,56,60,0.2), rgba(255,56,60,0.2)), linear-gradient(90deg, #fff, #fff)', label: 'ผิดปกติ', dotBg: 'linear-gradient(135deg, #E8432A, #D0381A)' };
    default:
      return { color: '#34C759', bg: 'linear-gradient(90deg, rgba(52,199,89,0.2), rgba(52,199,89,0.2)), linear-gradient(90deg, #fff, #fff)', label: 'ปกติ', dotBg: 'linear-gradient(135deg, #34C759, #15B03C)' };
  }
}
