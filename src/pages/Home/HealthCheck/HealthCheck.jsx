import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import back from '../../../assets/onboarding/back.svg';
import AddHealthCheck from './AddHealthCheck';
import { useFamilyRelation } from '../../../hooks/useFamilyRelation';
import { useApi, useApiAction } from '../../../hooks/useApi';
import { getCheckups, deleteCheckup } from '../../../api/checkup';
import { getMyFamily } from '../../../api/family';
import { getUserId } from '../../../api/client';
import { useAppData } from '../../../store/AppDataContext';
import aiIcon from '../../../assets/journal/ai.png';
import trashBin from '../../../assets/trash_bin.svg';
import DatePickerModal from '../../../components/DatePickerModal';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

const formatMonthDay = (dateString) => {
  if (!dateString) return '';
  const [, month, day] = dateString.split('-').map(Number);
  return `${month}월 ${day}일`;
};

const getSubjectWithJosa = (name) => {
  if (!name) return '';
  const lastChar = name.charCodeAt(name.length - 1);
  if (lastChar < 0xac00 || lastChar > 0xd7a3) return `${name}이(가)`;
  const hasBatchim = (lastChar - 0xac00) % 28 > 0;
  return `${name}${hasBatchim ? '이' : '가'}`;
};

const getInsightSubTitle = (person, partnerLabel) => {
  if (person === 'me') {
    return '내가 매일 남긴 건강일지에서 찾은 패턴이에요';
  }

  const name = partnerLabel || '엄마';
  const subject = getSubjectWithJosa(name);
  const isHonorific = ['엄마', '아빠'].includes(name);
  const verb = isHonorific ? '남기신' : '남긴';

  return `${subject} 매일 ${verb} 건강일지에서 찾은 패턴이에요`;
};

