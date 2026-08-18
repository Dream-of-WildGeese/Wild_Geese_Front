import { client } from '../client';

// 리포트가 만들어진 주 목록 (GET /api/v1/weekly/history)
// weekStartDate / weekEndDate / weeklyComment 만 담겨 온다. 자세한 지표는 /weekly로 따로 받는다.
export const getWeeklyHistory = () => client.get('/api/v1/weekly/history');
