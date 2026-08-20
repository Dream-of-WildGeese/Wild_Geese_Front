import { client } from '../client';

// 가족 구성원의 특정 주 리포트 (GET /api/v1/weekly/family/{userId}?weekStartDate=)
// weekStartDate는 "2026-08-10" 형식(월요일).
export const getFamilyWeeklyReport = (userId, weekStartDate) =>
  client.get(`/api/v1/weekly/family/${userId}`, { params: { weekStartDate } });
