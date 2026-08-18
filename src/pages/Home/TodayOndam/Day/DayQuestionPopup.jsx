import { useCallback, useEffect, useRef, useState } from 'react';
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

// 제목 아래에 오는 진짜 질문. 제목('오늘의 질문')과 크기를 구분한다.
const QuestionText = styled.p`
  margin: 0;
  width: 100%;
  text-align: center;

  color: #4a3a2f;
  font-family: 'Noto Sans KR';
  font-size: 20px;
  font-weight: 500;
  line-height: 1.4;
  word-break: keep-all;
`;

const ErrorText = styled.p`
  margin: 0;
  width: 100%;
  text-align: center;
  color: #6b6661;
  font-family: 'Noto Sans KR';
  font-size: 16px;
  line-height: 1.5;
  word-break: keep-all;
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
  // 음성으로 받아 적은 문장. 서버가 이 시점에 답변까지 저장하므로,
  // 사용자가 손대지 않았다면 '완료'에서 다시 보내지 않는다.
  const [voiceText, setVoiceText] = useState(null);

  const { data: question, loading, error, refetch } = useApi(getTodayQuestion);
  const { execute: submitAnswer, loading: submitting } = useApiAction(submitMorningAnswer);

  // 답변을 보내면 질문을 다시 불러오는데, 그 사이 data가 잠깐 비어서
  // 질문이 사라진 것처럼 보였다. 마지막으로 받은 질문을 남겨둔다.
  const lastQuestionRef = useRef('');
  if (question?.content) lastQuestionRef.current = question.content;
  const questionText = question?.content ?? lastQuestionRef.current;

  const myAnswer = question?.myAnswer ?? '';

  // 이미 답한 날이면 답변 비교 화면부터 보여준다. (건강일지에서 '수정'으로 들어올 때도 동일)
  useEffect(() => {
    if (step !== null || loading) return;
    setStep(myAnswer ? 'result' : 'question');
  }, [step, loading, myAnswer]);
  const partnerAnswer = question?.familyAnswers?.[0] ?? null;

  const [submitError, setSubmitError] = useState(null);

  const handleSubmit = async () => {
    const trimmed = answer.trim();
    if (!trimmed) return;

    // 음성으로 받아 적은 문장 그대로면 서버에 이미 저장돼 있다. 또 보내지 않는다.
    if (voiceText !== null && trimmed === voiceText.trim()) {
      await refetch();
      setStep('result');
      return;
    }

    const { ok, error: failed } = await submitAnswer(question.questionId, {
      textValue: trimmed,
      inputType: 'TEXT',
    });
    if (!ok) {
      setSubmitError(failed);
      return;
    }
    // 가족 답변도 함께 갱신되도록 응답을 기다린 뒤 결과 화면으로 넘어간다.
    await refetch();
    setStep('result');
  };

  // 음성 API는 텍스트 변환과 답변 저장을 한 번에 한다. 그래도 바로 넘기지 않고
  // 받아 적은 문장을 입력칸에 채워서, 확인하고 고칠 수 있게 둔다.
  const transcribe = useCallback(
    (blob) => transcribeMorningAnswer(question.questionId, blob),
    [question?.questionId],
  );
  const handleVoiceDone = useCallback(async (text) => {
    setAnswer(text);
    setVoiceText(text);
  }, []);
  const voice = useVoiceRecorder(transcribe, handleVoiceDone);

  // 마이크는 녹음을 시작만 하고, 멈추는 건 아래 '입력 완료' 버튼이 맡는다.
  const handleMicClick = () => {
    if (voice.recording || voice.busy) return;
    setVoiceText(null);
    voice.start();
  };

  const primaryLabel = voice.recording
    ? '입력 완료'
    : voice.busy
      ? '옮겨 적는 중...'
      : submitting
        ? '보내는 중...'
        : '완료';

  const handlePrimaryClick = () => {
    if (voice.recording) {
      voice.stop();
      return;
    }
    handleSubmit();
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
            {/* 방금 쓴 답을 먼저 보여준다. myAnswer를 앞에 두면 다시 답해도
                서버 응답이 도착할 때까지 옛 답이 그대로 보인다. */}
            <AnswerText>{answer || myAnswer}</AnswerText>
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
                // 지난 음성 기록이 남아 있으면 고쳐 써도 다시 안 보내진다
                setVoiceText(null);
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
        <PopupTitle $center $size={30}>
          오늘의 질문
        </PopupTitle>
        <QuestionText>
          {questionText || (loading ? '질문을 불러오는 중이에요...' : error ? error.message : '')}
        </QuestionText>

        <Input
          placeholder="답변을 적어주세요"
          value={answer}
          onChange={(event) => {
            setAnswer(event.target.value);
            // 손대는 순간 '음성 그대로'가 아니게 되므로 다시 보내야 한다.
            setVoiceText(null);
          }}
        />

        <VoiceButton
          type="button"
          onClick={handleMicClick}
          disabled={!voice.supported || voice.busy || voice.recording || !question}
          $recording={voice.recording}
        >
          <PopupIcon $size={100} src={micIcon} alt="" />
          <VoiceLabel $recording={voice.recording}>
            {!voice.supported
              ? '음성 미지원'
              : voice.busy
                ? '옮겨 적는 중...'
                : voice.recording
                  ? '듣고 있어요'
                  : '눌러서 말하기'}
          </VoiceLabel>
        </VoiceButton>

        <PopupPrimaryButton
          type="button"
          onClick={handlePrimaryClick}
          disabled={
            voice.busy || (!voice.recording && (!answer.trim() || submitting || !question))
          }
        >
          {primaryLabel}
        </PopupPrimaryButton>

        <HintText>답변을 남기면 부모님 답변도 볼 수 있어요</HintText>
      </PopupCard>

      {/* 음성 인식·저장 실패는 팝업으로 알린다 */}
      {(voice.error || submitError) && (
        <PopupBackdrop
          onClick={() => {
            voice.clearError();
            setSubmitError(null);
          }}
        >
          <PopupCard $center $gap={16} $padTop={36} onClick={(event) => event.stopPropagation()}>
            <PopupInnerBorder />
            <PopupTitle $center $size={22}>
              {voice.error ? '잘 못 들었어요' : '보내지 못했어요'}
            </PopupTitle>
            <ErrorText>{(voice.error ?? submitError).message}</ErrorText>
            <PopupPrimaryButton
              type="button"
              onClick={() => {
                voice.clearError();
                setSubmitError(null);
              }}
            >
              다시 해볼게요
            </PopupPrimaryButton>
          </PopupCard>
        </PopupBackdrop>
      )}
    </PopupBackdrop>
  );
}

export default DayQuestionPopup;
