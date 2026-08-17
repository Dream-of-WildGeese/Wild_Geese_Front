import styled from 'styled-components';
import sunIcon from '../../../assets/journal/sun.png';
import moonIcon from '../../../assets/journal/moon.png';
import pillIcon from '../../../assets/journal/pill.png';
import weeklyIcon from '../../../assets/popup/weekly-report.png';
import envelopeIcon from '../../../assets/letterbox/envelope-box.png';
import { getNotifications, readNotification } from '../../../api/notification';
import { useApi, useApiAction } from '../../../hooks/useApi';
import {
  PopupBackdrop,
  PopupCard,
  PopupInnerBorder,
  PopupClose,
  PopupTitle,
  PopupSubtitle,
  PopupPrimaryButton,
} from '../../../components/PopupShell';

// 서버가 보낸 알림 목록. 종류별로 앱에서 쓰던 아이콘을 그대로 붙인다.
const TYPE_ICONS = {
  MORNING_QUESTION: sunIcon,
  EVENING_CHECK: moonIcon,
  MEDICATION: pillIcon,
  WEEKLY_REPORT: weeklyIcon,
  LETTER: envelopeIcon,
};

// "2026-08-17T17:51:33" -> "오늘 오후 5:51" / "8.17 오후 5:51"
const formatSentAt = (isoString, now = new Date()) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '';

  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  const hour = date.getHours();
  const period = hour < 12 ? '오전' : '오후';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  const time = `${period} ${displayHour}:${String(date.getMinutes()).padStart(2, '0')}`;

  return sameDay ? `오늘 ${time}` : `${date.getMonth() + 1}.${date.getDate()} ${time}`;
};

const List = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;

  max-height: 380px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const Item = styled.button`
  width: 100%;
  padding: 14px;

  display: flex;
  gap: 12px;
  align-items: flex-start;
  text-align: left;

  border-radius: 12px;
  border: 1px solid ${({ $unread }) => ($unread ? '#cbd879' : '#d8cbb8')};
  background: ${({ $unread }) => ($unread ? '#edf3d5' : '#fffbf1')};
`;

const ItemIcon = styled.img`
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  object-fit: contain;
`;

const TextCol = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const HeadRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: 8px;
`;

const ItemTitle = styled.span`
  flex: 1;
  min-width: 0;
  color: #4a3a2f;
  font-family: 'Noto Sans KR';
  font-size: 16px;
  font-weight: 700;
`;

const SentAt = styled.span`
  flex-shrink: 0;
  color: #a79c8e;
  font-family: 'Noto Sans KR';
  font-size: 12px;
`;

const ItemContent = styled.p`
  margin: 0;
  color: #8c8780;
  font-family: 'Noto Sans KR';
  font-size: 14px;
  line-height: 1.4;
`;

const UnreadDot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 4px;
  background: #d97d65;
  flex-shrink: 0;
  margin-top: 6px;
`;

const StatusText = styled.p`
  margin: 24px 0;
  width: 100%;
  text-align: center;
  color: #a79c8e;
  font-family: 'Noto Sans KR';
  font-size: 15px;
`;

function NotificationListPopup({ onClose }) {
  const { data, loading, error, refetch } = useApi(getNotifications, {
    args: [{ page: 0, size: 30 }],
  });
  const { execute: markRead } = useApiAction(readNotification);

  // 최신 알림이 위로 오도록 정렬한다. (서버는 정렬 없이 내려준다)
  const notifications = [...(data?.content ?? [])].sort(
    (a, b) => new Date(b.scheduledAt) - new Date(a.scheduledAt),
  );
  const unreadCount = notifications.filter((item) => !item.read).length;

  const handleRead = async (notification) => {
    if (notification.read) return;
    const { ok } = await markRead(notification.notificationId);
    if (ok) refetch();
  };

  return (
    <PopupBackdrop onClick={onClose}>
      <PopupCard $center $gap={14} $padTop={30} onClick={(event) => event.stopPropagation()}>
        <PopupInnerBorder />
        <PopupClose type="button" aria-label="닫기" onClick={onClose}>
          ✕
        </PopupClose>

        <PopupTitle $center $size={24}>
          알림
        </PopupTitle>
        <PopupSubtitle $center>
          {unreadCount > 0 ? `읽지 않은 알림이 ${unreadCount}건 있어요` : '모두 확인했어요'}
        </PopupSubtitle>

        {loading && <StatusText>불러오는 중이에요...</StatusText>}
        {error && <StatusText>{error.message}</StatusText>}
        {!loading && !error && notifications.length === 0 && (
          <StatusText>아직 도착한 알림이 없어요.</StatusText>
        )}

        <List>
          {notifications.map((item) => (
            <Item
              key={item.notificationId}
              type="button"
              $unread={!item.read}
              onClick={() => handleRead(item)}
            >
              <ItemIcon src={TYPE_ICONS[item.type] ?? sunIcon} alt="" />
              <TextCol>
                <HeadRow>
                  <ItemTitle>{item.title}</ItemTitle>
                  <SentAt>{formatSentAt(item.scheduledAt)}</SentAt>
                </HeadRow>
                <ItemContent>{item.content}</ItemContent>
              </TextCol>
              {!item.read && <UnreadDot />}
            </Item>
          ))}
        </List>

        <PopupPrimaryButton type="button" onClick={onClose}>
          닫기
        </PopupPrimaryButton>
      </PopupCard>
    </PopupBackdrop>
  );
}

export default NotificationListPopup;
