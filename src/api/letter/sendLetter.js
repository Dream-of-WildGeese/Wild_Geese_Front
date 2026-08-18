import { client } from '../client';

// inputType: TEXT | VOICE | CHOICE. audioUrl은 음성 편지일 때만 채운다.
export const sendLetter = ({ toUserId, content, inputType, audioUrl }) =>
  client.post('/api/v1/letters', { toUserId, content, inputType, audioUrl });
