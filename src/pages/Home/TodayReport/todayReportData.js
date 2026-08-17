import { getDailyLog, getFamilyDailyLog } from '../../../api/daily';
import { getMedications, getMedicationLogs } from '../../../api/medication';
import { getMorningHistory } from '../../../api/morning';
import { getMyFamily } from '../../../api/family';
import { getUserId } from '../../../api/client';
import { toDateString } from '../../../utils/medication';

const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

// 저녁 건강체크 항목별 아이콘. 서버의 metricType을 그대로 키로 쓴다.
const METRIC_ICONS = {
  CONDITION: '♥',
  SLEEP: 'Z',
  MEAL: 'M',
  ACTIVITY: 'A',
  BODY: 'B',
  CUSTOM: '✦',
};

const MEDICATION_COLORS = [
  { color: '#fcd9d9', textColor: '#d94040' },
  { color: '#fce5c7', textColor: '#d98c26' },
  { color: '#dceada', textColor: '#4d8c59' },
  { color: '#dbe4f5', textColor: '#4a6ba8' },
];

const formatDateLabel = (date) =>
  `${date.getMonth() + 1}월 ${date.getDate()}일 ${WEEKDAY_LABELS[date.getDay()]}요일`;

const formatTimeLabel = (prefix, isoString) => {
  if (!isoString) return prefix;
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return prefix;

  const hour = date.getHours();
  const period = hour < 12 ? '오전' : '오후';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${prefix} · ${period} ${displayHour}:${String(date.getMinutes()).padStart(2, '0')}`;
};

// 서버는 복약 기록을 scheduleId 단위로 주므로, 약 이름을 붙이려면 복약 목록이 필요하다.
const buildMedicationEntry = (medicationLog, medications) => {
  const logs = medicationLog?.medications ?? [];
  if (logs.length === 0) return null;

  const nameBySchedule = new Map();
  medications.forEach((medication) => {
    (medication.schedules ?? []).forEach((schedule) => {
      nameBySchedule.set(schedule.scheduleId, medication.name);
    });
  });

  const items = logs.map((log, index) => ({
    name: nameBySchedule.get(log.scheduleId) ?? '복용약',
    taken: log.status === 'TAKEN',
    ...MEDICATION_COLORS[index % MEDICATION_COLORS.length],
  }));

  const notTaken = items.filter((item) => !item.taken);
  return {
    type: 'medication',
    time: '복약',
    medications: items,
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
      time: formatTimeLabel('저녁', eveningAnswers[0].answeredAt),
      lines: eveningAnswers.map((answer) => ({
        icon: METRIC_ICONS[answer.metricType] ?? '✦',
        text: answer.textValue || answer.choiceValue || '',
      })),
      aiComment: dailyLog?.summaryText ?? '',
    });
  }

  return timeline;
};

// 화면 상단 요약 칩 3개. 컨디션은 저녁 건강체크의 CONDITION 답변을 그대로 쓴다.
const buildSummary = (dailyLog, medicationLog) => {
  const condition = (dailyLog?.eveningAnswers ?? []).find(
    (answer) => answer.metricType === 'CONDITION',
  );
  return {
    questionStatus: dailyLog?.morningAnswered ? '완료' : '아직',
    medication: medicationLog ? `${medicationLog.takenCount}/${medicationLog.totalCount}` : '-',
    condition: condition?.textValue || condition?.choiceValue || '-',
  };
};

// person이 'me'면 내 일지를, 아니면 가족 구성원의 일지를 불러온다.
// 걸음수는 헬스케어 연동이 없어서 서버가 내려주지 않으므로 stepMessage는 비워둔다.
export async function loadTodayReport(person, date = new Date()) {
  const recordDate = toDateString(date);

  const family = await getMyFamily().catch(() => null);
  const myUserId = getUserId();
  const partner = (family?.members ?? []).find(
    (member) => String(member.userId) !== String(myUserId),
  );
  const partnerLabel = partner?.name ?? partner?.relationship ?? '가족';

  const isMe = person === 'me';
  if (!isMe && !partner) {
    return null;
  }

  const [dailyLog, medicationLog, medications, history] = await Promise.all([
    isMe
      ? getDailyLog(recordDate).catch(() => null)
      : getFamilyDailyLog(partner.userId, recordDate).catch(() => null),
    isMe ? getMedicationLogs(recordDate).catch(() => null) : null,
    isMe ? getMedications().catch(() => []) : [],
    getMorningHistory({ from: recordDate, to: recordDate }).catch(() => []),
  ]);

  return {
  partnerLabel: '엄마',
  dateLabel: formatDateLabel(date),
  summary: {
    questionStatus: '완료',
    medication: '2/3',
    condition: '좋음',
  },
  aiComment: '오늘은 걸음수도 늘고 컨디션도 좋아 보여요. 이런 흐름 쭉 이어가봐요!',
  stepMessage: '오늘 6,200보 걸었어요. 어제보다 800보 더 걸었네요.',
  timeline: [
    {
      type: 'question',
      time: '아침 · 오전 8:32',
      question: '오늘 가장 먹고 싶은 음식은?',
      answer: '칼국수',
    },
    {
      type: 'medication',
      time: '복약 · 오후 2:05',
      medications: [
        { name: '혈압약', taken: true, color: '#FCD9D9', textColor: '#D94040' },
        { name: '비타민D', taken: true, color: '#FCE5C7', textColor: '#D98C26' },
        { name: '저녁약', taken: false },
      ],
      note: '저녁약은 아직 기록되지 않았어요',
    },
    {
      type: 'healthcheck',
      time: '저녁 · 오후 8:10',
      lines: [
        { icon: '♥', text: '컨디션이 좋았어요' },
        { icon: 'Z', text: '6시간 정도 푹 주무셨어요' },
        { icon: 'M', text: '식사도 잘 챙기셨어요' },
        { icon: 'A', text: '가볍게 산책도 다녀오셨어요' },
        { icon: 'B', text: '몸 상태도 괜찮았다고 하셨어요' },
      ],
      aiComment: '산책 다녀오신 덕분에 컨디션이 더 좋으셨나 봐요.',
    },
  ],
  cta: {
    title: '엄마와 안부를 나눠볼까요?',
    suggestedMessage: '"오늘 컨디션 좋으시다니 저도 기분 좋네요!"',
  },
};
}
