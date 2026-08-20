// 가족 반응 알림은 이 다섯 아이콘 중 하나다. 서비스워커는 정적 파일이라
// src/assets를 못 읽는다 — public/icons/reactions에 따로 복사해 둔 걸 쓴다.
const REACTION_ICONS = {
  LIKE: '/icons/reactions/like.png',
  CHEER: '/icons/reactions/cheer.png',
  FUNNY: '/icons/reactions/funny.png',
  BEST: '/icons/reactions/best.png',
  CONGRATS: '/icons/reactions/congrats.png',
};
const REACTION_KEY_PATTERN = new RegExp(`\\b(${Object.keys(REACTION_ICONS).join('|')})\\b`);

// content 문장("OO님이 회원님의 아침 답변에 CHEER 반응을 남겼어요.")에서
// 반응 이름을 뽑아 아이콘을 고른다. 타입이 반응이 아니거나 못 찾으면
// 기존처럼 꽃 아이콘을 쓴다.
const iconOf = (data) => {
  if (data.type === 'FAMILY_REACTION') {
    const key = data.content?.match(REACTION_KEY_PATTERN)?.[1];
    return REACTION_ICONS[key] ?? REACTION_ICONS.LIKE;
  }
  return '/icons/pinkflower.svg';
};

self.addEventListener('push', (event) => {
  console.log('🔥 REAL PUSH RECEIVED');

  let data = {};

  try {
    data = event.data ? event.data.json() : {};
    console.log('🔥 PUSH PAYLOAD:', data);
  } catch (e) {
    console.log('🔥 PUSH PARSE ERROR:', e);

    data = {
      title: '온담',
      body: event.data?.text?.() || '',
    };
  }

  const icon = iconOf(data);

  event.waitUntil(
    self.registration.showNotification(data.title || '온담', {
      body: data.content || data.body || '',
      icon,
      badge: icon,
      data: {
        url: data.url || '/',
      },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    clients.openWindow(url)
  );
});