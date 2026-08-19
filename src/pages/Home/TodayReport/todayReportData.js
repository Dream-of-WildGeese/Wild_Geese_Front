import { getDailyLog, getFamilyDailyLog } from '../../../api/daily';
import { getMedications, getMedicationLogs } from '../../../api/medication';
import { getMorningHistory, getTodayQuestion } from '../../../api/morning';
import { getMyFamily } from '../../../api/family';
import { getUserId } from '../../../api/client';
import { toDateString, timeToLabel, activeSchedules } from '../../../utils/medication';
import { getRelationLabel, withCompanionJosa } from '../../../utils/family';
import { findMyLatestAnswer } from '../../../utils/morningAnswer';
import { getWeekStart } from '../WeeklyReport/weeklyReportData';
import { getMockDailyReport } from '../../../mock/dailyReport';
import { getMockSteps, buildStepsMessage } from '../../../mock/steps';

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

// 한 번 먹을 때마다 꽃 하나로 센다. 약 체크 팝업의 완료 화면과 같은 단위라
// 상단 요약의 '1/3'과 꽃 개수가 언제나 맞아떨어진다.
// (예전에는 약 단위로 묶어서, 하루 두 번 먹는 약을 한 번만 먹어도 꽃이 통째로
//  비어 보였고 요약 숫자와도 어긋났다)
const buildMedicationEntry = (medicationLog, medications) => {
  const logs = medicationLog?.medications ?? [];
  // 기록이 아직 없어도 카드 자체는 보여주고 안은 비워둔다.
  if (logs.length === 0) {
    return { type: 'medication', time: '복약', medications: [], note: '' };
  }

  // 꺼진(예전) 스케줄은 빼고 지금 쓰는 것만 이름·시각을 찾을 수 있게 담는다.
  const scheduleInfo = new Map();
  medications.forEach((medication) => {
    activeSchedules(medication.schedules).forEach((schedule) => {
      scheduleInfo.set(schedule.scheduleId, {
        name: medication.name,
        timeLabel: timeToLabel(schedule.scheduledTime),
      });
    });
  });

  const rows = logs.map((log, index) => {
    const info = scheduleInfo.get(log.scheduleId);
    return {
      key: log.scheduleId ?? `row-${index}`,
      name: info?.name ?? '복용약',
      timeLabel: info?.timeLabel ?? '',
      taken: log.status === 'TAKEN',
      ...MEDICATION_COLORS[index % MEDICATION_COLORS.length],
    };
  });

  // 같은 약을 하루에 여러 번 먹으면 이름만으론 어느 것인지 알 수 없어서 시각을 붙인다.
  const nameCounts = rows.reduce((acc, row) => {
    acc[row.name] = (acc[row.name] ?? 0) + 1;
    return acc;
  }, {});

  const items = rows.map((row) => ({
    ...row,
    label: nameCounts[row.name] > 1 && row.timeLabel ? `${row.name} ${row.timeLabel}` : row.name,
  }));

  const notTaken = items.filter((item) => !item.taken);
  return {
    type: 'medication',
    time: '복약',
    medications: items,
    note:
      notTaken.length > 0
        ? `${notTaken.length}번은 아직 기록되지 않았어요`
        : '오늘 복약을 모두 챙기셨어요',
  };
};

// 아직 답하지 않은 항목도 카드 자체는 항상 보여주고, 안 채워진 부분만 빈칸으로 둔다.
// (예전엔 기록이 없으면 카드가 통째로 안 보여서 오늘 뭘 안 했는지도 알기 어려웠다)
const buildTimeline = ({ dailyLog, question, morningAnswer, medicationLog, medications }) => {
  const eveningAnswers = dailyLog?.eveningAnswers ?? [];

  return [
    {
      type: 'question',
      time: formatTimeLabel('아침', dailyLog?.morningAnswer?.answeredAt),
      question: question?.content ?? '오늘의 질문',
      // 음성으로 다시 답한 내용은 /daily의 morningAnswer에 반영되지 않는다.
      // 오늘 것은 아침 질문 응답에서 마지막 답을 골라 쓴다.
      answer: morningAnswer ?? dailyLog?.morningAnswer?.textValue ?? '',
    },
    buildMedicationEntry(medicationLog, medications),
    {
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
    },
  ];
};

// 상단 요약 칩의 컨디션 표기. 저녁 건강체크 선택지 점수(3~1)를 세 글자로 줄인다.
const CONDITION_SHORT = { 3: '좋음', 2: '보통', 1: '나쁨' };

