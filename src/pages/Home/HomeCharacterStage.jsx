import { useEffect, useRef, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import dadMascot from '../../assets/mascot.png'; // 기본 마스코트 (아빠)
import momMascot from '../../assets/character/mom_mascot.png';
import daughterMascot from '../../assets/character/daughter_mascot.png';
import sonMascot from '../../assets/character/son_mascot.png';
import mailboxImg from '../../assets/home/mailbox.png';
import paperplaneImg from '../../assets/paperplane.png';
import { getMyFamily } from '../../api/family';
import { getUserId } from '../../api/client';
import { useApi } from '../../hooks/useApi';

// 오리를 누르면 하나씩 뜨는 인삿말. 기능은 없고 말만 거는 자리다.
const GREETINGS = [
  '오늘도 와주셨네요!',
  '오늘 하루는 어떠셨어요?',
  '약은 잘 챙기셨어요?',
  '물 한 잔 드시고 오세요!',
  '오늘도 함께해요, 꽥!',
  '가족이 기다리고 있어요',
  '잠깐 쉬었다 가세요',
  '얼굴 보니 좋네요!',
  '천천히 둘러보세요',
  '편지 한 통 써볼까요?',
];

const GREETING_MS = 2800;

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

// 눌러야 해서 button으로 감쌌다. 그림만 흔들리고 버튼 영역은 제자리에 있어야
// 눌렀을 때 빗나가지 않는다.
const MascotButton = styled.button`
  position: absolute;
  left: 76px;
  top: 439px;
  width: 254px;
  height: 339px;
  pointer-events: auto;
`;

// 캐릭터마다 원본 비율이 달라서 cover면 그림마다 잘리는 정도가 달라진다.
const Mascot = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  pointer-events: none;
  animation: ${sway} 3.2s ease-in-out infinite alternate;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const popIn = keyframes`
  from { opacity: 0; transform: translateY(6px) scale(0.96); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
`;

// 오리 머리 오른쪽 위. 우체통을 왼쪽으로 옮겨서 이 자리가 비었다.
// 팝업들과 같은 크림색·굵은 테두리 카드 톤을 맞추되, 점선 장식 없이 깔끔하게 둔다.
const GreetingBubble = styled.div`
  position: absolute;
  right: 10px;
  top: 320px;
  width: 276px;

  padding: 22px 26px;
  box-sizing: border-box;

  border-radius: 26px;
  border: 2.5px solid rgba(108, 67, 23, 0.55);
  background: #fef3d5;
  box-shadow: 0 6px 16px rgba(74, 58, 47, 0.2);

  color: #4a3a2f;
  font-family: Jua;
  font-size: 23px;
  line-height: 1.4;
  text-align: center;
  word-break: keep-all;

  pointer-events: none;
  animation: ${popIn} 0.22s ease-out;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }

  /* 왼쪽 아래(오리 쪽)로 향하는 꼬리 */
  &::after {
    content: '';
    position: absolute;
    left: 34px;
    bottom: -12px;
    width: 22px;
    height: 22px;
    background: #fef3d5;
    border-right: 2.5px solid rgba(108, 67, 23, 0.55);
    border-bottom: 2.5px solid rgba(108, 67, 23, 0.55);
    transform: rotate(45deg);
  }
`;

// 오른쪽에 있던 것을 왼쪽으로 옮겼다. 그 자리는 인삿말 말풍선이 쓴다.
// 크기는 Figma 1405:258의 130px를 따른다.
const MailboxButton = styled.button`
  position: absolute;
  left: 8px;
  top: 386px;
  width: 130px;
  height: 130px;
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
  /* 새 그림은 여백을 포함한 정사각형이라 cover면 가장자리가 잘린다 */
  object-fit: contain;
  pointer-events: none;
  animation: ${({ $pulse }) => ($pulse ? heartbeat : 'none')} 1.1s ease-in-out infinite;
`;

// 우체통(left:8 top:386 size:130) 위쪽에서 좌우로 오간다.
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
  left: 40px;
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
  const currentUserId = getUserId();
  const { data: familyData } = useApi(getMyFamily);

  const [greeting, setGreeting] = useState(null);
  const hideTimerRef = useRef(null);
  const lastIndexRef = useRef(-1);

  // 화면을 벗어날 때 타이머가 남아 있으면 사라진 요소를 건드린다.
  useEffect(() => () => clearTimeout(hideTimerRef.current), []);

  // 가족 API에서 내 정보를 찾아 역할·성별에 맞는 캐릭터를 고른다.
  const me = (familyData?.members || []).find(
    (member) => String(member.userId) === String(currentUserId),
  );

  const mascotImage = (() => {
    if (!me) return dadMascot; // 로딩 전 기본값 (아빠)

    if (me.role === 'CHILD') {
      return me.gender === 'FEMALE' ? daughterMascot : sonMascot;
    }
    if (me.role === 'PARENT') {
      return me.gender === 'FEMALE' ? momMascot : dadMascot;
    }
    return dadMascot;
  })();

  const handleMascotClick = () => {
    // 같은 말이 연달아 나오면 안 바뀐 것처럼 보여서 직전 것은 뺀다.
    let index = Math.floor(Math.random() * GREETINGS.length);
    if (index === lastIndexRef.current) index = (index + 1) % GREETINGS.length;
    lastIndexRef.current = index;

    setGreeting(GREETINGS[index]);
    clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => setGreeting(null), GREETING_MS);
  };

  return (
    <StageLayer>
      {greeting && <GreetingBubble key={greeting}>{greeting}</GreetingBubble>}

      <MascotButton type="button" aria-label="온담이에게 말 걸기" onClick={handleMascotClick}>
        <Mascot src={mascotImage} alt="" />
      </MascotButton>
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
