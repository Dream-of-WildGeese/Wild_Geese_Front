import { client } from './client';

// 가족을 만들고 초대코드를 발급받는다.
export const createFamily = () => client.post('/api/v1/families');

export const joinFamily = ({ inviteCode }) =>
  client.post('/api/v1/families/join', { inviteCode });

export const getMyFamily = () => client.get('/api/v1/families/me');

// 특정 사용자를 가족에서 내보내거나(targetUserId != 나) 스스로 나간다(targetUserId == 나).
export const leaveFamily = (targetUserId) =>
  client.delete(`/api/v1/families/me/members/${targetUserId}`);
