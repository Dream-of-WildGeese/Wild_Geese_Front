self.addEventListener('push', (event) => {
  console.log('[SW] PUSH EVENT RECEIVED');

  let data = {};

  if (event.data) {
    try {
      data = event.data.json();
      console.log('[SW] JSON DATA:', data);
    } catch (e) {
      const text = event.data.text();

      console.log('[SW] TEXT DATA:', text);

      data = {
        title: '온담',
        content: text,
      };
    }
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