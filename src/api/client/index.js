import axios from 'axios';
import { attachUserId, unwrapResponse, unwrapError } from './interceptors';

export { getUserId, setUserId, clearUserId } from './userId';
export { getInviteCode, setInviteCode, clearInviteCode } from './inviteCode';
export { ApiError } from './ApiError';

// 저녁 답변을 제출하면 서버가 그 자리에서 온담 한마디(LLM)를 만들고, 음성 입력은
// STT를 돌린다. 둘 다 5초를 넘겨서, 저장이 됐는데도 앱이 먼저 포기하고
// '저장하지 못했어요'를 띄우는 일이 있었다. 넉넉하게 30초를 준다.
export const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.request.use(attachUserId);
client.interceptors.response.use(unwrapResponse, unwrapError);
