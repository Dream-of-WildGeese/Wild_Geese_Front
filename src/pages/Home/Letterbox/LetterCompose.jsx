import { useState } from 'react';
import styled from 'styled-components';
import letterPaper from '../../../assets/letterbox/letter-paper.png';
import ruledLines from '../../../assets/letterbox/ruled-lines.svg';
import heartIcon from '../../../assets/letterbox/heart.png';
import micIcon from '../../../assets/letterbox/mic-small.png';
import planeIcon from '../../../assets/letterbox/plane.png';
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
  border: 1px solid #d8cbb8;
  background: #fffbf1;

  color: #8c8780;
  font-family: Jua;
  font-size: 18px;
`;

function LetterCompose({ onBack, onSend, sending, recipientName }) {
  const [message, setMessage] = useState('');

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
        onChange={(event) => setMessage(event.target.value)}
        placeholder="여기에 편지를 적어보세요 :)"
      />

      {/* 음성 편지 API(POST /letters/voice)는 있지만 녹음 UI가 아직 없어 표시만 한다 */}
      <VoiceButton type="button">
        <PopupIcon $size={28} src={micIcon} alt="" />
        음성으로 적기
      </VoiceButton>

      <PopupPrimaryButton
        type="button"
        disabled={!message.trim() || sending}
        onClick={() => onSend(message.trim())}
      >
        <PopupIcon $size={30} src={planeIcon} alt="" />
        {sending ? '보내는 중...' : '편지 보내기'}
      </PopupPrimaryButton>
    </PopupCard>
  );
}

export default LetterCompose;
