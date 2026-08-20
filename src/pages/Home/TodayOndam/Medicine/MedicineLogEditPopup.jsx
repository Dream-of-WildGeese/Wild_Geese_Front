import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import medFlowerA from '../../../../assets/popup/med-flower-a.png';
import medFlowerB from '../../../../assets/popup/med-flower-b.png';
import flowerA from '../../../../assets/journal/flower-a.png';
import flowerB from '../../../../assets/journal/flower-b.png';
import flowerC from '../../../../assets/weekly/flower.png';
import medEmpty from '../../../../assets/popup/med-empty.png';
import { useApi, useApiAction } from '../../../../hooks/useApi';
import { loadTodayMedications, saveMedicationChecks, flattenAll } from './medicationData';
import {
  PopupBackdrop,
  PopupCard,
  PopupInnerBorder,
  PopupTitle,
  PopupPrimaryButton,
  PopupIcon,
} from '../../../../components/PopupShell';

// Figma 19: 오늘 복약 기록 수정.
// 같은 약이 하루에 여러 번이면 카드를 여러 개 만들지 않고, 한 카드 안에서
// 시간대별로 체크한다. 목록은 약 체크 팝업과 같은 로더에서 가져온다.
// 약마다 다른 꽃이 피도록 종류를 늘렸다. 같은 그림이 여러 개면
// 어느 약이 다 찼는지 구분이 안 된다.
const MED_FLOWERS = [medFlowerA, medFlowerB, flowerA, flowerB, flowerC];

const SubtitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
`;

const SubtitleText = styled.span`
  color: #8c8780;
  font-family: 'Noto Sans KR';
  font-size: 20px;
  font-weight: 500;
`;

const CardList = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;

  max-height: 340px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const MedCard = styled.div`
  width: 100%;
  padding: 14px;

  display: flex;
  flex-direction: column;
  gap: 12px;

  border-radius: 12px;
  border: 1px solid #d8cbb8;
  background: #fffbf1;
`;

const CardHead = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const MedName = styled.span`
  flex: 1;
  min-width: 0;
  color: #4a3a2f;
  font-family: 'Noto Sans KR';
  font-size: 18px;
  font-weight: 700;
`;

const TakenCount = styled.span`
  flex-shrink: 0;
  color: #576b1a;
  font-family: 'Noto Sans KR';
  font-size: 14px;
  font-weight: 700;
`;

const TimeRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

// 시간대 하나가 곧 체크 대상. 누르면 먹음/안먹음이 토글된다.
const TimeChip = styled.button`
  height: 40px;
  padding: 0 14px;

  display: flex;
  align-items: center;
  gap: 6px;

  border-radius: 20px;
  border: 1.5px solid ${({ $taken }) => ($taken ? 'rgba(87, 107, 26, 0.5)' : '#d8cbb8')};
  background: ${({ $taken }) => ($taken ? '#cbd879' : '#fff')};
  color: ${({ $taken }) => ($taken ? '#364310' : '#8c8780')};

  font-family: 'Noto Sans KR';
  font-size: 15px;
  font-weight: 700;
  white-space: nowrap;
`;

const CheckMark = styled.span`
  font-size: 13px;
  line-height: 1;
`;

const EmptyText = styled.p`
  margin: 0;
  width: 100%;
  text-align: center;
  color: #8c8780;
  font-family: 'Noto Sans KR';
  font-size: 15px;
`;

function MedicineLogEditPopup({ onClose, onDone }) {
  const { data, loading, error } = useApi(loadTodayMedications);
  const { execute: saveChecks, loading: saving } = useApiAction(saveMedicationChecks);
  const [taken, setTaken] = useState({});

  // 서버 기록이 도착하면 체크 상태를 한 번 맞춰준다.
  const seededRef = useRef(false);
  useEffect(() => {
    if (seededRef.current || !data) return;
    seededRef.current = true;
    setTaken(
      Object.fromEntries(
        data.items.flatMap((item) =>
          item.schedules.map((schedule) => [schedule.scheduleId, schedule.taken]),
        ),
      ),
    );
  }, [data]);

  const handleSave = async () => {
    const { ok, error: saveError } = await saveChecks({
      recordDate: data.recordDate,
      scheduleIds: flattenAll(data.items).map((med) => med.scheduleId),
      checks: taken,
    });
    if (!ok) {
      alert(saveError.message);
      return;
    }
    onDone();
  };

  return (
    <PopupBackdrop onClick={onClose}>
      <PopupCard $center $gap={16} $padTop={36} onClick={(event) => event.stopPropagation()}>
        <PopupInnerBorder />
        <PopupTitle $center $size={24}>
          복약 기록 수정
        </PopupTitle>

        {/* 누를 약이 하나도 없을 땐 '눌러주세요'가 할 게 없다는 뜻으로
            읽혀서 어색하다. 약이 있을 때만 보여준다. */}
        {!loading && !error && data?.items.length > 0 && (
          <SubtitleRow>
            <SubtitleText>드신 약을 눌러주세요</SubtitleText>
          </SubtitleRow>
        )}

        {loading && <EmptyText>불러오는 중이에요...</EmptyText>}
        {error && <EmptyText>{error.message}</EmptyText>}
        {!loading && !error && data?.items.length === 0 && (
          <EmptyText>등록된 복용약이 없어요.</EmptyText>
        )}

        <CardList>
          {(data?.items ?? []).map((item, index) => {
            const takenCount = item.schedules.filter((s) => taken[s.scheduleId]).length;
            // 그 약의 하루치를 전부 먹어야 꽃이 핀다. 한 번만 먹고 꽃이 피면
            // 다 챙긴 것처럼 보인다.
            const allTaken = takenCount === item.schedules.length;
            return (
              <MedCard key={item.medicationId}>
                <CardHead>
                  <PopupIcon
                    $size={40}
                    src={allTaken ? MED_FLOWERS[index % MED_FLOWERS.length] : medEmpty}
                    alt=""
                  />
                  <MedName>{item.name}</MedName>
                  <TakenCount>
                    {takenCount}/{item.schedules.length}
                  </TakenCount>
                </CardHead>

                <TimeRow>
                  {item.schedules.map((schedule) => (
                    <TimeChip
                      key={schedule.scheduleId}
                      type="button"
                      $taken={taken[schedule.scheduleId]}
                      onClick={() =>
                        setTaken((prev) => ({
                          ...prev,
                          [schedule.scheduleId]: !prev[schedule.scheduleId],
                        }))
                      }
                    >
                      {taken[schedule.scheduleId] && <CheckMark>✓</CheckMark>}
                      {schedule.timeLabel}
                    </TimeChip>
                  ))}
                </TimeRow>
              </MedCard>
            );
          })}
        </CardList>

        <PopupPrimaryButton type="button" onClick={handleSave} disabled={saving || !data}>
          {saving ? '저장 중...' : '완료'}
        </PopupPrimaryButton>
      </PopupCard>
    </PopupBackdrop>
  );
}

export default MedicineLogEditPopup;
