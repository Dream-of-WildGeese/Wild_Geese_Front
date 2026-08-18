import { subscribePush } from '../api/user/subscribePush';

const VAPID_PUBLIC_KEY = 'BAnynaBx52ozCxuLCHj00bbrNXg6Qj-8tuSVt3fcVAhfkj9959c0SSXzsZ_8eVtG1csdHuFXAB3P_9sjxZu6gYU';

const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);

  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);

  return Uint8Array.from(
    [...rawData].map((char) => char.charCodeAt(0))
  );
};

export const useWebPush = () => {
  const enablePush = async () => {
    if (!('Notification' in window)) {
      throw new Error('이 브라우저는 알림을 지원하지 않아요.');
    }

    if (!('serviceWorker' in navigator)) {
      throw new Error('이 브라우저는 Service Worker를 지원하지 않아요.');
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      throw new Error('알림 권한이 허용되지 않았어요.');
    }

    await navigator.serviceWorker.register('/sw.js');
    const registration = await navigator.serviceWorker.ready;

    // 1. 기존 구독 재사용
    let subscription = await registration.pushManager.getSubscription();

    // 2. 구독이 아예 없을 때만 새로 생성
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
    }

    // 3. 백엔드 등록 (이미 등록된 엔드포인트여도 안전하게 통과)
    try {
      await subscribePush(subscription.toJSON());
    } catch (err) {
      // 서버에서 이미 존재하는 구독(409 등)으로 에러를 던져도 정상 처리로 간주
      console.warn('백엔드 푸시 구독 등록 결과:', err?.message || err);
    }

    return subscription;
  };

  return { enablePush };
};