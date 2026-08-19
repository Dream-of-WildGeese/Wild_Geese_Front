import { client } from '../client';

// 가족이 남긴 아침 질문 답변에 이모지 반응을 남긴다.
//
// 서버는 같은 이모지를 다시 보내면 취소하는 토글로 동작한다.
// 다만 지금 어떤 반응을 남겨뒀는지 되읽어오는 응답이 없어서, 화면은
// '방금 보냈다'까지만 알 수 있다. (familyAnswers에 내 반응 필드가 생기면 그때 연결)
export const sendAnswerReaction = (answerId, emoji) =>
  client.post(`/api/v1/morning/answers/${answerId}/reactions`, null, {
    params: { emoji },
  });
