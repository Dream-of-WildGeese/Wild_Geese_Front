import styled from 'styled-components';

const Card = styled.div`
  width: 100%;
  max-width: 354px;
  padding: 24px 22px;
  border-radius: 24px;
  background: #fff;
  display: flex;
  flex-direction: column;
`;

const Title = styled.p`
  margin: 0;
  font-size: 19px;
  font-weight: 600;
  color: #000;
`;

const Subtitle = styled.p`
  margin: 4px 0 0;
  font-size: 13px;
  color: #8c8780;
`;

const LetterList = styled.div`
  margin-top: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 280px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const LetterRow = styled.button`
  display: flex;
  gap: 10px;
  padding: 12px;
  border-radius: 12px;
  background: ${({ $unread }) => ($unread ? '#fae5d9' : '#f7f5f0')};
  text-align: left;
`;

const Avatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 18px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 600;
  color: #e8734a;
  flex-shrink: 0;
`;

const TextCol = styled.div`
  flex: 1;
  min-width: 0;
`;

const HeadRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const SenderName = styled.p`
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: #000;
`;

const DateText = styled.span`
  font-size: 11px;
  color: #8c8780;
`;

const Preview = styled.p`
  margin: 2px 0 0;
  font-size: 12px;
  color: #6b6661;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const WriteButton = styled.button`
  width: 100%;
  height: 50px;
  margin-top: 14px;
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

function LetterboxList({ letters, onSelectLetter, onWrite }) {
  return (
    <Card>
      <Title>우체통</Title>
      <Subtitle>받은 편지를 확인해보세요</Subtitle>
      <LetterList>
        {letters.map((letter) => (
          <LetterRow key={letter.id} type="button" $unread={!letter.read} onClick={() => onSelectLetter(letter)}>
            <Avatar>◕</Avatar>
            <TextCol>
              <HeadRow>
                <SenderName>{letter.sender}</SenderName>
                <DateText>{letter.date}</DateText>
              </HeadRow>
              <Preview>{letter.preview}</Preview>
            </TextCol>
          </LetterRow>
        ))}
      </LetterList>
      <WriteButton type="button" onClick={onWrite}>
        <span>+</span>
        <span>편지쓰기</span>
      </WriteButton>
    </Card>
  );
}

export default LetterboxList;
