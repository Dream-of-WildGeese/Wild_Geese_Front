import { useState } from 'react';
import styled from 'styled-components';

const Card = styled.div`
  width: 100%;
  max-width: 340px;
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

const BackButton = styled.button`
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

const Prompt = styled.p`
  margin: 20px 0 0;
  font-size: 14px;
  line-height: 1.65;
  color: #6b6661;
`;

const Textarea = styled.textarea`
  margin-top: 20px;
  width: 100%;
  min-height: 90px;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid #e5d9b2;
  background: #fff;
  font-size: 14px;
  color: #000;
  resize: none;
`;

const SendButton = styled.button`
  width: 100%;
  height: 48px;
  margin-top: 14px;
  border-radius: 10px;
  background: #e8734a;
  color: #fff;
  font-size: 15px;
  font-weight: 600;
`;

function LetterCompose({ onBack, onSend, sending }) {
  const [message, setMessage] = useState('');

  return (
    <Card>
      <HeadRow>
        <BackButton type="button" onClick={onBack} aria-label="뒤로가기">
          ‹
        </BackButton>
        <DateText>오늘</DateText>
      </HeadRow>
      <Divider />
      <Prompt>전달하고 싶은 메시지를 입력해주세요!</Prompt>
      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="여기에 편지를 적어주세요"
      />
      <SendButton
        type="button"
        disabled={!message.trim() || sending}
        onClick={() => onSend(message.trim())}
      >
        {sending ? '보내는 중...' : '편지 보내기'}
      </SendButton>
    </Card>
  );
}

export default LetterCompose;
