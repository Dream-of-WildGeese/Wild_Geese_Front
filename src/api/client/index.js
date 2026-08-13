import axios from 'axios';
import { attachUserId, unwrapResponse, unwrapError } from './interceptors';

export { getUserId, setUserId, clearUserId } from './userId';
export { ApiError } from './ApiError';

export const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 5000,
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.request.use(attachUserId);
client.interceptors.response.use(unwrapResponse, unwrapError);
