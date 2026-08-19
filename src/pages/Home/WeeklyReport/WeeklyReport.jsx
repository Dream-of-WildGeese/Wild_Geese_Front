import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import closeIcon from '../../../assets/journal/close.png';
import cloudIcon from '../../../assets/weekly/cloud.png';
import checkIcon from '../../../assets/weekly/check.png';
import pencilIcon from '../../../assets/weekly/pencil.png';
import { loadWeeklyList } from './weeklyReportData';
import { useApi } from '../../../hooks/useApi';
import { useFamilyRelation } from '../../../hooks/useFamilyRelation';

// Figma 33_ver02 / ver04: 주간 리포트 목록.
// 월 칩은 필터가 아니라 그 달 구간으로 스크롤을 옮기는 점프다(레이어 이름 Month Jump Row).
const Page = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  box-sizing: border-box;

  padding: 16px 20px 28px;
  background: #fff8ed;

  display: flex;
  flex-direction: column;
  gap: 22px;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const CloseButton = styled.button`
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  align-self: flex-start;
`;

const CloseIcon = styled.img`
  width: 40px;
  height: 40px;
  object-fit: contain;
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
`;

const PageTitle = styled.h1`
  margin: 0;
  width: 100%;
  font-family: 'Jua';
  font-size: 40px;
  font-weight: 400;
  color: #4a3a2f;
  text-align: center;
`;

const PageSubtitle = styled.p`
  margin: 0;
  width: 100%;
  font-family: 'Noto Sans KR';
  font-size: 18px;
  font-weight: 700;
  color: #a79c8e;
  text-align: center;
`;

const TitleDivider = styled.div`
  width: 100%;
  margin-top: 10px;
  border-top: 1.5px dashed rgba(74, 58, 47, 0.3);
`;

const SectionDivider = styled.div`
  width: 100%;
  border-top: 2px dashed rgba(74, 58, 47, 0.35);
`;

const PersonToggle = styled.div`
  display: flex;
  gap: 4px;
  padding: 4px;
  border-radius: 16px;
  background: #f8f5ee;
`;

// 선택한 쪽은 살구색으로 채우고, 나머지는 노란 테두리만 남긴다.
const ToggleTab = styled.button`
  flex: 1;
  min-width: 0;
  height: 48px;
  border-radius: 12px;

  font-family: 'Noto Sans KR';
  font-size: 17px;
  font-weight: 700;

  border: 2px solid ${({ $active }) => ($active ? '#e6a794' : 'rgba(232, 205, 115, 0.7)')};
  background: ${({ $active }) => ($active ? 'rgba(230, 167, 148, 0.5)' : 'transparent')};
  color: ${({ $active }) => ($active ? '#c97158' : '#b9862e')};
`;

const ThisWeekCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;

  padding: 16px;
  border-radius: 18px;
  border: 3px solid rgba(143, 174, 74, 0.5);
  background: #edf2d4;
`;

const CloudIcon = styled.img`
  width: 50px;
  height: 50px;
  object-fit: contain;
`;

const ThisWeekText = styled.p`
  margin: 0;
  width: 100%;
  font-family: 'Noto Sans KR';
  font-size: 18px;
  font-weight: 500;
  color: #4a3a2f;
  text-align: center;
`;

const WeekRow = styled.button`
  width: 100%;
  padding: 16px;

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;

  border-radius: 18px;
  border: 1.5px solid rgba(74, 58, 47, 0.4);
  background: rgba(255, 255, 255, 0.55);
  text-align: left;
`;

const ContentCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: flex-start;
  min-width: 0;
`;

const TitleLine = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CheckIcon = styled.img`
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  object-fit: contain;
`;

const WeekLabel = styled.span`
  font-family: 'Noto Sans KR';
  font-size: 18px;
  font-weight: 700;
  color: #4a3a2f;
  white-space: nowrap;
`;

