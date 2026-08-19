import styled from 'styled-components';
import crossIcon from '../../assets/home/popup-cross.svg';
import capsuleIcon from '../../assets/home/popup-capsule.svg';
import calendarIcon from '../../assets/home/popup-calendar.svg';
import {
  PopupBackdrop,
  PopupCard,
  PopupInnerBorder,
  PopupTitle,
  PopupPrimaryButton,
} from '../../components/PopupShell';

// Figma 1472:808 — 홈 상단 초록 십자가를 누르면 뜨는 선택 팝업.
// 선택지는 그림이 위, 글자가 아래로 오는 세로 배치다.
//
// box: 그림이 놓이는 칸. 이 높이가 선택지 줄 높이(105 / 93)를 만든다.
// crop: 칸 안에서 그림을 어디에 얼마나 크게 놓을지 (Figma 값 그대로, % 단위).
//       내보낸 그림 파일에 투명 여백이 넉넉히 들어 있어서, object-fit으로 맞추면
//       그 여백까지 계산돼 디자인보다 작게 보인다.
const OPTIONS = [
  { type: 'medicine', icon: capsuleIcon, size: 60, label: '복용약' },
  { type: 'checkup', icon: calendarIcon, size: 60, label: '건강검진' },
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
  gap: 20px;
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
    background: #F9DFD8;
  }

  &:active {
    transform: scale(0.98);
  }
`;

const OptionInner = styled.span`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
`;

const OptionIconBox = styled.span`
  position: relative;
  flex-shrink: 0;
  width: ${({ $width }) => $width}px;
  height: ${({ $height }) => $height}px;
  overflow: hidden;
`;

const OptionIcon = styled.img`
  position: absolute;
  left: ${({ $left }) => $left}%;
  top: ${({ $top }) => $top}%;
  width: ${({ $width }) => $width}%;
  height: ${({ $height }) => $height}%;
  max-width: none;
  pointer-events: none;
`;

const OptionLabel = styled.span`
  color: #4a3a2f;
  font-family: 'Noto Sans KR';
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
              $height={option.rowHeight}
              onClick={() => onSelect(option.type)}
            >
              <OptionInner>
                <OptionIconBox $width={option.box.width} $height={option.box.height}>
                  <OptionIcon
                    src={option.icon}
                    alt=""
                    $left={option.crop.left}
                    $top={option.crop.top}
                    $width={option.crop.width}
                    $height={option.crop.height}
                  />
                </OptionIconBox>
                <OptionLabel>{option.label}</OptionLabel>
              </OptionInner>
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
