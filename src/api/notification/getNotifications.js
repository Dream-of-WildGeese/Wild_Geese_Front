import { client } from '../client';
import { fetchLatestPage } from '../../utils/paging';

// 편지 목록과 마찬가지로 오래된 순으로 내려온다. 첫 페이지만 받으면 새 알림을
// 놓치기 때문에 최신까지 들어오도록 감싼다.
export const getNotifications = ({ size = 30 } = {}) =>
  fetchLatestPage(
    ({ page, size: pageSize }) =>
      client.get('/api/v1/notifications', { params: { page, size: pageSize } }),
    size,
  );
