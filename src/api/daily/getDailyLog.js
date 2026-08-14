import { client } from '../client';

// 내 하루 일지(아침 답변 + 저녁 답변 + 복약/식사)를 날짜 단위로 가져온다.
export const getDailyLog = (date) => client.get('/api/v1/daily', { params: { date } });
