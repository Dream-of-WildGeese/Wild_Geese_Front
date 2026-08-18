import { useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import styled from 'styled-components';
import aiIcon from '../../../assets/weekly/ai.png';
import leafIcon from '../../../assets/weekly/leaf.png';
import faceGood from '../../../assets/weekly/face-good.png';
import faceNormal from '../../../assets/weekly/face-normal.png';
import faceBad from '../../../assets/weekly/face-bad.png';
import mealIcon from '../../../assets/weekly/meal.png';
import walkIcon from '../../../assets/weekly/walk.png';
import flowerIcon from '../../../assets/weekly/flower.png';
import emptyCircleIcon from '../../../assets/weekly/empty-circle.png';
import starIcon from '../../../assets/weekly/star.png';
import closeIcon from '../../../assets/journal/close.png';
import { loadWeeklyDetail } from './weeklyReportData';
import { useApi } from '../../../hooks/useApi';
import { useFamilyRelation } from '../../../hooks/useFamilyRelation';
import PhoneNumberPopup from '../../../components/PhoneNumberPopup';
import { callPhone, getFamilyPhone } from '../../../utils/call';
import JournalCta from '../TodayReport/JournalCta';

// Figma 1201:1144 — 주간 리포트 상세.
// 서버는 지표를 저녁 건강체크 선택지 점수(1~3)로만 주고, 3이 가장 좋은 상태다.
const SCORE_MAX = 3;
const FACE_BY_SCORE = { 3: faceGood, 2: faceNormal, 1: faceBad };

// 컨디션 링과 수면 막대가 같은 3색을 쓴다.
const SCORE_COLOR = { 3: '#8fae4a', 2: '#e8cd73', 1: '#e6a794' };
// 활동은 수면과 구분되도록 초록 계열 안에서만 진하기를 달리한다.
const ACTIVITY_COLOR = { 3: '#8fae4a', 2: '#acc379', 1: '#d0ddb2' };

const scoreFace = (score) => FACE_BY_SCORE[Math.round(score)] ?? faceNormal;
const scoreColor = (score) => SCORE_COLOR[Math.round(score)] ?? '#d9d4cc';
const activityColor = (score) => ACTIVITY_COLOR[Math.round(score)] ?? '#d9d4cc';
const barHeight = (score, max) => (score ? (score / SCORE_MAX) * max : 4);

const Page = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  box-sizing: border-box;

  padding: 16px 20px 24px;
  background: #fff8ed;

  display: flex;
  flex-direction: column;
  gap: 20px;

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

const HeaderBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
`;

const DateRange = styled.p`
  margin: 0;
  width: 100%;
  text-align: center;
  color: #a79c8e;
  font-family: 'Noto Sans KR';
  font-size: 18px;
  font-weight: 700;
`;

// 이름이 길어지면 40px에서 두 줄로 넘쳐 카드를 밀어낸다. 좁은 화면에서만 줄인다.
const FlowTitle = styled.h1`
  margin: 0;
  width: 100%;
  text-align: center;
  color: #4a3a2f;
  font-family: Jua;
  font-size: clamp(28px, 9vw, 40px);
  font-weight: 400;
  line-height: 1.2;
  word-break: keep-all;
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

// 온담 한마디 / 다음 주 제안이 쓰는 연두색 카드. 아이콘이 위, 글이 가운데다.
const GreenCard = styled.div`
  width: 100%;
  padding: 16px;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;

  border-radius: 18px;
  border: 1.5px solid rgba(143, 174, 74, 0.5);
  background: #edf2d4;
`;

const AiIcon = styled.img`
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  object-fit: contain;
`;

const GreenLabel = styled.p`
  margin: 0;
  width: 100%;
  text-align: center;
  color: #5b7a2e;
  font-family: 'Noto Sans KR';
  font-size: 18px;
  font-weight: 700;
`;

const Headline = styled.p`
  margin: 0;
  width: 100%;
  text-align: center;
  color: #4a3a2f;
  font-family: 'Noto Sans KR';
  font-size: 18px;
  font-weight: 700;
  word-break: keep-all;
`;

const GreenText = styled.p`
  margin: 0;
  width: 100%;
  text-align: center;
  color: #4a3a2f;
  font-family: 'Noto Sans KR';
  font-size: 14px;
  font-weight: 500;
  line-height: 1.5;
  word-break: keep-all;
`;

const MetricCard = styled.div`
  width: 100%;
  padding: 18px 16px;
  box-sizing: border-box;

  display: flex;
  flex-direction: column;
  gap: 12px;

  border-radius: 18px;
  border: 1.5px solid rgba(74, 58, 47, 0.4);
  background: rgba(255, 255, 255, 0.55);
`;

const MetricHead = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const LeafIcon = styled.img`
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  object-fit: contain;
`;

const MetricTitle = styled.p`
  margin: 0;
  color: #4a3a2f;
  font-family: 'Noto Sans KR';
  font-size: 16px;
  font-weight: 700;
`;

// 그래프와 범례를 감싸는 점선 상자. 디자인의 'Inner Group'이다.
const InnerGroup = styled.div`
  width: 100%;
  padding: 12px;
  box-sizing: border-box;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;

  border-radius: 18px;
  border: 1.5px dashed rgba(74, 58, 47, 0.4);
`;

const DayRow = styled.div`
  width: 100%;
  display: flex;
  align-items: ${({ $bottom }) => ($bottom ? 'flex-end' : 'flex-start')};
  justify-content: space-between;
`;

const DayCol = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  gap: ${({ $gap }) => $gap ?? 8}px;
`;

const DayLabel = styled.span`
  color: #8c8780;
  font-size: 11px;
`;

// 표정 아이콘을 감싸는 색 링. 점수에 따라 테두리 색이 바뀐다.
const RingWrap = styled.div`
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  box-sizing: border-box;
  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 50%;
  border: 2px solid ${({ $color }) => $color};
`;

const FaceIcon = styled.img`
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  object-fit: contain;
`;

const IconWrap = styled.div`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MealIcon = styled.img`
  width: 36px;
  height: 28px;
  object-fit: contain;
`;

const FlowerIcon = styled.img`
  width: 36px;
  height: 36px;
  object-fit: contain;
`;

const EmptyCircle = styled.img`
  width: 26px;
  height: 26px;
  object-fit: contain;
`;

const Bar = styled.div`
  width: 18px;
  height: ${({ $height }) => $height}px;
  border-radius: 4px;
  background: ${({ $color }) => $color};
`;

const WalkIcon = styled.img`
  width: 30px;
  height: 30px;
  object-fit: contain;
`;

const Legend = styled.div`
  display: flex;
  gap: ${({ $gap }) => $gap ?? 14}px;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
`;

const LegendItem = styled.div`
  display: flex;
  gap: 5px;
  align-items: center;
`;

const LegendSwatch = styled.span`
  width: 8px;
  height: 8px;
  flex-shrink: 0;
  border-radius: 2px;
  background: ${({ $color }) => $color};
`;

const LegendLabel = styled.span`
  color: #6b6661;
  font-family: 'Noto Sans KR';
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
`;

const SmallLegendLabel = styled(LegendLabel)`
  color: #8c8780;
  font-size: 11px;
`;

const MetricNote = styled.p`
  margin: 0;
  width: 100%;
  color: #6b6661;
  font-family: 'Noto Sans KR';
  font-size: 16px;
  line-height: 1.5;
  word-break: keep-all;
`;

const DayJumpCard = styled.div`
  width: 100%;
  padding: 18px 2px;
  box-sizing: border-box;

  display: flex;
  flex-direction: column;
  gap: 12px;

  border-radius: 18px;
  border: 1.5px solid rgba(74, 58, 47, 0.4);
`;

const DayJumpHint = styled.p`
  margin: 0;
  width: 100%;
  text-align: center;
  color: #4a3a2f;
  font-family: Jua;
  font-size: 18px;
  word-break: keep-all;
`;

// 별 7개가 카드 폭을 꽉 채운다. 고정 폭을 주면 좁은 화면에서 넘쳐서 비율로 나눈다.
const DayJumpRow = styled.div`
  width: 100%;
  display: flex;
`;

const DayButton = styled.button`
  position: relative;
  flex: 1;
  min-width: 0;
  height: 66px;
`;

const StarIcon = styled.img`
  width: 100%;
  max-width: 51px;
  aspect-ratio: 1;
  object-fit: contain;
  display: block;
  margin: 0 auto;
`;

// 요일 글자는 별 그림 한가운데에 얹는다.
const DayButtonLabel = styled.span`
  position: absolute;
  top: 17px;
  left: 0;
  width: 100%;
  text-align: center;
  color: #4a3a2f;
  font-family: Jua;
  font-size: 13px;
`;

const DayButtonDate = styled.span`
  position: absolute;
  top: 52px;
  left: 0;
  width: 100%;
  text-align: center;
  color: #4a3a2f;
  font-family: Jua;
  font-size: 11px;
`;

const StatusText = styled.p`
  margin: 40px 0 0;
  text-align: center;
  color: #a79c8e;
  font-family: 'Noto Sans KR';
  font-size: 15px;
`;

const CONDITION_LEGEND = [
  { score: 3, label: '좋아요' },
  { score: 2, label: '보통이에요' },
  { score: 1, label: '조금 아쉬워요' },
];

const SLEEP_LEGEND = [
  { score: 3, label: '7시간 이상' },
  { score: 2, label: '5~7시간' },
  { score: 1, label: '5시간 미만' },
];

function WeeklyReportDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { weekId } = useParams();
  const person = location.state?.person ?? 'me';

  const { data, loading, error } = useApi(loadWeeklyDetail, { args: [weekId, person] });
  const { partnerLabel } = useFamilyRelation();
  // 훅은 조기 반환보다 앞에 있어야 해서 여기에 둔다.
  const [askingPhone, setAskingPhone] = useState(false);

  const week = data?.week;
  const detail = data?.detail;
  const isMine = person === 'me';
  const personLabel = isMine ? '나' : partnerLabel;

  const handleCall = () => {
    const saved = getFamilyPhone();
    if (saved) {
      callPhone(saved);
      return;
    }
    setAskingPhone(true);
  };

  const goBack = () => navigate('/home/weekly-report');

  if (loading || error || !week || !detail) {
    return (
      <Page>
        <CloseButton type="button" aria-label="닫기" onClick={goBack}>
          <CloseIcon src={closeIcon} alt="" />
        </CloseButton>
        <StatusText>
          {loading
            ? '리포트를 불러오는 중이에요...'
            : error
              ? error.message
              : '이 주는 아직 리포트가 준비되지 않았어요.'}
        </StatusText>
      </Page>
    );
  }

  // weekId는 그 주 월요일('2026-08-03'). 요일 버튼마다 실제 날짜를 붙인다.
  const weekStart = new Date(`${weekId}T00:00:00`);
  const dayDates = detail.condition.map((_, index) => {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + index);
    return date;
  });
  const toDateParam = (date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

  return (
    <Page>
      <CloseButton type="button" aria-label="닫기" onClick={goBack}>
        <CloseIcon src={closeIcon} alt="" />
      </CloseButton>

      <HeaderBlock>
        <DateRange>{week.range}</DateRange>
        <FlowTitle>{personLabel}의 이번 주 건강 흐름</FlowTitle>
        <TitleDivider />
      </HeaderBlock>

      <GreenCard>
        <AiIcon src={aiIcon} alt="" />
        <GreenLabel>이번 주 한마디</GreenLabel>
        <Headline>“{detail.headline}”</Headline>
        {detail.headlineDesc && <GreenText>{detail.headlineDesc}</GreenText>}
      </GreenCard>

      <SectionDivider />

      <MetricCard>
        <MetricHead>
          <LeafIcon src={leafIcon} alt="" />
          <MetricTitle>컨디션</MetricTitle>
        </MetricHead>
        <InnerGroup>
          <DayRow>
            {detail.condition.map((item) => (
              <DayCol key={item.day}>
                <RingWrap $size={40} $color={scoreColor(item.score)}>
                  <FaceIcon $size={32} src={scoreFace(item.score)} alt="" />
                </RingWrap>
                <DayLabel>{item.day}</DayLabel>
              </DayCol>
            ))}
          </DayRow>
          <Legend>
            {CONDITION_LEGEND.map((item) => (
              <LegendItem key={item.score}>
                <RingWrap $size={22} $color={scoreColor(item.score)}>
                  <FaceIcon $size={16} src={scoreFace(item.score)} alt="" />
                </RingWrap>
                <LegendLabel>{item.label}</LegendLabel>
              </LegendItem>
            ))}
          </Legend>
        </InnerGroup>
        <MetricNote>{detail.conditionNote}</MetricNote>
      </MetricCard>

      <MetricCard>
        <MetricHead>
          <LeafIcon src={leafIcon} alt="" />
          <MetricTitle>수면</MetricTitle>
        </MetricHead>
        <InnerGroup>
          <DayRow $bottom style={{ height: 70 }}>
            {detail.sleep.map((item) => (
              <DayCol key={item.day} $gap={4}>
                <Bar $height={barHeight(item.value, 52)} $color={scoreColor(item.value)} />
                <DayLabel>{item.day}</DayLabel>
              </DayCol>
            ))}
          </DayRow>
          <Legend $gap={10}>
            {SLEEP_LEGEND.map((item) => (
              <LegendItem key={item.score}>
                <LegendSwatch $color={SCORE_COLOR[item.score]} />
                <SmallLegendLabel>{item.label}</SmallLegendLabel>
              </LegendItem>
            ))}
          </Legend>
        </InnerGroup>
        <MetricNote>{detail.sleepNote}</MetricNote>
      </MetricCard>

      <MetricCard>
        <MetricHead>
          <LeafIcon src={leafIcon} alt="" />
          <MetricTitle>식사</MetricTitle>
        </MetricHead>
        <InnerGroup>
          <DayRow>
            {detail.meal.map((item) => (
              <DayCol key={item.day}>
                <IconWrap>
                  {/* 기록이 아예 없는 날은 빈 원으로 둔다 */}
                  {item.score ? (
                    <MealIcon src={mealIcon} alt="" />
                  ) : (
                    <EmptyCircle src={emptyCircleIcon} alt="" />
                  )}
                </IconWrap>
                <DayLabel>{item.day}</DayLabel>
              </DayCol>
            ))}
          </DayRow>
        </InnerGroup>
        <MetricNote>{detail.mealNote}</MetricNote>
      </MetricCard>

      <MetricCard>
        <MetricHead>
          <LeafIcon src={leafIcon} alt="" />
          <MetricTitle>활동 (걸음 수)</MetricTitle>
        </MetricHead>
        <InnerGroup>
          <DayRow $bottom style={{ height: 108 }}>
            {detail.steps.map((item) => (
              <DayCol key={item.day}>
                <WalkIcon src={walkIcon} alt="" />
                <Bar $height={barHeight(item.value, 53)} $color={activityColor(item.value)} />
                <DayLabel>{item.day}</DayLabel>
              </DayCol>
            ))}
          </DayRow>
        </InnerGroup>
        <MetricNote>{detail.stepsNote}</MetricNote>
      </MetricCard>

      <MetricCard>
        <MetricHead>
          <LeafIcon src={leafIcon} alt="" />
          <MetricTitle>복약</MetricTitle>
        </MetricHead>
        <InnerGroup>
          <DayRow>
            {detail.meds.map((item) => (
              <DayCol key={item.day}>
                <IconWrap>
                  {item.done ? (
                    <FlowerIcon src={flowerIcon} alt="" />
                  ) : (
                    <EmptyCircle src={emptyCircleIcon} alt="" />
                  )}
                </IconWrap>
                <DayLabel>{item.day}</DayLabel>
              </DayCol>
            ))}
          </DayRow>
        </InnerGroup>
        <MetricNote>{detail.medsNote}</MetricNote>
      </MetricCard>

      {detail.adviceText && (
        <GreenCard>
          <AiIcon src={aiIcon} alt="" />
          <GreenLabel>다음 주 제안</GreenLabel>
          <GreenText>{detail.adviceText}</GreenText>
          {/* 서버가 기록을 분석해 써주는 문장 (aiCoachInsight) */}
          {detail.aiInsight && <GreenText>{detail.aiInsight}</GreenText>}
        </GreenCard>
      )}

      <SectionDivider />

      <DayJumpCard>
        <DayJumpHint>&lt; 하루하루의 건강기록을 확인해보세요 &gt;</DayJumpHint>
        <DayJumpRow>
          {detail.condition.map((item, index) => (
            <DayButton
              key={item.day}
              type="button"
              onClick={() =>
                navigate(`/home/today-report/${toDateParam(dayDates[index])}`, {
                  state: { person },
                })
              }
            >
              <StarIcon src={starIcon} alt="" />
              <DayButtonLabel>{item.day}</DayButtonLabel>
              <DayButtonDate>
                {dayDates[index].getMonth() + 1}/{dayDates[index].getDate()}
              </DayButtonDate>
            </DayButton>
          ))}
        </DayJumpRow>
      </DayJumpCard>

      {!isMine && (
        <>
          <SectionDivider />
          <JournalCta
            title={`이제 ${partnerLabel}와 안부를 나눠볼까요?`}
            message={detail.contactMessage}
            onCall={handleCall}
            onSendLetter={() => navigate('/home', { state: { openLetterbox: 'compose' } })}
          />
        </>
      )}

      {askingPhone && (
        <PhoneNumberPopup
          name={personLabel}
          onSaved={(phone) => {
            setAskingPhone(false);
            callPhone(phone);
          }}
          onClose={() => setAskingPhone(false)}
        />
      )}
    </Page>
  );
}

export default WeeklyReportDetail;
