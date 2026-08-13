import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import homeBackground from '../../assets/home-background.png';
import settingsIcon from '../../assets/settings-icon.png';
import mailboxImg from '../../assets/mailbox.png';
import navHomeIcon from '../../assets/nav-home-icon.png';
import navWeeklyIcon from '../../assets/nav-weekly-icon.png';
import HomeTopBar from './HomeTopBar';
import HomeCtaBanner from './HomeCtaBanner';
import HomeCharacterStage from './HomeCharacterStage';
import HomeBottomNav from './HomeBottomNav';
import HomePopup from './HomePopup';
import HomeMedicationPopup from './HomeMedicationPopup';
import DayQuestionPopup from './TodayOndam/Day/DayQuestionPopup';
import MedicineCheckPopup from './TodayOndam/Medicine/MedicineCheckPopup';
import NightIntroPopup from './TodayOndam/Night/NightIntroPopup';
import NightCompletePopup from './TodayOndam/Night/NightCompletePopup';
import { getHomeCtaSlot } from './TodayOndam/homeCtaFlow';
import { MOCK_MEDICATIONS } from '../../mock/homeMock';

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

const POPUP_CONTENT = {
  settings: {
    icon: settingsIcon,
    title: '설정',
    description: '알림 시간, 건강 프로필 등을 관리하는 설정 화면이에요.',
  },
  mailbox: {
    icon: mailboxImg,
    title: '우체통',
    description: '우체통을 열면 줄글 편지지가 펼쳐져요. 가족에게 편지를 써보세요.',
  },
  home: {
    icon: navHomeIcon,
    title: '오늘의 온담',
    description: '지금 보고 계신 화면이 바로 오늘의 온담 홈이에요.',
  },
  weeklyReport: {
    icon: navWeeklyIcon,
    title: '주간 리포트',
    description: '일주일 동안의 건강 기록을 모아보는 리포트예요.',
  },
};

function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activePopup, setActivePopup] = useState(null);
  const [ctaSlot, setCtaSlot] = useState(null);
  const closePopup = () => setActivePopup(null);

  // 저녁 건강체크 페이지에서 기록을 마치고 돌아오면 완료 팝업을 띄운다.
  useEffect(() => {
    if (location.state?.healthCheckDone) {
      setActivePopup('healthCheckDone');
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  const handleCtaClick = () => {
    const slot = getHomeCtaSlot(MOCK_MEDICATIONS);
    setCtaSlot(slot);
    // 상단 약 아이콘의 'medication'(복용약 관리) 팝업과 이름이 겹치지 않도록 구분한다.
    setActivePopup(slot.type === 'medication' ? 'medication_check' : slot.type);
  };

  return (
    <Stage>
      <Background src={homeBackground} alt="" />
      <HomeTopBar
        onMedicationClick={() => setActivePopup('medication')}
        onSettingsClick={() => setActivePopup('settings')}
      />
      <HomeCtaBanner onClick={handleCtaClick} />
      <HomeCharacterStage onMailboxClick={() => setActivePopup('mailbox')} />
      <HomeBottomNav
        onQuestionBoxClick={() => navigate('/morning-report')}
        onHomeClick={() => setActivePopup('home')}
        onWeeklyReportClick={() => setActivePopup('weeklyReport')}
      />

      {activePopup === 'medication' && <HomeMedicationPopup onClose={closePopup} />}
      {activePopup === 'morning' && <DayQuestionPopup onClose={closePopup} />}
      {activePopup === 'medication_check' && (
        <MedicineCheckPopup
          dueMedications={ctaSlot.medications}
          mealLabel={ctaSlot.mealLabel}
          onClose={closePopup}
        />
      )}
      {activePopup === 'evening' && (
        <NightIntroPopup onStart={() => navigate('/daily-health-check')} onClose={closePopup} />
      )}
      {activePopup === 'healthCheckDone' && <NightCompletePopup onClose={closePopup} />}
      {activePopup && POPUP_CONTENT[activePopup] && (
        <HomePopup
          icon={POPUP_CONTENT[activePopup].icon}
          title={POPUP_CONTENT[activePopup].title}
          description={POPUP_CONTENT[activePopup].description}
          onClose={closePopup}
        />
      )}
    </Stage>
  );
}

export default Home;
