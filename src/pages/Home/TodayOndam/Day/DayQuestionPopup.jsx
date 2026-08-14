import { useState } from 'react';
import styled from 'styled-components';
import mascotImg from '../../../../assets/mascot.png';
import avatarCheering from '../../../../assets/avatar-cheering.png';
import avatarHeartHug from '../../../../assets/avatar-heart-hug.png';
import { getTodayQuestion, submitMorningAnswer } from '../../../../api/morning';
import { useApi, useApiAction } from '../../../../hooks/useApi';

const REACTIONS = ['좋아요', '힘내요', '웃겨요', '최고', '축하해요'];

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.lg};
  background: rgba(44, 44, 42, 0.4);
  z-index: ${({ theme }) => theme.zIndex.modal};
`;

const Card = styled.div`
  position: relative;
  width: 100%;
  max-width: ${({ $wide }) => ($wide ? '354px' : '320px')};
  padding: ${({ $wide }) => ($wide ? '28px 24px' : '32px 28px 28px')};
  border-radius: 24px;
  background: ${({ theme }) => theme.colors.surface};
  display: flex;
  flex-direction: column;
  align-items: ${({ $wide }) => ($wide ? 'stretch' : 'center')};
  gap: 14px;
`;

const CharacterCircle = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 32px;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.accentSoft};
  align-self: center;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const Message = styled.p`
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  text-align: center;
  color: ${({ theme }) => theme.colors.text};
  line-height: 1.4;
`;

const QuestionTitle = styled.p`
  margin: 0;
  font-size: ${({ $small }) => ($small ? '18px' : '21px')};
  font-weight: 600;
  text-align: center;
  color: ${({ theme }) => theme.colors.text};
  line-height: 1.4;
`;

const Input = styled.input`
  height: 48px;
  padding: 0 14px;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 17px;
  color: ${({ theme }) => theme.colors.text};

  &::placeholder {
    color: ${({ theme }) => theme.colors.textSub};
  }
`;

const VoiceButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 42px;
  border-radius: 10px;
  background: ${({ theme }) => theme.colors.accentSoft};
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text};
  font-size: 16px;
  font-weight: 500;
`;

const PrimaryButton = styled.button`
  align-self: center;
  width: 100%;
  max-width: ${({ $wide }) => ($wide ? '100%' : '264px')};
  height: 50px;
  border-radius: 10px;
  background: ${({ theme }) => theme.colors.accent};
  color: #fff;
  font-size: 17px;
  font-weight: 600;

  &:disabled {
    opacity: 0.5;
  }
`;

const GhostText = styled.button`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 15px;
`;

const HintText = styled.p`
  margin: 0;
  font-size: 14px;
  text-align: center;
  color: ${({ theme }) => theme.colors.accent};
`;

const AnswerBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  border-radius: 14px;
  background: ${({ theme }) => theme.colors.accentSoft};
`;

const Badge = styled.span`
  align-self: flex-start;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  background: ${({ theme, $mine }) => ($mine ? theme.colors.accent : '#fae5d9')};
  color: ${({ $mine }) => ($mine ? '#fff' : '#e8734a')};
`;

const AnswerRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
`;

const AnswerAvatar = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 16px;
  object-fit: cover;
  flex-shrink: 0;
`;

const AnswerText = styled.p`
  margin: 0;
  font-size: 16px;
  color: ${({ theme }) => theme.colors.text};
  line-height: 1.5;
`;

const ReactionRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const ReactionButton = styled.button`
  height: 34px;
  padding: 0 12px;
  border-radius: 17px;
  background: ${({ theme, $active }) => ($active ? theme.colors.accent : theme.colors.surface)};
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme, $active }) => ($active ? '#fff' : theme.colors.text)};
  font-size: 13px;
  font-weight: 500;
`;

const EmptyAnswerBox = styled.div`
  padding: 16px;
  border-radius: 14px;
  background: ${({ theme }) => theme.colors.accentSoft};
`;

const EmptyAnswerText = styled.p`
  margin: 0;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textMuted};
  line-height: 1.6;
  text-align: center;
