// families/me가 내려주는 role(PARENT/CHILD)·gender(MALE/FEMALE)로 호칭을 정한다.
const RELATION_LABEL = {
  PARENT_FEMALE: '엄마',
  PARENT_MALE: '아빠',
  CHILD_FEMALE: '딸',
  CHILD_MALE: '아들',
};

export const getRelationLabel = (member) =>
  RELATION_LABEL[`${member?.role}_${member?.gender}`] ?? '가족';

export const findPartner = (family, myUserId) =>
  (family?.members ?? []).find((member) => String(member.userId) !== String(myUserId));
