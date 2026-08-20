import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAppData } from '../../../store/AppDataContext';
import { getMe, getHealthProfile, updateHealthProfile } from '../../../api/user';
import { useApi, useApiAction } from '../../../hooks/useApi';
import {
  DISEASE_LIST,
  splitDiseases,
  mergeDiseases,
  toggleDisease,
} from '../../../utils/health';
import {
  PageFrame,
  PageContent,
  PageBack,
  PageHeader,
  PageTitle,
  PageDivider,
  PageScrollArea,
  PageFooter,
} from '../../../components/PageShell';

const Card = styled.div`
  margin-top: 20px;
  padding: 16px;
  border-radius: 14px;
  background: #F8F5EE;
`;

const CardTitle = styled.p`
  margin: 0 0 10px;
  font-size: 17px;
  font-weight: 500;
  color: #000;
`;

const CardDesc = styled.p`
  margin: 0 0 10px;
  font-size: 14px;
  color: #6b6661;
`;

const Label = styled.p`
  margin: 14px 0 6px;
  font-size: 14px;
  color: #6b6661;

  &:first-of-type {
    margin-top: 0;
  }
`;

const Input = styled.input`
  width: 100%;
  height: 50px;
  padding: 0 14px;
  border-radius: 10px;
  border: 1.3px solid rgba(74,58,47,.4);
  background: #FFF8ED;
  font-size: 16px;
  color: #000;
`;

const GenderRow = styled.div`
  display: flex;
  gap: 8px;
`;

// 온보딩 2단계(건강 프로필)의 성별 버튼과 같은 생김새로 맞춘다. 예전엔 이 화면만
// 주황 톤이라, 같은 화면 안의 지병 칩(DiseaseChip)과도 색이 따로 놀았다.
const GenderButton = styled.button`
  flex: 1;
  height: 50px;
  border-radius: 14px;
  border: ${({ $active }) =>
    $active ? '1.2px solid rgba(74, 58, 47, 0.55)' : '1.2px dashed rgba(74, 58, 47, 0.35)'};
  background: ${({ $active }) => ($active ? '#F6EBC7' : 'rgba(255, 255, 255, 0.60)')};
  color: #4A3A2F;
  text-align: center;
  font-family: 'Noto Sans KR';
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
`;

const ChipRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

// 건강 관심사 칩도 지병 칩(DiseaseChip)과 같은 금색 톤으로 맞춘다.
const Chip = styled.button`
  padding: 8px 14px;
  border-radius: 999px;
  border: ${({ $active }) => ($active ? '1.5px solid #B89A54' : '1.5px dashed #D8D0C7')};
  background: ${({ $active }) => ($active ? '#F6EBC7' : 'rgba(255, 255, 255, 0.60)')};
  color: #4a3a2f;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
`;

// 지병 칩은 온보딩 2단계(건강 프로필)와 같은 생김새를 쓴다.
// 두 화면에서 같은 항목을 고르는데 모양이 다르면 다른 기능처럼 보인다.
const DiseaseChip = styled.button`
  padding: 8px 14px;
  border-radius: 999px;
  border: ${({ $active }) => ($active ? '1.5px solid #B89A54' : '1.5px dashed #D8D0C7')};
  background: ${({ $active }) => ($active ? '#F6EBC7' : 'rgba(255, 255, 255, 0.6)')};
  color: #4a3a2f;
  font-size: 14px;
  font-weight: 600;
`;

// input은 기본 너비가 있어서 flex 안에서 옆 버튼을 밀어낸다. 남는 만큼만 쓰게 둔다.
const DiseaseInput = styled(Input)`
  flex: 1;
  min-width: 0;
`;

const AddDiseaseRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 12px;
`;

const AddChip = styled.button`
  flex-shrink: 0;
  padding: 8px 14px;
  border-radius: 999px;
  border: 1.5px solid #d8d0c7;
  background: rgba(255, 255, 255, 0.6);
  color: #8c8780;
  font-size: 14px;
  font-weight: 600;
