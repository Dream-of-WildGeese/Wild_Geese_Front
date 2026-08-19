import { useState } from 'react';
import styled from 'styled-components';
import PopupPortal from './PopupPortal';

// 아침 일지의 연월 선택 모달과 같은 톤으로 맞춘 시간 선택 모달.
// value/onConfirm 모두 "HH:mm" 24시간 문자열을 쓴다.

const MINUTE_STEP = 10;

const Backdrop = styled.div`
  /* Layout(폰 프레임)이 기준이 되도록 absolute를 쓴다. fixed면 브라우저 창 가운데에 뜬다. */
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.lg};
  background: rgba(44, 44, 42, 0.4);
  z-index: ${({ theme }) => theme.zIndex.modal};
`;

const Card = styled.div`
  position: relative;
  width: 100%;
  max-width: 320px;
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: 20px;
  background: #fff8ed;
  border: 1px solid #4a3a2f;
`;

const CloseButton = styled.button`
  position: absolute;
  top: ${({ theme }) => theme.spacing.sm};
  right: ${({ theme }) => theme.spacing.sm};
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  color: #4a3a2f;
  font-size: 16px;
`;

const Title = styled.p`
  margin: 0 0 ${({ theme }) => theme.spacing.md};
  padding-right: ${({ theme }) => theme.spacing.lg};
  font-family: 'Jua', sans-serif;
  font-size: 18px;
  color: #4a3a2f;
`;

const Preview = styled.p`
  margin: 0 0 ${({ theme }) => theme.spacing.md};
  text-align: center;
  font-family: 'Jua', sans-serif;
  font-size: 28px;
  color: #4a3a2f;
`;

const SectionLabel = styled.p`
  margin: ${({ theme }) => theme.spacing.md} 0 ${({ theme }) => theme.spacing.sm};
  font-size: 13px;
  font-weight: 700;
  color: #6b6661;
`;

const PeriodRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const OptionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 6px;
`;

const OptionButton = styled.button`
  padding: ${({ $tall }) => ($tall ? '12px 0' : '10px 0')};
  flex: ${({ $tall }) => ($tall ? 1 : 'unset')};
  border-radius: 10px;
  background: ${({ $active }) =>
    $active ? 'rgba(193, 160, 103, 0.35)' : 'rgba(193, 160, 103, 0.14)'};
  border: 1px solid #4a3a2f;
  font-family: 'Noto Sans KR', sans-serif;
  font-weight: 700;
  font-size: ${({ $tall }) => ($tall ? '15px' : '13px')};
  color: #4a3a2f;
`;

const ConfirmButton = styled.button`
  width: 100%;
  height: 48px;
  margin-top: ${({ theme }) => theme.spacing.md};
  border-radius: 14px;
  background: #4a3a2f;
  color: #fff8ed;
  font-family: 'Noto Sans KR', sans-serif;
  font-weight: 700;
  font-size: 15px;
`;

// "20:00" -> { period: '오후', hour12: 8, minute: 0 }
const parse = (value) => {
  const [rawHour, rawMinute] = String(value ?? '08:00')
    .slice(0, 5)
    .split(':')
    .map(Number);
  const hour = Number.isFinite(rawHour) ? rawHour : 8;
  const minute = Number.isFinite(rawMinute) ? rawMinute : 0;
  return {
    period: hour < 12 ? '오전' : '오후',
    hour12: hour % 12 === 0 ? 12 : hour % 12,
    minute: Math.round(minute / MINUTE_STEP) * MINUTE_STEP,
  };
};

const toValue = (period, hour12, minute) => {
  let hour = hour12 % 12;
  if (period === '오후') hour += 12;
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
};

// fixedPeriod를 주면(예: 아침 질문은 '오전', 저녁 체크는 '오후') 오전/오후 선택 자체를
// 없애서 엉뚱한 시간대로 저장하는 걸 막는다.
function TimePickerModal({ title = '시간 선택', value, fixedPeriod, onConfirm, onClose }) {
  const initial = parse(value);
  const [period, setPeriod] = useState(fixedPeriod ?? initial.period);
  const [hour12, setHour12] = useState(initial.hour12);
  const [minute, setMinute] = useState(initial.minute);

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 60 / MINUTE_STEP }, (_, i) => i * MINUTE_STEP);

  return (
    <PopupPortal>
      <Backdrop onClick={onClose}>
        <Card onClick={(event) => event.stopPropagation()}>
          <CloseButton type="button" aria-label="닫기" onClick={onClose}>
            ✕
          </CloseButton>
          <Title>{title}</Title>

          <Preview>
            {period} {hour12}:{String(minute).padStart(2, '0')}
          </Preview>

          {!fixedPeriod && (
            <PeriodRow>
              {['오전', '오후'].map((option) => (
                <OptionButton
                  key={option}
                  type="button"
                  $tall
                  $active={period === option}
                  onClick={() => setPeriod(option)}
                >
                  {option}
                </OptionButton>
              ))}
            </PeriodRow>
          )}

          <SectionLabel>시</SectionLabel>
          <OptionGrid>
            {hours.map((option) => (
              <OptionButton
                key={option}
                type="button"
                $active={hour12 === option}
                onClick={() => setHour12(option)}
              >
                {option}
              </OptionButton>
            ))}
          </OptionGrid>

          <SectionLabel>분</SectionLabel>
          <OptionGrid>
            {minutes.map((option) => (
              <OptionButton
                key={option}
                type="button"
                $active={minute === option}
                onClick={() => setMinute(option)}
              >
                {String(option).padStart(2, '0')}
              </OptionButton>
            ))}
          </OptionGrid>

          <ConfirmButton type="button" onClick={() => onConfirm(toValue(period, hour12, minute))}>
            확인
          </ConfirmButton>
        </Card>
      </Backdrop>
    </PopupPortal>
  );
}

export default TimePickerModal;
