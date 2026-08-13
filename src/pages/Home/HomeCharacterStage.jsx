import styled, { keyframes } from 'styled-components';
import mascotImg from '../../assets/mascot.png';
import mailboxImg from '../../assets/mailbox.png';
import paperplaneImg from '../../assets/paperplane.png';

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

// 우체통(left:272 top:393 size:119) 위쪽에서 좌우로만 오가는 움직임.
// 오른쪽 끝(40~50%)과 왼쪽 끝(90~100%)에서 scaleX로 좌우 반전해 머리 방향이
// 이동 방향을 향하도록 자연스럽게 턴을 준다.
// 그림 자체에 원래 위쪽으로 향한 기울기가 있어서, 반전 여부와 상관없이
// 코가 살짝 아래를 보도록 양쪽 방향 모두 rotate로 같은 크기만큼 보정한다.
const swingAboveMailbox = keyframes`
  0% { transform: translateX(-45px) rotate(26deg) scaleX(1); }
  40% { transform: translateX(45px) rotate(34deg) scaleX(1); }
  50% { transform: translateX(45px) rotate(-26deg) scaleX(-1); }
  90% { transform: translateX(-45px) rotate(-34deg) scaleX(-1); }
  100% { transform: translateX(-45px) rotate(26deg) scaleX(1); }
`;

const PaperPlane = styled.img`
  position: absolute;
  left: 310px; /* 우체통 중심(331.5) - 절반 너비(22) */
  top: 350px; /* 우체통 지붕(393px) 위쪽 여백 */
  width: 44px;
  height: 32px;
  object-fit: contain;
  pointer-events: none;
  animation: ${swingAboveMailbox} 8s ease-in-out infinite;
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
      <PaperPlane src={paperplaneImg} alt="" />
    </StageLayer>
  );
}

export default HomeCharacterStage;
