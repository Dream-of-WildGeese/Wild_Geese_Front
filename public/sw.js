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

  event.waitUntil(
    self.registration.showNotification(data.title || '온담', {
      body: data.content || data.body || '',
      icon: '/icons/pinkflower.svg',
      badge: '/icons/pinkflower.svg',
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