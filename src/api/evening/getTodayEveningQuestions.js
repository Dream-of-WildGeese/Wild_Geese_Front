import { client } from '../client';

// 저녁 건강체크 질문 묶음을 가져온다.
export const getTodayEveningQuestions = () => client.get('/api/v1/evening/today');
