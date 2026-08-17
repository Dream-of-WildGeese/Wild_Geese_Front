import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { loadTodayReport } from './todayReportData';
import { useApi } from '../../../hooks/useApi';

import back from '../../../assets/onboarding/back.svg';
import aiIcon from '../../../assets/TodayReport/ai아이콘.svg';
import sunIcon from '../../../assets/TodayReport/해아이콘.svg';
import moonIcon from '../../../assets/TodayReport/달아이콘.svg';
import checkIcon from '../../../assets/TodayReport/체크아이콘.svg';
import flowerPink from '../../../assets/TodayReport/Flower-pink.svg';
import flowerYellow from '../../../assets/TodayReport/Flower-yellow.svg';
import sleepIcon from '../../../assets/TodayReport/잠 아이콘.svg';
import mealIcon from '../../../assets/TodayReport/식사 아이콘.svg';
import walkIcon from '../../../assets/TodayReport/산책 아이콘.svg';
import bodyIcon from '../../../assets/TodayReport/몸상태 아이콘.svg';
import conditionIcon from '../../../assets/TodayReport/컨디션 아이콘.svg';
import pillIcon from '../../../assets/TodayReport/pill.svg';

const Page = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  background: #FFF8ED;
  padding: 16px 20px 30px;
  box-sizing: border-box;

  &::-webkit-scrollbar {
    display: none;
  }
`;
const BackButton = styled.button`
  position: absolute;
  top: 18px;
  left: 20px;

  width: 36px;
  height: 36px;
  padding: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  background: transparent;
  z-index: 10;
`;
const Header = styled.div`
  margin-top: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
`;

const BackIcon = styled.img`
  width: 36px;
  height: 36px;
`;

const DateLabel = styled.p`
  margin: 0;
  font-size: 14px;
  color: #8c8780;
  text-align: center;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 25px;
  font-weight: 700;
  color: #4a3a2f;
  text-align: center;
`

const Divider = styled.div`
  width: 100%;
  border-top: 2px dashed #D8D0C7;
  margin: 12px 0 20px;
`;

const ToggleWrap = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 18px;
`;

const ToggleTab = styled.button`
  flex: 1;
  height: 56px;
  border-radius: 20px;
  border: 1.5px solid ${({ $active }) => ($active ? '#D9B4A3' : '#E9E3A8')};

  background: #FFFDF8;
  color: ${({ $active }) => ($active ? '#B66C54' : '#B89A36')};

  font-family: "Noto Sans KR";
  font-size: 18px;
  font-weight: 700;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 22px;
  gap: 12px;
`;

const SummaryChip = styled.div`
  flex: 1;
  aspect-ratio: 1;
  max-width: 92px;

  border-radius: 50%;
  border: 1.5px solid #CFC6BA;
  background: #FFFDF8;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
`;

const SummaryValue = styled.span`
  font-size: 24px;
  font-weight: 700;
  line-height: 1;
`;

const SummaryLabel = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: #7A6B5D;
`;

const AiInsightCard = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  margin-top: 20px;
  padding: 18px 16px;
  border-radius: 20px;
  background: #E8F4E8;
`;

const AiBadge = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const AiBadgeImg = styled.img`
  width: 42px;
  height: 42px;
`;

const AiTextCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const AiLabel = styled.p`
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: #5BAA6A;
`;

const AiComment = styled.p`
  margin: 0;
  font-size: 15px;
  line-height: 1.5;
  color: #2F2F2F;
  font-weight: 500;
`;

const StepRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  margin-top: 18px;
  padding: 16px;

  border-radius: 20px;
  background: #E8F4E8;
`;

const StepIconBadge = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 42px;
    height: 42px;
  }
`;

const StepText = styled.p`
  margin: 0;
  flex: 1;

  font-size: 15px;
  line-height: 1.5;
  font-weight: 500;

  color: #2F2F2F;
`;

const Timeline = styled.div`
  margin-top: 28px;
  display: flex;
  flex-direction: column;
`;

const TimelineEntry = styled.div`
  display: flex;
  gap: 14px;

  & + & {
    margin-top: 20px;
  }
`;

const Rail = styled.div`
  width: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
`;

const RailDot = styled.div`
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #7DBA67;
  flex-shrink: 0;
`;

const RailLine = styled.div`
  width: 2px;
  flex: 1;
  margin-top: 6px;
  background: #D7E8D2;
`;

const TimelineContent = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const TimeLabel = styled.p`
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: #8C8780;
`;

