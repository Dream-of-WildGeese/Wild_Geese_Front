import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import backIcon from '../../assets/onboarding/back.png';

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

// 다른 화면(건강일지·주간 리포트·건강검진)과 같은 뒤로가기 아이콘으로 맞춘다.
const BackButton = styled.button`
  width: 40px;
  height: 40px;
  flex-shrink: 0;
`;

const BackIcon = styled.img`
  width: 38px;
  height: 38px;
  object-fit: contain;
`;

// 뒤로가기 버튼과 균형을 맞추는 빈 자리. 없으면 버튼이 가운데로 밀린다.
const TopRowSpacer = styled.div`
  width: 40px;
  height: 40px;
  flex-shrink: 0;
`;

const MonthNav = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  width: 100%;
`;

// 연도·월을 눌러 연월 빠른 이동을 연다. 달력 아이콘을 따로 두면
// 누르는 곳이 화면 구석이라 눈에 잘 안 띄었다.
const YearLabel = styled.button`
  padding: 0 8px;
  font-family: 'Noto Sans KR', sans-serif;
  font-weight: 700;
  font-size: 30px;
  color: #a79c8e;
  line-height: 1.1;
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

const MonthLabel = styled.button`
  padding: 0 8px;
  font-family: 'Jua', sans-serif;
  font-size: 46px;
  color: #4a3a2f;
  line-height: 1.1;
`;

// 눌러서 옮길 수 있다는 걸 알려주는 한 줄
const JumpHint = styled.p`
  margin: 2px 0 0;
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 12px;
  color: #a79c8e;
`;

function MorningReportHeader({ year, month, onPrevMonth, onNextMonth, onOpenPicker }) {
  const navigate = useNavigate();

  return (
    <HeaderWrap>
      <TopRow>
        <BackButton type="button" aria-label="뒤로가기" onClick={() => navigate('/home')}>
          <BackIcon src={backIcon} alt="" />
        </BackButton>
        <TopRowSpacer />
      </TopRow>
      <MonthNav>
        <YearLabel type="button" aria-label="연월 빠른 이동" onClick={onOpenPicker}>
          {year}
        </YearLabel>
        <MonthRow>
          <MonthArrow type="button" aria-label="이전 달" onClick={onPrevMonth}>
            ‹
          </MonthArrow>
          <MonthLabel type="button" aria-label="연월 빠른 이동" onClick={onOpenPicker}>
            {month}월
          </MonthLabel>
          <MonthArrow type="button" aria-label="다음 달" onClick={onNextMonth}>
            ›
          </MonthArrow>
        </MonthRow>
        <JumpHint>연도나 달을 누르면 옮길 수 있어요</JumpHint>
      </MonthNav>
    </HeaderWrap>
  );
}

export default MorningReportHeader;
