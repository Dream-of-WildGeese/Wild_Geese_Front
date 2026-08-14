import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useLocation } from 'react-router-dom';
import back from '../../assets/onboarding/back.svg';
import { useAppData } from '../../store/AppDataContext';

const HealthSet = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { data, setProfile, setInterests: saveInterests } = useAppData();
  const role = location.state?.role || data.profile.role || 'parent';

  const [name, setName] = useState(data.profile.name || '');
  const [birth, setBirth] = useState(data.profile.birth || '');
  const [gender, setGender] = useState(data.profile.gender || '');
  const [agree, setAgree] = useState(true);
  const [interests, setInterests] = useState(data.interests || []);
  const medications = data.medications;

  const interestList = ['수면', '활동량', '식사', '복약', '기분'];

  const toggleInterest = (item) => {
    const next = interests.includes(item) ? interests.filter((v) => v !== item) : [...interests, item];
    setInterests(next);
    saveInterests(next);
  };

  const handleNameChange = (e) => {
    setName(e.target.value);
    setProfile({ name: e.target.value });
  };

  const handleBirthChange = (e) => {
    setBirth(e.target.value);
    setProfile({ birth: e.target.value });
  };

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

            <InputGroup>
                <Label>이름</Label>
                <Input
                value={name}
                onChange={handleNameChange}
                />
            </InputGroup>

            <InputGroup>
                <Label>생년월일</Label>
                <Input
                type="date"
                value={birth}
                onChange={handleBirthChange}
                />
            </InputGroup>

            <InputGroup>
                <Label>성별</Label>

                <GenderWrap>
                <GenderButton
                    $active={gender === 'male'}
                    onClick={() => handleGenderChange('male')}
                >
                    남성
                </GenderButton>

                <GenderButton
                    $active={gender === 'female'}
                    onClick={() => handleGenderChange('female')}
                >
                    여성
                </GenderButton>
                </GenderWrap>
            </InputGroup>
            </Card>

            <AgreeBox>
            <input
                type="checkbox"
                checked={!agree}
                onChange={() => setAgree(!agree)}
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

        

        <NextButton
          onClick={() => navigate('/onboarding/complete/2')}
        >
          다음
        </NextButton>
      </Content>
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