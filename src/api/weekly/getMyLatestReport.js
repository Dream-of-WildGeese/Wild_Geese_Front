import { client } from '../client';

export const getMyLatestReport = () => client.get('/api/v1/weekly/latest');
