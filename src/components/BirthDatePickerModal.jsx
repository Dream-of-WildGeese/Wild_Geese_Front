import { useState } from 'react';
import styled from 'styled-components';

// 아침 일지의 연월 선택 모달과 같은 톤. 연도 -> 월 -> 일 순서로 좁혀 고른다.
// value/onConfirm 모두 "YYYY-MM-DD" 문자열을 쓴다.

const YEARS_PER_PAGE = 12;
const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

const Backdrop = styled.div`
  position: fixed;
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

const Guide = styled.p`
  margin: 0 0 ${({ theme }) => theme.spacing.md};
  font-size: 12px;
  line-height: 1.5;
  color: #a79c8e;
`;

const HeadRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const HeadButton = styled.button`
  flex: 1;
  padding: 12px 0;
  border-radius: 14px;
  background: ${({ $active }) =>
    $active ? 'rgba(193, 160, 103, 0.35)' : 'rgba(193, 160, 103, 0.18)'};
  border: 1px solid #4a3a2f;
  font-family: 'Jua', sans-serif;
  font-size: 18px;
  color: #4a3a2f;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(${({ $columns }) => $columns}, 1fr);
  gap: 6px;
`;

const OptionButton = styled.button`
  padding: 10px 0;
  border-radius: 10px;
  background: ${({ $active }) =>
    $active ? 'rgba(193, 160, 103, 0.35)' : 'rgba(193, 160, 103, 0.14)'};
  border: 1px solid #4a3a2f;
  font-family: 'Noto Sans KR', sans-serif;
  font-weight: 700;
  font-size: 13px;
  color: #4a3a2f;

  &:disabled {
    opacity: 0.25;
  }
`;

const WeekdayCell = styled.span`
  padding: 4px 0;
  text-align: center;
  font-size: 12px;
  font-weight: 700;
  color: #a79c8e;
`;

const EmptyCell = styled.span``;

const PageNav = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: ${({ theme }) => theme.spacing.sm};
`;

const PageButton = styled.button`
  padding: 6px 10px;
  border-radius: 8px;
  font-family: 'Noto Sans KR', sans-serif;
  font-weight: 700;
  font-size: 13px;
  color: #4a3a2f;
  opacity: ${({ disabled }) => (disabled ? 0.35 : 1)};
`;

const Notice = styled.p`
  margin: ${({ theme }) => theme.spacing.sm} 0 0;
  font-size: 12px;
  color: #d96659;
  text-align: center;
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

  &:disabled {
    opacity: 0.4;
  }
`;

const pad = (n) => String(n).padStart(2, '0');
const daysInMonth = (year, month) => new Date(year, month, 0).getDate();

const parse = (value, fallbackYear) => {
  const matched = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value ?? ''));
  if (!matched) return { year: fallbackYear, month: 1, day: 1 };
  return { year: Number(matched[1]), month: Number(matched[2]), day: Number(matched[3]) };
};

function BirthDatePickerModal({ value, minAge = 0, maxAge = 120, onConfirm, onClose }) {
  const today = new Date();
  // 만 나이 기준으로 고를 수 있는 연도 범위를 정한다.
  const latestYear = today.getFullYear() - minAge;
  const earliestYear = today.getFullYear() - maxAge;

  const initial = parse(value, latestYear);
  const [view, setView] = useState('day');
  const [year, setYear] = useState(Math.min(Math.max(initial.year, earliestYear), latestYear));
  const [month, setMonth] = useState(initial.month);
  const [day, setDay] = useState(initial.day);
  const [yearPage, setYearPage] = useState(0);

  const totalDays = daysInMonth(year, month);
  const safeDay = Math.min(day, totalDays);
  const firstWeekday = new Date(year, month - 1, 1).getDay();

  const windowEnd = latestYear - YEARS_PER_PAGE * yearPage;
  const yearOptions = Array.from({ length: YEARS_PER_PAGE }, (_, i) => windowEnd - i)
    .filter((y) => y >= earliestYear)
    .reverse();

  // 미래 날짜와 최소 나이를 넘는 날짜는 고르지 못하게 막는다.
  const selected = new Date(year, month - 1, safeDay);
  const limit = new Date(today.getFullYear() - minAge, today.getMonth(), today.getDate());
  const isTooYoung = selected > limit;

  const isDayDisabled = (candidate) => new Date(year, month - 1, candidate) > limit;

  return (
    <Backdrop onClick={onClose}>
      <Card onClick={(event) => event.stopPropagation()}>
        <CloseButton type="button" aria-label="닫기" onClick={onClose}>
          ✕
        </CloseButton>
        <Title>생년월일 선택</Title>
        {/* 왜 2012년까지만 고를 수 있는지 알려주지 않으면 오류로 오해하기 쉽다 */}
        <Guide>
          만 {minAge}세 이상만 가입할 수 있어서 {latestYear}년까지 선택할 수 있어요
        </Guide>

        <HeadRow>
          <HeadButton type="button" $active={view === 'year'} onClick={() => setView('year')}>
            {year}년
          </HeadButton>
          <HeadButton type="button" $active={view === 'month'} onClick={() => setView('month')}>
            {month}월
          </HeadButton>
          <HeadButton type="button" $active={view === 'day'} onClick={() => setView('day')}>
            {safeDay}일
          </HeadButton>
        </HeadRow>

        {view === 'year' && (
          <>
            <Grid $columns={4}>
              {yearOptions.map((option) => (
                <OptionButton
                  key={option}
                  type="button"
                  $active={option === year}
                  onClick={() => {
                    setYear(option);
                    setView('month');
                  }}
                >
                  {option}
                </OptionButton>
              ))}
            </Grid>
            <PageNav>
              <PageButton
                type="button"
                disabled={windowEnd - YEARS_PER_PAGE < earliestYear}
                onClick={() => setYearPage((p) => p + 1)}
              >
                ‹ 이전
              </PageButton>
              <PageButton
                type="button"
                disabled={yearPage === 0}
                onClick={() => setYearPage((p) => Math.max(0, p - 1))}
              >
                다음 ›
              </PageButton>
            </PageNav>
          </>
        )}

        {view === 'month' && (
          <Grid $columns={4}>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((option) => (
              <OptionButton
                key={option}
                type="button"
                $active={option === month}
                onClick={() => {
                  setMonth(option);
                  setView('day');
                }}
              >
                {option}월
              </OptionButton>
            ))}
          </Grid>
        )}

        {view === 'day' && (
          <Grid $columns={7}>
            {WEEKDAY_LABELS.map((label) => (
              <WeekdayCell key={label}>{label}</WeekdayCell>
            ))}
            {/* 1일이 무슨 요일인지에 맞춰 앞쪽을 비워둔다 */}
            {Array.from({ length: firstWeekday }, (_, i) => (
              <EmptyCell key={`empty-${i}`} />
            ))}
            {Array.from({ length: totalDays }, (_, i) => i + 1).map((option) => (
              <OptionButton
                key={option}
                type="button"
                $active={option === safeDay}
                disabled={isDayDisabled(option)}
                onClick={() => setDay(option)}
              >
                {option}
              </OptionButton>
            ))}
          </Grid>
        )}

        {isTooYoung && <Notice>만 {minAge}세 이상만 가입할 수 있어요.</Notice>}

        <ConfirmButton
          type="button"
          disabled={isTooYoung}
          onClick={() => onConfirm(`${year}-${pad(month)}-${pad(safeDay)}`)}
        >
          확인
        </ConfirmButton>
      </Card>
    </Backdrop>
  );
}

export default BirthDatePickerModal;
