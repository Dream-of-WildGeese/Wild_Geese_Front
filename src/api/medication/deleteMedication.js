import { client } from '../client';

export const deleteMedication = (medicationId) =>
  client.delete(`/api/v1/medications/${medicationId}`);
