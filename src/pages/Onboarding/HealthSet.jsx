import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useLocation } from 'react-router-dom';
import back from '../../assets/onboarding/back.svg';
import { useAppData } from '../../store/AppDataContext';
import { updateHealthProfile } from '../../api/user';
import { getMedications } from '../../api/medication';
import { useApi, useApiAction } from '../../hooks/useApi';
import BirthDatePickerModal from '../../components/BirthDatePickerModal';

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
  const [interests, setInterests] = useState(data.interests || []);

  const { data: medicationList } = useApi(getMedications);
  const medications = (medicationList ?? []).map((med) => ({
    id: med.medicationId,
    name: med.name,
  }));

  const { execute: saveHealthProfile, loading: saving } = useApiAction(updateHealthProfile);

  const handleNext = async () => {
    const { ok, error } = await saveHealthProfile({
      name: name.trim(),
      birthDate: birth,
      gender: GENDER_VALUES[gender] ?? gender,
      diseases: customDisease.trim()
      ? [...selectedDiseases.filter((d) => d !== '기타'), customDisease.trim()]
      : selectedDiseases,

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

  const interestList = ['수면', '활동량', '식사', '복약', '기분'];

  const toggleInterest = (item) => {
    const next = interests.includes(item) ? interests.filter((v) => v !== item) : [...interests, item];
    setInterests(next);
    saveInterests(next);
  };

  const toggleDisease = (disease) => {
      setConditions(
        selectedDiseases.includes(disease)
          ? selectedDiseases.filter((d) => d !== disease)
          : [...selectedDiseases, disease]
      );
    };
  const diseaseList = [
    '고혈압',
    '당뇨',
    '고지혈증',
    '심장질환',
    '관절·허리 통증',
    '골다공증',
    '기타',
  ];
  

  const selectedDiseases = data.conditions || [];
  const [customDisease, setCustomDisease] = useState(
  data.conditions?.find(
    (d) => !diseaseList.includes(d)
  ) || ''
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
  const missing = [
    !name.trim() && '이름',
    !birth && '생년월일',
    !gender && '성별',
    !agreed && '개인정보 수집 동의',
  ].filter(Boolean);
  const canProceed = missing.length === 0;
  const missingLabel = missing.join(', ');

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
          <Title>건강 프로필 설정</Title>
        </Header>

        <ProgressWrapper>
          <Progress $active />
          <Progress $active />
          <Progress />
        </ProgressWrapper>

        <SubText>전체 3단계 중 2단계예요</SubText>
        <ScrollArea>
            <Card>
            <CardHeader>
                <CardTitle>기본 정보</CardTitle>
                <RoleBadge>{role === 'parent' ? '부모' : '자녀'}</RoleBadge>
            </CardHeader>
            <CardDesc><Required>*</Required> 표시는 모두 입력해야 다음으로 넘어갈 수 있어요</CardDesc>

            <InputGroup>
                <Label>이름 <Required>*</Required></Label>
                <Input
                value={name}
                onChange={handleNameChange}
                />
            </InputGroup>

            <InputGroup>
                <Label>생년월일 <Required>*</Required></Label>
                <DateSelectButton type="button" onClick={() => setIsBirthPickerOpen(true)}>
                  {birth ? formatBirthLabel(birth) : '생년월일을 선택해주세요'}
                </DateSelectButton>
                <FieldHint>만 {MIN_AGE}세 이상만 가입할 수 있어요</FieldHint>
            </InputGroup>

            <InputGroup>
                <Label>성별 <Required>*</Required></Label>

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
                  <DiseaseInput
                    value={customDisease}
                    onChange={(e) => {
                      const value = e.target.value;
                      setCustomDisease(value);

                      setConditions([
                        ...selectedDiseases.filter(
                          (d) => d !== "기타" && d !== customDisease
                        ),
                        "기타",
                        value,
                      ]);
                    }}
                    placeholder="예: 갑상선 질환"
                  />
                )}
            </Card>
            {/*
            <HighlightCard>
              <HighlightText>
                특별한 건강 문제가 없으시다면, 평소 챙기고 싶은 게 있을까요?
              </HighlightText>

              <ChipWrap>
                <Chip>체력 관리</Chip>
                <Chip>스트레스 관리</Chip>
                <Chip>수면 개선</Chip>
                <Chip>식습관 개선</Chip>
              </ChipWrap>
            </HighlightCard>*/}

            <Card>
            <CardHeader>
                <CardTitle>복용약</CardTitle>
                <Manage onClick={() => navigate('/onboarding/medication/manage')}>관리하기 ›</Manage>
            </CardHeader>

            <CardDesc>
                복용 중인 약이 있으면 적어주세요
            </CardDesc>

            <ChipWrap>
                {medications.map((item) => (
                <MedChip key={item.id}>{item.name}</MedChip>
                ))}

                <AddChip onClick={() => navigate('/onboarding/medication/add')}>+ 추가</AddChip>
            </ChipWrap>
            </Card>

        </ScrollArea>

        

        {!canProceed && (
          <RequirementHint>
            {missingLabel}을(를) 입력해야 다음으로 넘어갈 수 있어요
          </RequirementHint>
        )}
        <NextButton onClick={handleNext} disabled={saving || !canProceed}>
          {saving ? '저장 중...' : '다음'}
        </NextButton>
      </Content>

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
  height: 100%;
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

  color: #000;
  font-size: 20px;
  font-weight: 600;
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

  background: ${({ $active }) =>
    $active ? '#E8734A' : '#D9D4CC'};
`;

const SubText = styled.p`
  margin: 8px 0 20px;

  color: #999;
  font-size: 14px;
`;

const Card = styled.div`
  padding: 16px;
  margin-bottom: 16px;

  border-radius: 14px;

  background: #F7F5F0;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const CardTitle = styled.h3`
  margin: 0;

  color: #111;

  font-size: 16px;
  font-weight: 600;
`;

const RoleBadge = styled.span`
  padding: 4px 10px;

  border-radius: 999px;

  background: #F8E2D3;
  color: #E8734A;

  font-size: 12px;
`;

const InputGroup = styled.div`
  margin-top: 18px;
`;

const Label = styled.label`
  display: block;

  margin-bottom: 10px;

  color: #6B6661;
  font-size: 14px;
`;

// 브라우저 기본 <input type="date"> 대신 앱 톤에 맞춘 달력 모달을 띄우는 버튼.
const DateSelectButton = styled.button`
  width: 100%;
  height: 48px;

  box-sizing: border-box;
  padding: 0 14px;

  border: 1px solid #D9D4CC;
  border-radius: 12px;
  background: #FFF;

  color: ${({ children }) => (String(children).includes('선택해주세요') ? '#A79C8E' : '#111')};
  font-size: 15px;
  text-align: left;
  cursor: pointer;
`;

const Required = styled.span`
  color: #E8734A;
  font-weight: 700;
`;

const FieldHint = styled.p`
  margin: 6px 0 0;
  font-size: 12px;
  color: #A79C8E;
`;

const RequirementHint = styled.p`
  margin: 0 0 8px;
  text-align: center;
  font-size: 13px;
  color: #A79C8E;
`;

const Input = styled.input`
  width: 100%;
  height: 48px;

  box-sizing: border-box;

  padding: 0 14px;

  border: 1px solid #D9D4CC;
  border-radius: 12px;

  background: #FFF;

  color: #111;
  font-size: 15px;

  outline: none;

  &:focus {
    border-color: #E8734A;
  }
`;

const GenderWrap = styled.div`
  display: flex;
  gap: 8px;
`;

const GenderButton = styled.button`
  flex: 1;
  height: 48px;

  border-radius: 12px;
  border: ${({ $active }) =>
    $active ? '2px solid #E8734A' : '1px solid #D9D4CC'};

  background: #FFF;
  color: ${({ $active }) =>
    $active ? '#E8734A' : '#111'};

  font-size: 15px;
  font-weight: 500;

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
    line-height: 1.4;
  }
`;

const CardDesc = styled.p`
  margin: 6px 0 0;

  color: #777;
  font-size: 14px;
  line-height: 1.4;
`;

const ChipWrap = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  margin-top: 14px;
`;

const Chip = styled.button`
  padding: 8px 14px;

  border: 1px solid
    ${({ $active }) =>
      $active ? '#E8734A' : '#D9D4CC'};
  border-radius: 999px;

  background: ${({ $active }) =>
    $active ? '#F8E2D3' : '#FFF'};

  color: ${({ $active }) =>
    $active ? '#E8734A' : '#111'};

  font-size: 14px;

  cursor: pointer;
`;

const MedChip = styled.div`
  padding: 8px 14px;

  border-radius: 999px;

  background: #F8E2D3;
  color: #E8734A;

  font-size: 14px;
`;

const AddChip = styled.button`
  padding: 8px 14px;

  border: 1px dashed #D9D4CC;
  border-radius: 999px;

  background: #FFF;

  font-size: 14px;

  cursor: pointer;
`;

const Manage = styled.button`
  padding: 0;

  border: none;
  background: none;

  color: #E8734A;

  font-size: 13px;

  cursor: pointer;
`;

const NextButton = styled.button`
  width: 100%;
  height: 56px;

  margin-top: 8px;

  border-radius: 16px;
  border: 1.5px solid rgba(74, 58, 47, 0.55);

  background: #CBD879;
  color: #4A3A2F;

  font-family: Jua, sans-serif;
  font-size: 18px;
  font-weight: 400;

  cursor: pointer;
`;

const DiseaseInput = styled(Input)`
  margin-top: 16px;
`;

const HighlightCard = styled.div`
  padding: 16px;
  margin-bottom: 16px;
  border-radius: 14px;
  border: 1px solid #f2c3a8;
  background: #fff3ec;
`;

const HighlightText = styled.p`
  margin: 0 0 12px;
  color: #e8734a;
  font-size: 13px;
  line-height: 1.4;
`;