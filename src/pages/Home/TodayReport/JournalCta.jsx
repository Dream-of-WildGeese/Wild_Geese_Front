import styled from 'styled-components';
import phoneIcon from '../../../assets/journal/cta-phone.png';
import momIcon from '../../../assets/journal/cta-mom.png';
import bubbleImage from '../../../assets/journal/cta-bubble.png';

// Figma 31b의 CTA Card_최종3: 가족 화면 맨 아래에만 붙는 안부 카드.
const Card = styled.div`
  width: 100%;
  padding: 20px;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;

  border-radius: 20px;
  border: 1.5px solid rgba(217, 138, 74, 0.5);
  background: #fbe3d0;
`;

const PhoneIcon = styled.img`
  width: 80px;
  height: 80px;
  object-fit: contain;
`;

const Title = styled.p`
  margin: 0;
  width: 100%;
  text-align: center;
  color: #c97a3d;
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
  margin-top: 45px;
  flex-shrink: 0;
  object-fit: contain;
`;

const Bubble = styled.div`
  position: relative;
  flex: 1;
  min-width: 0;
  min-height: 150px;

  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30px 26px 40px 8px;

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
