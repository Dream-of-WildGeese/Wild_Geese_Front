import styled from 'styled-components';
import envelopeBox from '../../../assets/letterbox/envelope-box.svg';
import avatarChild from '../../../assets/letterbox/avatar-child.png';
import {
  PopupCard,
  PopupInnerBorder,
  PopupClose,
  PopupPrimaryButton,
  PopupIcon,
} from '../../../components/PopupShell';

// Figma 35 ver02: 우체통 본문.
// 목록 행은 읽음/안읽음 구분 없이 흰 배경 + 살구색 테두리로 통일돼 있다.
const HeaderGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`;

const Title = styled.p`
  margin: 0;
  color: #4a3a2f;
  font-family: 'Noto Sans KR';
  font-size: 26px;
  font-weight: 700;
`;

const Subtitle = styled.p`
  margin: 0;
  color: #a79c8e;
  font-family: 'Noto Sans KR';
  font-size: 18px;
  font-weight: 500;
`;

const MessageList = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;

  max-height: 292px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const MessageRow = styled.button`
  width: 100%;
  padding: 14px;

  display: flex;
  gap: 12px;
  align-items: center;
  text-align: left;

  border-radius: 14px;
  border: 1.3px solid rgba(217, 138, 119, 0.65);
  background: #fff;
`;

const Avatar = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 100px;
  flex-shrink: 0;
  overflow: hidden;

  display: flex;
  align-items: center;
  justify-content: center;

  border: 1px solid #4a3a2f;
  background: rgba(252, 248, 234, 0.8);
`;

const AvatarImage = styled.img`
  width: 55px;
  height: 47px;
  object-fit: contain;
`;

const TextCol = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const HeadRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
`;

const SenderName = styled.span`
  flex: 1;
  min-width: 0;
  color: #4a3a2f;
  font-family: Jua;
  font-size: 18px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const DateText = styled.span`
  flex-shrink: 0;
  color: #a79c8e;
  font-family: Jua;
  font-size: 14px;
`;

// 안 읽은 편지만 살짝 표시해준다(디자인엔 없지만 목록에서 구분이 필요하다).
const UnreadDot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 4px;
  background: #d97d65;
  flex-shrink: 0;
`;

const Preview = styled.p`
  margin: 0;
  width: 100%;
  color: #4a3a2f;
  font-family: Jua;
  font-size: 16px;
  line-height: 1.4;

  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

function LetterboxList({ letters, senderLabel, onSelectLetter, onWrite, onClose }) {
  return (
    <PopupCard $center $gap={16} $padTop={32} onClick={(event) => event.stopPropagation()}>
      <PopupInnerBorder />
      <PopupClose type="button" aria-label="닫기" onClick={onClose}>
        ✕
      </PopupClose>

      <HeaderGroup>
        <PopupIcon $size={108} src={envelopeBox} alt="" />
        <Title>우체통</Title>
        <Subtitle>받은 편지를 확인해보세요</Subtitle>
      </HeaderGroup>

      <MessageList>
        {letters.map((letter) => (
          <MessageRow key={letter.id} type="button" onClick={() => onSelectLetter(letter)}>
            <Avatar>
              <AvatarImage src={avatarChild} alt="" />
            </Avatar>
            <TextCol>
              <HeadRow>
                {/* 가족 정보가 아직 안 왔을 때만 편지에 적힌 이름을 대신 쓴다 */}
                <SenderName>{senderLabel || letter.sender}</SenderName>
                {!letter.read && <UnreadDot />}
                <DateText>{letter.date}</DateText>
              </HeadRow>
              <Preview>{letter.preview}</Preview>
            </TextCol>
          </MessageRow>
        ))}
      </MessageList>

      <PopupPrimaryButton type="button" onClick={onWrite}>
        편지쓰기
      </PopupPrimaryButton>
    </PopupCard>
  );
}

export default LetterboxList;
