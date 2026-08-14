export function formatAlarmTime(value) {
  const [hourStr, minuteStr] = value.split(':');
  const hour = Number(hourStr);
  const period = hour < 12 ? '오전' : '오후';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${period} ${displayHour}:${minuteStr}`;
}

export const ROLE_LABEL = { parent: '부모', child: '자녀' };
