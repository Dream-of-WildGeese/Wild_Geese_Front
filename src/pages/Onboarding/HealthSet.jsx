import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { useAppData } from '../../store/AppDataContext';
import { getMe, updateHealthProfile, getHealthProfile } from '../../api/user';
import { getMedications } from '../../api/medication';
import { useApi, useApiAction } from '../../hooks/useApi';
import BirthDatePickerModal from '../../components/BirthDatePickerModal';
import heart from '../../assets/onboarding/heart.png';
import MissingFieldsPopup from '../../components/MissingFieldsPopup';
import { DISEASE_LIST } from '../../utils/health';

// "1856-03-02" -> "1856년 3월 2일"
const formatBirthLabel = (value) => {
  const [year, month, day] = String(value).split('-').map(Number);
  return `${year}년 ${month}월 ${day}일`;
};

const GENDER_VALUES = { male: 'MALE', female: 'FEMALE' };
const GENDER_LABELS = { MALE: 'male', FEMALE: 'female' };



// 서버가 실제로 받는 enum은 SLEEP/ACTIVITY/MEAL/MEDICINE/MOOD뿐이고 NONE은 없다.
// '없음'은 여기 안 넣어서, 고르면 wellnessInterests가 자연스럽게 빈 배열로 나가게 한다.
const INTEREST_VALUES = {
  '체력 관리': 'ACTIVITY',
  '스트레스 관리': 'MOOD',
  '수면 개선': 'SLEEP',
  '식습관 개선': 'MEAL',
};

const INTEREST_LABELS = Object.fromEntries(
  Object.entries(INTEREST_VALUES).map(([label, value]) => [value, label]),
);

const INTEREST_LIST = [
  '체력 관리',
  '스트레스 관리',
  '수면 개선',
  '식습관 개선',
  '없음',
];

const MIN_AGE = 14;
const MAX_AGE = 120;

