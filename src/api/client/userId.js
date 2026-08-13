const USER_ID_STORAGE_KEY = 'ondam.userId';

export const getUserId = () => localStorage.getItem(USER_ID_STORAGE_KEY);
export const setUserId = (userId) => localStorage.setItem(USER_ID_STORAGE_KEY, String(userId));
export const clearUserId = () => localStorage.removeItem(USER_ID_STORAGE_KEY);
