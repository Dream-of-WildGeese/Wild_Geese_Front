import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  *, *::before, *::after {
    box-sizing: border-box;
    -webkit-tap-highlight-color: transparent;
  }

  html, body, #root {
    height: 100%;
    margin: 0;
  }

  body {
    font-family: 'Pretendard', -apple-system, sans-serif;
    font-size: ${({ theme }) => theme.fontSize.body};
    color: ${({ theme }) => theme.colors.text};
    background: ${({ theme }) => theme.colors.bg};
    -webkit-font-smoothing: antialiased;
  }

  button {
    font: inherit;
    border: none;
    background: none;
    cursor: pointer;
    padding: 0;
  }

  input, textarea {
    font: inherit;
  }

  ul, ol {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  img {
    display: block;
    max-width: 100%;
  }

  :focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`;

export default GlobalStyle;