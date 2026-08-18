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

const DAY_NAMES = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
const todayDayName = () => DAY_NAMES[new Date().getDay()];

export const slotOfTime = (scheduledTime) => getSlotLabel(parseTime(scheduledTime).hour);

// 오늘 먹어야 할 약을 약 단위로 묶고, 각 시간대에 기록이 있는지 함께 담는다.
export async function loadTodayMedications() {
  const recordDate = toDateString();
  const [medications, log] = await Promise.all([
    getMedications(),
    getMedicationLogs(recordDate).catch(() => null),
  ]);

  const today = todayDayName();

  // 서버는 아직 시간이 안 지난 스케줄의 기록 행을 미리 만들어주지 않는다.
  // 그래서 '오늘 먹는 약인지'는 로그 존재 여부가 아니라 daysOfWeek로 직접 판단한다.
  // (로그 유무는 '먹었는지 여부'에만 쓴다 — 없으면 아직 안 먹은 것으로 본다)
  const statusBySchedule = new Map(
    (log?.medications ?? []).map((item) => [item.scheduleId, item.status]),
  );

  const items = (medications ?? [])
    .map((medication) => ({
      medicationId: medication.medicationId,
      name: medication.name,
      schedules: (medication.schedules ?? [])
        .filter((schedule) => (schedule.daysOfWeek ?? []).includes(today))
        .map((schedule) => ({
          scheduleId: schedule.scheduleId,
          scheduledTime: schedule.scheduledTime,
          timeLabel: timeToLabel(schedule.scheduledTime),
          slot: slotOfTime(schedule.scheduledTime),
          taken: statusBySchedule.get(schedule.scheduleId) === 'TAKEN',
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

// 체크 상태를 저장한다. 체크와 해제를 모두 서버로 보낸다.
// scheduleIds는 이번 화면이 책임지는 스케줄만 담아서, 다른 시간대 기록은 건드리지 않는다.
export async function saveMedicationChecks({ recordDate, scheduleIds, checks }) {
  if (scheduleIds.length === 0) return;

  await updateMedicationLogs({
    recordDate,
    logs: scheduleIds.map((scheduleId) => ({
      scheduleId,
      status: checks[scheduleId] ? 'TAKEN' : 'NOT_RECORDED',
    })),
  });
}
