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

// useWebPush.js
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

    // 껐다 켤 때 브라우저에는 구독이 그대로 남아있는 경우가 많다. 그걸 매번
    // unsubscribe() 했다가 바로 subscribe()하면, 푸시 서비스가 이전 구독을 채
    // 정리하기 전에 새 요청이 들어가 종종 실패한다(no active Service Worker 등).
    // VAPID 키는 코드에 고정된 값이라 바뀔 일이 없으므로, 기존 구독이 있으면
    // 그대로 재사용하고 백엔드에만 다시 등록한다.
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
    }

    await subscribePush(subscription.toJSON());

    return subscription;
  };

  return { enablePush };
};