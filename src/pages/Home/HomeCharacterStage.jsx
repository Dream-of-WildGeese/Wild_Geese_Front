import { useEffect, useRef, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import dadMascot from '../../assets/mascot.png'; // 기본 마스코트 (아빠)
import momMascot from '../../assets/character/mom_mascot.png';
import daughterMascot from '../../assets/character/daughter_mascot.png';
import sonMascot from '../../assets/character/son_mascot.png';
import mailboxImg from '../../assets/mailbox.png';
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
  pointer-events: none;
`;

const sway = keyframes`
  0% { transform: translateX(-6px); }
  100% { transform: translateX(6px); }
`;

const MascotButton = styled.button`
  position: absolute;
  left: 76px;
  top: 439px;
  width: 254px;
  height: 339px;
  pointer-events: auto;
`;

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

const GreetingBubble = styled.div`
  position: absolute;
  left: 34px;
  top: 372px;
  max-width: 226px;
  padding: 12px 16px;
  box-sizing: border-box;
  border-radius: 18px;
  border: 1.5px solid rgba(74, 58, 47, 0.35);
  background: #fffdf6;
  box-shadow: 0 4px 10px rgba(74, 58, 47, 0.12);
  color: #4a3a2f;
  font-family: Jua;
  font-size: 17px;
  line-height: 1.35;
  text-align: center;
  word-break: keep-all;
  pointer-events: none;
  animation: ${popIn} 0.22s ease-out;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }

  &::after {
    content: '';
    position: absolute;
    right: 34px;
    bottom: -9px;
    width: 16px;
    height: 16px;
    background: #fffdf6;
    border-right: 1.5px solid rgba(74, 58, 47, 0.35);
    border-bottom: 1.5px solid rgba(74, 58, 47, 0.35);
    transform: rotate(45deg);
  }
`;

const MailboxButton = styled.button`
  position: absolute;
  left: 272px;
  top: 393px;
  width: 119px;
  height: 119px;
  pointer-events: auto;
`;

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

const tiltAndFlip = keyframes`
  0%   { transform: rotate(26deg) scaleX(1); }
  40%  { transform: rotate(34deg) scaleX(1); }
  50%  { transform: rotate(-26deg) scaleX(-1); }
  90%  { transform: rotate(-34deg) scaleX(-1); }
  100% { transform: rotate(26deg) scaleX(1); }
`;

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
  animation: ${flyAcross} 8s linear infinite;
`;

const PaperPlaneImage = styled.img`
  width: 44px;
  height: 32px;
  object-fit: contain;
  pointer-events: none;
  animation: ${tiltAndFlip} 8s linear infinite;
`;

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

function HomeCharacterStage({ onMailboxClick, unreadLetterCount = 0, showMailbox = true }) {
  const hasUnread = unreadLetterCount > 0;
  const currentUserId = getUserId();
  const { data: familyData } = useApi(getMyFamily);

  const [greeting, setGreeting] = useState(null);
  const hideTimerRef = useRef(null);
  const lastIndexRef = useRef(-1);

  useEffect(() => () => clearTimeout(hideTimerRef.current), []);

  // 가족 API에서 내 정보 조회 및 캐릭터 결정
  const me = (familyData?.members || []).find(
    (member) => String(member.userId) === String(currentUserId)
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

      {showMailbox && (
        <>
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
        </>
      )}
    </StageLayer>
  );
}

export default HomeCharacterStage;