const HealthCheck = () => {
  const navigate = useNavigate();
  // 1. 기본 탭을 'me'(나)로 시작
  const [person, setPerson] = useState('me'); 
  const [showAddModal, setShowAddModal] = useState(false);
  const { partnerLabel } = useFamilyRelation();
  const { data: appData } = useAppData();

  // 2. 가족 목록 조회
  const { data: familyData } = useApi(getMyFamily);

  // 3. getUserId()를 통해 현재 유저와 상대방 ID 분리
  const currentMyId = getUserId();
  const partnerMember = (familyData?.members || []).find(
    (member) => String(member.userId) !== String(currentMyId)
  );

  const partnerUserId =
    partnerMember?.userId ||
    appData?.family?.partnerUserId ||
    appData?.family?.connectedUserId ||
    appData?.family?.userId;

  // '나' 선택 시 undefined (내 검진), '가족' 선택 시 상대방 userId
  const targetId = person === 'family' ? partnerUserId : undefined;

  // 4. useApi 규격에 맞게 args 전달 (targetId 변경 시 자동 재조회)
  const { data: checkupData, refetch } = useApi(getCheckups, {
    args: targetId ? [targetId] : [],
  });

  // 5. 검진 삭제 액션
  const { execute: removeCheckup, loading: deleting } = useApiAction(deleteCheckup);

  // 연/월 직접 선택 팝업 열림 상태
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);

  // 연/월 선택 완료 시 캘린더 이동
  const handleJumpDate = (selectedDateStr) => {
    if (!selectedDateStr) return;
    const [y, m] = selectedDateStr.split('-').map(Number);
    setCurrentDate(new Date(y, m - 1, 1));
    setIsMonthPickerOpen(false);
  };

  const handleDelete = async (checkupId) => {
    if (!window.confirm('검진 일정을 삭제하시겠어요?')) return;
    const { ok, error } = await removeCheckup(checkupId);
    if (!ok) {
      alert(error.message || '삭제에 실패했어요.');
      return;
    }
    alert('검진 일정이 삭제되었어요.');
    refetch();
  };

  const displayName = person === 'me' ? '나' : partnerLabel || '엄마';

  const upcoming = checkupData?.upcomingCheckup;
  const pastList = checkupData?.pastCheckups || [];
  const doctorQuestions = checkupData?.doctorQuestions || [];

  // =========================
  // 달력 월 이동 상태 (년, 월)
  // =========================
  const [currentDate, setCurrentDate] = useState(() => new Date(2026, 7, 1)); // 2026년 8월 기준

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const calendarDays = [];
  for (let i = 0; i < firstDayIndex; i += 1) calendarDays.push(null);
  for (let day = 1; day <= daysInMonth; day += 1) calendarDays.push(day);

  const checkupDaysInView = useMemo(() => {
    const daySet = new Set();
    const allCheckups = [];
    if (upcoming?.checkupDate) allCheckups.push(upcoming.checkupDate);
    pastList.forEach((p) => {
      if (p.checkupDate) allCheckups.push(p.checkupDate);
    });

    allCheckups.forEach((dateStr) => {
      const [y, m, d] = dateStr.split('-').map(Number);
      if (y === currentYear && m === currentMonth + 1) {
        daySet.add(d);
      }
    });

    return daySet;
  }, [upcoming, pastList, currentYear, currentMonth]);

  return (
    <Page>
      <Content>
        <BackButton
          type="button"
          onClick={() => navigate('/home')}
          aria-label="뒤로가기"
        >
          <BackIcon src={back} alt="뒤로가기" />
        </BackButton>

        <HeaderArea>
          <HeaderTitle>건강검진</HeaderTitle>
        </HeaderArea>
        <HeaderDivider />

        <ScrollArea>
          {/* 나 / 가족 탭 토글 */}
          <ToggleWrap>
            <ToggleButton
              type="button"
              $active={person === 'me'}
              $type="me"
              onClick={() => setPerson('me')}
            >
              나
            </ToggleButton>
            <ToggleButton
              type="button"
              $active={person === 'family'}
              $type="family"
              onClick={() => setPerson('family')}
            >
              {partnerLabel || '엄마'}
            </ToggleButton>
          </ToggleWrap>

          {/* 달력 카드 */}
          <CalendarCard>
            <CalendarNavHeader>
              <NavArrowButton type="button" onClick={handlePrevMonth} aria-label="이전 달">
                ‹
              </NavArrowButton>

              <MonthTitleButton
                type="button"
                onClick={() => setIsMonthPickerOpen(true)}
              >
                <span>{currentYear}년 {currentMonth + 1}월</span>
                <DownArrowIcon viewBox="0 0 24 24">
                  <polyline points="6 9 12 15 18 9" />
                </DownArrowIcon>
              </MonthTitleButton>

              <NavArrowButton type="button" onClick={handleNextMonth} aria-label="다음 달">
                ›
              </NavArrowButton>
            </CalendarNavHeader>

            <WeekRow>
              {WEEKDAYS.map((day) => (
                <WeekDay key={day}>{day}</WeekDay>
              ))}
            </WeekRow>
            <CalendarGrid>
              {calendarDays.map((day, index) => {
                const hasCheckup = day ? checkupDaysInView.has(day) : false;
                return (
                  <CalendarCell key={`${day ?? 'empty'}-${index}`}>
                    {day ? (
                      <DayButton
                        type="button"
                        $selected={hasCheckup}
                      >
                        {day}
                      </DayButton>
                    ) : null}
                  </CalendarCell>
                );
              })}
            </CalendarGrid>
          </CalendarCard>

          {isMonthPickerOpen && (
            <DatePickerModal
              value={`${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`}
              title="연/월 선택"
              onConfirm={handleJumpDate}
              onClose={() => setIsMonthPickerOpen(false)}
            />
          )}

          {/* 다음 검진 배너 */}
          {upcoming ? (
            <UpcomingBanner>
              <UpcomingBannerTitle>
                {displayName}의 다음 검진까지 D-{upcoming.dDay}
              </UpcomingBannerTitle>
              <UpcomingBannerMeta>
                {formatMonthDay(upcoming.checkupDate)} · {upcoming.hospitalName} · {upcoming.checkupType}
              </UpcomingBannerMeta>
            </UpcomingBanner>
          ) : (
            <EmptyBanner>예정된 다음 검진 일정이 없어요</EmptyBanner>
          )}

          {/* 지난 검진 섹션 */}
          <SectionTitle>지난 검진</SectionTitle>
          <PastList>
            {pastList.length > 0 ? (
              pastList.map((item) => (
                <PastCard key={item.checkupId}>
                  <PastInfoGroup>
                    <PastDate>{formatMonthDay(item.checkupDate)}</PastDate>
                    <PastType>{item.checkupType}</PastType>
                  </PastInfoGroup>
                  <PastBadge>{item.relativeTime}</PastBadge>
                </PastCard>
              ))
            ) : (
              <EmptyCardText>지난 검진 기록이 없어요</EmptyCardText>
            )}
          </PastList>

          {/* 다가오는 검진 섹션 */}
          <SectionTitle>다가오는 검진</SectionTitle>
          {upcoming ? (
            <UpcomingCard>
              <UpcomingCardHeader>
                <UpcomingCardTitle>
                  {person === 'family' ? `${displayName}의 ` : ''}
                  {upcoming.checkupType}
                </UpcomingCardTitle>
                <DeleteIconButton
                  type="button"
                  aria-label="삭제"
                  disabled={deleting}
                  onClick={() => handleDelete(upcoming.checkupId)}
                >
                  <TrashIcon src={trashBin} alt="삭제" />
                </DeleteIconButton>
              </UpcomingCardHeader>
              <ChipGroup>
                <InfoChip>{formatMonthDay(upcoming.checkupDate)}</InfoChip>
                <InfoChip>{upcoming.hospitalName}</InfoChip>
              </ChipGroup>
            </UpcomingCard>
          ) : (
            <EmptyCardText>다가오는 검진 일정이 없어요</EmptyCardText>
          )}

          {/* 그동안의 기록에서 찾은 변화 섹션 */}
          <SectionTitle>그동안의 기록에서 찾은 변화</SectionTitle>
          <InsightCard>
            <InsightHeader>
              <SparkleIcon src={aiIcon} alt="AI 분석" />
              <InsightHeaderTextGroup>
                <InsightMainTitle>
                  진료 때 이런 걸 여쭤보시면 좋을 것 같아요
                </InsightMainTitle>
                <InsightSubTitle>
                  {getInsightSubTitle(person, partnerLabel)}
                </InsightSubTitle>
              </InsightHeaderTextGroup>
            </InsightHeader>

            <InsightList>
              {doctorQuestions.length > 0 ? (
                doctorQuestions.map((q, idx) => (
                  <InsightItem key={idx}>
                    <InsightBullet>•</InsightBullet>
                    <InsightText>{q}</InsightText>
                  </InsightItem>
                ))
              ) : (
                <InsightText style={{ textAlign: 'center', marginTop: '6px' }}>
                  아직 분석된 진료 질문이 없어요.
                </InsightText>
              )}
            </InsightList>
          </InsightCard>

          {/* 하단 검진 일정 추가하기 버튼 */}
          <AddButtonArea>
            <AddButton
              type="button"
              onClick={() => setShowAddModal(true)}
            >
              + 검진 일정 추가하기
            </AddButton>
          </AddButtonArea>
        </ScrollArea>

        {showAddModal && (
          <AddHealthCheck
            onClose={() => setShowAddModal(false)}
            onSuccess={() => {
              setShowAddModal(false);
              refetch();
            }}
          />
        )}
      </Content>
    </Page>
  );
};

