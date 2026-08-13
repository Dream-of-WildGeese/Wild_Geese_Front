import styled from 'styled-components';
import speechBubble from '../../assets/speech-bubble.svg';

const Banner = styled.button`
  position: absolute;
  left: 72px;
  top: 146px;
  width: 264px;
  height: 129px;
`;

const BubbleImage = styled.img`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
`;

const BubbleText = styled.p`
  position: absolute;
  left: 12px;
  right: 12px;
  top: 58px;
  margin: 0;
  font-size: 16px;
  white-space: nowrap;
  text-align: center;
  color: #000;
`;

function HomeCtaBanner({ onClick }) {
  return (
    <Banner type="button" aria-label="오늘의 건강 질문" onClick={onClick}>
      <BubbleImage src={speechBubble} alt="" />
      <BubbleText>오늘의 온담을 시작해보세요!</BubbleText>
    </Banner>
  );
}

export default HomeCtaBanner;
