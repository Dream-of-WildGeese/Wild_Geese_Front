// 아침 질문 답변을 고르는 규칙.
//
// 서버는 답변을 덮어쓰지 않고 볼 때마다 새 줄로 쌓는다. 그런데
//  - `myAnswer`와 `/daily`의 `morningAnswer`에는 '가장 처음 답'이 담겨 오고
//  - `familyAnswers`에는 나를 포함한 모두의 답이 오래된 순으로 전부 들어온다
//
// 그래서 응답을 그대로 쓰면 방금 고쳐 쓴 답이 화면에 안 나타나고(옛 답이 남고),
// 가족 답변 자리에 내 답이 뜨기도 한다. 사람별로 '가장 나중 답'을 직접 골라 쓴다.

const isSamePerson = (answer, userId) => String(answer?.userId) === String(userId);

// answerId가 클수록 나중에 남긴 답이다.
const latestOf = (answers) =>
  (answers ?? []).reduce(
    (latest, item) => (!latest || (item.answerId ?? 0) > (latest.answerId ?? 0) ? item : latest),
    null,
  );

// 내가 마지막으로 남긴 답
export const findMyLatestAnswer = (familyAnswers, myUserId) =>
  latestOf((familyAnswers ?? []).filter((answer) => isSamePerson(answer, myUserId)));

// 가족이 마지막으로 남긴 답 (내 답은 제외한다)
export const findPartnerLatestAnswer = (familyAnswers, myUserId) =>
  latestOf((familyAnswers ?? []).filter((answer) => !isSamePerson(answer, myUserId)));
