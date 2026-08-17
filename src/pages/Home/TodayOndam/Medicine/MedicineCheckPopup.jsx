import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import clockIcon from '../../../../assets/popup/clock.png';
import medFlowerA from '../../../../assets/popup/med-flower-a.png';
import medFlowerB from '../../../../assets/popup/med-flower-b.png';
import medEmpty from '../../../../assets/popup/med-empty.png';
import { saveMealLog, getMealLogs } from '../../../../api/meal';
import { useApi, useApiAction } from '../../../../hooks/useApi';
import { parseTime, toDateString } from '../../../../utils/medication';
import { formatKoreanTime } from '../homeCtaFlow';
import {
  loadTodayMedications,
  saveMedicationChecks,
  flattenSlot,
  flattenAll,
  getSlotLabel,
} from './medicationData';
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
  flex: 1;
  min-width: 0;
  color: #4a3a2f;
  font-family: 'Noto Sans KR';
  font-size: 18px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

// Figma는 padding 12/22에 16px이지만 행(54px)을 거의 채워서 답답해 보인다.
// 행 안에서 여백이 남도록 한 단계 줄였다.
const CheckButton = styled.button`
  flex-shrink: 0;
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
  flex-wrap: wrap;
  justify-content: center;
  gap: 16px 20px;
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
  max-width: 100%;
  color: ${({ $taken }) => ($taken ? '#2e2117' : '#8c8780')};
  font-family: 'Noto Sans KR';
  font-size: 16px;
  font-weight: ${({ $taken }) => ($taken ? 700 : 500)};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const CompleteNote = styled.p`
  margin: 0;
  text-align: center;
  color: #8c8780;
  font-family: 'Noto Sans KR';
  font-size: 16px;
  font-weight: 500;
`;

const EmptyText = styled.p`
  margin: 0;
  width: 100%;
  text-align: center;
  color: #8c8780;
  font-family: 'Noto Sans KR';
  font-size: 15px;
