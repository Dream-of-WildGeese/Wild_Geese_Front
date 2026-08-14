import { client } from '../client';

// date는 "2026-08-15" 형식.
export const getMedicationLogs = (date) =>
  client.get('/api/v1/medications/logs', { params: { date } });
