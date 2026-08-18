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

// 아주 살짝만 좌우로 흔들리는 대기 모션. 너무 크면 산만해서 6px로 작게 뒀다.
const sway = keyframes`
  0% { transform: translateX(-6px); }
  100% { transform: translateX(6px); }
`;

const Mascot = styled.img`
  position: absolute;
  left: 76px;
  top: 439px;
  width: 254px;
  height: 339px;
  object-fit: cover;
  pointer-events: none;
  animation: ${sway} 3.2s ease-in-out infinite alternate;
`;

const MailboxButton = styled.button`
  position: absolute;
  left: 272px;
  top: 393px;
  width: 119px;
  height: 119px;
  pointer-events: auto;
`;

// 안 읽은 편지가 있을 때만 두근거리듯 살짝 커졌다 작아졌다 반복한다.
const heartbeat = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.08); }
`;

const MailboxImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
  animation: ${({ $pulse }) => ($pulse ? heartbeat : 'none')} 1.1s ease-in-out infinite;
`;

// 우체통(left:272 top:393 size:119) 위쪽에서 좌우로 오간다.
// 손으로 각도를 골라 넣으면 구간마다 가감속이 겹쳐 보여서(ease-in-out을 여러 구간에
// 나눠 걸면 매 구간 경계마다 다시 가속/감속함), 대신 진자가 좌우로 흔들리는 물리
// 공식(각도 θ(t)=θmax·cos(2πt/T), 위치 x=L·sinθ, y=L·(cosθ-cosθmax))으로 좌표를
// 계산해 넣었다. 진자는 중앙(바닥)에서 가장 빠르고 낮고, 양 끝에서 가장 느리고
// 높아지므로 별도 easing 없이 timing-function: linear로도 자연스럽게 가감속한다.
const flyAcross = keyframes`
  0%   { transform: translate(-44.8px, 0px); }
  5%   { transform: translate(-42.7px, 0.7px); }
  10%  { transform: translate(-36.5px, 2.4px); }
  15%  { transform: translate(-26.6px, 4.6px); }
  20%  { transform: translate(-14.1px, 6.4px); }
  25%  { transform: translate(0px, 7.1px); }
  30%  { transform: translate(14.1px, 6.4px); }
  35%  { transform: translate(26.6px, 4.6px); }
  40%  { transform: translate(36.5px, 2.4px); }
  45%  { transform: translate(42.7px, 0.7px); }
  50%  { transform: translate(44.8px, 0px); }
  55%  { transform: translate(42.7px, 0.7px); }
  60%  { transform: translate(36.5px, 2.4px); }
  65%  { transform: translate(26.6px, 4.6px); }
  70%  { transform: translate(14.1px, 6.4px); }
  75%  { transform: translate(0px, 7.1px); }
  80%  { transform: translate(-14.1px, 6.4px); }
  85%  { transform: translate(-26.6px, 4.6px); }
  90%  { transform: translate(-36.5px, 2.4px); }
  95%  { transform: translate(-42.7px, 0.7px); }
  100% { transform: translate(-44.8px, 0px); }
`;

// 코 방향은 진행 방향을 향하도록 완만하게만 기울이고(같은 방향으로 가는 동안은
// 26~34도 사이에서 살짝만 변한다), 방향이 바뀌는 순간(50%, 0%=100%)에만 scaleX로
// 좌우를 뒤집는다. 0%와 100%는 반드시 같은 값이어야 루프가 끊기지 않는데, 예전엔
// 50% 쪽만 완만하게 고쳐두고 100%(왼쪽 끝→오른쪽으로 도는 지점)는 손대지 않고 남겨둬서
// 두 값이 어긋나(38도 → -38도) 루프가 넘어갈 때 툭 끊겨 보였다. 여기서 통일했다.
const tiltAndFlip = keyframes`
  0%   { transform: rotate(26deg) scaleX(1); }
  40%  { transform: rotate(34deg) scaleX(1); }
  50%  { transform: rotate(-26deg) scaleX(-1); }
  90%  { transform: rotate(-34deg) scaleX(-1); }
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
  /* 가감속이 이미 좌표(진자 공식)에 담겨 있어서 linear로 재생해야 그대로 살아난다.
     ease-in-out을 얹으면 구간 경계마다 또 가감속이 겹쳐 뚝뚝 끊겨 보인다. */
  animation: ${flyAcross} 8s linear infinite;
`;

const PaperPlaneImage = styled.img`
  width: 44px;
  height: 32px;
  object-fit: contain;
  pointer-events: none;
  animation: ${tiltAndFlip} 8s linear infinite;
`;

// 안 읽은 편지 개수. 종이비행기가 아니라 우체통 오른쪽 위에 붙는다.
const Badge = styled.span`
  position: absolute;
  top: -6px;
  right: -6px;

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
      <MailboxButton
        type="button"
        aria-label={hasUnread ? `안 읽은 편지 ${unreadLetterCount}통 보기` : '우체통 열기'}
        onClick={onMailboxClick}
      >
        <MailboxImage src={mailboxImg} alt="" $pulse={hasUnread} />
        {hasUnread && <Badge>{unreadLetterCount > 99 ? '99+' : unreadLetterCount}</Badge>}
      </MailboxButton>

      <PaperPlaneButton type="button" aria-label="우체통 열기" onClick={onMailboxClick}>
        <PaperPlaneImage src={paperplaneImg} alt="" />
      </PaperPlaneButton>
    </StageLayer>
  );
}

export default HomeCharacterStage;
