import { client } from '../client';

// inputType: TEXT | VOICE | CHOICE
export const sendLetter = ({ toUserId, content, inputType }) =>
  client.post('/api/v1/letters', { toUserId, content, inputType });
