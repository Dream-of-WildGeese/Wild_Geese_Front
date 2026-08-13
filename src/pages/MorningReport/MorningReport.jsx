import { useEffect, useState } from 'react';
import styled from 'styled-components';
import avatarCheering from '../../assets/avatar-cheering.png';
import avatarHeartHug from '../../assets/avatar-heart-hug.png';
import MorningReportHeader from './MorningReportHeader';
import MorningJournalCard from './MorningJournalCard';
import MorningReportToast from './MorningReportToast';

// 아직 백엔드에 쌓인 기록이 없어서, 예시로 오늘 날짜(8월 13일) 항목 하나만 들어있다.
// 실제 연동 시 이 배열을 API 응답으로 교체하면 카드가 늘어난 만큼 아래로 쌓여 스크롤된다.
const EXAMPLE_ENTRIES = [
  {
    id: '2026-08-13',
    date: new Date(2026, 7, 13),
    question: '오늘 아침 기분은 어떤 색깔이에요?',
    answers: [
      { id: 'me', name: '나', avatar: avatarCheering, text: '바쁜 하루가 될 것 같아서 회색 ㅎㅎ' },
      { id: 'family', name: '가족', avatar: avatarHeartHug, text: '오늘은 날씨가 맑아서 파란색~' },
    ],
  },
];

const TOAST_DURATION_MS = 1800;

const Page = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  width: calc(100% + 32px);
  margin: 0 -${({ theme }) => theme.spacing.md};
  padding: 20px 20px 24px;
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.reportBg};
  box-sizing: border-box;
`;

const Divider = styled.div`
  width: 100%;
  height: 2px;
  border-radius: 2px;
  background: #d8c4a8;
`;

const EmptyState = styled.p`
  margin: 40px 0;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

function isSameMonth(date, year, month) {
  return date.getFullYear() === year && date.getMonth() + 1 === month;
}

function MorningReport() {
  const [viewedDate, setViewedDate] = useState(() => EXAMPLE_ENTRIES[0].date);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [toast]);

  const year = viewedDate.getFullYear();
  const month = viewedDate.getMonth() + 1;
  const entriesForMonth = EXAMPLE_ENTRIES.filter((entry) => isSameMonth(entry.date, year, month));

  const goToMonth = (offset, emptyMessage) => {
    const nextDate = new Date(year, month - 1 + offset, 1);
    setViewedDate(nextDate);
    const hasEntries = EXAMPLE_ENTRIES.some((entry) =>
      isSameMonth(entry.date, nextDate.getFullYear(), nextDate.getMonth() + 1)
    );
    if (!hasEntries) {
      setToast({ id: Date.now(), message: emptyMessage });
    }
  };

  return (
    <Page>
      <MorningReportHeader
        year={year}
        month={month}
        onPrevMonth={() => goToMonth(-1, '이전 달에는 기록이 없어요')}
        onNextMonth={() => goToMonth(1, '다음 달 기록은 아직 없어요')}
      />
      <MorningReportToast key={toast?.id} message={toast?.message} />
      <Divider />
      {entriesForMonth.length === 0 ? (
        <EmptyState>이 달에는 아직 쌓인 기록이 없어요.</EmptyState>
      ) : (
        entriesForMonth.map((entry) => (
          <MorningJournalCard
            key={entry.id}
            date={entry.date}
            question={entry.question}
            answers={entry.answers}
          />
        ))
      )}
    </Page>
  );
}

export default MorningReport;
