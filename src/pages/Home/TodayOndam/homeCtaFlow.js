// 홈 말풍선에서 쓰는 시간 표기 도우미.
// 예전에는 시각으로 아침/복약/저녁을 자동 판단했지만, 지금은 사용자가
// TodayOndamPicker에서 직접 고르므로 분기 로직은 없다.

export function getMealLabel(hour) {
  if (hour < 11) return '아침';
  if (hour < 17) return '점심';
  return '저녁';
}

export function formatKoreanTime(hour, minute = 0) {
  const period = hour < 12 ? '오전' : '오후';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return minute === 0 ? `${period} ${displayHour}시` : `${period} ${displayHour}시 ${minute}분`;
}
