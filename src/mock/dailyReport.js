// 시연용 하루 건강기록. (쓰는 곳: pages/Home/TodayReport/todayReportData.js)
//
// 주간 리포트에서 요일 별을 누르면 그 날의 기록으로 들어간다. 두 화면이 어긋나면
// 바로 티가 나므로, 여기서는 새 숫자를 만들지 않고 weeklyReport.js의 요일별 값을
// 그대로 꺼내 쓴다. 주간 화면의 월요일 컨디션과 하루 화면의 컨디션은 같은 값이다.

import { getMockWeek } from './weeklyReport';

const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

// 저녁 건강체크 점수(1~3)를 선택지 문구로 되돌린다.
const CONDITION_TEXT = { 3: '좋았어요', 2: '보통이에요', 1: '힘들었어요' };
const SLEEP_TEXT = { 3: '7시간 이상 잤어요', 2: '5~7시간 잤어요', 1: '5시간도 못 잤어요' };
const MEAL_TEXT = { 3: '세 끼 모두 챙겼어요', 2: '두 끼 챙겼어요', 1: '한 끼만 먹었어요' };
const ACTIVITY_TEXT = { 3: '많이 걸었어요', 2: '조금 걸었어요', 1: '거의 안 걸었어요' };

// 아침 질문과 답변. 요일마다 달라야 하루하루가 다르게 보인다.
const MORNING_BY_ROLE = {
  parent: [
    { question: '오늘 아침 기분은 어떠세요?', answer: '푹 자고 일어나서 개운해요.' },
    { question: '어젯밤엔 잘 주무셨어요?', answer: '중간에 한 번 깼지만 다시 잘 잤어요.' },
    { question: '오늘 하고 싶은 일이 있나요?', answer: '경로당에 가서 친구들 좀 보려고요.' },
    { question: '요즘 가장 자주 하는 생각은요?', answer: '아이들 밥은 잘 챙겨 먹나 싶어요.' },
    { question: '오늘 날씨는 어떤가요?', answer: '바람이 선선해서 걷기 좋겠어요.' },
    { question: '이번 주에 좋았던 일이 있었나요?', answer: '손주가 전화를 걸어왔어요.' },
    { question: '오늘 드시고 싶은 음식이 있으세요?', answer: '따뜻한 된장찌개가 생각나네요.' },
  ],
  child: [
    { question: '오늘 아침 기분은 어떠세요?', answer: '조금 피곤하지만 괜찮아요.' },
    { question: '어젯밤엔 잘 주무셨어요?', answer: '늦게 자서 좀 부족해요.' },
    { question: '오늘 하고 싶은 일이 있나요?', answer: '일 끝나고 산책이라도 하려고요.' },
    { question: '요즘 가장 자주 하는 생각은요?', answer: '엄마한테 전화 한 번 드려야 하는데.' },
    { question: '오늘 날씨는 어떤가요?', answer: '맑아서 기분이 좋아요.' },
    { question: '이번 주에 좋았던 일이 있었나요?', answer: '오랜만에 친구를 만났어요.' },
    { question: '오늘 드시고 싶은 음식이 있으세요?', answer: '집밥이 먹고 싶어요.' },
  ],
};

const MED_NAMES_BY_ROLE = {
  parent: ['혈압약', '혈압약', '혈압약', '비타민D', '오메가3', '오메가3'],
  child: ['종합비타민'],
};

const MEDICATION_COLORS = [
  { color: '#fcd9d9', textColor: '#d94040' },
  { color: '#fce5c7', textColor: '#d98c26' },
  { color: '#dceada', textColor: '#4d8c59' },
  { color: '#dbe4f5', textColor: '#4a6ba8' },
];

const formatDateLabel = (date) =>
  `${date.getMonth() + 1}월 ${date.getDate()}일 ${WEEKDAY_LABELS[date.getDay()]}요일`;

// 월요일이 0이 되도록 맞춘다. 주간 리포트의 배열 순서와 같다.
const dayIndexOf = (date) => (date.getDay() + 6) % 7;

const buildMedications = (role, takenCount) => {
  const names = MED_NAMES_BY_ROLE[role] ?? MED_NAMES_BY_ROLE.parent;
  return names.map((name, index) => ({
    scheduleId: `mock-${index}`,
    name,
    // 앞에서부터 챙긴 것으로 본다. 개수는 주간 리포트의 그 요일 값과 같다.
    taken: index < takenCount,
    ...MEDICATION_COLORS[index % MEDICATION_COLORS.length],
  }));
};

// role: 'parent' | 'child' / weeksAgo: 이번 주가 0, 지난 주가 1
export function getMockDailyReport({ role, weeksAgo, date, personLabel, isMine }) {
  const week = getMockWeek(role, weeksAgo);
  if (!week) return null;

  const index = dayIndexOf(date);
  const condition = week.condition.daily[index];
  const sleep = week.sleep.daily[index];
  const meal = week.meal.daily[index];
  const activity = week.activity.daily[index];
  const takenCount = week.meds.daily[index];

  const morning = (MORNING_BY_ROLE[role] ?? MORNING_BY_ROLE.parent)[index];
  const medications = buildMedications(role, takenCount);
  const missed = medications.filter((item) => !item.taken);

  return {
    personLabel,
    dateLabel: formatDateLabel(date),
    summary: {
      questionStatus: '완료',
      medication: `${takenCount}/${week.meds.perDay}`,
      condition: CONDITION_TEXT[condition] ?? '-',
    },
    aiComment: '',
    eveningComment: '',
    stepMessage: '',
    timeline: [
      {
        type: 'question',
        time: '아침 · 오전 8:00',
        question: morning.question,
        answer: morning.answer,
      },
      {
        type: 'medication',
        time: '복약',
        medications,
        hasMissed: missed.length > 0,
        note:
          missed.length > 0
            ? `${missed.map((item) => item.name).join(', ')}은 기록되지 않았어요`
            : '이 날 복약을 모두 챙기셨어요',
      },
      {
        type: 'healthcheck',
        time: '저녁 · 오후 9:00',
        lines: [
          { metricType: 'CONDITION', text: CONDITION_TEXT[condition] ?? '-' },
          { metricType: 'SLEEP', text: SLEEP_TEXT[sleep] ?? '-' },
          { metricType: 'MEAL', text: MEAL_TEXT[meal] ?? '-' },
          { metricType: 'ACTIVITY', text: ACTIVITY_TEXT[activity] ?? '-' },
        ],
      },
    ],
    cta: isMine
      ? null
      : {
          title: '이제 가족과 안부를 나눠볼까요?',
          suggestedMessage: `"${week.weeklyComment}"`,
        },
  };
}
