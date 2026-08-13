import styled from 'styled-components';

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

const CheckCircle = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 32px;
  background: #e0f2e3;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 600;
  color: #339959;
`;

const Title = styled.p`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  text-align: center;
  color: ${({ theme }) => theme.colors.text};
  max-width: 300px;
`;

const Description = styled.p`
  margin: 0;
  font-size: 14px;
  text-align: center;
  color: ${({ theme }) => theme.colors.textMuted};
  line-height: 1.5;
`;

const PrimaryButton = styled.button`
  width: 100%;
  max-width: 264px;
  height: 50px;
  border-radius: 10px;
  background: ${({ theme }) => theme.colors.accent};
  color: #fff;
  font-size: 16px;
  font-weight: 600;
`;

function NightCompletePopup({ onClose }) {
  return (
    <Backdrop onClick={onClose}>
      <Card onClick={(event) => event.stopPropagation()}>
        <CheckCircle>✓</CheckCircle>
        <Title>오늘의 건강기록도 잘 남겨주셨어요!</Title>
        <Description>
          매일의 건강기록은 '오늘의 온담'에서
          <br />
          모아볼 수 있어요!
        </Description>
        <PrimaryButton type="button" onClick={onClose}>
          닫기
        </PrimaryButton>
      </Card>
    </Backdrop>
  );
}

export default NightCompletePopup;
