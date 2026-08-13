import { client } from '../client';

export const completeOnboarding = () => client.post('/api/v1/users/me/onboarding/complete');
