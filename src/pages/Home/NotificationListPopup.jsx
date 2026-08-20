import styled from 'styled-components';
import sunIcon from '../../assets/journal/sun.png';
import moonIcon from '../../assets/journal/moon.png';
import pillIcon from '../../assets/journal/pill.png';
import weeklyIcon from '../../assets/popup/weekly-report.png';
import envelopeIcon from '../../assets/letterbox/envelope-box.png';
import likeIcon from '../../assets/reaction/like.png';
import cheerIcon from '../../assets/reaction/cheer.png';
import funnyIcon from '../../assets/reaction/funny.png';
import bestIcon from '../../assets/reaction/best.png';
import congratsIcon from '../../assets/reaction/congrats.png';
import {
  PopupBackdrop,
  PopupCard,
  PopupInnerBorder,
  PopupClose,
  PopupTitle,
  PopupSubtitle,
  PopupPrimaryButton,
} from '../../components/PopupShell';
import { LoadingLine } from '../../components/Loading';
import { useLazyList } from '../../hooks/useLazyList';

// 서버가 보낸 알림 목록. 종류별로 앱에서 쓰던 아이콘을 그대로 붙인다.
const TYPE_ICONS = {
  MORNING_QUESTION: sunIcon,
  EVENING_CHECK: moonIcon,
  MEDICATION: pillIcon,
  WEEKLY_REPORT: weeklyIcon,
  LETTER: envelopeIcon,
};

// 가족 반응 알림은 이 다섯 아이콘 중 하나다.
const REACTION_ICONS = {
  LIKE: likeIcon,
  CHEER: cheerIcon,
  FUNNY: funnyIcon,
  BEST: bestIcon,
  CONGRATS: congratsIcon,
};

// 알림 목록 API는 어떤 반응인지 따로 알려주지 않는다. content 문장에
// "OO님이 회원님의 아침 답변에 CHEER 반응을 남겼어요."처럼 반응 이름이
// 그대로 들어 있어서, 거기서 골라 쓴다. 못 찾으면 좋아요 아이콘으로 대신한다.
const REACTION_KEY_PATTERN = new RegExp(`\\b(${Object.keys(REACTION_ICONS).join('|')})\\b`);
const reactionIconOf = (content) => {
  const key = content?.match(REACTION_KEY_PATTERN)?.[1];
  return REACTION_ICONS[key] ?? likeIcon;
};

const iconOf = (item) =>
  item.type === 'FAMILY_REACTION' ? reactionIconOf(item.content) : (TYPE_ICONS[item.type] ?? sunIcon);

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

// 부제목과 '모두 읽음'을 한 줄에 놓는다. 목록과 하단 닫기 버튼은 그대로 둔다.
const SubtitleRow = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const ReadAllButton = styled.button`
  flex-shrink: 0;
  padding: 5px 10px;
  border-radius: 8px;
  border: 1px solid rgba(74, 58, 47, 0.35);
  background: rgba(255, 255, 255, 0.7);

  color: #8c8172;
  font-family: 'Noto Sans KR';
  font-size: 13px;
  font-weight: 700;

  &:disabled {
    opacity: 0.5;
  }
`;

const MoreSentinel = styled.div`
  width: 100%;
  height: 1px;
`;

const StatusText = styled.p`
  margin: 24px 0;
  width: 100%;
  text-align: center;
  color: #a79c8e;
  font-family: 'Noto Sans KR';
  font-size: 15px;
`;

// 목록과 읽음 처리는 홈이 들고 있다. 여기서 따로 불러오면 상단 종 배지의
// 개수와 목록이 어긋난다.
function NotificationListPopup({
  notifications,
  loading,
  error,
  onRead,
  onReadAll,
  onSelect,
  onClose,
  readingAll = false,
}) {
  const unreadCount = notifications.filter((item) => !item.read).length;

  // 알림은 계속 쌓이기만 한다. 보이는 만큼만 그리고 바닥에서 이어 붙인다.
  const {
    visible: visibleNotifications,
    hasMore,
    sentinelRef,
  } = useLazyList(notifications, { step: 15 });

  // 누르면 읽음으로 바꾸고, 그 알림이 가리키는 화면으로 옮겨간다.
  const handleSelect = (notification) => {
    if (!notification.read) onRead(notification.notificationId);
    onSelect(notification);
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
        <SubtitleRow>
          <PopupSubtitle $center>
            {unreadCount > 0 ? `읽지 않은 알림이 ${unreadCount}건 있어요` : '모두 확인했어요'}
          </PopupSubtitle>
          {unreadCount > 0 && (
            <ReadAllButton type="button" disabled={readingAll} onClick={onReadAll}>
              {readingAll ? '처리 중...' : '모두 읽음'}
            </ReadAllButton>
          )}
        </SubtitleRow>

        {loading && <LoadingLine $compact>불러오는 중이에요...</LoadingLine>}
        {error && <StatusText>{error.message}</StatusText>}
        {!loading && !error && notifications.length === 0 && (
          <StatusText>아직 도착한 알림이 없어요.</StatusText>
        )}

        <List>
          {visibleNotifications.map((item) => (
            <Item
              key={item.notificationId}
              type="button"
              $unread={!item.read}
              onClick={() => handleSelect(item)}
            >
              <ItemIcon src={iconOf(item)} alt="" />
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
          {/* 바닥에 닿으면 다음 묶음을 잇는다 */}
          {hasMore && <MoreSentinel ref={sentinelRef} />}
          {hasMore && <LoadingLine $compact $size={16}>더 불러오는 중이에요...</LoadingLine>}
        </List>

        <PopupPrimaryButton type="button" onClick={onClose}>
          닫기
        </PopupPrimaryButton>
      </PopupCard>
    </PopupBackdrop>
  );
}

export default NotificationListPopup;
