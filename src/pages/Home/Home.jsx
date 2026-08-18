import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import homeBackground from '../../assets/home-background.png';
import HomeTopBar from './HomeTopBar';
import HomeCtaBanner from './HomeCtaBanner';
import HomeCharacterStage from './HomeCharacterStage';
import HomeBottomNav from './HomeBottomNav';
import DayQuestionPopup from './TodayOndam/Day/DayQuestionPopup';
import MedicineCheckPopup from './TodayOndam/Medicine/MedicineCheckPopup';
import NightIntroPopup from './TodayOndam/Night/NightIntroPopup';
import EveningCheckPopup from './TodayOndam/Night/EveningCheckPopup';
import NightCompletePopup from './TodayOndam/Night/NightCompletePopup';
import Letterbox from './Letterbox/Letterbox';
import TodayOndamPicker from './TodayOndam/TodayOndamPicker';
import { getReceivedLetters, markLetterAsRead } from '../../api/letter';
import { useApi, useApiAction } from '../../hooks/useApi';
import { toLetterView } from '../../utils/letter';

const Stage = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
`;

const Background = styled.img`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.9;
  pointer-events: none;
`;

function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activePopup, setActivePopup] = useState(null);
  const [letterboxInitialStep, setLetterboxInitialStep] = useState(null);

  const {
    data: receivedLetters,
    loading: lettersLoading,
    refetch: refetchLetters,
  } = useApi(getReceivedLetters);
  const { execute: markRead } = useApiAction(markLetterAsRead);

  // 받은 편지함은 페이지네이션 응답이라 content 배열만 꺼내 쓴다.
  const letters = (receivedLetters?.content ?? []).map(toLetterView);
  const unreadLetterCount = letters.filter((letter) => !letter.read).length;

  const closePopup = () => {
    setActivePopup(null);
    setLetterboxInitialStep(null);
  };

  const markLetterRead = async (id) => {
    const { ok } = await markRead(id);
    if (ok) {
      refetchLetters();
    }
  };

  // 저녁 건강체크 완료, 또는 리포트 화면의 '편지 보내기'에서 돌아오면 해당 팝업을 띄운다.
  useEffect(() => {
    if (location.state?.healthCheckDone) {
      setActivePopup('healthCheckDone');
      navigate(location.pathname, { replace: true, state: {} });
      return;
    }
    if (location.state?.openLetterbox) {
      setLetterboxInitialStep(location.state.openLetterbox);
      setActivePopup('mailbox');
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  // 시연에서 원하는 단계를 바로 보여줄 수 있도록, 시간대로 자동 판단하지 않고
  // 아침/복약/저녁 중에서 직접 고르게 한다.
  const handleCtaClick = () => setActivePopup('picker');

  const handlePickStep = (type) => {
    // 복약 목록은 팝업이 직접 읽는다. 여기서 미리 만들어 넘기면
    // 기록 수정 화면이 읽는 목록과 어긋나서 저장이 사라진 것처럼 보인다.
    //
    // 상단 약 아이콘의 'medication'(복용약 관리) 팝업과 이름이 겹치지 않도록 구분한다.
    setActivePopup(type === 'medication' ? 'medication_check' : type);
  };

  return (
    <Stage>
      <Background src={homeBackground} alt="" />
      <HomeTopBar
        onMedicationClick={() => navigate('/home/medicine')}
        onSettingsClick={() => navigate('/home/settings')}
      />
      <HomeCtaBanner onClick={handleCtaClick} />
      <HomeCharacterStage
        onMailboxClick={() => setActivePopup('mailbox')}
        unreadLetterCount={unreadLetterCount}
      />
      <HomeBottomNav
        onQuestionBoxClick={() => navigate('/morning-report')}
        onHomeClick={() => navigate('/home/today-report')}
        onWeeklyReportClick={() => navigate('/home/weekly-report')}
      />

      {activePopup === 'mailbox' && (
        <Letterbox
          letters={letters}
          loading={lettersLoading}
          onMarkRead={markLetterRead}
          onSent={refetchLetters}
          onClose={closePopup}
          initialStep={letterboxInitialStep}
        />
      )}
      {activePopup === 'picker' && (
        <TodayOndamPicker onSelect={handlePickStep} onClose={closePopup} />
      )}
      {activePopup === 'morning' && <DayQuestionPopup onClose={closePopup} />}
      {activePopup === 'medication_check' && (
        <MedicineCheckPopup onClose={closePopup} />
      )}
      {activePopup === 'evening' && (
        <NightIntroPopup onStart={() => setActivePopup('eveningCheck')} onClose={closePopup} />
      )}
      {activePopup === 'eveningCheck' && (
        <EveningCheckPopup
          onClose={closePopup}
          onCompleted={() => setActivePopup('healthCheckDone')}
          // 오늘 이미 마친 상태면 축하 팝업 없이 바로 건강일지로 이동한다.
          onAlreadyDone={() => {
            closePopup();
            navigate('/home/today-report');
          }}
        />
      )}
      {activePopup === 'healthCheckDone' && (
        <NightCompletePopup
          onClose={closePopup}
          onGoToJournal={() => navigate('/home/today-report')}
        />
      )}
    </Stage>
  );
}

export default Home;
