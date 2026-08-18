import { useState } from 'react';
import styled from 'styled-components';
import PopupPortal from './PopupPortal';

// BirthDatePickerModal과 같은 톤(연도 -> 월 -> 일)의 범용 달력 모달.
// 생년월일처럼 "선택 가능한 날짜 범위"가 필요하면 isDateDisabled/disabledNotice로 넘긴다.

const YEARS_PER_PAGE = 12;
const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

const Backdrop = styled.div`
  /* Layout(폰 프레임)이 기준이 되도록 absolute를 쓴다. fixed면 브라우저 창 가운데에 뜬다. */
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.lg};
  background: rgba(44, 44, 42, 0.4);
  /* AddHealthCheck 같은 모달 위에서 또 뜨는 경우가 있어, 그런 모달의 z-index(최대 9999)보다
     확실히 높게 잡는다. theme.zIndex.modal(1000)만으로는 그 모달들 뒤에 가려진다. */
  z-index: 10000;
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

const parse = (value, fallback) => {
  const matched = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value ?? ''));
  if (!matched) return fallback;
  return { year: Number(matched[1]), month: Number(matched[2]), day: Number(matched[3]) };
};

function DatePickerModal({
  value,
  title = '날짜 선택',
  guide,
  earliestYear,
  latestYear,
  fallback,
  isDateDisabled = () => false,
  disabledNotice,
  onConfirm,
  onClose,
}) {
  const today = new Date();
  const resolvedLatestYear = latestYear ?? today.getFullYear() + 5;
  const resolvedEarliestYear = earliestYear ?? today.getFullYear() - 100;
  const fallbackParts =
    fallback ?? { year: today.getFullYear(), month: today.getMonth() + 1, day: today.getDate() };

  const initial = parse(value, fallbackParts);
  const [view, setView] = useState('day');
  const [year, setYear] = useState(
    Math.min(Math.max(initial.year, resolvedEarliestYear), resolvedLatestYear),
  );
  const [month, setMonth] = useState(initial.month);
  const [day, setDay] = useState(initial.day);
  const [yearPage, setYearPage] = useState(0);

  const totalDays = daysInMonth(year, month);
  const safeDay = Math.min(day, totalDays);
  const firstWeekday = new Date(year, month - 1, 1).getDay();

  const windowEnd = resolvedLatestYear - YEARS_PER_PAGE * yearPage;
  const yearOptions = Array.from({ length: YEARS_PER_PAGE }, (_, i) => windowEnd - i)
    .filter((y) => y >= resolvedEarliestYear)
    .reverse();

  const selectedDate = new Date(year, month - 1, safeDay);
  const isSelectedDisabled = isDateDisabled(selectedDate);
  const isDayOptionDisabled = (candidate) => isDateDisabled(new Date(year, month - 1, candidate));

  return (
    <PopupPortal>
      <Backdrop onClick={onClose}>
        <Card onClick={(event) => event.stopPropagation()}>
          <CloseButton type="button" aria-label="닫기" onClick={onClose}>
            ✕
          </CloseButton>
          <Title>{title}</Title>
          {guide && <Guide>{guide}</Guide>}

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
                  disabled={windowEnd - YEARS_PER_PAGE < resolvedEarliestYear}
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
                  disabled={isDayOptionDisabled(option)}
                  onClick={() => setDay(option)}
                >
                  {option}
                </OptionButton>
              ))}
            </Grid>
          )}

          {isSelectedDisabled && disabledNotice && <Notice>{disabledNotice}</Notice>}

          <ConfirmButton
            type="button"
            disabled={isSelectedDisabled}
            onClick={() => onConfirm(`${year}-${pad(month)}-${pad(safeDay)}`)}
          >
            확인
          </ConfirmButton>
        </Card>
      </Backdrop>
    </PopupPortal>
  );
}

export default DatePickerModal;
