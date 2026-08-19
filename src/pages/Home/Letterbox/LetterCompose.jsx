import { useCallback, useRef, useState } from 'react';
import styled from 'styled-components';
import letterPaper from '../../../assets/letterbox/letter-paper.png';
import ruledLines from '../../../assets/letterbox/ruled-lines.svg';
import heartIcon from '../../../assets/letterbox/heart.svg';
// 마이크는 오늘의 질문·저녁 체크 팝업과 같은 그림을 쓴다.
import micIcon from '../../../assets/popup/mic.png';
import { transcribeVoiceLetter } from '../../../api/letter';
import { useVoiceRecorder, voiceButtonLabel } from '../../../hooks/useVoiceRecorder';
import {
  PopupCard,
  PopupInnerBorder,
  PopupClose,
  PopupTitle,
  PopupPrimaryButton,
} from '../../../components/PopupShell';

// Figma 735:761 (16 팝업 - 우체통 편지쓰기).
//
// 괘선 그림(ruled-lines.svg)은 325x260 안에 30.5px부터 33px 간격으로 줄이 그어져 있다.
// 글자도 같은 간격(line-height 33px)으로 흘려야 줄 위에 얹힌다. 예전에는 글줄 간격이
// 29.7px이라 아래로 갈수록 줄에서 밀려났다.
const RULE_TOP = 30.5;
const RULE_GAP = 33;
const VISIBLE_LINES = 4;

// 위 여백 + 네 줄 + 아래 여백
const PAPER_HEIGHT = RULE_TOP + RULE_GAP * VISIBLE_LINES + 11;

const CloseButton = styled(PopupClose)`
  /* 카드 위쪽 여백(48px)만큼 밀려 내려오지 않도록 카드에 직접 붙인다 */
  position: absolute;
  top: 21px;
  right: 23px;
  font-size: 18px;
`;

const HeaderGroup = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
`;

const HeartIcon = styled.img`
  width: 70px;
  height: 70px;
  object-fit: contain;
`;

const Subtitle = styled.p`
  margin: 0;
  width: 100%;
  text-align: center;
  color: #a79c8e;
  font-family: 'Noto Sans KR';
  font-size: 15px;
  font-weight: 500;
  line-height: 1.45;
`;

const InputGroup = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
`;

// 편지지와 괘선을 CSS 배경으로 깔면 textarea에서 안 보이는 경우가 있어서,
// Figma 구조 그대로 그림을 두 층으로 깔고 그 위에 투명한 입력칸을 얹는다.
const PaperWrap = styled.div`
  position: relative;
  width: 100%;
  height: ${PAPER_HEIGHT}px;
  overflow: hidden;

  border: 1.3px solid rgba(74, 58, 47, 0.35);
  /* 그림이 늦게 뜨는 동안에도 흰 종이가 아니라 편지지 색이 보이게 둔다 */
  background: #faf3e6;

  &:focus-within {
    border-color: rgba(74, 58, 47, 0.6);
  }
`;

const PaperLayer = styled.img`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
`;

// 괘선은 원래 크기(325x260)의 줄 간격을 지켜야 해서 세로를 늘이지 않는다.
// 칸보다 길면 아래가 잘릴 뿐, 줄 간격은 어느 높이에서도 33px 그대로다.
const RuledLayer = styled.img`
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 260px;
  max-width: none;
  pointer-events: none;
`;

const PaperInput = styled.textarea`
  position: relative;
  width: 100%;
  height: 100%;
  padding: ${RULE_TOP}px 20px 11px;
  box-sizing: border-box;
  resize: none;

  border: none;
  background: transparent;

  color: #4a3a2f;
  font-family: Jua;
  font-size: 18px;
  line-height: ${RULE_GAP}px;

  &::placeholder {
    color: #a79c8e;
  }

  &:focus {
    outline: none;
  }
`;

// 다른 팝업의 음성 버튼처럼 칸 전체를 차지하고, 그림 아래에 설명이 붙는다.
const VoiceButton = styled.button`
  width: 100%;
  padding: 14px 12px;
  box-sizing: border-box;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;

  border-radius: 10px;
  border: 1px solid ${({ $recording }) => ($recording ? '#e6a794' : '#d8cbb8')};
  background: ${({ $recording }) => ($recording ? '#fdf0e8' : '#fffbf1')};

  &:disabled {
    opacity: 0.6;
  }
`;

// 오늘의 질문·저녁 체크는 100px로 크게 쓰지만, 여기는 아래 편지지에 글 쓸 자리를
// 남겨야 해서 절반 크기로 둔다.
const MicIcon = styled.img`
  width: 56px;
  height: 56px;
  object-fit: contain;
`;

const VoiceLabel = styled.span`
  color: ${({ $recording }) => ($recording ? '#c1553c' : '#8c8780')};
  font-family: 'Noto Sans KR';
  font-size: 14px;
  font-weight: 500;
  text-align: center;
`;

const VoiceError = styled.p`
  margin: 0;
  width: 100%;
  text-align: center;
  color: #c1553c;
  font-family: 'Noto Sans KR';
  font-size: 13px;
`;

// 눌러야 하는 버튼이라는 게 드러나도록, 올리면 한 단계 진해진다.
const SendButton = styled(PopupPrimaryButton)`
  font-size: 18px;
  cursor: pointer;
  transition: background 0.15s ease, transform 0.1s ease;

  &:hover:not(:disabled) {
    background: #cbd879;
  }

  &:active:not(:disabled) {
    background: #c2d16b;
    transform: translateY(1px);
  }
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
      <CloseButton type="button" aria-label="뒤로가기" onClick={onBack}>
        ✕
      </CloseButton>

      <HeaderGroup>
        <HeartIcon src={heartIcon} alt="" />
        <PopupTitle $center $size={24}>
          {recipientName ? `${recipientName}에게 편지 쓰기` : '가족에게 편지 쓰기'}
        </PopupTitle>
      </HeaderGroup>

      <Subtitle>
        오늘 있었던 일 하나만 적어보세요.
        <br />
        고마웠던 순간이 있었나요?
      </Subtitle>

      <InputGroup>
        <PaperWrap>
          <PaperLayer src={letterPaper} alt="" />
          <RuledLayer src={ruledLines} alt="" />
          <PaperInput
            value={message}
            onChange={(event) => {
              setMessage(event.target.value);
              // 음성으로 채운 뒤 손으로 고치면 더 이상 그 음성과 내용이 같다고 볼 수 없다.
              setAudioUrl(null);
            }}
            placeholder="여기에 편지를 적어보세요 :)"
          />
        </PaperWrap>

        <VoiceButton
          type="button"
          onClick={voice.toggle}
          disabled={!voice.supported || voice.busy}
          $recording={voice.recording}
        >
          <MicIcon src={micIcon} alt="" />
          <VoiceLabel $recording={voice.recording}>
            {voiceButtonLabel(voice)}
          </VoiceLabel>
        </VoiceButton>
      </InputGroup>

      {voice.error && <VoiceError>{voice.error.message}</VoiceError>}

      <SendButton
        type="button"
        disabled={!message.trim() || sending}
        onClick={() => onSend(message.trim(), audioUrl)}
      >
        {sending ? '보내는 중...' : '편지 보내기'}
      </SendButton>
    </PopupCard>
  );
}

export default LetterCompose;
