import { useCallback, useEffect, useRef, useState } from 'react';

// 화면마다 반복되던 loading/error/data 상태를 한곳에 모아둔다.
// api 함수는 src/api/* 의 모듈을 그대로 넘기면 된다.
//
//   const { data, loading, error, refetch } = useApi(getMyFamily);
//   const { data } = useApi(getLetter, { args: [letterId], enabled: !!letterId });
export function useApi(apiFn, { args = [], enabled = true, initialData = null } = {}) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);

  // args를 문자열로 굳혀서 매 렌더마다 새 배열이 만들어져도 재요청이 돌지 않게 한다.
  const argsKey = JSON.stringify(args);
  // 응답이 늦게 도착한 이전 요청이 최신 결과를 덮어쓰지 않도록 요청 순번을 센다.
  const requestIdRef = useRef(0);

  const run = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);
    try {
      const result = await apiFn(...JSON.parse(argsKey));
      if (requestId !== requestIdRef.current) return;
      setData(result);
      return result;
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setError(err);
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [apiFn, argsKey]);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    run();
    // 언마운트되면 순번을 올려서 뒤늦은 응답의 setState를 막는다.
    return () => {
      requestIdRef.current += 1;
    };
  }, [enabled, run]);

  return { data, loading, error, refetch: run, setData };
}

// 버튼 클릭처럼 사용자가 직접 실행하는 요청(생성/수정/삭제)에 쓴다.
//
//   const { execute, loading, error } = useApiAction(joinFamily);
//   const onSubmit = async () => {
//     const { ok } = await execute({ inviteCode });
//     if (ok) navigate('/home');
//   };
export function useApiAction(apiFn) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 삭제처럼 응답 본문이 없는 API는 성공해도 data가 undefined라, 반환값만으로는
  // 성공/실패를 구분할 수 없다. 그래서 ok 플래그를 따로 실어 보낸다.
  const execute = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiFn(...args);
        return { ok: true, data, error: null };
      } catch (err) {
        setError(err);
        return { ok: false, data: null, error: err };
      } finally {
        setLoading(false);
      }
    },
    [apiFn],
  );

  return { execute, loading, error };
}
