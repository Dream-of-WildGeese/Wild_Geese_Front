import { client } from '../client';

export const unsubscribePush = () => client.delete('/api/v1/users/me/pushsubscriptions');
