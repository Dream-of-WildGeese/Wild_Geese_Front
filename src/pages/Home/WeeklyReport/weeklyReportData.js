import {
  getWeeklyReport,
  getMyLatestReport,
  getFamilyLatestReport,
  getWeeklyHistory,
  getFamilyWeeklyHistory,
  getFamilyWeeklyReport,
} from '../../../api/weekly';
import { getMyFamily } from '../../../api/family';
import { getDailyLog } from '../../../api/daily';
import { getMedicationLogs, getFamilyMedicationStatus } from '../../../api/medication';
import { getUserId } from '../../../api/client';
import { toDateString } from '../../../utils/medication';

const DAYS = ['월', '화', '수', '목', '금', '토', '일'];
// 목록에 한 번에 보여줄 지난 주 개수. 서버 이력이 이보다 많아도 최근 것부터 이만큼만 자른다.
const PAST_WEEK_COUNT = 12;

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

// 가족에서 상대를 찾는다.
const findPartner = async () => {
  const family = await getMyFamily().catch(() => null);
  const myUserId = getUserId();
  const members = family?.members ?? [];
  return members.find((member) => String(member.userId) !== String(myUserId));
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
    headline: report.weeklyComment ?? '',
    headlineDesc:
      report.weeklyDetail ??
      (report.isBaselineSufficient
        ? ''
        : '아직 비교할 지난주 기록이 부족해서, 이번 주 기록만 보여드려요.'),
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
    meds: DAYS.map((day, index) => {
      // 약마다 먹는 요일이 달라서 하루에 몇 번인지가 날마다 다르다.
      // 날짜별 횟수가 있으면 그걸 쓰고, 없으면 예전처럼 하루치 하나로 본다.
      const total = medication.perDayTotals?.[index] ?? perDay;
      const taken = medication.daily?.[index] ?? null;
      return { day, taken, total, done: total > 0 && taken === total };
    }),
    medsTakenCount: medication.takenCount ?? 0,
    medsTotal: medication.totalCount ?? 0,
    medsNote: medication.comment ?? '',
    inProgress,
    adviceText: report.nextWeekSuggestion ?? '',
    // 서버가 기록을 분석해서 써주는 문장. 기록이 적으면 '아직 패턴을 분석할 만큼
    // 기록이 쌓이지 않았어요' 같은 기본 문구가 온다.
    aiInsight: report.aiCoachInsight ?? '',
    // AI 문구를 그대로 인용하면 문장이 어색하거나 텅 빌 때가 있었다.
    // 오늘의 건강일지 CTA와 같이, API에 기대지 않고 항상 같은 고정 문구만 보여준다.
    contactMessage: '"안부 전화를 걸어볼까요?"',
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
    comment: report?.weeklyComment ?? '',
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

// 이번 주는 서버에 실제 기록이 있으면 그걸 쓰고, 없으면 있는 그대로 빈 채로 둔다.
//
// fillFromDailyLog는 본인 계정에서만 켠다. buildCurrentWeekMetrics는 '나'의
// 하루 일지(getDailyLog)를 읽는데, 가족 리포트에 이걸 켜두면 상대방의 요일별
// 값이 내 하루 일지로 덮어써진다 — 상대방 리포트가 내 기록으로 뒤바뀌어 보이던
// 원인이 이거였다. 가족 쪽은 최신 리포트(family/latest)에 이미 요일별 값이
// 와 있으니 그대로 믿는다.
async function resolveCurrentWeek(fetched, { fillFromDailyLog = false } = {}) {
  const weekStart = getWeekStart();

  const built = fillFromDailyLog
    ? await buildCurrentWeekMetrics(weekStart, daysFilledThisWeek()).catch(() => null)
    : null;

  if (hasRecords(fetched) || built) {
    const base = fetched ?? {};

    // 예전에는 진행 중인 주의 문장을 전부 비웠다. 서버가 아직 덜 찬 주에도
    // 완결된 요약을 미리 붙여서 사실과 달랐기 때문이다.
    // 지금은 서버가 요일을 짚어가며 제대로 써준다('특히 월요일과 화요일에 푹
    // 주무셨네요'), 그래서 그대로 보여준다.
    const meds = base.medication ?? {};

    return {
      ...base,
      inProgress: true,
      metrics: Object.fromEntries(
        EVENING_ORDER.map((metric) => [
          metric,
          {
            ...(base.metrics?.[metric] ?? {}),
            // 서버가 준 실제 요일별 값이 있으면 그걸 우선한다. 없을 때만
            // (본인 계정 한정) 하루 일지로 채운 값을 대신 쓴다.
            daily: base.metrics?.[metric]?.daily?.length
              ? base.metrics[metric].daily
              : (built?.[metric] ?? []),
          },
        ]),
      ),
      // 복약 집계만 비운다. 이 숫자는 지금도 맞지 않는다.
      // (주 41회가 계획인데 '58번 중 51번'이라고 온다. 목요일까지는 최대 23회다)
      medication: { ...meds, comment: '' },
    };
  }

  return fetched;
}

// 본인 하루치 복약 기록. { takenCount, totalCount } 모양 그대로 온다.
const myDayMedication = (date) => getMedicationLogs(date).catch(() => null);

// 가족 하루치 복약 현황. 목록으로 오기 때문에 본인 쪽과 같은 모양으로 직접 센다.
const familyDayMedication = (userId) => (date) =>
  getFamilyMedicationStatus(userId, date)
    .then((list) => ({
      takenCount: (list ?? []).filter((item) => item.status === 'TAKEN').length,
      totalCount: (list ?? []).length,
    }))
    .catch(() => null);

// 서버의 주간 복약 집계가 실제와 맞지 않는다.
// 등록된 약을 다 더해도 주 41회가 계획인데 '58번 중 51번'이 오고, 목요일까지는
// 최대 23회인데 51번을 챙겼다고 한다. 날짜별 기록은 정확해서 그걸 직접 센다.
// dayMedication(date)가 본인/가족 중 어느 쪽 API를 쓸지 정한다.
async function withRealMedication(report, weekStart, days, dayMedication) {
  if (!report) return report;

  const dates = Array.from({ length: days }, (_, index) => toDateString(addDays(weekStart, index)));
  const logs = await Promise.all(dates.map((date) => dayMedication(date)));

  // 아직 오지 않은 요일은 null로 둬서 빈 칸으로 보이게 한다.
  const daily = logs.map((log) => (log ? (log.takenCount ?? 0) : null));
  const perDayTotals = logs.map((log) => log?.totalCount ?? 0);
  const takenCount = daily.reduce((sum, value) => sum + (value ?? 0), 0);
  const totalCount = perDayTotals.reduce((sum, value) => sum + value, 0);

  return {
    ...report,
    medication: {
      daily,
      perDayTotals,
      takenCount,
      totalCount,
      comment: totalCount
        ? `${report.inProgress ? '지금까지' : '이번 주'} ${totalCount}번 중 ${takenCount}번 챙기셨어요.`
        : '',
    },
  };
}

// /weekly는 한 번에 3~4초가 걸린다(서버가 요청마다 AI 문구를 만든다).
// 같은 주를 다시 열 때 또 기다리지 않도록 받아둔 것을 기억한다.
// 약속(Promise)째로 담아둬서, 동시에 두 번 부르면 요청도 한 번만 나간다.
const reportCache = new Map();

const fetchWeeklyReport = (weekId) => {
  if (!reportCache.has(weekId)) {
    reportCache.set(weekId, getWeeklyReport(weekId).catch(() => null));
  }
  return reportCache.get(weekId);
};

// 목록 화면이 부른다. 사용자가 카드를 누를 때쯤이면 이미 도착해 있다.
export const prefetchWeeklyReport = (weekId) => {
  fetchWeeklyReport(weekId);
};

// 목록 화면용.
//
// 예전에는 주마다 /weekly를 한 번씩 불렀다. 그런데 그 API는 한 번에 3~4초가 걸린다
// (서버가 요청마다 AI 문구를 만든다). 일곱 주면 스무 초가 넘게 걸렸다.
//
// 목록이 실제로 쓰는 건 '주차 이름'과 '한 줄평' 둘뿐인데, 그 둘은 /weekly/history가
// 0.2초 만에 통째로 준다. 무거운 조회는 상세 화면으로 미룬다.
// 이력 목록(주차별 한줄평)을 목록 화면이 쓰는 주차 요약 카드로 바꾼다.
// 월요일 시작과 일요일 시작이 섞여 오는데, 앱은 월요일 기준이라 월요일 것만 취한다.
// 안 그러면 6일이 겹치는 주가 나란히 뜬다.
const toPastSummaries = (history, thisWeekId) => {
  const byDate = new Map(
    (history ?? [])
      .filter((item) => new Date(`${item.weekStartDate}T00:00:00`).getDay() === 1)
      .map((item) => [item.weekStartDate, item]),
  );

  return [...byDate.keys()]
    .filter((date) => date < thisWeekId)
    .sort((a, b) => b.localeCompare(a))
    .slice(0, PAST_WEEK_COUNT)
    .map((date) => toWeekSummary(byDate.get(date), new Date(`${date}T00:00:00`)));
};

export async function loadWeeklyList(person) {
  const thisWeekStart = getWeekStart();
  const thisWeekId = toDateString(thisWeekStart);

  // 이번 주 카드는 주차 이름과 '입력 중' 표시만 보여준다. 리포트를 받을 일이 없다.
  const currentSummary = toWeekSummary({ inProgress: true }, thisWeekStart);

  if (person !== 'me') {
    const partner = await findPartner();
    if (!partner) return { current: null, past: [], partnerOnly: true };

    // 가족 구성원의 지난 주는 한줄평만 온다(자세한 지표는 최신 리포트에서만
    // 볼 수 있다). 그래도 목록에서 어떤 주였는지, 한 줄평이 뭐였는지는 보여줄 수 있다.
    const history = await getFamilyWeeklyHistory(partner.userId).catch(() => null);
    return {
      current: currentSummary,
      past: toPastSummaries(history, thisWeekId),
      partnerOnly: true,
    };
  }

  const history = await getWeeklyHistory().catch(() => null);
  return {
    current: currentSummary,
    past: toPastSummaries(history, thisWeekId),
    partnerOnly: false,
  };
}

// 상세 화면용. weekId는 그 주의 월요일 날짜('2026-08-10')다.
export async function loadWeeklyDetail(weekId, person) {
  const start = new Date(`${weekId}T00:00:00`);
  const weeksAgo = weeksAgoOf(start);

  // 가족 조회를 기다린 뒤에 리포트를 부르면 두 시간이 그대로 더해진다.
  // 리포트 쪽이 3~4초로 훨씬 길어서, 둘을 같이 띄워 보낸다.
  const reportPromise = person === 'me' ? fetchWeeklyReport(weekId) : null;

  if (person !== 'me') {
    const partner = await findPartner();
    if (!partner) return null;

    // 특정 지난 주를 조회하는 API가 생겨서, 최신 주 말고도 지난 주를 그대로 받아올 수 있다.
    const fetched =
      weeksAgo === 0
        ? await getFamilyLatestReport(partner.userId).catch(() => null)
        : await getFamilyWeeklyReport(partner.userId, weekId).catch(() => null);

    const days = weeksAgo === 0 ? daysFilledThisWeek() : 7;
    const report = weeksAgo === 0 ? await resolveCurrentWeek(fetched) : fetched;

    // 가족 복약 현황(family/status)을 하루씩 세어서 본인과 같은 방식으로 정확히 센다.
    const counted = await withRealMedication(report, start, days, familyDayMedication(partner.userId));

    return { week: toWeekSummary(counted, start), detail: toWeeklyDetail(counted) };
  }

  const fetched = await reportPromise;
  // 이번 주(weeksAgo 0)는 오늘까지만 채운다. 지난 주는 통째로 채운다.
  const days = weeksAgo === 0 ? daysFilledThisWeek() : 7;
  const report =
    weeksAgo === 0 ? await resolveCurrentWeek(fetched, { fillFromDailyLog: true }) : fetched;

  const counted = await withRealMedication(report, start, days, myDayMedication);

  return { week: toWeekSummary(counted, start), detail: toWeeklyDetail(counted) };
}

export { getMyLatestReport };
