import styled from 'styled-components';
import medicationIconBg from '../../assets/medication-icon-bg.svg';
import settingsIconBg from '../../assets/settings-icon-bg.svg';
import healthCrossIcon from '../../assets/home/popup-cross.svg';
import bellIcon from '../../assets/home/bell.svg';
import settingsIcon from '../../assets/home/settings.png';

const Bar = styled.div`
  position: absolute;
  left: 27px;
  top: 39px;
  width: 349px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const IconButton = styled.button`
  position: relative;
  width: 70px;
  height: 70px;
`;

const IconBackground = styled.img`
  position: absolute;
  inset: 0;
  width: 70px;
  height: 70px;
  object-fit: cover;
  pointer-events: none;
`;

// Figma 1405:236 — 원 배경 위에 60px 그림을 5px씩 안쪽으로 넣는다.
const IconGlyph = styled.img`
  position: absolute;
  left: 5px;
  top: 5px;
  width: 60px;
  height: 60px;
  object-fit: contain;
  pointer-events: none;
`;

// 안 읽은 알림 개수. 우체통 배지와 같은 규격이다.
const Badge = styled.span`
  position: absolute;
  top: -2px;
  right: -2px;

  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  box-sizing: border-box;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 11px;
  background: #d97d65;
  border: 1.5px solid rgba(254, 251, 241, 0.9);

  color: #fff;
  font-family: Jua;
  font-size: 13px;
  line-height: 1;
`;

function HomeTopBar({
  onMedicationClick,
  onNotificationsClick,
  onSettingsClick,
  unreadNotificationCount = 0,
}) {
  const hasUnread = unreadNotificationCount > 0;

  return (
    <Bar>
      <IconButton type="button" aria-label="건강 챙기기" onClick={onMedicationClick}>
        <IconBackground src={medicationIconBg} alt="" />
        <IconGlyph src={healthCrossIcon} alt="" />
      </IconButton>

      {/* 설정 안에 있던 '받은 알림 보기'를 여기로 꺼냈다 */}
      <IconButton
        type="button"
        aria-label={hasUnread ? `안 읽은 알림 ${unreadNotificationCount}건 보기` : '받은 알림 보기'}
        onClick={onNotificationsClick}
      >
        <IconBackground src={settingsIconBg} alt="" />
        <IconGlyph src={bellIcon} alt="" />
        {hasUnread && (
          <Badge>{unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}</Badge>
        )}
      </IconButton>
      
      <IconButton type="button" aria-label="설정" onClick={onSettingsClick}>
        <IconBackground src={settingsIconBg} alt="" />
        <IconGlyph src={settingsIcon} alt="" />
      </IconButton>
    </Bar>
  );
}

export default HomeTopBar;
