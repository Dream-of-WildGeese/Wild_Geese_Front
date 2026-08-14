import { client } from '../client';

// 다른 구성원을 가족에서 내보낸다.
export const removeMember = (userId) =>
  client.delete(`/api/v1/families/me/members/${userId}`);
