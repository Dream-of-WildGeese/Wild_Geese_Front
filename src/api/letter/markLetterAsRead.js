import { client } from '../client';

export const markLetterAsRead = (letterId) =>
  client.patch(`/api/v1/letters/${letterId}/read`);
