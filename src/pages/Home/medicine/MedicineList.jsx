import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { getMedications, deleteMedication } from '../../../api/medication';
import { useApi, useApiAction } from '../../../hooks/useApi';
import { toMedicationView } from '../../../utils/medication';

const Page = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  background: #FFF8ED;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const Content = styled.div`
  padding: 16px 20px 30px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 12px;
  border-bottom: 1.3px solid rgba(74,58,47,.25);
`;

const BackButton = styled.button`
  width: 20px;
  font-size: 22px;
  color: #000;
  line-height: 1;
`;

const Title = styled.p`
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  color: #000;
`;

const HeaderSpacer = styled.div`
  width: 20px;
`;

const Summary = styled.div`
  margin-top: 16px;
  padding: 16px;
  border-radius: 18px;
  background: rgba(255,255,255,.55);
  border: 1.3px solid rgba(74,58,47,.4);
`;

const SummaryTitle = styled.p`
  margin: 0 0 6px;
  font-size: 16px;
  font-weight: 500;
  color: #4A3A2F;
`;

const SummarySub = styled.p`
  margin: 0;
  font-size: 13px;
  color: #6b6661;
`;

const MedList = styled.div`
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const MedCard = styled.button`
  width: 100%;
  padding: 16px;
  border-radius: 18px;
  border: 1px solid #e5e0d9;
  background: #FFF8ED;
  text-align: left;
`;

const MedRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const MedName = styled.p`
  margin: 0;
  font-size: 17px;
  font-weight: 500;
  color: #000;
`;

const DeleteButton = styled.span`
  font-size: 18px;
`;

const ChipRow = styled.div`
  margin-top: 10px;
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
`;

const TimeChip = styled.span`
  padding: 5px 12px;
  border-radius: 8px;
  background: #F8F5EE;
  border: 1.2px solid rgba(74,58,47,.35);
  font-size: 14px;
  color: #000;
`;

const EmptyState = styled.p`
  margin: 40px 0 0;
  text-align: center;
  font-size: 14px;
  color: #8c8780;
`;

const AddButton = styled.button`
  width: 100%;
  height: 54px;
  margin-top: 12px;
  border-radius: 16px;
  border: 2px solid #e8734a;
  background: #FFF8ED;
  color: #e8734a;
  font-size: 16px;
  font-weight: 500;
`;

function MedicineList() {
  const navigate = useNavigate();
  const { data, loading, error, refetch } = useApi(getMedications);
  const { execute: removeMedication } = useApiAction(deleteMedication);

  const medications = (data ?? []).map(toMedicationView);
  const totalDoses = medications.reduce((sum, med) => sum + med.times.length, 0);

  // 삭제 후 목록을 다시 불러와서 서버 상태와 어긋나지 않게 한다.
  const handleDelete = async (event, id) => {
    event.stopPropagation();
    const { ok } = await removeMedication(id);
    if (ok) {
      refetch();
    }
  };

  return (
    <Page>
      <Content>
        <Header>
          <BackButton type="button" aria-label="뒤로가기" onClick={() => navigate('/home')}>
            ‹
          </BackButton>
          <Title>내 복용약</Title>
          <HeaderSpacer />
        </Header>

        {medications.length > 0 && (
          <Summary>
            <SummaryTitle>등록된 약 {medications.length}개</SummaryTitle>
            <SummarySub>하루 총 {totalDoses}번 복약 알림이 울려요</SummarySub>
          </Summary>
        )}

        {loading ? (
          <EmptyState>불러오는 중이에요...</EmptyState>
        ) : error ? (
          <EmptyState>{error.message}</EmptyState>
        ) : medications.length === 0 ? (
          <EmptyState>등록된 약이 아직 없어요. 아래에서 추가해보세요.</EmptyState>
        ) : (
          <MedList>
            {medications.map((med) => (
              <MedCard key={med.id} type="button" onClick={() => navigate(`/home/medicine/${med.id}`)}>
                <MedRow>
                  <MedName>{med.name}</MedName>
                  <DeleteButton onClick={(event) => handleDelete(event, med.id)}>🗑</DeleteButton>
                </MedRow>
                <ChipRow>
                  {med.times.map((time) => (
                    <TimeChip key={time}>{time}</TimeChip>
                  ))}
                </ChipRow>
              </MedCard>
            ))}
          </MedList>
        )}

        <AddButton type="button" onClick={() => navigate('/onboarding/medication/add')}>
          + 새 약 추가하기
        </AddButton>
      </Content>
    </Page>
  );
}

export default MedicineList;
