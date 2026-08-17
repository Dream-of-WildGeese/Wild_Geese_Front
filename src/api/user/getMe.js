import { client } from '../client';

export const getMe = () => client.get('/api/v1/users/me');
