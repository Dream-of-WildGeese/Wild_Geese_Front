// 서버는 "08:30:00"처럼 초까지 붙여 내려주기도 해서 앞 5글자만 쓴다.
export function formatAlarmTime(value) {
  if (!value) return '미설정';
  const [hourStr, minuteStr] = String(value).slice(0, 5).split(':');
  const hour = Number(hourStr);
  const period = hour < 12 ? '오전' : '오후';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${period} ${displayHour}:${minuteStr}`;
}

export const ROLE_LABEL = { parent: '부모', child: '자녀' };
