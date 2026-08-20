import styled from 'styled-components';
import sunIcon from '../../../assets/journal/sun.png';
import pillIcon from '../../../assets/journal/pill.png';
import moonIcon from '../../../assets/journal/moon.png';
import {
  PopupBackdrop,
  PopupCard,
  PopupInnerBorder,
  PopupClose,
  PopupTitle,
  CHOICE_ICON_SIZE,
} from '../../../components/PopupShell';

// 홈 말풍선을 누르면 아침/복약/저녁 중에서 직접 고른다.
// 선택지 생김새는 저녁 건강체크(Figma 22)의 Option과 같은 규격을 쓴다.
const OPTIONS = [
  {
    type: 'morning',
    icon: sunIcon,
    label: '아침 연결 질문',
    desc: '오늘의 이야기를 나눠요',
  },
  { type: 'medication', icon: pillIcon, label: '복용약 체크', desc: '오늘의 약을 챙겨요' },
  { type: 'evening', icon: moonIcon, label: '저녁 건강 기록', desc: '오늘의 건강을 기록해요' },
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

function TodayOndamPicker({ onSelect, onClose }) {
  return (
    <PopupBackdrop onClick={onClose}>
      <PopupCard
        $center
        $gap={16}
        $padTop={30}
        onClick={(event) => event.stopPropagation()}
        data-tour="picker-box"
      >
        <PopupInnerBorder />
        <PopupClose type="button" aria-label="닫기" onClick={onClose} data-tour="picker-close">
          ✕
        </PopupClose>

        <PopupTitle $center $size={24}>
          오늘도 온담과 함께해요!
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

export default TodayOndamPicker;
