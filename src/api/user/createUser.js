import { client, setUserId, setInviteCode } from '../client';

// role: PARENT | CHILD
// 가입 응답에만 inviteCode가 담겨오고 재조회 API가 없어서, 여기서 함께 저장해둔다.
export const createUser = async ({ email, password, name, role }) => {
  const data = await client.post('/api/v1/users', { email, password, name, role });
  if (data?.userId) {
    setUserId(data.userId);
  }
  if (data?.inviteCode) {
    setInviteCode(data.inviteCode);
  }
  return data;
};
