import { getWeeklyReport, getMyLatestReport, getFamilyLatestReport } from '../../../api/weekly';
import { getMyFamily } from '../../../api/family';
import { getUserId } from '../../../api/client';
import { toDateString } from '../../../utils/medication';
import { getMockReport, MOCK_WEEK_COUNT } from '../../../mock/weeklyReport';

const DAYS = ['월', '화', '수', '목', '금', '토', '일'];
const PAST_WEEK_COUNT = MOCK_WEEK_COUNT;

// 저녁 건강체크 선택지 점수를 도트 색으로 바꾼다.
// 서버가 주는 값은 좋았어요=3, 보통=2, 힘들었어요=1로 클수록 좋은 상태다.
const SCORE_COLOR = { 3: '#59a666', 2: '#f2bf59', 1: '#d96659' };
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

// 가족에서 나와 상대를 찾고, 시연용 데이터를 고를 역할('parent' | 'child')도 함께 정한다.
// 부모와 자녀는 생활 패턴이 달라서 목업 세트가 나뉘어 있다.
const findFamilyRoles = async () => {
  const family = await getMyFamily().catch(() => null);
  const myUserId = getUserId();
  const members = family?.members ?? [];

  const me = members.find((member) => String(member.userId) === String(myUserId));
  const partner = members.find((member) => String(member.userId) !== String(myUserId));

  // 가족 조회가 실패하면 돌봄을 받는 쪽(부모)으로 본다.
  const myRole = me?.role === 'CHILD' ? 'child' : 'parent';
  return { partner, myRole, partnerRole: myRole === 'parent' ? 'child' : 'parent' };
};

// 화면이 점수로 표정 아이콘을 고르므로 색과 함께 원점수도 넘긴다.
const toDailyDots = (metric) =>
  DAYS.map((day, index) => ({
    day,
    score: metric?.daily?.[index] ?? null,
    color: scoreColor(metric?.daily?.[index]),
  }));

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

  const medication = report.medication ?? {};
  const perDay = medication.perDay ?? 0;

  return {
    headline: report.weeklyComment ?? '이번 주 리포트예요',
    headlineDesc:
      report.weeklyDetail ??
      (report.isBaselineSufficient
        ? ''
        : '아직 비교할 지난주 기록이 부족해서, 이번 주 기록만 보여드려요.'),
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
    // 서버는 복약을 주 단위 합계로만 준다. 요일별(daily)은 시연용 데이터에만 있어서,
    // 없으면 요일 칸을 비워 둔다. 합계만으로 앞에서부터 채우면 실제와 다른 그림이 된다.
    meds: DAYS.map((day, index) => ({
      day,
      taken: medication.daily?.[index] ?? null,
      total: perDay,
      done: perDay > 0 && medication.daily?.[index] === perDay,
    })),
    medsTakenCount: medication.takenCount ?? 0,
    medsTotal: medication.totalCount ?? 0,
    medsNote: medication.comment ?? '복약 기록이 아직 없어요.',
    adviceText: report.nextWeekSuggestion ?? '',
    // 서버가 기록을 분석해서 써주는 문장. 기록이 적으면 '아직 패턴을 분석할 만큼
    // 기록이 쌓이지 않았어요' 같은 기본 문구가 온다.
    aiInsight: report.aiCoachInsight ?? '',
    contactMessage: report.weeklyComment ? `"${report.weeklyComment}"` : '"요즘 어떻게 지내세요?"',
  };
};

