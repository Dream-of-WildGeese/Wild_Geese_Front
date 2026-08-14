import { client } from '../client';

// weekStartDate는 해당 주 월요일 날짜("2026-08-10")를 넘긴다.
export const getWeeklyReport = (weekStartDate) =>
  client.get('/api/v1/weekly', { params: { weekStartDate } });
