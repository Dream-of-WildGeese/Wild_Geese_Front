import { client } from '../client';

export const subscribePush = ({ token }) =>
  client.post('/api/v1/users/me/push-subscription', { token });
