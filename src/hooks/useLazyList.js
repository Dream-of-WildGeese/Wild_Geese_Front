import { useCallback, useEffect, useState } from 'react';

// 긴 목록을 한 번에 다 그리지 않고, 바닥에 닿을 때마다 조금씩 늘린다.
//
// 편지·알림·주간 리포트·우리의 추억은 기록이 쌓일수록 목록이 길어지는데,
// 처음부터 전부 그리면 열자마자 화면이 한 번 멎는다. 보이는 만큼만 그리고,
// 바닥에 다다르면 다음 묶음을 잇는다.
//
// resetKey에는 '목록이 통째로 바뀌는 기준'을 넘긴다(달·사람 등).
// 그 값이 바뀌면 다시 처음 묶음부터 센다.
export function useLazyList(items, { step = 12, resetKey } = {}) {
  const [count, setCount] = useState(step);

  useEffect(() => {
    setCount(step);
  }, [resetKey, step]);

  const total = items?.length ?? 0;
  const hasMore = count < total;

  // 감시할 요소를 콜백 ref로 받는다. 바닥 표시는 더 있을 때만 그려지기 때문에,
  // useRef로 잡으면 요소가 생겼는지 알 수 없어 관찰이 걸리지 않는 때가 있다.
  const [sentinel, setSentinel] = useState(null);
  const sentinelRef = useCallback((node) => setSentinel(node), []);

  useEffect(() => {
    if (!sentinel || !hasMore) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setCount((prev) => prev + step);
        }
      },
      // 바닥에 완전히 닿기 조금 전에 미리 잇는다.
      { rootMargin: '160px' },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [sentinel, hasMore, step]);

  return {
    visible: (items ?? []).slice(0, count),
    hasMore,
    sentinelRef,
  };
}

export default useLazyList;