export default HealthCheck;

/* =========================
   Layout & Typography
========================= */

const Page = styled.div`
  width: 100%;
  height: 100%;
  background: #FFF8ED;
  display: flex;
  justify-content: center;
`;

const Content = styled.div`
  position: relative;
  width: 100%;
  max-width: 402px;
  height: 100%;
  margin: 0 auto;
  box-sizing: border-box;
  padding: 86px 20px 24px;
  display: flex;
  flex-direction: column;
`;

const BackButton = styled.button`
  position: absolute;
  top: 35px;
  left: 20px;
  z-index: 10;
  width: 40px;
  height: 40px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const BackIcon = styled.img`
  width: 38px;
  height: 38px;
`;

const HeaderArea = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 14px;
`;

const HeaderTitle = styled.h1`
  margin: 0;
  color: #4A3A2F;
  font-family: Jua, sans-serif;
  font-size: 38px;
  font-weight: 400;
  line-height: 1;
`;

const HeaderDivider = styled.div`
  width: 100%;
  border-bottom: 1.5px dashed rgba(74, 58, 47, 0.25);
  margin-bottom: 18px;
`;

const ScrollArea = styled.div`
  flex: 1;
  overflow-y: auto;
  min-height: 0;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const ToggleWrap = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
`;

const ToggleButton = styled.button`
  flex: 1;
  height: 48px;
  border-radius: 14px;
  box-sizing: border-box;
  border: 1.5px solid
    ${({ $type }) =>
      $type === 'me'
        ? 'rgba(215, 169, 155, 0.85)'
        : 'rgba(216, 196, 114, 0.9)'};
  background: ${({ $active, $type }) =>
    $active
      ? $type === 'me'
        ? '#FFF5F0'
        : '#EFE3A5'
      : '#FFFDF9'};
  color: ${({ $type }) =>
    $type === 'me' ? '#9E6A5A' : '#4A3A2F'};
  font-family: Jua, sans-serif;
  font-size: 22px;
  font-weight: 400;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;

  &:active {
    transform: scale(0.98);
  }
`;

