import { client } from '../client';

// 알림 on/off와 시각을 한 번에 보낸다. reportDayOfWeek는 MONDAY~SUNDAY.
export const updateNotificationSetting = ({
  morningTime,
  morningEnabled,
  eveningTime,
  eveningEnabled,
  reportEnabled,
  reportDayOfWeek,
  medicationEnabled,
  familyReactionEnabled,
}) =>
  client.put('/api/v1/users/me/notificationsetting', {
    morningTime,
    morningEnabled,
    eveningTime,
    eveningEnabled,
    reportEnabled,
    reportDayOfWeek,
    medicationEnabled,
    familyReactionEnabled,
  });
