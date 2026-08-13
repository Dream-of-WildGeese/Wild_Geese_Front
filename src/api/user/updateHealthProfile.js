import { client } from '../client';

export const updateHealthProfile = ({ diseases, interests }) =>
  client.put('/api/v1/users/me/health-profile', { diseases, interests });
