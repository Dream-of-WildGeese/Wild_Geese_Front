import { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import micIcon from '../../../../assets/popup/mic.png';
import likeIcon from '../../../../assets/reaction/like.png';
import cheerIcon from '../../../../assets/reaction/cheer.png';
import funnyIcon from '../../../../assets/reaction/funny.png';
import bestIcon from '../../../../assets/reaction/best.png';
import congratsIcon from '../../../../assets/reaction/congrats.png';
import {
  getTodayQuestion,
  submitMorningAnswer,
  transcribeMorningAnswer,
} from '../../../../api/morning';
import { useApi, useApiAction } from '../../../../hooks/useApi';
import { useVoiceRecorder } from '../../../../hooks/useVoiceRecorder';
import {
  PopupBackdrop,
  PopupCard,
  PopupInnerBorder,
  PopupTitle,
  PopupPrimaryButton,
  PopupSecondaryButton,
  PopupButtonRow,
  PopupIcon,
} from '../../../../components/PopupShell';
import ReactionSentPopup from './ReactionSentPopup';

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
  border: 1px solid ${({ $recording }) => ($recording ? '#e6a794' : '#d8cbb8')};
  background: ${({ $recording }) => ($recording ? '#fdf0e8' : '#fffbf1')};

  &:disabled {
    opacity: 0.6;
  }
`;

const VoiceLabel = styled.span`
  color: ${({ $recording }) => ($recording ? '#c1553c' : '#8c8780')};
  font-family: 'Noto Sans KR';
  font-size: 14px;
  font-weight: 500;
`;

const VoiceError = styled.p`
  margin: 0;
  width: 100%;
  text-align: center;
  color: #c1553c;
  font-family: 'Noto Sans KR';
  font-size: 13px;
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
  const [step, setStep] = useState(null); // null(판단 전) | question | result
  const [answer, setAnswer] = useState('');
  const [sentReaction, setSentReaction] = useState(null);

  const { data: question, loading, error, refetch } = useApi(getTodayQuestion);
  const { execute: submitAnswer, loading: submitting } = useApiAction(submitMorningAnswer);

  const questionText = question?.content ?? '';
  const myAnswer = question?.myAnswer ?? '';

  // 이미 답한 날이면 답변 비교 화면부터 보여준다. (건강일지에서 '수정'으로 들어올 때도 동일)
  useEffect(() => {
    if (step !== null || loading) return;
    setStep(myAnswer ? 'result' : 'question');
  }, [step, loading, myAnswer]);
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

  // 아침 질문의 음성 API는 텍스트 변환뿐 아니라 답변 저장까지 한 번에 끝내므로,
  // 녹음이 끝나면 바로 완료 처리한다(따로 '완료' 버튼을 누를 필요가 없다).
  const transcribe = useCallback(
    (blob) => transcribeMorningAnswer(question.questionId, blob),
    [question?.questionId],
  );
  const handleVoiceDone = useCallback(
    async (text) => {
      setAnswer(text);
      await refetch();
      setStep('result');
    },
    [refetch],
  );
  const voice = useVoiceRecorder(transcribe, handleVoiceDone);

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

          <PopupButtonRow>
            <PopupSecondaryButton
              type="button"
              onClick={() => {
                setAnswer(myAnswer);
                setStep('question');
              }}
            >
              다시 답하기
            </PopupSecondaryButton>
            <PopupPrimaryButton type="button" onClick={onClose}>
              닫기
            </PopupPrimaryButton>
          </PopupButtonRow>
        </PopupCard>

        {/* 와이어프레임 '좋아요 팝업': 반응을 보내면 확인 화면이 뜬다 */}
        {sentReaction && (
          <ReactionSentPopup
            reaction={REACTIONS.find((item) => item.key === sentReaction)}
            partnerName={partnerAnswer?.name}
            onClose={() => setSentReaction(null)}
          />
        )}
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

        <VoiceButton
          type="button"
          onClick={voice.toggle}
          disabled={!voice.supported || voice.busy || !question}
          $recording={voice.recording}
        >
          <PopupIcon $size={100} src={micIcon} alt="" />
          <VoiceLabel $recording={voice.recording}>
            {!voice.supported
              ? '음성 미지원'
              : voice.busy
                ? '옮겨 적는 중...'
                : voice.recording
                  ? '눌러서 멈추기'
                  : '음성으로 인식하기'}
          </VoiceLabel>
        </VoiceButton>
        {voice.error && <VoiceError>{voice.error.message}</VoiceError>}

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