const HealthSet = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    data,
    setProfile,
    setInterests: saveInterests,
    setConditions,
  } = useAppData();
  const role = location.state?.role || data.profile.role || 'parent';

  const [name, setName] = useState(data.profile.name || '');
  const [birth, setBirth] = useState(data.profile.birth || '');
  const [gender, setGender] = useState(data.profile.gender || '');
  const [agreed, setAgreed] = useState(false);
  const [isBirthPickerOpen, setIsBirthPickerOpen] = useState(false);
  const [isMissingPopupOpen, setIsMissingPopupOpen] = useState(false);
  const [interests, setInterests] = useState(data.interests || []);

  const { data: me } = useApi(getMe);

  useEffect(() => {
    if (me?.name) {
      setName(me.name);
      setProfile({ name: me.name });
    }
  }, [me]);

  // 서버에 저장된 값은 "로컬에 아직 아무 값도 없을 때"만 채운다.
  // prefilledRef는 리마운트되면 다시 false로 초기화되는데, 복용약 관리 화면에
  // 갔다가 돌아오면 HealthSet이 통째로 리마운트된다. 그때 이 조건 없이 무조건
  // 채우면, 방금 고른 값(아직 저장 전이라 서버엔 없는 값)을 서버의 예전 값으로
  // 덮어써버린다. 그리고 그렇게 몰래 채워진 성별 때문에, 사용자가 직접 고르지
  // 않아도 필수 입력 검사를 통과해버리는 문제도 같이 생겼다.
  const { data: healthProfile } = useApi(getHealthProfile);
  const prefilledRef = useRef(false);
  useEffect(() => {
    if (prefilledRef.current || !healthProfile) return;
    prefilledRef.current = true;

    if (healthProfile.birthDate && !data.profile.birth) {
      setBirth(healthProfile.birthDate);
      setProfile({ birth: healthProfile.birthDate });
    }
    if (GENDER_LABELS[healthProfile.gender] && !data.profile.gender) {
      setGender(GENDER_LABELS[healthProfile.gender]);
      setProfile({ gender: GENDER_LABELS[healthProfile.gender] });
    }
    if (healthProfile.diseases?.length && !data.conditions?.length) {
      const uniqueDiseases = [...new Set(healthProfile.diseases)];
      setConditions(uniqueDiseases);
      setOtherDiseases(uniqueDiseases.filter((d) => !DISEASE_LIST.includes(d)));
    }
    if (healthProfile.wellnessInterests?.length && !data.interests?.length) {
      const labels = healthProfile.wellnessInterests
        .map((value) => INTEREST_LABELS[value])
        .filter(Boolean);
      setInterests(labels);
      saveInterests(labels);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [healthProfile]);

  const { data: medicationList } = useApi(getMedications);
  const medications = (medicationList ?? []).map((med) => ({
    id: med.medicationId,
    name: med.name,
  }));

  const { execute: saveHealthProfile, loading: saving } = useApiAction(updateHealthProfile);

  const handleNext = async () => {
    if (!canProceed) {
      setIsMissingPopupOpen(true);
      return;
    }

    const pendingOtherDisease = otherDiseaseInput.trim();
    const finalOtherDiseases =
      pendingOtherDisease && !otherDiseases.includes(pendingOtherDisease)
        ? [...otherDiseases, pendingOtherDisease]
        : otherDiseases;

    const { ok, error } = await saveHealthProfile({
      name: name.trim(),
      birthDate: birth,
      gender: GENDER_VALUES[gender] ?? gender,
      diseases: [...new Set([...standardDiseases, ...finalOtherDiseases])],
      wellnessInterests: interests.map((item) => INTEREST_VALUES[item]).filter(Boolean),
    });

    if (!ok) {
      alert(error.message);
      return;
    }
    navigate('/onboarding/complete/2');
  };

  const toggleInterest = (item) => {
    let next;
    if (item === '없음') {
      next = interests.includes('없음') ? [] : ['없음'];
    } else {
      const filtered = interests.filter((v) => v !== '없음');
      next = filtered.includes(item)
        ? filtered.filter((v) => v !== item)
        : [...filtered, item];
    }
    setInterests(next);
    saveInterests(next);
  };

  const toggleDisease = (disease) => {
    if (disease === '없음') {
      const isNoneSelected = selectedDiseases.includes('없음');
      if (isNoneSelected) {
        setConditions([]);
      } else {
        setConditions(['없음']);
        setOtherDiseases([]);
        setOtherDiseaseInput('');
      }
      return;
    }

    let nextDiseases = selectedDiseases.filter((d) => d !== '없음');

    if (disease === '기타' && nextDiseases.includes('기타')) {
      setOtherDiseases([]);
      setOtherDiseaseInput('');
    }

    if (nextDiseases.includes(disease)) {
      nextDiseases = nextDiseases.filter((d) => d !== disease);
    } else {
      nextDiseases = [...nextDiseases, disease];
    }

    setConditions(nextDiseases);
  };

  const addOtherDisease = () => {
    const value = otherDiseaseInput.trim();
    if (!value || otherDiseases.includes(value)) return;

    const updated = [...otherDiseases, value];
    setOtherDiseases(updated);
    setOtherDiseaseInput('');
    setConditions([...standardDiseases, '기타', ...updated]);
  };

  const removeOtherDisease = (target) => {
    const updated = otherDiseases.filter((d) => d !== target);
    setOtherDiseases(updated);
    setConditions([
      ...standardDiseases,
      ...(updated.length ? ['기타', ...updated] : []),
    ]);
  };

  const selectedDiseases = data.conditions || [];
  const standardDiseases = selectedDiseases.filter(
    (d) => DISEASE_LIST.includes(d) && d !== '기타',
  );
  const [otherDiseaseInput, setOtherDiseaseInput] = useState('');
  const [otherDiseases, setOtherDiseases] = useState(
    data.conditions?.filter((d) => !DISEASE_LIST.includes(d)) || [],
  );

  const handleNameChange = (e) => {
    setName(e.target.value);
    setProfile({ name: e.target.value });
  };

  const handleBirthConfirm = (nextBirth) => {
    setBirth(nextBirth);
    setProfile({ birth: nextBirth });
    setIsBirthPickerOpen(false);
  };

  const requirements = [
    { label: '이름', done: Boolean(name.trim()) },
    { label: '생년월일', done: Boolean(birth) },
    { label: '성별', done: Boolean(gender) },
    { label: '개인정보 수집 동의', done: agreed },
  ];
  const canProceed = requirements.every((item) => item.done);

  const handleGenderChange = (value) => {
    setGender(value);
    setProfile({ gender: value });
  };

  return (
    <Page>
      <Content>
        <Header>
          <Title>건강 프로필</Title>
        </Header>

        <ProgressWrapper>
          <Progress $active />
          <Progress $active />
          <Progress />
        </ProgressWrapper>

        <SubText>전체 3단계 중 2단계예요</SubText>
        <StageBlock>
          <StageIcon src={heart} alt="" />
          <StageTextWrap>
            <StageTitle>2단계. 건강 프로필 설정</StageTitle>
            <StageDesc>가족과 나누고 싶은 건강 정보를 알려주세요</StageDesc>
          </StageTextWrap>
        </StageBlock>

        <ScrollArea>
          {/* 기본 정보 */}
          <Card>
            <CardHeader>
              <CardTitle>기본 정보</CardTitle>
              <RoleBadge>{role === 'parent' ? '부모' : '자녀'}</RoleBadge>
            </CardHeader>

            <InputGroup>
              <Label>이름</Label>
              <Input value={name} onChange={handleNameChange} />
            </InputGroup>

            <InputGroup>
              <Label>생년월일</Label>
              <DateSelectButton type="button" onClick={() => setIsBirthPickerOpen(true)}>
                {birth ? formatBirthLabel(birth) : '생년월일을 선택해주세요'}
              </DateSelectButton>
            </InputGroup>

            <InputGroup>
              <Label>성별</Label>
              <GenderWrap>
                <GenderButton
                  $active={gender === 'MALE'}
                  onClick={() => handleGenderChange('MALE')}
                >
                  남성
                </GenderButton>
                <GenderButton
                  $active={gender === 'FEMALE'}
                  onClick={() => handleGenderChange('FEMALE')}
                >
                  여성
                </GenderButton>
              </GenderWrap>
            </InputGroup>
          </Card>

          {/* 걱정되는 건강 문제 */}
          <Card>
            <CardTitle>현재 걱정되는 건강 문제가 있나요?</CardTitle>
            <CardDesc>해당하는 항목을 모두 골라주세요.</CardDesc>
            <ChipWrap>
              {DISEASE_LIST.map((item) => (
                <Chip
                  key={item}
                  $active={selectedDiseases.includes(item)}
                  onClick={() => toggleDisease(item)}
                >
                  {item}
                </Chip>
              ))}
            </ChipWrap>

            {selectedDiseases.includes('기타') && (
              <>
                <AddDiseaseRow>
                  <DiseaseInput
                    value={otherDiseaseInput}
                    onChange={(e) => setOtherDiseaseInput(e.target.value)}
                    placeholder="예: 갑상선 질환"
                  />
                  <AddChip type="button" onClick={addOtherDisease}>
                    +
                  </AddChip>
                </AddDiseaseRow>

                {otherDiseases.length > 0 && (
                  <ChipWrap>
                    {otherDiseases.map((disease) => (
                      <Chip key={disease} as="span" $active>
                        {disease}
                        <RemoveIcon
                          type="button"
                          onClick={() => removeOtherDisease(disease)}
                        >
                          ×
                        </RemoveIcon>
                      </Chip>
                    ))}
                  </ChipWrap>
                )}
              </>
            )}
          </Card>

          {/* 건강 관심사 */}
          <Card>
            <CardTitle>건강 관심사를 골라주세요!</CardTitle>
            <CardDesc>해당하는 관심사를 모두 골라주세요</CardDesc>

            <ChipWrap>
              {INTEREST_LIST.map((item) => (
                <Chip
                  key={item}
                  $active={interests.includes(item)}
                  onClick={() => toggleInterest(item)}
                >
                  {item}
                </Chip>
              ))}
            </ChipWrap>
          </Card>

          {/* 복용약 */}
          <Card>
            <CardHeader>
              <CardTitle>복용약</CardTitle>
              <Manage onClick={() => navigate('/onboarding/medication/manage')}>›</Manage>
            </CardHeader>
            <CardDesc>잊지 않게 알림을 보내드릴게요.</CardDesc>

            <ChipWrap>
              {medications.map((item) => (
                <MedChip key={item.id}>{item.name}</MedChip>
              ))}
              <AddChip onClick={() => navigate('/onboarding/medication/add')}>+ 추가</AddChip>
            </ChipWrap>
          </Card>

          {/* 개인정보 수집 동의 */}
          <AgreeBox>
            <input
              type="checkbox"
              checked={agreed}
              onChange={() => setAgreed(!agreed)}
            />
            <span>
              이름, 생년월일, 성별, 건강 상태, 복용 약물 등 개인정보 및
              건강에 관한 민감정보를 수집하며, 수집된 정보는 가족 간 건강
              상태 공유 및 서비스 제공 목적으로만 이용됩니다. 동의하신 가족
              구성원에게만 제공되며, 목적 외 용도로는 사용되지 않습니다.
            </span>
          </AgreeBox>
        </ScrollArea>

        {!canProceed && (
          <RequirementHint>
            {requirements.filter((item) => !item.done).length}개 항목이 아직 비어 있어요
          </RequirementHint>
        )}

        <NextButton onClick={handleNext} disabled={saving}>
          {saving ? '저장 중...' : '다음'}
        </NextButton>
      </Content>

      {isMissingPopupOpen && (
        <MissingFieldsPopup
          items={requirements}
          onClose={() => setIsMissingPopupOpen(false)}
        />
      )}

      {isBirthPickerOpen && (
        <BirthDatePickerModal
          value={birth}
          minAge={MIN_AGE}
          maxAge={MAX_AGE}
          onConfirm={handleBirthConfirm}
          onClose={() => setIsBirthPickerOpen(false)}
        />
      )}
    </Page>
  );
};

export default HealthSet;

/* =========================
   Styled Components
========================= */

const Page = styled.div`
  width: calc(100% + 32px);
  height: 100%;
  margin: 0 -${({ theme }) => theme.spacing.md};
  background: #FFF8ED;
`;

const Content = styled.div`
  position: relative;
  max-width: 402px;
  height: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  padding: 44px 24px 30px;
`;

const ScrollArea = styled.div`
  flex: 1;
  overflow-y: auto;
  margin-top: 8px;
  padding-bottom: 20px;

  &::-webkit-scrollbar {
    display: none;
  }
  scrollbar-width: none;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40px;
`;

const Title = styled.h1`
  margin: 0;
  color: #4A3A2F;
  font-family: Jua;
  font-size: 36px;
  font-weight: 400;
`;

const ProgressWrapper = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 14px;
`;

const Progress = styled.div`
  flex: 1;
  height: 6px;
  border-radius: 999px;
  background: ${({ $active }) => ($active ? '#CBD879' : '#E7E1D6')};
`;

const SubText = styled.p`
  margin: 8px 0 18px;
  text-align: center;
  color: #A79C8E;
  font-size: 13px;
  font-weight: 500;
`;

const StageBlock = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-top: 2px;
`;

const StageIcon = styled.img`
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  margin-top: 2px;
`;

const StageTextWrap = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const StageTitle = styled.h2`
  margin: 0;
  color: #4A3A2F;
  font-family: Jua;
  font-size: 28px;
  font-weight: 400;
`;

const StageDesc = styled.p`
  margin: 0;
  color: #A79C8E;
  font-family: 'Noto Sans KR';
  font-size: 16px;
  font-weight: 400;
`;

const Card = styled.div`
  padding: 18px;
  margin-bottom: 18px;
  border-radius: 20px;
  border: 1.5px solid rgba(74, 58, 47, 0.28);
  background: #FFFDF8;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const CardTitle = styled.h3`
  margin: 0;
  color: #4A3A2F;
  font-size: 17px;
  font-weight: 700;
`;

const RoleBadge = styled.span`
  padding: 5px 12px;
  border-radius: 14px;
  border: 1.2px solid rgba(74, 58, 47, 0.55);
  background: #F6EBC7;
  color: #4A3A2F;
  font-size: 13px;
  font-weight: 700;
`;

const InputGroup = styled.div`
  margin-top: 18px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 10px;
  color: #4A3A2F;
  font-size: 14px;
  font-weight: 600;
`;

const DateSelectButton = styled.button`
  width: 100%;
  height: 48px;
  box-sizing: border-box;
  padding: 0 14px;
  border: 1.5px solid #CFC7BC;
  border-radius: 14px;
  background: #FFFDF8;
  color: ${({ children }) =>
    String(children).includes('선택해주세요') ? '#A79C8E' : '#4A3A2F'};
  font-size: 15px;
  text-align: left;
  cursor: pointer;
`;

const RequirementHint = styled.p`
  margin: 0 0 10px;
  text-align: center;
  font-size: 13px;
  color: #A79C8E;
`;

const Input = styled.input`
  width: 100%;
  height: 48px;
  box-sizing: border-box;
  padding: 0 14px;
  border: 1.5px solid #CFC7BC;
  border-radius: 14px;
  background: #FFFDF8;
  color: #4A3A2F;
  font-size: 15px;
  outline: none;

  &:focus {
    border-color: #B89A54;
  }
`;

const GenderWrap = styled.div`
  display: flex;
  gap: 10px;
`;

const GenderButton = styled.button`
  flex: 1;
  height: 48px;
  border-radius: 14px;
  border: ${({ $active }) =>
    $active
      ? '1.2px solid rgba(74, 58, 47, 0.55)'
      : '1.2px dashed rgba(74, 58, 47, 0.35)'};
  background: ${({ $active }) =>
    $active ? '#F6EBC7' : 'rgba(255, 255, 255, 0.60)'};
  color: #4A3A2F;
  text-align: center;
  font-family: 'Noto Sans KR';
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
`;

const AgreeBox = styled.label`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 16px;

  input {
    margin-top: 2px;
  }

  span {
    color: #777;
    font-size: 11px;
    line-height: 1.5;
  }
`;

const CardDesc = styled.p`
  margin: 6px 0 0;
  color: #8C8780;
  font-size: 14px;
  line-height: 1.5;
`;

const ChipWrap = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 14px;
`;

const Chip = styled.button`
  padding: 8px 14px;
  border: ${({ $active }) =>
    $active ? '1.5px solid #B89A54' : '1.5px dashed #D8D0C7'};
  border-radius: 999px;
  background: ${({ $active }) =>
    $active ? '#F6EBC7' : 'rgba(255, 255, 255, 0.60)'};
  color: #4A3A2F;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
`;

const MedChip = styled.div`
  padding: 8px 14px;
  border-radius: 999px;
  border: 1px solid rgba(74, 58, 47, 0.2);
  background: #F6EBC7;
  color: #4A3A2F;
  font-size: 14px;
  font-weight: 600;
`;

const AddChip = styled.button`
  padding: 8px 14px;
  border: 1.5px solid #D8D0C7;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.6);
  color: #8C8780;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
`;

const Manage = styled.button`
  padding: 4px 8px; 
  border: none;
  background: none;
  color: #8C6E4B;
  
  
  font-size: 30px; 
  font-weight: 700;
  line-height: 1;

  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

const NextButton = styled.button`
  width: 100%;
  height: 56px;
  border-radius: 16px;
  border: 1.5px solid rgba(74, 58, 47, 0.55);
  background: #CBD879;
  color: #4A3A2F;
  font-family: Jua;
  font-size: 18px;
  font-weight: 400;
  cursor: pointer;
`;

const DiseaseInput = styled(Input)`
  flex: 1;
  margin-top: 0;
`;

const AddDiseaseRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 16px;
`;

const RemoveIcon = styled.button`
  margin-left: 8px;
  padding: 0;
  border: none;
  background: transparent;
  color: #4A3A2F;
  font-size: 18px;
  font-weight: 700;
  line-height: 1;
  cursor: pointer;
`;