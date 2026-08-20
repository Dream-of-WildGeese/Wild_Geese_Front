import styled from 'styled-components';
import navQuestionIcon from '../../assets/home/nav-questions.png';
import navHomeIcon from '../../assets/home/nav-journal.png';
import navWeeklyIcon from '../../assets/home/nav-weekly.png';

// 세 그림 모두 캔버스는 160x160으로 같지만, 그 안에 실제로 그려진 크기가 제각각이라
// 같은 크기로 넣으면 어떤 건 크고 어떤 건 작아 보인다. 투명 여백을 재서(아래 참고)
// 화면에 보이는 넓이가 서로 비슷해지도록 그림마다 다른 크기를 준다.
//
//   우리의 추억     실제 119x121 (캔버스의 74% x 76%)
//   오늘의 건강일지  실제 113x142 (71% x 89%)
//   주간 이야기     실제 124x134 (78% x 84%)
//
// 이 값을 넣으면 눈에 보이는 그림이 모두 46x46 안팎이 된다.
// (예전에는 42 / 56 / 56으로 벌어져서 가운데 것만 커 보였다)
const NAV_ITEMS = [
  { key: 'questions', icon: navQuestionIcon, label: '추억 보관함', size: 61 },
  { key: 'journal', icon: navHomeIcon, label: '오늘의 건강일지', size: 58 },
  { key: 'weekly', icon: navWeeklyIcon, label: '주간 이야기', size: 57 },
];

// 그림 칸의 높이를 셋 다 똑같이 잡아둔다. 그래야 그림 높이가 달라도
// 아래 글자가 모두 같은 줄에서 시작한다.
const ICON_BOX_HEIGHT = 62;

const Nav = styled.div`
  position: absolute;
  left: 30px;
  top: 768px;
  width: 342px;
  height: 90px;
  display: flex;
  align-items: center;
  border-radius: 10px;
  background: rgba(74, 58, 47, 0.15);
`;

// 칸을 정확히 1/3씩 나누면 '오늘의 건강일지'가 들어갈 폭이 안 나온다.
// 각자 글자 길이만큼 자리를 잡은 뒤 남는 폭을 똑같이 나눠 갖게 한다.
// (양옆 두 이름의 길이가 같아서 결과는 좌우 대칭이 된다)
const NavItem = styled.button`
  flex: 1 1 auto;
  min-width: 0;
  height: 82px;
  padding: 0;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;

  border-radius: 30px;
`;

const IconBox = styled.span`
  height: ${ICON_BOX_HEIGHT}px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const NavIcon = styled.img`
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  object-fit: contain;
  pointer-events: none;
`;

const NavLabel = styled.span`
  font-family: 'Jua', sans-serif;
  font-size: 18px;
  line-height: 1.2;
  color: #4a3a2f;
  white-space: nowrap;
`;

function HomeBottomNav({ onQuestionBoxClick, onHomeClick, onWeeklyReportClick }) {
  const handlers = {
    questions: onQuestionBoxClick,
    journal: onHomeClick,
    weekly: onWeeklyReportClick,
  };

  return (
    <Nav>
      {NAV_ITEMS.map((item) => (
        <NavItem
          key={item.key}
          type="button"
          onClick={handlers[item.key]}
          data-tour={`nav-${item.key}`}
        >
          <IconBox>
            <NavIcon src={item.icon} alt="" $size={item.size} />
          </IconBox>
          <NavLabel>{item.label}</NavLabel>
        </NavItem>
      ))}
    </Nav>
  );
}

export default HomeBottomNav;
