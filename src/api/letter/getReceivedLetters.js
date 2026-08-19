import { client } from '../client';
import { fetchLatestPage } from '../../utils/paging';

// 페이지네이션 응답이라 { content, totalElements, ... } 형태로 내려온다.
//
// 서버가 오래된 순으로 주고 sort도 안 받아서, 첫 페이지만 받으면 새로 온 편지가
// 뒤 페이지에 남아 화면에 안 나타난다. 최신까지 들어오도록 fetchLatestPage로 감싼다.
export const getReceivedLetters = ({ size = 20 } = {}) =>
  fetchLatestPage(
    ({ page, size: pageSize }) =>
      client.get('/api/v1/letters/received', { params: { page, size: pageSize } }),
    size,
  );
