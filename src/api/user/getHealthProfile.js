import { client } from '../client';

export const getHealthProfile = () => client.get('/api/v1/users/me/healthprofile');
