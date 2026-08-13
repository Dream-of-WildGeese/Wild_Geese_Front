export class ApiError extends Error {
  constructor(code, message) {
    super(message || '요청 처리 중 오류가 발생했습니다.');
    this.name = 'ApiError';
    this.code = code;
  }
}
