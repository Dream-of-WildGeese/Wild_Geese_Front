import { client } from '../client';

// 가족 구성원의 특정 날짜 복약 여부를 조회한다. date는 "2026-08-20" 형식.
export const getFamilyMedicationStatus = (targetUserId, date) =>
  client.get('/api/v1/medications/family/status', { params: { targetUserId, date } });
