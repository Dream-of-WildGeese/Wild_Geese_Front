import { client } from '../client';

export const getFamilyLatestReport = (userId) =>
  client.get(`/api/v1/weekly/family/${userId}/latest`);
