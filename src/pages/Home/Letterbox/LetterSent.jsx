import styled from 'styled-components';
import planeIcon from '../../../assets/letterbox/plane.png';
import {
  PopupCard,
  PopupInnerBorder,
  PopupClose,
  PopupPrimaryButton,
  PopupIcon,
} from '../../../components/PopupShell';

// 편지를 보낸 뒤 뜨는 확인 화면.
// 별도 디자인이 없어서 35a(편지 도착)와 같은 규격으로 맞췄다.
const IconBlock = styled.div`
  width: 168px;
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
  line-height: 1.5;
`;

function LetterSent({ onClose, recipientName }) {
  return (
    <PopupCard $center $gap={18} $padTop={36} onClick={(event) => event.stopPropagation()}>
      <PopupInnerBorder />
      <PopupClose type="button" aria-label="닫기" onClick={onClose}>
        ✕
      </PopupClose>

      <IconBlock>
        <PopupIcon $size={130} src={planeIcon} alt="" />
      </IconBlock>

      <TextBlock>
        <Title>편지를 보냈어요!</Title>
        <Subtitle>
          {recipientName ? `${recipientName}님께` : '가족에게'} 마음이 전해졌어요.
          <br />
          답장이 오면 우체통으로 알려드릴게요.
        </Subtitle>
      </TextBlock>

      <PopupPrimaryButton type="button" onClick={onClose}>
        확인
      </PopupPrimaryButton>
    </PopupCard>
  );
}

export default LetterSent;
