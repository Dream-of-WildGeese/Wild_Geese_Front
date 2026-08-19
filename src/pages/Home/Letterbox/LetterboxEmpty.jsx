import styled from 'styled-components';
import envelopeEmpty from '../../../assets/letterbox/envelope-empty-img.svg';
import {
  PopupCard,
  PopupInnerBorder,
  PopupClose,
  PopupPrimaryButton,
  PopupIcon,
} from '../../../components/PopupShell';

// Figma 35c ver02: 받은 편지가 없을 때. 35a와 같은 틀이지만 봉투 그림과 문구가 다르다.
const EnvelopeBlock = styled.div`
  width: 208px;
  height: 168px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const TextBlock = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  text-align: center;
`;

const Title = styled.p`
  margin: 0;
  color: #4a3a2f;
  font-family: 'Noto Sans KR';
  font-size: 24px;
  font-weight: 700;
`;

const Subtitle = styled.p`
  margin: 0;
  color: #a79c8e;
  font-family: 'Noto Sans KR';
  font-size: 16px;
  font-weight: 500;
`;

function LetterboxEmpty({ onWrite, onClose }) {
  return (
    <PopupCard $center $gap={18} $padTop={36} onClick={(event) => event.stopPropagation()}>
      <PopupInnerBorder />
      <PopupClose type="button" aria-label="닫기" onClick={onClose}>
        ✕
      </PopupClose>

      <EnvelopeBlock>
        <PopupIcon $size={168} src={envelopeEmpty} alt="" />
      </EnvelopeBlock>

      <TextBlock>
        <Title>아직 편지가 없어요!</Title>
        <Subtitle>편지를 남겨볼까요?</Subtitle>
      </TextBlock>

      <PopupPrimaryButton type="button" onClick={onWrite}>
        편지 쓰러가기
      </PopupPrimaryButton>
    </PopupCard>
  );
}

export default LetterboxEmpty;
