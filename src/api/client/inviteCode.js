const INVITE_CODE_STORAGE_KEY = 'ondam.inviteCode';

// 초대코드를 내려주는 API는 회원가입 응답 하나뿐이라, 그때 받아둔 값을 계속 재사용한다.
// 저장에 실패하면 다시 조회할 방법이 없으므로 가입 직후 반드시 저장해야 한다.
export const getInviteCode = () => localStorage.getItem(INVITE_CODE_STORAGE_KEY);
export const setInviteCode = (code) => localStorage.setItem(INVITE_CODE_STORAGE_KEY, String(code));
export const clearInviteCode = () => localStorage.removeItem(INVITE_CODE_STORAGE_KEY);
