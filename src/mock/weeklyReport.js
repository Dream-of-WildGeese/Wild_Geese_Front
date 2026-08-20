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
// meds도 요일별이다. 하루 기록 화면이 이 값을 그대로 쓰기 때문에, 주간 화면의
// 요일별 꽃과 하루 기록의 복약 개수가 어긋나지 않는다.

// 부모: 하루 6번 복약(주 42번). 컨디션과 수면이 주된 관심사다.
// 한 줄평은 Figma 33_ver04에 적힌 문구를 그대로 쓴다.
const PARENT_WEEKS = [
  {
    weeklyComment: '약 복용 잘한 주에요!',
    nextWeekSuggestion: '가볍게 저녁 산책을 늘려보는 건 어때요? 활동량이 늘면 컨디션도 함께 좋아질 수 있어요.',
    headlineDesc:
      '약을 거의 빠짐없이 챙기셨어요. 목요일 하루만 조금 놓치셨는데, 그날은 활동량도 함께 줄었어요.',
    condition: { daily: [3, 3, 2, 3, 3, 2, 3], trend: 'UP', comment: '지난주보다 컨디션이 올라왔어요.' },
    sleep: { daily: [2, 3, 2, 3, 3, 3, 2], comment: '주말에 푹 주무셨네요.' },
    meal: { daily: [3, 3, 3, 2, 3, 3, 3], comment: '끼니를 거의 거르지 않으셨어요.' },
    activity: { daily: [2, 2, 3, 2, 3, 3, 2], trend: 'UP', comment: '산책이 늘었어요.' },
    meds: { daily: [6, 6, 6, 5, 6, 6, 5], perDay: 6, comment: '아주 잘하고 계세요!' },
  },
  {
    weeklyComment: '컨디션 최고!',
    nextWeekSuggestion: '좋은 흐름이에요. 잠자는 시간만 조금 더 지켜보세요.',
    headlineDesc:
      '한 주 내내 좋다고 답하셨어요. 다만 주중 수면이 조금 짧았으니 잠만 더 챙기시면 좋겠어요.',
    condition: { daily: [3, 3, 3, 3, 3, 3, 2], trend: 'UP', comment: '한 주 내내 좋다고 답하셨어요.' },
    sleep: { daily: [2, 2, 3, 2, 2, 3, 3], comment: '주중 수면이 조금 짧았어요.' },
    meal: { daily: [3, 3, 2, 3, 3, 3, 3], comment: '식사를 잘 챙기셨어요.' },
    activity: { daily: [3, 3, 2, 3, 3, 2, 3], trend: 'UP', comment: '활동량이 꾸준했어요.' },
    meds: { daily: [6, 5, 6, 5, 6, 5, 5], perDay: 6, comment: '대체로 잘 챙기셨어요.' },
  },
  {
    weeklyComment: '피로한 주',
    nextWeekSuggestion: '피곤한 날이 많았어요. 저녁에 조금 일찍 쉬어보시면 어떨까요?',
    headlineDesc:
      '화요일부터 컨디션과 수면이 함께 처지는 모습이 보였어요. 몸이 쉬고 싶어했던 한 주로 보여요.',
    condition: { daily: [2, 1, 1, 2, 1, 2, 2], trend: 'DOWN', comment: '힘들다고 답하신 날이 많았어요.' },
    sleep: { daily: [1, 1, 2, 1, 2, 2, 1], comment: '수면이 부족한 날이 이어졌어요.' },
    meal: { daily: [2, 2, 1, 2, 2, 3, 2], comment: '식사를 거르신 날이 있었어요.' },
    activity: { daily: [1, 1, 2, 1, 1, 2, 2], trend: 'DOWN', comment: '바깥 활동이 줄었어요.' },
    meds: { daily: [5, 4, 4, 4, 5, 4, 5], perDay: 6, comment: '조금 놓치셨네요.' },
  },
  {
    weeklyComment: '완벽한 한 주',
    nextWeekSuggestion: '더 드릴 말씀이 없어요. 이대로만 지내주세요!',
    headlineDesc: '컨디션, 식사, 복약까지 흠잡을 데가 없는 한 주였어요.',
    condition: { daily: [3, 3, 3, 3, 3, 3, 3], trend: 'UP', comment: '일주일 내내 좋았어요.' },
    sleep: { daily: [3, 3, 3, 2, 3, 3, 3], comment: '잠도 푹 주무셨어요.' },
    meal: { daily: [3, 3, 3, 3, 3, 3, 3], comment: '세 끼를 모두 챙기셨어요.' },
    activity: { daily: [3, 3, 3, 3, 2, 3, 3], trend: 'UP', comment: '매일 걸으셨어요.' },
    meds: { daily: [6, 6, 6, 6, 6, 6, 6], perDay: 6, comment: '완벽해요!' },
  },
  {
    weeklyComment: '활동량이 적은 주',
    nextWeekSuggestion: '집 앞 산책부터 하루 10분씩 시작해보시면 좋겠어요.',
    headlineDesc:
      '컨디션과 식사는 평소와 비슷했는데, 한 주 동안 바깥 활동이 눈에 띄게 줄었어요.',
    condition: { daily: [2, 2, 2, 3, 2, 2, 2], trend: 'FLAT', comment: '평소와 비슷했어요.' },
    sleep: { daily: [2, 3, 2, 2, 3, 2, 2], comment: '수면은 무난했어요.' },
    meal: { daily: [3, 2, 3, 3, 2, 3, 3], comment: '식사는 잘 챙기셨어요.' },
    activity: { daily: [1, 1, 1, 2, 1, 1, 2], trend: 'DOWN', comment: '한 주 동안 거의 나가지 않으셨어요.' },
    meds: { daily: [5, 5, 5, 5, 5, 5, 5], perDay: 6, comment: '하루 한 번씩은 놓치셨어요.' },
  },
  {
    weeklyComment: '장마에 지친 주',
    nextWeekSuggestion: '비 오는 날엔 집 안에서 스트레칭이라도 해보시면 좋겠어요.',
    headlineDesc:
      '비가 이어지면서 바깥 활동이 줄었어요. 관절이 쑤신 날에는 컨디션도 함께 떨어졌습니다.',
    condition: { daily: [2, 2, 1, 2, 2, 3, 3], trend: 'DOWN', comment: '비 오는 날에 특히 힘들어하셨어요.' },
    sleep: { daily: [2, 2, 2, 3, 3, 3, 2], comment: '잠은 그런대로 주무셨어요.' },
    meal: { daily: [3, 3, 2, 3, 3, 3, 2], comment: '입맛이 없는 날이 하루 있었어요.' },
    activity: { daily: [1, 1, 1, 2, 2, 3, 2], trend: 'DOWN', comment: '비 때문에 걷기가 어려우셨어요.' },
    meds: { daily: [6, 6, 5, 6, 6, 6, 6], perDay: 6, comment: '거의 빠짐없이 챙기셨어요.' },
  },
  {
    weeklyComment: '손주가 다녀간 주',
    nextWeekSuggestion: '좋은 기운을 이어서 이번 주도 가볍게 움직여보세요.',
    headlineDesc:
      '주말에 손주가 다녀가면서 활동량과 컨디션이 함께 올라갔어요. 식사도 잘 챙기셨습니다.',
    condition: { daily: [2, 3, 3, 3, 3, 3, 3], trend: 'UP', comment: '주말로 갈수록 좋아지셨어요.' },
    sleep: { daily: [2, 2, 3, 3, 3, 2, 3], comment: '수면이 안정적이었어요.' },
    meal: { daily: [3, 3, 3, 3, 3, 3, 3], comment: '한 끼도 거르지 않으셨어요.' },
    activity: { daily: [2, 2, 3, 3, 3, 3, 3], trend: 'UP', comment: '주말 나들이가 있었네요.' },
    meds: { daily: [6, 6, 6, 6, 5, 6, 6], perDay: 6, comment: '금요일 한 번만 놓치셨어요.' },
  },
  {
    weeklyComment: '더위에 힘든 주',
    nextWeekSuggestion: '한낮은 피하고 아침저녁으로 걸어보시면 어떨까요?',
    headlineDesc:
      '더위가 심해서 낮 활동이 어려우셨어요. 물을 자주 드시고 시원할 때 움직이시면 좋겠습니다.',
    condition: { daily: [2, 1, 2, 2, 1, 2, 2], trend: 'DOWN', comment: '더위에 지치신 날이 많았어요.' },
    sleep: { daily: [1, 2, 1, 2, 2, 2, 3], comment: '더워서 잠을 설치셨어요.' },
    meal: { daily: [2, 2, 3, 2, 2, 3, 3], comment: '입맛이 없는 날이 이어졌어요.' },
    activity: { daily: [1, 2, 1, 1, 2, 2, 2], trend: 'DOWN', comment: '한낮 외출이 어려우셨어요.' },
    meds: { daily: [5, 6, 6, 5, 6, 6, 6], perDay: 6, comment: '두 번 정도 놓치셨어요.' },
  },
  {
    weeklyComment: '차분히 지낸 주',
    nextWeekSuggestion: '지금 흐름이 좋아요. 수면 시간만 조금 더 챙겨보세요.',
    headlineDesc:
      '큰 굴곡 없이 지내신 한 주예요. 다만 주중 수면이 짧아서 그 부분만 챙기시면 좋겠습니다.',
    condition: { daily: [3, 2, 3, 2, 3, 3, 2], trend: 'FLAT', comment: '고르게 지내셨어요.' },
    sleep: { daily: [2, 1, 2, 2, 2, 3, 3], comment: '주중 수면이 짧았어요.' },
    meal: { daily: [3, 3, 3, 3, 2, 3, 3], comment: '식사는 잘 챙기셨어요.' },
    activity: { daily: [2, 3, 2, 3, 2, 3, 2], trend: 'FLAT', comment: '꾸준히 걸으셨어요.' },
    meds: { daily: [6, 6, 6, 6, 6, 5, 6], perDay: 6, comment: '토요일 한 번만 놓치셨어요.' },
  },
];

