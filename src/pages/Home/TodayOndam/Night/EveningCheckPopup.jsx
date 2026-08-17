import { useState } from 'react';
import styled from 'styled-components';
import PopupPortal from '../../../../components/PopupPortal';
import faceGood from '../../../../assets/evening/face-good.png';
import faceNormal from '../../../../assets/evening/face-normal.png';
import faceBad from '../../../../assets/evening/face-bad.png';
import { getTodayEveningQuestions, submitEveningAnswers } from '../../../../api/evening';
import { useApi, useApiAction } from '../../../../hooks/useApi';

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
  height: 64px;
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
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  object-fit: contain;
`;

const VoiceButton = styled.button`
  width: 100%;
  height: 190px;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;

  border-radius: 10px;
  border: 1px solid #d8cbb8;
  background: #fffbf1;
`;

const MicCircle = styled.span`
  width: 100px;
  height: 100px;
  border-radius: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #edf3d5;
  border: 1.5px solid #cbd879;
  font-size: 40px;
`;

const VoiceLabel = styled.span`
  color: #8c8780;
  font-family: 'Noto Sans KR';
  font-size: 15px;
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

function EveningCheckPopup({ onClose, onCompleted }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [note, setNote] = useState('');

  const { data, loading, error } = useApi(getTodayEveningQuestions);
  const { execute: submitAnswers, loading: submitting } = useApiAction(submitEveningAnswers);

  const questions = data?.questions ?? [];
  const totalSteps = questions.length;
  const question = questions[stepIndex];
  const isLastStep = stepIndex === totalSteps - 1;

  // 이미 답한 질문에 다시 제출하면 서버가 500을 낸다.
  // 오늘치를 이미 채웠으면 5단계를 다시 돌리지 않고 완료 상태만 보여준다.
  const alreadyDone = Boolean(data) && data.completedCount >= data.totalCount && data.totalCount > 0;

  // 선택지가 없는 질문(맞춤 질문)은 음성/자유 입력으로 답한다.
  const choices = question?.choices ?? [];
  const isVoiceStep = choices.length === 0;

  const selectOption = (optionIndex) => {
    setAnswers((prev) => ({ ...prev, [question.questionId]: optionIndex }));
    if (!isLastStep) {
      setStepIndex(stepIndex + 1);
    }
  };

  const handleFinish = async () => {
    const payload = questions
      .filter((item) => answers[item.questionId] != null || (item.choices ?? []).length === 0)
      .map((item) => {
        const choice = item.choices?.[answers[item.questionId]];
        const isCustom = (item.choices ?? []).length === 0;
        return {
          questionId: item.questionId,
          choiceValue: choice ? String(choice.value) : null,
          textValue: isCustom ? note.trim() : (choice?.label ?? ''),
          inputType: isCustom ? 'TEXT' : 'CHOICE',
        };
      });

    const { ok, error: submitError } = await submitAnswers(payload);
    if (!ok) {
      alert(submitError.message);
      return;
    }
    onCompleted();
  };

  if (loading || error || totalSteps === 0 || alreadyDone) {
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
                  : alreadyDone
                    ? '오늘 건강 체크는 이미 마치셨어요!'
                    : '오늘은 준비된 질문이 없어요.'}
            </Message>
            {alreadyDone && (
              <PrimaryButton type="button" onClick={onCompleted}>
                오늘의 건강일지 보기
              </PrimaryButton>
            )}
          </Card>
        </Backdrop>
      </PopupPortal>
    );
  }

  return (
    <Backdrop onClick={onClose}>
      <Card onClick={(event) => event.stopPropagation()}>
        <InnerBorder />
        <CloseButton type="button" aria-label="닫기" onClick={onClose}>
          ✕
        </CloseButton>

        <BadgeRow>
          <ProgressBadge>
            {stepIndex + 1} / {totalSteps}
          </ProgressBadge>
          {isLastStep && <ProgressBadge>마지막 질문이에요</ProgressBadge>}
        </BadgeRow>

        <Title>{question.content}</Title>
        {isVoiceStep && <Subtitle>등록하신 건강정보에 맞춰서 준비했어요</Subtitle>}

        {isVoiceStep ? (
          <>
            {/* 음성 답변 STT API는 있지만 녹음 UI가 아직 없어 지금은 직접 입력으로 받는다 */}
            <VoiceButton type="button">
              <MicCircle>●</MicCircle>
              <VoiceLabel>눌러서 말해보세요</VoiceLabel>
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
    </Backdrop>
  );
}

export default EveningCheckPopup;
