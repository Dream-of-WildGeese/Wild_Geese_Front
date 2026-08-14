import { client } from '../client';

export const getFamilyDailyLog = (userId, date) =>
  client.get(`/api/v1/daily/family/${userId}`, { params: { date } });
