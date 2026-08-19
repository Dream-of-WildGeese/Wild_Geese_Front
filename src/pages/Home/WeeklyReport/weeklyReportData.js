import {
  getWeeklyReport,
  getMyLatestReport,
  getFamilyLatestReport,
  getWeeklyHistory,
} from '../../../api/weekly';
import { getMyFamily } from '../../../api/family';
import { getDailyLog } from '../../../api/daily';
import { getUserId } from '../../../api/client';
import { toDateString } from '../../../utils/medication';
import { getMockReport, getMockCurrentWeek, MOCK_WEEK_COUNT } from '../../../mock/weeklyReport';

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

  const inProgress = Boolean(report.inProgress);

  return {
    // 아직 쌓이는 중인 주는 문구를 만들지 않는다.
    headline: inProgress ? '' : (report.weeklyComment ?? ''),
    headlineDesc: inProgress
      ? ''
      : (report.weeklyDetail ??
        (report.isBaselineSufficient
          ? ''
          : '아직 비교할 지난주 기록이 부족해서, 이번 주 기록만 보여드려요.')),
    condition: toDailyDots(condition),
    conditionTrend: toTrend(condition?.trend),
    conditionNote: condition?.comment ?? '',
    sleep: toDailyBars(sleep),
    sleepNote: sleep?.comment ?? '',
    meal: toDailyDots(meal),
    mealNote: meal?.comment ?? '',
    steps: toDailyBars(activity),
    stepsTrend: toTrend(activity?.trend),
    stepsNote: activity?.comment ?? '',
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
    medsNote: medication.comment ?? '',
    inProgress,
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
    // 한 주가 다 차지 않은 리포트는 한 줄평을 만들지 않는다(목록에서도 비워둔다).
    comment: report?.inProgress ? '' : (report?.weeklyComment ?? ''),
    // 이번 주는 아직 쌓이는 중이라 목록에서 '입력 중'으로 표시한다.
    inProgress: Boolean(report?.inProgress),
  };
};

// 이번 주를 0으로 놓고 몇 주 전인지 센다.
const weeksAgoOf = (start) =>
  Math.round((getWeekStart() - start) / (7 * 24 * 60 * 60 * 1000));

// 기록이 없는 주도 서버는 200에 빈 껍데기를 준다.
// (metrics[].daily가 전부 [], comment는 '데이터를 확인해보세요.' 같은 고정 문구)
// null이 아니라서 그냥 두면 시연용 데이터가 영영 안 쓰인다.
// medication.totalCount는 '이번 주에 먹기로 한 횟수'라 약만 등록해두면 0이 아니다.
// 그것만 보고 기록이 있다고 판단하면 그래프가 빈 채로 서버 껍데기를 쓰게 된다.
// 실제로 남긴 게 있는지는 지표의 요일값과 '실제 챙긴 횟수'로 본다.
const hasRecords = (report) =>
  Object.values(report?.metrics ?? {}).some((metric) => (metric?.daily?.length ?? 0) > 0) ||
  (report?.medication?.takenCount ?? 0) > 0;

// 이번 주는 월요일부터 오늘까지만 기록이 있을 수 있다. (월요일이면 1일치)
const daysFilledThisWeek = () =>
  Math.floor((new Date().setHours(0, 0, 0, 0) - getWeekStart()) / (24 * 60 * 60 * 1000)) + 1;

// 저녁 건강체크 답변은 metricType 없이 질문 순서대로만 온다.
// 저녁 체크 화면의 질문 순서(컨디션·수면·식사·활동·맞춤)와 같은 순서다.
const EVENING_ORDER = ['CONDITION', 'SLEEP', 'MEAL', 'ACTIVITY'];

// 주간 API는 진행 중인 주의 metrics[].daily를 채워주지 않는다.
// 그래서 월요일부터 오늘까지 하루 일지를 직접 읽어 요일별 값을 만든다.
async function buildCurrentWeekMetrics(weekStart, days) {
  const dates = Array.from({ length: days }, (_, index) => toDateString(addDays(weekStart, index)));
  const logs = await Promise.all(dates.map((date) => getDailyLog(date).catch(() => null)));

  const daily = { CONDITION: [], SLEEP: [], MEAL: [], ACTIVITY: [] };
  logs.forEach((log) => {
    const answers = log?.eveningAnswers ?? [];
    EVENING_ORDER.forEach((metric, index) => {
      const answer = answers[index];
      const score = answer?.metricType
        ? answers.find((item) => item.metricType === metric)?.choiceValue
        : answer?.choiceValue;
      daily[metric].push(score != null ? Number(score) : null);
    });
  });

  const filled = Object.values(daily).some((values) => values.some((value) => value != null));
  return filled ? daily : null;
}

