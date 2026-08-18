import styled from 'styled-components';
import pillIcon from '../../assets/journal/pill.png';
import calendarIcon from '../../assets/journal/m-body.png';
import {
  PopupBackdrop,
  PopupCard,
  PopupInnerBorder,
  PopupClose,
  PopupTitle,
  CHOICE_ICON_SIZE,
} from '../../components/PopupShell';

// 홈 상단 헬스케어 아이콘을 누르면 뜬다. 복용약과 건강검진으로 갈라진다.
// 디자인이 따로 없어서 '오늘의 온담' 선택 팝업과 같은 규격으로 맞췄다.
const OPTIONS = [
  { type: 'medicine', icon: pillIcon, label: '복용약', desc: '드시는 약을 관리해요' },
  { type: 'checkup', icon: calendarIcon, label: '건강검진', desc: '검진 일정을 챙겨요' },
];

const OptionList = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Option = styled.button`
  width: 100%;
  padding: 0 16px;
  height: 72px;

  display: flex;
  align-items: center;
  gap: 12px;
  text-align: left;

  border-radius: 10px;
  border: 1px solid #d8cbb8;
  background: #fffbf1;
`;

const OptionIcon = styled.img`
  width: ${CHOICE_ICON_SIZE}px;
  height: ${CHOICE_ICON_SIZE}px;
  flex-shrink: 0;
  object-fit: contain;
`;

const OptionTextCol = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const OptionLabel = styled.span`
  color: #4a3a2f;
  font-family: 'Noto Sans KR';
  font-size: 20px;
  font-weight: 700;
`;

const OptionDesc = styled.span`
  color: #a79c8e;
  font-family: 'Noto Sans KR';
  font-size: 14px;
`;

const Chevron = styled.span`
  flex-shrink: 0;
  color: #c9bda8;
  font-size: 22px;
  line-height: 1;
`;

function HealthPickerPopup({ onSelect, onClose }) {
  return (
    <PopupBackdrop onClick={onClose}>
      <PopupCard $center $gap={16} $padTop={30} onClick={(event) => event.stopPropagation()}>
        <PopupInnerBorder />
        <PopupClose type="button" aria-label="닫기" onClick={onClose}>
          ✕
        </PopupClose>

        <PopupTitle $center $size={24}>
          무엇을 챙겨볼까요?
        </PopupTitle>

        <OptionList>
          {OPTIONS.map((option) => (
            <Option key={option.type} type="button" onClick={() => onSelect(option.type)}>
              <OptionIcon src={option.icon} alt="" />
              <OptionTextCol>
                <OptionLabel>{option.label}</OptionLabel>
                <OptionDesc>{option.desc}</OptionDesc>
              </OptionTextCol>
              <Chevron>›</Chevron>
            </Option>
          ))}
        </OptionList>
      </PopupCard>
    </PopupBackdrop>
  );
}

export default HealthPickerPopup;
