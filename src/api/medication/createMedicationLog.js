import { client } from '../client';

// status: TAKEN | NOT_RECORDED
export const createMedicationLog = ({ scheduleId, recordDate, status }) =>
  client.post('/api/v1/medications/logs', { scheduleId, recordDate, status });
