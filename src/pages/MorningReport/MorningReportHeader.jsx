import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import calendarIcon from '../../assets/calendar.png';
import closeIcon from '../../assets/journal/close.png';

const HeaderWrap = styled.div`
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
`;

const TopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 46px;
  padding: 0 6px;
`;

// 다른 화면(건강일지·주간 리포트)과 같은 40px 닫기 아이콘으로 맞춘다.
// 여기만 살구색 '뒤로가기' 알약 버튼이라 화면을 옮길 때마다 위치가 달라 보였다.
const BackButton = styled.button`
  width: 40px;
  height: 40px;
  flex-shrink: 0;
`;

const BackIcon = styled.img`
  width: 40px;
  height: 40px;
  object-fit: contain;
`;

const CalendarButton = styled.button`
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: #fff8ed;
`;

const CalendarImage = styled.img`
  width: 38px;
  height: 38px;
  object-fit: contain;
  pointer-events: none;
`;

const MonthNav = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  width: 100%;
`;

const YearLabel = styled.p`
  margin: 0;
  font-family: 'Jua', sans-serif;
  font-size: 46px;
  color: #4a3a2f;
`;

const MonthRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 40px;
  width: 100%;
`;

const MonthArrow = styled.button`
  font-family: 'Noto Sans KR', sans-serif;
  font-weight: 700;
  font-size: 22px;
  color: #4a3a2f;
`;

const MonthLabel = styled.p`
  margin: 0;
  font-family: 'Jua', sans-serif;
  font-size: 34px;
  color: #4a3a2f;
`;

function MorningReportHeader({ year, month, onPrevMonth, onNextMonth, onOpenPicker }) {
  const navigate = useNavigate();

  return (
    <HeaderWrap>
      <TopRow>
        <BackButton type="button" aria-label="닫기" onClick={() => navigate('/home')}>
          <BackIcon src={closeIcon} alt="" />
        </BackButton>
        <CalendarButton type="button" aria-label="연월 빠른 이동" onClick={onOpenPicker}>
          <CalendarImage src={calendarIcon} alt="" />
        </CalendarButton>
      </TopRow>
      <MonthNav>
        <YearLabel>{year}</YearLabel>
        <MonthRow>
          <MonthArrow type="button" aria-label="이전 달" onClick={onPrevMonth}>
            ‹
          </MonthArrow>
          <MonthLabel>{month}월</MonthLabel>
          <MonthArrow type="button" aria-label="다음 달" onClick={onNextMonth}>
            ›
          </MonthArrow>
        </MonthRow>
      </MonthNav>
    </HeaderWrap>
  );
}

export default MorningReportHeader;
