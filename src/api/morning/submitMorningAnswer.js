import { client } from '../client';

// inputType: TEXT | VOICE | CHOICE
export const submitMorningAnswer = (questionId, { textValue, inputType }) =>
  client.post(`/api/v1/morning/${questionId}/answers`, { textValue, inputType });
