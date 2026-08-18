// 브라우저 MediaRecorder가 만든 Blob은 파일명이 없어서, FormData에 그냥 append하면
// 서버에는 filename="blob"(확장자 없음)로 도착한다. STT가 파일명 확장자로 포맷을
// 짐작한다면 이것만으로 인식이 실패할 수 있어, blob.type을 보고 확장자를 붙여준다.
const EXTENSION_BY_MIME = {
  'audio/webm': 'webm',
  'audio/ogg': 'ogg',
  'audio/mp4': 'm4a',
  'audio/mpeg': 'mp3',
  'audio/wav': 'wav',
};

// MediaRecorder의 mimeType엔 종종 ';codecs=opus' 같은 접미사가 붙어서 앞부분만 본다.
export function audioFileNameFor(blob, fallback = 'recording.webm') {
  const baseType = (blob.type || '').split(';')[0].trim();
  const extension = EXTENSION_BY_MIME[baseType];
  return extension ? `recording.${extension}` : fallback;
}
