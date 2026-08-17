import styled from 'styled-components';

// 팝업이 브라우저 창이 아니라 이 폰 프레임 안에서 뜨도록 id를 달아둔다.
// (PopupPortal이 이 엘리먼트를 찾아 붙는다)
export const APP_FRAME_ID = 'app-frame';

const Layout = styled.div.attrs({ id: APP_FRAME_ID })`
  position: relative;
  width: 100%;
  max-width: 402px;
  height: 874px;
  margin: ${({ theme }) => theme.spacing.xl} auto 0;
  overflow: hidden;
  border-radius: 40px;
  border: 2px solid #000;
  background: ${({ theme }) => theme.colors.surface};
`;

export default Layout;
