import styled from 'styled-components';

// 편지 본문 길이는 서버에서 오는 값이라 제각각이다. 카드가 화면을 넘지 않게 막고
// 본문만 안에서 스크롤되게 한다.
const Card = styled.div`
  width: 100%;
  max-width: 340px;
  max-height: 80vh;
  padding: 26px 22px 24px;
  border-radius: 18px;
  background: #fcf7eb;
  border: 1px solid #e5d9b2;
  display: flex;
  flex-direction: column;
`;

const HeadRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const SenderName = styled.p`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #000;
`;

const DateText = styled.span`
  font-size: 12px;
  color: #8c8780;
`;

const Divider = styled.div`
  margin-top: 6px;
  height: 1px;
  background: #e5d9b2;
`;

const Body = styled.p`
  margin: 20px 0 0;
  font-size: 14px;
  line-height: 1.65;
  color: #6b6661;
  white-space: pre-line;

  flex: 1;
  min-height: 0;
  overflow-y: auto;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const ReplyButton = styled.button`
  width: 100%;
  height: 48px;
  margin-top: 20px;
  border-radius: 10px;
  background: #e8734a;
  color: #fff;
  font-size: 15px;
  font-weight: 600;
`;

const CloseText = styled.button`
  margin-top: 8px;
  align-self: center;
  font-size: 13px;
  font-weight: 500;
  color: #8c8780;
`;

function LetterRead({ letter, onReply, onClose }) {
  return (
    <Card>
      <HeadRow>
        <SenderName>{letter.sender}</SenderName>
        <DateText>{letter.date}</DateText>
      </HeadRow>
      <Divider />
      <Body>{letter.body}</Body>
      <ReplyButton type="button" onClick={onReply}>
        답장 쓰기
      </ReplyButton>
      <CloseText type="button" onClick={onClose}>
        닫기
      </CloseText>
    </Card>
  );
}

export default LetterRead;
