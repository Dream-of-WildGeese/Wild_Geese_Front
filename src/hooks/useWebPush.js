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

    const registration = await navigator.serviceWorker.register('/sw.js');

    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey:
          urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
    }

    await subscribePush(subscription.toJSON());

    return subscription;
  };

  return { enablePush };
};