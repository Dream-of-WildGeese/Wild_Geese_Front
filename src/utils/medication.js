// 화면은 '아침 8:00' 같은 한글 라벨로 복용 시간을 다루고, 서버는 '08:00' 문자열을 쓴다.
// 두 표현을 오가는 변환을 여기 모아둔다.

// '아침 8:00' '취침전 10:00'처럼 때를 가리키는 말과 시각이 섞여 있으면
// 목록에서 순서를 가늠하기 어렵다. 오전/오후로 통일한다.
const PRESET_TO_TIME = {
  '오전 8:00': '08:00',
  '오후 12:00': '12:00',
  '오후 6:00': '18:00',
  '오후 10:00': '22:00',
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

// '08:00' | '08:00:00' -> '오전 8:00'
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
//
// 빈 배열을 보내면 서버가 '어느 요일에도 해당 없음'으로 처리해서
// 복약 기록 자체가 저장되지 않는다. 그래서 기본값을 매일로 둔다.
export const repeatToDays = (repeat) => {
  if (repeat === '주 3회') return THREE_TIMES_A_WEEK;
  if (repeat === '이틀에 한 번') return EVERY_OTHER_DAY;
  return ALL_DAYS;
};

// 목록 화면에 보여줄 요일 표시. '주 3회' 같은 뭉뚱그린 문구 대신
// 실제로 고른 요일을 그대로 보여준다(월,수,금 -> "월·수·금").
const DAY_SHORT_LABEL = {
  MONDAY: '월',
  TUESDAY: '화',
  WEDNESDAY: '수',
  THURSDAY: '목',
  FRIDAY: '금',
  SATURDAY: '토',
  SUNDAY: '일',
};

export const formatDays = (days) => {
  if (!days?.length) return '요일 미정';
  if (days.length >= 7) return '매일';
  return ALL_DAYS.filter((day) => days.includes(day))
    .map((day) => DAY_SHORT_LABEL[day])
    .join('·');
};

// 서버의 MedicationResponse를 화면이 쓰는 { id, name, times, repeat } 형태로 바꾼다.
export const toMedicationView = (medication) => {
  const schedules = medication.schedules ?? [];
  return {
    id: medication.medicationId,
    name: medication.name,
    // 서버가 주는 순서가 등록 순이라, 이른 시각부터 보이도록 정렬해서 넘긴다.
    times: schedules
      .map((schedule) => schedule.scheduledTime)
      .sort((a, b) => String(a).localeCompare(String(b)))
      .map(timeToLabel),
    repeat: formatDays(schedules[0]?.daysOfWeek),
    days: schedules[0]?.daysOfWeek ?? [],
    schedules,
  };
};

export const DAY_OPTIONS = [
  { value: 'MONDAY', label: '월' },
  { value: 'TUESDAY', label: '화' },
  { value: 'WEDNESDAY', label: '수' },
  { value: 'THURSDAY', label: '목' },
  { value: 'FRIDAY', label: '금' },
  { value: 'SATURDAY', label: '토' },
  { value: 'SUNDAY', label: '일' },
];

export const isEveryDay = (days) => (days?.length ?? 0) >= 7;

// 복용 시간은 이른 시각부터 보여준다. 고른 순서대로 두면 '오후 6시 → 오전 8시'처럼
// 뒤죽박죽 보여서 하루 흐름을 못 읽는다.
export const sortTimeLabels = (labels) =>
  [...labels].sort((a, b) => String(labelToTime(a)).localeCompare(String(labelToTime(b))));

// 사용자가 직접 넣은 시·분이 실제 시각인지 본다. (12시 89분 같은 입력을 막는다)
export const isValidTime = (hour, minute) => {
  const h = Number(hour);
  const m = Number(minute);
  return Number.isInteger(h) && Number.isInteger(m) && h >= 1 && h <= 12 && m >= 0 && m <= 59;
};

// 같은 이름의 약을 또 만들면 복약 화면에서 어느 쪽을 체크한 건지 알 수 없다.
// 공백과 대소문자만 다른 것도 같은 약으로 본다.
const normalizeName = (name) => String(name ?? '').replace(/\s+/g, '').toLowerCase();

export const isDuplicateName = (name, existingNames, exceptName = null) => {
  const target = normalizeName(name);
  if (!target) return false;
  return existingNames
    .filter((item) => normalizeName(item) !== normalizeName(exceptName))
    .some((item) => normalizeName(item) === target);
};

// 화면 입력값을 등록/수정 요청 본문으로 바꾼다.
// 요일을 직접 고른 화면은 days를 넘기고, 주기 문구만 있는 화면은 repeat을 넘긴다.
export const toMedicationRequest = ({ name, times, repeat, days }) => ({
  name: name.trim(),
  scheduledTimes: times.map(labelToTime).filter(Boolean),
  daysOfWeek: days?.length ? days : repeatToDays(repeat),
});

// "2026-08-15" — 서버가 날짜만 받는 필드에 쓴다.
export const toDateString = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
