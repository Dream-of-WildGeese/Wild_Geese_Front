import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

import back from '../../assets/onboarding/back.svg';
import pill from '../../assets/onboarding/med.svg';
import trash from '../../assets/onboarding/trash.svg';
import { getMedications, deleteMedication } from '../../api/medication';
import { useApi, useApiAction } from '../../hooks/useApi';
import { toMedicationView } from '../../utils/medication';

const MedicationManage = () => {
  const navigate = useNavigate();
  const { data, refetch } = useApi(getMedications);
  const { execute: removeMedication } = useApiAction(deleteMedication);
  const medications = (data ?? []).map(toMedicationView);

  const handleDelete = async (id) => {
    const { ok } = await removeMedication(id);
    if (ok) {
      refetch();
    }
  };

  return (
    <Page>
      <Content>
        <BackButton onClick={() => navigate('/onboarding/health-set')}>
          <BackIcon src={back} alt="뒤로가기" />
        </BackButton>

        <Header>
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

                <DeleteButton onClick={() => handleDelete(med.id)}>
                  <TrashIcon src={trash} alt="삭제" />
                </DeleteButton>
              </CardHeader>

              <ChipWrap>
                <RepeatChip>{med.repeat}</RepeatChip>

                {med.times.map((time) => (
                  <TimeChip key={time}>{time}</TimeChip>
                ))}
              </ChipWrap>
            </MedicationCard>
          ))}

          
        </ScrollArea>
        <AddButton onClick={() => navigate('/onboarding/medication/add')}>
            + 새 약 추가하기
          </AddButton>

        <ButtonArea>
          <DoneButton onClick={() => navigate('/onboarding/complete/2')}>
            완료
          </DoneButton>
        </ButtonArea>
      </Content>
    </Page>
  );
};

export default MedicationManage;

/* ---------------- Layout ---------------- */

const Page = styled.div`
  width: calc(100% + 32px);
  height: 100%;
  margin: 0 -${({ theme }) => theme.spacing.md};
  background: #fff8ed;
`;

const Content = styled.div`
  position: relative;

  max-width: 402px;
  height: 100%;
  margin: 0 auto;

  padding: 86px 20px 30px;
  box-sizing: border-box;

  display: flex;
  flex-direction: column;
`;

/* ---------------- Header ---------------- */

const BackButton = styled.button`
  position: absolute;
  top: 35px;
  left: 24px;
  z-index: 10;

  width: 40px;
  height: 40px;

  border: none;
  padding: 0;
  background: transparent;
  cursor: pointer;

  display: flex;
  justify-content: center;
  align-items: center;
`;

const BackIcon = styled.img`
  width: 40px;
  height: 40px;
`;

const Header = styled.div`
  height: 40px;

  display: flex;
  justify-content: center;
  align-items: center;
`;

const Title = styled.h1`
  margin: 0;

color: #4A3A2F;
text-align: center;
font-family: Jua;
font-size: 40px;
font-style: normal;
font-weight: 400;
line-height: normal;
`;

/* ---------------- Scroll ---------------- */

const ScrollArea = styled.div`  
  overflow-y: auto;

  margin-top: 48px;

  display: flex;
  flex-direction: column;
  gap: 18px;

  &::-webkit-scrollbar {
    display: none;
  }
`;

/* ---------------- Card ---------------- */

const MedicationCard = styled.div`
  padding: 14px 18px;
  border-radius: 18px;
border: 1.3px solid rgba(74, 58, 47, 0.40);
background: rgba(255, 255, 255, 0.55);
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const NameWrap = styled.div`
  display:flex;
  align-items:center;
  gap:8px;
`;

const PillIcon = styled.img`
  width:32px;
  height:32px;
`;

const MedName = styled.span`
  font-size:18px;
  font-weight:700;
`;

const DeleteButton = styled.button`
  border: none;
  background: transparent;
  padding: 0;
  cursor: pointer;
`;

const TrashIcon = styled.img`
  width: 30px;
  height: 30px;
`;

/* ---------------- Chips ---------------- */

const ChipWrap = styled.div`
  display:flex;
  align-items:center;
  gap:10px;
  margin-top:10px;
  flex-wrap:wrap;
`;

// '이틀에 한 번'처럼 긴 라벨이 들어오므로 너비를 고정하지 않고 글자에 맞춰 늘린다.
const RepeatChip = styled.div`
  min-width: 50px;
  height: 30px;
  padding: 0 12px;

  display: flex;
  justify-content: center;
  align-items: center;
  white-space: nowrap;

  border-radius: 15px;
  border: 1.2px solid rgba(74, 58, 47, 0.35);
  background: #F6EBC7;

  color: #4A3A2F;
  font-family: "Noto Sans KR";
  font-size: 14px;
  font-weight: 700;

  flex-shrink: 0;
`;

const TimeChip = styled.div`
  min-width: 95px;
  height: 30px;
  padding: 0 12px;

  display: flex;
  justify-content: center;
  align-items: center;
  white-space: nowrap;

  border-radius: 15px;
  border: 1.2px solid rgba(74, 58, 47, 0.35);
  background:#F8F5EE;

  color: #4A3A2F;
  font-family: "Noto Sans KR";
  font-size: 14px;
  font-weight: 700;

  flex-shrink: 0;
`;
/* ---------------- Buttons ---------------- */

const AddButton = styled.button`
  width: 100%;
  height: 54px;
  margin-top: 24px;
  border-radius: 16px;
  border: 1.5px solid rgba(74, 58, 47, 0.55);
  background: #EFDC9D;

  color: #4a3a2f;
  font-family: Jua;
  font-size: 20px;
  cursor: pointer;
`;

const ButtonArea = styled.div`
  position: absolute;
  left: 20px;
  right: 20px;
  bottom: 30px;
`;

const DoneButton = styled.button`
  width: 100%;
  height: 56px;

border-radius: 16px;
border: 1.5px solid rgba(74, 58, 47, 0.55);
background: #CBD879;

color: #4A3A2F;
text-align: center;
font-family: Jua;
font-size: 18px;
font-style: normal;
font-weight: 400;
line-height: normal;
`;