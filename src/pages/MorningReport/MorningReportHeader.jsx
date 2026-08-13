import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import calendarIcon from '../../assets/calendar.png';

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

const BackButton = styled.button`
  display: flex;
  align-items: center;
  padding: 8px 22px;
  border-radius: 10px;
  background: rgba(253, 139, 119, 0.4);
  border: 1px solid #4a3a2f;
`;

const BackLabel = styled.span`
  font-family: 'Jua', sans-serif;
  font-size: 12px;
  color: #4a3a2f;
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
        <BackButton type="button" onClick={() => navigate('/')}>
          <BackLabel>뒤로가기</BackLabel>
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
