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
const DAY_LABEL = {
  MONDAY: '월',
  TUESDAY: '화',
  WEDNESDAY: '수',
  THURSDAY: '목',
  FRIDAY: '금',
  SATURDAY: '토',
  SUNDAY: '일',
};

<<<<<<< HEAD
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
=======
export const ALL_DAY_VALUES = ALL_DAYS;

// 목록에 보여줄 문구. 예전에는 고른 요일의 '개수'만 보고 '주 3회'·'이틀에 한 번'처럼
// 어림잡아 불렀는데, 무슨 요일인지 알 수 없는 데다 개수가 안 맞으면 엉뚱한 말이 나왔다.
// 고른 요일을 그대로 보여준다.
export const daysToLabel = (days) => {
  const picked = ALL_DAYS.filter((day) => (days ?? []).includes(day));
  if (picked.length === 0) return '요일 미설정';
  if (picked.length === ALL_DAYS.length) return '매일';
  return picked.map((day) => DAY_LABEL[day]).join('·');
>>>>>>> 413f47fd40fdb6892f2ac3932110d0d4a03dbd7a
};

// 화면에서 '월' '화'처럼 한 글자로 고른 요일을 서버 값으로 바꾼다.
// 월요일부터 차례로 담아서, 고른 순서와 상관없이 늘 같은 순서로 보낸다.
export const dayLabelsToValues = (labels) =>
  ALL_DAYS.filter((day) => (labels ?? []).includes(DAY_LABEL[day]));

// 서버는 약을 고쳐도 예전 스케줄을 지우지 않는다. enabled: false로 꺼둔 뒤 새 줄을
// 덧붙인다. 그래서 응답에는 지금 쓰는 줄과 예전 줄이 섞여 온다.
// 꺼진 줄까지 읽으면 예전 시각과 예전 요일이 그대로 살아 있는 것처럼 보인다.
// (요일을 목·금·토·일로 고쳐 저장해도 목록에는 '매일'로 나오던 이유)
export const activeSchedules = (schedules) =>
  (schedules ?? []).filter((schedule) => schedule.enabled !== false);

// 서버의 MedicationResponse를 화면이 쓰는 { id, name, times, repeat } 형태로 바꾼다.
export const toMedicationView = (medication) => {
  const schedules = activeSchedules(medication.schedules);
  return {
    id: medication.medicationId,
    name: medication.name,
    // 서버가 주는 순서가 등록 순이라, 이른 시각부터 보이도록 정렬해서 넘긴다.
    // 같은 시각이 두 줄로 저장돼 있어도 목록에는 한 번만 보여준다.
    times: [...new Set(schedules.map((schedule) => String(schedule.scheduledTime).slice(0, 5)))]
      .sort((a, b) => a.localeCompare(b))
      .map(timeToLabel),
<<<<<<< HEAD
    repeat: formatDays(schedules[0]?.daysOfWeek),
=======
    repeat: daysToLabel(schedules[0]?.daysOfWeek),
>>>>>>> 413f47fd40fdb6892f2ac3932110d0d4a03dbd7a
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

// 사용자가 고른 시·분을 목록이 쓰는 표기로 굳힌다. 미리 준비된 시각이면 그 이름
// 그대로가 된다('오전 08:00'이 아니라 '오전 8:00'). 표기가 갈리면 같은 시각인데도
// 다른 칸으로 잡혀서 중복으로 들어간다.
export const toTimeLabel = (period, hour, minute) =>
  timeToLabel(labelToTime(`${period} ${Number(hour)}:${String(minute).padStart(2, '0')}`));

// 표기가 달라도 가리키는 시각이 같으면 이미 있는 것으로 본다.
export const includesTime = (times, label) => {
  const target = labelToTime(label);
  return (times ?? []).some((item) => labelToTime(item) === target);
};

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
//
// 같은 시각을 두 번 보내면 서버에 스케줄이 두 줄 생겨서, 목록에 '오전 8:00'이
// 두 개씩 보인다. 보내기 전에 한 번 걸러낸다.
//
// 요일을 빈 배열로 보내면 서버가 '어느 요일에도 해당 없음'으로 처리해서 복약 기록
// 자체가 저장되지 않는다. 고른 요일이 없으면 매일로 둔다.
export const toMedicationRequest = ({ name, times, days }) => ({
  name: name.trim(),
  scheduledTimes: [...new Set(times.map(labelToTime).filter(Boolean))],
  daysOfWeek: days?.length ? days : ALL_DAYS,
});

// "2026-08-15" — 서버가 날짜만 받는 필드에 쓴다.
export const toDateString = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
