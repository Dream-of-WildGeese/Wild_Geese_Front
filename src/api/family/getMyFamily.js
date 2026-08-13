import { client } from '../client';

export const getMyFamily = () => client.get('/api/v1/families/me');
