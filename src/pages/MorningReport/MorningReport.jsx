import { useEffect, useState } from 'react';
import styled from 'styled-components';
import avatarCheering from '../../assets/avatar-cheering.png';
import avatarHeartHug from '../../assets/avatar-heart-hug.png';
import MorningReportHeader from './MorningReportHeader';
import MorningJournalCard from './MorningJournalCard';
import MorningReportToast from './MorningReportToast';
import MorningReportDatePicker from './MorningReportDatePicker';
import { getMorningHistory } from '../../api/morning';
import { getDailyLog, getFamilyDailyLog } from '../../api/daily';
import { getMyFamily } from '../../api/family';
import { getUserId } from '../../api/client';
import { useApi } from '../../hooks/useApi';
import { toDateString } from '../../utils/medication';
import { getRelationLabel } from '../../utils/family';

// 아침 질문 이력 API는 질문 목록만 주고 답변은 담아주지 않는다.
// 그래서 질문 목록을 받은 뒤, 각 날짜의 일지에서 나와 가족의 답변을 따로 채워 넣는다.
async function loadMonthJournal({ from, to }) {
  const [history, family] = await Promise.all([
    getMorningHistory({ from, to }),
    getMyFamily().catch(() => null),
  ]);

  const myUserId = getUserId();
  const partner = (family?.members ?? []).find(
    (member) => String(member.userId) !== String(myUserId),
  );

  return Promise.all(
    (history ?? []).map(async (item) => {
      const [myLog, partnerLog] = await Promise.all([
        getDailyLog(item.questionDate).catch(() => null),
        partner ? getFamilyDailyLog(partner.userId, item.questionDate).catch(() => null) : null,
      ]);

      const answers = [];
      if (myLog?.morningAnswer?.textValue) {
        answers.push({
          id: 'me',
          name: '나',
          avatar: avatarCheering,
          text: myLog.morningAnswer.textValue,
        });
      }
      if (partnerLog?.morningAnswer?.textValue) {
        answers.push({
          id: 'family',
          name: getRelationLabel(partner),
          avatar: avatarHeartHug,
          text: partnerLog.morningAnswer.textValue,
        });
      }

      return {
        id: item.questionDate,
        date: new Date(`${item.questionDate}T00:00:00`),
        question: item.content,
        answers,
      };
    }),
  );
}

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
  const [viewedDate, setViewedDate] = useState(() => new Date());
  const [toast, setToast] = useState(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [toast]);

  const year = viewedDate.getFullYear();
  const month = viewedDate.getMonth() + 1;

  // 보고 있는 달의 1일~말일 구간만 조회한다. (month는 1부터라 0일은 전달 말일이 된다)
  const range = {
    from: toDateString(new Date(year, month - 1, 1)),
    to: toDateString(new Date(year, month, 0)),
  };
  const { data: entries, loading, error } = useApi(loadMonthJournal, { args: [range] });
  const entriesForMonth = entries ?? [];

  // 달을 옮긴 직후에는 아직 조회 결과가 없으므로, 응답이 도착한 뒤 비어 있으면 안내한다.
  useEffect(() => {
    if (loading || error) return;
    if (entriesForMonth.length === 0 && !isSameMonth(new Date(), year, month)) {
      setToast({ id: Date.now(), message: getEmptyDateMessage(new Date(year, month - 1, 1)) });
    }
  }, [loading, error, entriesForMonth.length, year, month]);

  const applyDate = (nextDate) => {
    setViewedDate(nextDate);
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
      {loading ? (
        <EmptyState>기록을 불러오는 중이에요...</EmptyState>
      ) : error ? (
        <EmptyState>{error.message}</EmptyState>
      ) : entriesForMonth.length === 0 ? (
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
