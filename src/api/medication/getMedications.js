import { client } from '../client';

// 등록해둔 복용약 목록을 전부 가져온다.
export const getMedications = () => client.get('/api/v1/medications');
