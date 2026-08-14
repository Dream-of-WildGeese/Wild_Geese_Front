const USER_ID_STORAGE_KEY = 'ondam.userId';

// 회원가입 연동 전까지는 .env의 VITE_DEV_USER_ID로 테스트 계정을 대신 쓴다.
// 실제 가입이 붙으면 localStorage 값이 항상 우선하므로 그대로 두어도 된다.
export const getUserId = () =>
  localStorage.getItem(USER_ID_STORAGE_KEY) || import.meta.env.VITE_DEV_USER_ID || null;
export const setUserId = (userId) => localStorage.setItem(USER_ID_STORAGE_KEY, String(userId));
export const clearUserId = () => localStorage.removeItem(USER_ID_STORAGE_KEY);
