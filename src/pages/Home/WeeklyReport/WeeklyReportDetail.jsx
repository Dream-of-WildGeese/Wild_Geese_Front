import { useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import styled from 'styled-components';
import aiIcon from '../../../assets/weekly/ai.png';
import leafIcon from '../../../assets/weekly/leaf.png';
import mealIcon from '../../../assets/weekly/meal.png';
import walkIcon from '../../../assets/weekly/walk.png';
import flowerIcon from '../../../assets/weekly/flower.png';
import emptyCircleIcon from '../../../assets/weekly/empty-circle.png';
import starIcon from '../../../assets/weekly/star.png';
import { loadWeeklyDetail } from './weeklyReportData';
import { useApi } from '../../../hooks/useApi';
import { useFamilyRelation } from '../../../hooks/useFamilyRelation';
import PhoneNumberPopup from '../../../components/PhoneNumberPopup';
import { callPhone, getFamilyPhone } from '../../../utils/call';
import JournalCta from '../TodayReport/JournalCta';
import { toDateString } from '../../../utils/medication';
import {
  PopupBackdrop,
  PopupCard,
  PopupInnerBorder,
  PopupTitle,
  PopupPrimaryButton,
} from '../../../components/PopupShell';
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

// Figma 1201:1144 — 주간 리포트 상세.
// 서버는 지표를 저녁 건강체크 선택지 점수(1~3)로만 주고, 3이 가장 좋은 상태다.
const SCORE_MAX = 3;

// 컨디션 링과 수면 막대가 같은 3색을 쓴다.
const SCORE_COLOR = { 3: '#8fae4a', 2: '#e8cd73', 1: '#e6a794' };
// 활동은 수면과 구분되도록 초록 계열 안에서만 진하기를 달리한다.
const ACTIVITY_COLOR = { 3: '#8fae4a', 2: '#acc379', 1: '#d0ddb2' };

const scoreColor = (score) => SCORE_COLOR[Math.round(score)] ?? '#d9d4cc';
const activityColor = (score) => ACTIVITY_COLOR[Math.round(score)] ?? '#d9d4cc';
const barHeight = (score, max) => (score ? (score / SCORE_MAX) * max : 4);


// 이름이 길어지면 40px에서 두 줄로 넘쳐 카드를 밀어낸다. 폰 프레임(최대 402px) 안에서
// 늘 한 줄에 들어가도록 34px로 고정하고 줄바꿈을 막는다.
const FlowTitle = styled(PageTitle)`
  white-space: nowrap;
  word-break: keep-all;
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

// 컨디션은 표정 그림 대신 점수 색만 칠한 동그라미로 보여준다.
const ConditionDot = styled.span`
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  border: 1.5px solid rgba(74, 58, 47, 0.2);
`;

const IconWrap = styled.div`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MealIcon = styled.img`
  width: 40px;
  height: 40px;
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

// 컨디션 범례도 그래프와 같은 색 동그라미로 맞춘다.
const LegendDot = styled.span`
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  border: 1.5px solid rgba(74, 58, 47, 0.2);
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
  padding: 20px 8px 16px;
  box-sizing: border-box;

  display: flex;
  flex-direction: column;
  gap: 14px;

  border-radius: 18px;
  border: 1.5px solid rgba(74, 58, 47, 0.4);
`;

const DayJumpHint = styled.p`
  margin: 0;
  width: 100%;
  text-align: center;
  color: #4a3a2f;
  font-family: Jua;
  font-size: 19px;
  word-break: keep-all;
`;

// 별 7개가 카드 폭을 꽉 채운다. 고정 폭을 주면 좁은 화면에서 넘쳐서 비율로 나눈다.
const DayJumpRow = styled.div`
  width: 100%;
  display: flex;
  align-items: flex-start;
  gap: 2px;
`;

// 별 크기가 화면 폭에 따라 달라져서 좌표를 고정하면 글자가 어긋난다.
// 별을 감싼 상자를 기준으로 요일은 한가운데, 날짜는 그 아래로 흐르게 둔다.
const DayButton = styled.button`
  flex: 1;
  min-width: 0;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
`;

const StarWrap = styled.span`
  position: relative;
  width: 100%;
  max-width: 52px;
  aspect-ratio: 1;

  display: flex;
  align-items: center;
  justify-content: center;
`;

const StarIcon = styled.img`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

// 요일 글자는 별 그림 한가운데에 얹는다. 별 몸통(뾰족한 꼭짓점 안쪽)이
// 생각보다 좁아서, 15px로는 글자가 꼭짓점 밖으로 삐져나왔다.
const DayButtonLabel = styled.span`
  position: relative;
  color: #4a3a2f;
  font-family: Jua;
  font-size: 11px;
  line-height: 1;
`;

const DayButtonDate = styled.span`
  color: #4a3a2f;
  font-family: Jua;
  font-size: 13px;
  line-height: 1;
  white-space: nowrap;
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
  // 아직 오지 않은 날의 일지를 열려고 할 때 알려줄 날짜
  const [futureDate, setFutureDate] = useState(null);

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
      <PageFrame>
        <PageContent>
          <PageBack onClick={goBack} />
          <StatusText>
            {loading
              ? '리포트를 불러오는 중이에요...'
              : error
                ? error.message
                : '이 주는 아직 리포트가 준비되지 않았어요.'}
          </StatusText>
        </PageContent>
      </PageFrame>
    );
  }

  // weekId는 그 주 월요일('2026-08-03'). 요일 버튼마다 실제 날짜를 붙인다.
  const weekStart = new Date(`${weekId}T00:00:00`);
  const dayDates = detail.condition.map((_, index) => {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + index);
    return date;
  });
  const todayString = toDateString(new Date());

  // 이번 주 리포트에서는 아직 지나지 않은 요일도 함께 보인다.
  // 그 날을 누르면 빈 일지가 열려서 기록이 사라진 것처럼 보이므로, 미리 막고 알려준다.
  const openDay = (date) => {
    const dateParam = toDateString(date);
    if (dateParam > todayString) {
      setFutureDate(date);
      return;
    }
    navigate(`/home/today-report/${dateParam}`, {
      // 일지에서 뒤로 가면 홈이 아니라 이 주간 리포트로 돌아오게 한다.
      state: { person, from: `/home/weekly-report/${weekId}` },
    });
  };

  return (
    <PageFrame>
      <PageContent>
        <PageBack onClick={goBack} />
        <PageHeader>
          <PageCaption>{week.range}</PageCaption>
          <FlowTitle $size={34}>{personLabel}의 이번 주 건강 흐름</FlowTitle>
        </PageHeader>
        <PageDivider />

        <PageScrollArea $gap={20}>
          {/* 한 주가 다 차야 한마디를 만든다. 쌓이는 중인 주는 카드 자체를 띄우지 않는다. */}
          {!detail.inProgress && detail.headline && (
            <>
              <GreenCard>
                <AiIcon src={aiIcon} alt="" />
                <GreenLabel>이번 주 한마디</GreenLabel>
                <Headline>“{detail.headline}”</Headline>
                {detail.headlineDesc && <GreenText>{detail.headlineDesc}</GreenText>}
              </GreenCard>

              <SectionDivider />
            </>
          )}

          <MetricCard>
            <MetricHead>
              <LeafIcon src={leafIcon} alt="" />
              <MetricTitle>컨디션</MetricTitle>
            </MetricHead>
            <InnerGroup>
              <DayRow>
                {detail.condition.map((item) => (
                  <DayCol key={item.day}>
                    {/* 아직 답하지 않은 날은 빈 원으로 둔다. 표정을 채우면 기록한 것처럼 보인다 */}
                    {item.score ? (
                      <ConditionDot $size={40} $color={scoreColor(item.score)} />
                    ) : (
                      <IconWrap>
                        <EmptyCircle src={emptyCircleIcon} alt="" />
                      </IconWrap>
                    )}
                    <DayLabel>{item.day}</DayLabel>
                  </DayCol>
                ))}
              </DayRow>
              <Legend>
                {CONDITION_LEGEND.map((item) => (
                  <LegendItem key={item.score}>
                    <LegendDot $color={SCORE_COLOR[item.score]} />
                    <LegendLabel>{item.label}</LegendLabel>
                  </LegendItem>
                ))}
              </Legend>
            </InnerGroup>
            {detail.conditionNote && <MetricNote>{detail.conditionNote}</MetricNote>}
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
            {detail.sleepNote && <MetricNote>{detail.sleepNote}</MetricNote>}
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
                      {/* 기록이 없거나(null) 끼니를 거른 날(1점, '한 끼만 먹었어요')은 빈 원으로 둔다 */}
                      {item.score > 1 ? (
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
            {detail.mealNote && <MetricNote>{detail.mealNote}</MetricNote>}
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
            {detail.stepsNote && <MetricNote>{detail.stepsNote}</MetricNote>}
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
            {detail.medsNote && <MetricNote>{detail.medsNote}</MetricNote>}
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
            <DayJumpHint>하루하루의 건강기록을 확인해보세요</DayJumpHint>
            <DayJumpRow>
              {detail.condition.map((item, index) => (
                <DayButton
                  key={item.day}
                  type="button"
                  onClick={() => openDay(dayDates[index])}
                >
                  <StarWrap>
                    <StarIcon src={starIcon} alt="" />
                    <DayButtonLabel>{item.day}</DayButtonLabel>
                  </StarWrap>
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

        </PageScrollArea>

        {futureDate && (
          <PopupBackdrop onClick={() => setFutureDate(null)}>
            <PopupCard $center $gap={16} $padTop={36} onClick={(event) => event.stopPropagation()}>
              <PopupInnerBorder />
              <PopupTitle $center $size={22}>
                아직 오지 않은 날이에요
              </PopupTitle>
              <PopupMessage>
                {futureDate.getMonth() + 1}월 {futureDate.getDate()}일의 기록은
                <br />
                그 날이 되면 볼 수 있어요.
              </PopupMessage>
              <PopupPrimaryButton type="button" onClick={() => setFutureDate(null)}>
                알겠어요
              </PopupPrimaryButton>
            </PopupCard>
          </PopupBackdrop>
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
      </PageContent>
    </PageFrame>
  );
}

export default WeeklyReportDetail;
