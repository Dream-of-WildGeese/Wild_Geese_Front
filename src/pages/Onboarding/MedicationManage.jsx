import React , { useState }from 'react'
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import pill from '../../assets/onboarding/pill.png';

const MedicationManage = () => {
  const navigate = useNavigate();
  const handleDelete = (id) => {
  setMedications((prev) => prev.filter((med) => med.id !== id));
};

  const [medications, setMedications] = useState([
  {
    id: 1,
    name: '혈압약',
    times: ['오전 8:00', '오후 6:00'],
    repeat: '매일',
  },
  {
    id: 2,
    name: '비타민D',
    times: ['오전 8:00'],
    repeat: '매일',
  },
]);

  return (
  <Page>
    <Content>
      <Header>
        <BackButton onClick={() => navigate(-1)}>‹</BackButton>
        <Title>복용약 관리</Title>
      </Header>

      <ScrollArea>
        {medications.map((med) => (
          <MedicationCard key={med.id}>
            <CardHeader>
              <NameWrap>
                <PillIcon src={pill} alt="" />
                <MedName>{med.name}</MedName>
              </NameWrap>

              <DeleteButton onClick={() => handleDelete(med.id)}>🗑️</DeleteButton>
            </CardHeader>

            <ChipWrap>
              {med.times.map((time) => (
                <TimeChip key={time}>{time}</TimeChip>
              ))}
              <RepeatChip>{med.repeat}</RepeatChip>
            </ChipWrap>
          </MedicationCard>
        ))}

        <AddButton onClick={() => navigate("/onboarding/medication/add")}>
          + 새 약 추가하기
        </AddButton>
      </ScrollArea>

      <DoneButton onClick={() => navigate(-1)}>
        완료
      </DoneButton>
    </Content>
  </Page>
    );
};





export default MedicationManage

const Page = styled.div`
  width: calc(100% + 32px);
  height: 100%;
  margin: 0 -${({ theme }) => theme.spacing.md};
  background: #fff8ed;
`;

const Content = styled.div`
  max-width: 402px;
  height: 100%;
  margin: 0 auto;
  padding: 50px 20px 20px;
  box-sizing: border-box;

  display: flex;
  flex-direction: column;
`;

/* ---------------- Header ---------------- */

const Header = styled.div`
  position: relative;
  height: 40px;

  display: flex;
  justify-content: center;
  align-items: center;
`;

const BackButton = styled.button`
  position: absolute;
  left: 0;

  border: none;
  background: none;
  padding: 0;

  font-size: 30px;
  color: #4a3a2f;
  cursor: pointer;
`;

const Title = styled.h1`
  margin: 0;

  color: #4a3a2f;
  font-family: 'Jua', sans-serif;
  font-size: 28px;
  font-weight: 400;
`;

/* ---------------- Scroll ---------------- */

const ScrollArea = styled.div`
  flex: 1;
  margin-top: 36px;

  display: flex;
  flex-direction: column;
  gap: 16px;

  overflow-y: auto;
  padding-bottom: 20px;

  &::-webkit-scrollbar {
    display: none;
  }

  scrollbar-width: none;
`;

/* ---------------- Card ---------------- */

const MedicationCard = styled.div`
  padding: 18px;

  border-radius: 24px;
  border: 2px solid rgba(74, 58, 47, 0.25);
  background: rgba(255, 255, 255, 0.55);
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const NameWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const PillIcon = styled.img`
  width: 26px;
  height: 26px;
`;

const MedName = styled.span`
  color: #4a3a2f;
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 20px;
  font-weight: 700;
`;

const DeleteButton = styled.button`
  border: none;
  background: none;
  padding: 0;

  font-size: 18px;
  cursor: pointer;
`;

const ChipWrap = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  margin-top: 16px;
`;

const TimeChip = styled.div`
  padding: 8px 16px;
 display: flex;
width: 95px;
height: 30px;
justify-content: center;
align-items: center;
border-radius: 15px;
border: 1.2px solid rgba(74, 58, 47, 0.35);
background: rgba(255, 255, 255, 0.60);
flex-direction: column;
flex-shrink: 0;
color: #4A3A2F;
text-align: center;
font-family: "Noto Sans KR";
font-size: 14px;
font-style: normal;
font-weight: 700;
line-height: normal;
`;

const RepeatChip = styled.div`
display: flex;
width: 50px;
height: 30px;
justify-content: center;
align-items: center;
border-radius: 15px;
border: 1.2px solid rgba(74, 58, 47, 0.35);
background: rgba(255, 255, 255, 0.60);
flex-direction: column;
justify-content: center;
flex-shrink: 0;
color: #4A3A2F;
text-align: center;
font-family: "Noto Sans KR";
font-size: 14px;
font-style: normal;
font-weight: 700;
line-height: normal;

`;

/* ---------------- Buttons ---------------- */

const AddButton = styled.button`
  width: 100%;
  height: 56px;

  margin-top: 16px;

  border-radius: 16px;
  border: 1.5px solid rgba(74, 58, 47, 0.55);

  background: #f6ebc7;

  color: #4a3a2f;
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 18px;
  font-weight: 700;

  cursor: pointer;
`;

const DoneButton = styled.button`
  width: 100%;
  height: 56px;

  margin-top: auto;

  border-radius: 16px;
  border: 1.5px solid rgba(74, 58, 47, 0.55);

  background: #cbd879;

  color: #fff8ed;
  font-family: 'Jua', sans-serif;
  font-size: 18px;
  font-weight: 400;

  cursor: pointer;
`;