const EntryCard = styled.div`
  padding: 18px 16px;
  border-radius: 20px;
  background: #FFF;
  border: 1px solid #ECE7DF;

  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const CardHead = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CardIconBadge = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 50%;

  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  background: ${({ $type }) => {
    switch ($type) {
      case 'question':
        return '#FFF3D9';
      case 'medication':
        return 'transparent'; // 체크 아이콘 자체에 원이 있어서 배경 제거
      case 'health':
        return '#E9E1F8';
      default:
        return '#F7F5F0';
    }
  }};
`;

const CardIconImg = styled.img`
  width: 28px;
  height: 28px;
`;
const CardTitle = styled.p`
  margin: 0;
  font-size: 15px;
  font-weight: 500;
  color: #000;
`;

const QuestionRow = styled.div`
  display: flex;
  align-items: center;
  
`;

const QuestionLabel = styled.span`
  font-size: 13px;
  color: #6b6661;
`;

const QuestionAnswer = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: #000;
  margin-left:6px;
`;

const MedRow = styled.div`
  display: flex;
  gap: 22px;
  margin: 6px 0;
`;

const MedItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
`;

const MedCircle = styled.div`
  width: 44px;
  height: 44px;

  display: flex;
  align-items: center;
  justify-content: center;

  ${({ $taken }) =>
    !$taken &&
    `
      border: 2px dashed #DDD3C8;
      border-radius: 50%;
    `}

  img {
    width: 28px;
    height: 28px;
  }
`;

const MedLabel = styled.p`
  margin: 0;
  font-size: 13px;
  font-weight: 700;

  color: ${({ $textColor, $taken }) =>
    $taken ? $textColor : '#8C8780'};
`;

const MedNote = styled.p`
  margin: 0;
  font-size: 13px;
  font-weight: 500;
  color: #6E9A3A;;
`;

const SentenceLine = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const MiniBadge = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;

  background: #EEF3D8;

  display: flex;
  align-items: center;
  justify-content: center;

  flex-shrink: 0;
`;

const MiniIcon = styled.img`
  width: 14px;
  height: 14px;
`;
const SentenceText = styled.p`
  margin: 0;
  flex: 1;
  font-size: 14px;
  color: #6b6661;
`;

const EntryAiComment = styled.div`
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const EntryAiIcon = styled.span`
  display: flex;
  align-items: center;

  img {
    width: 14px;
    height: 14px;
  }
`;

const EntryAiText = styled.p`
  margin: 0;
  flex: 1;
  font-size: 13px;
  font-weight: 500;
  color: #6E9A3A;
`;

