import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { hasSeenTour } from '../../utils/tour';
import { APP_FRAME_ID } from '../Layout';
import TourOverlay from './TourOverlay';

// 시작 가이드를 언제 띄울지만 정한다. 그리는 일은 TourOverlay가 한다.
function TourGate() {
  const location = useLocation();
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (running) return undefined;
    if (location.pathname !== '/home') return undefined;
    if (hasSeenTour()) return undefined;

    // 홈이 한 번 온전히 보인 뒤에 올라온다. 무엇을 설명하는지 배경이 먼저 보여야
    // 구멍이 뚫렸을 때 '아 저기구나'가 된다.
    const timer = setTimeout(() => {
      // 알림이나 편지를 눌러 들어오면 홈이 스스로 팝업을 연다.
      // 그 위에 겹쳐 뜨면 안내가 두 겹이 되니 이번 차례는 건너뛴다.
      const frame = document.getElementById(APP_FRAME_ID);
      if (frame?.querySelector('[data-popup]')) return;
      setRunning(true);
    }, 600);

    return () => clearTimeout(timer);
  }, [location.pathname, running]);

  if (!running) return null;
  return <TourOverlay onClose={() => setRunning(false)} />;
}

export default TourGate;