/* =========================
   Calendar Card (네비게이션 포함)
========================= */

const CalendarCard = styled.div`
  padding: 16px 16px 18px;
  border: 1.3px solid rgba(74, 58, 47, 0.35);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.75);
  margin-bottom: 16px;
`;

const CalendarNavHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  padding: 0 4px;
`;

const MonthTitle = styled.h3`
  margin: 0;
  color: #4A3A2F;
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 17px;
  font-weight: 800;
`;

const NavArrowButton = styled.button`
  border: none;
  background: transparent;
  color: #8C8780;
  font-size: 22px;
  font-weight: 700;
  cursor: pointer;
  padding: 0 6px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.15s ease;

  &:hover {
    color: #4A3A2F;
  }
`;

const WeekRow = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 10px;
`;

const WeekDay = styled.div`
  text-align: center;
  color: #A79C8E;
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 13px;
  font-weight: 500;
`;

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  row-gap: 8px;
`;

const CalendarCell = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 32px;
`;

const DayButton = styled.button`
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  border-radius: 12px;
  background: ${({ $selected }) => ($selected ? '#DDD39A' : 'transparent')};
  color: #4A3A2F;
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 14px;
  font-weight: ${({ $selected }) => ($selected ? '800' : '500')};
  cursor: pointer;
  transition: background 0.15s ease;
`;

/* =========================
   Upcoming Banner
========================= */

const UpcomingBanner = styled.div`
  padding: 14px 16px;
  border-radius: 16px;
  border: 1.3px solid rgba(74, 58, 47, 0.3);
  background: #EFF4D4;
  margin-bottom: 22px;
`;

const UpcomingBannerTitle = styled.p`
  margin: 0;
  color: #3B6B38;
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 16px;
  font-weight: 800;
`;

const UpcomingBannerMeta = styled.p`
  margin: 4px 0 0;
  color: #4A3A2F;
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 13px;
  font-weight: 500;
`;

const EmptyBanner = styled.div`
  padding: 14px 16px;
  border-radius: 16px;
  border: 1.3px dashed rgba(74, 58, 47, 0.3);
  background: rgba(255, 255, 255, 0.6);
  color: #8C8780;
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 14px;
  text-align: center;
  margin-bottom: 22px;
`;

/* =========================
   Sections & Cards
========================= */

