import { client } from '../client';

// 페이지네이션 응답이라 { content, totalElements, ... } 형태로 내려온다.
export const getReceivedLetters = ({ page = 0, size = 20 } = {}) =>
  client.get('/api/v1/letters/received', { params: { page, size } });
