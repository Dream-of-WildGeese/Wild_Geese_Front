import { useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import styled from 'styled-components';
import aiIcon from '../../../assets/weekly/ai.png';
import faceGood from '../../../assets/weekly/face-good.png';
import faceNormal from '../../../assets/weekly/face-normal.png';
import faceBad from '../../../assets/weekly/face-bad.png';
import mealIcon from '../../../assets/weekly/meal.png';
import walkIcon from '../../../assets/weekly/walk.png';
import flowerIcon from '../../../assets/weekly/flower.png';
import medEmptyIcon from '../../../assets/weekly/med-empty.png';
import starIcon from '../../../assets/weekly/star.png';
import closeIcon from '../../../assets/journal/close.png';
import { loadWeeklyDetail } from './weeklyReportData';
import { useApi } from '../../../hooks/useApi';
import { useFamilyRelation } from '../../../hooks/useFamilyRelation';
import PhoneNumberPopup from '../../../components/PhoneNumberPopup';
import { callPhone, getFamilyPhone } from '../../../utils/call';
import JournalCta from '../TodayReport/JournalCta';

// Figma 34 / 34b: 주간 리포트 상세.
// 서버는 지표를 저녁 건강체크 선택지 점수(1~3)로만 주고, 3이 가장 좋은 상태다.
const SCORE_MAX = 3;
const FACE_BY_SCORE = { 3: faceGood, 2: faceNormal, 1: faceBad };
const BAR_COLOR = { 3: '#a8c256', 2: '#e8cd73', 1: '#e6a794' };

const scoreFace = (score) => FACE_BY_SCORE[Math.round(score)] ?? faceNormal;
const scoreBarHeight = (score, max) => (score ? (score / SCORE_MAX) * max : 4);
const scoreBarColor = (score) => BAR_COLOR[Math.round(score)] ?? '#d9d4cc';

const Page = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  box-sizing: border-box;

  padding: 16px 20px 30px;
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

const FlowTitle = styled.h1`
  margin: 0;
  width: 100%;
  text-align: center;
  color: #4a3a2f;
  font-family: Jua;
  font-size: 40px;
  font-weight: 400;
`;

const Divider = styled.div`
  width: 100%;
  height: 2px;
  background: rgba(74, 58, 47, 0.25);
`;

// 온담 한마디 / 다음 주 제안이 쓰는 연두색 카드
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

const GreenCardHead = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const AiIcon = styled.img`
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  object-fit: contain;
`;

const GreenLabel = styled.p`
  margin: 0;
  flex: 1;
  min-width: 0;
  color: #5b7a2e;
  font-family: 'Noto Sans KR';
  font-size: 18px;
  font-weight: 700;
`;

const Headline = styled.p`
  margin: 0;
  width: 100%;
  color: #4a3a2f;
  font-family: 'Noto Sans KR';
  font-size: 20px;
  font-weight: 700;
`;

const GreenText = styled.p`
  margin: 0;
  width: 100%;
  color: #6b6661;
  font-family: 'Noto Sans KR';
  font-size: 16px;
  line-height: 1.5;
`;

const MetricCard = styled.div`
  width: 100%;
  padding: 18px 16px;

  display: flex;
  flex-direction: column;
  gap: 12px;

  border-radius: 18px;
  border: 1.5px solid rgba(74, 58, 47, 0.4);
  background: rgba(255, 255, 255, 0.55);
`;

const MetricTitle = styled.p`
  margin: 0;
  color: #4a3a2f;
  font-family: 'Noto Sans KR';
  font-size: 16px;
  font-weight: 700;
`;

const DayRow = styled.div`
  width: 100%;
  display: flex;
  align-items: ${({ $bottom }) => ($bottom ? 'flex-end' : 'flex-start')};
  justify-content: space-between;
`;

const DayCol = styled.div`
  width: 30px;
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

const FaceIcon = styled.img`
  width: 32px;
  height: 32px;
  object-fit: contain;
`;

const Bar = styled.div`
  width: 30px;
  height: ${({ $height }) => $height}px;
  border-radius: 8px;
  background: ${({ $color }) => $color};
`;

const MedIcon = styled.img`
  width: ${({ $taken }) => ($taken ? 36 : 26)}px;
  height: ${({ $taken }) => ($taken ? 36 : 26)}px;
  object-fit: contain;
`;

const Legend = styled.div`
  display: flex;
  gap: 14px;
  align-items: center;
  flex-wrap: wrap;
`;

const LegendItem = styled.div`
  display: flex;
  gap: 5px;
  align-items: center;
`;

const LegendIcon = styled.img`
  width: 20px;
  height: 20px;
  object-fit: contain;
`;

const LegendSwatch = styled.span`
  width: 14px;
  height: 14px;
  border-radius: 4px;
  background: ${({ $color }) => $color};
`;

const LegendLabel = styled.span`
  color: #6b6661;
  font-family: 'Noto Sans KR';
  font-size: 13px;
  font-weight: 500;
`;

const MetricNote = styled.p`
  margin: 0;
  width: 100%;
  color: #6b6661;
  font-family: 'Noto Sans KR';
  font-size: 16px;
  line-height: 1.5;
`;

const DayJumpCard = styled.div`
  width: 100%;
  padding: 18px 2px;

  display: flex;
  flex-direction: column;
  gap: 12px;

  border-radius: 18px;
  border: 1.5px solid rgba(74, 58, 47, 0.4);
`;

const DayJumpHint = styled.p`
  margin: 0;
  width: 100%;
  padding: 0 14px;
  color: #6b6661;
  font-family: 'Noto Sans KR';
  font-size: 15px;
  font-weight: 500;
`;

const DayJumpRow = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 0 6px;
`;

const DayButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
`;

const StarIcon = styled.img`
  width: 44px;
  height: 44px;
  object-fit: contain;
`;

const DayButtonLabel = styled.span`
  color: #8c8780;
  font-family: 'Noto Sans KR';
  font-size: 12px;
  font-weight: 700;
`;

const StatusText = styled.p`
  margin: 40px 0 0;
  text-align: center;
  color: #a79c8e;
  font-family: 'Noto Sans KR';
  font-size: 15px;
`;

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

  return (
    <Page>
      <CloseButton type="button" aria-label="닫기" onClick={goBack}>
        <CloseIcon src={closeIcon} alt="" />
      </CloseButton>

      <HeaderBlock>
        <DateRange>{week.range}</DateRange>
        <FlowTitle>{personLabel}의 이번 주 건강 흐름</FlowTitle>
        <Divider />
      </HeaderBlock>

      <GreenCard>
        <GreenCardHead>
          <AiIcon src={aiIcon} alt="" />
          <GreenLabel>이번 주 한마디</GreenLabel>
        </GreenCardHead>
        <Headline>“{detail.headline}”</Headline>
        {detail.headlineDesc && <GreenText>{detail.headlineDesc}</GreenText>}
      </GreenCard>

      <Divider />

      <MetricCard>
        <MetricTitle>컨디션</MetricTitle>
        <DayRow>
          {detail.condition.map((item) => (
            <DayCol key={item.day}>
              <FaceIcon src={scoreFace(item.score)} alt="" />
              <DayLabel>{item.day}</DayLabel>
            </DayCol>
          ))}
        </DayRow>
        <Legend>
          <LegendItem>
            <LegendIcon src={faceGood} alt="" />
            <LegendLabel>좋아요</LegendLabel>
          </LegendItem>
          <LegendItem>
            <LegendIcon src={faceNormal} alt="" />
            <LegendLabel>보통이에요</LegendLabel>
          </LegendItem>
          <LegendItem>
            <LegendIcon src={faceBad} alt="" />
            <LegendLabel>조금 아쉬워요</LegendLabel>
          </LegendItem>
        </Legend>
        <MetricNote>{detail.conditionNote}</MetricNote>
      </MetricCard>

      <MetricCard>
        <MetricTitle>수면</MetricTitle>
        <DayRow $bottom style={{ height: 70 }}>
          {detail.sleep.map((item) => (
            <DayCol key={item.day} $gap={4}>
              <Bar $height={scoreBarHeight(item.value, 48)} $color={scoreBarColor(item.value)} />
              <DayLabel>{item.day}</DayLabel>
            </DayCol>
          ))}
        </DayRow>
        <Legend>
          {[
            { score: 3, label: '푹 잤어요' },
            { score: 2, label: '조금 부족했어요' },
            { score: 1, label: '거의 못 잤어요' },
          ].map((item) => (
            <LegendItem key={item.score}>
              <LegendSwatch $color={BAR_COLOR[item.score]} />
              <LegendLabel>{item.label}</LegendLabel>
            </LegendItem>
          ))}
        </Legend>
        <MetricNote>{detail.sleepNote}</MetricNote>
      </MetricCard>

      <MetricCard>
        <MetricTitle>식사</MetricTitle>
        <DayRow>
          {detail.meal.map((item) => (
            <DayCol key={item.day}>
              <FaceIcon
                src={mealIcon}
                alt=""
                style={{ opacity: item.score ? 0.35 + (item.score / SCORE_MAX) * 0.65 : 0.25 }}
              />
              <DayLabel>{item.day}</DayLabel>
            </DayCol>
          ))}
        </DayRow>
        <MetricNote>{detail.mealNote}</MetricNote>
      </MetricCard>

      <MetricCard>
        <MetricTitle>활동</MetricTitle>
        <DayRow $bottom style={{ height: 108 }}>
          {detail.steps.map((item) => (
            <DayCol key={item.day}>
              <LegendIcon src={walkIcon} alt="" style={{ width: 30, height: 30 }} />
              <Bar $height={scoreBarHeight(item.value, 40)} $color={scoreBarColor(item.value)} />
              <DayLabel>{item.day}</DayLabel>
            </DayCol>
          ))}
        </DayRow>
        <MetricNote>{detail.stepsNote}</MetricNote>
      </MetricCard>

      <MetricCard>
        <MetricTitle>복약</MetricTitle>
        {/* 서버가 요일별 복약을 안 줘서, 주 단위 합계만큼 앞에서부터 채워 보여준다 */}
        <DayRow>
          {['월', '화', '수', '목', '금', '토', '일'].map((day, index) => {
            const taken = index < detail.medsTakenCount;
            return (
              <DayCol key={day}>
                <MedIcon $taken={taken} src={taken ? flowerIcon : medEmptyIcon} alt="" />
                <DayLabel>{day}</DayLabel>
              </DayCol>
            );
          })}
        </DayRow>
        <MetricNote>
          {detail.medsTotal > 0
            ? `이번 주 ${detail.medsTotal}번 중 ${detail.medsTakenCount}번 챙기셨어요.`
            : detail.medsNote}
        </MetricNote>
      </MetricCard>

      {detail.adviceText && (
        <GreenCard>
          <GreenCardHead>
            <AiIcon src={aiIcon} alt="" />
            <GreenLabel>다음 주 제안</GreenLabel>
          </GreenCardHead>
          <GreenText>{detail.adviceText}</GreenText>
        </GreenCard>
      )}

      <Divider />

      <DayJumpCard>
        <DayJumpHint>하루하루의 건강기록을 확인해보세요</DayJumpHint>
        <DayJumpRow>
          {['월', '화', '수', '목', '금', '토', '일'].map((day) => (
            <DayButton key={day} type="button" onClick={() => navigate('/home/today-report')}>
              <StarIcon src={starIcon} alt="" />
              <DayButtonLabel>{day}</DayButtonLabel>
            </DayButton>
          ))}
        </DayJumpRow>
      </DayJumpCard>

      {!isMine && (
        <>
          <Divider />
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
