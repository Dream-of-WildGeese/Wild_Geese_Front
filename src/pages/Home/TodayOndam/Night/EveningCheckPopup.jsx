import { useCallback, useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import PopupPortal from '../../../../components/PopupPortal';
import faceGood from '../../../../assets/evening/face-good.svg';
import faceNormal from '../../../../assets/evening/face-normal.svg';
import faceBad from '../../../../assets/evening/face-bad.svg';
import micIcon from '../../../../assets/evening/mic-icon.png';
import {
  getTodayEveningQuestions,
  submitEveningAnswers,
  transcribeEveningAnswer,
} from '../../../../api/evening';
import { useApi, useApiAction } from '../../../../hooks/useApi';
import { useVoiceRecorder } from '../../../../hooks/useVoiceRecorder';
import {
  PopupBackdrop,
  PopupCard,
  PopupInnerBorder,
  PopupTitle,
  PopupPrimaryButton,
  CHOICE_ICON_SIZE,
} from '../../../../components/PopupShell';

// Figma 22~22e: 저녁 건강체크가 별도 페이지에서 5단계 팝업으로 바뀌었다.
// 선택지 아이콘은 좋음/보통/나쁨 세 장을 모든 질문이 공유한다(디자인에서도 같은 에셋).
const FACE_BY_INDEX = [faceGood, faceNormal, faceBad];

const Backdrop = styled.div`
  /* Layout(폰 프레임)이 기준이 되도록 absolute를 쓴다. fixed면 브라우저 창 가운데에 뜬다. */
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 24px;
  background: rgba(26, 23, 20, 0.55);
  z-index: ${({ theme }) => theme.zIndex.modal};
`;

const Card = styled.div`
  position: relative;
  width: 100%;
  max-width: 377px;
  max-height: 82vh;
  overflow-y: auto;

  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;

  padding: 30px 26px 34px;
  border-radius: 10px;
  border: 3px solid rgba(108, 67, 23, 0.7);
  background: #fef3d5;

  &::-webkit-scrollbar {
    display: none;
  }
`;

// 카드 안쪽의 점선 장식 테두리
const InnerBorder = styled.div`
  position: absolute;
  inset: 11px 8px;
  border-radius: 10px;
  border: 3px dashed rgba(108, 67, 23, 0.7);
  pointer-events: none;
`;

// 첫 질문이 아니면 왼쪽에 뒤로가기, 오른쪽에 닫기가 함께 놓인다.
const TopRow = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;

  color: #8c8172;
  font-family: 'Noto Sans KR';
  font-size: 16px;
  font-weight: 700;

  /* 첫 질문에서는 자리만 차지하고 보이지 않게 둔다(닫기 위치가 흔들리지 않도록) */
  visibility: ${({ $hidden }) => ($hidden ? 'hidden' : 'visible')};
`;

const CloseButton = styled.button`
  color: #8c8780;
  font-size: 18px;
  line-height: 1;
`;

const ProgressBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 12px;
  border-radius: 20px;
  border: 1.5px solid #cbd879;
  background: #edf3d5;

  color: #576b1a;
  font-family: 'Noto Sans KR';
  font-size: 14px;
  font-weight: 700;
  white-space: nowrap;
`;

const BadgeRow = styled.div`
  display: flex;
  gap: 8px;
`;

const Title = styled.p`
  margin: 0;
  width: 100%;
  color: #4a3a2f;
  font-family: 'Noto Sans KR';
  font-size: 26px;
  font-weight: 700;
`;

const Subtitle = styled.p`
  margin: 0;
  color: #8c8780;
  font-family: 'Noto Sans KR';
  font-size: 14px;
`;

const Option = styled.button`
  width: 100%;
  height: 72px;
  padding: 0 16px;

  display: flex;
  align-items: center;
  gap: 12px;

  border-radius: 10px;
  border: 1px solid ${({ $selected }) => ($selected ? '#cbd879' : '#d8cbb8')};
  background: ${({ $selected }) => ($selected ? '#edf3d5' : '#fffbf1')};

  color: #4a3a2f;
  font-family: 'Noto Sans KR';
  font-size: 21px;
  font-weight: 500;
  text-align: left;
`;

const OptionIcon = styled.img`
  width: ${CHOICE_ICON_SIZE}px;
  height: ${CHOICE_ICON_SIZE}px;
  flex-shrink: 0;
  object-fit: contain;
`;

// 녹음 중에는 마이크 원이 커졌다 작아지며 듣고 있다는 걸 보여준다.
const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.08); }
  100% { transform: scale(1); }
