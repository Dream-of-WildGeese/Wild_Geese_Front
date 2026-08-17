import { client } from '../client';

// 온보딩에서 저장한 건강 프로필(생년월일·성별·질병·관심사)을 가져온다.
export const getHealthProfile = () => client.get('/api/v1/users/me/healthprofile');
