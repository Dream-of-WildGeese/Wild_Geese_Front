import styled from 'styled-components';
import envelopeFlap from '../../../assets/letterbox/envelope-flap.svg';

const Card = styled.div`
  width: 100%;
  max-width: 340px;
  padding: 26px 22px 24px;
  border-radius: 18px;
  background: #fcf7eb;
  border: 1px solid #e5d9b2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

const EnvelopeWrap = styled.div`
  position: relative;
  width: 100px;
  height: 72px;
  margin-top: 4px;
`;

const EnvelopeBody = styled.div`
  position: absolute;
  left: 0;
  top: 8px;
  width: 100px;
  height: 64px;
  border-radius: 6px;
  background: #fff;
  border: 1.5px solid #e8734a;
`;

const EnvelopeFlap = styled.img`
  position: absolute;
  left: 0;
  top: 0;
  width: 100px;
  height: 40px;
`;

const Title = styled.p`
  margin: 8px 0 0;
  font-size: 16px;
  font-weight: 600;
  color: #000;
  text-align: center;
`;

const Desc = styled.p`
  margin: 0;
  font-size: 13px;
  color: #6b6661;
  text-align: center;
  line-height: 1.5;
`;

const CloseButton = styled.button`
  width: 100%;
  height: 48px;
  margin-top: 16px;
  border-radius: 10px;
  border: 1px solid #e5d9b2;
  background: #fff;
  color: #6b6661;
  font-size: 15px;
  font-weight: 500;
`;

function LetterSent({ onClose }) {
  return (
    <Card>
      <EnvelopeWrap>
        <EnvelopeBody />
        <EnvelopeFlap src={envelopeFlap} alt="" />
      </EnvelopeWrap>
      <Title>편지를 보냈어요!</Title>
      <Desc>
        소중한 마음이 가족에게 전해졌어요.
        <br />
        답장이 오면 우체통으로 알려드릴게요.
      </Desc>
      <CloseButton type="button" onClick={onClose}>
        닫기
      </CloseButton>
    </Card>
  );
}

export default LetterSent;
