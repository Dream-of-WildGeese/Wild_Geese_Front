import styled from 'styled-components';
import mascotImg from '../../assets/mascot.png';
import mailboxImg from '../../assets/mailbox.png';

const StageLayer = styled.div`
  position: absolute;
  inset: 0;
  /* 전체를 덮는 레이어라 마스코트/우체통 외 영역은 아래의 CTA 배너 클릭을 막지 않아야 한다 */
  pointer-events: none;
`;

const Mascot = styled.img`
  position: absolute;
  left: 76px;
  top: 439px;
  width: 254px;
  height: 339px;
  object-fit: cover;
  pointer-events: none;
`;

const MailboxButton = styled.button`
  position: absolute;
  left: 272px;
  top: 393px;
  width: 119px;
  height: 119px;
  pointer-events: auto;
`;

const MailboxImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
`;

const Badge = styled.span`
  position: absolute;
  left: 353px;
  top: 396px;
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 17.5px;
  background: rgba(254, 251, 241, 0.8);
  border: 1px solid rgba(74, 58, 47, 0.8);
  font-size: 12px;
  color: #000;
`;

function HomeCharacterStage({ onMailboxClick, unreadLetterCount = 1 }) {
  return (
    <StageLayer>
      <Mascot src={mascotImg} alt="" />
      <MailboxButton type="button" aria-label="우체통" onClick={onMailboxClick}>
        <MailboxImage src={mailboxImg} alt="" />
      </MailboxButton>
      {unreadLetterCount > 0 && <Badge>{unreadLetterCount}</Badge>}
    </StageLayer>
  );
}

export default HomeCharacterStage;
