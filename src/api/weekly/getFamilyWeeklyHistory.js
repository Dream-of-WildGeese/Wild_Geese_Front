import { client } from '../client';

// 가족 구성원의 주차별 한줄평 목록 (GET /api/v1/weekly/family/{userId}/history)
// weekStartDate / weekEndDate / weeklyComment만 담겨 온다. 자세한 지표는 못 준다
// (특정 지난 주의 전체 리포트를 조회하는 API는 최신 것 하나뿐이다).
export const getFamilyWeeklyHistory = (userId) =>
  client.get(`/api/v1/weekly/family/${userId}/history`);