const toWeekSummary = (report, start) => {
  const end = addDays(start, 6);
  return {
    id: toDateString(start),
    label: formatWeekLabel(start),
    range: formatRange(start, end),
    year: start.getFullYear(),
    month: start.getMonth() + 1,
    // 연말/연초가 섞이면 월 숫자만으로는 순서를 못 정해서, 정렬용 키를 따로 만든다. (202608)
    monthKey: start.getFullYear() * 100 + start.getMonth() + 1,
    // 디자인은 '8월'만 쓴다. 다만 연말·연초가 섞이면 어느 해인지 알 수 없어서
    // 올해가 아닌 달에만 연도를 붙인다.
    monthLabel:
      start.getFullYear() === new Date().getFullYear()
        ? `${start.getMonth() + 1}월`
        : `${start.getFullYear()}년 ${start.getMonth() + 1}월`,
    comment: report?.weeklyComment ?? '아직 리포트가 준비되지 않았어요',
  };
};

// 이번 주를 0으로 놓고 몇 주 전인지 센다.
const weeksAgoOf = (start) =>
  Math.round((getWeekStart() - start) / (7 * 24 * 60 * 60 * 1000));

// 기록이 없는 주도 서버는 200에 빈 껍데기를 준다.
// (metrics[].daily가 전부 [], comment는 '데이터를 확인해보세요.' 같은 고정 문구)
// null이 아니라서 그냥 두면 시연용 데이터가 영영 안 쓰인다.
const hasRecords = (report) =>
  Object.values(report?.metrics ?? {}).some((metric) => (metric?.daily?.length ?? 0) > 0) ||
  (report?.medication?.totalCount ?? 0) > 0;

// 목록 화면용. 주 목록을 주는 API가 없어서 최근 주차를 직접 만들어 각각 조회한다.
// 지난 주는 아직 서버에 리포트가 없어서, 없는 주만 시연용 데이터로 채운다.
export async function loadWeeklyList(person) {
  const thisWeekStart = getWeekStart();
  const starts = Array.from({ length: PAST_WEEK_COUNT + 1 }, (_, index) =>
    addDays(thisWeekStart, -7 * index),
  );

  const { partner, myRole, partnerRole } = await findFamilyRoles();
  const role = person === 'me' ? myRole : partnerRole;

  const mockPast = starts
    .slice(1)
    .map((start, index) => getMockReport(role, index + 1, toDateString(start)));

  // 가족은 최신 주차만 조회할 수 있어서, 이번 주만 서버에서 가져온다.
  if (person !== 'me') {
    if (!partner) return { current: null, past: [], partnerOnly: true };

    const latest = await getFamilyLatestReport(partner.userId).catch(() => null);
    return {
      current: toWeekSummary(latest, starts[0]),
      past: mockPast.map((report, index) => toWeekSummary(report, starts[index + 1])),
      partnerOnly: true,
    };
  }

  const reports = await Promise.all(
    starts.map((start) => getWeeklyReport(toDateString(start)).catch(() => null)),
  );

  const [currentReport, ...pastReports] = reports;
  return {
    current: toWeekSummary(currentReport, starts[0]),
    past: pastReports.map((report, index) =>
      toWeekSummary(hasRecords(report) ? report : mockPast[index], starts[index + 1]),
    ),
    partnerOnly: false,
  };
}

// 상세 화면용. weekId는 그 주의 월요일 날짜('2026-08-10')다.
export async function loadWeeklyDetail(weekId, person) {
  const start = new Date(`${weekId}T00:00:00`);
  const { partner, myRole, partnerRole } = await findFamilyRoles();
  const mock = getMockReport(person === 'me' ? myRole : partnerRole, weeksAgoOf(start), weekId);

  if (person !== 'me') {
    if (!partner) return null;
    // 가족은 특정 주를 지정할 수 없어 최신 리포트만 보여준다.
    // 지난 주를 열었다면 최신 리포트가 아니라 그 주의 시연용 데이터를 쓴다.
    const report = mock ?? (await getFamilyLatestReport(partner.userId));
    return { week: toWeekSummary(report, start), detail: toWeeklyDetail(report) };
  }

  const fetched = await getWeeklyReport(weekId).catch(() => null);
  const report = hasRecords(fetched) ? fetched : (mock ?? fetched);
  return { week: toWeekSummary(report, start), detail: toWeeklyDetail(report) };
}

export { getMyLatestReport };
