// 화면은 '아침 8:00' 같은 한글 라벨로 복용 시간을 다루고, 서버는 '08:00' 문자열을 쓴다.
// 두 표현을 오가는 변환을 여기 모아둔다.

const PRESET_TO_TIME = {
  '아침 8:00': '08:00',
  '점심 12:00': '12:00',
  '저녁 6:00': '18:00',
  '취침전 10:00': '22:00',
};

const TIME_TO_PRESET = Object.fromEntries(
  Object.entries(PRESET_TO_TIME).map(([label, time]) => [time, label]),
);

// '아침 8:00' | '오후 2:30' -> '08:00'. 형식을 못 알아보면 null.
export const labelToTime = (label) => {
  if (PRESET_TO_TIME[label]) return PRESET_TO_TIME[label];

  const matched = String(label).match(/(오전|오후)?\s*(\d{1,2}):(\d{2})/);
  if (!matched) return null;

  const [, period, rawHour, minute] = matched;
  let hour = Number(rawHour);
  if (period === '오후' && hour !== 12) hour += 12;
  if (period === '오전' && hour === 12) hour = 0;

  return `${String(hour).padStart(2, '0')}:${minute}`;
};

// '08:00' | '08:00:00' -> '아침 8:00'. 프리셋에 없으면 '오전 8:00' 형태로 만든다.
export const timeToLabel = (time) => {
  const hhmm = String(time).slice(0, 5);
  if (TIME_TO_PRESET[hhmm]) return TIME_TO_PRESET[hhmm];

  const { hour, minute } = parseTime(hhmm);
  const period = hour < 12 ? '오전' : '오후';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${period} ${displayHour}:${String(minute).padStart(2, '0')}`;
};

export const parseTime = (time) => {
  const [hour, minute] = String(time).slice(0, 5).split(':').map(Number);
  return { hour: hour || 0, minute: minute || 0 };
};

const ALL_DAYS = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
];
const THREE_TIMES_A_WEEK = ['MONDAY', 'WEDNESDAY', 'FRIDAY'];
const EVERY_OTHER_DAY = ['MONDAY', 'WEDNESDAY', 'FRIDAY', 'SUNDAY'];

// 서버는 '이틀에 한 번' 같은 주기를 모르고 요일 목록만 받는다.
// 그래서 주기를 요일로 근사해서 보낸다(이틀에 한 번 = 월수금일).
export const repeatToDays = (repeat) => {
  if (repeat === '매일') return ALL_DAYS;
  if (repeat === '주 3회') return THREE_TIMES_A_WEEK;
  if (repeat === '이틀에 한 번') return EVERY_OTHER_DAY;
  return [];
};

export const daysToRepeat = (days) => {
  const count = days?.length ?? 0;
  if (count >= 7) return '매일';
  if (count === 4) return '이틀에 한 번';
  if (count === 3) return '주 3회';
  return '필요할 때만';
};

// 서버의 MedicationResponse를 화면이 쓰는 { id, name, times, repeat } 형태로 바꾼다.
export const toMedicationView = (medication) => {
  const schedules = medication.schedules ?? [];
  return {
    id: medication.medicationId,
    name: medication.name,
    times: schedules.map((schedule) => timeToLabel(schedule.scheduledTime)),
    repeat: daysToRepeat(schedules[0]?.daysOfWeek),
    schedules,
  };
};

// 화면 입력값을 등록/수정 요청 본문으로 바꾼다.
export const toMedicationRequest = ({ name, times, repeat }) => ({
  name: name.trim(),
  scheduledTimes: times.map(labelToTime).filter(Boolean),
  daysOfWeek: repeatToDays(repeat),
});

// "2026-08-15" — 서버가 날짜만 받는 필드에 쓴다.
export const toDateString = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
