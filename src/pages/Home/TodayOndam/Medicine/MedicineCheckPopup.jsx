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
  PopupSecondaryButton,
  PopupButtonRow,
  PopupIcon,
} from '../../../../components/PopupShell';
import MedicineLogEditPopup from './MedicineLogEditPopup';

// Figma 14 / 15: 복약 알림 팝업. 와이어프레임의 '아직요 / 체크' 두 버튼이
// '먹었어요' 토글 하나로 바뀌었다(누르면 연두색으로 채워짐).
const MEAL_TYPE_BY_LABEL = { 아침: 'BREAKFAST', 점심: 'LUNCH', 저녁: 'DINNER' };
const MED_FLOWERS = [medFlowerA, medFlowerB];

// 식사 행은 약이 아니라서 초록색으로 따로 구분한다.
// 이름이 길어도 잘리지 않도록 높이를 고정하지 않고 줄이 늘어나게 둔다.
const CheckRow = styled.div`
  width: 100%;
  min-height: 54px;
  padding: 10px 12px 10px 14px;
  box-sizing: border-box;

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;

  border-radius: 10px;
  border: 1px solid ${({ $meal }) => ($meal ? 'rgba(143, 174, 74, 0.6)' : '#d8cbb8')};
  background: ${({ $meal }) => ($meal ? '#edf2d4' : '#fffbf1')};
`;

// 예전에는 한 줄로 고정하고 넘치면 '...'으로 잘라서, 이름이 조금만 길어도
// 무슨 약인지 알 수 없었다. 어절 단위로 줄을 바꿔 끝까지 보여준다.
const CheckLabel = styled.span`
  flex: 1;
  min-width: 0;
  color: #4a3a2f;
  font-family: 'Noto Sans KR';
  font-size: 18px;
  font-weight: 500;
  line-height: 1.35;
  word-break: keep-all;
`;

// '먹었어요' 글자 버튼 대신 체크박스로 바꿨다. 누를 곳이 분명하고
// 여러 줄을 훑을 때 무엇을 체크했는지 한눈에 들어온다.
//
// 체크했을 때의 배경·테두리·체크 표시 색을 아래 '완료' 버튼과 똑같이 맞췄다.
// 예전에는 체크박스만 더 진한 연두라 같은 화면에서 초록이 두 가지로 보였다.
const CheckBox = styled.button`
  flex-shrink: 0;
  width: 30px;
  height: 30px;
  border-radius: 8px;

  display: flex;
  align-items: center;
  justify-content: center;

  border: 2px solid
    ${({ $on, $meal }) =>
      $on ? 'rgba(74, 58, 47, 0.55)' : $meal ? 'rgba(143, 174, 74, 0.6)' : '#d8cbb8'};
  background: ${({ $on }) => ($on ? '#dbe4a1' : '#fff')};
  color: #4a3a2f;
`;

const CheckMark = styled.svg`
  width: 18px;
  height: 18px;
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
  width: 78px;
`;

// 여기도 한 줄로 자르지 않는다. 꽃 아래에서 줄을 바꿔 이름을 끝까지 보여준다.
const MedLabel = styled.p`
  margin: 0;
  max-width: 100%;
  text-align: center;
  color: ${({ $taken }) => ($taken ? '#2e2117' : '#8c8780')};
  font-family: 'Noto Sans KR';
  font-size: 15px;
  font-weight: ${({ $taken }) => ($taken ? 700 : 500)};
  line-height: 1.3;
  word-break: keep-all;
`;

// 하루에 두 번 이상 먹는 약은 이름만 적으면 그 약을 다 먹은 것처럼 보인다.
// 이름 아래에 몇 시 것인지 작게 붙인다.
const DoseTime = styled.span`
  display: block;
  margin-top: 2px;
  color: #8c8780;
  font-size: 13px;
  font-weight: 500;
`;

const CompleteNote = styled.p`
  margin: 0;
  text-align: center;
  color: #8c8780;
  font-family: 'Noto Sans KR';
  font-size: 16px;
  font-weight: 500;
`;

// '닫기'가 초록으로 채워진 주 버튼이라, 옆의 '기록 수정하기'는 글자와 테두리를
// 진하게 둬서 흐릿해 보이지 않게 한다.
const EditRecordButton = styled(PopupSecondaryButton)`
  border: 1.5px solid rgba(74, 58, 47, 0.55);
  color: #4a3a2f;
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover {
    background: #f6ebc7;
  }
`;

const EmptyText = styled.p`
  margin: 0;
  width: 100%;
  text-align: center;
  color: #8c8780;
  font-family: 'Noto Sans KR';
  font-size: 15px;
`;

function TickIcon() {
  return (
    <CheckMark viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M4.5 10.5l4 4 7-8"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </CheckMark>
  );
}

