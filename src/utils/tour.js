import { getUserId } from '../api/client';

// 시작 가이드를 봤는지 기억한다.
//
// 사람마다 따로 센다. 시연 중에 부모 계정과 자식 계정을 번갈아 보여주는데,
// 하나로 묶어두면 두 번째 계정에서 가이드가 아예 안 뜬다.
const seenKey = () => `ondam.tour.seen.${getUserId() ?? 'guest'}`;

export const hasSeenTour = () => {
  try {
    return localStorage.getItem(seenKey()) === 'yes';
  } catch {
    // 저장이 막힌 브라우저에서는 '이미 본 것'으로 친다.
    // 새로고침할 때마다 가이드가 다시 뜨는 게 더 나쁘다.
    return true;
  }
};

export const markTourSeen = () => {
  try {
    localStorage.setItem(seenKey(), 'yes');
  } catch {
    /* 저장을 못 해도 이번 회차는 그냥 끝낸다 */
  }
};

// 설정의 '가이드 다시 보기'가 쓴다.
export const resetTour = () => {
  try {
    localStorage.removeItem(seenKey());
  } catch {
    /* 지울 수 없으면 다시 보기를 포기한다 */
  }
};
