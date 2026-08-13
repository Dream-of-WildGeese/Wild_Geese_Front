import HomePopup from './HomePopup';

const QUESTIONS_BY_SLOT = {
  morning: {
    label: '아침 질문',
    question: '오늘 아침 컨디션은 어떠세요? 잠은 잘 주무셨나요?',
  },
  afternoon: {
    label: '점심 질문',
    question: '점심은 맛있게 드셨나요? 오후에도 활력이 남아있나요?',
  },
  evening: {
    label: '저녁 질문',
    question: '오늘 하루 컨디션은 어떠셨나요? 약은 잊지 않고 드셨나요?',
  },
};

const COMMON_QUESTION = '오늘 물은 충분히 마셨나요?';

function getTimeSlot(hour) {
  if (hour >= 5 && hour < 11) return 'morning';
  if (hour >= 11 && hour < 17) return 'afternoon';
  return 'evening';
}

function HomeQuestionPopup({ onClose }) {
  const slot = QUESTIONS_BY_SLOT[getTimeSlot(new Date().getHours())];

  return (
    <HomePopup
      title={slot.label}
      description={`${slot.question}\n\n[공통 질문]\n${COMMON_QUESTION}`}
      onClose={onClose}
    />
  );
}

export default HomeQuestionPopup;
