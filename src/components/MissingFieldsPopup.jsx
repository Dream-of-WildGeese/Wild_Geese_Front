import styled from 'styled-components';
import {
  PopupBackdrop,
  PopupCard,
  PopupInnerBorder,
  PopupTitle,
  PopupSubtitle,
  PopupPrimaryButton,
} from './PopupShell';

// 필수 입력이 덜 채워진 채로 '다음'을 눌렀을 때, 무엇이 비었는지 짚어주는 팝업.
// 버튼을 비활성화만 해두면 눌러도 아무 일이 없어서 이유를 알 수 없다.
// 이미 채운 항목은 알려줄 이유가 없으므로 빠진 것만 보여준다.
const List = styled.ul`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Item = styled.li`
  display: flex;
  align-items: center;
  gap: 10px;

  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid rgba(217, 138, 119, 0.65);
  background: #fffbf1;

  color: #4a3a2f;
  font-family: 'Noto Sans KR';
  font-size: 16px;
  font-weight: 700;
`;

const Mark = styled.span`
  width: 22px;
  height: 22px;
  border-radius: 11px;
  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  background: #e6a794;
  color: #fff;
  font-size: 13px;
  line-height: 1;
`;

function MissingFieldsPopup({ items, onClose }) {
  const missing = items.filter((item) => !item.done);
  if (missing.length === 0) return null;

  return (
    <PopupBackdrop onClick={onClose}>
      <PopupCard $center $gap={14} $padTop={36} onClick={(event) => event.stopPropagation()}>
        <PopupInnerBorder />

        <PopupTitle $center $size={22}>
          {missing.length}개만 더 채워주세요!
        </PopupTitle>
        <PopupSubtitle $center>아래 항목을 입력하면 다음으로 넘어갈 수 있어요</PopupSubtitle>

        <List>
          {missing.map((item) => (
            <Item key={item.label}>
              <Mark>!</Mark>
              {item.label}
            </Item>
          ))}
        </List>

        <PopupPrimaryButton type="button" onClick={onClose}>
          채우러 가기
        </PopupPrimaryButton>
      </PopupCard>
    </PopupBackdrop>
  );
}

export default MissingFieldsPopup;
