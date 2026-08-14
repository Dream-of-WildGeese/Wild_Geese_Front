import { client } from '../client';

// 웹푸시 표준 구독 객체(PushSubscription.toJSON())의 값을 그대로 넘긴다.
export const subscribePush = ({ endpoint, p256dh, auth }) =>
  client.post('/api/v1/users/me/pushsubscriptions', { endpoint, p256dh, auth });
