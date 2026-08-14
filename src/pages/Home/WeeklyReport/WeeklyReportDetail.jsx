import { useNavigate, useLocation, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { WEEKS, WEEK_DETAILS } from './weeklyReportMock';

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

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 12px;
  border-bottom: 1px solid #e5e0d9;
`;

const BackButton = styled.button`
  width: 20px;
  font-size: 22px;
  color: #000;
  line-height: 1;
`;

const HeaderTitle = styled.p`
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  color: #000;
`;

const HeaderSpacer = styled.div`
  width: 20px;
`;

const FlowTitle = styled.h1`
  margin: 20px 0 0;
  font-size: 25px;
  font-weight: 600;
  color: #000;
`;

const DateRange = styled.p`
  margin: 4px 0 0;
  font-size: 14px;
  color: #8c8780;
`;

const HeadlineCard = styled.div`
  margin-top: 20px;
  padding: 20px 18px;
  border-radius: 16px;
  background: #e8734a;
  color: #fff;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const HeadlineTag = styled.p`
  margin: 0;
  font-size: 12px;
  font-weight: 500;
`;

const HeadlineTitle = styled.p`
  margin: 0;
  font-size: 20px;
  font-weight: 600;
`;

const HeadlineDesc = styled.p`
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
`;

const ColorLegend = styled.div`
  display: flex;
  gap: 14px;
  margin-top: 16px;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`;

const LegendDot = styled.span`
  width: 10px;
  height: 10px;
  border-radius: 5px;
  background: ${({ $color }) => $color};
`;

const LegendLabel = styled.span`
  font-size: 12px;
  color: #8c8780;
`;

const MetricCard = styled.div`
  margin-top: 16px;
  padding: 18px 16px;
  border-radius: 16px;
  background: #f7f5f0;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const MetricHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const MetricTitle = styled.p`
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  color: #000;
`;

const TrendArrow = styled.span`
  font-size: 20px;
  color: ${({ $trend }) => (($trend === 'down' && '#d1594d') || ($trend === 'up' && '#59a666') || '#8c8780')};
`;

const DotRow = styled.div`
  display: flex;
  justify-content: space-between;
`;

const DayCol = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
`;

const Dot = styled.span`
  width: 18px;
  height: 18px;
  border-radius: 9px;
  background: ${({ $color }) => $color};
`;

const DayLabel = styled.span`
  font-size: 11px;
  color: #8c8780;
`;

const BarRow = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  height: 70px;
`;

const BarCol = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  height: 70px;
  width: 30px;
`;

const Bar = styled.div`
  width: 18px;
  height: ${({ $height }) => $height}px;
  min-height: 4px;
  border-radius: 4px;
  background: ${({ $color }) => $color};
`;

const SleepLegend = styled.div`
  display: flex;
  gap: 10px;
`;

const SleepLegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const SleepLegendSwatch = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 2px;
  background: ${({ $color }) => $color};
`;

const SleepLegendLabel = styled.span`
  font-size: 11px;
  color: #8c8780;
`;

const MedRow = styled.div`
  display: flex;
  justify-content: space-between;
`;

const MedCircle = styled.span`
  width: 18px;
  height: 18px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  ${({ $taken }) => ($taken ? 'background: #e0f2e3; color: #59a666;' : 'border: 1.5px dashed #e5e0d9;')}
`;

const MetricNote = styled.p`
  margin: 0;
  font-size: 13px;
  font-weight: 500;
  color: ${({ $tone }) => (($tone === 'warn' && '#d1594d') || ($tone === 'good' && '#59a666') || '#6b6661')};
`;

const AdviceCard = styled.div`
  margin-top: 16px;
  padding: 18px;
  border-radius: 16px;
  background: #fae5d9;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const AdviceLabel = styled.p`
  margin: 0;
  font-size: 12px;
  font-weight: 500;
  color: #e8734a;
`;

const AdviceText = styled.p`
  margin: 0;
  font-size: 15px;
  color: #000;
`;

const CtaCard = styled.div`
  margin-top: 16px;
  padding: 20px;
  border-radius: 16px;
  background: #fae5d9;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
`;

const CtaTitle = styled.p`
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  color: #000;
  text-align: center;
`;

const SuggestedMessage = styled.div`
  width: 100%;
  padding: 10px 14px;
  border-radius: 10px;
  background: #fff;
  border: 1px solid #e5e0d9;
  box-sizing: border-box;
`;

const SuggestedMessageText = styled.p`
  margin: 0;
  font-size: 13px;
  color: #6b6661;
`;

const CtaButtonRow = styled.div`
  display: flex;
  gap: 10px;
  width: 100%;
`;

const CallButton = styled.button`
  flex: 1;
  height: 48px;
  border-radius: 10px;
  background: #fff;
  border: 1.5px solid #e8734a;
  color: #e8734a;
  font-size: 15px;
  font-weight: 600;
`;

const LetterButton = styled.button`
  flex: 1;
  height: 48px;
  border-radius: 10px;
  background: #e8734a;
  color: #fff;
  font-size: 15px;
  font-weight: 600;
`;

const DayJumpHint = styled.p`
  margin: 20px 0 0;
  font-size: 12px;
  color: #8c8780;
`;

const DayJumpRow = styled.div`
  display: flex;
  gap: 6px;
  margin-top: 24px;
`;

const DayButton = styled.div`
  flex: 1;
  height: 62px;
  border-radius: 12px;
  border: 1px solid #e5e0d9;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const DayButtonLabel = styled.span`
  font-size: 15px;
  font-weight: 500;
  color: #000;
`;

const DayButtonDate = styled.span`
  font-size: 10px;
  color: #8c8780;
`;

const SLEEP_COLOR = { good: '#59a666', ok: '#f2bf59', low: '#d96659' };
const sleepColor = (hours) => (hours >= 7 ? SLEEP_COLOR.good : hours >= 5 ? SLEEP_COLOR.ok : SLEEP_COLOR.low);
const STEP_MAX = 10000;

function WeeklyReportDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { weekId } = useParams();
  const person = location.state?.person ?? 'me';

  const week = WEEKS.find((w) => w.id === weekId);
  const detail = WEEK_DETAILS[weekId]?.[person];

  if (!week || !detail) {
    return (
      <Page>
        <Header>
          <BackButton type="button" onClick={() => navigate('/home/weekly-report')}>
            ‹
          </BackButton>
          <HeaderTitle>주간 리포트</HeaderTitle>
          <HeaderSpacer />
        </Header>
        <DateRange>이 주는 아직 리포트가 준비되지 않았어요.</DateRange>
      </Page>
    );
  }

  const personLabel = person === 'me' ? '나' : '엄마';

  const handleSendLetter = () => {
    navigate('/home', { state: { openLetterbox: 'compose' } });
  };

  return (
    <Page>
      <Header>
        <BackButton type="button" aria-label="뒤로가기" onClick={() => navigate('/home/weekly-report')}>
          ‹
        </BackButton>
        <HeaderTitle>{personLabel}의 {week.label}</HeaderTitle>
        <HeaderSpacer />
      </Header>

      <FlowTitle>{personLabel}의 이번 주 건강 흐름</FlowTitle>
      <DateRange>{week.range}</DateRange>

      <HeadlineCard>
        <HeadlineTag>✦ 이번 주 한마디</HeadlineTag>
        <HeadlineTitle>{detail.headline}</HeadlineTitle>
        <HeadlineDesc>{detail.headlineDesc}</HeadlineDesc>
      </HeadlineCard>

      <ColorLegend>
        <LegendItem>
          <LegendDot $color="#59a666" />
          <LegendLabel>좋아요</LegendLabel>
        </LegendItem>
        <LegendItem>
          <LegendDot $color="#f2bf59" />
          <LegendLabel>보통이에요</LegendLabel>
        </LegendItem>
        <LegendItem>
          <LegendDot $color="#d96659" />
          <LegendLabel>조금 아쉬워요</LegendLabel>
        </LegendItem>
      </ColorLegend>

      <MetricCard>
        <MetricHead>
          <MetricTitle>컨디션</MetricTitle>
          <TrendArrow $trend={detail.conditionTrend}>{detail.conditionTrend === 'down' ? '↘' : '→'}</TrendArrow>
        </MetricHead>
        <DotRow>
          {detail.condition.map((item) => (
            <DayCol key={item.day}>
              <Dot $color={item.color} />
              <DayLabel>{item.day}</DayLabel>
            </DayCol>
          ))}
        </DotRow>
        <MetricNote $tone={detail.conditionTrend === 'down' ? 'warn' : 'neutral'}>{detail.conditionNote}</MetricNote>
      </MetricCard>

      <MetricCard>
        <MetricHead>
          <MetricTitle>수면</MetricTitle>
          <TrendArrow $trend="flat">→</TrendArrow>
        </MetricHead>
        <BarRow>
          {detail.sleep.map((item) => (
            <BarCol key={item.day}>
              <Bar $height={(item.hours / 9) * 60} $color={sleepColor(item.hours)} />
              <DayLabel>{item.day}</DayLabel>
            </BarCol>
          ))}
        </BarRow>
        <SleepLegend>
          <SleepLegendItem>
            <SleepLegendSwatch $color={SLEEP_COLOR.good} />
            <SleepLegendLabel>7시간 이상</SleepLegendLabel>
          </SleepLegendItem>
          <SleepLegendItem>
            <SleepLegendSwatch $color={SLEEP_COLOR.ok} />
            <SleepLegendLabel>5~7시간</SleepLegendLabel>
          </SleepLegendItem>
          <SleepLegendItem>
            <SleepLegendSwatch $color={SLEEP_COLOR.low} />
            <SleepLegendLabel>5시간 미만</SleepLegendLabel>
          </SleepLegendItem>
        </SleepLegend>
        <MetricNote>{detail.sleepNote}</MetricNote>
      </MetricCard>

      <MetricCard>
        <MetricHead>
          <MetricTitle>식사</MetricTitle>
          <TrendArrow $trend="flat">→</TrendArrow>
        </MetricHead>
        <DotRow>
          {detail.meal.map((item) => (
            <DayCol key={item.day}>
              <Dot $color={item.color} />
              <DayLabel>{item.day}</DayLabel>
            </DayCol>
          ))}
        </DotRow>
        <MetricNote>{detail.mealNote}</MetricNote>
      </MetricCard>

      <MetricCard>
        <MetricHead>
          <MetricTitle>활동 (걸음 수)</MetricTitle>
          <TrendArrow $trend={detail.stepsTrend}>{detail.stepsTrend === 'down' ? '↘' : '→'}</TrendArrow>
        </MetricHead>
        <BarRow>
          {detail.steps.map((item) => (
            <BarCol key={item.day}>
              <Bar $height={(item.value / STEP_MAX) * 60} $color="#e8734a" />
              <DayLabel>{item.day}</DayLabel>
            </BarCol>
          ))}
        </BarRow>
        <MetricNote $tone={detail.stepsTrend === 'down' ? 'warn' : 'neutral'}>{detail.stepsNote}</MetricNote>
      </MetricCard>

      <MetricCard>
        <MetricHead>
          <MetricTitle>복약</MetricTitle>
          <TrendArrow $trend="up">→</TrendArrow>
        </MetricHead>
        <MedRow>
          {detail.medsTaken.map((item) => (
            <DayCol key={item.day}>
              <MedCircle $taken={item.taken}>{item.taken ? '✓' : ''}</MedCircle>
              <DayLabel>{item.day}</DayLabel>
            </DayCol>
          ))}
        </MedRow>
        <MetricNote $tone="good">{detail.medsNote}</MetricNote>
      </MetricCard>

      <AdviceCard>
        <AdviceLabel>✦ 다음 주 제안</AdviceLabel>
        <AdviceText>{detail.adviceText}</AdviceText>
      </AdviceCard>

      {person === 'mom' && (
        <CtaCard>
          <CtaTitle>엄마에게 연락해볼까요?</CtaTitle>
          <SuggestedMessage>
            <SuggestedMessageText>{detail.contactMessage}</SuggestedMessageText>
          </SuggestedMessage>
          <CtaButtonRow>
            <CallButton type="button">전화하기</CallButton>
            <LetterButton type="button" onClick={handleSendLetter}>
              편지 보내기
            </LetterButton>
          </CtaButtonRow>
        </CtaCard>
      )}

      <DayJumpHint>하루하루의 건강기록을 확인해보세요</DayJumpHint>
      <DayJumpRow>
        {['월', '화', '수', '목', '금', '토', '일'].map((day, index) => (
          <DayButton key={day}>
            <DayButtonLabel>{day}</DayButtonLabel>
            <DayButtonDate>{week.range.split(' - ')[0].split('/')[0]}/{Number(week.range.split(' - ')[0].split('/')[1]) + index}</DayButtonDate>
          </DayButton>
        ))}
      </DayJumpRow>
    </Page>
  );
}

export default WeeklyReportDetail;
