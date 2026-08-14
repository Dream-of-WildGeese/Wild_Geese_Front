import { parseTime } from '../../../utils/medication';

const MORNING_START_HOUR = 5;
const EVENING_START_HOUR = 17;

export function getMealLabel(hour) {
  if (hour < 11) return '아침';
  if (hour < 17) return '점심';
  return '저녁';
}

// 복용 예정 약이 있으면 최우선으로 '약 먹을 시간' 분기를 타고,
// 없으면 시각대로 아침/저녁 질문 중 하나를 보여준다.
// dueMedications는 GET /api/v1/medications/due 응답으로, 어떤 약이 지금 복용
// 예정인지는 서버가 판단한다.
export function getHomeCtaSlot(dueMedications = [], now = new Date()) {
  if (dueMedications.length > 0) {
    return {
      type: 'medication',
      medications: dueMedications,
      mealLabel: getMealLabel(parseTime(dueMedications[0].scheduledTime).hour),
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
