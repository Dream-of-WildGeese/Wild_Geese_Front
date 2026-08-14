import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { loadWeeklyList } from './weeklyReportData';
import { useApi } from '../../../hooks/useApi';

const Page = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  background: #fff;
  padding: 16px 20px 30px;
  box-sizing: border-box;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const Title = styled.h1`
  margin: 0;
  font-size: 27px;
  font-weight: 600;
  color: #000;
`;

const Subtitle = styled.p`
  margin: 6px 0 0;
  font-size: 16px;
  color: #6b6661;
`;

const ToggleWrap = styled.div`
  display: flex;
  gap: 4px;
  height: 46px;
  padding: 4px;
  margin-top: 16px;
  border-radius: 12px;
  background: #f7f5f0;
`;

const ToggleTab = styled.button`
  flex: 1;
  border-radius: 9px;
  font-size: 15px;
  font-weight: ${({ $active }) => ($active ? 600 : 400)};
  color: ${({ $active }) => ($active ? '#000' : '#8c8780')};
  background: ${({ $active }) => ($active ? '#fff' : 'transparent')};
`;

const CurrentWeekCard = styled.div`
  margin-top: 36px;
  height: 96px;
  padding: 0 16px;
  border-radius: 14px;
  background: #fae5d9;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const CurrentWeekTextCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
  flex-shrink: 0;
`;

const CurrentWeekLabelRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const CurrentWeekLabel = styled.p`
  margin: 0;
  font-size: 21px;
  font-weight: 600;
  color: #e8734a;
  white-space: nowrap;
`;

const CurrentWeekBadge = styled.span`
  padding: 2px 8px;
  border-radius: 6px;
  background: #e8734a;
  color: #fff;
  font-size: 13px;
  font-weight: 500;
`;

const CurrentWeekRange = styled.p`
  margin: 0;
  font-size: 15px;
  color: #e8734a;
`;

const CurrentWeekDesc = styled.p`
  margin: 0;
  max-width: 150px;
  font-size: 13px;
  font-weight: 500;
  color: #e8734a;
  text-align: right;
  line-height: 1.35;
`;

// 라벨에 연도가 붙어 길어졌다. 개수가 늘어나도 한 줄로 밀리지 않게 감싼다.
const MonthJumpRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 20px;
`;

const MonthChip = styled.button`
  white-space: nowrap;
  padding: 8px 16px;
  border-radius: 18px;
  font-size: 14px;
  font-weight: 500;
  background: ${({ $active }) => ($active ? '#e8734a' : '#fff')};
  color: ${({ $active }) => ($active ? '#fff' : '#6b6661')};
  border: ${({ $active }) => ($active ? 'none' : '1px solid #e5e0d9')};
`;

const MonthLabel = styled.p`
  margin: 32px 0 16px;
  font-size: 15px;
  font-weight: 600;
  color: #8c8780;

  &:first-of-type {
    margin-top: 32px;
  }
`;

const WeekRow = styled.button`
  width: 100%;
  height: 78px;
  padding: 0 16px;
  margin-bottom: 8px;
  border-radius: 14px;
  background: #f7f5f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const WeekTextCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
  align-items: flex-start;
`;

const WeekLabel = styled.p`
  margin: 0;
  font-size: 19px;
  font-weight: 600;
  color: #000;
`;

const WeekRange = styled.p`
  margin: 0;
  font-size: 14px;
  color: #8c8780;
`;

const WeekMetaCol = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
`;

const WeekDesc = styled.span`
  font-size: 13px;
  font-weight: 500;
  color: #8c8780;
  text-align: right;
`;

const Chevron = styled.span`
  font-size: 20px;
  color: #8c8780;
`;

