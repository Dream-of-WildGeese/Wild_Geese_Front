// 걸음수/수면/컨디션 등 실제 헬스케어 집계가 없어서 와이어프레임 예시 데이터로 채운다.
// 실제 연동 시 WEEKS/WEEK_DETAILS를 주간 리포트 API 응답으로 교체하면 된다.
export const WEEKS = [
  {
    id: '2026-w33',
    label: '8월 둘째주',
    range: '8/11 - 8/17',
    month: 8,
    isCurrent: true,
    summary: { me: '온담과 한 주를 마무리하며 이번 주 일상을 살펴보세요!', mom: '엄마의 리포트가 매주 일요일에 만들어져요' },
  },
  { id: '2026-w32', label: '8월 첫째주', range: '8/4 - 8/10', month: 8, summary: { me: '약 복용 잘한 주에요!', mom: '약 복용 잘한 주에요' } },
  { id: '2026-w31', label: '7월 넷째주', range: '7/28 - 8/3', month: 7, summary: { me: '컨디션 최고!', mom: '컨디션 최고!' } },
  { id: '2026-w30', label: '7월 셋째주', range: '7/21 - 7/27', month: 7, summary: { me: '피로한 주', mom: '피로한 주' } },
  { id: '2026-w29', label: '7월 둘째주', range: '7/14 - 7/20', month: 7, summary: { me: '완벽한 한 주', mom: '완벽한 한 주' } },
  { id: '2026-w28', label: '7월 첫째주', range: '7/7 - 7/13', month: 7, summary: { me: '활동량이 적은 주', mom: '활동량이 적은 주' } },
];

const DAYS = ['월', '화', '수', '목', '금', '토', '일'];

// 컨디션/식사 점수를 도트 색상으로 변환한다. 1=좋아요(초록) 2=보통이에요(노랑) 3=아쉬워요(빨강)
const DOT_COLOR = { 1: '#59a666', 2: '#f2bf59', 3: '#d96659' };

function buildWeek({ headline, headlineDesc, condition, sleepHours, meal, steps, medsTaken, adviceText, contactMessage }) {
  return {
    headline,
    headlineDesc,
    condition: DAYS.map((day, i) => ({ day, color: DOT_COLOR[condition[i]] })),
    conditionTrend: condition.filter((v) => v === 3).length >= 3 ? 'down' : condition.every((v) => v === 1) ? 'flat' : 'flat',
    conditionNote:
      condition.filter((v) => v === 3).length >= 3
        ? '컨디션이 안 좋은 날이 많았어요. 무리하지 마시고 푹 쉬어주세요.'
        : '대체로 무난한 컨디션을 유지하셨어요.',
    sleep: DAYS.map((day, i) => ({ day, hours: sleepHours[i] })),
    sleepNote: '평소와 비슷한 수면 패턴을 유지하셨어요.',
    meal: DAYS.map((day, i) => ({ day, color: DOT_COLOR[meal[i]] })),
    mealNote: '식사는 대체로 잘 챙기셨어요.',
    steps: DAYS.map((day, i) => ({ day, value: steps[i] })),
    stepsTrend: steps.every((v, i, arr) => i === 0 || v <= arr[i - 1]) ? 'down' : 'flat',
    stepsNote: (() => {
      const BASELINE_STEPS = 8000;
      const avgSteps = steps.reduce((a, b) => a + b, 0) / steps.length;
      const diff = Math.round(Math.abs(BASELINE_STEPS - avgSteps) / 100) * 100;
      return avgSteps >= BASELINE_STEPS
        ? '평소보다 걸음 수가 꾸준히 많았어요. 좋은 흐름이에요!'
        : `평소보다 하루 평균 ${diff.toLocaleString()}보 적게 걸으셨어요.`;
    })(),
    medsTaken: DAYS.map((day, i) => ({ day, taken: medsTaken[i] })),
    medsTakenCount: medsTaken.filter(Boolean).length,
    medsTotal: 21,
    medsNote: `이번 주 21번 중 ${medsTaken.filter(Boolean).length * 3}번 챙기셨어요.`,
    adviceText,
    contactMessage,
  };
}

