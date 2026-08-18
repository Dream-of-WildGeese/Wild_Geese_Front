import { useCallback, useRef, useState } from 'react';
import styled from 'styled-components';
import letterPaper from '../../../assets/letterbox/letter-paper.png';
import ruledLines from '../../../assets/letterbox/ruled-lines.svg';
import heartIcon from '../../../assets/letterbox/heart.png';
import micIcon from '../../../assets/letterbox/mic-small.png';
import planeIcon from '../../../assets/letterbox/plane.png';
import { transcribeVoiceLetter } from '../../../api/letter';
import { useVoiceRecorder } from '../../../hooks/useVoiceRecorder';
import {
  PopupCard,
  PopupInnerBorder,
  PopupClose,
  PopupTitle,
  PopupSubtitle,
  PopupPrimaryButton,
  PopupIcon,
} from '../../../components/PopupShell';

// Figma 16: 편지쓰기. 입력칸이 편지지 이미지 위에 얹힌다.
const PaperInput = styled.textarea`
  width: 100%;
  height: 260px;
  padding: 32px 18px 18px;
  resize: none;

  border: 1.3px solid rgba(74, 58, 47, 0.35);
  border-radius: 4px;

  background-image: url(${ruledLines}), url(${letterPaper});
  background-size: 100% 100%, cover;
  background-repeat: no-repeat, no-repeat;

  color: #4a3a2f;
  font-family: Jua;
  font-size: 18px;
  line-height: 1.65;

  &::placeholder {
    color: #a79c8e;
  }

  &:focus {
    outline: none;
    border-color: rgba(74, 58, 47, 0.6);
  }
`;

const VoiceButton = styled.button`
  width: 146px;
  height: 50px;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  border-radius: 100px;
  border: 1px solid ${({ $recording }) => ($recording ? '#e6a794' : '#d8cbb8')};
  background: ${({ $recording }) => ($recording ? '#fdf0e8' : '#fffbf1')};

  color: ${({ $recording }) => ($recording ? '#c1553c' : '#8c8780')};
  font-family: Jua;
  font-size: 18px;

  &:disabled {
    opacity: 0.6;
  }
`;

const VoiceError = styled.p`
  margin: 0;
  width: 100%;
  text-align: center;
  color: #c1553c;
  font-family: 'Noto Sans KR';
  font-size: 13px;
`;

function LetterCompose({ onBack, onSend, sending, recipientName }) {
  const [message, setMessage] = useState('');
  // 음성으로 적은 편지인지 구분해서 보낼 때 inputType/audioUrl을 결정한다.
  // 텍스트를 손으로 더 고치더라도, 이번 편지가 음성에서 나왔다는 사실 자체는 유지한다.
  const [audioUrl, setAudioUrl] = useState(null);
  const lastAudioUrlRef = useRef(null);

  // useVoiceRecorder는 transcript 문자열만 넘겨주므로, audioUrl은 클로저에 잠깐 담아둔다.
  const transcribe = useCallback(async (blob) => {
    const result = await transcribeVoiceLetter(blob);
    lastAudioUrlRef.current = result.audioUrl;
    return result;
  }, []);
  const handleTranscript = useCallback((text) => {
    setMessage(text);
    setAudioUrl(lastAudioUrlRef.current);
  }, []);
  const voice = useVoiceRecorder(transcribe, handleTranscript);

  return (
    <PopupCard $center $gap={18} $padTop={48} onClick={(event) => event.stopPropagation()}>
      <PopupInnerBorder />
      <PopupClose type="button" aria-label="뒤로가기" onClick={onBack}>
        ✕
      </PopupClose>

      <PopupIcon $size={76} src={heartIcon} alt="" />
      <PopupTitle $center $size={24}>
        {recipientName ? `${recipientName}에게 편지 쓰기` : '가족에게 편지 쓰기'}
      </PopupTitle>
      <PopupSubtitle $center>
        오늘 있었던 일 하나만 적어보세요.
        <br />
        고마웠던 순간이 있었나요?
      </PopupSubtitle>

      <PaperInput
        value={message}
        onChange={(event) => {
          setMessage(event.target.value);
          // 음성으로 채운 뒤 손으로 고치면 더 이상 그 음성과 내용이 같다고 볼 수 없다.
          setAudioUrl(null);
        }}
        placeholder="여기에 편지를 적어보세요 :)"
      />

      <VoiceButton
        type="button"
        onClick={voice.toggle}
        disabled={!voice.supported || voice.busy}
        $recording={voice.recording}
      >
        <PopupIcon $size={28} src={micIcon} alt="" />
        {!voice.supported
          ? '음성 미지원'
          : voice.busy
            ? '옮겨 적는 중...'
            : voice.recording
              ? '눌러서 멈추기'
              : '음성으로 적기'}
      </VoiceButton>
      {voice.error && <VoiceError>{voice.error.message}</VoiceError>}

      <PopupPrimaryButton
        type="button"
        disabled={!message.trim() || sending}
        onClick={() => onSend(message.trim(), audioUrl)}
      >
        <PopupIcon $size={30} src={planeIcon} alt="" />
        {sending ? '보내는 중...' : '편지 보내기'}
      </PopupPrimaryButton>
    </PopupCard>
  );
}

export default LetterCompose;
