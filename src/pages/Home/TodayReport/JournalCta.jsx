import styled from 'styled-components';
import phoneIcon from '../../../assets/journal/cta-phone.svg';
import momIcon from '../../../assets/journal/cta-mom.png';
import bubbleImage from '../../../assets/journal/cta-bubble.png';

// Figma 31b(937:792)의 CTA Card_최종1: 가족 화면 맨 아래에만 붙는 안부 카드.
const Card = styled.div`
  width: 100%;
  padding: 20px;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;

  border-radius: 20px;
  border: 1.5px solid rgba(230, 167, 148, 0.5);
  background: rgba(251, 234, 229, 0.7);
`;

const PhoneIcon = styled.img`
  width: 70px;
  height: 70px;
  object-fit: contain;
`;

const Title = styled.p`
  margin: 0;
  width: 100%;
  text-align: center;
  color: #c97158;
  font-family: Jua;
  font-size: 22px;
`;

const BubbleRow = styled.div`
  display: flex;
  align-items: flex-start;
  width: 100%;
`;

const MomIcon = styled.img`
  width: 106px;
  height: 133px;
  margin-top: 56px;
  flex-shrink: 0;
  object-fit: contain;
`;

// 말풍선 그림 위에 글자를 얹는다. 꼬리가 아래쪽에 있어 여백을 비대칭으로 준다.
const Bubble = styled.div`
  position: relative;
  flex: 1;
  min-width: 0;
  min-height: 158px;
  margin-left: -20px;

  display: flex;
  align-items: center;
  justify-content: center;
  padding: 38px 18px 60px 22px;

  background-image: url(${bubbleImage});
  background-size: 100% 100%;
  background-repeat: no-repeat;
`;

const BubbleText = styled.p`
  margin: 0;
  text-align: center;
  color: #6b6661;
  font-family: Jua;
  font-size: 17px;
  line-height: 1.35;
  white-space: pre-line;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 10px;
  width: 100%;
`;

const CtaButton = styled.button`
  flex: 1;
  height: 48px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 14px;
  border: 1.5px solid #e6a794;
  background: transparent;

  color: #c97158;
  font-family: Jua;
  font-size: 20px;
`;

function JournalCta({ title, message, onCall, onSendLetter }) {
  return (
    <Card>
      <PhoneIcon src={phoneIcon} alt="" />
      <Title>{title}</Title>

      <BubbleRow>
        <MomIcon src={momIcon} alt="" />
        <Bubble>
          <BubbleText>{message}</BubbleText>
        </Bubble>
      </BubbleRow>

      <ButtonRow>
        <CtaButton type="button" onClick={onCall}>
          전화하기
        </CtaButton>
        <CtaButton type="button" onClick={onSendLetter}>
          편지 보내기
        </CtaButton>
      </ButtonRow>
    </Card>
  );
}

export default JournalCta;
