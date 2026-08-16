import { useState } from 'react';
import styled from 'styled-components';
import clockIcon from '../../../../assets/popup/clock.png';
import medFlowerA from '../../../../assets/popup/med-flower-a.png';
import medFlowerB from '../../../../assets/popup/med-flower-b.png';
import medEmpty from '../../../../assets/popup/med-empty.png';
import { getMedications, createMedicationLog } from '../../../../api/medication';
import { saveMealLog } from '../../../../api/meal';
import { useApi, useApiAction } from '../../../../hooks/useApi';
import { parseTime, toDateString } from '../../../../utils/medication';
import { formatKoreanTime } from '../homeCtaFlow';
import {
  PopupBackdrop,
  PopupCard,
  PopupInnerBorder,
  PopupTitle,
  PopupPrimaryButton,
  PopupIcon,
} from '../../../../components/PopupShell';
import MedicineLogEditPopup from './MedicineLogEditPopup';

// Figma 14 / 15: 복약 알림 팝업. 와이어프레임의 '아직요 / 체크' 두 버튼이
// '먹었어요' 토글 하나로 바뀌었다(누르면 연두색으로 채워짐).
const MEAL_TYPE_BY_LABEL = { 아침: 'BREAKFAST', 점심: 'LUNCH', 저녁: 'DINNER' };
const MED_FLOWERS = [medFlowerA, medFlowerB];

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

const CheckRow = styled.div`
  width: 100%;
  height: 54px;
  padding: 0 8px 0 14px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  border-radius: 10px;
  border: 1px solid #d8cbb8;
  background: #fffbf1;
`;

const CheckLabel = styled.span`
  color: #4a3a2f;
  font-family: 'Noto Sans KR';
  font-size: 18px;
  font-weight: 500;
`;

const CheckButton = styled.button`
  padding: 12px 22px;
  border-radius: 10px;

  border: 1.5px solid ${({ $on }) => ($on ? 'rgba(87, 107, 26, 0.5)' : '#d8cbb8')};
  background: ${({ $on }) => ($on ? '#cbd879' : '#fff')};
  color: ${({ $on }) => ($on ? '#364310' : '#8c8780')};

  font-family: 'Noto Sans KR';
  font-size: 16px;
  font-weight: 700;
  white-space: nowrap;
`;

const CircleRow = styled.div`
  display: flex;
  gap: 20px;
  align-items: flex-start;
`;

const MedIconWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  width: 64px;
`;

const MedLabel = styled.p`
  margin: 0;
  color: ${({ $taken }) => ($taken ? '#2e2117' : '#8c8780')};
  font-family: 'Noto Sans KR';
  font-size: 16px;
  font-weight: ${({ $taken }) => ($taken ? 700 : 500)};
  white-space: nowrap;
`;

function MedicineCheckPopup({ dueMedications, mealLabel, onClose }) {
  const [step, setStep] = useState('checklist'); // checklist | complete | edit
  const rows = [
    { id: 'meal', label: `${mealLabel} 드셨어요?` },
    ...dueMedications.map((med) => ({ id: med.scheduleId, label: `${med.name} 드셨어요?` })),
  ];
  const [checks, setChecks] = useState(() => Object.fromEntries(rows.map((row) => [row.id, false])));

  const { execute: submitCheck, loading: submitting } = useApiAction(submitMedicationCheck);
  const { data: allMedications } = useApi(getMedications, { enabled: step === 'complete' });

  const { hour, minute } = parseTime(dueMedications[0]?.scheduledTime ?? '00:00');
  const timeLabel = formatKoreanTime(hour, minute);

  const handleSubmit = async () => {
    const { ok, error } = await submitCheck({ dueMedications, checks, mealLabel });
    if (!ok) {
      alert(error.message);
      return;
    }
    setStep('complete');
  };

  // Figma 19: 완료 화면의 '기록 수정하기'로 들어가는 별도 팝업
  if (step === 'edit') {
    return <MedicineLogEditPopup onClose={onClose} onDone={() => setStep('complete')} />;
  }

  if (step === 'complete') {
    return (
      <PopupBackdrop onClick={onClose}>
        <PopupCard $center $gap={18} $padTop={36} onClick={(event) => event.stopPropagation()}>
          <PopupInnerBorder />
          <PopupTitle $center $size={24}>
            {mealLabel} 약 잘 챙겨 드셨네요!
          </PopupTitle>

          <CircleRow>
            {(allMedications ?? []).map((med, index) => {
              const taken = dueMedications.some(
                (due) => due.medicationId === med.medicationId && checks[due.scheduleId],
              );
              return (
                <MedIconWrap key={med.medicationId}>
                  <PopupIcon
                    $size={64}
                    src={taken ? MED_FLOWERS[index % MED_FLOWERS.length] : medEmpty}
                    alt=""
                  />
                  <MedLabel $taken={taken}>{med.name}</MedLabel>
                </MedIconWrap>
              );
            })}
          </CircleRow>

          <PopupPrimaryButton type="button" onClick={() => setStep('edit')}>
            기록 수정하기 ›
          </PopupPrimaryButton>
        </PopupCard>
      </PopupBackdrop>
    );
  }

  return (
    <PopupBackdrop onClick={onClose}>
      <PopupCard $center $gap={16} $padTop={40} onClick={(event) => event.stopPropagation()}>
        <PopupInnerBorder />
        <PopupIcon $size={56} src={clockIcon} alt="" />
        <PopupTitle $center>
          {timeLabel}
          <br />약 드실 시간이에요!
        </PopupTitle>

        {rows.map((row) => (
          <CheckRow key={row.id}>
            <CheckLabel>{row.label}</CheckLabel>
            <CheckButton
              type="button"
              $on={checks[row.id]}
              onClick={() => setChecks((prev) => ({ ...prev, [row.id]: !prev[row.id] }))}
            >
              먹었어요
            </CheckButton>
          </CheckRow>
        ))}

        <PopupPrimaryButton type="button" onClick={handleSubmit} disabled={submitting}>
          {submitting ? '저장 중...' : '완료'}
        </PopupPrimaryButton>
      </PopupCard>
    </PopupBackdrop>
  );
}

export default MedicineCheckPopup;
