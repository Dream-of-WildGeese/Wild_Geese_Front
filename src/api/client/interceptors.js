import { ApiError } from './ApiError';
import { getUserId } from './userId';

// 서버가 저장해둔 X-User-Id를 요청마다 자동으로 붙여준다.
export const attachUserId = (config) => {
  const userId = getUserId();
  if (userId) {
    config.headers['X-User-Id'] = userId;
  }
  return config;
};

// 응답 포맷이 { success, data, error }로 고정되어 있어 여기서 한 번에 풀어준다.
export const unwrapResponse = (response) => {
  const body = response.data;
  if (body && typeof body === 'object' && 'success' in body) {
    if (!body.success) {
      return Promise.reject(new ApiError(body.error?.code, body.error?.message));
    }
    return body.data;
  }
  return body;
};

export const unwrapError = (error) => {
  const errorDetail = error.response?.data?.error;
  if (errorDetail) {
    return Promise.reject(new ApiError(errorDetail.code, errorDetail.message));
  }
  return Promise.reject(error);
};
