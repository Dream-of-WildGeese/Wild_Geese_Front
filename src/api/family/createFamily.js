import { client } from '../client';

// 가족을 만들고 초대코드를 발급받는다.
export const createFamily = () => client.post('/api/v1/families');
