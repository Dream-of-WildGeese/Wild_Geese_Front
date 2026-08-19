import styled, { keyframes } from 'styled-components';

// 조회 중이거나 온담이 한마디를 만드는 중처럼, 기다려야 하는 자리에 쓰는 표시.
// 예전에는 화면마다 '불러오는 중이에요...' 글자만 띄워서, 멈춘 건지 도는 중인지
// 알 수 없었다. 도는 그림을 함께 둬서 기다리는 중이라는 게 보이게 한다.

const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

export const Spinner = styled.span`
  flex-shrink: 0;
  display: inline-block;
  width: ${({ $size }) => $size ?? 18}px;
  height: ${({ $size }) => $size ?? 18}px;
  box-sizing: border-box;

  border: 2px solid rgba(74, 58, 47, 0.18);
  border-top-color: #8fae4a;
  border-radius: 50%;

  animation: ${spin} 0.7s linear infinite;

  /* 움직임을 줄여 쓰는 분에게는 천천히 돈다. 아주 멈추면 기다리는 중인지 알 수 없다. */
  @media (prefers-reduced-motion: reduce) {
    animation-duration: 2.4s;
  }
`;

const Row = styled.p`
  margin: 0;
  width: 100%;
  padding: ${({ $compact }) => ($compact ? '10px 0' : '24px 0')};

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;

  color: #8c8780;
  font-family: 'Noto Sans KR';
  font-size: 15px;
  font-weight: 500;
  word-break: keep-all;
`;

// role="status"를 달아두면 화면을 읽어주는 도구도 기다리는 중이라는 걸 알린다.
export function LoadingLine({ children, $size, $compact }) {
  return (
    <Row role="status" $compact={$compact}>
      <Spinner $size={$size} aria-hidden="true" />
      {children}
    </Row>
  );
}

export default LoadingLine;
