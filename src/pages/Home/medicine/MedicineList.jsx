import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { getMedications, deleteMedication } from '../../../api/medication';
import { useApi, useApiAction } from '../../../hooks/useApi';
import { toMedicationView } from '../../../utils/medication';
import { loadTodayMedications, flattenAll } from '../TodayOndam/Medicine/medicationData';
import backIcon from '../../../assets/settings/back-icon.png';
import pillIcon from '../../../assets/medicine/pill.png';
import trashIcon from '../../../assets/medicine/trash.png';
import vineFlowerIcon from '../../../assets/medicine/vine-flower.png';

// Figma 25_ver02: '내 복용약'. 오늘 몇 개를 챙겼는지 덩굴+꽃으로 보여주고,
// 카드 안의 '수정' 글자 버튼은 없애고 카드 전체를 눌러 수정 화면으로 들어가게 했다.
const SLOT_ORDER = ['아침', '점심', '저녁'];

const Page = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  background: #fff8ed;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const Content = styled.div`
  padding: 20px 20px 30px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
`;

const BackButton = styled.button`
  width: 40px;
  height: 40px;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

const Title = styled.p`
  flex: 1;
  margin: 0;
  text-align: center;
  color: #4a3a2f;
  font-family: Jua;
  font-size: 32px;
`;

const HeaderSpacer = styled.div`
  width: 40px;
`;

const TitleDivider = styled.div`
  margin: 16px 0 20px;
  border-top: 2px dashed rgba(74, 58, 47, 0.3);
`;

const ProgressBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
`;

const ProgressText = styled.p`
  margin: 0;
  color: #4a3a2f;
  font-family: 'Noto Sans KR';
  font-size: 20px;
  font-weight: 700;
`;

const ProgressHighlight = styled.span`
  color: #7c934a;
  font-size: 24px;
`;

const ProgressSub = styled.p`
  margin: 0;
  color: #a79c8e;
  font-family: 'Noto Sans KR';
  font-size: 16px;
`;

// 오늘 챙긴 개수만큼 꽃이 덩굴 위에 핀다.
const VineWrap = styled.div`
  position: relative;
  height: 60px;
  margin-top: 12px;
`;

const VineStem = styled.div`
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 8px;
  transform: translateY(-50%);
  border-radius: 4px;
  background: #cbd879;
  border: 1px solid rgba(74, 58, 47, 0.25);
`;

const FlowerRow = styled.div`
  position: relative;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 18px;
  flex-wrap: wrap;
`;

const FlowerImg = styled.img`
  width: 58px;
  height: 40px;
  object-fit: contain;
`;

const MedList = styled.div`
  margin-top: 26px;
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

// 카드 전체가 눌리는 버튼이라, 안의 삭제 버튼은 stopPropagation으로 따로 막는다.
const MedCard = styled.button`
  position: relative;
  width: 100%;
  padding: 12px 16px;
  border-radius: 18px;
  border: 1.3px solid rgba(74, 58, 47, 0.4);
  background: rgba(255, 255, 255, 0.55);
  text-align: left;
`;

const DeleteButton = styled.button`
  position: absolute;
  top: 10px;
  right: 12px;
  width: 30px;
  height: 30px;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

const MedRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding-right: 34px;
`;

const PillIcon = styled.img`
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  object-fit: contain;
`;

const MedName = styled.p`
  margin: 0;
  flex: 1;
  min-width: 0;
  font-family: 'Noto Sans KR';
  font-size: 20px;
  font-weight: 700;
  color: #4a3a2f;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ChipRow = styled.div`
  margin-top: 10px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

// 반복 주기. 매일이면 초록, 특정 요일이면 노란 계열로 구분한다.
const RepeatChip = styled.span`
  padding: 6px 14px;
  border-radius: 15px;

  background: ${({ $daily }) => ($daily ? '#edf2d4' : '#f6ebc7')};
  border: 1.2px solid
    ${({ $daily }) => ($daily ? 'rgba(143, 174, 74, 0.6)' : 'rgba(74, 58, 47, 0.35)')};
  color: ${({ $daily }) => ($daily ? '#5b7a2e' : '#4a3a2f')};

  font-family: 'Noto Sans KR';
  font-size: 14px;
  font-weight: 700;
  white-space: nowrap;
`;

const TimeChip = styled.span`
  padding: 6px 14px;
  border-radius: 15px;
  background: #fcf8ea;
  border: 1.2px solid rgba(74, 58, 47, 0.35);

  font-family: 'Noto Sans KR';
  font-size: 14px;
  font-weight: 700;
  color: #4a3a2f;
  white-space: nowrap;
`;

const EmptyState = styled.p`
  margin: 40px 0 0;
  text-align: center;
  color: #8c8780;
  font-family: 'Noto Sans KR';
  font-size: 14px;
`;

const AddButton = styled.button`
  width: 100%;
  height: 56px;
  margin-top: 22px;
  border-radius: 16px;
  border: 1.5px solid rgba(74, 58, 47, 0.55);
  background: #dbe4a1;

  color: #4a3a2f;
  font-family: Jua;
  font-size: 22px;
`;

function MedicineList() {
  const navigate = useNavigate();
  const { data, loading, error, refetch } = useApi(getMedications);
  const { execute: removeMedication } = useApiAction(deleteMedication);
  const { data: todayData } = useApi(loadTodayMedications);

  const medications = (data ?? []).map(toMedicationView);

  const todayItems = flattenAll(todayData?.items ?? []);
  const takenToday = todayItems.filter((item) => item.taken).length;
  const totalToday = todayItems.length;
  const remainingSlots = new Set(
    todayItems.filter((item) => !item.taken).map((item) => item.slot),
  );
  const nextSlot = SLOT_ORDER.find((slot) => remainingSlots.has(slot));

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
            <img src={backIcon} alt="" />
          </BackButton>
          <Title>내 복용약</Title>
          <HeaderSpacer />
        </Header>
        <TitleDivider />

        {totalToday > 0 && (
          <>
            <ProgressBlock>
              <ProgressText>
                오늘 <ProgressHighlight>{takenToday}/{totalToday}</ProgressHighlight> 챙기셨어요
              </ProgressText>
              <ProgressSub>
                {takenToday >= totalToday ? '오늘 약을 모두 챙기셨어요!' : `아직 ${nextSlot}약이 남았어요!`}
              </ProgressSub>
            </ProgressBlock>

            <VineWrap>
              <VineStem />
              <FlowerRow>
                {Array.from({ length: takenToday }).map((_, index) => (
                  <FlowerImg key={index} src={vineFlowerIcon} alt="" />
                ))}
              </FlowerRow>
            </VineWrap>
          </>
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
              <MedCard
                key={med.id}
                type="button"
                onClick={() => navigate(`/home/medicine/${med.id}`)}
              >
                <DeleteButton
                  type="button"
                  aria-label={`${med.name} 삭제`}
                  onClick={(event) => handleDelete(event, med.id)}
                >
                  <img src={trashIcon} alt="" />
                </DeleteButton>

                <MedRow>
                  <PillIcon src={pillIcon} alt="" />
                  <MedName>{med.name}</MedName>
                </MedRow>
                <ChipRow>
                  {/* 설정한 반복 주기를 먼저 보여주고, 그 뒤에 복용 시간을 늘어놓는다 */}
                  <RepeatChip $daily={med.repeat === '매일'}>{med.repeat}</RepeatChip>
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
