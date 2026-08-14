import { client } from '../client';

export const completeOnboarding = () => client.patch('/api/v1/users/me/onboarding/complete');
