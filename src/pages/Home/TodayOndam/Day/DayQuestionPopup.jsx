import { useState } from 'react';
import styled from 'styled-components';
import micIcon from '../../../../assets/popup/mic.png';
import likeIcon from '../../../../assets/reaction/like.png';
import cheerIcon from '../../../../assets/reaction/cheer.png';
import funnyIcon from '../../../../assets/reaction/funny.png';
import bestIcon from '../../../../assets/reaction/best.png';
import congratsIcon from '../../../../assets/reaction/congrats.png';
import { getTodayQuestion, submitMorningAnswer } from '../../../../api/morning';
import { useApi, useApiAction } from '../../../../hooks/useApi';
import {
  PopupBackdrop,
  PopupCard,
  PopupInnerBorder,
  PopupTitle,
  PopupPrimaryButton,
  PopupIcon,
} from '../../../../components/PopupShell';

// Figma 13(공통질문) + 17 ver01(답변 비교).
// ver01은 반응 아이콘이 '부모님 답변' 카드 안에 들어간다.
const REACTIONS = [
  { key: 'LIKE', label: '좋아요', icon: likeIcon },
  { key: 'CHEER', label: '힘내요', icon: cheerIcon },
  { key: 'FUNNY', label: '웃겨요', icon: funnyIcon },
  { key: 'BEST', label: '최고', icon: bestIcon },
  { key: 'CONGRATS', label: '축하해요', icon: congratsIcon },
];

const Input = styled.input`
  width: 100%;
  height: 68px;
  padding: 0 18px;

  border-radius: 10px;
  border: 1px solid #d8cbb8;
  background: #fff;

  color: #4a3a2f;
  font-family: 'Noto Sans KR';
  font-size: 21px;

  &::placeholder {
    color: #8c8780;
  }
`;

const VoiceButton = styled.button`
  width: 100%;
  padding: 14px 12px;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;

  border-radius: 10px;
  border: 1px solid #d8cbb8;
  background: #fffbf1;
`;

const VoiceLabel = styled.span`
  color: #8c8780;
  font-family: 'Noto Sans KR';
  font-size: 14px;
  font-weight: 500;
`;

const HintText = styled.p`
  margin: 0;
  width: 100%;
  text-align: center;
  color: #576b1a;
  font-family: Jua;
  font-size: 16px;
`;

const AnswerCard = styled.div`
  width: 100%;
  padding: 16px;

  display: flex;
  flex-direction: column;
  gap: 12px;

  border-radius: 10px;
  border: 1px solid #d8cbb8;
  background: #fffbf1;
`;

const Badge = styled.span`
  align-self: flex-start;
  padding: 4px 10px;
  border-radius: 20px;
  background: ${({ $mine }) => ($mine ? '#edf3d5' : '#f6ebc7')};
  color: ${({ $mine }) => ($mine ? '#576b1a' : '#8a6b3e')};
  font-family: 'Noto Sans KR';
  font-size: 13px;
  font-weight: 700;
`;

const AnswerText = styled.p`
  margin: 0;
  padding: 12px 14px;
  border-radius: 10px;
  background: #fff;
  border: 1px solid #e8dcc4;

  color: #4a3a2f;
  font-family: 'Noto Sans KR';
  font-size: 15px;
  line-height: 1.5;
`;

const ReactionRow = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: center;
`;

const ReactionButton = styled.button`
  width: 50px;
  height: 50px;
  border-radius: 25px;
  padding: 3px;
  border: 2px solid ${({ $active }) => ($active ? '#cbd879' : 'transparent')};
  background: ${({ $active }) => ($active ? '#edf3d5' : 'transparent')};
`;

const EmptyAnswerBox = styled.div`
  width: 100%;
  padding: 20px 16px;
  border-radius: 10px;
  border: 1px dashed #d8cbb8;
  background: #fffbf1;

  text-align: center;
  color: #8c8780;
  font-family: 'Noto Sans KR';
  font-size: 14px;
  line-height: 1.6;
`;

function DayQuestionPopup({ onClose }) {
  const [step, setStep] = useState('question'); // question | result
  const [answer, setAnswer] = useState('');
  const [sentReaction, setSentReaction] = useState(null);

  const { data: question, loading, error, refetch } = useApi(getTodayQuestion);
  const { execute: submitAnswer, loading: submitting } = useApiAction(submitMorningAnswer);

  const questionText = question?.content ?? '';
  const myAnswer = question?.myAnswer ?? '';
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
    refetch();
    setStep('result');
  };

  if (step === 'result') {
    return (
      <PopupBackdrop onClick={onClose}>
        <PopupCard $gap={16} onClick={(event) => event.stopPropagation()}>
          <PopupInnerBorder />
          <PopupTitle $center $size={22}>
            답변 확인하기
          </PopupTitle>

          <AnswerCard>
            <Badge $mine>내 답변</Badge>
            <AnswerText>{myAnswer || answer}</AnswerText>
          </AnswerCard>

          {partnerAnswer ? (
            <AnswerCard>
              <Badge>{partnerAnswer.name} 답변</Badge>
              <AnswerText>{partnerAnswer.textValue}</AnswerText>
              {/* ver01: 반응 아이콘이 상대 답변 카드 안에 들어간다 */}
              <ReactionRow>
                {REACTIONS.map((reaction) => (
                  <ReactionButton
                    key={reaction.key}
                    type="button"
                    aria-label={reaction.label}
                    $active={sentReaction === reaction.key}
                    onClick={() => setSentReaction(reaction.key)}
                  >
                    <PopupIcon $size={44} src={reaction.icon} alt="" />
                  </ReactionButton>
                ))}
              </ReactionRow>
            </AnswerCard>
          ) : (
            <EmptyAnswerBox>
              아직 가족의 답변이 없어요.
              <br />
              답변이 도착하면 질문함에서 확인할 수 있어요.
            </EmptyAnswerBox>
          )}

          <PopupPrimaryButton type="button" onClick={onClose}>
            닫기
          </PopupPrimaryButton>
        </PopupCard>
      </PopupBackdrop>
    );
  }

  return (
    <PopupBackdrop onClick={onClose}>
      <PopupCard $center $gap={16} onClick={(event) => event.stopPropagation()}>
        <PopupInnerBorder />
        <PopupTitle $center $size={24}>
          {loading ? '질문을 불러오는 중이에요...' : error ? error.message : questionText}
        </PopupTitle>

        <Input
          placeholder="답변을 적어주세요"
          value={answer}
          onChange={(event) => setAnswer(event.target.value)}
        />

        {/* 아침 질문용 STT API가 아직 없어서 버튼만 노출한다 */}
        <VoiceButton type="button">
          <PopupIcon $size={100} src={micIcon} alt="" />
          <VoiceLabel>음성으로 인식하기</VoiceLabel>
        </VoiceButton>

        <PopupPrimaryButton
          type="button"
          onClick={handleSubmit}
          disabled={!answer.trim() || submitting || !question}
        >
          {submitting ? '보내는 중...' : '완료'}
        </PopupPrimaryButton>

        <HintText>답변을 남기면 부모님 답변도 볼 수 있어요</HintText>
      </PopupCard>
    </PopupBackdrop>
  );
}

export default DayQuestionPopup;
