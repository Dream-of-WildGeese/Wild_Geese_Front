import { client } from '../client';

export const createCheckup = (data) => client.post('/api/v1/checkups', data);