export const WEEK_DETAILS = {
  '2026-w32': {
    me: buildWeek({
      headline: '이번 주는 활동량이 줄었어요',
      headlineDesc:
        '수요일부터 걸음 수와 컨디션이 함께 처지는 모습이 보였어요. 그래도 복약은 꾸준히 잘 챙기셨으니, 이번 주는 몸이 조금 쉬고 싶어했던 한 주였다고 봐도 좋을 것 같아요.',
      condition: [1, 2, 2, 3, 3, 3, 3],
      sleepHours: [7.5, 7.5, 5, 5, 2.5, 5, 7.5],
      meal: [1, 1, 1, 2, 1, 1, 1],
      steps: [7600, 7000, 6300, 5400, 4700, 4300, 4000],
      medsTaken: [true, true, true, false, true, true, true],
      adviceText: '가볍게 저녁 산책을 늘려보는 건 어때요? 활동량이 늘면 컨디션도 함께 좋아질 수 있어요.',
    }),
    mom: buildWeek({
      headline: '컨디션이 안 좋은 날들이 반복됐어요.',
      headlineDesc: '이번 주에는 걸음 수와 컨디션이 평소보다 조금 낮은 날들이 있었어요. 엄마에게 따뜻한 안부를 건네며 이번 주 이야기를 들어볼까요?',
      condition: [1, 2, 2, 3, 3, 3, 3],
      sleepHours: [7.5, 7.5, 5, 5, 2.5, 5, 7.5],
      meal: [1, 1, 1, 2, 1, 1, 1],
      steps: [7600, 7000, 6300, 5400, 4700, 4300, 4000],
      medsTaken: [true, true, true, false, true, true, true],
      adviceText: '이번 주말엔 엄마와 가볍게 산책하며 얘기 나눠보는 건 어때요? 활동량도 늘고 기분전환도 될 것 같아요.',
      contactMessage: '"엄마, 요즘 컨디션은 좀 어떠세요? 어디 아프신 곳은 없으세요?"',
    }),
  },
  '2026-w31': {
    me: buildWeek({
      headline: '컨디션 최고의 한 주였어요',
      headlineDesc: '이번 주는 컨디션도 좋고 수면도 안정적이었어요. 지금처럼만 유지해도 충분해요!',
      condition: [1, 1, 1, 1, 1, 2, 1],
      sleepHours: [7.5, 7.5, 7.5, 7.5, 7, 7.5, 7.5],
      meal: [1, 1, 1, 1, 1, 1, 1],
      steps: [8200, 8500, 8300, 8600, 8100, 7900, 8000],
      medsTaken: [true, true, true, true, true, true, true],
      adviceText: '지금의 좋은 리듬을 다음 주에도 이어가 보세요.',
    }),
    mom: buildWeek({
      headline: '엄마 컨디션이 최고였던 한 주',
      headlineDesc: '이번 주는 컨디션도 좋고 수면도 안정적이셨어요. 지금처럼만 유지되면 좋겠어요!',
      condition: [1, 1, 1, 1, 1, 2, 1],
      sleepHours: [7.5, 7.5, 7.5, 7.5, 7, 7.5, 7.5],
      meal: [1, 1, 1, 1, 1, 1, 1],
      steps: [8200, 8500, 8300, 8600, 8100, 7900, 8000],
      medsTaken: [true, true, true, true, true, true, true],
      adviceText: '지금의 좋은 흐름을 유지하실 수 있게 응원의 연락을 남겨보는 건 어때요?',
      contactMessage: '"요즘 컨디션 최고라니 저도 너무 기분 좋아요! 다음 주도 이렇게 지내요 :)"',
    }),
  },
  '2026-w30': {
    me: buildWeek({
      headline: '조금 피로했던 한 주예요',
      headlineDesc: '수면 시간이 짧은 날이 많았고, 그 여파로 컨디션도 함께 처졌어요. 이번 주말엔 푹 쉬어주세요.',
      condition: [2, 3, 3, 3, 2, 3, 2],
      sleepHours: [5, 4.5, 4, 4.5, 5, 5.5, 6],
      meal: [2, 2, 1, 2, 1, 1, 1],
      steps: [5200, 4800, 4200, 4000, 4500, 5000, 5300],
      medsTaken: [true, false, true, true, false, true, true],
      adviceText: '이번 주는 무리하지 마시고 수면 시간을 조금 더 확보해보는 건 어때요?',
    }),
    mom: buildWeek({
      headline: '엄마가 조금 피로하셨던 한 주',
      headlineDesc: '수면 시간이 짧은 날이 많았고, 그 여파로 컨디션도 함께 처지셨어요. 이번 주말엔 푹 쉬시도록 챙겨드리면 좋겠어요.',
      condition: [2, 3, 3, 3, 2, 3, 2],
      sleepHours: [5, 4.5, 4, 4.5, 5, 5.5, 6],
      meal: [2, 2, 1, 2, 1, 1, 1],
      steps: [5200, 4800, 4200, 4000, 4500, 5000, 5300],
      medsTaken: [true, false, true, true, false, true, true],
      adviceText: '조금 지치신 것 같으니 안부 연락을 드려보는 건 어때요?',
      contactMessage: '"엄마 요즘 많이 피곤해 보이셔서 걱정돼요. 이번 주말엔 푹 쉬세요!"',
    }),
  },
  '2026-w29': {
    me: buildWeek({
      headline: '완벽한 한 주를 보내셨어요',
      headlineDesc: '컨디션, 수면, 식사, 활동, 복약까지 모든 지표가 고르게 좋았던 한 주예요.',
      condition: [1, 1, 1, 1, 1, 1, 1],
      sleepHours: [7.5, 7.5, 7.5, 7.5, 7.5, 7.5, 7.5],
      meal: [1, 1, 1, 1, 1, 1, 1],
      steps: [8800, 8700, 8900, 9000, 8600, 8500, 8700],
      medsTaken: [true, true, true, true, true, true, true],
      adviceText: '이 완벽한 리듬을 계속 이어가 보세요!',
    }),
    mom: buildWeek({
      headline: '엄마의 완벽했던 한 주',
      headlineDesc: '컨디션, 수면, 식사, 활동, 복약까지 모든 지표가 고르게 좋았던 한 주예요.',
      condition: [1, 1, 1, 1, 1, 1, 1],
      sleepHours: [7.5, 7.5, 7.5, 7.5, 7.5, 7.5, 7.5],
      meal: [1, 1, 1, 1, 1, 1, 1],
      steps: [8800, 8700, 8900, 9000, 8600, 8500, 8700],
      medsTaken: [true, true, true, true, true, true, true],
      adviceText: '이 좋은 흐름에 칭찬의 말 한마디 건네보는 건 어때요?',
      contactMessage: '"엄마 요즘 컨디션도 좋으시고 너무 잘 지내시는 것 같아 좋아요!"',
    }),
  },
  '2026-w28': {
    me: buildWeek({
      headline: '활동량이 적었던 한 주예요',
      headlineDesc: '컨디션과 수면은 무난했지만, 걸음 수가 평소보다 많이 줄었어요. 가볍게 몸을 움직여보는 건 어때요?',
      condition: [1, 2, 1, 2, 1, 2, 1],
      sleepHours: [7, 6.5, 7, 6.5, 7, 6.5, 7],
      meal: [1, 1, 1, 1, 1, 1, 1],
      steps: [3200, 3500, 3000, 3300, 3600, 3400, 3100],
      medsTaken: [true, true, true, true, true, true, false],
      adviceText: '하루 10분이라도 가볍게 산책해보는 건 어때요?',
    }),
    mom: buildWeek({
      headline: '엄마의 활동량이 적었던 한 주',
      headlineDesc: '컨디션과 수면은 무난하셨지만, 걸음 수가 평소보다 많이 줄었어요. 가볍게 산책을 권해드리면 좋겠어요.',
      condition: [1, 2, 1, 2, 1, 2, 1],
      sleepHours: [7, 6.5, 7, 6.5, 7, 6.5, 7],
      meal: [1, 1, 1, 1, 1, 1, 1],
      steps: [3200, 3500, 3000, 3300, 3600, 3400, 3100],
      medsTaken: [true, true, true, true, true, true, false],
      adviceText: '하루 10분이라도 가볍게 산책하시도록 권해보는 건 어때요?',
      contactMessage: '"엄마, 요즘 많이 안 움직이신 것 같아요. 저랑 같이 산책 어때요?"',
    }),
  },
};
