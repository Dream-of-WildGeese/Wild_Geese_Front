import styled from 'styled-components';
import crossIcon from '../../assets/home/popup-cross.svg';
import capsuleIcon from '../../assets/home/popup-capsule.png';
import calendarIcon from '../../assets/home/popup-calendar.png';
import {
  PopupBackdrop,
  PopupCard,
  PopupInnerBorder,
  PopupTitle,
  PopupPrimaryButton,
} from '../../components/PopupShell';

const OPTIONS = [
  { type: 'medicine', icon: capsuleIcon, size: 48, label: '복용약' },
  { type: 'checkup', icon: calendarIcon, size: 50, label: '건강검진' },
];

const CrossIcon = styled.img`
  width: 60px;
  height: 60px;
  object-fit: contain;
`;

const OptionList = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Option = styled.button`
  width: 100%;
  min-height: 96px;
  padding: 16px 14px 14px;
  box-sizing: border-box;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;

  border-radius: 14px;
  border: 1.2px solid #d8cbb8;
  background: #fffbf1;
  cursor: pointer;
  transition: transform 0.1s ease, background 0.15s ease;

  &:hover {
    background: #f9dfd8;
  }

  &:active {
    transform: scale(0.98);
  }
`;

const OptionIcon = styled.img`
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  object-fit: contain;
  pointer-events: none;
`;

const OptionLabel = styled.span`
  color: #4a3a2f;
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 18px;
  font-weight: 700;
  white-space: nowrap;
`;

function HealthPickerPopup({ onSelect, onClose }) {
  return (
    <PopupBackdrop onClick={onClose}>
      <PopupCard $center $gap={20} $padTop={48} onClick={(event) => event.stopPropagation()}>
        <PopupInnerBorder />
        <CrossIcon src={crossIcon} alt="" />

        <PopupTitle $center $size={26}>
          어떤 내용을 보고싶으세요?
        </PopupTitle>

        <OptionList>
          {OPTIONS.map((option) => (
            <Option
              key={option.type}
              type="button"
              onClick={() => onSelect(option.type)}
            >
              <OptionIcon src={option.icon} alt="" $size={option.size} />
              <OptionLabel>{option.label}</OptionLabel>
            </Option>
          ))}
        </OptionList>

        <PopupPrimaryButton type="button" onClick={onClose}>
          완료
        </PopupPrimaryButton>
      </PopupCard>
    </PopupBackdrop>
  );
}

export default HealthPickerPopup;