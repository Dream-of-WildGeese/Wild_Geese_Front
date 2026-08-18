// src/hooks/useWebPush.js
function urlBase64ToUint8Array(base64String) {
  if (!base64String) {
    throw new Error('VAPID PUBLIC KEY가 비어있습니다.');
  }
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function useWebPush() {
  const enablePush = async () => {
    console.group('🔔 푸시 구독 활성화 시도');

    // 1. 브라우저 지원 여부
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.groupEnd();
      throw new Error('이 브라우저는 푸시 알림을 지원하지 않습니다.');
    }

    // 2. 권한 확인
    const permission = await Notification.requestPermission();
    console.log('1. 알림 권한 상태:', permission);
    if (permission !== 'granted') {
      console.groupEnd();
      throw new Error('알림 권한이 허용되지 않았습니다.');
    }

    // 3. 서비스 워커 준비 대기
    const registration = await navigator.serviceWorker.ready;
    console.log('2. 서비스 워커 ready 상태 확인 완료');

    // 4. 기존 구독이 이미 살아있다면 해제하지 않고 그대로 재사용 (락 방지)
    let subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      console.log('3. 기존 유효 구독 재사용:', subscription.endpoint);
      console.groupEnd();
      return subscription;
    }

    // 5. 기존 구독이 없을 때만 신규 생성
    const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
    if (!vapidPublicKey) {
      console.groupEnd();
      throw new Error('.env 파일의 VITE_VAPID_PUBLIC_KEY가 로드되지 않았습니다.');
    }

    const convertedKey = urlBase64ToUint8Array(vapidPublicKey);

    console.log('8. pushManager.subscribe 호출 시작...');
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedKey,
    });

    console.log('🎉 9. 푸시 신규 구독 성공! 생성된 엔드포인트:', subscription.endpoint);
    console.groupEnd();

    return subscription;
  };

  return { enablePush };
}