`;

const VoiceButton = styled.button`
  width: 100%;
  height: 190px;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;

  border-radius: 14px;
  border: 1.5px solid ${({ $recording }) => ($recording ? '#e6a794' : '#d8cbb8')};
  background: ${({ $recording }) => ($recording ? '#fdf0e8' : '#fffbf1')};

  &:disabled {
    opacity: 0.6;
  }
`;

const MicIcon = styled.img`
  width: 100px;
  height: 100px;
  object-fit: contain;

  animation: ${({ $recording }) => ($recording ? pulse : 'none')} 1.2s ease-in-out infinite;
`;

const VoiceLabel = styled.span`
  color: #8c8780;
  font-family: 'Noto Sans KR';
  font-size: 15px;
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

const NoteInput = styled.textarea`
  width: 100%;
  min-height: 80px;
  padding: 12px 14px;
  resize: none;

  border-radius: 10px;
  border: 1px solid #d8cbb8;
  background: #fffbf1;

  color: #4a3a2f;
  font-family: 'Noto Sans KR';
  font-size: 15px;

  &::placeholder {
    color: #a79c8e;
  }
`;

const PrimaryButton = styled.button`
  width: 100%;
  height: 50px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 10px;
  border: 1.5px solid rgba(74, 58, 47, 0.55);
  background: #dbe4a1;

  color: #4a3a2f;
  font-family: Jua;
  font-size: 20px;

  &:disabled {
    opacity: 0.5;
  }
`;

const Message = styled.p`
  margin: 0;
  width: 100%;
  text-align: center;
  color: #4a3a2f;
  font-family: 'Noto Sans KR';
  font-size: 18px;
`;

