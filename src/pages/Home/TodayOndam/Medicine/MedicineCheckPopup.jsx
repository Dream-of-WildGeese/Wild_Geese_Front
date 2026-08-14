import { useState } from 'react';
import styled from 'styled-components';
import mascotImg from '../../../../assets/mascot.png';
import { getMedications, createMedicationLog } from '../../../../api/medication';
import { saveMealLog } from '../../../../api/meal';
import { useApi, useApiAction } from '../../../../hooks/useApi';
import { parseTime, toDateString } from '../../../../utils/medication';
import { formatKoreanTime } from '../homeCtaFlow';

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
  font-size: 19px;
  font-weight: 600;
  text-align: center;
  color: ${({ theme }) => theme.colors.text};
  line-height: 1.4;
`;

const Title = styled.p`
  margin: 0;
  font-size: 21px;
  font-weight: 600;
  text-align: center;
  color: ${({ theme }) => theme.colors.text};
  line-height: 1.4;
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
`;

const CheckRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 50px;
  padding: 0 8px 0 14px;
  border-radius: 10px;
  background: ${({ theme }) => theme.colors.accentSoft};
`;

const CheckLabel = styled.span`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.text};
`;

const ActionGroup = styled.div`
  display: flex;
  gap: 6px;
`;

const NotYetButton = styled.button`
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 13px;
  font-weight: 500;
`;

const CheckButton = styled.button`
  padding: 6px 14px;
  border-radius: 8px;
  background: ${({ theme, $active }) => ($active ? theme.colors.accent : theme.colors.surface)};
  border: 1px solid ${({ theme, $active }) => ($active ? theme.colors.accent : theme.colors.border)};
  color: ${({ theme, $active }) => ($active ? '#fff' : theme.colors.textMuted)};
  font-size: 13px;
  font-weight: 500;
`;

const CircleRow = styled.div`
  display: flex;
  gap: 14px;
  align-self: center;
`;

const CircleWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
`;

const CheckCircle = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 600;
  ${({ $pending, theme }) =>
    $pending
      ? `border: 1.5px dashed ${theme.colors.border};`
      : `background: ${theme.colors.accentSoft}; color: ${theme.colors.accent};`}
`;

const CircleLabel = styled.p`
  margin: 0;
  font-size: 12px;
  font-weight: 500;
  color: ${({ $pending, theme }) => ($pending ? theme.colors.textSub : theme.colors.accent)};
`;

const ResultMessage = styled.p`
  margin: 0;
  font-size: 14px;
  text-align: center;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const EditLink = styled.button`
  align-self: center;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.accent};
