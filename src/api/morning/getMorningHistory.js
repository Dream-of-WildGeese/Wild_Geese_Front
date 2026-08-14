import { client } from '../client';

// from, to는 "2026-08-01" 형식의 조회 구간.
export const getMorningHistory = ({ from, to }) =>
  client.get('/api/v1/morning', { params: { from, to } });