`;

// 직접 적어 넣은 병명 칩. 누르는 곳이 아니라서 span으로 두고 옆의 ×만 누른다.
const OtherChip = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 8px 14px;
  border-radius: 999px;
  border: 1.5px solid #b89a54;
  background: #f6ebc7;
  color: #4a3a2f;
  font-size: 14px;
  font-weight: 600;
`;

const RemoveIcon = styled.button`
  margin-left: 8px;
  padding: 0;
  border: none;
  background: transparent;
  color: #4a3a2f;
  font-size: 18px;
  font-weight: 700;
  line-height: 1;
`;

// 스크롤과 상관없이 화면 아래에 붙는다(PageFooter 안).
// 다른 화면(약 추가하기·약 수정·온보딩 다음 버튼)과 같은 주 버튼 색으로 맞춘다.
const SaveButton = styled.button`
  width: 100%;
  height: 54px;
  border-radius: 14px;
  border: 1.5px solid rgba(74, 58, 47, 0.55);
  background: #cbd879;
  color: #4a3a2f;
  font-family: Jua;
  font-size: 20px;
  cursor: pointer;
  transition: background 0.15s ease, transform 0.1s ease;

  &:hover:not(:disabled) {
    background: #c2d16b;
  }

  &:active:not(:disabled) {
    background: #b6c65c;
    transform: translateY(1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`;

const INTEREST_LIST = ['수면', '활동량', '식사', '복약', '기분'];

// 서버는 관심사를 enum으로만 주고받는다. 화면 라벨과 양방향으로 변환한다.
const INTEREST_TO_ENUM = {
  수면: 'SLEEP',
  활동량: 'ACTIVITY',
  식사: 'MEAL',
  복약: 'MEDICINE',
  기분: 'MOOD',
};
const ENUM_TO_INTEREST = Object.fromEntries(
  Object.entries(INTEREST_TO_ENUM).map(([label, value]) => [value, label]),
);

