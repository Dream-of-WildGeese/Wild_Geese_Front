import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import back from '../../../assets/onboarding/back.svg';
import AddHealthCheck from './AddHealthCheck';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

const MOCK_HEALTH_CHECKS = {
  me: {
    name: '나',
    upcoming: {
      title: '일반검진 (국가건강검진)',
      date: '9월 15일',
      hospital: '온담 종합병원',
      daysLeft: 12,
      type: '일반검진',
    },
    past: [
      {
        date: '8월 20일',
        type: '일반검진',
        daysAgo: 28,
      },
      {
        date: '6월 15일',
        type: '일반검진',
        daysAgo: 94,
      },
    ],
    changes: [
      '진료 때 미처 확인하지 못했던 점을 잘 갔음',
      '어지럼증은 8월 3일부터 지속되고 있다',
      '두통이 있었던 날은 대부분 어지럼증도 함께 있었다',
      '손발 저림은 8월 중순부터 새롭게 나타나기 시작했다',
      '눈이 침침하다고 하신 날은 두통이 있었던 날과 겹쳐있었다',
      '8월 8일부터 최근 2주간 미세한 허리통증을 얘기하셨어요',
    ],
  },
  family: {
    name: '엄마',
    upcoming: {
      title: '일반검진 (국가건강검진)',
      date: '9월 15일',
      hospital: '온담 종합병원',
      daysLeft: 12,
      type: '일반검진',
    },
    past: [
      {
        date: '8월 20일',
        type: '일반검진',
        daysAgo: 28,
      },
      {
        date: '6월 15일',
        type: '일반검진',
        daysAgo: 94,
      },
    ],
    changes: [
      '진료 때 미처 확인하지 못했던 점이 있었어요',
      '어지럼증은 8월 3일부터 지속되고 있다고 해요',
      '두통이 있었던 날은 대부분 어지럼증도 함께 있었어요',
      '손발 저림은 8월 중순부터 새롭게 나타났어요',
      '눈이 침침하다고 한 날과 두통이 있었던 날이 겹쳤어요',
      '최근 2주간 미세한 허리통증을 이야기했어요',
    ],
  },
};


