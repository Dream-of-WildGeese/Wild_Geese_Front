import styled from 'styled-components';
import medicationIconBg from '../../assets/medication-icon-bg.svg';
import settingsIconBg from '../../assets/settings-icon-bg.svg';
import healthCrossIcon from '../../assets/home/health-cross.png';
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

function HomeTopBar({ onMedicationClick, onSettingsClick }) {
  return (
    <Bar>
      <IconButton type="button" aria-label="건강 챙기기" onClick={onMedicationClick}>
        <IconBackground src={medicationIconBg} alt="" />
        <IconGlyph src={healthCrossIcon} alt="" />
      </IconButton>
      <IconButton type="button" aria-label="설정" onClick={onSettingsClick}>
        <IconBackground src={settingsIconBg} alt="" />
        <IconGlyph src={settingsIcon} alt="" />
      </IconButton>
    </Bar>
  );
}

export default HomeTopBar;