`;

function DayQuestionPopup({ onClose }) {
  const [step, setStep] = useState('intro'); // intro | question | result
  const [answer, setAnswer] = useState('');
  const [sentReaction, setSentReaction] = useState(null);

  const { data: question, loading, error, refetch } = useApi(getTodayQuestion);
  const { execute: submitAnswer, loading: submitting } = useApiAction(submitMorningAnswer);

  const questionText = question?.content ?? '';
  const myAnswer = question?.myAnswer ?? '';
  // 가족 답변은 여러 명일 수 있지만 화면은 한 명분만 보여준다.
  const partnerAnswer = question?.familyAnswers?.[0] ?? null;

  const handleSubmit = async () => {
    if (!answer.trim()) return;
    const { ok, error: submitError } = await submitAnswer(question.questionId, {
      textValue: answer.trim(),
      inputType: 'TEXT',
    });
    if (!ok) {
      alert(submitError.message);
      return;
    }
    // 내 답변을 저장하면 그제서야 가족 답변이 함께 내려오므로 다시 조회한다.
    refetch();
    setStep('result');
  };

  if (step === 'intro') {
    return (
      <Backdrop onClick={onClose}>
        <Card onClick={(event) => event.stopPropagation()}>
          <CharacterCircle>
            <img src={mascotImg} alt="" />
          </CharacterCircle>
          <Message>
            좋은 아침이에요~
            <br />
            오늘의 질문에 답해보세요~!
          </Message>
          <PrimaryButton type="button" onClick={() => setStep('question')}>
            답하러 갈게요
          </PrimaryButton>
          <GhostText type="button" onClick={onClose}>
            나중에 할게요
          </GhostText>
        </Card>
      </Backdrop>
    );
  }

  if (step === 'question') {
    return (
      <Backdrop onClick={onClose}>
        <Card $wide onClick={(event) => event.stopPropagation()}>
          <QuestionTitle>
            {loading ? '질문을 불러오는 중이에요...' : error ? error.message : questionText}
          </QuestionTitle>
          <Input
            placeholder="입력해주세요"
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
          />
          {/* 음성 인식은 아침 질문용 STT API가 아직 없어서 표시만 한다 */}
          <VoiceButton type="button">● 음성으로 인식하기</VoiceButton>
          <PrimaryButton
            $wide
            type="button"
            onClick={handleSubmit}
            disabled={!answer.trim() || submitting || !question}
          >
            {submitting ? '보내는 중...' : '완료'}
          </PrimaryButton>
          <HintText>답변을 남기면 부모님 답변도 보러갈 수 있어요</HintText>
        </Card>
      </Backdrop>
    );
  }

  return (
    <Backdrop onClick={onClose}>
      <Card $wide onClick={(event) => event.stopPropagation()}>
        <QuestionTitle $small>{questionText}</QuestionTitle>
        <AnswerBox>
          <Badge $mine>내 답변</Badge>
          <AnswerRow>
            <AnswerAvatar src={avatarCheering} alt="" />
            <AnswerText>{myAnswer || answer}</AnswerText>
          </AnswerRow>
        </AnswerBox>

        {partnerAnswer ? (
          <AnswerBox>
            <Badge>{partnerAnswer.name} 답변</Badge>
            <AnswerRow>
              <AnswerAvatar src={avatarHeartHug} alt="" />
              <AnswerText>{partnerAnswer.textValue}</AnswerText>
            </AnswerRow>
            <ReactionRow>
              {REACTIONS.map((reaction) => (
                <ReactionButton
                  key={reaction}
                  type="button"
                  $active={sentReaction === reaction}
                  onClick={() => setSentReaction(reaction)}
                >
                  {reaction}
                </ReactionButton>
              ))}
            </ReactionRow>
          </AnswerBox>
        ) : (
          <EmptyAnswerBox>
            <EmptyAnswerText>
              아직 부모님 답변이 없어요.
              <br />
              답변이 도착하면 질문함에서 확인할 수 있어요.
            </EmptyAnswerText>
          </EmptyAnswerBox>
        )}

        <PrimaryButton $wide type="button" onClick={onClose}>
          닫기
        </PrimaryButton>
      </Card>
    </Backdrop>
  );
}

export default DayQuestionPopup;
