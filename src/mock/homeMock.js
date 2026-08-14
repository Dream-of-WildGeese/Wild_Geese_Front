// 아직 실제 등록/응답 데이터가 없어 홈 화면 CTA 분기를 테스트하기 위한 목데이터.
// 온보딩에서 복용약 등록 API가 연동되면 MOCK_MEDICATIONS는 실제 목록으로 교체한다.
export const MOCK_MEDICATIONS = [
  { id: 'bp', name: '혈압약', hour: 13, minute: 0 },
  { id: 'vitd', name: '비타민D', hour: 13, minute: 0 },
  { id: 'evening-med', name: '저녁약', hour: 19, minute: 0 },
];

// 아침 질문은 이후 LLM으로 생성될 예정이라 지금은 와이어프레임 예시 문구를 그대로 사용한다.
export const MOCK_MORNING_QUESTION = '오늘 아침 기분은 어떤 색깔이에요?';

// 상대방이 아직 답변하지 않은 상태를 기본값으로 둔다.
// 먼저 답변한 사람은 상대방 답변을 바로 보지 못하고, 나중에 질문함에서
// "좋아요" 같은 반응을 남기는 방식으로 확인하게 될 예정이다.
export const MOCK_PARTNER_ANSWER = null;
