import { client } from '../client';

export const joinFamily = ({ inviteCode }) =>
  client.post('/api/v1/families/join', { inviteCode });
