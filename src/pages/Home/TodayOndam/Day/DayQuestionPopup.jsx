import { useCallback, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import micIcon from '../../../../assets/popup/mic.svg';
import likeIcon from '../../../../assets/reaction/like.svg';
import cheerIcon from '../../../../assets/reaction/cheer.svg';
import funnyIcon from '../../../../assets/reaction/funny.svg';
import bestIcon from '../../../../assets/reaction/best.svg';
import congratsIcon from '../../../../assets/reaction/congrats.svg';
import {
  getTodayQuestion,
  submitMorningAnswer,
  transcribeMorningAnswer,
  sendAnswerReaction,
} from '../../../../api/morning';
import { useApi, useApiAction } from '../../../../hooks/useApi';
import { useFamilyRelation } from '../../../../hooks/useFamilyRelation';
import { getUserId } from '../../../../api/client';
import {
  findMyLatestAnswer,
  findPartnerLatestAnswer,
} from '../../../../utils/morningAnswer';
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

// Figma 525:1251 — 내 답변은 살구색, 가족 답변은 노란색 카드로 구분한다.
const AnswerCard = styled.div`
  width: 100%;
  padding: 16px;
  box-sizing: border-box;

  display: flex;
  flex-direction: column;
  gap: 8px;

  border-radius: 14px;
  border: 1px solid ${({ $mine }) => ($mine ? '#e6a794' : '#eedda8')};
  background: ${({ $mine }) => ($mine ? '#fbeae5' : '#fbf0d2')};
`;

const Badge = styled.span`
  align-self: flex-start;
  padding: 4px 10px;
  border-radius: 20px;
  background: ${({ $mine }) => ($mine ? '#e6a794' : '#e8cd73')};
  color: #fff;
  font-family: 'Noto Sans KR';
  font-size: 14px;
  font-weight: 700;
  white-space: nowrap;
`;

const AnswerText = styled.p`
  margin: 0;
  width: 100%;
  padding: 12px 14px;
  box-sizing: border-box;

  border-radius: 10px;
  background: #fff;
  border: 1.5px solid
    ${({ $mine }) => ($mine ? 'rgba(230, 167, 148, 0.9)' : 'rgba(238, 221, 168, 0.9)')};

  color: #4a3a2f;
  font-family: 'Noto Sans KR';
  font-size: 17px;
  line-height: 1.5;
  word-break: keep-all;
`;

const ReactionRow = styled.div`
  width: 100%;
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: center;
`;

const ReactionButton = styled.button`
  width: 50px;
  height: 50px;
  border-radius: 25px;
  padding: 0;
  border: 2px solid ${({ $active }) => ($active ? '#e8cd73' : 'transparent')};
  background: transparent;
`;

// 되돌아가 고칠 수 있다는 게 눈에 띄도록, 흐린 회색 글자 대신 본문과 같은 진한 갈색에
// 테두리도 '닫기' 버튼과 같은 굵기로 맞춘다.
const RetryButton = styled(PopupSecondaryButton)`
  border: 1.5px solid rgba(74, 58, 47, 0.55);
  color: #4a3a2f;
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover {
    background: #f6ebc7;
  }
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
  // 이름(봉미선) 대신 호칭(엄마·아빠·딸·아들)으로 부른다.
  const { partnerLabel } = useFamilyRelation();
  const { execute: submitAnswer, loading: submitting } = useApiAction(submitMorningAnswer);
  const { execute: sendReaction, loading: sendingReaction } = useApiAction(sendAnswerReaction);
  const [reactionError, setReactionError] = useState(null);

  // 답변을 보내면 질문을 다시 불러오는데, 그 사이 data가 잠깐 비어서
  // 질문이 사라진 것처럼 보였다. 마지막으로 받은 질문을 남겨둔다.
  const lastQuestionRef = useRef('');
  if (question?.content) lastQuestionRef.current = question.content;
  const questionText = question?.content ?? lastQuestionRef.current;

  const myUserId = getUserId();
  // 음성으로 다시 답하면 서버가 답변을 새로 저장은 하는데, myAnswer에는 그 답을 반영해
  // 주지 않는다(텍스트로 답할 때만 갱신된다). 그래서 familyAnswers에서 내가 마지막에
  // 남긴 답을 직접 골라 쓴다.
  // 서버가 답변을 덮어쓰지 않고 계속 쌓아서, myAnswer에는 '맨 처음 답'이 담겨 온다.
  // 음성으로 답을 고쳐도 화면이 그대로였던 이유다. 내가 마지막에 남긴 답을 직접 고른다.
  const myLatest = findMyLatestAnswer(question?.familyAnswers, myUserId);
  const myAnswer = myLatest?.textValue ?? question?.myAnswer ?? '';

  // 이미 답한 날이면 답변 비교 화면부터 보여준다. (건강일지에서 '수정'으로 들어올 때도 동일)
  useEffect(() => {
    if (step !== null || loading) return;
    setStep(myAnswer ? 'result' : 'question');
  }, [step, loading, myAnswer]);
  // familyAnswers에는 내 답변까지 섞여 오고, 같은 사람의 옛 답도 함께 온다.
  // 나를 뺀 뒤 가장 나중 답 하나만 가족 답변으로 쓴다.
  const partnerAnswer = findPartnerLatestAnswer(question?.familyAnswers, myUserId);

  const [submitError, setSubmitError] = useState(null);

  const submitErrorMessage = submitError?.message;

  // 반응은 가족이 남긴 답변에 단다. 서버가 성공으로 답한 뒤에야 '보냈어요' 화면을 띄운다.
  const handleReaction = async (reaction) => {
    if (!partnerAnswer || sendingReaction) return;

    const { ok, error: failed } = await sendReaction(partnerAnswer.answerId, reaction.key);
    if (!ok) {
      setReactionError(failed);
      return;
    }
    setSentReaction(reaction.key);
  };

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
        <PopupCard $center $gap={16} $padTop={44} onClick={(event) => event.stopPropagation()}>
          <PopupInnerBorder />
          <PopupTitle $center $size={24}>
            답변 확인하기
          </PopupTitle>

          <AnswerCard $mine>
            <Badge $mine>내 답변</Badge>
            {/* 방금 쓴 답을 먼저 보여준다. myAnswer를 앞에 두면 다시 답해도
                서버 응답이 도착할 때까지 옛 답이 그대로 보인다. */}
            <AnswerText $mine>{answer || myAnswer}</AnswerText>
          </AnswerCard>

          {partnerAnswer ? (
            <AnswerCard>
              <Badge>{partnerLabel} 답변</Badge>
              <AnswerText>{partnerAnswer.textValue}</AnswerText>
              {/* ver01: 반응 아이콘이 상대 답변 카드 안에 들어간다 */}
              <ReactionRow>
                {REACTIONS.map((reaction) => (
                  <ReactionButton
                    key={reaction.key}
                    type="button"
                    aria-label={reaction.label}
                    $active={sentReaction === reaction.key}
                    disabled={sendingReaction}
                    onClick={() => handleReaction(reaction)}
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
            <RetryButton
              type="button"
              onClick={() => {
                setAnswer(myAnswer);
                // 지난 음성 기록이 남아 있으면 고쳐 써도 다시 안 보내진다
                setVoiceText(null);
                setStep('question');
              }}
            >
              다시 답하기
            </RetryButton>
            <PopupPrimaryButton type="button" onClick={onClose}>
              닫기
            </PopupPrimaryButton>
          </PopupButtonRow>
        </PopupCard>

        {/* 와이어프레임 '좋아요 팝업': 반응을 보내면 확인 화면이 뜬다 */}
        {sentReaction && (
          <ReactionSentPopup
            reaction={REACTIONS.find((item) => item.key === sentReaction)}
            partnerName={partnerLabel}
            onClose={() => setSentReaction(null)}
          />
        )}

        {reactionError && (
          <PopupBackdrop onClick={() => setReactionError(null)}>
            <PopupCard $center $gap={16} $padTop={36} onClick={(event) => event.stopPropagation()}>
              <PopupInnerBorder />
              <PopupTitle $center $size={22}>
                반응을 보내지 못했어요
              </PopupTitle>
              <ErrorText>{reactionError.message}</ErrorText>
              <PopupPrimaryButton type="button" onClick={() => setReactionError(null)}>
                다시 해볼게요
              </PopupPrimaryButton>
            </PopupCard>
          </PopupBackdrop>
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
            <ErrorText>{voice.error ? voice.error.message : submitErrorMessage}</ErrorText>
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
