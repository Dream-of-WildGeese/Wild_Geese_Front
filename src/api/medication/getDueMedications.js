import { client } from '../client';

// 지금 시간대에 먹어야 할 약만 추려서 돌려준다. 홈 CTA 배너에서 쓴다.
export const getDueMedications = () => client.get('/api/v1/medications/due');
