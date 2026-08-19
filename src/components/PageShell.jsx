import styled from 'styled-components';
import backIcon from '../assets/onboarding/back.svg';

// 팝업이 아닌 '페이지'가 공유하는 틀. 건강검진 화면(HealthCheck)의 구조를 기준으로 삼았다.
//
// 뒤로가기·제목·구분선은 위에 붙어 있고 그 아래만 스크롤된다. 저장/추가처럼 꼭 눌러야 하는
// 버튼은 아래에 붙여서 목록을 내려도 계속 보인다. 페이지마다 각자 헤더를 그리던 걸
// 여기로 모아서, 화면을 옮겨도 뒤로가기 위치가 흔들리지 않게 했다.

export const PageFrame = styled.div`
  width: 100%;
  height: 100%;
  background: #fff8ed;
  display: flex;
  justify-content: center;
`;

export const PageContent = styled.div`
  position: relative;
  width: 100%;
  max-width: 402px;
  height: 100%;
  margin: 0 auto;
  box-sizing: border-box;

  padding: 86px 20px 24px;

  display: flex;
  flex-direction: column;
`;

// 스크롤 영역 바깥에 절대 위치로 둔다. 안에 두면 목록을 내릴 때 같이 밀려 올라간다.
const BackButton = styled.button`
  position: absolute;
  top: 35px;
  left: 20px;
  z-index: 10;

  width: 40px;
  height: 40px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;

  display: flex;
  align-items: center;
  justify-content: center;
`;

const BackIconImage = styled.img`
  width: 38px;
  height: 38px;
  object-fit: contain;
`;

export function PageBack({ onClick, label = '뒤로가기' }) {
  return (
    <BackButton type="button" aria-label={label} onClick={onClick}>
      <BackIconImage src={backIcon} alt="" />
    </BackButton>
  );
}

export const PageHeader = styled.div`
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
`;

export const PageTitle = styled.h1`
  margin: 0;
  width: 100%;
  text-align: center;
  color: #4a3a2f;
  font-family: Jua, sans-serif;
  font-size: ${({ $size }) => $size ?? 38}px;
  font-weight: 400;
  line-height: 1.1;
`;

// 제목 위아래에 붙는 한 줄 (날짜, 안내 문구 등)
export const PageCaption = styled.p`
  margin: 0;
  width: 100%;
  text-align: center;
  color: #a79c8e;
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 18px;
  font-weight: 700;
`;

export const PageDivider = styled.div`
  flex-shrink: 0;
  width: 100%;
  border-bottom: 1.5px dashed rgba(74, 58, 47, 0.25);
  margin: 14px 0 18px;
`;

export const PageScrollArea = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;

  display: flex;
  flex-direction: column;
  gap: ${({ $gap }) => $gap ?? 0}px;

  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

// 스크롤과 상관없이 아래에 남는 버튼 자리
export const PageFooter = styled.div`
  flex-shrink: 0;
  padding-top: 14px;
`;
