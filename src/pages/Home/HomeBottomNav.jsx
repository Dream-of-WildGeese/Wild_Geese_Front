import styled from 'styled-components';
import navQuestionIcon from '../../assets/nav-question-icon.png';
import navHomeIcon from '../../assets/nav-home-icon.png';
import navWeeklyIcon from '../../assets/nav-weekly-icon.png';

const Nav = styled.div`
  position: absolute;
  left: 30px;
  top: 768px;
  width: 342px;
  height: 90px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-radius: 10px;
  background: rgba(74, 58, 47, 0.15);
`;

const NavItem = styled.button`
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 71px;
  padding: 0 10px;
  border-radius: 30px;
`;

const NavIcon = styled.img`
  width: 90px;
  height: ${({ $height }) => $height}px;
  object-fit: contain;
  pointer-events: none;
`;

const NavLabel = styled.span`
  font-family: 'Jua', sans-serif;
  font-size: 18px;
  color: #4a3a2f;
`;

function HomeBottomNav({ onQuestionBoxClick, onHomeClick, onWeeklyReportClick }) {
  return (
    <Nav>
      <NavItem type="button" onClick={onQuestionBoxClick}>
        <NavIcon src={navQuestionIcon} alt="" $height={56} />
        <NavLabel>질문함</NavLabel>
      </NavItem>
      <NavItem type="button" onClick={onHomeClick}>
        <NavIcon src={navHomeIcon} alt="" $height={63} />
        <NavLabel>오늘의 온담</NavLabel>
      </NavItem>
      <NavItem type="button" onClick={onWeeklyReportClick}>
        <NavIcon src={navWeeklyIcon} alt="" $height={64} />
        <NavLabel>주간 리포트</NavLabel>
      </NavItem>
    </Nav>
  );
}

export default HomeBottomNav;
