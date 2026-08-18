import { client } from '../client';

// 건강검진 화면 통합 조회 (GET /api/v1/checkups)
export const getCheckups = (userId) =>
  client.get('/api/v1/checkups', {
    params: userId ? { userId } : {},
  });