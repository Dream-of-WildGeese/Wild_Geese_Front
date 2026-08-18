import { client } from '../client';
import { audioFileNameFor } from '../../utils/audio';

// 음성 편지는 이 API로 먼저 텍스트로 바꾸기만 하고(전송 X), 실제 전송은
// sendLetter(inputType: 'VOICE', audioUrl)로 따로 한다.
// audioFile은 File 또는 Blob.
export const transcribeVoiceLetter = async (audioFile) => {
  const formData = new FormData();
  // 파일명을 안 넘기면 서버에는 filename="blob"(확장자 없음)로 도착해서
  // STT가 포맷을 못 알아볼 수 있다. blob.type을 보고 확장자를 붙여 넘긴다.
  formData.append('audioFile', audioFile, audioFileNameFor(audioFile));
  // client가 기본 Content-Type을 application/json으로 고정해뒀는데(client/index.js),
  // axios는 FormData를 보내도 이 기본값을 알아서 지워주지 않는다. undefined로
  // 명시해서 지워야 브라우저가 boundary까지 채운 multipart 헤더를 대신 붙여준다.
  const { text, audioUrl } = await client.post('/api/v1/letters/voice', formData, {
    headers: { 'Content-Type': undefined },
  });
  return { transcript: text, audioUrl };
};