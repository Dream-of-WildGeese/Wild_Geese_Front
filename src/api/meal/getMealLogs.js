import { client } from '../client';

export const getMealLogs = (date) => client.get('/api/v1/meals/logs', { params: { date } });