// 자녀: 영양제 한 알 정도(하루 1번, 주 7번)라 복약 숫자가 작다.
// 대신 주중 수면이 짧고 식사가 불규칙한 쪽으로 패턴을 잡았다.
const CHILD_WEEKS = [
  {
    weeklyComment: '잠이 부족한 주',
    nextWeekSuggestion: '주중에 30분만 일찍 누워보는 건 어때요?',
    headlineDesc: '주중 다섯 날 내내 잠이 모자랐어요. 주말에 몰아서 회복하는 패턴이 반복되고 있어요.',
    condition: { daily: [2, 2, 1, 2, 2, 3, 3], trend: 'FLAT', comment: '주중엔 지쳤다가 주말에 회복했어요.' },
    sleep: { daily: [1, 1, 1, 2, 1, 3, 3], comment: '주중 다섯 날이 부족했어요.' },
    meal: { daily: [2, 1, 2, 2, 2, 3, 3], comment: '아침을 자주 거르셨네요.' },
    activity: { daily: [3, 3, 2, 3, 3, 2, 2], trend: 'FLAT', comment: '출퇴근 덕에 활동량은 넉넉했어요.' },
    meds: { daily: [1, 1, 0, 1, 1, 1, 0], perDay: 1, comment: '이틀 놓치셨어요.' },
  },
  {
    weeklyComment: '잘 챙겨 먹은 주',
    nextWeekSuggestion: '식사 리듬이 좋아요. 잠도 이만큼만 챙겨보세요.',
    headlineDesc: '끼니를 거의 다 챙기셨어요. 이제 잠만 조금 더 늘리면 좋겠어요.',
    condition: { daily: [3, 2, 3, 3, 2, 3, 3], trend: 'UP', comment: '기분 좋은 날이 많았어요.' },
    sleep: { daily: [2, 2, 1, 2, 2, 3, 3], comment: '수면은 아직 짧아요.' },
    meal: { daily: [3, 3, 3, 3, 3, 3, 2], comment: '세 끼를 거의 다 챙기셨어요.' },
    activity: { daily: [3, 2, 3, 3, 3, 3, 2], trend: 'UP', comment: '꾸준히 움직이셨어요.' },
    meds: { daily: [1, 1, 1, 1, 1, 1, 1], perDay: 1, comment: '한 번도 안 빠뜨리셨어요!' },
  },
  {
    weeklyComment: '바쁜 한 주',
    nextWeekSuggestion: '바쁜 주였네요. 끼니만이라도 거르지 않으면 좋겠어요.',
    headlineDesc: '수면, 식사, 복약이 한꺼번에 무너진 주였어요. 주말에야 겨우 회복하셨네요.',
    condition: { daily: [2, 1, 1, 1, 2, 2, 3], trend: 'DOWN', comment: '지친 날이 많았어요.' },
    sleep: { daily: [1, 1, 1, 1, 2, 2, 3], comment: '잠이 많이 모자랐어요.' },
    meal: { daily: [1, 2, 1, 1, 2, 3, 3], comment: '끼니를 자주 거르셨어요.' },
    activity: { daily: [3, 3, 3, 2, 3, 1, 1], trend: 'FLAT', comment: '주말엔 거의 쉬셨네요.' },
    meds: { daily: [1, 0, 0, 1, 0, 0, 1], perDay: 1, comment: '놓친 날이 많아요.' },
  },
  {
    weeklyComment: '활동량 최고!',
    nextWeekSuggestion: '많이 움직인 만큼 잘 쉬어주세요.',
    headlineDesc: '일주일 내내 활동량이 최고치였어요. 컨디션도 덩달아 좋았고요.',
    condition: { daily: [3, 3, 3, 2, 3, 3, 3], trend: 'UP', comment: '컨디션이 좋았어요.' },
    sleep: { daily: [2, 3, 2, 2, 3, 3, 3], comment: '지난주보다 잘 주무셨어요.' },
    meal: { daily: [2, 3, 2, 3, 3, 3, 3], comment: '식사도 잘 챙기셨어요.' },
    activity: { daily: [3, 3, 3, 3, 3, 3, 3], trend: 'UP', comment: '매일 많이 걸으셨어요!' },
    meds: { daily: [1, 1, 1, 1, 1, 0, 1], perDay: 1, comment: '토요일 한 번만 놓치셨어요.' },
  },
  {
    weeklyComment: '집에만 있던 주',
    nextWeekSuggestion: '하루 한 번은 바깥 공기를 쐬어보세요.',
    headlineDesc: '잠은 충분히 주무셨는데 바깥 활동이 거의 없었어요.',
    condition: { daily: [2, 2, 2, 2, 2, 2, 2], trend: 'FLAT', comment: '무난한 한 주였어요.' },
    sleep: { daily: [3, 3, 2, 3, 2, 3, 3], comment: '잠은 충분히 주무셨어요.' },
    meal: { daily: [2, 2, 3, 2, 2, 2, 3], comment: '식사는 그럭저럭이었어요.' },
    activity: { daily: [1, 1, 1, 1, 1, 2, 1], trend: 'DOWN', comment: '거의 나가지 않으셨어요.' },
    meds: { daily: [1, 0, 1, 0, 1, 0, 1], perDay: 1, comment: '하루 걸러 놓치셨어요.' },
  },
  {
    weeklyComment: '야근이 많던 주',
    nextWeekSuggestion: '늦게 끝나는 날엔 저녁이라도 꼭 챙겨 드세요.',
    headlineDesc: '야근이 이어지면서 식사와 수면이 함께 밀렸어요.',
    condition: { daily: [2, 2, 1, 1, 2, 3, 3], trend: 'DOWN', comment: '주중에 특히 지치셨어요.' },
    sleep: { daily: [1, 1, 1, 2, 2, 3, 3], comment: '주중 수면이 많이 부족했어요.' },
    meal: { daily: [2, 1, 2, 1, 2, 3, 3], comment: '끼니를 거르신 날이 많았어요.' },
    activity: { daily: [1, 1, 2, 1, 2, 3, 2], trend: 'DOWN', comment: '움직일 틈이 없으셨네요.' },
    meds: { daily: [1, 0, 1, 0, 1, 1, 1], perDay: 1, comment: '이틀 놓치셨어요.' },
  },
  {
    weeklyComment: '운동을 시작한 주',
    nextWeekSuggestion: '시작이 좋아요. 이번 주도 같은 흐름으로 가봐요.',
    headlineDesc: '퇴근 후 운동을 시작하면서 활동량이 크게 늘었어요.',
    condition: { daily: [2, 3, 3, 2, 3, 3, 3], trend: 'UP', comment: '몸이 가벼워지셨네요.' },
    sleep: { daily: [2, 2, 3, 2, 3, 3, 3], comment: '잠도 함께 좋아졌어요.' },
    meal: { daily: [2, 3, 3, 2, 3, 3, 2], comment: '식사가 규칙적이었어요.' },
    activity: { daily: [3, 3, 2, 3, 3, 3, 2], trend: 'UP', comment: '거의 매일 운동하셨어요.' },
    meds: { daily: [1, 1, 1, 1, 1, 1, 1], perDay: 1, comment: '한 번도 안 빠뜨리셨어요!' },
  },
  {
    weeklyComment: '감기로 쉰 주',
    nextWeekSuggestion: '아직 회복 중이니 무리하지 마시고 푹 쉬세요.',
    headlineDesc: '주 중반에 감기를 앓으면서 컨디션이 크게 떨어졌어요.',
    condition: { daily: [2, 1, 1, 1, 2, 2, 3], trend: 'DOWN', comment: '아프셨던 한 주네요.' },
    sleep: { daily: [2, 3, 3, 3, 2, 2, 3], comment: '푹 쉬면서 잠은 많이 주무셨어요.' },
    meal: { daily: [2, 1, 1, 2, 2, 3, 3], comment: '입맛이 없으셨어요.' },
    activity: { daily: [1, 1, 1, 1, 1, 2, 2], trend: 'DOWN', comment: '거의 누워 지내셨어요.' },
    meds: { daily: [1, 1, 0, 1, 1, 1, 1], perDay: 1, comment: '한 번만 놓치셨어요.' },
  },
  {
    weeklyComment: '평범하게 지낸 주',
    nextWeekSuggestion: '잠자는 시간만 조금 앞당겨보면 어떨까요?',
    headlineDesc: '특별한 일 없이 무난하게 지나간 한 주였어요.',
    condition: { daily: [2, 2, 3, 2, 2, 3, 2], trend: 'FLAT', comment: '고르게 지내셨어요.' },
    sleep: { daily: [2, 2, 2, 1, 2, 3, 3], comment: '목요일만 많이 부족했어요.' },
    meal: { daily: [2, 3, 2, 2, 3, 3, 2], comment: '식사는 그런대로 챙기셨어요.' },
    activity: { daily: [2, 2, 2, 2, 3, 2, 2], trend: 'FLAT', comment: '꾸준히 움직이셨어요.' },
    meds: { daily: [1, 1, 1, 0, 1, 1, 0], perDay: 1, comment: '두 번 놓치셨어요.' },
  },
];

