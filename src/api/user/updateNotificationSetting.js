import { client } from '../client';

export const updateNotificationSetting = ({
  morningQuestionEnabled,
  eveningQuestionEnabled,
  reportEnabled,
  notificationTime,
}) =>
  client.put('/api/v1/users/me/notification-setting', {
    morningQuestionEnabled,
    eveningQuestionEnabled,
    reportEnabled,
    notificationTime,
  });
