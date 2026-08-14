import { client } from '../client';

// 내가 속한 가족에서 스스로 나간다.
export const leaveFamily = () => client.delete('/api/v1/families/me');
