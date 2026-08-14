import { client } from '../client';

export const updateMedication = (medicationId, { name, scheduledTimes, daysOfWeek }) =>
  client.put(`/api/v1/medications/${medicationId}`, { name, scheduledTimes, daysOfWeek });
