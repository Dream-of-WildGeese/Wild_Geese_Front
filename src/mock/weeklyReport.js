// 시연용 지난 주 리포트. (쓰는 곳: pages/Home/WeeklyReport/weeklyReportData.js)
//
// 서버는 주 목록 API가 없고 이번 주 리포트 하나만 만들어져 있어서, 목록 화면이
// 사실상 비어 보인다. 지표(metrics[].daily)도 아직 전부 빈 배열이라 어느 주를 열어도
// 같은 화면이 나온다. 그래서 지난 주들만 여기 데이터로 채운다.
//
// 서버 응답(WeeklyReportResponse)과 같은 모양으로 만들어서, 로더가 '서버에 있으면
// 서버, 없으면 이것'으로 쓸 수 있게 했다. 시연 중 실제 리포트가 만들어지면 그쪽이
// 먼저 보인다. 서버에 데이터가 쌓이면 이 파일만 지우면 된다.
//
// 부모(돌봄을 받는 쪽)와 자녀(돌보는 쪽)는 생활 패턴이 달라서 세트를 나눴다.
// 화면에서 나/가족을 토글하면 서로 다른 기록이 나와야 연동된 것처럼 보인다.
//
// 눈금은 저녁 건강체크 점수와 같다(1~3, 클수록 좋음). 배열은 월~일 7일치.

// 부모: 약을 하루 여러 번 챙기고, 컨디션과 수면이 주된 관심사다.
// 한 줄평은 Figma 33_ver04에 적힌 문구를 그대로 쓴다.
const PARENT_WEEKS = [
  {
    weeklyComment: '약 복용 잘한 주에요!',
    nextWeekSuggestion: '이번 주처럼 아침 약을 거르지 않으시면 좋겠어요.',
    condition: { daily: [3, 3, 2, 3, 3, 2, 3], trend: 'UP', comment: '지난주보다 컨디션이 올라왔어요.' },
    sleep: { daily: [2, 3, 2, 3, 3, 3, 2], comment: '주말에 푹 주무셨네요.' },
    meal: { daily: [3, 3, 3, 2, 3, 3, 3], comment: '끼니를 거의 거르지 않으셨어요.' },
    activity: { daily: [2, 2, 3, 2, 3, 3, 2], trend: 'UP', comment: '산책이 늘었어요.' },
    medication: { takenCount: 40, totalCount: 42, comment: '42번 중 40번 챙기셨어요. 아주 잘하고 계세요!' },
  },
  {
    weeklyComment: '컨디션 최고!',
    nextWeekSuggestion: '좋은 흐름이에요. 잠자는 시간만 조금 더 지켜보세요.',
    condition: { daily: [3, 3, 3, 3, 3, 3, 2], trend: 'UP', comment: '한 주 내내 좋다고 답하셨어요.' },
    sleep: { daily: [2, 2, 3, 2, 2, 3, 3], comment: '주중 수면이 조금 짧았어요.' },
    meal: { daily: [3, 3, 2, 3, 3, 3, 3], comment: '식사를 잘 챙기셨어요.' },
    activity: { daily: [3, 3, 2, 3, 3, 2, 3], trend: 'UP', comment: '활동량이 꾸준했어요.' },
    medication: { takenCount: 38, totalCount: 42, comment: '42번 중 38번 챙기셨어요.' },
  },
  {
    weeklyComment: '피로한 주',
    nextWeekSuggestion: '피곤한 날이 많았어요. 저녁에 조금 일찍 쉬어보시면 어떨까요?',
    condition: { daily: [2, 1, 1, 2, 1, 2, 2], trend: 'DOWN', comment: '힘들다고 답하신 날이 많았어요.' },
    sleep: { daily: [1, 1, 2, 1, 2, 2, 1], comment: '수면이 부족한 날이 이어졌어요.' },
    meal: { daily: [2, 2, 1, 2, 2, 3, 2], comment: '식사를 거르신 날이 있었어요.' },
    activity: { daily: [1, 1, 2, 1, 1, 2, 2], trend: 'DOWN', comment: '바깥 활동이 줄었어요.' },
    medication: { takenCount: 31, totalCount: 42, comment: '42번 중 31번 챙기셨어요. 조금 놓치셨네요.' },
  },
  {
    weeklyComment: '완벽한 한 주',
    nextWeekSuggestion: '더 드릴 말씀이 없어요. 이대로만 지내주세요!',
    condition: { daily: [3, 3, 3, 3, 3, 3, 3], trend: 'UP', comment: '일주일 내내 좋았어요.' },
    sleep: { daily: [3, 3, 3, 2, 3, 3, 3], comment: '잠도 푹 주무셨어요.' },
    meal: { daily: [3, 3, 3, 3, 3, 3, 3], comment: '세 끼를 모두 챙기셨어요.' },
    activity: { daily: [3, 3, 3, 3, 2, 3, 3], trend: 'UP', comment: '매일 걸으셨어요.' },
    medication: { takenCount: 42, totalCount: 42, comment: '42번 모두 챙기셨어요. 완벽해요!' },
  },
  {
    weeklyComment: '활동량이 적은 주',
    nextWeekSuggestion: '집 앞 산책부터 하루 10분씩 시작해보시면 좋겠어요.',
    condition: { daily: [2, 2, 2, 3, 2, 2, 2], trend: 'FLAT', comment: '평소와 비슷했어요.' },
    sleep: { daily: [2, 3, 2, 2, 3, 2, 2], comment: '수면은 무난했어요.' },
    meal: { daily: [3, 2, 3, 3, 2, 3, 3], comment: '식사는 잘 챙기셨어요.' },
    activity: { daily: [1, 1, 1, 2, 1, 1, 2], trend: 'DOWN', comment: '한 주 동안 거의 나가지 않으셨어요.' },
    medication: { takenCount: 35, totalCount: 42, comment: '42번 중 35번 챙기셨어요.' },
  },
];

