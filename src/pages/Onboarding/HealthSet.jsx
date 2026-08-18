import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useLocation } from 'react-router-dom';
import back from '../../assets/onboarding/back.svg';
import { useAppData } from '../../store/AppDataContext';
import { getMe, updateHealthProfile } from '../../api/user';
import { getMedications } from '../../api/medication';
import { useApi, useApiAction } from '../../hooks/useApi';
import BirthDatePickerModal from '../../components/BirthDatePickerModal';
import heart from '../../assets/onboarding/heart.svg';
import MissingFieldsPopup from '../../components/MissingFieldsPopup';

// "1856-03-02" -> "1856년 3월 2일"
const formatBirthLabel = (value) => {
  const [year, month, day] = String(value).split('-').map(Number);
  return `${year}년 ${month}월 ${day}일`;
};

// 화면이 쓰는 성별 값을 서버 enum(MALE/FEMALE)으로 바꾼다.
const GENDER_VALUES = { male: 'MALE', female: 'FEMALE' };

// 건강 관심사도 서버가 enum만 받는다. 한글 라벨을 그대로 보내면 400이 난다.
const INTEREST_VALUES = {
  수면: 'SLEEP',
  활동량: 'ACTIVITY',
  식사: 'MEAL',
  복약: 'MEDICINE',
  기분: 'MOOD',
};

