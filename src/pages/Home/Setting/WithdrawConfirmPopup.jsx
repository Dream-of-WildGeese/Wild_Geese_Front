import styled from 'styled-components';

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(26, 23, 20, 0.55);
  z-index: ${({ theme }) => theme.zIndex.modal};
`;

const Card = styled.div`
  width: 100%;
  max-width: 320px;
  padding: 28px 28px 24px;
  border-radius: 24px;
  background: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

const Title = styled.p`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #000;
`;

const Desc = styled.p`
  margin: 0;
  font-size: 13px;
  color: #6b6661;
  text-align: center;
  line-height: 1.5;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 10px;
  width: 100%;
  margin-top: 16px;
`;

const CancelButton = styled.button`
  flex: 1;
  height: 48px;
  border-radius: 10px;
  border: 1px solid #e5e0d9;
  font-size: 15px;
  font-weight: 500;
  color: #000;
`;

const ConfirmButton = styled.button`
  flex: 1;
  height: 48px;
  border-radius: 10px;
  background: #cc4d4d;
  color: #fff;
  font-size: 15px;
  font-weight: 600;
`;

function WithdrawConfirmPopup({ onCancel, onConfirm }) {
  return (
    <Backdrop onClick={onCancel}>
      <Card onClick={(event) => event.stopPropagation()}>
        <Title>정말 탈퇴하시겠어요?</Title>
        <Desc>
          건강 기록, 가족 연결이 모두 삭제되고
          <br />
          복구할 수 없어요
        </Desc>
        <ButtonRow>
          <CancelButton type="button" onClick={onCancel}>
            취소
          </CancelButton>
          <ConfirmButton type="button" onClick={onConfirm}>
            탈퇴하기
          </ConfirmButton>
        </ButtonRow>
      </Card>
    </Backdrop>
  );
}

export default WithdrawConfirmPopup;
