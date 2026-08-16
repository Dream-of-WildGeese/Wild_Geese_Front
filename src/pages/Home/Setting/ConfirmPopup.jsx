import styled from 'styled-components';
import logoutDaughter from '../../../assets/character/logout-daughter.png';
import logoutSon from '../../../assets/character/logout-son.png';
import withdrawDaughter from '../../../assets/character/withdraw-daughter.png';
import withdrawSon from '../../../assets/character/withdraw-son.png';
import {
  PopupBackdrop,
  PopupCard,
  PopupInnerBorder,
  PopupTitle,
  PopupButtonRow,
  PopupSecondaryButton,
} from '../../../components/PopupShell';

// Figma 29 / 30: 로그아웃·탈퇴 확인. 각각 딸/아들 캐릭터 버전이 따로 있어서
// 건강 프로필의 성별로 그림을 고른다(성별 미설정이면 딸 그림을 기본으로 쓴다).
const CHARACTERS = {
  logout: { FEMALE: logoutDaughter, MALE: logoutSon },
  withdraw: { FEMALE: withdrawDaughter, MALE: withdrawSon },
};

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

// 되돌릴 수 없는 동작이라 확인 버튼만 경고색으로 채운다.
const DangerButton = styled(PopupSecondaryButton)`
  background: ${({ $tone }) => ($tone === 'withdraw' ? '#c1553c' : '#d97d65')};
  border-color: rgba(74, 58, 47, 0.55);
  color: #fff;
`;

function ConfirmPopup({ type, gender, onCancel, onConfirm }) {
  const isWithdraw = type === 'withdraw';
  const character = CHARACTERS[type][gender === 'MALE' ? 'MALE' : 'FEMALE'];

  return (
    <PopupBackdrop onClick={onCancel}>
      <PopupCard $center $gap={4} $padTop={36} onClick={(event) => event.stopPropagation()}>
        <PopupInnerBorder />

        <PopupTitle $center $size={24}>
          {isWithdraw ? '정말 탈퇴하시겠어요?' : '로그아웃 하시겠어요?'}
        </PopupTitle>

        <Character src={character} alt="" />

        <Description>
          {isWithdraw ? (
            <>
              탈퇴하면 그동안 쌓은 기록과
              <br />
              가족 연결이 모두 사라져요
            </>
          ) : (
            '다시 로그인하면 기록은 그대로 남아있어요'
          )}
        </Description>

        <PopupButtonRow style={{ marginTop: 18 }}>
          <PopupSecondaryButton type="button" onClick={onCancel}>
            취소
          </PopupSecondaryButton>
          <DangerButton type="button" $tone={type} onClick={onConfirm}>
            {isWithdraw ? '탈퇴하기' : '로그아웃'}
          </DangerButton>
        </PopupButtonRow>
      </PopupCard>
    </PopupBackdrop>
  );
}

export default ConfirmPopup;
