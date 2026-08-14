import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { getTodayEveningQuestions, submitEveningAnswers } from '../../../../api/evening';
import { useApi, useApiAction } from '../../../../hooks/useApi';

// 질문 목록과 선택지는 GET /api/v1/evening/today가 내려준다.
// metricType(CONDITION/SLEEP/MEAL/ACTIVITY/BODY)에 따라 질병 맞춤 질문이 섞여 나올 수 있다.

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
  const [answers, setAnswers] = useState({});
  const [note, setNote] = useState('');

  const { data, loading, error } = useApi(getTodayEveningQuestions);
  const { execute: submitAnswers, loading: submitting } = useApiAction(submitEveningAnswers);

  const questions = data?.questions ?? [];
  const totalSteps = questions.length;
  const isLastStep = stepIndex === totalSteps - 1;
  const question = questions[stepIndex];

  const selectOption = (optionIndex) => {
    setAnswers((prev) => ({ ...prev, [question.questionId]: optionIndex }));

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

  const handleFinish = async () => {
    // 고른 선택지만 보낸다. 마지막 질문에는 자유 입력(note)을 함께 실어 보낸다.
    const payload = questions
      .filter((item) => answers[item.questionId] != null)
      .map((item, index) => {
        const choice = item.choices?.[answers[item.questionId]];
        const isLast = index === questions.length - 1;
        return {
          questionId: item.questionId,
          choiceValue: choice ? String(choice.value) : null,
          textValue: isLast && note.trim() ? note.trim() : (choice?.label ?? ''),
          inputType: 'CHOICE',
        };
      });

    const { ok, error: submitError } = await submitAnswers(payload);
    if (!ok) {
      alert(submitError.message);
      return;
    }
    navigate('/home', { state: { healthCheckDone: true } });
  };

  if (loading || error || totalSteps === 0) {
    return (
      <Page>
        <Header>
          <HeaderButton type="button" aria-label="닫기" onClick={() => navigate('/home')}>
            ✕
          </HeaderButton>
          <HeaderTitle>오늘의 건강 체크</HeaderTitle>
          <HeaderSpacer />
        </Header>
        <QuestionTitle>
          {loading
            ? '질문을 불러오는 중이에요...'
            : error
              ? error.message
              : '오늘은 준비된 질문이 없어요.'}
        </QuestionTitle>
      </Page>
    );
  }

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
        {questions.map((item, index) => (
          <StepDot key={item.questionId} $active={index === stepIndex} />
        ))}
      </StepDots>

      <StepCounter>
        {stepIndex + 1} / {totalSteps}
      </StepCounter>
      <QuestionTitle>{question.content}</QuestionTitle>

      {/* 음성 답변 STT API(POST /evening/answers/voice)는 있지만 녹음 UI가 아직 없어 표시만 한다 */}
      <VoiceButton type="button">
        <MicCircle>●</MicCircle>
        <VoiceLabel>눌러서 말해보세요</VoiceLabel>
      </VoiceButton>

      <OrText>또는 직접 골라주세요</OrText>
      {(question.choices ?? []).map((choice, optionIndex) => (
        <OptionButton
          key={choice.label}
          type="button"
          $selected={answers[question.questionId] === optionIndex}
          onClick={() => selectOption(optionIndex)}
        >
          {choice.label}
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
          <SubmitButton
            type="button"
            disabled={answers[question.questionId] == null || submitting}
            onClick={handleFinish}
          >
            {submitting ? '저장 중...' : '오늘 기록 완료'}
          </SubmitButton>
        </>
      )}
    </Page>
  );
}

export default DailyHealthCheck;
