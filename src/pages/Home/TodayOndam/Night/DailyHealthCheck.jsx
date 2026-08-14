import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

// 앞의 4개(컨디션/수면/식사/외출활동)는 모든 사용자에게 공통으로 노출되는 질문이다.
// 마지막 5번째(몸 상태)는 추후 다른 화면에서 입력한 질병 정보를 바탕으로
// LLM이 맞춤 질문을 생성할 예정이라, 지금은 와이어프레임 예시 문구로 대체한다.
const QUESTIONS = [
  {
    title: ['오늘 컨디션은', '어땠나요?'],
    options: ['좋았어요', '보통이었어요', '좀 힘들었어요'],
  },
  {
    title: ['오늘 수면은', '어떠셨나요?'],
    options: ['푹 잤어요', '조금 부족했어요', '거의 못 잤어요'],
  },
  {
    title: ['오늘 식사는', '어떠셨나요?'],
    options: ['잘 챙겼어요', '한두 끼 걸렀어요', '입맛이 없었어요'],
  },
  {
    title: ['오늘 외출이나 활동은', '어떠셨나요?'],
    options: ['가볍게 움직였어요', '집에서 쉬었어요', '거의 못 움직였어요'],
  },
  {
    title: ['오늘 몸 상태는', '어떠셨나요?'],
    options: ['괜찮았어요', '조금 불편했어요', '많이 불편했어요'],
  },
];

const TOTAL_STEPS = QUESTIONS.length;

const Page = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  padding: 16px 20px 24px;
  background: ${({ theme }) => theme.colors.surface};
  box-sizing: border-box;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 12px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  flex-shrink: 0;
`;

const HeaderButton = styled.button`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: ${({ theme }) => theme.colors.text};
`;

const HeaderTitle = styled.p`
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
`;

const HeaderSpacer = styled.div`
  width: 24px;
  height: 24px;
`;

const StepDots = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 20px;
  flex-shrink: 0;
`;

const StepDot = styled.div`
  height: 8px;
  width: ${({ $active }) => ($active ? '22px' : '8px')};
  border-radius: 4px;
  background: ${({ $active, theme }) => ($active ? theme.colors.accent : theme.colors.border)};
  transition: width 0.2s ease;
`;

const StepCounter = styled.p`
  margin: 40px 0 8px;
  font-size: 13px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textSub};
`;

const QuestionTitle = styled.h2`
  margin: 0 0 32px;
  font-size: 24px;
  font-weight: 600;
  line-height: 1.35;
  color: ${({ theme }) => theme.colors.text};
`;

const VoiceButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  height: 140px;
  border-radius: 20px;
  background: ${({ theme }) => theme.colors.accent};
  flex-shrink: 0;
`;

const MicCircle = styled.span`
  width: 56px;
  height: 56px;
  border-radius: 28px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.accent};
  font-size: 22px;
`;

const VoiceLabel = styled.span`
  font-size: 18px;
  font-weight: 600;
  color: #fff;
`;

const OrText = styled.p`
  margin: 28px 0 12px;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSub};
`;

const OptionButton = styled.button`
  width: 100%;
  height: 46px;
  padding: 0 16px;
  margin-bottom: 8px;
  border-radius: 10px;
  text-align: left;
  font-size: 14px;
  background: ${({ theme, $selected }) => ($selected ? theme.colors.accentSoft : '#f7f5f0')};
  color: ${({ theme, $selected }) => ($selected ? theme.colors.accent : theme.colors.textMuted)};
  border: 1px solid ${({ theme, $selected }) => ($selected ? theme.colors.accent : 'transparent')};
  font-weight: ${({ $selected }) => ($selected ? 600 : 400)};
`;

const NoteLabel = styled.p`
  margin: 20px 0 8px;
  font-size: 15px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
`;

const NoteInput = styled.textarea`
  width: 100%;
  min-height: 64px;
  padding: 12px;
  border-radius: 12px;
  border: none;
  background: #f7f5f0;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text};
  resize: none;

  &::placeholder {
    color: ${({ theme }) => theme.colors.textSub};
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  height: 54px;
  margin-top: 16px;
  border-radius: 14px;
  background: ${({ theme }) => theme.colors.accent};
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  flex-shrink: 0;

  &:disabled {
    opacity: 0.5;
  }
`;

function DailyHealthCheck() {
  const navigate = useNavigate();
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState(() => Array(TOTAL_STEPS).fill(null));
  const [note, setNote] = useState('');

  const isLastStep = stepIndex === TOTAL_STEPS - 1;
  const question = QUESTIONS[stepIndex];

  const selectOption = (optionIndex) => {
    const next = [...answers];
    next[stepIndex] = optionIndex;
    setAnswers(next);

    if (!isLastStep) {
      setStepIndex(stepIndex + 1);
    }
  };

  const handleBack = () => {
    if (stepIndex === 0) {
      navigate('/home');
      return;
    }
    setStepIndex(stepIndex - 1);
  };

  const handleFinish = () => {
    navigate('/home', { state: { healthCheckDone: true } });
  };

  return (
    <Page>
      <Header>
        <HeaderButton type="button" aria-label={stepIndex === 0 ? '닫기' : '이전'} onClick={handleBack}>
          {stepIndex === 0 ? '✕' : '‹'}
        </HeaderButton>
        <HeaderTitle>오늘의 건강 체크</HeaderTitle>
        <HeaderSpacer />
      </Header>

      <StepDots>
        {QUESTIONS.map((_, index) => (
          <StepDot key={index} $active={index === stepIndex} />
        ))}
      </StepDots>

      <StepCounter>
        {stepIndex + 1} / {TOTAL_STEPS}
      </StepCounter>
      <QuestionTitle>
        {question.title.map((line) => (
          <span key={line}>
            {line}
            <br />
          </span>
        ))}
      </QuestionTitle>

      {/* 음성 인식은 API 연동 후 작업 예정이라 지금은 표시만 한다 */}
      <VoiceButton type="button">
        <MicCircle>●</MicCircle>
        <VoiceLabel>눌러서 말해보세요</VoiceLabel>
      </VoiceButton>

      <OrText>또는 직접 골라주세요</OrText>
      {question.options.map((option, optionIndex) => (
        <OptionButton
          key={option}
          type="button"
          $selected={answers[stepIndex] === optionIndex}
          onClick={() => selectOption(optionIndex)}
        >
          {option}
        </OptionButton>
      ))}

      {isLastStep && (
        <>
          <NoteLabel>남기고 싶은 말이 있으신가요?</NoteLabel>
          <NoteInput
            placeholder="자유롭게 적어주세요 (선택)"
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
          <SubmitButton type="button" disabled={answers[stepIndex] === null} onClick={handleFinish}>
            오늘 기록 완료
          </SubmitButton>
        </>
      )}
    </Page>
  );
}

export default DailyHealthCheck;
