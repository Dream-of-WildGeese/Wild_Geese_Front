import { client } from '../client';

// 건강검진 일정 수정 (PATCH /api/v1/checkups/{checkupId})
export const updateCheckup = (checkupId, data) =>
  client.patch(`/api/v1/checkups/${checkupId}`, data);