import { getMedications, getMedicationLogs, updateMedicationLogs } from '../../../../api/medication';
import { toDateString, timeToLabel, parseTime } from '../../../../utils/medication';

// 약 체크 팝업과 복약 기록 수정 팝업이 같은 데이터를 보도록 로더를 하나로 둔다.
// 각자 목록을 만들면 어느 시간대를 체크한 건지 어긋나서 저장이 안 된 것처럼 보인다.

// 하루를 세 구간으로 나눈다. 경계는 12시와 17시.
const SLOTS = [
  { label: '아침', endHour: 12 },
  { label: '점심', endHour: 17 },
  { label: '저녁', endHour: 24 },
];

export const getSlotLabel = (hour) => SLOTS.find((slot) => hour < slot.endHour)?.label ?? '저녁';

export const slotOfTime = (scheduledTime) => getSlotLabel(parseTime(scheduledTime).hour);

// 서버는 TAKEN을 되돌리지 못한다. status를 NOT_RECORDED로 다시 보내면 200을 주면서
// 실제로는 무시하고, 기록을 지우는 API도 없다. 그래서 '해제한 스케줄'만 여기 적어두고
// 서버 응답 위에 덮어쓴다. 서버가 해제를 받아주면 이 파일에서 통째로 지우면 된다.
const UNCHECK_KEY = 'ondam:medication-unchecked';

const readUnchecked = (recordDate) => {
  try {
    const saved = JSON.parse(localStorage.getItem(UNCHECK_KEY) ?? '{}');
    // 날짜가 바뀌면 어제 해제 기록은 버린다.
    return saved.recordDate === recordDate ? new Set(saved.scheduleIds ?? []) : new Set();
  } catch {
    return new Set();
  }
};

const writeUnchecked = (recordDate, scheduleIds) => {
  localStorage.setItem(
    UNCHECK_KEY,
    JSON.stringify({ recordDate, scheduleIds: [...scheduleIds] }),
  );
};

// 오늘 먹어야 할 약을 약 단위로 묶고, 각 시간대에 기록이 있는지 함께 담는다.
export async function loadTodayMedications() {
  const recordDate = toDateString();
  const [medications, log] = await Promise.all([
    getMedications(),
    getMedicationLogs(recordDate).catch(() => null),
  ]);

  const unchecked = readUnchecked(recordDate);

  // 서버는 오늘 해당하는 스케줄만 기록에 담아준다.
  // 여기 없는 스케줄은 오늘 먹는 약이 아니므로 화면에서도 빼야 한다.
  const statusBySchedule = new Map(
    (log?.medications ?? []).map((item) => [item.scheduleId, item.status]),
  );

  const items = (medications ?? [])
    .map((medication) => ({
      medicationId: medication.medicationId,
      name: medication.name,
      schedules: (medication.schedules ?? [])
        .filter((schedule) => statusBySchedule.has(schedule.scheduleId))
        .map((schedule) => ({
          scheduleId: schedule.scheduleId,
          scheduledTime: schedule.scheduledTime,
          timeLabel: timeToLabel(schedule.scheduledTime),
          slot: slotOfTime(schedule.scheduledTime),
          taken:
            statusBySchedule.get(schedule.scheduleId) === 'TAKEN' &&
            !unchecked.has(schedule.scheduleId),
        }))
        .sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime)),
    }))
    .filter((item) => item.schedules.length > 0);

  return { recordDate, items };
}

// 특정 시간대(아침/점심/저녁)에 먹어야 할 약만 한 줄씩 펼친다.
export const flattenSlot = (items, slotLabel) =>
  items.flatMap((item) =>
    item.schedules
      .filter((schedule) => schedule.slot === slotLabel)
      .map((schedule) => ({
        medicationId: item.medicationId,
        name: item.name,
        ...schedule,
      })),
  );

export const flattenAll = (items) =>
  items.flatMap((item) =>
    item.schedules.map((schedule) => ({
      medicationId: item.medicationId,
      name: item.name,
      ...schedule,
    })),
  );

// 체크 상태를 저장한다. 체크는 서버로 보내고, 해제는 로컬에 적어둔다.
// scheduleIds는 이번 화면이 책임지는 스케줄만 담아서, 다른 시간대 기록은 건드리지 않는다.
export async function saveMedicationChecks({ recordDate, scheduleIds, checked }) {
  const unchecked = readUnchecked(recordDate);

  const toSend = scheduleIds.filter((id) => checked[id]);
  toSend.forEach((id) => unchecked.delete(id));
  scheduleIds.filter((id) => !checked[id]).forEach((id) => unchecked.add(id));

  writeUnchecked(recordDate, unchecked);

  if (toSend.length === 0) return;
  await updateMedicationLogs({
    recordDate,
    logs: toSend.map((scheduleId) => ({ scheduleId, status: 'TAKEN' })),
  });
}
