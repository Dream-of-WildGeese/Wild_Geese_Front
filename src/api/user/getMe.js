import { client } from '../client';

// 로그인한 사용자의 userId와 이름을 가져온다.
export const getMe = () => client.get('/api/v1/users/me');