const WEEKS_BY_ROLE = { parent: PARENT_WEEKS, child: CHILD_WEEKS };

const sum = (numbers) => numbers.reduce((total, value) => total + value, 0);

// role: 'parent' | 'child'
// weeksAgo: 이번 주가 0, 지난 주가 1. 이번 주는 서버 데이터를 쓰므로 목업이 없다.
export const getMockWeek = (role, weeksAgo) =>
  (WEEKS_BY_ROLE[role] ?? PARENT_WEEKS)[weeksAgo - 1] ?? null;

export const getMockReport = (role, weeksAgo, weekStartDate) => {
  const week = getMockWeek(role, weeksAgo);
  if (!week) return null;

  const takenCount = sum(week.meds.daily);
  const totalCount = week.meds.perDay * week.meds.daily.length;

  return {
    weekStartDate,
    weeklyComment: week.weeklyComment,
    weeklyDetail: week.headlineDesc,
    nextWeekSuggestion: week.nextWeekSuggestion,
    isBaselineSufficient: true,
    metrics: {
      CONDITION: week.condition,
      SLEEP: week.sleep,
      MEAL: week.meal,
      ACTIVITY: week.activity,
    },
    // 요일별 복약을 함께 넘겨서 주간 화면이 꽃/빈 원을 실제 기록대로 그릴 수 있게 한다.
    medication: {
      takenCount,
      totalCount,
      daily: week.meds.daily,
      perDay: week.meds.perDay,
      comment: `${totalCount}번 중 ${takenCount}번 챙기셨어요. ${week.meds.comment}`,
    },
  };
};