const HealthCheck = () => {
  const navigate = useNavigate();
  const [person, setPerson] = useState('me');
  const [showAddModal, setShowAddModal] = useState(false);

  const today = useMemo(() => new Date(2026, 8, 15), []);
  const year = today.getFullYear();
  const month = today.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarDays = [];

  for (let i = 0; i < firstDay; i += 1) {
    calendarDays.push(null);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    calendarDays.push(day);
  }

  const current = MOCK_HEALTH_CHECKS[person];

  return (
    <Page>
      <Content>
        <Header>
          <BackButton
            type="button"
            onClick={() => navigate('/home')}
            aria-label="뒤로가기"
          >
            <BackIcon src={back} alt="" />
          </BackButton>
          <HeaderTitle>건강검진</HeaderTitle>
          <HeaderSpacer />
        </Header>

        <ToggleWrap>
          <ToggleButton
            type="button"
            $active={person === 'me'}
            $variant="me"
            onClick={() => setPerson('me')}
          >
            나
          </ToggleButton>

          <ToggleButton
            type="button"
            $active={person === 'family'}
            $variant="family"
            onClick={() => setPerson('family')}
          >
            엄마
          </ToggleButton>
        </ToggleWrap>

        <CalendarCard>
          <CalendarHeader>
            <MonthTitle>
              {month + 1}월
            </MonthTitle>
          </CalendarHeader>

          <WeekRow>
            {WEEKDAYS.map((day) => (
              <WeekDay key={day}>{day}</WeekDay>
            ))}
          </WeekRow>

          <CalendarGrid>
            {calendarDays.map((day, index) => (
              <CalendarCell key={`${day ?? 'empty'}-${index}`}>
                {day ? (
                  <DayButton
                    type="button"
                    $selected={day === 15}
                    $hasCheck={day === 15}
                  >
                    {day}
                  </DayButton>
                ) : null}
              </CalendarCell>
            ))}
          </CalendarGrid>
        </CalendarCard>

        <SectionTitle>지난 검진</SectionTitle>

        <PastList>
          {current.past.map((item) => (
            <PastCard key={`${item.date}-${item.type}`}>
              <PastCardTop>
                <PastDate>{item.date}</PastDate>
                <PastBadge>{item.daysAgo}일 전</PastBadge>
              </PastCardTop>

              <PastType>{item.type}</PastType>
            </PastCard>
          ))}
        </PastList>

        <UpcomingBanner>
          <UpcomingTitle>
            {current.name}의 다음 검진까지 D-{current.upcoming.daysLeft}
          </UpcomingTitle>

          <UpcomingMeta>
            {current.upcoming.date} · {current.upcoming.hospital} ·{' '}
            {current.upcoming.type}
          </UpcomingMeta>
        </UpcomingBanner>

        <SectionTitle>다가오는 검진</SectionTitle>

        <UpcomingCard>
          <UpcomingCardTitle>
            {current.upcoming.title}
          </UpcomingCardTitle>

          <UpcomingInfoRow>
            <InfoChip>{current.upcoming.date}</InfoChip>
            <InfoChip>{current.upcoming.hospital}</InfoChip>
          </UpcomingInfoRow>
        </UpcomingCard>

        <SectionTitle>그동안의 기록에서 찾은 변화</SectionTitle>

        <InsightCard>
          <InsightIntro>
            {current.name}의 최근 건강기록에서 눈에 띄는 변화예요.
          </InsightIntro>

          <InsightList>
            {current.changes.map((item) => (
              <InsightItem key={item}>
                <InsightDot />
                <InsightText>{item}</InsightText>
              </InsightItem>
            ))}
          </InsightList>
        </InsightCard>

        <AddButton
        type="button"
        onClick={() => setShowAddModal(true)}
        >
        + 검진 일정 추가하기
        </AddButton>
        {showAddModal && (
            <AddHealthCheck
                onClose={() => setShowAddModal(false)}
                onSave={(data) => {
                console.log(data);
                setShowAddModal(false);
                }}
            />
            )}
      </Content>
    </Page>
  );
};

export default HealthCheck;

const Page = styled.div`
  width: 100%;
  height: 100%;
  overflow-y: auto;
  background: #fff8ed;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const Content = styled.div`
  max-width: 402px;
  min-height: 100%;
  margin: 0 auto;
  padding: 28px 16px 28px;
  box-sizing: border-box;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const BackButton = styled.button`
  width: 36px;
  height: 36px;
  padding: 0;

  border: none;
  background: transparent;

  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;
`;

const BackIcon = styled.img`
  width: 28px;
  height: 28px;
`;

const HeaderTitle = styled.h1`
  margin: 0;

  color: #4a3a2f;
  font-family: 'Noto Sans KR';
  font-size: 18px;
  font-weight: 700;
`;

const HeaderSpacer = styled.div`
  width: 36px;
`;

const ToggleWrap = styled.div`
  display: flex;
  gap: 6px;
  margin-bottom: 14px;
`;

const ToggleButton = styled.button`
  flex: 1;
  height: 38px;

  border-radius: 11px;

  border: 1.5px solid
    ${({ $variant }) =>
      $variant === 'me' ? '#e6c5b6' : '#ece4aa'};

  background: ${({ $active }) => ($active ? '#fff' : '#faf8f2')};

  color: ${({ $variant, $active }) =>
    $variant === 'me'
      ? $active
        ? '#bc7256'
        : '#bba092'
      : $active
        ? '#aa8e37'
        : '#b8ad81'};

  font-family: 'Noto Sans KR';
  font-size: 13px;
  font-weight: 700;

  cursor: pointer;
`;

