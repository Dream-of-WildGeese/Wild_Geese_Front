import styled from 'styled-components';
import letterPaper from '../../../assets/letterbox/letter-paper-read.png';
import ruledLines from '../../../assets/letterbox/ruled-lines-read.svg';
import { PopupPrimaryButton } from '../../../components/PopupShell';

// Figma 35b ver02: 편지를 펼친 화면.
// 크림색 팝업 카드가 아니라 편지지 이미지 자체가 카드가 되고, 버튼은 카드 바깥에 붙는다.
const Wrapper = styled.div`
  width: 100%;
  max-width: 338px;
  max-height: 86vh;

  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const PaperCard = styled.div`
  position: relative;
  flex: 1;
  min-height: 0;

  display: flex;
  flex-direction: column;
  gap: 16px;

  padding: 52px 26px 56px;
  background: #fff;
  background-image: url(${letterPaper});
  background-size: cover;
  background-repeat: no-repeat;
`;

// 편지지 괘선은 본문 시작 위치에 맞춰 아래쪽에 깔린다.
const RuledLayer = styled.img`
  position: absolute;
  left: -5px;
  top: 89.5px;
  width: 338px;
  pointer-events: none;
`;

const CloseButton = styled.button`
  position: absolute;
  left: 26px;
  top: 24px;
  color: #8c8780;
  font-size: 18px;
  line-height: 1;
`;

const HeadRow = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  height: 26px;
`;

const SenderName = styled.span`
  flex: 1;
  min-width: 0;
  color: #4a3a2f;
  font-family: Jua;
  font-size: 20px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const DateText = styled.span`
  flex-shrink: 0;
  color: #8c8780;
  font-family: Jua;
  font-size: 14px;
`;

const Divider = styled.div`
  position: relative;
  height: 1.3px;
  background: rgba(74, 58, 47, 0.35);
`;

const Body = styled.p`
  position: relative;
  margin: 0;
  flex: 1;
  min-height: 0;
  overflow-y: auto;

  color: #4a3a2f;
  font-family: Jua;
  font-size: 20px;
  line-height: 1.65;
  white-space: pre-wrap;

  &::-webkit-scrollbar {
    display: none;
  }
`;

function LetterRead({ letter, onReply, onClose }) {
  return (
    <Wrapper onClick={(event) => event.stopPropagation()}>
      <PaperCard>
        <RuledLayer src={ruledLines} alt="" />
        <CloseButton type="button" aria-label="닫기" onClick={onClose}>
          ✕
        </CloseButton>

        <HeadRow>
          <SenderName>{letter.sender}</SenderName>
          <DateText>{letter.fullDate || letter.date}</DateText>
        </HeadRow>
        <Divider />
        <Body>{letter.body}</Body>
      </PaperCard>

      <PopupPrimaryButton type="button" onClick={onReply} style={{ height: 52, borderRadius: 12 }}>
        {/* 누구에게 답하는지 보이면 훨씬 분명하다 */}
        {letter.sender ? `${letter.sender}에게 답장하기` : '답장하기'}
      </PopupPrimaryButton>
    </Wrapper>
  );
}

export default LetterRead;