// 저녁 건강체크 답변 중 원하는 지표 하나를 꺼낸다.
// 서버가 metricType을 안 실어줄 때가 있어서, 없으면 질문 순서로 짚는다.
const findEveningAnswer = (dailyLog, metric) => {
  const answers = dailyLog?.eveningAnswers ?? [];
  if (answers.length === 0) return null;
  return (
    answers.find((answer) => answer.metricType === metric) ??
    answers[EVENING_ORDER.indexOf(metric)] ??
    null
  );
};

const scoreOf = (answer) => (answer?.choiceValue != null ? Number(answer.choiceValue) : null);

// 화면 상단 요약 칩 3개.
const buildSummary = (dailyLog, medicationLog) => {
  const score = scoreOf(findEveningAnswer(dailyLog, 'CONDITION'));
  return {
    questionStatus: dailyLog?.morningAnswered ? '완료' : '아직',
    medication: medicationLog ? `${medicationLog.takenCount}/${medicationLog.totalCount}` : '-',
    condition: score != null ? (CONDITION_SHORT[Math.round(score)] ?? '-') : '-',
  };
};

// 이번 주를 0으로 놓고 몇 주 전인지 센다. 지난 주는 서버에 기록이 없어서
// 주간 리포트와 같은 시연용 데이터를 쓴다.
const weeksAgoOf = (date) => {
  const start = getWeekStart(date);
  return Math.round((getWeekStart() - start) / (7 * 24 * 60 * 60 * 1000));
};

// person이 'me'면 내 일지를, 아니면 가족 구성원의 일지를 불러온다.
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

  // 걸음 수는 서버에 없어서 날짜로 정하는데, '어제보다 N보' 문장을 만들려면
  // 전날의 활동량 점수도 필요하다. 그래서 전날 일지도 함께 읽는다.
  const previousDate = new Date(date);
  previousDate.setDate(previousDate.getDate() - 1);
  const previousRecordDate = toDateString(previousDate);

  const isToday = recordDate === toDateString(new Date());

  const [dailyLog, medicationLog, medications, history, previousLog, todayQuestion] =
    await Promise.all([
    isMe
      ? getDailyLog(recordDate).catch(() => null)
      : getFamilyDailyLog(partner.userId, recordDate).catch(() => null),
    isMe ? getMedicationLogs(recordDate).catch(() => null) : null,
    isMe ? getMedications().catch(() => []) : [],
    getMorningHistory({ from: recordDate, to: recordDate }).catch(() => []),
    isMe
      ? getDailyLog(previousRecordDate).catch(() => null)
      : getFamilyDailyLog(partner.userId, previousRecordDate).catch(() => null),
      // 오늘 내 일지일 때만, 마지막으로 남긴 아침 답변을 확인한다.
      isMe && isToday ? getTodayQuestion().catch(() => null) : null,
    ]);

  const personLabel = isMe ? '나' : getRelationLabel(partner);

  const stepCount = getMockSteps(recordDate, scoreOf(findEveningAnswer(dailyLog, 'ACTIVITY')));
  const previousStepCount = getMockSteps(
    previousRecordDate,
    scoreOf(findEveningAnswer(previousLog, 'ACTIVITY')),
  );

  return {
    personLabel,
    dateLabel: formatDateLabel(date),
    summary: buildSummary(dailyLog, medicationLog),
    steps: {
      count: stepCount,
      message: buildStepsMessage(
        stepCount,
        previousStepCount,
        isToday,
      ),
    },
    aiComment: dailyLog?.summaryText ?? '',
    // 온담 한마디가 아직 없을 때 뭐라고 안내할지 정하려면, 저녁 체크를 마쳤는지 알아야 한다.
    eveningDone:
      (dailyLog?.eveningTotalCount ?? 0) > 0 &&
      (dailyLog?.eveningCompletedCount ?? 0) >= dailyLog.eveningTotalCount,
    // 타임라인 아래에 한 번 더 붙는 저녁 코멘트. 서버가 별도 필드를 주면 그때 채운다.
    eveningComment: '',
    timeline: buildTimeline({
      dailyLog,
      question: (history ?? [])[0],
      morningAnswer: findMyLatestAnswer(todayQuestion?.familyAnswers, myUserId)?.textValue,
      medicationLog,
      medications: medications ?? [],
    }),
    cta: isMe
      ? null
      : {
          // '가족'이라고만 하면 누구인지 모호해서, 관계 호칭을 그대로 넣는다.
          title: `이제 ${withCompanionJosa(personLabel)} 안부를 나눠볼까요?`,
          suggestedMessage: dailyLog?.summaryText
            ? `"${dailyLog.summaryText}"`
            : '"오늘 하루는 어떠셨어요?"',
        },
  };
}
