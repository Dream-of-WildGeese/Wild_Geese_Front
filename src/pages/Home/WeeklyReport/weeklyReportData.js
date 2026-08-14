import { getWeeklyReport, getMyLatestReport, getFamilyLatestReport } from '../../../api/weekly';
import { getMyFamily } from '../../../api/family';
import { getUserId } from '../../../api/client';
import { toDateString } from '../../../utils/medication';

const DAYS = ['월', '화', '수', '목', '금', '토', '일'];
const PAST_WEEK_COUNT = 5;

// 저녁 건강체크 선택지 점수를 도트 색으로 바꾼다. 1이 가장 좋은 상태라고 본다.
const SCORE_COLOR = { 1: '#59a666', 2: '#f2bf59', 3: '#d96659' };
const scoreColor = (score) => SCORE_COLOR[Math.round(score)] ?? '#d9d4cc';

// 주의 시작(월요일)을 구한다.
export const getWeekStart = (date = new Date()) => {
  const start = new Date(date);
  const weekday = (start.getDay() + 6) % 7; // 월요일이 0이 되도록 보정
  start.setDate(start.getDate() - weekday);
  start.setHours(0, 0, 0, 0);
  return start;
};

const addDays = (date, days) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const formatRange = (start, end) =>
  `${start.getMonth() + 1}/${start.getDate()} - ${end.getMonth() + 1}/${end.getDate()}`;

// '8월 둘째주' — 해당 달의 몇 번째 주인지로 이름을 만든다.
const ORDINALS = ['첫째', '둘째', '셋째', '넷째', '다섯째'];
const formatWeekLabel = (start) => {
  const index = Math.floor((start.getDate() - 1) / 7);
  return `${start.getMonth() + 1}월 ${ORDINALS[index] ?? '마지막'}주`;
};

const findPartner = async () => {
  const family = await getMyFamily().catch(() => null);
  const myUserId = getUserId();
  return (family?.members ?? []).find((member) => String(member.userId) !== String(myUserId));
};

const toDailyDots = (metric) =>
  DAYS.map((day, index) => ({ day, color: scoreColor(metric?.daily?.[index]) }));

const toDailyBars = (metric) =>
  DAYS.map((day, index) => ({ day, value: metric?.daily?.[index] ?? 0 }));

// 서버 trend 문자열을 화면이 쓰는 up/down/flat으로 좁힌다.
const toTrend = (trend) => {
  if (trend === 'DOWN' || trend === 'WORSE') return 'down';
  if (trend === 'UP' || trend === 'BETTER') return 'up';
  return 'flat';
};

// 주간 리포트 응답 하나를 상세 화면이 쓰는 형태로 바꾼다.
export const toWeeklyDetail = (report) => {
  if (!report) return null;

  const metrics = report.metrics ?? {};
  const condition = metrics.CONDITION;
  const sleep = metrics.SLEEP;
  const meal = metrics.MEAL;
  const activity = metrics.ACTIVITY;

  return {
    headline: report.weeklyComment ?? '이번 주 리포트예요',
    headlineDesc: report.isBaselineSufficient
      ? ''
      : '아직 비교할 지난주 기록이 부족해서, 이번 주 기록만 보여드려요.',
    condition: toDailyDots(condition),
    conditionTrend: toTrend(condition?.trend),
    conditionNote: condition?.comment ?? '아직 기록이 부족해요.',
    sleep: toDailyBars(sleep),
    sleepNote: sleep?.comment ?? '아직 기록이 부족해요.',
    meal: toDailyDots(meal),
    mealNote: meal?.comment ?? '아직 기록이 부족해요.',
    steps: toDailyBars(activity),
    stepsTrend: toTrend(activity?.trend),
    stepsNote: activity?.comment ?? '아직 기록이 부족해요.',
    // 주간 리포트는 복약을 주 단위 합계로만 내려줘서 요일별 체크는 만들 수 없다.
    medsTaken: [],
    medsTakenCount: report.medication?.takenCount ?? 0,
    medsTotal: report.medication?.totalCount ?? 0,
    medsNote: report.medication?.comment ?? '복약 기록이 아직 없어요.',
    adviceText: report.nextWeekSuggestion ?? '',
    contactMessage: report.weeklyComment ? `"${report.weeklyComment}"` : '"요즘 어떻게 지내세요?"',
  };
};

const toWeekSummary = (report, start) => {
  const end = addDays(start, 6);
  return {
    id: toDateString(start),
    label: formatWeekLabel(start),
    range: formatRange(start, end),
    month: start.getMonth() + 1,
    comment: report?.weeklyComment ?? '아직 리포트가 준비되지 않았어요',
  };
};

// 목록 화면용. 주 목록을 주는 API가 없어서 최근 주차를 직접 만들어 각각 조회한다.
// 가족 구성원은 최신 주차만 조회할 수 있어서 지난 주 목록은 비워둔다.
export async function loadWeeklyList(person) {
  const thisWeekStart = getWeekStart();

  if (person !== 'me') {
    const partner = await findPartner();
    if (!partner) return { current: null, past: [], partnerOnly: true };

    const latest = await getFamilyLatestReport(partner.userId).catch(() => null);
    const start = latest?.weekStartDate ? new Date(`${latest.weekStartDate}T00:00:00`) : thisWeekStart;
    return { current: toWeekSummary(latest, start), past: [], partnerOnly: true };
  }

  const starts = Array.from({ length: PAST_WEEK_COUNT + 1 }, (_, index) =>
    addDays(thisWeekStart, -7 * index),
  );

  const reports = await Promise.all(
    starts.map((start) => getWeeklyReport(toDateString(start)).catch(() => null)),
  );

  const [currentReport, ...pastReports] = reports;
  return {
    current: toWeekSummary(currentReport, starts[0]),
    past: pastReports.map((report, index) => toWeekSummary(report, starts[index + 1])),
    partnerOnly: false,
  };
}

// 상세 화면용. weekId는 그 주의 월요일 날짜('2026-08-10')다.
export async function loadWeeklyDetail(weekId, person) {
  const start = new Date(`${weekId}T00:00:00`);

  if (person !== 'me') {
    const partner = await findPartner();
    if (!partner) return null;
    // 가족은 특정 주를 지정할 수 없어 최신 리포트만 보여준다.
    const report = await getFamilyLatestReport(partner.userId);
    return { week: toWeekSummary(report, start), detail: toWeeklyDetail(report) };
  }

  const report = await getWeeklyReport(weekId);
  return { week: toWeekSummary(report, start), detail: toWeeklyDetail(report) };
}

export { getMyLatestReport };
