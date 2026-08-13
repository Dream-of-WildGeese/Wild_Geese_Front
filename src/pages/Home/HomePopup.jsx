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
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: 20px;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.borderStrong};
`;

const CloseButton = styled.button`
  position: absolute;
  top: ${({ theme }) => theme.spacing.sm};
  right: ${({ theme }) => theme.spacing.sm};
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.radius.full};
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 16px;
`;

const IconWrap = styled.div`
  width: 44px;
  height: 44px;
  margin-bottom: ${({ theme }) => theme.spacing.sm};

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

const Title = styled.p`
  margin: 0;
  padding-right: ${({ theme }) => theme.spacing.lg};
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

const DescriptionBox = styled.div`
  margin-top: ${({ theme }) => theme.spacing.sm};
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.radius.sm};
  border-left: 3px solid ${({ theme }) => theme.colors.accent};
  background: ${({ theme }) => theme.colors.accentSoft};
`;

const Description = styled.p`
  margin: 0;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textMuted};
  line-height: 1.5;
  white-space: pre-line;
`;

const ConfirmButton = styled.button`
  width: 100%;
  height: 52px;
  margin-top: ${({ theme }) => theme.spacing.lg};
  border-radius: 14px;
  background: ${({ theme }) => theme.colors.accent};
  color: #fff;
  font-size: 16px;
  font-weight: 600;
`;

function HomePopup({ icon, title, description, onClose }) {
  return (
    <Backdrop onClick={onClose}>
      <Card onClick={(event) => event.stopPropagation()}>
        <CloseButton type="button" aria-label="닫기" onClick={onClose}>
          ✕
        </CloseButton>
        {icon && (
          <IconWrap>
            <img src={icon} alt="" />
          </IconWrap>
        )}
        <Title>{title}</Title>
        <DescriptionBox>
          <Description>{description}</Description>
        </DescriptionBox>
        <ConfirmButton type="button" onClick={onClose}>
          확인
        </ConfirmButton>
      </Card>
    </Backdrop>
  );
}

export default HomePopup;
