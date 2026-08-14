import { client } from '../client';

export const getNotificationSetting = () => client.get('/api/v1/users/me/notificationsetting');
