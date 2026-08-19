// 걸음 수 시연용 데이터.
//
// 서버에 걸음 수 API가 아예 없어서(스웨거 전체를 확인했다) 화면에서 만들어 쓴다.
// 다만 아무 숫자나 쓰면 곤란한 점이 두 가지 있다.
//
//  1. 같은 날짜를 다시 열었을 때 숫자가 바뀌면 안 된다  -> 날짜로 값을 정한다
//  2. 주간 리포트의 활동량 점수(1~3)와 어긋나면 안 된다  -> 점수별 구간 안에서 고른다
//
// 그래서 '날짜 문자열로 정해지는 고정값'을 쓴다. 언제 열어도, 어느 화면에서 열어도
// 같은 날은 같은 걸음 수가 나온다.

// 활동량 점수별 걸음 수 구간
const STEP_BAND = {
  3: [5200, 8600],
  2: [3000, 5000],
  1: [800, 2600],
};

// 날짜 문자열을 숫자 하나로 접는다. (같은 날짜 -> 항상 같은 값)
const hashDate = (dateString) =>
  [...String(dateString)].reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) >>> 0, 7);

// 100보 단위로 떨어지게 골라서 '6,200보'처럼 자연스러운 숫자가 나오게 한다.
export function getMockSteps(dateString, activityScore) {
  if (!dateString) return null;
  const [low, high] = STEP_BAND[Math.round(activityScore)] ?? STEP_BAND[2];
  const slots = Math.floor((high - low) / 100) + 1;
  return low + (hashDate(dateString) % slots) * 100;
}

export const formatSteps = (steps) => Number(steps).toLocaleString('ko-KR');

// "오늘 6,200보 걸으셨어요. 어제보다 800보 더 걸으셨네요!"
export function buildStepsMessage(steps, previousSteps, isToday = true) {
  if (steps == null) return '';

  const head = `${isToday ? '오늘' : '이 날'} ${formatSteps(steps)}보 걸으셨어요.`;
  if (previousSteps == null) return head;

  const diff = steps - previousSteps;
  if (diff === 0) return `${head} 어제와 비슷하게 걸으셨어요.`;
  return diff > 0
    ? `${head} 어제보다 ${formatSteps(diff)}보 더 걸으셨네요!`
    : `${head} 어제보다 ${formatSteps(-diff)}보 적게 걸으셨어요.`;
}