`;

const MEAL_TYPE_BY_LABEL = { 아침: 'BREAKFAST', 점심: 'LUNCH', 저녁: 'DINNER' };

// 체크리스트 결과를 복약 기록과 식사 기록으로 나눠 저장한다.
// 체크하지 않은 약은 NOT_RECORDED로 남겨서 '아직 안 먹음'과 '기록 없음'을 구분한다.
async function submitMedicationCheck({ dueMedications, checks, mealLabel }) {
  const recordDate = toDateString();

  await Promise.all(
    dueMedications.map((med) =>
      createMedicationLog({
        scheduleId: med.scheduleId,
        recordDate,
        status: checks[med.scheduleId] ? 'TAKEN' : 'NOT_RECORDED',
      }),
    ),
  );

  const mealType = MEAL_TYPE_BY_LABEL[mealLabel];
  if (mealType) {
    await saveMealLog({ recordDate, mealType, eaten: Boolean(checks.meal) });
  }
}

function MedicineCheckPopup({ dueMedications, mealLabel, onClose }) {
  const [step, setStep] = useState('intro'); // intro | checklist | complete | encourage
  const rows = [
    { id: 'meal', label: `${mealLabel} 드셨어요?` },
    ...dueMedications.map((med) => ({ id: med.scheduleId, label: `${med.name} 드셨어요?` })),
  ];
  const [checks, setChecks] = useState(() => Object.fromEntries(rows.map((row) => [row.id, false])));

  const { execute: submitCheck, loading: submitting } = useApiAction(submitMedicationCheck);
  // 완료 화면에서 오늘 등록된 약 전체를 동그라미로 보여줘야 해서 그때만 불러온다.
  const { data: allMedications } = useApi(getMedications, { enabled: step === 'complete' });

  const allChecked = rows.every((row) => checks[row.id]);
  const { hour, minute } = parseTime(dueMedications[0]?.scheduledTime ?? '00:00');
  const timeLabel = formatKoreanTime(hour, minute);

  const handleSubmit = async () => {
    const { ok, error } = await submitCheck({ dueMedications, checks, mealLabel });
    if (!ok) {
      alert(error.message);
      return;
    }
    setStep(allChecked ? 'complete' : 'encourage');
  };

  if (step === 'intro') {
    return (
      <Backdrop onClick={onClose}>
        <Card onClick={(event) => event.stopPropagation()}>
          <CharacterCircle>
            <img src={mascotImg} alt="" />
          </CharacterCircle>
          <Message>{mealLabel} 약 드실 시간이에요~</Message>
          <PrimaryButton type="button" onClick={() => setStep('checklist')}>
            확인할게요
          </PrimaryButton>
        </Card>
      </Backdrop>
    );
  }

  if (step === 'checklist') {
    return (
      <Backdrop onClick={onClose}>
        <Card $wide onClick={(event) => event.stopPropagation()}>
          <Title>
            {timeLabel}
            <br />약 드실 시간이에요!
          </Title>
          {rows.map((row) => (
            <CheckRow key={row.id}>
              <CheckLabel>{row.label}</CheckLabel>
              <ActionGroup>
                <NotYetButton type="button" onClick={() => setChecks((prev) => ({ ...prev, [row.id]: false }))}>
                  아직요
                </NotYetButton>
                <CheckButton
                  type="button"
                  $active={checks[row.id]}
                  onClick={() => setChecks((prev) => ({ ...prev, [row.id]: true }))}
                >
                  체크
                </CheckButton>
              </ActionGroup>
            </CheckRow>
          ))}
          <PrimaryButton $wide type="button" onClick={handleSubmit} disabled={submitting}>
            {submitting ? '저장 중...' : '답하기'}
          </PrimaryButton>
        </Card>
      </Backdrop>
    );
  }

  if (step === 'complete') {
    return (
      <Backdrop onClick={onClose}>
        <Card onClick={(event) => event.stopPropagation()}>
          <Title>{mealLabel} 약 잘 챙기셨어요!</Title>
          <CircleRow>
            {(allMedications ?? []).map((med) => {
              const pending = !dueMedications.some((due) => due.medicationId === med.medicationId);
              return (
                <CircleWrap key={med.medicationId}>
                  <CheckCircle $pending={pending}>{pending ? '' : '✓'}</CheckCircle>
                  <CircleLabel $pending={pending}>{med.name}</CircleLabel>
                </CircleWrap>
              );
            })}
          </CircleRow>
          <ResultMessage>{mealLabel} 약, 잘 챙겨 드셨네요</ResultMessage>
          <EditLink type="button" onClick={() => setStep('checklist')}>
            기록 수정하기 ›
          </EditLink>
          <PrimaryButton type="button" onClick={onClose}>
            닫기
          </PrimaryButton>
        </Card>
      </Backdrop>
    );
  }

  return (
    <Backdrop onClick={onClose}>
      <Card onClick={(event) => event.stopPropagation()}>
        <CharacterCircle>
          <img src={mascotImg} alt="" />
        </CharacterCircle>
        <Message>
          다음엔 {mealLabel} 꼭
          <br />
          챙겨 드세요~
        </Message>
        <PrimaryButton type="button" onClick={onClose}>
          알겠어요
        </PrimaryButton>
      </Card>
    </Backdrop>
  );
}

export default MedicineCheckPopup;
