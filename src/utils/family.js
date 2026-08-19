// families/me가 내려주는 role(PARENT/CHILD)·gender(MALE/FEMALE)로 호칭을 정한다.
const RELATION_LABEL = {
  PARENT_FEMALE: '엄마',
  PARENT_MALE: '아빠',
  CHILD_FEMALE: '딸',
  CHILD_MALE: '아들',
};

export const getRelationLabel = (member) =>
  RELATION_LABEL[`${member?.role}_${member?.gender}`] ?? '가족';

// 받침이 있으면 '과', 없으면 '와'를 붙인다.
// 호칭이 엄마·아빠·딸·아들로 갈리는데, 그냥 '와'로 두면 '딸와'처럼 어색해진다.
const hasFinalConsonant = (word) => {
  const last = String(word ?? '').trim().slice(-1);
  if (!last) return false;
  const code = last.charCodeAt(0);
  // 한글 음절이 아니면(영문·숫자 등) 받침 없는 것으로 본다.
  if (code < 0xac00 || code > 0xd7a3) return false;
  return (code - 0xac00) % 28 > 0;
};

export const withCompanionJosa = (word) => `${word}${hasFinalConsonant(word) ? '과' : '와'}`;

export const findPartner = (family, myUserId) =>
  (family?.members ?? []).find((member) => String(member.userId) !== String(myUserId));
