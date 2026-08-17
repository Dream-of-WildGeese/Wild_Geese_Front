const PHONE_STORAGE_KEY = 'ondam.familyPhone';

// 가족 전화번호를 서버가 주지 않아서(FamilyMemberResponse에 phone 필드 없음)
// 사용자가 직접 저장해두고 쓴다. API가 생기면 이 파일만 걷어내면 된다.
export const getFamilyPhone = () => localStorage.getItem(PHONE_STORAGE_KEY) ?? '';
export const setFamilyPhone = (phone) =>
  localStorage.setItem(PHONE_STORAGE_KEY, String(phone).trim());

// 숫자와 +만 남긴다. tel: 링크는 하이픈·공백이 있어도 대부분 동작하지만
// 기기별 편차가 있어서 정리해두는 편이 안전하다.
export const normalizePhone = (phone) => String(phone ?? '').replace(/[^\d+]/g, '');

export const isValidPhone = (phone) => {
  const digits = normalizePhone(phone).replace(/^\+/, '');
  return digits.length >= 9 && digits.length <= 15;
};

// 전화 앱을 연다. 폰에서는 다이얼러가, 데스크톱에서는 연결된 앱이 뜬다.
export const callPhone = (phone) => {
  const normalized = normalizePhone(phone);
  if (!normalized) return false;
  window.location.href = `tel:${normalized}`;
  return true;
};
