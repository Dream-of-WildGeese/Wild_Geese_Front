import axios from 'axios';

const USER_ID_STORAGE_KEY = 'ondam.userId';

export const getUserId = () => localStorage.getItem(USER_ID_STORAGE_KEY);
export const setUserId = (userId) => localStorage.setItem(USER_ID_STORAGE_KEY, String(userId));
export const clearUserId = () => localStorage.removeItem(USER_ID_STORAGE_KEY);

export class ApiError extends Error {
  constructor(code, message) {
    super(message || '요청 처리 중 오류가 발생했습니다.');
    this.name = 'ApiError';
    this.code = code;
  }
}

export const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 5000,
  headers: { 'Content-Type': 'application/json' },
});

// 서버가 저장해둔 X-User-Id를 요청마다 자동으로 붙여준다.
client.interceptors.request.use((config) => {
  const userId = getUserId();
  if (userId) {
    config.headers['X-User-Id'] = userId;
  }
  return config;
});

// 응답 포맷이 { success, data, error }로 고정되어 있어 여기서 한 번에 풀어준다.
client.interceptors.response.use(
  (response) => {
    const body = response.data;
    if (body && typeof body === 'object' && 'success' in body) {
      if (!body.success) {
        return Promise.reject(new ApiError(body.error?.code, body.error?.message));
      }
      return body.data;
    }
    return body;
  },
  (error) => {
    const errorDetail = error.response?.data?.error;
    if (errorDetail) {
      return Promise.reject(new ApiError(errorDetail.code, errorDetail.message));
    }
    return Promise.reject(error);
  }
);
