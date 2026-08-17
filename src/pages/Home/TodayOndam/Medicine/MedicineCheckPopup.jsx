import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import clockIcon from '../../../../assets/popup/clock.png';
import medFlowerA from '../../../../assets/popup/med-flower-a.png';
import medFlowerB from '../../../../assets/popup/med-flower-b.png';
import medEmpty from '../../../../assets/popup/med-empty.png';
import {
  getMedications,
  getMedicationLogs,
  updateMedicationLogs,
} from '../../../../api/medication';
import { saveMealLog, getMealLogs } from '../../../../api/meal';
import { useApi, useApiAction } from '../../../../hooks/useApi';
import { parseTime, toDateString, timeToLabel } from '../../../../utils/medication';
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

// 생성(POST)은 기록이 이미 있으면 '이미 복약 기록이 존재합니다'로 거부당한다.
// 수정(PUT)은 덮어쓰기라 몇 번을 눌러도 안전해서 이쪽을 쓴다.
async function submitMedicationCheck({ dueMedications, checks, mealLabel }) {
  const recordDate = toDateString();

  await updateMedicationLogs({
    recordDate,
    logs: dueMedications.map((med) => ({
      scheduleId: med.scheduleId,
      status: checks[med.scheduleId] ? 'TAKEN' : 'NOT_RECORDED',
    })),
  });

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

// Figma는 padding 12/22에 16px이지만 행(54px)을 거의 채워서 답답해 보인다.
// 행 안에서 여백이 남도록 한 단계 줄였다.
const CheckButton = styled.button`
  height: 34px;
  padding: 0 14px;
  border-radius: 8px;

  border: 1.5px solid ${({ $on }) => ($on ? 'rgba(87, 107, 26, 0.5)' : '#d8cbb8')};
  background: ${({ $on }) => ($on ? '#cbd879' : '#fff')};
  color: ${({ $on }) => ($on ? '#364310' : '#8c8780')};

  font-family: 'Noto Sans KR';
  font-size: 14px;
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

function MedicineCheckPopup({ dueMedications, mealLabel, isAllDay = false, onClose }) {
  const [step, setStep] = useState('checklist'); // checklist | complete | edit

  // 같은 약이 여러 번이면 어느 시간대인지 붙여준다. 안 그러면 같은 이름의 줄이
  // 여러 개 보여서 무엇을 체크한 건지 알 수 없다.
  const nameCounts = dueMedications.reduce((acc, med) => {
    acc[med.name] = (acc[med.name] ?? 0) + 1;
    return acc;
  }, {});

  const rows = [
    { id: 'meal', label: `${mealLabel} 드셨어요?` },
    ...dueMedications.map((med) => ({
      id: med.scheduleId,
      label:
        nameCounts[med.name] > 1
          ? `${med.name} (${timeToLabel(med.scheduledTime)}) 드셨어요?`
          : `${med.name} 드셨어요?`,
    })),
  ];
  const [checks, setChecks] = useState({});

  const { execute: submitCheck, loading: submitting } = useApiAction(submitMedicationCheck);
  const { data: allMedications } = useApi(getMedications, { enabled: step === 'complete' });

  // 오늘 이미 기록해둔 게 있으면 그대로 체크된 상태로 연다.
  const { data: todayLog, refetch: refetchLog } = useApi(getMedicationLogs, {
    args: [toDateString()],
  });
  const { data: todayMeals } = useApi(getMealLogs, { args: [toDateString()] });

  // 완료 화면의 꽃 아이콘은 화면 상태가 아니라 서버 기록을 기준으로 그린다.
  // 그래야 '기록 수정'에서 바꾼 내용이 곧바로 반영된다.
  const takenSchedules = new Set(
    (todayLog?.medications ?? [])
      .filter((item) => item.status === 'TAKEN')
      .map((item) => item.scheduleId),
  );

  const seededRef = useRef(false);
  useEffect(() => {
    if (seededRef.current || !todayLog || !todayMeals) return;
    seededRef.current = true;

    const takenBySchedule = new Map(
      (todayLog.medications ?? []).map((item) => [item.scheduleId, item.status === 'TAKEN']),
    );
    const mealType = MEAL_TYPE_BY_LABEL[mealLabel];
    const eatenMeal = (todayMeals ?? []).find((item) => item.mealType === mealType);

    setChecks({
      meal: Boolean(eatenMeal?.eaten),
      ...Object.fromEntries(
        dueMedications.map((med) => [med.scheduleId, takenBySchedule.get(med.scheduleId) ?? false]),
      ),
    });
  }, [todayLog, todayMeals, dueMedications, mealLabel]);

  const { hour, minute } = parseTime(dueMedications[0]?.scheduledTime ?? '00:00');
  const timeLabel = formatKoreanTime(hour, minute);

  const handleSubmit = async () => {
    const { ok, error } = await submitCheck({ dueMedications, checks, mealLabel });
    if (!ok) {
      alert(error.message);
      return;
    }
    refetchLog();
    setStep('complete');
  };

  // Figma 19: 완료 화면의 '기록 수정하기'로 들어가는 별도 팝업
  if (step === 'edit') {
    return (
      <MedicineLogEditPopup
        onClose={onClose}
        onDone={() => {
          // 수정한 내용을 완료 화면이 바로 보여주도록 기록을 다시 읽는다.
          refetchLog();
          setStep('complete');
        }}
      />
    );
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
              // 그 약의 시간대 중 하나라도 먹었으면 꽃으로 표시한다.
              const taken = (med.schedules ?? []).some((schedule) =>
                takenSchedules.has(schedule.scheduleId),
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
          {isAllDay ? (
            '오늘 챙길 약이에요!'
          ) : (
            <>
              {timeLabel}
              <br />약 드실 시간이에요!
            </>
          )}
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
