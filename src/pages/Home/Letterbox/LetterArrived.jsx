import styled from 'styled-components';
import envelopeFlap from '../../../assets/letterbox/envelope-flap.svg';

const Card = styled.div`
  width: 100%;
  max-width: 300px;
  padding: 32px 28px 28px;
  border-radius: 24px;
  background: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
`;

const EnvelopeWrap = styled.button`
  position: relative;
  width: 140px;
  height: 100px;
`;

const EnvelopeBody = styled.div`
  position: absolute;
  left: 0;
  top: 10px;
  width: 140px;
  height: 90px;
  border-radius: 8px;
  background: #fae5d9;
  border: 1.5px solid #e8734a;
`;

const EnvelopeFlap = styled.img`
  position: absolute;
  left: 0;
  top: 0;
  width: 140px;
  height: 55px;
`;

const Badge = styled.span`
  position: absolute;
  right: -4px;
  top: -4px;
  width: 24px;
  height: 24px;
  border-radius: 12px;
  background: #e8734a;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Title = styled.p`
  margin: 6px 0 0;
  font-size: 19px;
  font-weight: 600;
  color: #000;
`;

const Desc = styled.p`
  margin: 0;
  font-size: 14px;
  color: #8c8780;
`;

const Hint = styled.button`
  margin-top: 4px;
  font-size: 13px;
  font-weight: 500;
  color: #e8734a;
`;

function LetterArrived({ unreadCount, onOpen }) {
  return (
    <Card>
      <EnvelopeWrap type="button" onClick={onOpen} aria-label="편지 열기">
        <EnvelopeBody />
        <EnvelopeFlap src={envelopeFlap} alt="" />
        {unreadCount > 0 && <Badge>{unreadCount}</Badge>}
      </EnvelopeWrap>
      <Title>편지가 도착했어요!</Title>
      <Desc>열어볼까요?</Desc>
      <Hint type="button" onClick={onOpen}>
        봉투를 눌러보세요 ›
      </Hint>
    </Card>
  );
}

export default LetterArrived;
