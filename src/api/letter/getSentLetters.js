import { client } from '../client';

export const getSentLetters = ({ page = 0, size = 20 } = {}) =>
  client.get('/api/v1/letters/sent', { params: { page, size } });
