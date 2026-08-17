import { client } from '../client';

export const subscribePush = (subscription) => {
  const endpoint = subscription.endpoint;

  const p256dh =
    subscription.p256dh ?? subscription.keys?.p256dh;

  const auth =
    subscription.auth ?? subscription.keys?.auth;

  return client.post(
    '/api/v1/users/me/pushsubscriptions',
    {
      endpoint,
      p256dh,
      auth,
    }
  );
};
