import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { TODAY_REPORT } from './todayReportMock';

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

const DateLabel = styled.p`
  margin: 0;
  font-size: 14px;
  color: #8c8780;
`;

const Title = styled.h1`
  margin: 4px 0 0;
  font-size: 25px;
  font-weight: 600;
  color: #000;
`;

const ToggleWrap = styled.div`
  display: flex;
  gap: 4px;
  height: 46px;
  padding: 4px;
  margin-top: 16px;
  border-radius: 12px;
  background: #f7f5f0;
`;

const ToggleTab = styled.button`
  flex: 1;
  border-radius: 9px;
  font-size: 15px;
  font-weight: ${({ $active }) => ($active ? 600 : 400)};
  color: ${({ $active }) => ($active ? '#000' : '#8c8780')};
  background: ${({ $active }) => ($active ? '#fff' : 'transparent')};
`;

const SummaryRow = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 24px;
`;

const SummaryChip = styled.div`
  flex: 1;
  height: 64px;
  border-radius: 12px;
  background: ${({ $bg }) => $bg};
  color: ${({ $color }) => $color};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
`;

const SummaryValue = styled.span`
  font-size: 16px;
  font-weight: 600;
`;

const SummaryLabel = styled.span`
  font-size: 11px;
`;

const AiInsightCard = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  margin-top: 16px;
  padding: 14px;
  border-radius: 14px;
  background: #fae5d9;
`;

const AiBadge = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 16px;
  background: #e8734a;
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const AiTextCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const AiLabel = styled.p`
  margin: 0;
  font-size: 12px;
  font-weight: 500;
  color: #e8734a;
`;

const AiComment = styled.p`
  margin: 0;
  font-size: 14px;
  color: #000;
`;

const StepRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  height: 50px;
  margin-top: 36px;
  padding: 0 14px;
  border-radius: 12px;
  background: #e0ebfc;
`;

const StepIconBadge = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 12px;
  background: #4d80d9;
  color: #fff;
  font-size: 10px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StepText = styled.p`
  margin: 0;
  flex: 1;
  font-size: 13px;
  font-weight: 500;
  color: #4d80d9;
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
  width: 10px;
  height: 10px;
  border-radius: 5px;
  background: #e8734a;
  flex-shrink: 0;
`;

const RailLine = styled.div`
  width: 2px;
  flex: 1;
  margin-top: 4px;
  background: #e5e0d9;
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
  font-size: 12px;
  font-weight: 500;
  color: #8c8780;
`;

const EntryCard = styled.div`
  padding: 14px;
  border-radius: 14px;
  background: #f7f5f0;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const CardHead = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CardIconBadge = styled.div`
  width: 26px;
  height: 26px;
  border-radius: 8px;
  background: #fae5d9;
  color: #e8734a;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
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
  justify-content: space-between;
`;

const QuestionLabel = styled.span`
  font-size: 13px;
  color: #6b6661;
`;

const QuestionAnswer = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: #000;
`;

const MedRow = styled.div`
  display: flex;
  gap: 16px;
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
  border-radius: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 600;
  ${({ $taken, $color, $textColor }) =>
    $taken
      ? `background: ${$color}; color: ${$textColor};`
      : 'border: 1.5px dashed #e5e0d9;'}
`;

const MedLabel = styled.p`
  margin: 0;
  font-size: 12px;
  font-weight: 500;
  color: ${({ $taken, $textColor }) => ($taken ? $textColor : '#8c8780')};
`;

const MedNote = styled.p`
  margin: 0;
  font-size: 13px;
  font-weight: 500;
  color: #e8734a;
`;

const SentenceLine = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const MiniBadge = styled.div`
  width: 22px;
  height: 22px;
  border-radius: 11px;
  background: #fae5d9;
  color: #e8734a;
  font-size: 11px;
  font-weight: 600;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
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
  font-size: 12px;
  font-weight: 600;
  color: #e8734a;
`;

const EntryAiText = styled.p`
  margin: 0;
  flex: 1;
  font-size: 13px;
  font-weight: 500;
  color: #e8734a;
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
  const [person, setPerson] = useState('me');
  const report = TODAY_REPORT[person];

  const handleSendLetter = () => {
    navigate('/home', { state: { openLetterbox: 'compose' } });
  };

  return (
    <Page>
      <DateLabel>{report.dateLabel}</DateLabel>
      <Title>오늘의 온담</Title>

      <ToggleWrap>
        <ToggleTab type="button" $active={person === 'me'} onClick={() => setPerson('me')}>
          나
        </ToggleTab>
        <ToggleTab type="button" $active={person === 'mom'} onClick={() => setPerson('mom')}>
          엄마
        </ToggleTab>
      </ToggleWrap>

      <SummaryRow>
        <SummaryChip $bg="#e0f2e3" $color="#339959">
          <SummaryValue>{report.summary.questionStatus}</SummaryValue>
          <SummaryLabel>질문 답변</SummaryLabel>
        </SummaryChip>
        <SummaryChip $bg="#fae5d9" $color="#e8734a">
          <SummaryValue>{report.summary.medication}</SummaryValue>
          <SummaryLabel>복약</SummaryLabel>
        </SummaryChip>
        <SummaryChip $bg="#f7f5f0" $color="#6b6661">
          <SummaryValue>{report.summary.condition}</SummaryValue>
          <SummaryLabel>컨디션</SummaryLabel>
        </SummaryChip>
      </SummaryRow>

      <AiInsightCard>
        <AiBadge>✦</AiBadge>
        <AiTextCol>
          <AiLabel>AI 한마디</AiLabel>
          <AiComment>{report.aiComment}</AiComment>
        </AiTextCol>
      </AiInsightCard>

      <StepRow>
        <StepIconBadge>●</StepIconBadge>
        <StepText>{report.stepMessage}</StepText>
      </StepRow>

      <Timeline>
        {report.timeline.map((entry, index) => {
          const isLast = index === report.timeline.length - 1;
          return (
            <TimelineEntry key={entry.time}>
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
                        <CardIconBadge>☀</CardIconBadge>
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
                        <CardIconBadge>℞</CardIconBadge>
                        <CardTitle>복약 체크</CardTitle>
                      </CardHead>
                      <MedRow>
                        {entry.medications.map((med) => (
                          <MedItem key={med.name}>
                            <MedCircle $taken={med.taken} $color={med.color} $textColor={med.textColor}>
                              {med.taken ? '✓' : ''}
                            </MedCircle>
                            <MedLabel $taken={med.taken} $textColor={med.textColor}>
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
                        <CardIconBadge>☾</CardIconBadge>
                        <CardTitle>건강 체크</CardTitle>
                      </CardHead>
                      {entry.lines.map((line) => (
                        <SentenceLine key={line.text}>
                          <MiniBadge>{line.icon}</MiniBadge>
                          <SentenceText>{line.text}</SentenceText>
                        </SentenceLine>
                      ))}
                      <EntryAiComment>
                        <EntryAiIcon>✦</EntryAiIcon>
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
            <SuggestedMessageText>{report.cta.suggestedMessage}</SuggestedMessageText>
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
