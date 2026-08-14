import { client } from '../client';

// answers는 [{ questionId, textValue, choiceValue, inputType }] 형태로 한 번에 제출한다.
export const submitEveningAnswers = (answers) =>
  client.post('/api/v1/evening/answers', { answers });
