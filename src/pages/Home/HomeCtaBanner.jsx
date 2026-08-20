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
  font-family: Jua;
  font-size: 21px;
  line-height: 1.3;
  /* 말풍선 안쪽 폭(240px)에 한 줄로 딱 맞는 크기라 여유가 크지 않다.
     혹시 넘치면 말풍선 밖으로 삐져나가는 대신 단어 단위로 줄을 바꾼다. */
  word-break: keep-all;
  text-align: center;
  color: #000;
`;

function HomeCtaBanner({ onClick }) {
  return (
    <Banner type="button" aria-label="오늘의 건강 질문" onClick={onClick} data-tour="cta">
      <BubbleImage src={speechBubble} alt="" />
      <BubbleText>오늘의 온담을 시작해보세요!</BubbleText>
    </Banner>
  );
}

export default HomeCtaBanner;
