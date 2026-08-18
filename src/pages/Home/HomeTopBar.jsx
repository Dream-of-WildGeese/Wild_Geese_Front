import styled from 'styled-components';
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

// 알약 그림은 약만 가리켜서, 약과 건강검진을 함께 담도록 하트에 맥박선을 넣었다.
const HealthGlyph = styled.svg`
  position: absolute;
  left: 17px;
  top: 17px;
  width: 36px;
  height: 36px;
  pointer-events: none;
`;

function HealthIcon() {
  return (
    <HealthGlyph viewBox="0 0 36 36" fill="none" aria-hidden="true">
      <path
        d="M18 31S4.5 22.6 4.5 13.9A7.4 7.4 0 0 1 18 9.6a7.4 7.4 0 0 1 13.5 4.3C31.5 22.6 18 31 18 31Z"
        fill="#e69b81"
        stroke="#c15b4a"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M8.5 17.6h4.2l2.1-4.4 3.2 8 2.4-5 1.7 3.1h5.4"
        stroke="#fffdf6"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </HealthGlyph>
  );
}

function HomeTopBar({ onMedicationClick, onSettingsClick }) {
  return (
    <Bar>
      <IconButton type="button" aria-label="건강 챙기기" onClick={onMedicationClick}>
        <IconImage src={medicationIconBg} alt="" $size={70} />
        <HealthIcon />
      </IconButton>
      <IconButton type="button" aria-label="설정" onClick={onSettingsClick}>
        <IconImage src={settingsIconBg} alt="" $size={70} />
        <IconImage src={settingsIcon} alt="" $left={5} $top={5} $size={60} $height={59} />
      </IconButton>
    </Bar>
  );
}

export default HomeTopBar;
