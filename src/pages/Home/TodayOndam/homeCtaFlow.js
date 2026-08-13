const MORNING_START_HOUR = 5;
const EVENING_START_HOUR = 17;
const MEDICATION_WINDOW_MINUTES = 60;

export function getMealLabel(hour) {
  if (hour < 11) return '아침';
  if (hour < 17) return '점심';
  return '저녁';
}

// now 기준 ±60분 이내에 예정된 복용약을 찾고, 그중 같은 시각끼리 묶어서 반환한다.
// (예: 점심에 먹는 약이 여러 개면 한 체크리스트에 같이 보여준다)
export function findDueMedications(medications, now = new Date()) {
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const due = medications.filter((med) => {
    const medMinutes = med.hour * 60 + med.minute;
    return Math.abs(nowMinutes - medMinutes) <= MEDICATION_WINDOW_MINUTES;
  });
  if (due.length === 0) return [];
  const targetMinutes = due[0].hour * 60 + due[0].minute;
  return due.filter((med) => med.hour * 60 + med.minute === targetMinutes);
}

// 복용 예정 약이 있으면 최우선으로 '약 먹을 시간' 분기를 타고,
// 없으면 시각대로 아침/저녁 질문 중 하나를 보여준다.
export function getHomeCtaSlot(medications, now = new Date()) {
  const dueMedications = findDueMedications(medications, now);
  if (dueMedications.length > 0) {
    return {
      type: 'medication',
      medications: dueMedications,
      mealLabel: getMealLabel(dueMedications[0].hour),
    };
  }

  const hour = now.getHours();
  if (hour >= MORNING_START_HOUR && hour < EVENING_START_HOUR) {
    return { type: 'morning' };
  }
  return { type: 'evening' };
}

export function formatKoreanTime(hour, minute = 0) {
  const period = hour < 12 ? '오전' : '오후';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return minute === 0 ? `${period} ${displayHour}시` : `${period} ${displayHour}시 ${minute}분`;
}
