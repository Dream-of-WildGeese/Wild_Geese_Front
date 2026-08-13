import { client, setUserId } from '../client';

// 이름, 역할, 출생연도로 사용자를 생성하고 온보딩을 시작한다.
export const createUser = async ({ name, role, birthYear }) => {
  const data = await client.post('/api/v1/users', { name, role, birthYear });
  if (data?.userId) {
    setUserId(data.userId);
  }
  return data;
};