function MedicineCheckPopup({ onClose }) {
  const [step, setStep] = useState('checklist'); // checklist | complete | edit
  const [checks, setChecks] = useState({});

  // '기록 수정'은 하루치를 통째로 고친다. 고치고 돌아왔는데 완료 화면이 지금
  // 시간대만 보여주면, 방금 뺀 체크가 안 지워진 것처럼 보인다. 그때는 하루 전체를 본다.
  const [editedWholeDay, setEditedWholeDay] = useState(false);

  // 두 팝업이 같은 로더를 쓴다. 여기서 목록을 따로 만들면 기록 수정 화면과 어긋난다.
  const { data, loading, error, refetch } = useApi(loadTodayMedications);
  const { data: todayMeals } = useApi(getMealLogs, { args: [toDateString()] });
  const { execute: submit, loading: submitting } = useApiAction(saveMedicationChecks);
  const { execute: submitMeal } = useApiAction(saveMealLog);

  const slotLabel = getSlotLabel(new Date().getHours());

  // 지금 시간대에 먹을 약만 보여준다. 없으면 오늘 먹을 약 전체를 보여준다.
  const allRows = flattenAll(data?.items ?? []);
  const slotRows = flattenSlot(data?.items ?? [], slotLabel);
  const isAllDay = slotRows.length === 0;
  const medRows = isAllDay ? allRows : slotRows;
  // '지금 시간대엔 없음'과 '등록된 약이 아예 없음'은 다르다. 후자인데 앞의 경우와
  // 똑같이 다루면, 완료 화면이 "약을 아직 안 드셨어요 / 0개 중 0개"처럼 마치
  // 약을 놓친 것처럼 보여준다. 약을 하나도 등록 안 한 것뿐이라 따로 짚어준다.
  const hasNoMedications = (data?.items ?? []).length === 0;

  // 하루에 몇 번 먹는 약인지. 두 번 이상이면 꽃 옆에 시각을 함께 적는다.
  const dosesToday = new Map(
    (data?.items ?? []).map((item) => [item.medicationId, item.schedules.length]),
  );

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
          setEditedWholeDay(true);
          setStep('complete');
        }}
      />
    );
  }

  if (step === 'complete') {
    // 완료 화면은 화면 상태가 아니라 다시 읽은 기록을 기준으로 그린다.
    // 그래야 '기록 수정'에서 바꾼 내용이 곧바로 반영된다.
    const rows = editedWholeDay ? allRows : medRows;
    const done = rows.filter((med) => med.taken);
    const remaining = rows.length - done.length;
    const allTaken = rows.length > 0 && remaining === 0;

    // 하루 전체를 보고 있으면 '아침'처럼 시간대를 붙이면 안 된다.
    const scopeLabel = editedWholeDay || isAllDay ? '오늘' : slotLabel;

    // 약을 다 챙겼을 때만 칭찬한다. 남았으면 몇 개가 남았는지 알려준다.
    // 등록된 약이 아예 없으면 '안 드셨어요/남았어요'가 아니라 그 사실 그대로 알려준다.
    const title = hasNoMedications
      ? '오늘 식사를 기록했어요'
      : allTaken
        ? `${scopeLabel} 약 잘 챙겨 드셨네요!`
        : done.length === 0
          ? `${scopeLabel} 약을 아직 안 드셨어요`
          : `${scopeLabel} 약이 조금 남았어요`;

    const note = hasNoMedications
      ? '등록된 약이 없어요. 약이 있다면 복용약 관리에서 추가해보세요.'
      : allTaken
        ? '오늘도 잊지 않고 챙기셨어요'
        : `${rows.length}개 중 ${done.length}개 드셨어요. ${remaining}개 남았어요!`;

    return (
      <PopupBackdrop onClick={onClose}>
        <PopupCard $center $gap={18} $padTop={36} onClick={(event) => event.stopPropagation()}>
          <PopupInnerBorder />
          <PopupTitle $center $size={24}>
            {title}
          </PopupTitle>

          {!hasNoMedications && (
            <CircleRow>
              {rows.map((med, index) => (
                <MedIconWrap key={med.scheduleId}>
                  <PopupIcon
                    $size={64}
                    src={med.taken ? MED_FLOWERS[index % MED_FLOWERS.length] : medEmpty}
                    alt=""
                  />
                  <MedLabel $taken={med.taken}>
                    {med.name}
                    {dosesToday.get(med.medicationId) > 1 && <DoseTime>{med.timeLabel}</DoseTime>}
                  </MedLabel>
                </MedIconWrap>
              ))}
            </CircleRow>
          )}

          <CompleteNote>{note}</CompleteNote>

          <PopupButtonRow>
            <EditRecordButton type="button" onClick={() => setStep('edit')}>
              기록 수정하기
            </EditRecordButton>
            <PopupPrimaryButton type="button" onClick={onClose}>
              닫기
            </PopupPrimaryButton>
          </PopupButtonRow>
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
          {hasNoMedications ? (
            '오늘 식사는 어떠셨나요?'
          ) : isAllDay ? (
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
            <CheckRow $meal>
              <CheckLabel>{slotLabel} 드셨어요?</CheckLabel>
              <CheckBox
                type="button"
                $meal
                $on={checks.meal}
                aria-pressed={Boolean(checks.meal)}
                aria-label={`${slotLabel} 먹었어요`}
                onClick={() => setChecks((prev) => ({ ...prev, meal: !prev.meal }))}
              >
                {checks.meal && <TickIcon />}
              </CheckBox>
            </CheckRow>

            {hasNoMedications ? (
              <EmptyText>등록된 복용약이 없어요.</EmptyText>
            ) : (
              medRows.map((med) => (
                <CheckRow key={med.scheduleId}>
                  <CheckLabel>
                    {nameCounts[med.name] > 1
                      ? `${med.name} (${med.timeLabel}) 드셨어요?`
                      : `${med.name} 드셨어요?`}
                  </CheckLabel>
                  <CheckBox
                    type="button"
                    $on={checks[med.scheduleId]}
                    aria-pressed={Boolean(checks[med.scheduleId])}
                    aria-label={`${med.name} 먹었어요`}
                    onClick={() =>
                      setChecks((prev) => ({ ...prev, [med.scheduleId]: !prev[med.scheduleId] }))
                    }
                  >
                    {checks[med.scheduleId] && <TickIcon />}
                  </CheckBox>
                </CheckRow>
              ))
            )}
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