// 자녀: 약은 영양제 한 알 정도(하루 1번, 주 7번)라 복약 숫자가 작다.
// 대신 주중 수면이 짧고 식사가 불규칙한 쪽으로 패턴을 잡았다.
const CHILD_WEEKS = [
  {
    weeklyComment: '잠이 부족한 주',
    nextWeekSuggestion: '주중에 30분만 일찍 누워보는 건 어때요?',
    condition: { daily: [2, 2, 1, 2, 2, 3, 3], trend: 'FLAT', comment: '주중엔 지쳤다가 주말에 회복했어요.' },
    sleep: { daily: [1, 1, 1, 2, 1, 3, 3], comment: '주중 다섯 날이 부족했어요.' },
    meal: { daily: [2, 1, 2, 2, 2, 3, 3], comment: '아침을 자주 거르셨네요.' },
    activity: { daily: [3, 3, 2, 3, 3, 2, 2], trend: 'FLAT', comment: '출퇴근 덕에 활동량은 넉넉했어요.' },
    medication: { takenCount: 5, totalCount: 7, comment: '7번 중 5번 챙기셨어요.' },
  },
  {
    weeklyComment: '잘 챙겨 먹은 주',
    nextWeekSuggestion: '식사 리듬이 좋아요. 잠도 이만큼만 챙겨보세요.',
    condition: { daily: [3, 2, 3, 3, 2, 3, 3], trend: 'UP', comment: '기분 좋은 날이 많았어요.' },
    sleep: { daily: [2, 2, 1, 2, 2, 3, 3], comment: '수면은 아직 짧아요.' },
    meal: { daily: [3, 3, 3, 3, 3, 3, 2], comment: '세 끼를 거의 다 챙기셨어요.' },
    activity: { daily: [3, 2, 3, 3, 3, 3, 2], trend: 'UP', comment: '꾸준히 움직이셨어요.' },
    medication: { takenCount: 7, totalCount: 7, comment: '7번 모두 챙기셨어요!' },
  },
  {
    weeklyComment: '바쁜 한 주',
    nextWeekSuggestion: '바쁜 주였네요. 끼니만이라도 거르지 않으면 좋겠어요.',
    condition: { daily: [2, 1, 1, 1, 2, 2, 3], trend: 'DOWN', comment: '지친 날이 많았어요.' },
    sleep: { daily: [1, 1, 1, 1, 2, 2, 3], comment: '잠이 많이 모자랐어요.' },
    meal: { daily: [1, 2, 1, 1, 2, 3, 3], comment: '끼니를 자주 거르셨어요.' },
    activity: { daily: [3, 3, 3, 2, 3, 1, 1], trend: 'FLAT', comment: '주말엔 거의 쉬셨네요.' },
    medication: { takenCount: 3, totalCount: 7, comment: '7번 중 3번 챙기셨어요. 놓친 날이 많아요.' },
  },
  {
    weeklyComment: '활동량 최고!',
    nextWeekSuggestion: '많이 움직인 만큼 잘 쉬어주세요.',
    condition: { daily: [3, 3, 3, 2, 3, 3, 3], trend: 'UP', comment: '컨디션이 좋았어요.' },
    sleep: { daily: [2, 3, 2, 2, 3, 3, 3], comment: '지난주보다 잘 주무셨어요.' },
    meal: { daily: [2, 3, 2, 3, 3, 3, 3], comment: '식사도 잘 챙기셨어요.' },
    activity: { daily: [3, 3, 3, 3, 3, 3, 3], trend: 'UP', comment: '매일 많이 걸으셨어요!' },
    medication: { takenCount: 6, totalCount: 7, comment: '7번 중 6번 챙기셨어요.' },
  },
  {
    weeklyComment: '집에만 있던 주',
    nextWeekSuggestion: '하루 한 번은 바깥 공기를 쐬어보세요.',
    condition: { daily: [2, 2, 2, 2, 2, 2, 2], trend: 'FLAT', comment: '무난한 한 주였어요.' },
    sleep: { daily: [3, 3, 2, 3, 2, 3, 3], comment: '잠은 충분히 주무셨어요.' },
    meal: { daily: [2, 2, 3, 2, 2, 2, 3], comment: '식사는 그럭저럭이었어요.' },
    activity: { daily: [1, 1, 1, 1, 1, 2, 1], trend: 'DOWN', comment: '거의 나가지 않으셨어요.' },
    medication: { takenCount: 4, totalCount: 7, comment: '7번 중 4번 챙기셨어요.' },
  },
];

const WEEKS_BY_ROLE = { parent: PARENT_WEEKS, child: CHILD_WEEKS };

// role: 'parent' | 'child'
// weeksAgo: 이번 주가 0, 지난 주가 1. 이번 주는 서버 데이터를 쓰므로 목업이 없다.
export const getMockReport = (role, weeksAgo, weekStartDate) => {
  const week = (WEEKS_BY_ROLE[role] ?? PARENT_WEEKS)[weeksAgo - 1];
  if (!week) return null;

  return {
    weekStartDate,
    weeklyComment: week.weeklyComment,
    nextWeekSuggestion: week.nextWeekSuggestion,
    isBaselineSufficient: true,
    metrics: {
      CONDITION: week.condition,
      SLEEP: week.sleep,
      MEAL: week.meal,
      ACTIVITY: week.activity,
    },
    medication: week.medication,
  };
};

export const MOCK_WEEK_COUNT = PARENT_WEEKS.length;
