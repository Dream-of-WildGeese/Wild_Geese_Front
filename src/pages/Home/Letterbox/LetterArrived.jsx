import styled from 'styled-components';
import envelope from '../../../assets/letterbox/envelope.png';
import heartBadge from '../../../assets/letterbox/heart-badge.png';
import {
  PopupCard,
  PopupInnerBorder,
  PopupClose,
  PopupTitle,
  PopupSubtitle,
  PopupPrimaryButton,
} from '../../../components/PopupShell';

// Figma 35a: 안 읽은 편지가 있을 때 우체통을 열면 가장 먼저 뜨는 화면.
const EnvelopeBlock = styled.div`
  position: relative;
  width: 208px;
  height: 168px;
`;

const EnvelopeImage = styled.img`
  position: absolute;
  left: 14px;
  top: 8px;
  width: 168px;
  height: 168px;
  object-fit: contain;
`;

const HeartBadge = styled.div`
  position: absolute;
  left: 143px;
  top: -3px;
  width: 50px;
  height: 50px;

  display: flex;
  align-items: center;
  justify-content: center;

  color: #4a3a2f;
  font-family: Jua;
  font-size: 15px;

  background-image: url(${heartBadge});
  background-size: contain;
  background-repeat: no-repeat;
`;

function LetterArrived({ unreadCount, onOpen, onClose }) {
  return (
    <PopupCard $center $gap={18} $padTop={36} onClick={(event) => event.stopPropagation()}>
      <PopupInnerBorder />
      <PopupClose type="button" aria-label="닫기" onClick={onClose}>
        ✕
      </PopupClose>

      <EnvelopeBlock>
        <EnvelopeImage src={envelope} alt="" />
        <HeartBadge>{unreadCount}</HeartBadge>
      </EnvelopeBlock>

      <PopupTitle $center $size={24}>
        편지가 도착했어요!
      </PopupTitle>
      <PopupSubtitle $center>열어볼까요?</PopupSubtitle>

      <PopupPrimaryButton type="button" onClick={onOpen}>
        지금 열어볼게요
      </PopupPrimaryButton>
    </PopupCard>
  );
}

export default LetterArrived;
