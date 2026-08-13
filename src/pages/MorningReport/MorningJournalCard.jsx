import styled from 'styled-components';
import journalDateIcon from '../../assets/journal-date-icon.png';

const PLANK_LINES = [55, 114, 173];

const GRAIN_STREAKS = [
  { top: 8, left: 6, width: 140, dark: true },
  { top: 14, left: 166, width: 110, dark: false },
  { top: 28, left: 36, width: 220, dark: true },
  { top: 41, left: 16, width: 160, dark: false },
  { top: 46, left: 206, width: 120, dark: true },
  { top: 70, left: 56, width: 200, dark: false },
  { top: 86, left: 11, width: 130, dark: true },
  { top: 96, left: 156, width: 170, dark: false },
  { top: 129, left: 26, width: 240, dark: true },
  { top: 144, left: 6, width: 150, dark: false },
  { top: 154, left: 186, width: 140, dark: true },
  { top: 166, left: 46, width: 210, dark: false },
  { top: 188, left: 16, width: 150, dark: true },
  { top: 196, left: 176, width: 150, dark: false },
  { top: 210, left: 36, width: 260, dark: true },
];

const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

function formatJournalDate(date) {
  return `${date.getMonth() + 1}월 ${date.getDate()}일 ${WEEKDAY_LABELS[date.getDay()]}`;
}

const Card = styled.div`
  position: relative;
  flex-shrink: 0;
  width: 100%;
  height: 236px;
  overflow: hidden;
  border-radius: 15px;
  background: #c1a067;
  border: 4px solid rgba(120, 89, 58, 0.3);
  box-sizing: border-box;
`;

const PlankLine = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  height: 2px;
  background: rgba(120, 89, 58, 0.35);
`;

const GrainStreak = styled.div`
  position: absolute;
  height: 1.5px;
  border-radius: 1px;
  background: ${({ $dark }) => (
    $dark ? 'rgba(120, 89, 58, 0.22)' : 'rgba(220, 201, 163, 0.3)'
  )};
`;

const DateRow = styled.div`
  position: absolute;
  left: 13px;
  top: 14px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const DateIcon = styled.img`
  width: 20px;
  height: 20px;
  object-fit: cover;
`;

const DateLabel = styled.p`
  margin: 0;
  font-family: 'Noto Sans KR', sans-serif;
  font-weight: 900;
  font-size: 15px;
  color: #f6ebc7;
  text-shadow: 0 4px 4px rgba(0, 0, 0, 0.25);
`;

const QuestionText = styled.p`
  position: absolute;
  left: 16px;
  top: 44px;
  width: calc(100% - 32px);
  margin: 0;
  font-family: 'Noto Sans KR', sans-serif;
  font-weight: 900;
  font-size: 22px;
  color: #f6ebc7;
  text-shadow: 0 4px 4px rgba(0, 0, 0, 0.25);
`;

const AnswerRow = styled.div`
  position: absolute;
  left: 16px;
  top: ${({ $top }) => $top}px;
  width: calc(100% - 32px);
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Avatar = styled.div`
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border-radius: 100px;
  overflow: hidden;
  background: rgba(252, 248, 234, 0.8);
  border: 1px solid #4a3a2f;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const Bubble = styled.div`
  flex: 1;
  min-width: 0;
  padding: 12px 14px;
  border-radius: 10px;
  background: rgba(252, 248, 234, 0.8);
  border: 1px solid #4a3a2f;
`;

const BubbleText = styled.p`
  margin: 0;
  font-family: 'Noto Sans KR', sans-serif;
  font-weight: 700;
  font-size: 15px;
  color: #4a3a2f;
`;

function MorningJournalCard({ date, question, answers }) {
  return (
    <Card>
      {PLANK_LINES.map((top) => (
        <PlankLine key={top} style={{ top }} />
      ))}
      {GRAIN_STREAKS.map((streak, index) => (
        <GrainStreak
          key={index}
          $dark={streak.dark}
          style={{ top: streak.top, left: streak.left, width: streak.width }}
        />
      ))}

      <DateRow>
        <DateIcon src={journalDateIcon} alt="" />
        <DateLabel>{formatJournalDate(date)}</DateLabel>
        <DateIcon src={journalDateIcon} alt="" />
      </DateRow>

      <QuestionText>{question}</QuestionText>

      {answers.map((answer, index) => (
        <AnswerRow key={answer.id} $top={100 + index * 62}>
          <Avatar>
            <AvatarImage src={answer.avatar} alt={answer.name} />
          </Avatar>
          <Bubble>
            <BubbleText>{answer.text}</BubbleText>
          </Bubble>
        </AnswerRow>
      ))}
    </Card>
  );
}

export default MorningJournalCard;