function EveningCheckPopup({ onClose, onCompleted, onAlreadyDone, forceEdit = false }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [note, setNote] = useState('');
  const [submitError, setSubmitError] = useState(null);

  const { data, loading, error } = useApi(getTodayEveningQuestions);
  const { execute: submitAnswers, loading: submitting } = useApiAction(submitEveningAnswers);

  const questions = data?.questions ?? [];
  const totalSteps = questions.length;
  const question = questions[stepIndex];
  const isLastStep = stepIndex === totalSteps - 1;

  // 오늘치를 이미 채웠으면 완료 화면만 보여준다.
  // 단 건강일지에서 '수정'으로 들어온 경우(forceEdit)는 다시 답할 수 있게 연다.
  const alreadyDone =
    !forceEdit && Boolean(data) && data.completedCount >= data.totalCount && data.totalCount > 0;

  // 오늘 이미 마친 상태로 다시 들어오면 안내 화면 없이 바로 건강일지로 넘어간다.
  useEffect(() => {
    if (alreadyDone) {
      onAlreadyDone?.();
    }
  }, [alreadyDone, onAlreadyDone]);

  // 선택지가 없는 질문(맞춤 질문)은 음성/자유 입력으로 답한다.
  const choices = question?.choices ?? [];
  const isVoiceStep = choices.length === 0;

  // 녹음한 오디오를 서버 STT로 보내고, 돌아온 텍스트를 입력칸에 채운다.
  const transcribe = useCallback(
    (blob) => transcribeEveningAnswer(question.questionId, blob),
    [question?.questionId],
  );
  const appendTranscript = useCallback(
    (text) => setNote((prev) => (prev ? `${prev} ${text}` : text)),
    [],
  );
  const voice = useVoiceRecorder(transcribe, appendTranscript);

  // 고르기만 하고 넘어가지는 않는다. 예전에는 누르는 순간 다음 질문으로 넘어가서
  // 잘못 눌렀을 때 되돌릴 수가 없었다.
  const selectOption = (optionIndex) => {
    setAnswers((prev) => ({ ...prev, [question.questionId]: optionIndex }));
  };

  const handleFinish = async () => {
    const payload = questions
      .filter((item) => answers[item.questionId] != null || (item.choices ?? []).length === 0)
      .map((item) => {
        const choice = item.choices?.[answers[item.questionId]];
        const isCustom = (item.choices ?? []).length === 0;
        // 커스텀(TEXT) 질문은 choiceValue가 없다. null을 명시적으로 보내면 백엔드의
        // 재제출(덮어쓰기) 경로가 500을 낸다 — 아침 질문 제출과 동일하게 키 자체를 뺀다.
        return {
          questionId: item.questionId,
          ...(choice ? { choiceValue: String(choice.value) } : {}),
          textValue: isCustom ? note.trim() : (choice?.label ?? ''),
          inputType: isCustom ? 'TEXT' : 'CHOICE',
        };
      });

    const { ok, error: failed } = await submitAnswers(payload);
    if (!ok) {
      setSubmitError(failed);
      return;
    }
    onCompleted();
  };

  // alreadyDone은 위 useEffect가 감지해 onAlreadyDone으로 바로 넘긴다.
  // 여기서는 넘어가는 동안 잠깐 아무 것도 보여주지 않는다.
  if (alreadyDone) return null;

  if (loading || error || totalSteps === 0) {
    return (
      <PopupPortal>
        <Backdrop onClick={onClose}>
          <Card onClick={(event) => event.stopPropagation()}>
            <InnerBorder />
            <CloseButton type="button" aria-label="닫기" onClick={onClose}>
              ✕
            </CloseButton>
            <Message>
              {loading
                ? '질문을 불러오는 중이에요...'
                : error
                  ? error.message
                  : '오늘은 준비된 질문이 없어요.'}
            </Message>
          </Card>
        </Backdrop>
      </PopupPortal>
    );
  }

  // TodayReport의 '수정'처럼 스크롤되는 페이지 안에서 열릴 때도 폰 프레임 기준으로
  // 뜨도록 PopupPortal로 감싼다. 이걸 빼먹으면 그 페이지의 스크롤 위치에 따라
  // 팝업이 화면 밖이나 엉뚱한 곳에 걸쳐 보이는 레이아웃 깨짐이 생긴다.
  return (
    <PopupPortal>
      <Backdrop onClick={onClose}>
        <Card onClick={(event) => event.stopPropagation()}>
          <InnerBorder />
          <TopRow>
            <BackButton
              type="button"
              $hidden={stepIndex === 0}
              onClick={() => setStepIndex((prev) => Math.max(0, prev - 1))}
            >
              ‹ 이전
            </BackButton>
            <CloseButton type="button" aria-label="닫기" onClick={onClose}>
              ✕
            </CloseButton>
          </TopRow>

          <BadgeRow>
            <ProgressBadge>
              {stepIndex + 1}/{totalSteps}
            </ProgressBadge>
            {isLastStep && <ProgressBadge>마지막 질문이에요</ProgressBadge>}
          </BadgeRow>

          <Title>{question.content}</Title>
          {isVoiceStep && <Subtitle>등록하신 건강정보에 맞춰서 준비했어요</Subtitle>}

          {isVoiceStep ? (
            <>
              {/* 눌러서 녹음 → 다시 눌러 정지 → 서버 STT로 변환된 텍스트가 아래 칸에 채워진다 */}
              <VoiceButton
                type="button"
                onClick={voice.toggle}
                disabled={!voice.supported || voice.busy}
                $recording={voice.recording}
              >
                <MicIcon src={micIcon} alt="" $recording={voice.recording} />
                <VoiceLabel>
                  {!voice.supported
                    ? '이 브라우저는 녹음을 지원하지 않아요'
                    : voice.busy
                      ? '옮겨 적는 중이에요...'
                      : voice.recording
                        ? '듣고 있어요. 다 말씀하시면 눌러주세요'
                        : '눌러서 말해보세요'}
                </VoiceLabel>
              </VoiceButton>
              <NoteInput
                placeholder="또는 직접 적어주세요"
                value={note}
                onChange={(event) => setNote(event.target.value)}
              />
            </>
          ) : (
            choices.map((choice, optionIndex) => (
              <Option
                key={choice.label}
                type="button"
                $selected={answers[question.questionId] === optionIndex}
                onClick={() => selectOption(optionIndex)}
              >
                <OptionIcon src={FACE_BY_INDEX[optionIndex] ?? faceNormal} alt="" />
                {choice.label}
              </Option>
            ))
          )}

          {isLastStep ? (
            <PrimaryButton type="button" onClick={handleFinish} disabled={submitting}>
              {submitting ? '저장 중...' : '오늘 기록 완료'}
            </PrimaryButton>
          ) : (
            <PrimaryButton
              type="button"
              disabled={answers[question.questionId] == null}
              onClick={() => setStepIndex(stepIndex + 1)}
            >
              다음
            </PrimaryButton>
          )}
        </Card>

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
                {voice.error ? '잘 못 들었어요' : '저장하지 못했어요'}
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
      </Backdrop>
    </PopupPortal>
  );
}

export default EveningCheckPopup;