const CalendarCard = styled.div`
  padding: 14px 12px;
  border: 1px solid #e6dfd5;
  border-radius: 14px;
  background: #fffdf8;
`;

const CalendarHeader = styled.div`
  margin-bottom: 10px;
`;

const MonthTitle = styled.p`
  margin: 0;
  color: #4a3a2f;
  font-size: 16px;
  font-weight: 700;
`;

const WeekRow = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 6px;
`;

const WeekDay = styled.div`
  text-align: center;
  color: #9b9389;
  font-size: 10px;
  font-weight: 500;
`;

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  row-gap: 4px;
`;

const CalendarCell = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 26px;
`;

const DayButton = styled.button`
  width: 22px;
  height: 22px;
  padding: 0;

  border: none;
  border-radius: 50%;

  background: ${({ $selected }) =>
    $selected ? '#d37a54' : 'transparent'};

  color: ${({ $selected }) =>
    $selected ? '#fff' : '#6f675f'};

  font-size: 9px;
  font-weight: 500;

  cursor: pointer;
`;

const SectionTitle = styled.h2`
  margin: 18px 0 8px;

  color: #4a3a2f;
  font-size: 13px;
  font-weight: 700;
`;

const PastList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const PastCard = styled.div`
  padding: 12px 14px;

  border: 1px solid #ece6dd;
  border-radius: 10px;

  background: #fffdf8;
`;

const PastCardTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const PastDate = styled.span`
  color: #4a3a2f;
  font-size: 11px;
  font-weight: 700;
`;

const PastBadge = styled.span`
  padding: 3px 8px;
  border-radius: 999px;
  background: #f8e9dc;
  color: #c97653;
  font-size: 9px;
  font-weight: 600;
`;

const PastType = styled.p`
  margin: 8px 0 0;

  color: #8a8178;
  font-size: 10px;
`;

const UpcomingBanner = styled.div`
  margin-top: 12px;
  padding: 11px 12px;

  border-radius: 10px;
  background: #fff0cb;
`;

const UpcomingTitle = styled.p`
  margin: 0;

  color: #d27c4d;
  font-size: 12px;
  font-weight: 700;
`;

const UpcomingMeta = styled.p`
  margin: 4px 0 0;

  color: #8b8174;
  font-size: 9px;
`;

const UpcomingCard = styled.div`
  padding: 12px 14px;

  border: 1px solid #e8e0d7;
  border-radius: 10px;

  background: #fffdf8;
`;

const UpcomingCardTitle = styled.p`
  margin: 0;

  color: #4a3a2f;
  font-size: 11px;
  font-weight: 700;
`;

const UpcomingInfoRow = styled.div`
  display: flex;
  gap: 6px;
  margin-top: 8px;
`;

const InfoChip = styled.span`
  padding: 5px 8px;

  border-radius: 6px;
  background: #f7f3eb;

  color: #6f675f;
  font-size: 9px;
`;

const InsightCard = styled.div`
  padding: 14px;

  border: 1px solid #e8e0d7;
  border-radius: 10px;
  background: #fffdf8;
`;

const InsightIntro = styled.p`
  margin: 0 0 10px;

  color: #6e655d;
  font-size: 10px;
  line-height: 1.5;
`;

const InsightList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 7px;
`;

const InsightItem = styled.div`
  display: flex;
  gap: 6px;
  align-items: flex-start;
`;

const InsightDot = styled.span`
  width: 3px;
  height: 3px;
  margin-top: 6px;

  flex-shrink: 0;

  border-radius: 50%;
  background: #d27b54;
`;

const InsightText = styled.p`
  margin: 0;

  color: #6f675f;
  font-size: 10px;
  line-height: 1.5;
`;

const AddButton = styled.button`
  width: 100%;
  height: 42px;
  margin-top: 12px;

  border: 1.5px solid #d77e59;
  border-radius: 10px;

  background: #fffdf8;
  color: #d77e59;

  font-size: 11px;
  font-weight: 700;

  cursor: pointer;
`;