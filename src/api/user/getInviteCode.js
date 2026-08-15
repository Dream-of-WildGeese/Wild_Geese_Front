import { client } from '../client';

export const getMyInviteCode = () =>
  client.post('/api/v1/users/me/invitecode');