import { getDailyLog, getFamilyDailyLog } from '../../../api/daily';
import { getMedications, getMedicationLogs } from '../../../api/medication';
import { getMorningHistory } from '../../../api/morning';
import { getMyFamily } from '../../../api/family';
import { getUserId } from '../../../api/client';
import { toDateString } from '../../../utils/medication';
import { getRelationLabel } from '../../../utils/family';
import { getWeekStart } from '../WeeklyReport/weeklyReportData';
import { getMockDailyReport } from '../../../mock/dailyReport';

const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

// 저녁 체크 질문 순서. 서버가 metricType을 안 실어줄 때 이 순서로 짚는다.
const EVENING_ORDER = ['CONDITION', 'SLEEP', 'MEAL', 'ACTIVITY', 'CUSTOM'];

const MEDICATION_COLORS = [
  { color: '#fcd9d9', textColor: '#d94040' },
  { color: '#fce5c7', textColor: '#d98c26' },
  { color: '#dceada', textColor: '#4d8c59' },
  { color: '#dbe4f5', textColor: '#4a6ba8' },
];

const formatDateLabel = (date) =>
  `${date.getMonth() + 1}월 ${date.getDate()}일 ${WEEKDAY_LABELS[date.getDay()]}요일`;

// 서버가 타임존 표시(Z 또는 +09:00 등) 없이 시각을 내려줄 때가 있는데, 그 값은
// 사실 UTC라서 그냥 new Date로 읽으면 브라우저 로컬(KST) 시간으로 잘못 해석돼
// 9시간 이르게 보인다. 타임존 표시가 없으면 UTC로 보고 'Z'를 붙여서 읽는다.
const HAS_TIMEZONE = /Z$|[+-]\d{2}:?\d{2}$/;
const parseServerDate = (isoString) => {
  const normalized = HAS_TIMEZONE.test(isoString) ? isoString : `${isoString}Z`;
  return new Date(normalized);
};

