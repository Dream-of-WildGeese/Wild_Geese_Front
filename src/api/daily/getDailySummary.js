import { client } from '../client';

// 캘린더에 점 찍을 용도라 기간 전체의 요약만 내려온다.
export const getDailySummary = ({ from, to, userId }) =>
  client.get('/api/v1/daily/summary', { params: { from, to, userId } });
