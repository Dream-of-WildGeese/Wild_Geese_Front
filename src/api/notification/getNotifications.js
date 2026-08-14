import { client } from '../client';

export const getNotifications = ({ page = 0, size = 20 } = {}) =>
  client.get('/api/v1/notifications', { params: { page, size } });
