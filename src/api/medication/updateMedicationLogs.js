import { client } from '../client';

// logs는 [{ scheduleId, status }] 형태로, 하루치를 한 번에 덮어쓴다.
export const updateMedicationLogs = ({ recordDate, logs }) =>
  client.put('/api/v1/medications/logs', { recordDate, logs });
