import styled from 'styled-components';
import envelopeEmpty from '../../../assets/letterbox/envelope-empty.svg';

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

const EnvelopeImage = styled.img`
  width: 140px;
  height: 100px;
`;

const Title = styled.p`
  margin: 0;
  font-size: 19px;
  font-weight: 600;
  color: #000;
`;

const Desc = styled.p`
  margin: 0;
  font-size: 14px;
  color: #8c8780;
`;

const WriteButton = styled.button`
  width: 240px;
  height: 50px;
  border-radius: 10px;
  background: #e8734a;
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
`;

function LetterboxEmpty({ onWrite }) {
  return (
    <Card>
      <EnvelopeImage src={envelopeEmpty} alt="" />
      <Title>아직 편지가 없어요!</Title>
      <Desc>편지를 남겨볼까요?</Desc>
      <WriteButton type="button" onClick={onWrite}>
        <span>+</span>
        <span>편지 쓰기</span>
      </WriteButton>
    </Card>
  );
}

export default LetterboxEmpty;
