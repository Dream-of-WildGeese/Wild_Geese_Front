import { useCallback, useEffect, useRef, useState } from 'react';

// 마이크 버튼용 녹음 훅.
// 녹음을 멈추면 오디오 Blob을 transcribe(서버 STT)로 넘기고 텍스트를 돌려준다.
//
//   const { recording, busy, error, supported, toggle } =
//     useVoiceRecorder((blob) => transcribeEveningAnswer(questionId, blob), setText);
// 서버(nginx) 업로드 한도가 1MB다. 브라우저 기본 녹음 품질(약 128kbps)로는
// 1분만 말해도 이 한도를 넘어 413으로 끊긴다. 말소리는 32kbps면 충분히 알아들으므로
// 품질을 낮춰서 같은 한도 안에 몇 배 더 담는다.
const AUDIO_BITS_PER_SECOND = 32000;

// 한도(1MB)에 조금 못 미치는 선에서 미리 걸러낸다. 넘긴 채로 보내면 서버가
// 본문을 다 읽기도 전에 끊어서, 브라우저에선 한참 멈춘 것처럼 보인다.
const MAX_UPLOAD_BYTES = 950 * 1024;

export function useVoiceRecorder(transcribe, onTranscript) {
  const [recording, setRecording] = useState(false);
  // 녹음이 끝나고 서버 변환을 기다리는 동안
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const recorderRef = useRef(null);
  const chunksRef = useRef([]);

  const supported =
    typeof navigator !== 'undefined' &&
    Boolean(navigator.mediaDevices?.getUserMedia) &&
    typeof MediaRecorder !== 'undefined';

  // 화면을 떠날 때 녹음이 돌고 있으면 마이크를 놓아준다.
  useEffect(
    () => () => {
      const recorder = recorderRef.current;
      if (recorder && recorder.state !== 'inactive') {
        recorder.stream.getTracks().forEach((track) => track.stop());
        recorder.stop();
      }
    },
    [],
  );

  const start = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // 품질 지정을 못 받는 브라우저가 있어서, 실패하면 기본값으로 녹음한다.
      let recorder;
      try {
        recorder = new MediaRecorder(stream, { audioBitsPerSecond: AUDIO_BITS_PER_SECOND });
      } catch {
        recorder = new MediaRecorder(stream);
      }
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });

        if (blob.size === 0) {
          setError(new Error('녹음된 소리가 없어요. 마이크를 확인하고 다시 말씀해주세요.'));
          return;
        }

        if (blob.size > MAX_UPLOAD_BYTES) {
          setError(new Error('녹음이 너무 길어요. 조금 나눠서 다시 말씀해주세요.'));
          return;
        }

        setBusy(true);
        try {
          const result = await transcribe(blob);
          const text = result?.transcript ?? '';
          if (text) {
            onTranscript(text);
          } else {
            setError(new Error('말씀하신 내용을 알아듣지 못했어요. 다시 시도해주세요.'));
          }
        } catch (err) {
          setError(err);
        } finally {
          setBusy(false);
        }
      };

      recorder.start();
      recorderRef.current = recorder;
      setRecording(true);
    } catch {
      // 권한 거부, 마이크 없음 등
      setError(new Error('마이크를 사용할 수 없어요. 브라우저 권한을 확인해주세요.'));
    }
  }, [transcribe, onTranscript]);

  const stop = useCallback(() => {
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop();
    }
    setRecording(false);
  }, []);

  const toggle = useCallback(() => {
    if (busy) return;
    if (recording) stop();
    else start();
  }, [busy, recording, start, stop]);

  // 오류를 팝업으로 보여주는 화면이 닫을 때 쓴다.
  const clearError = useCallback(() => setError(null), []);

  return { recording, busy, error, supported, start, stop, toggle, clearError };
}
