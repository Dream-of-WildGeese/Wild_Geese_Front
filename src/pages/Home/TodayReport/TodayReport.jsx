import { useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import styled from 'styled-components';
import aiIcon from '../../../assets/journal/ai.png';
import sunIcon from '../../../assets/journal/sun.png';
import pillIcon from '../../../assets/journal/pill.png';
import moonIcon from '../../../assets/journal/moon.png';
import flowerA from '../../../assets/journal/flower-a.png';
import flowerB from '../../../assets/journal/flower-b.png';
import medEmpty from '../../../assets/journal/med-empty.png';
import mCondition from '../../../assets/journal/m-condition.png';
import mSleep from '../../../assets/journal/m-sleep.png';
import mMeal from '../../../assets/journal/m-meal.png';
import mActivity from '../../../assets/journal/m-activity.png';
import mBody from '../../../assets/journal/m-body.png';
import stepsIcon from '../../../assets/weekly/check.png';
import { loadTodayReport } from './todayReportData';
import { useApi } from '../../../hooks/useApi';
import { useFamilyRelation } from '../../../hooks/useFamilyRelation';
import JournalCta from './JournalCta';
import DayQuestionPopup from '../TodayOndam/Day/DayQuestionPopup';
import MedicineLogEditPopup from '../TodayOndam/Medicine/MedicineLogEditPopup';
import EveningCheckPopup from '../TodayOndam/Night/EveningCheckPopup';
import PhoneNumberPopup from '../../../components/PhoneNumberPopup';
import { callPhone, getFamilyPhone } from '../../../utils/call';
import { toDateString } from '../../../utils/medication';
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

// Figma 31 / 31b: '오늘의 온담'이 '오늘의 건강일지'로 이름이 바뀌고
// 타임라인 카드 형태로 재설계됐다.
const MED_FLOWERS = [flowerA, flowerB];
const METRIC_ICONS = {
  CONDITION: mCondition,
  SLEEP: mSleep,
  MEAL: mMeal,
  ACTIVITY: mActivity,
  BODY: mBody,
  CUSTOM: mBody,
};
const ENTRY_ICONS = { question: sunIcon, medication: pillIcon, healthcheck: moonIcon };
const ENTRY_TITLES = { question: '오늘의 질문', medication: '복약 체크', healthcheck: '건강 체크' };
// 카드 왼쪽 레일 옆에 붙는 시간대 이름 (Figma 907:1774)
const ENTRY_STAGES = { question: '아침', medication: '복약', healthcheck: '저녁' };

const PersonToggle = styled.div`
  display: flex;
  gap: 4px;
  height: 56px;
  padding: 4px;
  border-radius: 16px;
  background: #f8f5ee;
`;

// 예전에는 '나'는 살구색, '가족'은 노란색으로 사람마다 색이 달라서 어느 쪽을 고른
// 건지 알기 어려웠다. 주간 리포트와 같게, 고른 쪽만 살구색으로 채운다.
const ToggleTab = styled.button`
  flex: 1;
  height: 48px;
  border-radius: 12px;

  border: 2px solid ${({ $active }) => ($active ? '#e6a794' : 'rgba(232, 205, 115, 0.7)')};
  background: ${({ $active }) => ($active ? 'rgba(230, 167, 148, 0.5)' : 'transparent')};
  color: ${({ $active }) => ($active ? '#c97158' : '#b9862e')};

  font-family: 'Noto Sans KR';
  font-size: 17px;
  font-weight: 700;
`;

const SummaryChips = styled.div`
  display: flex;
  justify-content: space-between;
`;

const SummaryChip = styled.div`
  width: 92px;
  height: 92px;
  border-radius: 46px;
  border: 1.5px solid rgba(138, 109, 75, 0.75);

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
`;

const ChipLabel = styled.span`
  color: rgba(138, 109, 75, 0.75);
  font-family: 'Noto Sans KR';
  font-size: 13px;
  font-weight: 500;
`;

const ChipValue = styled.span`
  color: #8a6d4b;
  font-family: 'Noto Sans KR';
  font-size: 20px;
  font-weight: 700;
`;

const InfoCard = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: 18px;

  border: 1.5px solid rgba(143, 174, 74, 0.5);
  background: #edf2d4;
`;

const InfoIcon = styled.img`
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  object-fit: contain;
`;

const InfoTextCol = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const InfoLabel = styled.p`
  margin: 0;
  color: #5b7a2e;
  font-family: 'Noto Sans KR';
  font-size: 16px;
  font-weight: 700;
`;

const InfoText = styled.p`
  margin: 0;
  color: #4a3a2f;
  font-family: 'Noto Sans KR';
  font-size: ${({ $small }) => ($small ? 13 : 16)}px;
  font-weight: 500;
  line-height: 1.4;
`;

// Figma 907:1801 — 온담 한마디보다 한 톤 진한 연두로 채워서 눈에 먼저 들어오게 한다.
const StepCard = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: 14px;

  border: 1.5px solid rgba(124, 154, 58, 0.7);
  background: #cbd879;
`;

const StepLabel = styled.p`
  margin: 0;
  color: #3f5a1b;
  font-family: 'Noto Sans KR';
  font-size: 16px;
  font-weight: 700;
`;

const StepText = styled.p`
  margin: 0;
  color: #3f3320;
  font-family: 'Noto Sans KR';
  font-size: 16px;
  font-weight: 500;
  line-height: 1.4;
  word-break: keep-all;
`;

const SectionDivider = styled.div`
  width: 100%;
  height: 2px;
  background: rgba(74, 58, 47, 0.25);
`;

// 카드 위에 붙는 시간대 이름
const StageLabel = styled.p`
  margin: 0;
  color: #a79c8e;
  font-family: 'Noto Sans KR';
  font-size: 16px;
  font-weight: 500;
`;

const TimelineEntry = styled.div`
  display: flex;
  gap: 14px;
  align-items: stretch;
`;

// 왼쪽 세로선: 위에 점 하나, 아래로 선이 이어진다.
const Rail = styled.div`
  position: relative;
  width: 12px;
  flex-shrink: 0;

  &::before {
    content: '';
    position: absolute;
    left: 1px;
    top: 0;
    width: 10px;
    height: 10px;
    border-radius: 5px;
    /* Figma Rail의 초록 동그라미 */
    background: #cbd879;
  }

  &::after {
    content: '';
    position: absolute;
    left: 5px;
    top: 10px;
    bottom: 0;
    width: 2px;
    background: #ded4c2;
  }
`;

const EntryContent = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const EntryCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;

  border-radius: 18px;
  border: 1.5px solid rgba(74, 58, 47, 0.4);
  background: rgba(255, 255, 255, 0.55);
`;

// 카드 제목 오른쪽에 붙는 작은 수정 버튼
const EditButton = styled.button`
  margin-left: auto;
  padding: 4px 10px;

  border-radius: 8px;
  border: 1px solid rgba(74, 58, 47, 0.35);
  background: rgba(255, 255, 255, 0.7);

  color: #8c8172;
  font-family: 'Noto Sans KR';
  font-size: 13px;
  font-weight: 700;
`;

const CardHead = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CardHeadIcon = styled.img`
  width: 28px;
  height: 28px;
  object-fit: contain;
`;

const CardTitle = styled.p`
  margin: 0;
  color: #4a3a2f;
  font-family: 'Noto Sans KR';
  font-size: 18px;
  font-weight: 700;
`;

const QuestionRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
`;

const QuestionLabel = styled.span`
  color: #6b6661;
  font-family: 'Noto Sans KR';
  font-size: 16px;
`;

const QuestionAnswer = styled.span`
  color: #4a3a2f;
  font-family: 'Noto Sans KR';
  font-size: 17px;
  font-weight: 700;
`;

const MedCircleRow = styled.div`
  display: flex;
  gap: 32px;
  justify-content: center;
  flex-wrap: wrap;
`;

const MedIconWrap = styled.div`
  width: 76px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
`;

const MedIcon = styled.img`
  width: ${({ $taken }) => ($taken ? 52 : 40)}px;
  height: ${({ $taken }) => ($taken ? 52 : 40)}px;
  object-fit: contain;
`;

const MedName = styled.span`
  max-width: 100%;
  text-align: center;
  color: ${({ $taken }) => ($taken ? '#2e2117' : '#8c8780')};
  font-family: 'Noto Sans KR';
  font-size: 14px;
  font-weight: 700;
  line-height: 1.3;
  word-break: keep-all;
`;

const SentenceLine = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const MiniBadge = styled.div`
  width: 26px;
  height: 26px;
  border-radius: 13px;
  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: center;
  background: #edf2d4;
`;

const MiniBadgeIcon = styled.img`
  width: 20px;
  height: 20px;
  object-fit: contain;
`;

const SentenceText = styled.p`
  margin: 0;
  flex: 1;
  min-width: 0;
  text-align: center;
  color: #6b6661;
  font-family: 'Noto Sans KR';
  font-size: 16px;
`;

const StatusText = styled.p`
  margin: 40px 0 0;
  text-align: center;
  color: #a79c8e;
  font-family: 'Noto Sans KR';
  font-size: 15px;
`;

function TodayReport() {
  const navigate = useNavigate();
  const location = useLocation();
  // 주간 리포트에서 요일을 누르면 /home/today-report/2026-08-04 로 들어온다.
  // useApi가 인자를 JSON으로 직렬화해서 다시 읽으므로 Date가 아니라 문자열로 넘긴다.
  const { date: dateParam } = useParams();

  const [person, setPerson] = useState(location.state?.person ?? 'me');
  // 주간 리포트의 요일 버튼으로 들어왔으면 뒤로 갈 때 그 주간 리포트로 돌아간다.
  const backTo = location.state?.from ?? '/home';
  const closeJournal = () => navigate(backTo, backTo !== '/home' ? { state: { person } } : undefined);
  const {
    data: report,
    loading,
    error,
    refetch,
  } = useApi(loadTodayReport, { args: [person, dateParam ?? null] });
  const { partnerLabel } = useFamilyRelation();
  // 어떤 기록을 고치는 중인지 ('question' | 'medication' | 'healthcheck' | null)
  const [editing, setEditing] = useState(null);

  const isMine = person === 'me';

  // 수정 팝업이 쓰는 API(/morning/today, /evening/today, 복약 기록)는 모두 '오늘'만
  // 다룬다. 지난 날짜에서 수정을 열면 엉뚱하게 오늘 기록이 열리므로 버튼을 감춘다.
  const isToday = !dateParam || dateParam === toDateString(new Date());
  const canEdit = isMine && isToday;

  // 팝업을 닫으면 일지를 다시 불러와 방금 고친 내용을 반영한다.
  const closeEditor = () => {
    setEditing(null);
    refetch();
  };

  // 저장해둔 번호가 있으면 바로 걸고, 없으면 한 번 물어본 뒤 건다.
  const [askingPhone, setAskingPhone] = useState(false);
  const handleCall = () => {
    const saved = getFamilyPhone();
    if (saved) {
      callPhone(saved);
      return;
    }
    setAskingPhone(true);
  };

  const renderEntryBody = (entry) => {
    if (entry.type === 'question') {
      return (
        <QuestionRow>
          <QuestionLabel>{entry.question}</QuestionLabel>
          <QuestionAnswer>{entry.answer}</QuestionAnswer>
        </QuestionRow>
      );
    }

    if (entry.type === 'medication') {
      return (
        <MedCircleRow>
          {entry.medications.map((med, index) => (
            <MedIconWrap key={med.key ?? med.scheduleId ?? med.name}>
              <MedIcon
                $taken={med.taken}
                src={med.taken ? MED_FLOWERS[index % MED_FLOWERS.length] : medEmpty}
                alt=""
              />
              <MedName $taken={med.taken}>{med.label ?? med.name}</MedName>
            </MedIconWrap>
          ))}
        </MedCircleRow>
      );
    }

    return entry.lines.map((line, index) => (
      <SentenceLine key={`${line.metricType}-${index}`}>
        <MiniBadge>
          <MiniBadgeIcon src={METRIC_ICONS[line.metricType] ?? mBody} alt="" />
        </MiniBadge>
        <SentenceText>{line.text}</SentenceText>
      </SentenceLine>
    ));
  };

  return (
    <PageFrame>
      <PageContent>
        <PageBack onClick={closeJournal} />
        <PageHeader>
          <PageCaption>{report?.dateLabel ?? ''}</PageCaption>
          <PageTitle $size={40}>오늘의 건강일지</PageTitle>
        </PageHeader>
        <PageDivider />

        <PageScrollArea $gap={22}>
          <PersonToggle>
            <ToggleTab type="button" $mine $active={isMine} onClick={() => setPerson('me')}>
              나
            </ToggleTab>
            <ToggleTab type="button" $active={!isMine} onClick={() => setPerson('family')}>
              {partnerLabel}
            </ToggleTab>
          </PersonToggle>

          {loading || error || !report ? (
            <StatusText>
              {loading
                ? '기록을 불러오는 중이에요...'
                : error
                  ? error.message
                  : '아직 연결된 가족이 없어요.'}
            </StatusText>
          ) : (
            <>
              <SummaryChips>
                <SummaryChip>
                  <ChipLabel>질문 답변</ChipLabel>
                  <ChipValue>{report.summary.questionStatus}</ChipValue>
                </SummaryChip>
                <SummaryChip>
                  <ChipLabel>복약</ChipLabel>
                  <ChipValue>{report.summary.medication}</ChipValue>
                </SummaryChip>
                <SummaryChip>
                  <ChipLabel>컨디션</ChipLabel>
                  {/* 표정 그림 대신 좋음·보통·나쁨 세 글자로 적는다 */}
                  <ChipValue>{report.summary.condition}</ChipValue>
                </SummaryChip>
              </SummaryChips>

              {/* 온담 한마디는 서버가 기록을 보고 만들어 준다.
                  아직 안 만들어졌으면 자리를 비우지 않고 언제 채워지는지 알려준다. */}
              <InfoCard>
                <InfoIcon src={aiIcon} alt="" />
                <InfoTextCol>
                  <InfoLabel>온담 한마디</InfoLabel>
                  <InfoText>
                    {report.aiComment ||
                      (report.eveningDone
                        ? '오늘 기록을 살펴보고 있어요.'
                        : '저녁 건강 체크를 마치면 온담이 한마디 남겨드려요.')}
                  </InfoText>
                </InfoTextCol>
              </InfoCard>

              {report.steps?.message && (
                <StepCard>
                  <InfoIcon src={stepsIcon} alt="" />
                  <InfoTextCol>
                    <StepLabel>오늘의 걸음수</StepLabel>
                    <StepText>{report.steps.message}</StepText>
                  </InfoTextCol>
                </StepCard>
              )}

              <SectionDivider />

              {/* 작성 시각은 보여주지 않는다. 카드 제목만으로 아침·복약·저녁이 구분된다. */}
              {report.timeline.map((entry) => (
                <TimelineEntry key={entry.type}>
                  <Rail />
                  <EntryContent>
                    <StageLabel>{ENTRY_STAGES[entry.type]}</StageLabel>
                    <EntryCard>
                      <CardHead>
                        <CardHeadIcon src={ENTRY_ICONS[entry.type]} alt="" />
                        <CardTitle>{ENTRY_TITLES[entry.type]}</CardTitle>
                        {/* 내 기록만, 그리고 오늘 것만 고칠 수 있다 */}
                        {canEdit && (
                          <EditButton type="button" onClick={() => setEditing(entry.type)}>
                            수정
                          </EditButton>
                        )}
                      </CardHead>
                      {renderEntryBody(entry)}
                    </EntryCard>
                  </EntryContent>
                </TimelineEntry>
              ))}

              {report.eveningComment && (
                <InfoCard>
                  <InfoIcon src={aiIcon} alt="" />
                  <InfoTextCol>
                    <InfoText $small>{report.eveningComment}</InfoText>
                  </InfoTextCol>
                </InfoCard>
              )}

              {report.cta && (
                <>
                  <SectionDivider />
                  <JournalCta
                    title={report.cta.title}
                    message={report.cta.suggestedMessage}
                    onCall={handleCall}
                    onSendLetter={() => navigate('/home', { state: { openLetterbox: 'compose' } })}
                  />
                </>
              )}
            </>
          )}

        </PageScrollArea>

        {/* 백엔드가 재제출을 덮어쓰기로 바꿔줘서 기록을 다시 열어 고칠 수 있다 */}
        {editing === 'question' && <DayQuestionPopup onClose={closeEditor} />}
        {editing === 'medication' && (
          <MedicineLogEditPopup onClose={closeEditor} onDone={closeEditor} />
        )}
        {editing === 'healthcheck' && (
          <EveningCheckPopup forceEdit onClose={closeEditor} onCompleted={closeEditor} />
        )}

        {askingPhone && (
          <PhoneNumberPopup
            name={report?.personLabel}
            onSaved={(phone) => {
              setAskingPhone(false);
              callPhone(phone);
            }}
            onClose={() => setAskingPhone(false)}
          />
        )}
      </PageContent>
    </PageFrame>
  );
}

export default TodayReport;
