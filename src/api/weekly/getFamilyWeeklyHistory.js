import { client } from '../client';

// 가족 구성원이 리포트를 만든 주 목록 (GET /api/v1/weekly/family/{userId}/history)
// weekStartDate / weekEndDate / weeklyComment 만 담겨 온다. getWeeklyHistory의 가족용 짝.
export const getFamilyWeeklyHistory = (userId) =>
  client.get(`/api/v1/weekly/family/${userId}/history`);
