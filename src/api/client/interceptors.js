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
  if (errorDetail && typeof errorDetail === 'object') {
    return Promise.reject(new ApiError(errorDetail.code, errorDetail.message));
  }
  // 서버가 500을 내면 { timestamp, status, error: 'Internal Server Error', path } 형태로
  // 내려와서 error가 문자열이다. 이 경우 code를 잃지 않도록 상태코드로 대신 채운다.
  const status = error.response?.status;
  if (status) {
    return Promise.reject(
      new ApiError(`HTTP_${status}`, '일시적인 오류가 발생했어요. 잠시 후 다시 시도해주세요.'),
    );
  }
  return Promise.reject(error);
};
