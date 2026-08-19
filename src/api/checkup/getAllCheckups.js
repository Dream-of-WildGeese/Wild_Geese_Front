import { client } from '../client';

// 검진 전체 목록 조회 (GET /api/v1/checkups/all)
// getCheckups(/checkups)는 "가장 가까운 미래 검진" 1개만 내려줘서, 미래 검진이
// 2개 이상이면 나머지가 응답에서 통째로 빠지는 문제가 있었다. 이 엔드포인트는
// 완료 여부와 무관하게 전체를 배열로 내려줘서 그 문제가 없다.
export const getAllCheckups = (userId) =>
  client.get('/api/v1/checkups/all', {
    params: userId ? { userId } : {},
  });