const formatTimeLabel = (prefix, isoString) => {
  if (!isoString) return prefix;
  const date = parseServerDate(isoString);
  if (Number.isNaN(date.getTime())) return prefix;

  const hour = date.getHours();
  const period = hour < 12 ? '오전' : '오후';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${prefix} · ${period} ${displayHour}:${String(date.getMinutes()).padStart(2, '0')}`;
};

// 여러 항목(저녁 답변들)의 시각 중 가장 나중 것 — '최종 업데이트 시간'으로 보여준다.
const latestAnsweredAt = (items) =>
  items.reduce((latest, item) => {
    if (!item.answeredAt) return latest;
    if (!latest) return item.answeredAt;
    return parseServerDate(item.answeredAt) > parseServerDate(latest) ? item.answeredAt : latest;
  }, null);

// 서버는 복약 기록을 scheduleId 단위로 준다. 하루 여러 번 먹는 약은 스케줄마다
// 로그가 따로 오는데, scheduleId 그대로 나열하면 같은 약 이름이 여러 번 찍히고
// 한 번만 먹어도 꽃이 핀 것처럼 보인다. 약 단위로 묶어서, 그 약의 스케줄을
// 전부 챙겼을 때만 꽃이 피게 한다. (기록 수정 팝업과 같은 규칙)
const buildMedicationEntry = (medicationLog, medications) => {
  const logs = medicationLog?.medications ?? [];
  if (logs.length === 0) return null;

  const medicationBySchedule = new Map();
  medications.forEach((medication) => {
    (medication.schedules ?? []).forEach((schedule) => {
      medicationBySchedule.set(schedule.scheduleId, medication);
    });
  });

  const groups = new Map();
  logs.forEach((log) => {
    const medication = medicationBySchedule.get(log.scheduleId);
    const key = medication?.medicationId ?? log.scheduleId;
    if (!groups.has(key)) {
      groups.set(key, { name: medication?.name ?? '복용약', total: 0, taken: 0 });
    }
    const group = groups.get(key);
    group.total += 1;
    if (log.status === 'TAKEN') group.taken += 1;
  });

  const items = [...groups.values()].map((group, index) => ({
    name: group.name,
    taken: group.taken === group.total,
    ...MEDICATION_COLORS[index % MEDICATION_COLORS.length],
  }));

  const notTaken = items.filter((item) => !item.taken);
  return {
    type: 'medication',
    time: '복약',
    medications: items,
    // 안 챙긴 약이 있으면 카드 제목 옆에 느낌표 아이콘을 띄운다.
    hasMissed: notTaken.length > 0,
    note:
      notTaken.length > 0
        ? `${notTaken.map((item) => item.name).join(', ')}은 아직 기록되지 않았어요`
        : '오늘 복약을 모두 챙기셨어요',
  };
};

const buildTimeline = ({ dailyLog, question, medicationLog, medications }) => {
  const timeline = [];

  if (dailyLog?.morningAnswer?.textValue) {
    timeline.push({
      type: 'question',
      time: formatTimeLabel('아침', dailyLog.morningAnswer.answeredAt),
      question: question?.content ?? '오늘의 질문',
      answer: dailyLog.morningAnswer.textValue,
    });
  }

  const medicationEntry = buildMedicationEntry(medicationLog, medications);
  if (medicationEntry) {
    timeline.push(medicationEntry);
  }

  const eveningAnswers = dailyLog?.eveningAnswers ?? [];
  if (eveningAnswers.length > 0) {
    timeline.push({
      type: 'healthcheck',
      time: formatTimeLabel('저녁', latestAnsweredAt(eveningAnswers)),
      // 아이콘은 화면 쪽에서 metricType으로 고른다. 컨디션은 choiceValue(1~3)로
      // 표정 아이콘을 고르므로 같이 넘긴다.
      lines: eveningAnswers.map((answer, index) => ({
        // 서버가 metricType을 안 실어줄 때가 있어서, 없으면 질문 순서로 채운다.
        // 저녁 체크 질문 순서는 컨디션·수면·식사·활동·맞춤으로 고정이다.
        metricType: answer.metricType ?? EVENING_ORDER[index] ?? 'CUSTOM',
        text: answer.textValue || answer.choiceValue || '',
        choiceValue: answer.choiceValue ?? null,
      })),
    });
  }

  return timeline;
};

// 화면 상단 요약 칩 3개. 컨디션은 저녁 건강체크의 CONDITION 답변을 그대로 쓴다.
const buildSummary = (dailyLog, medicationLog) => {
  const answers = dailyLog?.eveningAnswers ?? [];
  // metricType이 없으면 첫 번째 답변이 컨디션이다(질문 순서 고정).
  const condition = answers.find((answer) => answer.metricType === 'CONDITION') ?? answers[0];
  return {
    questionStatus: dailyLog?.morningAnswered ? '완료' : '아직',
    medication: medicationLog ? `${medicationLog.takenCount}/${medicationLog.totalCount}` : '-',
    condition: condition?.textValue || condition?.choiceValue || '-',
    // 칩에 글자 대신 표정을 띄우려면 선택지 점수(1~3)가 필요하다.
    conditionScore: condition?.choiceValue != null ? Number(condition.choiceValue) : null,
  };
};

// 이번 주를 0으로 놓고 몇 주 전인지 센다. 지난 주는 서버에 기록이 없어서
// 주간 리포트와 같은 시연용 데이터를 쓴다.
const weeksAgoOf = (date) => {
  const start = getWeekStart(date);
  return Math.round((getWeekStart() - start) / (7 * 24 * 60 * 60 * 1000));
};

// person이 'me'면 내 일지를, 아니면 가족 구성원의 일지를 불러온다.
// 걸음수는 헬스케어 연동이 없어서 서버가 내려주지 않으므로 stepMessage는 비워둔다.
// dateString은 '2026-08-04' 또는 null(오늘). useApi가 인자를 JSON으로 주고받아서
// Date 객체를 그대로 넘길 수 없다.
export async function loadTodayReport(person, dateString = null) {
  const date = dateString ? new Date(`${dateString}T00:00:00`) : new Date();
  const recordDate = toDateString(date);

  const family = await getMyFamily().catch(() => null);
  const myUserId = getUserId();
  const members = family?.members ?? [];
  const me = members.find((member) => String(member.userId) === String(myUserId));
  const partner = members.find((member) => String(member.userId) !== String(myUserId));

  const isMe = person === 'me';
  if (!isMe && !partner) {
    return null;
  }

  // 지난 주 날짜를 열었다면 주간 리포트와 같은 요일 값에서 하루 기록을 만든다.
  const weeksAgo = weeksAgoOf(date);
  if (weeksAgo > 0) {
    const myRole = me?.role === 'CHILD' ? 'child' : 'parent';
    const role = isMe ? myRole : myRole === 'parent' ? 'child' : 'parent';
    const mock = getMockDailyReport({
      role,
      weeksAgo,
      date,
      personLabel: isMe ? '나' : getRelationLabel(partner),
      isMine: isMe,
    });
    if (mock) return mock;
  }

  const [dailyLog, medicationLog, medications, history] = await Promise.all([
    isMe
      ? getDailyLog(recordDate).catch(() => null)
      : getFamilyDailyLog(partner.userId, recordDate).catch(() => null),
    isMe ? getMedicationLogs(recordDate).catch(() => null) : null,
    isMe ? getMedications().catch(() => []) : [],
    getMorningHistory({ from: recordDate, to: recordDate }).catch(() => []),
  ]);

  const personLabel = isMe ? '나' : getRelationLabel(partner);

  return {
    personLabel,
    dateLabel: formatDateLabel(date),
    summary: buildSummary(dailyLog, medicationLog),
    aiComment: dailyLog?.summaryText ?? '',
    // 타임라인 아래에 한 번 더 붙는 저녁 코멘트. 서버가 별도 필드를 주면 그때 채운다.
    eveningComment: '',
    stepMessage: '',
    timeline: buildTimeline({
      dailyLog,
      question: (history ?? [])[0],
      medicationLog,
      medications: medications ?? [],
    }),
    cta: isMe
      ? null
      : {
          // '가족'이라고만 하면 누구인지 모호해서, 관계 호칭을 그대로 넣는다.
          title: `이제 ${personLabel}와 안부를 나눠볼까요?`,
          suggestedMessage: dailyLog?.summaryText
            ? `"${dailyLog.summaryText}"`
            : '"오늘 하루는 어떠셨어요?"',
        },
  };
}
