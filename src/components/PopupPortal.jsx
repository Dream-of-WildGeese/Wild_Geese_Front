import { createPortal } from 'react-dom';
import { APP_FRAME_ID } from './Layout';

// 팝업을 폰 프레임(Layout) 바로 아래에 붙인다.
//
// 그냥 페이지 안에 두면, 페이지 컨테이너가 position: relative일 때 그 페이지가
// 기준이 된다. 설정·아침일지처럼 스크롤되는 페이지에서는 스크롤 영역 전체 높이의
// 한가운데로 밀려나서 화면 밖에 뜨는 문제가 생긴다.
function PopupPortal({ children }) {
  const frame = typeof document !== 'undefined' && document.getElementById(APP_FRAME_ID);
  if (!frame) return children;
  return createPortal(children, frame);
}

export default PopupPortal;
