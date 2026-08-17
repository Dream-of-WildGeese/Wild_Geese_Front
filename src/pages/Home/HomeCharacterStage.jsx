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
// 이동(translateX)은 바깥 버튼이, 기울기·좌우반전은 안쪽 그림이 나눠 맡는다.
// 한 요소에 다 걸면 배지까지 같이 뒤집혀서 숫자가 거울처럼 보인다.
const flyAcross = keyframes`
  0% { transform: translateX(-45px); }
  40% { transform: translateX(45px); }
  50% { transform: translateX(45px); }
  90% { transform: translateX(-45px); }
  100% { transform: translateX(-45px); }
`;

// 오른쪽 끝(40~50%)과 왼쪽 끝(90~100%)에서 scaleX로 좌우 반전해 머리 방향이
// 이동 방향을 향하도록 자연스럽게 턴을 준다.
// 그림 자체에 원래 위쪽으로 향한 기울기가 있어서, 반전 여부와 상관없이
// 코가 살짝 아래를 보도록 양쪽 방향 모두 rotate로 같은 크기만큼 보정한다.
const tiltAndFlip = keyframes`
  0% { transform: rotate(26deg) scaleX(1); }
  40% { transform: rotate(34deg) scaleX(1); }
  50% { transform: rotate(-26deg) scaleX(-1); }
  90% { transform: rotate(-34deg) scaleX(-1); }
  100% { transform: rotate(26deg) scaleX(1); }
`;

// 그림은 44x32지만 손가락으로 누르기엔 작아서, 버튼만 키우고 그림을 가운데 둔다.
const PaperPlaneButton = styled.button`
  position: absolute;
  left: 300px;
  top: 340px;
  width: 64px;
  height: 52px;

  display: flex;
  align-items: center;
  justify-content: center;

  pointer-events: auto;
  animation: ${flyAcross} 8s ease-in-out infinite;
`;

const PaperPlaneImage = styled.img`
  width: 44px;
  height: 32px;
  object-fit: contain;
  pointer-events: none;
  animation: ${tiltAndFlip} 8s ease-in-out infinite;
`;

// 비행기를 따라다니는 안 읽은 편지 개수.
const Badge = styled.span`
  position: absolute;
  top: -4px;
  right: -2px;

  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  box-sizing: border-box;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 11px;
  background: #d97d65;
  border: 1.5px solid rgba(254, 251, 241, 0.9);

  color: #fff;
  font-family: Jua;
  font-size: 13px;
  line-height: 1;
`;

function HomeCharacterStage({ onMailboxClick, unreadLetterCount = 0 }) {
  const hasUnread = unreadLetterCount > 0;

  return (
    <StageLayer>
      <Mascot src={mascotImg} alt="" />
      <MailboxButton type="button" aria-label="우체통 열기" onClick={onMailboxClick}>
        <MailboxImage src={mailboxImg} alt="" />
      </MailboxButton>

      {/* 우체통과 같은 동작이지만, 안 읽은 편지가 있으면 여기에 개수가 붙는다 */}
      <PaperPlaneButton
        type="button"
        aria-label={hasUnread ? `안 읽은 편지 ${unreadLetterCount}통 보기` : '우체통 열기'}
        onClick={onMailboxClick}
      >
        <PaperPlaneImage src={paperplaneImg} alt="" />
        {hasUnread && <Badge>{unreadLetterCount > 99 ? '99+' : unreadLetterCount}</Badge>}
      </PaperPlaneButton>
    </StageLayer>
  );
}

export default HomeCharacterStage;
