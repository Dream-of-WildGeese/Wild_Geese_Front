// 걸음수/컨디션/AI 코멘트 등은 실제 헬스케어 연동이나 LLM 생성이 아직 없어서
// 와이어프레임 예시 데이터로 채워둔다. 실제 연동 시 이 객체를 API 응답으로 교체한다.
export const TODAY_REPORT = {
  me: {
    personLabel: '나',
    dateLabel: '8월 13일 목요일',
    summary: { questionStatus: '완료', medication: '2/3', condition: '좋음' },
    aiComment: '오늘은 걸음수도 늘고 컨디션도 좋아 보여요. 이런 흐름 쭉 이어가봐요!',
    stepMessage: '오늘 6,200보 걸으셨어요, 어제보다 800보 더 걸으셨네요',
    timeline: [
      {
        type: 'question',
        time: '아침 · 오전 8:32',
        question: '오늘 가장 먹고 싶은 음식은?',
        answer: '칼국수',
      },
      {
        type: 'medication',
        time: '복약 · 오후 2:05',
        medications: [
          { name: '혈압약', taken: true, color: '#fcd9d9', textColor: '#d94040' },
          { name: '비타민D', taken: true, color: '#fce5c7', textColor: '#d98c26' },
          { name: '저녁약', taken: false },
        ],
        note: '저녁약은 아직 기록되지 않았어요',
      },
      {
        type: 'healthcheck',
        time: '저녁 · 오후 8:10',
        lines: [
          { icon: '♥', text: '오늘 컨디션이 좋았어요' },
          { icon: 'Z', text: '6시간 정도 푹 주무셨어요' },
          { icon: 'M', text: '식사도 잘 챙기셨어요' },
          { icon: 'A', text: '가볍게 산책도 다녀오셨어요' },
          { icon: 'B', text: '몸 상태도 괜찮았다고 하셨어요' },
        ],
        aiComment: '산책 다녀오신 덕분에 컨디션이 더 좋으셨나 봐요',
      },
    ],
  },
  mom: {
    personLabel: '엄마',
    dateLabel: '8월 13일 목요일',
    summary: { questionStatus: '완료', medication: '2/3', condition: '좋음' },
    aiComment: '엄마는 오늘 걸음수도 늘고 컨디션도 좋아 보이세요. 이런 흐름 쭉 이어가시면 좋겠어요!',
    stepMessage: '엄마가 오늘 6,200보 걸으셨어요, 어제보다 800보 더 걸으셨어요',
    timeline: [
      {
        type: 'question',
        time: '아침 · 오전 8:32',
        question: '오늘 가장 먹고 싶은 음식은?',
        answer: '칼국수',
      },
      {
        type: 'medication',
        time: '복약 · 오후 2:05',
        medications: [
          { name: '혈압약', taken: true, color: '#fcd9d9', textColor: '#d94040' },
          { name: '비타민D', taken: true, color: '#fce5c7', textColor: '#d98c26' },
          { name: '저녁약', taken: false },
        ],
        note: '엄마의 저녁약은 아직 기록되지 않았어요',
      },
      {
        type: 'healthcheck',
        time: '저녁 · 오후 8:10',
        lines: [
          { icon: '♥', text: '엄마 컨디션이 좋았어요' },
          { icon: 'Z', text: '6시간 정도 푹 주무셨어요' },
          { icon: 'M', text: '식사도 잘 챙기셨어요' },
          { icon: 'A', text: '가볍게 산책도 다녀오셨어요' },
          { icon: 'B', text: '몸 상태도 괜찮으셨다고 해요' },
        ],
        aiComment: '산책 다녀오신 덕분에 컨디션이 더 좋으셨나 봐요',
      },
    ],
    cta: {
      title: '엄마와 안부를 나눠볼까요?',
      suggestedMessage: '"오늘 컨디션 좋으시다니 저도 기분 좋네요! 저녁 약도 잊지 마세요~"',
    },
  },
};