function ProfileEdit() {
  const navigate = useNavigate();
  const { setProfile, setInterests, setConditions } = useAppData();

  // 이름은 users/me, 나머지는 건강 프로필에서 가져온다.
  const { data: me, loading: meLoading } = useApi(getMe);
  const { data: profile, loading: profileLoading } = useApi(getHealthProfile);
  const { execute: saveProfile, loading: saving } = useApiAction(updateHealthProfile);

  const [name, setName] = useState('');
  const [birth, setBirth] = useState('');
  const [gender, setGender] = useState('');
  const [interests, setLocalInterests] = useState([]);
  // 목록에서 고른 항목('기타' 표시 포함)과, 직접 적어 넣은 병명을 나눠서 들고 있다.
  const [diseases, setDiseases] = useState({ selected: [], others: [] });
  const [otherInput, setOtherInput] = useState('');

  // 서버 값이 도착하면 입력 상태를 한 번 채운다.
  const loadedRef = useRef(false);
  useEffect(() => {
    if (loadedRef.current || meLoading || profileLoading) return;
    loadedRef.current = true;

    setName(me?.name ?? '');
    setBirth(profile?.birthDate ?? '');
    setGender(profile?.gender ?? '');
    setDiseases(splitDiseases(profile?.diseases));
    setLocalInterests(
      (profile?.wellnessInterests ?? []).map((value) => ENUM_TO_INTEREST[value]).filter(Boolean),
    );
  }, [me, profile, meLoading, profileLoading]);

  const handleToggleDisease = (item) => {
    setDiseases((prev) => toggleDisease(prev, item));
    // '기타'를 끄면 직접 적던 입력값도 같이 비운다.
    if (item === '기타' || item === '없음') setOtherInput('');
  };

  const addOtherDisease = () => {
    const value = otherInput.trim();
    if (!value) return;
    setDiseases((prev) =>
      prev.others.includes(value) ? prev : { ...prev, others: [...prev.others, value] },
    );
    setOtherInput('');
  };

  const removeOtherDisease = (target) => {
    setDiseases((prev) => ({ ...prev, others: prev.others.filter((item) => item !== target) }));
  };

  const toggleInterest = (item) => {
    setLocalInterests((prev) =>
      prev.includes(item) ? prev.filter((v) => v !== item) : [...prev, item],
    );
  };

  const handleSave = async () => {
    // '기타' 입력칸에 적어두고 '+'를 안 누른 값도 저장한 것으로 본다.
    // (온보딩 건강 프로필과 같은 규칙)
    const pending = otherInput.trim();
    const others =
      pending && !diseases.others.includes(pending)
        ? [...diseases.others, pending]
        : diseases.others;
    const savedDiseases = mergeDiseases(diseases.selected, others);

    const { ok, error } = await saveProfile({
      name: name.trim(),
      birthDate: birth,
      gender,
      diseases: savedDiseases,
      wellnessInterests: interests.map((item) => INTEREST_TO_ENUM[item]).filter(Boolean),
    });
    if (!ok) {
      alert(error.message);
      return;
    }

    // 온보딩 건강 프로필 화면은 서버가 아니라 앱에 들고 있는 값을 먼저 보여준다.
    // 여기서 함께 갱신하지 않으면 방금 고친 지병이 그 화면에서는 옛날 값으로 남는다.
    setProfile({ name: name.trim(), birth, gender });
    setInterests(interests);
    setConditions([...diseases.selected, ...others]);
    navigate('/home/settings');
  };

  return (
    <PageFrame>
      <PageContent>
        <PageBack onClick={() => navigate('/home/settings')} />
        <PageHeader>
          <PageTitle>프로필 수정</PageTitle>
        </PageHeader>
        <PageDivider />

        <PageScrollArea>
          <Card>
            <CardTitle>기본 정보</CardTitle>
            <Label>이름</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
            <Label>생년월일</Label>
            <Input type="date" value={birth} onChange={(e) => setBirth(e.target.value)} />
            <Label>성별</Label>
            <GenderRow>
              <GenderButton type="button" $active={gender === 'MALE'} onClick={() => setGender('MALE')}>
                남성
              </GenderButton>
              <GenderButton
                type="button"
                $active={gender === 'FEMALE'}
                onClick={() => setGender('FEMALE')}
              >
                여성
              </GenderButton>
            </GenderRow>
          </Card>

          <Card>
            <CardTitle>현재 꾸준히 관리하고 있는 건강 문제</CardTitle>
            <CardDesc>해당하는 항목을 모두 골라주세요</CardDesc>
            <ChipRow>
              {DISEASE_LIST.map((item) => (
                <DiseaseChip
                  key={item}
                  type="button"
                  $active={diseases.selected.includes(item)}
                  onClick={() => handleToggleDisease(item)}
                >
                  {item}
                </DiseaseChip>
              ))}
            </ChipRow>

            {diseases.selected.includes('기타') && (
              <>
                <AddDiseaseRow>
                  <DiseaseInput
                    value={otherInput}
                    onChange={(e) => setOtherInput(e.target.value)}
                    placeholder="예: 갑상선 질환"
                  />
                  <AddChip type="button" onClick={addOtherDisease}>
                    +
                  </AddChip>
                </AddDiseaseRow>

                {diseases.others.length > 0 && (
                  <ChipRow style={{ marginTop: 12 }}>
                    {diseases.others.map((item) => (
                      <OtherChip key={item}>
                        {item}
                        <RemoveIcon
                          type="button"
                          aria-label={`${item} 지우기`}
                          onClick={() => removeOtherDisease(item)}
                        >
                          ×
                        </RemoveIcon>
                      </OtherChip>
                    ))}
                  </ChipRow>
                )}
              </>
            )}
          </Card>

          <Card>
            <CardTitle>건강 관심사</CardTitle>
            <CardDesc>여러 개 골라도 좋아요</CardDesc>
            <ChipRow>
              {INTEREST_LIST.map((item) => (
                <Chip key={item} type="button" $active={interests.includes(item)} onClick={() => toggleInterest(item)}>
                  {item}
                </Chip>
              ))}
            </ChipRow>
          </Card>

        </PageScrollArea>

        <PageFooter>
          <SaveButton type="button" onClick={handleSave} disabled={saving}>
            {saving ? '저장 중...' : '저장하기'}
          </SaveButton>
        </PageFooter>
      </PageContent>
    </PageFrame>
  );
}

export default ProfileEdit;
