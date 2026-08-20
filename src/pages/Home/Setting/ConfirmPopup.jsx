import styled from 'styled-components';

import logoutSon from '../../../assets/character/logout-son.png';
import logoutDaughter from '../../../assets/character/logout-daughter.png';


import {
  PopupBackdrop,
  PopupCard,
  PopupInnerBorder,
  PopupTitle,
  PopupButtonRow,
  PopupSecondaryButton,
} from '../../../components/PopupShell';

// Figma 29: 로그아웃 확인. 딸/아들 캐릭터 버전이 따로 있어서
// 건강 프로필의 성별로 그림을 고른다(성별 미설정이면 딸 그림을 기본으로 쓴다).

// 탈퇴 기능을 없애서 로그아웃 한 벌만 남았다. 예전에는 { logout: {...}, withdraw: {...} }
// 처럼 한 겹 더 감싸져 있었는데, 아래에서 성별로 바로 꺼내 쓰면서 값이 undefined가 되어
// 캐릭터가 아예 안 보였다.
const CHARACTERS = { FEMALE: logoutDaughter, MALE: logoutSon };


const Character = styled.img`
  width: auto;
  height: 126px;
  object-fit: contain;
`;

const Description = styled.p`
  margin: 0;
  width: 100%;
  text-align: center;
  color: #8c8172;
  font-family: 'Noto Sans KR';
  font-size: 16px;
  font-weight: 700;
  line-height: 1.5;
`;

// 확인 버튼만 눈에 띄는 색으로 채워서 취소와 구분한다.
const DangerButton = styled(PopupSecondaryButton)`
  background: #d97d65;
  border-color: rgba(74, 58, 47, 0.55);
  color: #fff;
`;

function ConfirmPopup({ gender, onCancel, onConfirm }) {
  const character = CHARACTERS[gender === 'MALE' ? 'MALE' : 'FEMALE'];

  return (
    <PopupBackdrop onClick={onCancel}>
      <PopupCard $center $gap={4} $padTop={36} onClick={(event) => event.stopPropagation()}>
        <PopupInnerBorder />

        <PopupTitle $center $size={24}>
          로그아웃 하시겠어요?
        </PopupTitle>

        <Character src={character} alt="" />

        <Description>다시 로그인하면 기록은 그대로 남아있어요</Description>

        <PopupButtonRow style={{ marginTop: 18 }}>
          <PopupSecondaryButton type="button" onClick={onCancel}>
            취소
          </PopupSecondaryButton>
          <DangerButton type="button" onClick={onConfirm}>
            로그아웃
          </DangerButton>
        </PopupButtonRow>
      </PopupCard>
    </PopupBackdrop>
  );
}

export default ConfirmPopup;
