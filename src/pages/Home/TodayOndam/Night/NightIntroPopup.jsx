import styled from 'styled-components';
import mascotImg from '../../../../assets/mascot.png';

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.lg};
  background: rgba(44, 44, 42, 0.4);
  z-index: ${({ theme }) => theme.zIndex.modal};
`;

const Card = styled.div`
  position: relative;
  width: 100%;
  max-width: 320px;
  padding: 32px 28px 28px;
  border-radius: 24px;
  background: ${({ theme }) => theme.colors.surface};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
`;

const CharacterCircle = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 32px;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.accentSoft};

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const Message = styled.p`
  margin: 0;
  font-size: 19px;
  font-weight: 600;
  text-align: center;
  color: ${({ theme }) => theme.colors.text};
  line-height: 1.4;
`;

const PrimaryButton = styled.button`
  width: 100%;
  max-width: 264px;
  height: 50px;
  border-radius: 10px;
  background: ${({ theme }) => theme.colors.accent};
  color: #fff;
  font-size: 17px;
  font-weight: 600;
`;

function NightIntroPopup({ onStart, onClose }) {
  return (
    <Backdrop onClick={onClose}>
      <Card onClick={(event) => event.stopPropagation()}>
        <CharacterCircle>
          <img src={mascotImg} alt="" />
        </CharacterCircle>
        <Message>
          오늘 하루는 어떠셨어요?
          <br />
          건강체크도 잊지 마세요!
        </Message>
        <PrimaryButton type="button" onClick={onStart}>
          시작할게요
        </PrimaryButton>
      </Card>
    </Backdrop>
  );
}

export default NightIntroPopup;
