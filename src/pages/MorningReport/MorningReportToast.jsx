import styled, { keyframes } from 'styled-components';

const fadeInOut = keyframes`
  0% { opacity: 0; transform: translate(-50%, -6px); }
  12% { opacity: 1; transform: translate(-50%, 0); }
  82% { opacity: 1; transform: translate(-50%, 0); }
  100% { opacity: 0; transform: translate(-50%, -6px); }
`;

const Toast = styled.p`
  position: absolute;
  left: 50%;
  top: 168px;
  margin: 0;
  padding: 8px 16px;
  border-radius: 999px;
  background: rgba(74, 58, 47, 0.85);
  color: #fff8ed;
  font-size: 13px;
  white-space: nowrap;
  pointer-events: none;
  animation: ${fadeInOut} 1.8s ease forwards;
`;

function MorningReportToast({ message }) {
  if (!message) return null;
  return <Toast>{message}</Toast>;
}

export default MorningReportToast;
