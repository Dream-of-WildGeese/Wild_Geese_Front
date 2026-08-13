import styled from 'styled-components';

const Layout = styled.div`
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
