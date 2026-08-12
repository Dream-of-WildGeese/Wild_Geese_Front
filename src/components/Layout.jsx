import styled from 'styled-components';

const Layout = styled.div`
  width: 100%;
  max-width: 480px;
  min-height: 100%;
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.surface};
`;

export default Layout;