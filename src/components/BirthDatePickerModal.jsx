import DatePickerModal from './DatePickerModal';

// 생년월일 전용 규칙(만 나이 범위)만 여기서 정하고, 달력 UI 자체는
// DatePickerModal(검진 날짜 등 다른 화면과 공유하는 범용 달력)에 맡긴다.
function BirthDatePickerModal({ value, minAge = 0, maxAge = 120, onConfirm, onClose }) {
  const today = new Date();
  const latestYear = today.getFullYear() - minAge;
  const earliestYear = today.getFullYear() - maxAge;
  // 미래 날짜와 최소 나이를 넘는 날짜는 고르지 못하게 막는다.
  const limit = new Date(today.getFullYear() - minAge, today.getMonth(), today.getDate());

  return (
    <DatePickerModal
      value={value}
      title="생년월일 선택"
      guide={`만 ${minAge}세 이상만 가입할 수 있어서 ${latestYear}년까지 선택할 수 있어요`}
      earliestYear={earliestYear}
      latestYear={latestYear}
      fallback={{ year: latestYear, month: 1, day: 1 }}
      isDateDisabled={(date) => date > limit}
      disabledNotice={`만 ${minAge}세 이상만 가입할 수 있어요.`}
      onConfirm={onConfirm}
      onClose={onClose}
    />
  );
}

export default BirthDatePickerModal;
