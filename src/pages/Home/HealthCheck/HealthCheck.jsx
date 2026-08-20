import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import AddHealthCheck from './AddHealthCheck';
import { useFamilyRelation } from '../../../hooks/useFamilyRelation';
import { useApi, useApiAction } from '../../../hooks/useApi';
import { getCheckups, getAllCheckups, deleteCheckup } from '../../../api/checkup';
import { getMyFamily } from '../../../api/family';
import { getDailyLog, getFamilyDailyLog } from '../../../api/daily';
import { getUserId } from '../../../api/client';
import { useAppData } from '../../../store/AppDataContext';
import { toDateString } from '../../../utils/medication';
import aiIcon from '../../../assets/journal/ai.png';
import trashBin from '../../../assets/trash_bin.png';
import pencilIcon from '../../../assets/evening/pencil.png';
import DatePickerModal from '../../../components/DatePickerModal';
import {
  PopupBackdrop,
  PopupCard,
  PopupInnerBorder,
  PopupTitle,
  PopupPrimaryButton,
  PopupSecondaryButton,
  PopupButtonRow,
} from '../../../components/PopupShell';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

const formatFullDate = (dateString) => {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-').map(Number);
  return `${year}년 ${month}월 ${day}일`;
};

// 카드 안에서는 한 줄로 붙이면 종류 글자가 잘려서, 연도/월일을 두 줄로 나눠 보여준다.
const formatYear = (dateString) => {
  if (!dateString) return '';
  const [year] = dateString.split('-').map(Number);
  return `${year}`;
};

const formatMonthDay = (dateString) => {
  if (!dateString) return '';
  const [, month, day] = dateString.split('-').map(Number);
  return `${month}월 ${day}일`;
};

