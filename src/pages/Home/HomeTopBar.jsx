import styled from 'styled-components';
import medicationIcon from '../../assets/medication-icon.png';
import medicationIconBg from '../../assets/medication-icon-bg.svg';
import settingsIcon from '../../assets/settings-icon.png';
import settingsIconBg from '../../assets/settings-icon-bg.svg';

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

const IconImage = styled.img`
  position: absolute;
  left: ${({ $left = 0 }) => $left}px;
  top: ${({ $top = 0 }) => $top}px;
  width: ${({ $size }) => $size}px;
  height: ${({ $height, $size }) => $height ?? $size}px;
  object-fit: cover;
  pointer-events: none;
`;

function HomeTopBar({ onMedicationClick, onSettingsClick }) {
  return (
    <Bar>
      <IconButton type="button" aria-label="약" onClick={onMedicationClick}>
        <IconImage src={medicationIconBg} alt="" $size={70} />
        <IconImage src={medicationIcon} alt="" $size={70} />
      </IconButton>
      <IconButton type="button" aria-label="설정" onClick={onSettingsClick}>
        <IconImage src={settingsIconBg} alt="" $size={70} />
        <IconImage src={settingsIcon} alt="" $left={5} $top={5} $size={60} $height={59} />
      </IconButton>
    </Bar>
  );
}

export default HomeTopBar;