// 만 나이 기준 가입 가능 연령. 개인정보보호법상 만 14세 미만은 법정대리인 동의가
// 필요해서, 그 절차가 없는 지금은 14세를 하한으로 둔다.
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
  // 개인정보 수집 동의. 체크해야만 다음으로 넘어갈 수 있다.
  const [agreed, setAgreed] = useState(false);
  const [isBirthPickerOpen, setIsBirthPickerOpen] = useState(false);
  const [isMissingPopupOpen, setIsMissingPopupOpen] = useState(false);
  const [interests, setInterests] = useState(data.interests || []);

  // 로그인 대신 쓰는 임시 유저 선택 화면(UserType)에는 실제 이름이 없어서,
  // 여기서 서버가 아는 내 이름을 받아와 채워준다.
  const { data: me } = useApi(getMe);

  useEffect(() => {
    if (me?.name) {
      setName(me.name);
      setProfile({ name: me.name });
    }
  }, [me]);

  const { data: medicationList } = useApi(getMedications);
  const medications = (medicationList ?? []).map((med) => ({
    id: med.medicationId,
    name: med.name,
  }));

  const { execute: saveHealthProfile, loading: saving } = useApiAction(updateHealthProfile);

  const handleNext = async () => {
    // 필수 항목이 비어 있으면 저장하지 않고 무엇이 비었는지 알려준다.
    if (!canProceed) {
      setIsMissingPopupOpen(true);
      return;
    }

    const { ok, error } = await saveHealthProfile({
      name: name.trim(),
      birthDate: birth,
      gender: GENDER_VALUES[gender] ?? gender,
      diseases: [
        ...selectedDiseases.filter((d) => d !== '기타'),
        ...otherDiseases,
      ],

    wellnessInterests: interests
      .map((item) => INTEREST_VALUES[item])
      .filter(Boolean),
        });
    if (!ok) {
      alert(error.message);
      return;
    }
    navigate('/onboarding/complete/2');
  };

  const interestList = ['체력관리', '스트레스 관리', '수면 개선', '식습관 개선'];

  const toggleInterest = (item) => {
    const next = interests.includes(item) ? interests.filter((v) => v !== item) : [...interests, item];
    setInterests(next);
    saveInterests(next);
  };

  const toggleDisease = (disease) => {
    // 1. '없음'을 클릭한 경우
    if (disease === '없음') {
      const isNoneSelected = selectedDiseases.includes('없음');
      if (isNoneSelected) {
        // 이미 '없음'이 켜져 있는 상태에서 다시 누르면 해제
        setConditions([]);
      } else {
        // '없음'을 켜면 기존 모든 질환 및 '기타' 입력값 전체 초기화
        setConditions(['없음']);
        setOtherDiseases([]);
        setOtherDiseaseInput('');
      }
      return;
    }

    // 2. '없음'이 아닌 다른 질환을 클릭한 경우 ('없음'은 자동으로 제외)
    let nextDiseases = selectedDiseases.filter((d) => d !== '없음');

    if (disease === '기타' && nextDiseases.includes('기타')) {
      // '기타'를 해제할 때는 직접 입력한 기타 질환 목록 초기화
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

      setConditions([
        ...selectedDiseases.filter((d) => d !== '기타'),
        '기타',
        ...updated,
      ]);
    };
    const removeOtherDisease = (target) => {
      const updated = otherDiseases.filter((d) => d !== target);

      setOtherDiseases(updated);

      setConditions([
        ...selectedDiseases.filter((d) => d !== '기타' && d !== target),
        ...(updated.length ? ['기타', ...updated] : []),
      ]);
    };
  const diseaseList = [
    '고혈압',
    '당뇨',
    '고지혈증',
    '심장질환',
    '관절·허리 통증',
    '골다공증',
    '기타',
    '없음',
  ];
  

  const selectedDiseases = data.conditions || [];
  const [otherDiseaseInput, setOtherDiseaseInput] = useState('');
const [otherDiseases, setOtherDiseases] = useState(
  data.conditions?.filter((d) => !diseaseList.includes(d)) || []
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

  // 이름·생년월일·성별을 모두 채우고 개인정보 수집에 동의해야 다음으로 넘어간다.
  // 무엇이 비었는지 짚어주지 않으면 버튼이 왜 안 눌리는지 알기 어렵다.
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
        <BackButton onClick={() => navigate('/onboarding/complete/1', { state: { role } })}>
          <BackIcon src={back} alt="뒤로가기" />
        </BackButton>

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
            <Card>
            <CardHeader>
                <CardTitle>기본 정보</CardTitle>
                <RoleBadge>{role === 'parent' ? '부모' : '자녀'}</RoleBadge>
            </CardHeader>
           

            <InputGroup>
                <Label>이름</Label>
                <Input
                value={name}
                onChange={handleNameChange}
                />
            </InputGroup>

            <InputGroup>
                <Label>생년월일 </Label>
                <DateSelectButton type="button" onClick={() => setIsBirthPickerOpen(true)}>
                  {birth ? formatBirthLabel(birth) : '생년월일을 선택해주세요'}
                </DateSelectButton>
            </InputGroup>

            <InputGroup>
                <Label>성별 </Label>

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

            <Card>
              <CardTitle>현재 꾸준히 관리하고 있는 건강 문제가 있나요?</CardTitle>

              <CardDesc>해당하는 항목을 모두 골라주세요.</CardDesc>
              <ChipWrap>
                {diseaseList.map((item) => (
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
            <Card>
            <CardTitle>건강 관심사를 골라주세요!</CardTitle>

            <CardDesc>
                여러 개 골라도 좋아요. 선택하신 관심사에 맞춰 맞춤 질문을
                드릴게요.
            </CardDesc>

            <ChipWrap>
                {interestList.map((item) => (
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

            <Card>
            <CardHeader>
                <CardTitle>복용약</CardTitle>
                <Manage onClick={() => navigate('/onboarding/medication/manage')}> ›</Manage>
            </CardHeader>

            <CardDesc>
                잊지 않게 알림을 보내드릴게요.
            </CardDesc>

            <ChipWrap>
                {medications.map((item) => (
                <MedChip key={item.id}>{item.name}</MedChip>
                ))}

                <AddChip onClick={() => navigate('/onboarding/medication/add')}>+ 추가</AddChip>
            </ChipWrap>
            </Card>
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
        {/* 버튼을 막아두면 눌러도 반응이 없어 이유를 알 수 없다.
            누를 수는 있게 두고, 덜 채웠으면 무엇이 비었는지 팝업으로 알려준다. */}
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

const BackButton = styled.button`
  position: absolute;
  top: 35px;
  left: 24px;
  z-index: 10;

  width: 40px;
  height: 40px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;

  display: flex;
  align-items: center;
  justify-content: center;
`;

const BackIcon = styled.img`
  width: 40px;
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
  margin: 0 0 0;
  color: #A79C8E;
  font-family: 'Noto Sans KR';
  font-size: 16px;
  font-weight: 400;
`;

const Card = styled.div`
  padding: 18px;
  margin-bottom: 18px;
  border-radius: 20px;
  border: 1.5px solid rgba(74,58,47,.28);
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
    $active ? ' #F6EBC7;' : 'rgba(255, 255, 255, 0.60)'};

  color: #4A3A2F;
text-align: center;
font-family: "Noto Sans KR";
font-size: 16px;
font-style: normal;
font-weight: 700;
line-height: normal;

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
    $active
      ? '1.5px solid #B89A54'
      : '1.5px dashed #D8D0C7'};

  border-radius: 999px;

  background: ${({ $active }) =>
    $active ? ' #F6EBC7;' : 'rgba(255, 255, 255, 0.60)'};

  color: #4A3A2F;

  font-size: 14px;
  font-weight: 600;

  cursor: pointer;
`;

const MedChip = styled.div`
  padding: 8px 14px;
  border-radius: 999px;
  border: 1px solid rgba(74,58,47,.2);
  background: #F6EBC7;
  color: #4A3A2F;
  font-size: 14px;
  font-weight: 600;
`;

const AddChip = styled.button`
  padding: 8px 14px;
  border: 1.5px solid #D8D0C7;
  border-radius: 999px;
  background: rgba(255,255,255,0.6);

  color: #8C8780;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
`;

const Manage = styled.button`
  padding: 0;
  border: none;
  background: none;

  color: #8C6E4B;
 

  cursor: pointer;
`;

const NextButton = styled.button`
  width:100%;
  height: 56px;

  border-radius: 16px;
  border: 1.5px solid rgba(74,58,47,.55);
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