// /checkups/all은 D-day·상대 시간을 계산해서 주지 않아서 프론트에서 직접 구한다.
const daysBetween = (dateString) => {
  const target = new Date(`${dateString}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target - today) / 86400000);
};

// 지난 검진 뱃지용. 'D+30'처럼 날짜 수로만 보여주면 감이 안 와서,
// 일/개월/년 단위로 알아보기 쉽게 바꾼다.
const formatRelativeTime = (dateString) => {
  const diff = -daysBetween(dateString);
  if (diff <= 0) return '오늘';
  if (diff < 30) return `${diff}일 전`;
  if (diff < 365) return `${Math.floor(diff / 30)}개월 전`;
  return `${Math.floor(diff / 365)}년 전`;
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
  const [person, setPerson] = useState('me');
  const [showAddModal, setShowAddModal] = useState(false);
  const { partnerLabel } = useFamilyRelation();
  const { data: appData, setHealthInsight } = useAppData();

  const { data: familyData } = useApi(getMyFamily);

  const currentMyId = getUserId();
  const partnerMember = (familyData?.members || []).find(
    (member) => String(member.userId) !== String(currentMyId)
  );

  const partnerUserId =
    partnerMember?.userId ||
    appData?.family?.partnerUserId ||
    appData?.family?.connectedUserId ||
    appData?.family?.userId;

  const targetId = person === 'family' ? partnerUserId : undefined;
  const todayStr = toDateString(new Date());

  // AI 인사이트(doctorQuestions)는 서버가 조회할 때마다 문구를 새로 생성해서, 화면에
  // 들어올 때마다 멘트가 바뀌는 문제가 있었다. "저녁 건강체크를 완료한 당사자의 인사이트만
  // 갱신"하기로 해서, 나/가족 각자의 저녁체크 완료 여부를 오늘 날짜로 조회해 신호로 쓴다.
  //
  // 나/가족용 요청을 person 하나로 스위치해서 같은 훅으로 부르면, 탭을 바꾼 직후 한
  // 렌더 동안 args만 바뀌고 이전 사람의 응답이 아직 남아있는 순간이 생긴다. 그 순간에
  // 캐시에 잘못 저장되면(다른 사람 문구가 그대로 굳어버림) 나/가족 인사이트가 똑같이
  // 보이는 문제가 생겨서, 아예 훅을 나/가족용으로 나눠 스위칭 자체가 없게 한다.
  const { data: myDailyLog } = useApi(getDailyLog, { args: [todayStr] });
  const { data: familyDailyLog } = useApi(getFamilyDailyLog, {
    args: partnerUserId ? [partnerUserId, todayStr] : [],
    enabled: Boolean(partnerUserId),
  });
  const relevantDailyLog = person === 'family' ? familyDailyLog : myDailyLog;
  const eveningAnsweredToday = (relevantDailyLog?.eveningAnswers ?? []).length > 0;

  // doctorQuestions(AI 인사이트)도 같은 이유로 나/가족용을 각각 따로 불러온다.
  // 아직 /all에는 없어서 기존 엔드포인트를 그대로 쓴다.
  const { data: myCheckupData, refetch: refetchMyCheckup } = useApi(getCheckups, { args: [] });
  const { data: familyCheckupData, refetch: refetchFamilyCheckup } = useApi(getCheckups, {
    args: partnerUserId ? [partnerUserId] : [],
    enabled: Boolean(partnerUserId),
  });
  const checkupData = person === 'family' ? familyCheckupData : myCheckupData;

  // 검진 목록(다가오는/지난/달력)은 전체를 다 내려주는 /checkups/all로 만든다.
  // 기존 /checkups는 "가장 가까운 미래 검진" 1개만 줘서, 미래 검진이 2개 이상이면
  // 나머지가 응답에서 통째로 빠지는 문제가 있었다.
  const { data: allCheckups, refetch: refetchAll } = useApi(getAllCheckups, {
    args: targetId ? [targetId] : [],
  });

  const { execute: removeCheckup, loading: deleting } = useApiAction(deleteCheckup);

  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);

  const handleJumpDate = (selectedDateStr) => {
    if (!selectedDateStr) return;
    const [y, m] = selectedDateStr.split('-').map(Number);
    setCurrentDate(new Date(y, m - 1, 1));
    setIsMonthPickerOpen(false);
  };

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

  const refetchAllLists = () => {
    refetchMyCheckup();
    refetchFamilyCheckup();
    refetchAll();
  };

  const handleDelete = async () => {
    const { ok, error } = await removeCheckup(deleteTarget);
    setDeleteTarget(null);
    if (!ok) {
      setDeleteError(error);
      return;
    }
    refetchAllLists();
  };

  const displayName = person === 'me' ? '나' : partnerLabel || '엄마';

  const sortedCheckups = [...(allCheckups ?? [])].sort((a, b) =>
    a.checkupDate.localeCompare(b.checkupDate),
  );
  // 오늘 이후(오늘 포함) 전부를 "다가오는 검진"으로 본다. dDay는 화면에서 직접 구한다.
  const upcomingList = sortedCheckups
    .filter((item) => item.checkupDate >= todayStr)
    .map((item) => ({ ...item, dDay: daysBetween(item.checkupDate) }));
  // 지난 검진은 최근 것이 위로 오게 내림차순으로 본다.
  const pastList = sortedCheckups
    .filter((item) => item.checkupDate < todayStr)
    .reverse();
  const upcoming = upcomingList[0] ?? null;

  // 캐시가 비어있거나(첫 조회), 오늘 저녁체크를 완료했는데 아직 오늘 날짜로 갱신 안
  // 된 경우에만 서버가 방금 내려준 새 문구를 받아들이고 캐시에 저장한다. 그 외에는
  // 서버가 매번 새로 만들어주는 값을 무시하고 캐시된 문구를 그대로 보여준다.
  const freshDoctorQuestions = checkupData?.doctorQuestions || [];
  const cachedInsight = appData?.healthInsight?.[person] ?? { questions: [], forDate: '' };
  const shouldRefreshInsight =
    cachedInsight.questions.length === 0 ||
    (eveningAnsweredToday && cachedInsight.forDate !== todayStr);

  useEffect(() => {
    if (shouldRefreshInsight && freshDoctorQuestions.length > 0) {
      setHealthInsight(person, { questions: freshDoctorQuestions, forDate: todayStr });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldRefreshInsight, JSON.stringify(freshDoctorQuestions), person, todayStr]);

  const doctorQuestions = shouldRefreshInsight ? freshDoctorQuestions : cachedInsight.questions;

  const [currentDate, setCurrentDate] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

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

    (allCheckups ?? []).forEach(({ checkupDate }) => {
      if (!checkupDate) return;
      const [y, m, d] = checkupDate.split('-').map(Number);
      if (y === currentYear && m === currentMonth + 1) {
        daySet.add(d);
      }
    });

    return daySet;
  }, [allCheckups, currentYear, currentMonth]);

  return (
    <Page>
      <Content>
        <CloseButton
          type="button"
          onClick={() => navigate('/home')}
          aria-label="닫기"
        >
          ✕
        </CloseButton>

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
              <MonthTitleButton
                type="button"
                onClick={() => setIsMonthPickerOpen(true)}
              >
                <span>{currentMonth + 1}월</span>
              </MonthTitleButton>
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
          {/* 다음 검진 배너 */}
          {upcoming ? (
            <UpcomingBanner>
              <UpcomingBannerTitle>
                {displayName}의 다음 검진까지 D-{upcoming.dDay}
              </UpcomingBannerTitle>
              <UpcomingBannerInnerCard>
                <UpcomingMetaRow>
                  <MetaLabel>날짜 :</MetaLabel>
                  <MetaValue>{formatFullDate(upcoming.checkupDate)}</MetaValue>
                </UpcomingMetaRow>
                <UpcomingMetaRow>
                  <MetaLabel>위치 :</MetaLabel>
                  <MetaValue>{upcoming.hospitalName || '위치 미지정'}</MetaValue>
                </UpcomingMetaRow>
                <UpcomingMetaRow>
                  <MetaLabel>종류 :</MetaLabel>
                  <MetaValue>{upcoming.checkupType || '일반검진'}</MetaValue>
                </UpcomingMetaRow>
              </UpcomingBannerInnerCard>
            </UpcomingBanner>
          ) : (
            <EmptyBanner>예정된 다음 검진 일정이 없어요</EmptyBanner>
          )}

          {isMonthPickerOpen && (
            <DatePickerModal
              value={`${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`}
              title="연/월 선택"
              onConfirm={handleJumpDate}
              onClose={() => setIsMonthPickerOpen(false)}
            />
          )}

          

          <SectionDivider />

          {/* 다가오는 검진 섹션 — 가장 가까운 것 하나가 아니라 미래 검진 전부를 보여준다 */}
          <SectionTitle>다가오는 검진</SectionTitle>
            {upcomingList.length > 0 ? (
              <CheckupList>
                {upcomingList.map((item) => (
                  <ClickableCheckupCard
                    key={item.checkupId}
                    onClick={() => setEditTarget(item)}
                  >
                    <CheckupLeftGroup>
                      <DateColumn>
                        <YearText>{formatYear(item.checkupDate)}</YearText>
                        <MonthDayText>{formatMonthDay(item.checkupDate)}</MonthDayText>
                      </DateColumn>
                      <Badge>
                        {item.dDay === 0
                          ? '오늘'
                          : item.dDay < 0
                          ? `D+${Math.abs(item.dDay)}`
                          : `D-${item.dDay}`}
                      </Badge>
                      <CheckupTypeText>{item.checkupType}</CheckupTypeText>
                    </CheckupLeftGroup>
                    <CardRightGroup>
                      <PencilIcon src={pencilIcon} alt="수정" />
                      <DeleteIconButton
                        type="button"
                        aria-label="삭제"
                        disabled={deleting}
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTarget(item.checkupId);
                        }}
                      >
                        <TrashIcon src={trashBin} alt="삭제" />
                      </DeleteIconButton>
                    </CardRightGroup>
                  </ClickableCheckupCard>
                ))}
              </CheckupList>
            ) : (
              <EmptyCardText>다가오는 검진 일정이 없어요</EmptyCardText>
            )}
            {/* 지난 검진 섹션 */}
          <SectionTitle>지난 검진</SectionTitle>
          <CheckupList>
            {pastList.length > 0 ? (
              pastList.map((item) => (
                <CheckupCard key={item.checkupId}>
                  <CheckupLeftGroup>
                    <DateColumn>
                      <YearText>{formatYear(item.checkupDate)}</YearText>
                      <MonthDayText>{formatMonthDay(item.checkupDate)}</MonthDayText>
                    </DateColumn>
                    <Badge>{formatRelativeTime(item.checkupDate)}</Badge>
                    <CheckupTypeText>{item.checkupType}</CheckupTypeText>
                  </CheckupLeftGroup>
                  <CardRightGroup>
                    <DeleteIconButton
                      type="button"
                      aria-label="삭제"
                      disabled={deleting}
                      onClick={() => setDeleteTarget(item.checkupId)}
                    >
                      <TrashIcon src={trashBin} alt="삭제" />
                    </DeleteIconButton>
                  </CardRightGroup>
                </CheckupCard>
              ))
            ) : (
              <EmptyCardText>지난 검진 기록이 없어요</EmptyCardText>
            )}
          </CheckupList>

          <SectionDivider />

          {/* 그동안의 기록에서 찾은 변화 섹션 */}
          <SectionTitle>그동안의 기록에서 찾은 변화</SectionTitle>
          <InsightCard>
            <InsightHeader>
              <SparkleIcon src={aiIcon} alt="AI 분석" />
              <InsightHeaderTextGroup>
                <InsightMainTitle>
                  진료 때 이런 걸 여쭤보시면 좋아요!
                </InsightMainTitle>
                <InsightSubTitle>
                  {getInsightSubTitle(person, partnerLabel)}
                </InsightSubTitle>
              </InsightHeaderTextGroup>
            </InsightHeader>

            <InsightDivider />

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
        </ScrollArea>

        {/* 하단 검진 일정 추가하기 버튼 — 스크롤 안 되게 ScrollArea 밖에 고정 */}
        <AddButtonArea>
          <AddButton
            type="button"
            onClick={() => setShowAddModal(true)}
          >
            검진 일정 추가하기
          </AddButton>
        </AddButtonArea>

        {(showAddModal || editTarget) && (
          <AddHealthCheck
            editing={editTarget}
            onClose={() => {
              setShowAddModal(false);
              setEditTarget(null);
            }}
            onSuccess={() => {
              setShowAddModal(false);
              setEditTarget(null);
              refetchAllLists();
            }}
          />
        )}

        {deleteTarget !== null && (
          <PopupBackdrop onClick={() => setDeleteTarget(null)}>
            <PopupCard
              $center
              $gap={16}
              $padTop={36}
              onClick={(event) => event.stopPropagation()}
            >
              <PopupInnerBorder />
              <PopupTitle $center $size={22}>
                이 검진 일정을 지울까요?
              </PopupTitle>
              <PopupMessage>지우면 다시 되돌릴 수 없어요.</PopupMessage>
              <PopupButtonRow>
                <PopupSecondaryButton type="button" onClick={() => setDeleteTarget(null)}>
                  그대로 둘래요
                </PopupSecondaryButton>
                <PopupPrimaryButton type="button" disabled={deleting} onClick={handleDelete}>
                  {deleting ? '지우는 중...' : '지울래요'}
                </PopupPrimaryButton>
              </PopupButtonRow>
            </PopupCard>
          </PopupBackdrop>
        )}

        {deleteError && (
          <PopupBackdrop onClick={() => setDeleteError(null)}>
            <PopupCard
              $center
              $gap={16}
              $padTop={36}
              onClick={(event) => event.stopPropagation()}
            >
              <PopupInnerBorder />
              <PopupTitle $center $size={22}>
                지우지 못했어요
              </PopupTitle>
              <PopupMessage>{deleteError.message}</PopupMessage>
              <PopupPrimaryButton type="button" onClick={() => setDeleteError(null)}>
                알겠어요
              </PopupPrimaryButton>
            </PopupCard>
          </PopupBackdrop>
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

// 뒤로가기(<) 대신 닫기(✕)로 나간다. 자리만 오른쪽 위로 옮기고, 모양은 다른 팝업들의
// 닫기 버튼(PopupClose)과 맞춘다.
const CloseButton = styled.button`
  position: absolute;
  top: 35px;
  right: 20px;
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
  color: #8c8780;
  font-size: 24px;
  font-weight: 700;
  line-height: 1;
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

const SectionDivider = styled.div`
  width: 100%;
  border-bottom: 1.5px dashed rgba(74, 58, 47, 0.25);
  margin: 18px 0 16px;
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
    ${({ $active }) =>
      $active ? 'rgba(215, 169, 155, 0.85)' : 'rgba(74, 58, 47, 0.2)'};
  background: ${({ $active }) => ($active ? '#F9DFD8' : '#FFFDF9')};
  color: ${({ $active }) => ($active ? '#9E6A5A' : '#4A3A2F')};
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
   Calendar Card
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
  margin-bottom: 12px;
  padding: 0 4px;
`;

const MonthTitleButton = styled.button`
  display: inline-flex;
  align-items: center;
  padding: 0;
  border: none;
  background: transparent;
  color: #4A3A2F;
  font-family: Jua, sans-serif;
  font-size: 24px;
  font-weight: 400;
  cursor: pointer;
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
  border-radius: 16px;
  background: ${({ $selected }) => ($selected ? '#E8CD73;' : 'transparent')};
  color: #4A3A2F;
  font-family: 'Noto Sans KR';
  font-size: 14px;
  font-weight: ${({ $selected }) => ($selected ? '800' : '500')};
  cursor: pointer;
`;

/* =========================
   Upcoming Banner
========================= */

const UpcomingBanner = styled.div`
  padding: 16px;
  border-radius: 18px;
border: 1.5px solid rgba(230, 167, 148, 0.50);
background: rgba(243, 222, 190, 0.70);
  margin-bottom: 18px;
`;

const UpcomingBannerTitle = styled.p`
  margin: 0 0 12px;
  color: #C97158;
  font-family: 'Noto Sans KR';
  font-size: 14px;;
  font-size: 20px;
  font-weight: 700;
  text-align: center;
`;

const UpcomingBannerInnerCard = styled.div`
  background: #FFFFFF;
  border-radius: 14px;
  padding: 14px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
`;

const UpcomingMetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const MetaLabel = styled.span`
  color: #4A3A2F;
  font-family: 'Noto Sans KR';
  font-size: 14px;
  font-weight: 700;
`;

const MetaValue = styled.span`
  color: #4A3A2F;
  font-family: 'Noto Sans KR';
  font-size: 14px;
  font-weight: 700;
`;

const EmptyBanner = styled.div`
  padding: 14px 16px;
  border-radius: 16px;
  border: 1.3px dashed rgba(74, 58, 47, 0.3);
  background: rgba(255, 255, 255, 0.6);
  color: #8C8780;
  font-family: 'Noto Sans KR';
  font-size: 14px;
  text-align: center;
  margin-bottom: 18px;
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

const CheckupList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
`;

const CheckupCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-radius: 16px;
  border: 1.3px solid rgba(74, 58, 47, 0.35);
  background: rgba(255, 255, 255, 0.75);
  box-sizing: border-box;
`;

const ClickableCheckupCard = styled(CheckupCard)`
  width: 100%;
  cursor: pointer;
  text-align: left;
  transition: background 0.15s ease, transform 0.1s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.95);
  }

  &:active {
    transform: translateY(1px);
  }
`;

const CheckupLeftGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
`;

// 연도를 옆으로 붙이면 종류 글자가 잘려서, 연도(작게)/월일(크게) 두 줄로 나눈다.
// 폭을 고정해서 1자리/2자리 날짜여도 뒤쪽 뱃지·종류 위치가 항상 같게 맞춘다.
const DateColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 56px;
  flex-shrink: 0;
`;

const YearText = styled.span`
  color: #A79C8E;
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 11px;
  font-weight: 700;
  line-height: 1;
`;

const MonthDayText = styled.span`
  color: #4A3A2F;
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 16px;
  font-weight: 800;
  letter-spacing: -0.5px;
  line-height: 1;
  white-space: nowrap;
`;

// 뱃지 너비를 min-width가 아니라 고정 width로 둬서 '오늘'처럼 짧은 글자든
// '11개월 전'처럼 긴 글자든 항상 같은 칸을 차지하게 한다. min-width였을 때는
// 내용에 따라 뱃지 폭이 늘어나면서 뒤에 오는 검진 종류(이비인후과 등) 글자의
// 시작 위치가 카드마다 달라져 정렬이 안 맞았다.
const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  flex-shrink: 0;
  margin: 0 6px;
  padding: 3px 4px;
  border-radius: 999px;
  background: #C4DA85;
  color: #374619;
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.3;
  white-space: nowrap;
  text-align: center;
`;

// 검진 종류 텍스트
const CheckupTypeText = styled.span`
  color: #8C8780;
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 15px;
  font-weight: 600;
  margin-left: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const CardRightGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
`;



const PencilIcon = styled.img`
  width: 26px;
  height: 26px;
  flex-shrink: 0;
  object-fit: contain;
`;

const DeleteIconButton = styled.button`
  padding: 2px;
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
  margin-bottom: 20px;
`;

/* =========================
   Insight Card
========================= */

const InsightCard = styled.div`
  padding: 16px;
  border-radius: 18px;
  border: 1.3px solid rgba(138, 123, 62, 0.35);
  background: #EFF3D8;
  margin-bottom: 20px;
`;

const InsightHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
`;

const SparkleIcon = styled.img`
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  object-fit: contain;
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
  line-height: 1.3;
`;

const InsightSubTitle = styled.p`
  margin: 2px 0 0;
  color: #6C7A3C;
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 12px;
  font-weight: 500;
`;

const InsightDivider = styled.div`
  width: 100%;
  border-bottom: 1px dashed rgba(110, 128, 60, 0.35);
  margin-bottom: 14px;
`;

const InsightList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const InsightItem = styled.li`
  display: flex;
  align-items: flex-start;
  gap: 6px;
`;

const InsightBullet = styled.span`
  color: #6C7A3C;
  font-size: 14px;
  line-height: 1.4;
`;

const InsightText = styled.span`
  color: #4A3A2F;
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 13.5px;
  font-weight: 500;
  line-height: 1.45;
  word-break: keep-all;
`;

/* =========================
   Bottom Button
========================= */

const AddButtonArea = styled.div`
  padding: 6px 0 16px;
`;

const AddButton = styled.button`
  width: 100%;
  height: 54px;
  border-radius: 16px;
  border: 1.5px solid rgba(74, 58, 47, 0.55);
  background: #DBE59B;
  color: #4A3A2F;
  font-family: Jua, sans-serif;
  font-size: 20px;
  font-weight: 400;
  cursor: pointer;
  transition: transform 0.1s ease;

  &:active {
    transform: translateY(1px);
  }
`;

const PopupMessage = styled.p`
  margin: 0;
  width: 100%;
  text-align: center;
  color: #6b6661;
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 16px;
  line-height: 1.5;
  word-break: keep-all;
`;