// 이번 주는 아직 쌓이는 중이다. 오늘까지만 채우고 남은 요일은 비워 둔다.
// 지난 주 세트 중 하나를 빌려 쓰되 앞부분만 잘라서, 지난 주와 흐름이 이어져 보이게 한다.
// daysFilled: 월요일부터 오늘까지 며칠치인지 (월요일이면 1)
const cut = (values, daysFilled) => values.slice(0, daysFilled);

export const getMockCurrentWeek = (role, daysFilled, weekStartDate) => {
  const week = getMockWeek(role, 1);
  if (!week || daysFilled <= 0) return null;

  const meds = cut(week.meds.daily, daysFilled);
  const takenCount = sum(meds);
  const totalCount = week.meds.perDay * meds.length;

  return {
    weekStartDate,
    // 아직 한 주가 안 끝나서 총평 대신 진행 중이라는 걸 알린다.
    weeklyComment: '이번 주는 아직 쌓이는 중이에요',
    weeklyDetail: `지금까지 ${daysFilled}일치 기록이 담겼어요. 일요일에 이번 주 리포트가 만들어져요.`,
    nextWeekSuggestion: '',
    isBaselineSufficient: true,
    inProgress: true,
    metrics: {
      CONDITION: { daily: cut(week.condition.daily, daysFilled), trend: 'FLAT', comment: week.condition.comment },
      SLEEP: { daily: cut(week.sleep.daily, daysFilled), comment: week.sleep.comment },
      MEAL: { daily: cut(week.meal.daily, daysFilled), comment: week.meal.comment },
      ACTIVITY: { daily: cut(week.activity.daily, daysFilled), trend: 'FLAT', comment: week.activity.comment },
    },
    medication: {
      takenCount,
      totalCount,
      daily: meds,
      perDay: week.meds.perDay,
      comment: `지금까지 ${totalCount}번 중 ${takenCount}번 챙기셨어요.`,
    },
  };
};

export const MOCK_WEEK_COUNT = PARENT_WEEKS.length;
