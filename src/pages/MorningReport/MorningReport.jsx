import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { getMascotImage } from '../../utils/character';
import MorningReportHeader from './MorningReportHeader';
import MorningJournalCard from './MorningJournalCard';
import MorningReportToast from './MorningReportToast';
import MorningReportDatePicker from './MorningReportDatePicker';
import { getMorningHistory, getTodayQuestion } from '../../api/morning';
import { getDailyLog, getFamilyDailyLog } from '../../api/daily';
import { getMyFamily } from '../../api/family';
import { getUserId } from '../../api/client';
import { useApi } from '../../hooks/useApi';
import { toDateString } from '../../utils/medication';
import { getRelationLabel } from '../../utils/family';
import { findMyLatestAnswer, findPartnerLatestAnswer } from '../../utils/morningAnswer';
import { getWeekStart } from '../Home/WeeklyReport/weeklyReportData';
import { getMockMorningEntry } from '../../mock/dailyReport';

// 이번 주를 0으로 놓고 몇 주 전인지 센다. 하루 일지/주간 리포트와 같은 기준이다.
const weeksAgoOf = (date) =>
  Math.round((getWeekStart() - getWeekStart(date)) / (7 * 24 * 60 * 60 * 1000));

// 아침 질문 이력 API는 질문 목록만 주고 답변은 담아주지 않는다.
// 그래서 질문 목록을 받은 뒤, 각 날짜의 일지에서 나와 가족의 답변을 따로 채워 넣는다.
async function loadMonthJournal({ from, to }) {
  const todayString = toDateString(new Date());
  // 오늘 답변은 /daily가 '맨 처음 답'을 주기 때문에 고쳐 쓴 내용이 반영되지 않는다.
  // 오늘이 이 달 안에 들어 있을 때만 아침 질문 응답을 따로 받아 최신 답을 쓴다.
  const includesToday = from <= todayString && todayString <= to;

  const [history, family, todayQuestion] = await Promise.all([
    getMorningHistory({ from, to }),
    getMyFamily().catch(() => null),
    includesToday ? getTodayQuestion().catch(() => null) : null,
  ]);

  const myUserId = getUserId();
  const members = family?.members ?? [];
  const me = members.find((member) => String(member.userId) === String(myUserId));
  const partner = members.find((member) => String(member.userId) !== String(myUserId));
  const myRole = me?.role === 'CHILD' ? 'child' : 'parent';
  const partnerRole = myRole === 'parent' ? 'child' : 'parent';

  const realEntries = await Promise.all(
    (history ?? []).map(async (item) => {
      const [myLog, partnerLog] = await Promise.all([
        getDailyLog(item.questionDate).catch(() => null),
        partner ? getFamilyDailyLog(partner.userId, item.questionDate).catch(() => null) : null,
      ]);

      // 오늘 것만 최신 답으로 바꿔 쓴다. (지난 날짜는 서버가 최신 답을 주는 통로가 없다)
      const isToday = item.questionDate === todayString;
      const myText = isToday
        ? (findMyLatestAnswer(todayQuestion?.familyAnswers, myUserId)?.textValue ??
          myLog?.morningAnswer?.textValue)
        : myLog?.morningAnswer?.textValue;
      const partnerText = isToday
        ? (findPartnerLatestAnswer(todayQuestion?.familyAnswers, myUserId)?.textValue ??
          partnerLog?.morningAnswer?.textValue)
        : partnerLog?.morningAnswer?.textValue;

      const answers = [];
      if (myText) {
        answers.push({ id: 'me', name: '나', avatar: avatarCheering, text: myText });
      }
      if (partnerText) {
        answers.push({
          id: 'family',
          name: getRelationLabel(partner),
          avatar: avatarHeartHug,
          text: partnerText,
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

  // 서버에는 지난 기록이 아직 없어서, 하루 일지/주간 리포트가 쓰는 것과 같은
  // 시연용 데이터로 지난 달을 채운다. 실제 기록이 있는 날짜는 그대로 둔다.
  const realDates = new Set(realEntries.map((entry) => entry.id));
  const mockEntries = [];
  const cursor = new Date(`${from}T00:00:00`);
  const end = new Date(`${to}T00:00:00`);
  while (cursor <= end) {
    const dateString = toDateString(cursor);
    const weeksAgo = weeksAgoOf(cursor);

    if (!realDates.has(dateString) && weeksAgo > 0) {
      const mine = getMockMorningEntry({ role: myRole, weeksAgo, date: cursor });
      if (mine) {
        const answers = [{ id: 'me', name: '나', avatar: getMascotImage(me), text: mine.answer }];
        if (partner) {
          const theirs = getMockMorningEntry({ role: partnerRole, weeksAgo, date: cursor });
          if (theirs) {
            answers.push({
              id: 'family',
              name: getRelationLabel(partner),
              avatar: getMascotImage(partner),
              text: theirs.answer,
            });
          }
        }
        mockEntries.push({
          id: dateString,
          date: new Date(cursor),
          question: mine.question,
          answers,
        });
      }
    }

    cursor.setDate(cursor.getDate() + 1);
  }

  // 최신 날짜가 위로 오도록 내림차순 정렬한다.
  return [...realEntries, ...mockEntries].sort((a, b) => b.date - a.date);
}

const TOAST_DURATION_MS = 1800;

const Page = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
  padding: 20px 20px 24px;
  background: ${({ theme }) => theme.colors.reportBg};
  box-sizing: border-box;
`;

// 헤더(뒤로가기·연월)와 구분선은 위에 붙어 있고, 기록 카드만 스크롤된다.
const ScrollArea = styled.div`
  flex: 1;
  min-height: 0;
  width: 100%;
  overflow-y: auto;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;

  scrollbar-width: none;

  /* 넘치는 만큼은 스크롤로 보여준다. 안에 든 카드를 눌러 줄이지 않는다. */
  > * {
    flex-shrink: 0;
  }

  &::-webkit-scrollbar {
    display: none;
  }
`;

const Divider = styled.div`
  flex-shrink: 0;
  width: 100%;
  margin: 20px 0;
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

      <ScrollArea>
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
      </ScrollArea>

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
