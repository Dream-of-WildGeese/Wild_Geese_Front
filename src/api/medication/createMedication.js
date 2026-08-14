import { client } from '../client';

// scheduledTimes는 ["08:30"], daysOfWeek는 ["MONDAY"] 형태의 배열이다.
export const createMedication = ({ name, scheduledTimes, daysOfWeek }) =>
  client.post('/api/v1/medications', { name, scheduledTimes, daysOfWeek });