// 이번 주는 서버에 실제 기록이 있으면 그걸 쓰고, 없을 때만 오늘까지 채운 시연용
// 데이터를 쓴다. 시연 도중 입력한 내용이 목업에 가려지면 안 된다.
async function resolveCurrentWeek(fetched, role, weekStartDate) {
  const days = daysFilledThisWeek();
  const weekStart = getWeekStart();

  // 서버가 요일별 값을 못 주더라도 하루 일지에는 남아 있다. 그걸로 채워본다.
  const built = await buildCurrentWeekMetrics(weekStart, days).catch(() => null);

  if (hasRecords(fetched) || built) {
    const base = fetched ?? {};

    // 한 주가 다 차기 전에는 어떤 문장도 만들지 않는다.
    // 서버는 '이번 주 35번 중 30번 챙기셨어요' 같은 완결된 문장을 미리 주는데,
    // 아직 이틀치만 쌓인 주에 그런 말을 붙이면 사실과 다른 요약이 된다.
    // 그래프(요일별 값)만 보여주고 한 줄평·다음 주 제안·AI 코멘트는 모두 비운다.
    const meds = base.medication ?? {};

    return {
      ...base,
      inProgress: true,
      weeklyComment: '',
      weeklyDetail: '',
      nextWeekSuggestion: '',
      aiCoachInsight: '',
      metrics: Object.fromEntries(
        EVENING_ORDER.map((metric) => [
          metric,
          {
            ...(base.metrics?.[metric] ?? {}),
            daily: built ? built[metric] : (base.metrics?.[metric]?.daily ?? []),
            comment: '',
          },
        ]),
      ),
      medication: { ...meds, comment: '' },
    };
  }

  return getMockCurrentWeek(role, days, weekStartDate) ?? fetched;
}

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
      current: toWeekSummary(
        await resolveCurrentWeek(latest, role, toDateString(starts[0])),
        starts[0],
      ),
      past: mockPast.map((report, index) => toWeekSummary(report, starts[index + 1])),
      partnerOnly: true,
    };
  }

  // 서버가 리포트를 만들어둔 주 목록. 없는 주를 헛되이 조회하지 않아도 된다.
  // 다만 월요일 시작과 일요일 시작이 섞여 오는데, 앱은 월요일 기준이라
  // 월요일 것만 취한다. 안 그러면 6일이 겹치는 주가 나란히 뜬다.
  const history = await getWeeklyHistory().catch(() => null);
  const historyStarts = (history ?? [])
    .map((item) => item.weekStartDate)
    .filter((date) => new Date(`${date}T00:00:00`).getDay() === 1);

  // 목록에 없더라도 최근 몇 주는 시연용 데이터로 채워야 해서 둘을 합친다.
  const pastDates = [...new Set([...starts.slice(1).map(toDateString), ...historyStarts])]
    .filter((date) => date < toDateString(starts[0]))
    .sort((a, b) => b.localeCompare(a))
    .slice(0, PAST_WEEK_COUNT);

  const [currentReport, ...pastReports] = await Promise.all([
    getWeeklyReport(toDateString(starts[0])).catch(() => null),
    ...pastDates.map((date) => getWeeklyReport(date).catch(() => null)),
  ]);

  return {
    current: toWeekSummary(
      await resolveCurrentWeek(currentReport, role, toDateString(starts[0])),
      starts[0],
    ),
    past: pastReports.map((report, index) => {
      const start = new Date(`${pastDates[index]}T00:00:00`);
      // 서버에 실제 기록이 없는 주는 몇 주 전인지에 맞는 시연용 데이터로 채운다.
      const mock = getMockReport(role, weeksAgoOf(start), pastDates[index]);
      return toWeekSummary(hasRecords(report) ? report : (mock ?? report), start);
    }),
    partnerOnly: false,
  };
}

// 상세 화면용. weekId는 그 주의 월요일 날짜('2026-08-10')다.
export async function loadWeeklyDetail(weekId, person) {
  const start = new Date(`${weekId}T00:00:00`);
  const { partner, myRole, partnerRole } = await findFamilyRoles();
  const role = person === 'me' ? myRole : partnerRole;
  const weeksAgo = weeksAgoOf(start);
  const mock = getMockReport(role, weeksAgo, weekId);

  if (person !== 'me') {
    if (!partner) return null;
    // 가족은 특정 주를 지정할 수 없어 최신 리포트만 보여준다.
    // 지난 주를 열었다면 최신 리포트가 아니라 그 주의 시연용 데이터를 쓴다.
    if (mock) return { week: toWeekSummary(mock, start), detail: toWeeklyDetail(mock) };

    const latest = await getFamilyLatestReport(partner.userId).catch(() => null);
    const report = await resolveCurrentWeek(latest, role, weekId);
    return { week: toWeekSummary(report, start), detail: toWeeklyDetail(report) };
  }

  const fetched = await getWeeklyReport(weekId).catch(() => null);
  // 이번 주(weeksAgo 0)는 오늘까지만 채운다. 지난 주는 통째로 채운다.
  const report =
    weeksAgo === 0
      ? await resolveCurrentWeek(fetched, role, weekId)
      : (hasRecords(fetched) ? fetched : (mock ?? fetched));

  return { week: toWeekSummary(report, start), detail: toWeeklyDetail(report) };
}

export { getMyLatestReport };
