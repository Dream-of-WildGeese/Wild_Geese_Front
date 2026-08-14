import { client } from '../client';

// 오늘의 아침 질문 + 가족의 답변까지 함께 내려온다.
export const getTodayQuestion = () => client.get('/api/v1/morning/today');