// 체크 아이콘 폭만큼 들여써서 주차 이름 아래에 맞춘다.
const DateRow = styled.div`
  display: flex;
  align-items: center;
  padding-left: 36px;
`;

const DateChip = styled.span`
  padding: 4px 10px;
  border-radius: 10px;
  border: 1px solid rgba(74, 58, 47, 0.35);
  background: rgba(255, 255, 255, 0.8);

  font-family: 'Noto Sans KR';
  font-size: 13px;
  font-weight: 700;
  color: #4a3a2f;
  white-space: nowrap;
`;

// 이번 주는 아직 쌓이는 중이라 색을 달리해서 완성된 주와 구분한다.
const Badge = styled.span`
  flex-shrink: 0;
  padding: 4px 12px;
  border-radius: 20px;
  background: ${({ $progress }) => ($progress ? '#f6ebc7' : '#cbd879')};
  border: ${({ $progress }) => ($progress ? '1px solid rgba(184, 134, 46, 0.5)' : 'none')};

  font-family: 'Noto Sans KR';
  font-size: 13px;
  font-weight: 700;
  color: ${({ $progress }) => ($progress ? '#a8761c' : '#3f5a1b')};
  white-space: nowrap;
`;

// 폭을 고정하고 왼쪽 정렬해야, 한 줄평 길이가 주마다 달라도 연필 아이콘이
// 항상 같은 자리에 온다(Figma는 오른쪽 정렬이라 짧은 한 줄평일수록 연필이
// 오락가락해서, 아이콘 기준으로 어긋나 보였다).
const EditLabel = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 6px;
  width: 167px;
  flex-shrink: 0;
`;

const PencilIcon = styled.img`
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  object-fit: contain;
`;

// 한 줄평이 길면 넘치는 만큼 말줄임으로 자른다.
const EditText = styled.span`
  min-width: 0;
  font-family: 'Noto Sans KR';
  font-size: 16px;
  font-weight: 700;
  color: #3f5a1b;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const MonthJumpRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const MonthChip = styled.button`
  padding: 8px 16px;
  border-radius: 18px;
  white-space: nowrap;

  font-family: 'Noto Sans KR';
  font-size: 15px;
  font-weight: ${({ $active }) => ($active ? 700 : 500)};

  border: 1px solid ${({ $active }) => ($active ? 'rgba(74, 58, 47, 0.25)' : '#e5e0d9')};
  background: ${({ $active }) => ($active ? '#f6ebc7' : '#fcf8ea')};
  color: ${({ $active }) => ($active ? '#4a3a2f' : '#a79c8e')};
`;

const MonthSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  scroll-margin-top: 16px;
`;

const MonthLabel = styled.p`
  margin: 0;
  width: 100%;
  font-family: 'Noto Sans KR';
  font-size: 15px;
  font-weight: 700;
  color: #a79c8e;
`;

const StatusText = styled.p`
  margin: 0;
  width: 100%;
  text-align: center;
  font-family: 'Noto Sans KR';
  font-size: 15px;
  color: #a79c8e;
`;

