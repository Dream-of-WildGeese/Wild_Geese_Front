import { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { getMedications, deleteMedication } from '../../../api/medication';
import { useApi, useApiAction } from '../../../hooks/useApi';
import { toMedicationView } from '../../../utils/medication';
import pillIcon from '../../../assets/medicine/pill.png';
import pencilIcon from '../../../assets/weekly/pencil.png';
import trashIcon from '../../../assets/medicine/trash.png';
import {
  PageFrame,
  PageContent,
  PageClose,
  PageHeader,
  PageTitle,
  PageDivider,
  PageScrollArea,
  PageFooter,
} from '../../../components/PageShell';
import {
  PopupBackdrop,
  PopupCard,
  PopupInnerBorder,
  PopupTitle,
  PopupPrimaryButton,
  PopupSecondaryButton,
  PopupButtonRow,
} from '../../../components/PopupShell';

// Figma 25_ver02: '내 복용약'. 등록해둔 약을 보고 고치고 지우는 화면이다.
// 오늘 몇 개를 챙겼는지 보여주던 문구와 덩굴 진행바는 뺐다 — 여기는 약을
// 체크하는 곳이 아니라서, 체크 화면(약 체크 팝업)과 헷갈렸다.
const MedList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const MedCard = styled.div`
  position: relative;
  width: 100%;
  padding: 12px 16px;
  border-radius: 18px;
  border: 1.3px solid rgba(74, 58, 47, 0.4);
  background: rgba(255, 255, 255, 0.55);
  box-sizing: border-box;
`;

// 수정(연필)과 삭제(쓰레기통)를 카드 오른쪽 위에 나란히 둔다.
const CardActions = styled.div`
  position: absolute;
  top: 10px;
  right: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const ActionButton = styled.button`
  width: 30px;
  height: 30px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`;

// 오른쪽 위 버튼 두 개와 겹치지 않도록 이름 줄의 오른쪽을 비워둔다.
const MedRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding-right: 74px;
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

// 목록이 길어져도 늘 보이도록 화면 아래에 고정한다(PageFooter 안).
const AddButton = styled.button`
  width: 100%;
  height: 56px;
  border-radius: 16px;
  border: 1.5px solid rgba(74, 58, 47, 0.55);
  background: #dbe4a1;

  color: #4a3a2f;
  font-family: Jua;
  font-size: 22px;
`;

const PopupMessage = styled.p`
  margin: 0;
  width: 100%;
  text-align: center;
  color: #6b6661;
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 16px;
  line-height: 1.5;
  word-break: keep-all;
`;

function MedicineList() {
  const navigate = useNavigate();
  const { data, loading, error, refetch } = useApi(getMedications);
  const { execute: removeMedication, loading: deleting } = useApiAction(deleteMedication);
  // 지우기 전에 한 번 물어본다. 되돌릴 수 없어서 바로 지우면 위험하다.
  const [deleteTarget, setDeleteTarget] = useState(null);

  const medications = (data ?? []).map(toMedicationView);

  // 삭제 후 목록을 다시 불러와서 서버 상태와 어긋나지 않게 한다.
  const handleDelete = async () => {
    const { ok, error: deleteError } = await removeMedication(deleteTarget.id);
    setDeleteTarget(null);
    if (!ok) {
      alert(deleteError.message);
      return;
    }
    refetch();
  };

  return (
    <PageFrame>
      <PageContent>
        <PageClose onClick={() => navigate('/home')} />
        <PageHeader>
          <PageTitle>내 복용약</PageTitle>
        </PageHeader>
        <PageDivider />

        <PageScrollArea>
          {loading ? (
            <EmptyState>불러오는 중이에요...</EmptyState>
          ) : error ? (
            <EmptyState>{error.message}</EmptyState>
          ) : medications.length === 0 ? (
            <EmptyState>등록된 약이 아직 없어요. 아래에서 추가해보세요.</EmptyState>
          ) : (
            <MedList>
              {medications.map((med) => (
                <MedCard key={med.id}>
                  <CardActions>
                    <ActionButton
                      type="button"
                      aria-label={`${med.name} 수정`}
                      onClick={() => navigate(`/home/medicine/${med.id}`)}
                    >
                      <img src={pencilIcon} alt="" />
                    </ActionButton>
                    <ActionButton
                      type="button"
                      aria-label={`${med.name} 삭제`}
                      disabled={deleting}
                      onClick={() => setDeleteTarget(med)}
                    >
                      <img src={trashIcon} alt="" />
                    </ActionButton>
                  </CardActions>

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
        </PageScrollArea>

        <PageFooter>
          <AddButton type="button" onClick={() => navigate('/onboarding/medication/add')}>
            새 약 추가하기
          </AddButton>
        </PageFooter>
      </PageContent>

      {deleteTarget && (
        <PopupBackdrop onClick={() => setDeleteTarget(null)}>
          <PopupCard
            $center
            $gap={16}
            $padTop={36}
            onClick={(event) => event.stopPropagation()}
          >
            <PopupInnerBorder />
            <PopupTitle $center $size={22}>
              이 약을 지울까요?
            </PopupTitle>
            {/* 이름에 조사를 붙이면 받침에 따라 어색해져서, 이름은 따로 한 줄로 보여준다 */}
            <PopupMessage>
              {deleteTarget.name}
              <br />
              지우면 다시 되돌릴 수 없어요.
            </PopupMessage>
            <PopupButtonRow>
              <PopupSecondaryButton type="button" onClick={() => setDeleteTarget(null)}>
                그대로 둘래요
              </PopupSecondaryButton>
              <PopupPrimaryButton type="button" disabled={deleting} onClick={handleDelete}>
                {deleting ? '지우는 중...' : '지울래요'}
              </PopupPrimaryButton>
            </PopupButtonRow>
          </PopupCard>
        </PopupBackdrop>
      )}
    </PageFrame>
  );
}

export default MedicineList;
