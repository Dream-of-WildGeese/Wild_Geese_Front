import { useCallback, useEffect, useRef, useState } from 'react';

// 마이크 버튼용 녹음 훅.
// 녹음을 멈추면 오디오 Blob을 transcribe(서버 STT)로 넘기고 텍스트를 돌려준다.
//
//   const { recording, busy, error, supported, toggle } =
//     useVoiceRecorder((blob) => transcribeEveningAnswer(questionId, blob), setText);
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
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });

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

  return { recording, busy, error, supported, start, stop, toggle };
}
