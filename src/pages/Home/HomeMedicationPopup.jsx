import { useState } from 'react';
import styled from 'styled-components';
import medicationIcon from '../../assets/medication-icon.png';

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
  max-height: 80vh;
  overflow-y: auto;
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
  width: 40px;
  height: 40px;
  margin-bottom: ${({ theme }) => theme.spacing.sm};

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const Title = styled.p`
  margin: 0;
  padding-right: ${({ theme }) => theme.spacing.lg};
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

const MedList = styled.ul`
  margin: ${({ theme }) => theme.spacing.md} 0 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const MedCard = styled.li`
  position: relative;
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: 14px;
  background: ${({ theme }) => theme.colors.accentSoft};
`;

const MedName = styled.p`
  margin: 0 0 4px;
  font-size: 16px;
  color: ${({ theme }) => theme.colors.text};
`;

const MedTime = styled.p`
  margin: 0;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const RemoveButton = styled.button`
  position: absolute;
  top: ${({ theme }) => theme.spacing.sm};
  right: ${({ theme }) => theme.spacing.sm};
  font-size: 13px;
  color: ${({ theme }) => theme.colors.danger};
`;

const EmptyState = styled.p`
  margin: ${({ theme }) => theme.spacing.md} 0 0;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.md};
`;

const Input = styled.input`
  height: 44px;
  padding: 0 12px;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.colors.borderStrong};
  font-size: 15px;
  color: ${({ theme }) => theme.colors.text};
`;

const AddButton = styled.button`
  height: 48px;
  margin-top: ${({ theme }) => theme.spacing.xs};
  border-radius: 14px;
  background: ${({ theme }) => theme.colors.accent};
  color: #fff;
  font-size: 15px;
  font-weight: 600;
`;

function HomeMedicationPopup({ onClose }) {
  const [medications, setMedications] = useState([]);
  const [name, setName] = useState('');
  const [time, setTime] = useState('');

  const handleAdd = (event) => {
    event.preventDefault();
    if (!name.trim() || !time.trim()) return;
    setMedications((prev) => [...prev, { id: Date.now(), name: name.trim(), time: time.trim() }]);
    setName('');
    setTime('');
  };

  const handleRemove = (id) => {
    setMedications((prev) => prev.filter((med) => med.id !== id));
  };

  return (
    <Backdrop onClick={onClose}>
      <Card onClick={(event) => event.stopPropagation()}>
        <CloseButton type="button" aria-label="닫기" onClick={onClose}>
          ✕
        </CloseButton>
        <IconWrap>
          <img src={medicationIcon} alt="" />
        </IconWrap>
        <Title>복용약 설정</Title>

        {medications.length === 0 ? (
          <EmptyState>등록된 약이 아직 없어요. 아래에서 추가해보세요.</EmptyState>
        ) : (
          <MedList>
            {medications.map((med) => (
              <MedCard key={med.id}>
                <RemoveButton type="button" onClick={() => handleRemove(med.id)}>
                  삭제
                </RemoveButton>
                <MedName>{med.name}</MedName>
                <MedTime>{med.time}</MedTime>
              </MedCard>
            ))}
          </MedList>
        )}

        <Form onSubmit={handleAdd}>
          <Input
            placeholder="약 이름 (예: 혈압약)"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <Input
            placeholder="복용 시간 (예: 오전 8:00, 오후 6:00)"
            value={time}
            onChange={(event) => setTime(event.target.value)}
          />
          <AddButton type="submit">약 추가하기</AddButton>
        </Form>
      </Card>
    </Backdrop>
  );
}

export default HomeMedicationPopup;
