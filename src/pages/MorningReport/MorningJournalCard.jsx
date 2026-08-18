import styled from 'styled-components';
import journalDateIcon from '../../assets/journal-date-icon.png';
import mascotImg from '../../assets/mascot.png';

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

// 질문 길이와 답변 개수에 따라 카드가 늘어나야 해서 고정 높이를 쓰지 않는다.
const Card = styled.div`
  position: relative;
  flex-shrink: 0;
  width: 100%;
  min-height: 236px;
  padding: 14px 16px 18px;
  box-sizing: border-box;

  display: flex;
  flex-direction: column;
  gap: 12px;

  overflow: hidden;
  border-radius: 15px;
  background: #c1a067;
  border: 4px solid rgba(120, 89, 58, 0.3);
`;

const PlankLine = styled.div`
  position: absolute;
  z-index: 0;
  pointer-events: none;
  left: 0;
  right: 0;
  height: 2px;
  background: rgba(120, 89, 58, 0.35);
`;

const GrainStreak = styled.div`
  position: absolute;
  z-index: 0;
  pointer-events: none;
  height: 1.5px;
  border-radius: 1px;
  background: ${({ $dark }) => (
    $dark ? 'rgba(120, 89, 58, 0.22)' : 'rgba(220, 201, 163, 0.3)'
  )};
`;

const DateRow = styled.div`
  position: relative;
  z-index: 1;
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
  position: relative;
  z-index: 1;
  margin: 0;
  font-family: 'Noto Sans KR', sans-serif;
  font-weight: 900;
  font-size: 22px;
  line-height: 1.35;
  color: #f6ebc7;
  text-shadow: 0 4px 4px rgba(0, 0, 0, 0.25);
`;

const AnswerRow = styled.div`
  position: relative;
  z-index: 1;
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

// 나도 가족도 답하지 않은 날. 빈 카드만 두면 불러오다 만 것처럼 보여서
// 마스코트를 세워둔다. 색을 빼고 살짝 기울여 시무룩한 느낌을 준다.
const EmptyAnswers = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 4px 0 8px;
`;

const SadMascot = styled.img`
  width: 84px;
  height: 84px;
  object-fit: contain;
  object-position: top;
  filter: grayscale(0.55) brightness(0.95);
  transform: rotate(-6deg);
  opacity: 0.85;
`;

const EmptyText = styled.p`
  margin: 0;
  text-align: center;
  font-family: 'Noto Sans KR', sans-serif;
  font-weight: 700;
  font-size: 14px;
  line-height: 1.5;
  color: #f6ebc7;
  text-shadow: 0 2px 3px rgba(0, 0, 0, 0.3);
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

      {answers.length === 0 ? (
        <EmptyAnswers>
          <SadMascot src={mascotImg} alt="" />
          <EmptyText>
            이 날은 아무도 답하지 않았어요
            <br />
            온담이가 기다리고 있었대요
          </EmptyText>
        </EmptyAnswers>
      ) : (
        answers.map((answer) => (
          <AnswerRow key={answer.id}>
            <Avatar>
              <AvatarImage src={answer.avatar} alt={answer.name} />
            </Avatar>
            <Bubble>
              <BubbleText>{answer.text}</BubbleText>
            </Bubble>
          </AnswerRow>
        ))
      )}
    </Card>
  );
}

export default MorningJournalCard;