`;

function MedicineCheckPopup({ onClose }) {
  const [step, setStep] = useState('checklist'); // checklist | complete | edit
  const [checks, setChecks] = useState({});

  // 두 팝업이 같은 로더를 쓴다. 여기서 목록을 따로 만들면 기록 수정 화면과 어긋난다.
  const { data, loading, error, refetch } = useApi(loadTodayMedications);
  const { data: todayMeals } = useApi(getMealLogs, { args: [toDateString()] });
  const { execute: submit, loading: submitting } = useApiAction(saveMedicationChecks);
  const { execute: submitMeal } = useApiAction(saveMealLog);

  const slotLabel = getSlotLabel(new Date().getHours());

  // 지금 시간대에 먹을 약만 보여준다. 없으면 오늘 먹을 약 전체를 보여준다.
  const slotRows = flattenSlot(data?.items ?? [], slotLabel);
  const isAllDay = slotRows.length === 0;
  const medRows = isAllDay ? flattenAll(data?.items ?? []) : slotRows;

  // 같은 약이 여러 번이면 어느 시간대인지 붙여준다. 안 그러면 같은 이름의 줄이
  // 여러 개 보여서 무엇을 체크한 건지 알 수 없다.
  const nameCounts = medRows.reduce((acc, med) => {
    acc[med.name] = (acc[med.name] ?? 0) + 1;
    return acc;
  }, {});

  // 서버 기록이 도착하면 체크 상태를 한 번 맞춰준다.
  const seededRef = useRef(false);
  useEffect(() => {
    if (seededRef.current || !data || !todayMeals) return;
    seededRef.current = true;

    const mealType = MEAL_TYPE_BY_LABEL[slotLabel];
    const eatenMeal = todayMeals.find((item) => item.mealType === mealType);

    setChecks({
      meal: Boolean(eatenMeal?.eaten),
      ...Object.fromEntries(medRows.map((med) => [med.scheduleId, med.taken])),
    });
  }, [data, todayMeals, medRows, slotLabel]);

  const { hour, minute } = parseTime(medRows[0]?.scheduledTime ?? '00:00');
  const timeLabel = formatKoreanTime(hour, minute);

  const handleSubmit = async () => {
    const { ok, error: saveError } = await submit({
      recordDate: data.recordDate,
      scheduleIds: medRows.map((med) => med.scheduleId),
      checks,
    });
    if (!ok) {
      alert(saveError.message);
      return;
    }

    const mealType = MEAL_TYPE_BY_LABEL[slotLabel];
    if (mealType) await submitMeal({ recordDate: data.recordDate, mealType, eaten: Boolean(checks.meal) });

    await refetch();
    setStep('complete');
  };

  // Figma 19: 완료 화면의 '기록 수정하기'로 들어가는 별도 팝업
  if (step === 'edit') {
    return (
      <MedicineLogEditPopup
        onClose={onClose}
        onDone={async () => {
          // 수정한 내용을 완료 화면이 바로 보여주도록 기록을 다시 읽는다.
          await refetch();
          setStep('complete');
        }}
      />
    );
  }

  if (step === 'complete') {
    // 완료 화면은 화면 상태가 아니라 다시 읽은 기록을 기준으로 그린다.
    // 그래야 '기록 수정'에서 바꾼 내용이 곧바로 반영된다.
    const done = medRows.filter((med) => med.taken);
    const remaining = medRows.length - done.length;
    const allTaken = medRows.length > 0 && remaining === 0;

    // 약을 다 챙겼을 때만 칭찬한다. 남았으면 몇 개가 남았는지 알려준다.
    const title = allTaken
      ? `${slotLabel} 약 잘 챙겨 드셨네요!`
      : done.length === 0
        ? `${slotLabel} 약을 아직 안 드셨어요`
        : `${slotLabel} 약이 조금 남았어요`;

    const note = allTaken
      ? '오늘도 잊지 않고 챙기셨어요'
      : `${medRows.length}개 중 ${done.length}개 드셨어요. ${remaining}개 남았어요!`;

    return (
      <PopupBackdrop onClick={onClose}>
        <PopupCard $center $gap={18} $padTop={36} onClick={(event) => event.stopPropagation()}>
          <PopupInnerBorder />
          <PopupTitle $center $size={24}>
            {title}
          </PopupTitle>

          <CircleRow>
            {medRows.map((med, index) => (
              <MedIconWrap key={med.scheduleId}>
                <PopupIcon
                  $size={64}
                  src={med.taken ? MED_FLOWERS[index % MED_FLOWERS.length] : medEmpty}
                  alt=""
                />
                <MedLabel $taken={med.taken}>{med.name}</MedLabel>
              </MedIconWrap>
            ))}
          </CircleRow>

          <CompleteNote>{note}</CompleteNote>

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

        {loading && <EmptyText>불러오는 중이에요...</EmptyText>}
        {error && <EmptyText>{error.message}</EmptyText>}

        {!loading && !error && (
          <>
            <CheckRow>
              <CheckLabel>{slotLabel} 드셨어요?</CheckLabel>
              <CheckButton
                type="button"
                $on={checks.meal}
                onClick={() => setChecks((prev) => ({ ...prev, meal: !prev.meal }))}
              >
                먹었어요
              </CheckButton>
            </CheckRow>

            {medRows.map((med) => (
              <CheckRow key={med.scheduleId}>
                <CheckLabel>
                  {nameCounts[med.name] > 1
                    ? `${med.name} (${med.timeLabel}) 드셨어요?`
                    : `${med.name} 드셨어요?`}
                </CheckLabel>
                <CheckButton
                  type="button"
                  $on={checks[med.scheduleId]}
                  onClick={() =>
                    setChecks((prev) => ({ ...prev, [med.scheduleId]: !prev[med.scheduleId] }))
                  }
                >
                  먹었어요
                </CheckButton>
              </CheckRow>
            ))}
          </>
        )}

        <PopupPrimaryButton type="button" onClick={handleSubmit} disabled={submitting || !data}>
          {submitting ? '저장 중...' : '완료'}
        </PopupPrimaryButton>
      </PopupCard>
    </PopupBackdrop>
  );
}

export default MedicineCheckPopup;
