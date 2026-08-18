import { client } from '../client';

// 건강검진 일정 삭제 (DELETE /api/v1/checkups/{checkupId})
export const deleteCheckup = (checkupId) =>
  client.delete(`/api/v1/checkups/${checkupId}`);