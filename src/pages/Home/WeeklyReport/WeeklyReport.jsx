import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import cloudIcon from '../../../assets/weekly/cloud.png';
import checkIcon from '../../../assets/weekly/check.png';
import { loadWeeklyList } from './weeklyReportData';
import { useApi } from '../../../hooks/useApi';
import { useLazyList } from '../../../hooks/useLazyList';
import { LoadingLine } from '../../../components/Loading';
import { useFamilyRelation } from '../../../hooks/useFamilyRelation';
import {
  PageFrame,
  PageContent,
  PageBack,
  PageHeader,
  PageTitle,
  PageCaption,
  PageDivider,
  PageScrollArea,
} from '../../../components/PageShell';

// Figma 33_ver02 / ver04: 주간 리포트 목록.
// 월 칩은 필터가 아니라 그 달 구간으로 스크롤을 옮기는 점프다(레이어 이름 Month Jump Row).
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

// 한 줄평은 연필 없이 오른쪽에 붙인다.
const EditLabel = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 167px;
  flex-shrink: 0;
`;

// 한 줄평이 길면 넘치는 만큼 말줄임으로 자른다.
const EditText = styled.span`
  min-width: 0;
  font-family: 'Noto Sans KR';
  font-size: 16px;
  font-weight: 700;
  color: #3f5a1b;
  text-align: right;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

// 월별 탭 없이 주차가 위에서 아래로 그냥 쌓인다.
const WeekList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const MoreSentinel = styled.div`
  width: 100%;
  height: 1px;
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

  // 월별 탭을 없앴다. 최근 주가 위로 오도록 한 줄로 쌓기만 한다.
  const pastWeeks = useMemo(
    () => [...(data?.past ?? [])].sort((a, b) => b.id.localeCompare(a.id)),
    [data],
  );

  // 지난 주가 쌓일수록 목록이 길어진다. 보이는 만큼만 그리고 바닥에서 이어 붙인다.
  const {
    visible: visibleWeeks,
    hasMore,
    sentinelRef,
  } = useLazyList(pastWeeks, { step: 8, resetKey: person });

  const openWeek = (weekId) =>
    navigate(`/home/weekly-report/${weekId}`, { state: { person } });

  return (
    <PageFrame>
      <PageContent>
        <PageBack onClick={() => navigate('/home')} />
        <PageHeader>
          <PageTitle $size={40}>주간 리포트</PageTitle>
          <PageCaption>
            {person === 'me'
              ? '매주 일요일에 새로운 리포트가 만들어져요!'
              : `매주 일요일에 ${partnerLabel}의 리포트도 만들어져요!`}
          </PageCaption>
        </PageHeader>
        <PageDivider />

        <PageScrollArea $gap={22}>
          <PersonToggle>
            <ToggleTab type="button" $active={person === 'me'} onClick={() => setPerson('me')}>
              나
            </ToggleTab>
            <ToggleTab type="button" $active={person !== 'me'} onClick={() => setPerson('mom')}>
              {partnerLabel}
            </ToggleTab>
          </PersonToggle>

          {loading && <LoadingLine>리포트를 불러오는 중이에요...</LoadingLine>}
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
                </ContentCol>
                <Badge $progress={currentWeek.inProgress}>
                  {currentWeek.inProgress ? '입력 중' : '이번 주'}
                </Badge>
              </WeekRow>
            </ThisWeekCard>
          )}

          {pastWeeks.length > 0 && (
            <>
              <SectionDivider />
              <WeekList>
                {visibleWeeks.map((week) => (
                  <WeekRow key={week.id} type="button" onClick={() => openWeek(week.id)}>
                    <ContentCol>
                      <TitleLine>
                        <CheckIcon src={checkIcon} alt="" />
                        <WeekLabel>{week.label}</WeekLabel>
                      </TitleLine>
                    </ContentCol>
                    {/* 한 주가 다 차지 않은 리포트는 한 줄평이 없다 */}
                    {week.comment && (
                      <EditLabel>
                        <EditText>{week.comment}</EditText>
                      </EditLabel>
                    )}
                  </WeekRow>
                ))}
                {/* 바닥에 닿으면 다음 묶음을 잇는다 */}
                {hasMore && <MoreSentinel ref={sentinelRef} />}
                {hasMore && (
                  <LoadingLine $compact $size={16}>더 불러오는 중이에요...</LoadingLine>
                )}
              </WeekList>
            </>
          )}
        </PageScrollArea>
      </PageContent>
    </PageFrame>
  );
}

export default WeeklyReport;
