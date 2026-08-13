import styled from 'styled-components';

const Layout = styled.div`
  position: relative;
  width: 100%;
  max-width: 402px;
  height: 874px;
  margin: 0 auto;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.surface};
`;

export default Layout;
