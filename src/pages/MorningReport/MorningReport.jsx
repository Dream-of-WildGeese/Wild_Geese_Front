import { useEffect, useState } from 'react';
import styled from 'styled-components';
import avatarCheering from '../../assets/avatar-cheering.png';
import avatarHeartHug from '../../assets/avatar-heart-hug.png';
import MorningReportHeader from './MorningReportHeader';
import MorningJournalCard from './MorningJournalCard';
import MorningReportToast from './MorningReportToast';
import MorningReportDatePicker from './MorningReportDatePicker';

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
  width: 100%;
  height: 100%;
  overflow-y: auto;
  padding: 20px 20px 24px;
  background: ${({ theme }) => theme.colors.reportBg};
  box-sizing: border-box;
`;

const Divider = styled.div`
  flex-shrink: 0;
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

// "이전/다음"은 어떤 화살표를 눌렀는지가 아니라, 실제 오늘과 비교했을 때
// 과거인지 미래인지로 판단한다. (예: 2025년 7월 → 8월로 가도 여전히 과거이므로 "이전")
function getEmptyDateMessage(targetDate) {
  const today = new Date();
  const targetMonthStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
  const todayMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  return targetMonthStart < todayMonthStart
    ? '이전 달에는 기록이 없어요'
    : '다음 달 기록은 아직 없어요';
}

function MorningReport() {
  const [viewedDate, setViewedDate] = useState(() => EXAMPLE_ENTRIES[0].date);
  const [toast, setToast] = useState(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [toast]);

  const year = viewedDate.getFullYear();
  const month = viewedDate.getMonth() + 1;
  const entriesForMonth = EXAMPLE_ENTRIES.filter((entry) => isSameMonth(entry.date, year, month));

  const applyDate = (nextDate) => {
    setViewedDate(nextDate);
    const hasEntries = EXAMPLE_ENTRIES.some((entry) =>
      isSameMonth(entry.date, nextDate.getFullYear(), nextDate.getMonth() + 1)
    );
    if (!hasEntries) {
      setToast({ id: Date.now(), message: getEmptyDateMessage(nextDate) });
    }
  };

  const goToMonth = (offset) => {
    applyDate(new Date(year, month - 1 + offset, 1));
  };

  const handleConfirmDate = (nextYear, nextMonth) => {
    applyDate(new Date(nextYear, nextMonth - 1, 1));
    setIsPickerOpen(false);
  };

  return (
    <Page>
      <MorningReportHeader
        year={year}
        month={month}
        onPrevMonth={() => goToMonth(-1)}
        onNextMonth={() => goToMonth(1)}
        onOpenPicker={() => setIsPickerOpen(true)}
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

      {isPickerOpen && (
        <MorningReportDatePicker
          year={year}
          month={month}
          onConfirm={handleConfirmDate}
          onClose={() => setIsPickerOpen(false)}
        />
      )}
    </Page>
  );
}

export default MorningReport;
