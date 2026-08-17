// 시연용 고정 계정.
//
// 회원가입 API가 email/password를 요구하는데 온보딩 화면에 입력란이 없어서,
// 역할을 고르면 미리 만들어둔 계정으로 로그인시킨다.
// 두 계정은 서버에서 이미 같은 가족(familyId=4)으로 묶여 있다.
//
// 실제 회원가입이 붙으면 이 파일과 참조하는 곳만 지우면 된다.
//   - UserType.jsx      역할 선택 시 setUserId
//   - InviteCode.jsx    상대 이름 fallback
//   - .env              VITE_DEV_USER_ID

export const DEMO_ACCOUNTS = {
  parent: { userId: 39, name: '봉미선' },
  child: { userId: 35, name: '신짱구' },
};

export const getDemoAccount = (role) => DEMO_ACCOUNTS[role] ?? DEMO_ACCOUNTS.child;

// 상대 역할의 계정. 가족 조회 응답에 이름이 없을 때 대신 쓴다.
export const getDemoPartner = (role) =>
  role === 'parent' ? DEMO_ACCOUNTS.child : DEMO_ACCOUNTS.parent;

export const getPartnerRelation = (role) => (role === 'parent' ? '자녀' : '부모');