const CtaCard = styled.div`
  margin-top: 24px;
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
  font-size: 16px;
  font-weight: 500;
  color: #e8734a;
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

function TodayReport() {
  const navigate = useNavigate();
  const handleBack = () => {
    navigate(-1);
  };
  const [person, setPerson] = useState('me');
  const { data: report, loading, error } = useApi(loadTodayReport, { args: [person] });

  const handleSendLetter = () => {
    navigate('/home', { state: { openLetterbox: 'compose' } });
  };

  if (loading || error || !report) {
    return (
      <Page>
        <Title>오늘의 건강일지</Title>
        <AiComment>
          {loading
            ? '리포트를 불러오는 중이에요...'
            : error
            ? error.message
            : '아직 연결된 가족이 없어요.'}
        </AiComment>
      </Page>
    );
  }

  return (
    <Page>
      <BackButton type="button" onClick={handleBack}>
        <BackIcon src={back} alt="뒤로가기" />
      </BackButton>
        <Header>
      <DateLabel>{report.dateLabel}</DateLabel>
      <Title>오늘의 건강일지</Title>
    </Header>
      <Divider />

      <ToggleWrap>
        <ToggleTab
          type="button"
          $active={person === 'me'}
          onClick={() => setPerson('me')}
        >
          나
        </ToggleTab>

        <ToggleTab
          type="button"
          $active={person === 'family'}
          onClick={() => setPerson('family')}
        >
          {report.partnerLabel}
        </ToggleTab>
      </ToggleWrap>

      <SummaryRow>
        <SummaryChip $color="#7A6B5D">
          <SummaryLabel>질문 답변</SummaryLabel>
          <SummaryValue>{report.summary.questionStatus}</SummaryValue>
        </SummaryChip>

        <SummaryChip $color="#7A6B5D">
          <SummaryLabel>복약</SummaryLabel>
          <SummaryValue>{report.summary.medication}</SummaryValue>
        </SummaryChip>

        <SummaryChip $color="#7A6B5D">
          <SummaryLabel>컨디션</SummaryLabel>
          <SummaryValue>{report.summary.condition}</SummaryValue>
        </SummaryChip>
      </SummaryRow>

      {report.aiComment && (
        <AiInsightCard>
          <AiBadge>
            <AiBadgeImg src={aiIcon} alt="AI" />
          </AiBadge>

          <AiTextCol>
            <AiLabel>온담 한마디</AiLabel>
            <AiComment>{report.aiComment}</AiComment>
          </AiTextCol>
        </AiInsightCard>
      )}

      {report.stepMessage && (
        <StepRow>
          <StepIconBadge>
            <img src={walkIcon} alt="" />
          </StepIconBadge>

          <StepText>{report.stepMessage}</StepText>
        </StepRow>
      )}

      <Timeline>
        {report.timeline.map((entry, index) => {
          const isLast = index === report.timeline.length - 1;

          return (
            <TimelineEntry key={`${entry.type}-${entry.time}-${index}`}>
              <Rail>
                <RailDot />
                {!isLast && <RailLine />}
              </Rail>

              <TimelineContent>
                <TimeLabel>{entry.time}</TimeLabel>

                <EntryCard>
                  {entry.type === 'question' && (
                    <>
                      <CardHead>
                        <CardIconBadge $type="question">
                          <CardIconImg src={sunIcon} alt="" />
                        </CardIconBadge>

                        <CardTitle>오늘의 질문</CardTitle>
                      </CardHead>

                      <QuestionRow>
                        <QuestionLabel>{entry.question}</QuestionLabel>
                        <QuestionAnswer>{entry.answer}</QuestionAnswer>
                      </QuestionRow>
                    </>
                  )}

                  {entry.type === 'medication' && (
                    <>
                      <CardHead>
                        <CardIconBadge $type="medication">
                          <CardIconImg src={pillIcon} alt="복약" />
                        </CardIconBadge>

                        <CardTitle>복약 체크</CardTitle>
                      </CardHead>

                      <MedRow>
                        {entry.medications.map((med, i) => (
                          <MedItem key={`${med.name}-${i}`}>
                            <MedCircle
                              $taken={med.taken}
                              $color={med.color}
                              $textColor={med.textColor}
                            >
                              {med.taken ? (
                                <img
                                  src={i % 2 === 0 ? flowerYellow : flowerPink}
                                  alt=""
                                />
                              ) : (
                                ''
                              )}
                            </MedCircle>

                            <MedLabel
                              $taken={med.taken}
                              $textColor={med.textColor}
                            >
                              {med.name}
                            </MedLabel>
                          </MedItem>
                        ))}
                      </MedRow>

                      <MedNote>{entry.note}</MedNote>
                    </>
                  )}

                  {entry.type === 'healthcheck' && (
                    <>
                      <CardHead>
                        <CardIconBadge $type="health">
                          <CardIconImg src={moonIcon} alt="" />
                        </CardIconBadge>

                        <CardTitle>건강 체크</CardTitle>
                      </CardHead>

                      {entry.lines.map((line, i) => {
                        const iconMap = {
                          '♥': conditionIcon,
                          Z: sleepIcon,
                          M: mealIcon,
                          A: walkIcon,
                          B: bodyIcon,
                        };

                        return (
                          <SentenceLine key={`${line.text}-${i}`}>
                            <MiniBadge>
                              <MiniIcon
                                src={iconMap[line.icon] ?? aiIcon}
                                alt=""
                              />
                            </MiniBadge>

                            <SentenceText>{line.text}</SentenceText>
                          </SentenceLine>
                        );
                      })}

                      <EntryAiComment>
                        <EntryAiIcon>
                          <img src={aiIcon} alt="" />
                        </EntryAiIcon>

                        <EntryAiText>{entry.aiComment}</EntryAiText>
                      </EntryAiComment>
                    </>
                  )}
                </EntryCard>
              </TimelineContent>
            </TimelineEntry>
          );
        })}
      </Timeline>

      {report.cta && (
        <CtaCard>
          <CtaTitle>{report.cta.title}</CtaTitle>

          <SuggestedMessage>
            <SuggestedMessageText>
              {report.cta.suggestedMessage}
            </SuggestedMessageText>
          </SuggestedMessage>

          <CtaButtonRow>
            <CallButton type="button">전화하기</CallButton>

            <LetterButton type="button" onClick={handleSendLetter}>
              편지 보내기
            </LetterButton>
          </CtaButtonRow>
        </CtaCard>
      )}
    </Page>
  );
}

export default TodayReport;