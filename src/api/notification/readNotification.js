import { client } from '../client';

export const readNotification = (notificationId) =>
  client.patch(`/api/v1/notifications/${notificationId}/read`);