function WeeklyReport() {
  const navigate = useNavigate();
  const [person, setPerson] = useState('me');
  const { data, loading, error } = useApi(loadWeeklyList, { args: [person] });

  const currentWeek = data?.current ?? null;
  const pastWeeks = useMemo(() => data?.past ?? [], [data]);

  // 최신 주가 위로 오도록 monthKey 내림차순으로 정렬한다.
  // 월 숫자로 정렬하면 12월 다음에 1월이 오는 연말 구간에서 순서가 뒤집힌다.
  const months = useMemo(() => {
    const seen = new Map();
    [currentWeek, ...pastWeeks].filter(Boolean).forEach((week) => {
      if (!seen.has(week.monthKey)) seen.set(week.monthKey, week);
    });
    return [...seen.values()].sort((a, b) => b.monthKey - a.monthKey);
  }, [currentWeek, pastWeeks]);

  const [monthKey, setMonthKey] = useState(null);
  const activeMonthKey = monthKey ?? months[0]?.monthKey ?? null;

  const weeksByMonth = useMemo(() => {
    const map = new Map();
    pastWeeks.forEach((week) => {
      if (!map.has(week.monthKey)) map.set(week.monthKey, []);
      map.get(week.monthKey).push(week);
    });
    return map;
  }, [pastWeeks]);

  return (
    <Page>
      <Title>주간 리포트</Title>
      <Subtitle>{person === 'me' ? '매주 일요일에 새로운 리포트가 만들어져요' : '엄마의 리포트가 매주 일요일에 만들어져요'}</Subtitle>

      <ToggleWrap>
        <ToggleTab type="button" $active={person === 'me'} onClick={() => setPerson('me')}>
          나
        </ToggleTab>
        <ToggleTab type="button" $active={person === 'mom'} onClick={() => setPerson('mom')}>
          엄마
        </ToggleTab>
      </ToggleWrap>

      {currentWeek && (
        <CurrentWeekCard>
          <CurrentWeekTextCol>
            <CurrentWeekLabelRow>
              <CurrentWeekLabel>{currentWeek.label}</CurrentWeekLabel>
              <CurrentWeekBadge>이번 주</CurrentWeekBadge>
            </CurrentWeekLabelRow>
            <CurrentWeekRange>{currentWeek.range}</CurrentWeekRange>
          </CurrentWeekTextCol>
          <CurrentWeekDesc>{currentWeek.comment}</CurrentWeekDesc>
        </CurrentWeekCard>
      )}

      {loading && <MonthLabel>리포트를 불러오는 중이에요...</MonthLabel>}
      {error && <MonthLabel>{error.message}</MonthLabel>}
      {/* 가족 구성원은 최신 주차만 조회할 수 있어서 지난 주 목록이 없다 */}
      {data?.partnerOnly && !loading && <MonthLabel>가족은 최신 주 리포트만 볼 수 있어요</MonthLabel>}

      <MonthJumpRow>
        {months.map((m) => (
          <MonthChip
            key={m.monthKey}
            type="button"
            $active={activeMonthKey === m.monthKey}
            onClick={() => setMonthKey(m.monthKey)}
          >
            {m.monthLabel}
          </MonthChip>
        ))}
      </MonthJumpRow>

      {months
        .filter((m) => weeksByMonth.has(m.monthKey))
        .map((m) => (
          <div key={m.monthKey}>
            <MonthLabel>{m.monthLabel}</MonthLabel>
            {weeksByMonth.get(m.monthKey).map((week) => (
              <WeekRow
                key={week.id}
                type="button"
                onClick={() => navigate(`/home/weekly-report/${week.id}`, { state: { person } })}
              >
                <WeekTextCol>
                  <WeekLabel>{week.label}</WeekLabel>
                  <WeekRange>{week.range}</WeekRange>
                </WeekTextCol>
                <WeekMetaCol>
                  <WeekDesc>{week.comment}</WeekDesc>
                  <Chevron>›</Chevron>
                </WeekMetaCol>
              </WeekRow>
            ))}
          </div>
        ))}
    </Page>
  );
}

export default WeeklyReport;
