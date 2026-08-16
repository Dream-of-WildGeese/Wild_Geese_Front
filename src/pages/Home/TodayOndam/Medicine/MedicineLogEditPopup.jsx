import { useEffect, useState } from 'react';
import styled from 'styled-components';
import pencilIcon from '../../../../assets/popup/pencil.png';
import medFlowerA from '../../../../assets/popup/med-flower-a.png';
import medFlowerB from '../../../../assets/popup/med-flower-b.png';
import medEmpty from '../../../../assets/popup/med-empty.png';
import { getMedications, getMedicationLogs, updateMedicationLogs } from '../../../../api/medication';
import { useApi, useApiAction } from '../../../../hooks/useApi';
import { toDateString, timeToLabel } from '../../../../utils/medication';
import {
  PopupBackdrop,
  PopupCard,
  PopupInnerBorder,
  PopupTitle,
  PopupPrimaryButton,
  PopupIcon,
} from '../../../../components/PopupShell';

// Figma 19: 오늘 복약 기록을 스케줄 단위로 다시 체크하는 팝업.
// 등록된 약의 모든 시간대를 한 줄씩 펼쳐놓고, 눌러서 먹음/안먹음을 토글한다.
const MED_FLOWERS = [medFlowerA, medFlowerB];

// 약 목록과 오늘 기록을 합쳐 화면이 쓸 한 줄짜리 항목으로 만든다.
async function loadTodayMedicationRows() {
  const recordDate = toDateString();
  const [medications, log] = await Promise.all([
    getMedications(),
    getMedicationLogs(recordDate).catch(() => null),
  ]);

  const statusBySchedule = new Map(
    (log?.medications ?? []).map((item) => [item.scheduleId, item.status]),
  );

  const rows = [];
  (medications ?? []).forEach((medication) => {
    const schedules = medication.schedules ?? [];
    schedules.forEach((schedule) => {
      rows.push({
        scheduleId: schedule.scheduleId,
        // 같은 약이 여러 번이면 '혈압약 (아침)'처럼 시간대를 덧붙인다.
        name:
          schedules.length > 1
            ? `${medication.name} (${timeToLabel(schedule.scheduledTime).split(' ')[0]})`
            : medication.name,
        timeLabel: timeToLabel(schedule.scheduledTime),
        taken: statusBySchedule.get(schedule.scheduleId) === 'TAKEN',
      });
    });
  });

  return { recordDate, rows };
}

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

const MedRow = styled.button`
  width: 100%;
  height: 68px;
  padding: 0 8px 0 14px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  border-radius: 10px;
  border: 1px solid ${({ $taken }) => ($taken ? '#cbd879' : '#d8cbb8')};
  background: ${({ $taken }) => ($taken ? '#edf3d5' : '#fffbf1')};
  text-align: left;
`;

const TextCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const MedName = styled.span`
  color: #4a3a2f;
  font-family: 'Noto Sans KR';
  font-size: 18px;
  font-weight: 700;
`;

const MedTime = styled.span`
  color: #8c8780;
  font-family: 'Noto Sans KR';
  font-size: 15px;
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
  const { data, loading, error } = useApi(loadTodayMedicationRows);
  const { execute: saveLogs, loading: saving } = useApiAction(updateMedicationLogs);
  const [taken, setTaken] = useState({});

  // 서버 기록이 도착하면 토글 초기 상태를 한 번 맞춰준다.
  useEffect(() => {
    if (!data) return;
    setTaken(Object.fromEntries(data.rows.map((row) => [row.scheduleId, row.taken])));
  }, [data]);

  const handleSave = async () => {
    const { ok, error: saveError } = await saveLogs({
      recordDate: data.recordDate,
      logs: data.rows.map((row) => ({
        scheduleId: row.scheduleId,
        status: taken[row.scheduleId] ? 'TAKEN' : 'NOT_RECORDED',
      })),
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

        <SubtitleRow>
          <PopupIcon $size={34} src={pencilIcon} alt="" />
          <SubtitleText>드신 약을 눌러주세요</SubtitleText>
        </SubtitleRow>

        {loading && <EmptyText>불러오는 중이에요...</EmptyText>}
        {error && <EmptyText>{error.message}</EmptyText>}
        {!loading && !error && data?.rows.length === 0 && (
          <EmptyText>등록된 복용약이 없어요.</EmptyText>
        )}

        {(data?.rows ?? []).map((row, index) => (
          <MedRow
            key={row.scheduleId}
            type="button"
            $taken={taken[row.scheduleId]}
            onClick={() =>
              setTaken((prev) => ({ ...prev, [row.scheduleId]: !prev[row.scheduleId] }))
            }
          >
            <TextCol>
              <MedName>{row.name}</MedName>
              <MedTime>{row.timeLabel}</MedTime>
            </TextCol>
            <PopupIcon
              $size={60}
              src={taken[row.scheduleId] ? MED_FLOWERS[index % MED_FLOWERS.length] : medEmpty}
              alt=""
            />
          </MedRow>
        ))}

        <PopupPrimaryButton type="button" onClick={handleSave} disabled={saving || !data}>
          {saving ? '저장 중...' : '완료'}
        </PopupPrimaryButton>
      </PopupCard>
    </PopupBackdrop>
  );
}

export default MedicineLogEditPopup;
