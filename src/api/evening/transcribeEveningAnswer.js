import { client } from '../client';

// 녹음한 답변을 서버에서 텍스트로 변환해 돌려준다(제출은 별도).
// audioFile은 File 또는 Blob.
export const transcribeEveningAnswer = (questionId, audioFile) => {
  const formData = new FormData();
  formData.append('audioFile', audioFile);
  return client.post('/api/v1/evening/answers/voice', formData, {
    params: { questionId },
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
