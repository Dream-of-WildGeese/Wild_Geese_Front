import { client } from '../client';

// 특정 사용자를 가족에서 내보내거나(targetUserId != 나) 스스로 나간다(targetUserId == 나).
export const leaveFamily = (targetUserId) =>
  client.delete(`/api/v1/families/me/members/${targetUserId}`);
