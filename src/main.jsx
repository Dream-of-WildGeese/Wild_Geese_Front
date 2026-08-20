import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';

// sw.js가 등록된 적이 없으면 navigator.serviceWorker.ready가 영영 안 풀려서
// 푸시 구독/해제(useWebPush)가 통째로 멈춘다. 앱 시작 시 한 번 등록해둔다.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((error) => {
      console.warn('서비스 워커 등록 실패:', error);
    });
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);