function WeeklyReport() {
  const navigate = useNavigate();
  const [person, setPerson] = useState('me');
  const { data, loading, error } = useApi(loadWeeklyList, { args: [person] });
  const { partnerLabel } = useFamilyRelation();

  const currentWeek = data?.current ?? null;
  const pastWeeks = useMemo(() => data?.past ?? [], [data]);

  // 최신 주가 위로 오도록 monthKey 내림차순으로 정렬한다.
  // 월 숫자로 정렬하면 12월 다음에 1월이 오는 연말 구간에서 순서가 뒤집힌다.
  const months = useMemo(() => {
    const seen = new Map();
    pastWeeks.forEach((week) => {
      if (!seen.has(week.monthKey)) seen.set(week.monthKey, week);
    });
    return [...seen.values()].sort((a, b) => b.monthKey - a.monthKey);
  }, [pastWeeks]);

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

  const sectionRefs = useRef({});
  const jumpToMonth = (key) => {
    setMonthKey(key);
    sectionRefs.current[key]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const openWeek = (weekId) =>
    navigate(`/home/weekly-report/${weekId}`, { state: { person } });

  return (
    <Page>
      <CloseButton type="button" aria-label="닫기" onClick={() => navigate('/home')}>
        <CloseIcon src={closeIcon} alt="" />
      </CloseButton>

      <Header>
        <PageTitle>주간 리포트</PageTitle>
        <PageSubtitle>
          {person === 'me'
            ? '매주 일요일에 새로운 리포트가 만들어져요!'
            : `${partnerLabel}의 리포트도 매주 일요일에 만들어져요!`}
        </PageSubtitle>
        <TitleDivider />
      </Header>

      <PersonToggle>
        <ToggleTab type="button" $active={person === 'me'} onClick={() => setPerson('me')}>
          나
        </ToggleTab>
        <ToggleTab type="button" $active={person !== 'me'} onClick={() => setPerson('mom')}>
          {partnerLabel}
        </ToggleTab>
      </PersonToggle>

      {loading && <StatusText>리포트를 불러오는 중이에요...</StatusText>}
      {error && <StatusText>{error.message}</StatusText>}

      {currentWeek && (
        <ThisWeekCard>
          <CloudIcon src={cloudIcon} alt="" />
          <ThisWeekText>
            {currentWeek.inProgress ? (
              <>
                이번 주는 아직 쌓이는 중이에요
                <br />
                눌러서 지금까지 기록을 볼 수 있어요
              </>
            ) : (
              <>
                온담과 한 주를 마무리하며
                <br />
                이번 주 일상을 살펴보세요!
              </>
            )}
          </ThisWeekText>

          <WeekRow type="button" onClick={() => openWeek(currentWeek.id)}>
            <ContentCol>
              <TitleLine>
                <CheckIcon src={checkIcon} alt="" />
                <WeekLabel>{currentWeek.label}</WeekLabel>
              </TitleLine>
              <DateRow>
                <DateChip>{currentWeek.range}</DateChip>
              </DateRow>
            </ContentCol>
            <Badge $progress={currentWeek.inProgress}>
              {currentWeek.inProgress ? '입력 중' : '이번 주'}
            </Badge>
          </WeekRow>
        </ThisWeekCard>
      )}

      {months.length > 0 && (
        <>
          <SectionDivider />
          <MonthJumpRow>
            {months.map((month) => (
              <MonthChip
                key={month.monthKey}
                type="button"
                $active={activeMonthKey === month.monthKey}
                onClick={() => jumpToMonth(month.monthKey)}
              >
                {month.monthLabel}
              </MonthChip>
            ))}
          </MonthJumpRow>
        </>
      )}

      {months.map((month, index) => (
        <MonthSection
          key={month.monthKey}
          ref={(node) => {
            sectionRefs.current[month.monthKey] = node;
          }}
        >
          {/* 맨 위 구간은 월 칩이 이미 어느 달인지 보여줘서 제목을 생략한다. */}
          {index > 0 && <MonthLabel>{month.monthLabel}</MonthLabel>}

          {weeksByMonth.get(month.monthKey).map((week) => (
            <WeekRow key={week.id} type="button" onClick={() => openWeek(week.id)}>
              <ContentCol>
                <TitleLine>
                  <CheckIcon src={checkIcon} alt="" />
                  <WeekLabel>{week.label}</WeekLabel>
                </TitleLine>
                <DateRow>
                  <DateChip>{week.range}</DateChip>
                </DateRow>
              </ContentCol>
              <EditLabel>
                <PencilIcon src={pencilIcon} alt="" />
                <EditText>{week.comment}</EditText>
              </EditLabel>
            </WeekRow>
          ))}
        </MonthSection>
      ))}
    </Page>
  );
}

export default WeeklyReport;