const SectionTitle = styled.h2`
  margin: 0 0 10px 2px;
  color: #8C8780;
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 14px;
  font-weight: 700;
`;

const PastList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 22px;
`;

const PastCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-radius: 16px;
  border: 1.3px solid rgba(74, 58, 47, 0.35);
  background: rgba(255, 255, 255, 0.75);
`;

const PastInfoGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const PastDate = styled.span`
  color: #4A3A2F;
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 15px;
  font-weight: 800;
`;

const PastType = styled.span`
  color: #8C8780;
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 14px;
  font-weight: 500;
`;

const PastBadge = styled.span`
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid #E8A79B;
  background: #FEECE9;
  color: #D25C4D;
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 11px;
  font-weight: 700;
`;

const UpcomingCard = styled.div`
  padding: 16px;
  border-radius: 18px;
  border: 1.3px solid rgba(74, 58, 47, 0.35);
  background: rgba(255, 255, 255, 0.75);
  margin-bottom: 22px;
`;

const UpcomingCardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
`;

const UpcomingCardTitle = styled.h3`
  margin: 0;
  color: #4A3A2F;
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 16px;
  font-weight: 800;
`;

const DeleteIconButton = styled.button`
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.6;
  transition: opacity 0.15s ease;

  &:hover {
    opacity: 1;
  }
`;

const TrashIcon = styled.img`
  width: 30px;
  height: 30px;
  object-fit: contain;
`;

const ChipGroup = styled.div`
  display: flex;
  gap: 8px;
`;

const InfoChip = styled.span`
  padding: 6px 14px;
  border-radius: 12px;
  background: rgba(237, 230, 218, 0.65);
  color: #4A3A2F;
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 13px;
  font-weight: 600;
`;

const EmptyCardText = styled.p`
  margin: 0;
  padding: 16px;
  text-align: center;
  color: #A79C8E;
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 14px;
  border: 1.3px dashed rgba(74, 58, 47, 0.25);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.45);
  margin-bottom: 22px;
`;

/* =========================
   Insight Card
========================= */

const InsightCard = styled.div`
  padding: 18px 16px;
  border-radius: 18px;
  border: 1.3px solid rgba(138, 123, 62, 0.45);
  background: rgba(246, 243, 222, 0.75);
  margin-bottom: 22px;
`;

const InsightHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 14px;
`;

const SparkleIcon = styled.img`
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  object-fit: contain;
  margin-top: 2px;
`;

const InsightHeaderTextGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const InsightMainTitle = styled.h4`
  margin: 0;
  color: #4A3A2F;
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 15px;
  font-weight: 800;
  line-height: 1.4;
`;

const InsightSubTitle = styled.p`
  margin: 3px 0 0;
  color: #8C8780;
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 12px;
  font-weight: 500;
`;

const InsightList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const InsightItem = styled.li`
  display: flex;
  align-items: flex-start;
  gap: 6px;
`;

const InsightBullet = styled.span`
  color: #8FA248;
  font-size: 16px;
  line-height: 1.3;
`;

const InsightText = styled.span`
  color: #4A3A2F;
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.5;
`;

/* =========================
   Bottom Button
========================= */

const AddButtonArea = styled.div`
  padding: 6px 0 16px;
`;

const AddButton = styled.button`
  width: 100%;
  height: 56px;
  border-radius: 16px;
  border: 1.5px solid rgba(74, 58, 47, 0.55);
  background: #CBD879;
  color: #4A3A2F;
  font-family: Jua, sans-serif;
  font-size: 19px;
  font-weight: 400;
  cursor: pointer;
  transition: transform 0.1s ease;

  &:active {
    transform: translateY(1px);
  }
`;

const MonthTitleButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #4A3A2F;
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 17px;
  font-weight: 800;
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover {
    background: rgba(74, 58, 47, 0.06);
  }
`;

const DownArrowIcon = styled.svg`
  width: 14px;
  height: 14px;
  fill: none;
  stroke: #8C8780;
  stroke-width: 2.5;
`;