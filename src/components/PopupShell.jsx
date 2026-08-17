import styled from 'styled-components';
import PopupPortal from './PopupPortal';

// Figma 팝업(13~35)이 전부 공유하는 카드 틀.
// 크림색 카드 + 안쪽 점선 테두리 + 연두색 CTA가 기본 형태다.
const BackdropBase = styled.div`
  /* Layout(폰 프레임)이 기준이 되도록 absolute를 쓴다. fixed면 브라우저 창 가운데에 뜬다. */
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 24px;
  background: rgba(26, 23, 20, 0.55);
  z-index: ${({ theme }) => theme.zIndex.modal};
`;

// 폰 프레임에 직접 붙여서, 어느 페이지에서 열든 같은 위치에 뜨게 한다.
export function PopupBackdrop(props) {
  return (
    <PopupPortal>
      <BackdropBase {...props} />
    </PopupPortal>
  );
}

export const PopupCard = styled.div`
  position: relative;
  width: 100%;
  max-width: 377px;
  max-height: 84vh;
  overflow-y: auto;

  display: flex;
  flex-direction: column;
  align-items: ${({ $center }) => ($center ? 'center' : 'flex-start')};
  gap: ${({ $gap }) => $gap ?? 12}px;

  padding: ${({ $padTop }) => $padTop ?? 30}px 26px 34px;
  border-radius: 10px;
  border: 3px solid rgba(108, 67, 23, 0.7);
  background: #fef3d5;

  &::-webkit-scrollbar {
    display: none;
  }
`;

// 카드 안쪽을 한 겹 더 두르는 점선 장식. 클릭을 막지 않도록 pointer-events를 끈다.
export const PopupInnerBorder = styled.div`
  position: absolute;
  inset: 11px 8px;
  border-radius: 10px;
  border: 3px dashed rgba(108, 67, 23, 0.7);
  pointer-events: none;
`;

export const PopupClose = styled.button`
  align-self: flex-start;
  color: #8c8780;
  font-size: 18px;
  line-height: 1;
`;

export const PopupTitle = styled.p`
  margin: 0;
  width: 100%;
  color: #4a3a2f;
  font-family: 'Noto Sans KR';
  font-size: ${({ $size }) => $size ?? 26}px;
  font-weight: 700;
  text-align: ${({ $center }) => ($center ? 'center' : 'left')};
`;

export const PopupSubtitle = styled.p`
  margin: 0;
  width: 100%;
  color: #8c8780;
  font-family: 'Noto Sans KR';
  font-size: 15px;
  font-weight: 700;
  text-align: ${({ $center }) => ($center ? 'center' : 'left')};
  line-height: 1.5;
`;

export const PopupPrimaryButton = styled.button`
  width: 100%;
  height: 50px;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  border-radius: 10px;
  border: 1.5px solid rgba(74, 58, 47, 0.55);
  background: #dbe4a1;

  color: #4a3a2f;
  font-family: Jua;
  font-size: 20px;

  &:disabled {
    opacity: 0.5;
  }
`;

// 취소/확인처럼 두 개를 나란히 놓을 때 쓰는 보조 버튼
export const PopupSecondaryButton = styled(PopupPrimaryButton)`
  background: #fffbf1;
  border-color: #d8cbb8;
  color: #8c8780;
`;

export const PopupButtonRow = styled.div`
  display: flex;
  gap: 12px;
  width: 100%;
`;

export const PopupBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 12px;
  border-radius: 20px;
  border: 1.5px solid #cbd879;
  background: #edf3d5;

  color: #576b1a;
  font-family: 'Noto Sans KR';
  font-size: 14px;
  font-weight: 700;
  white-space: nowrap;
`;

export const PopupIcon = styled.img`
  width: ${({ $size }) => $size ?? 90}px;
  height: ${({ $size }) => $size ?? 90}px;
  object-fit: contain;
  flex-shrink: 0;
`;
