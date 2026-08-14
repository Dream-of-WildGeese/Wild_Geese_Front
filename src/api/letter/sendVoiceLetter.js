import { client } from '../client';

// audioFile은 File 또는 Blob. 서버가 변환까지 처리한다.
export const sendVoiceLetter = (toUserId, audioFile) => {
  const formData = new FormData();
  formData.append('audioFile', audioFile);
  return client.post('/api/v1/letters/voice', formData, {
    params: { toUserId },
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
