import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAppData } from '../../../store/AppDataContext';

const Page = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  background: #fff;

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
  border-bottom: 1px solid #e5e0d9;
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

const Card = styled.div`
  margin-top: 20px;
  padding: 16px;
  border-radius: 14px;
  background: #f7f5f0;
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
  border: 1px solid #e5e0d9;
  background: #fff;
  font-size: 16px;
  color: #000;
`;

const GenderRow = styled.div`
  display: flex;
  gap: 8px;
`;

const GenderButton = styled.button`
  flex: 1;
  height: 50px;
  border-radius: 10px;
  border: ${({ $active }) => ($active ? '2px solid #e8734a' : '1px solid #e5e0d9')};
  background: #fff;
  color: ${({ $active }) => ($active ? '#e8734a' : '#000')};
  font-size: 15px;
  font-weight: 500;
`;

const ChipRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const Chip = styled.button`
  padding: 8px 14px;
  border-radius: 20px;
  border: 1px solid ${({ $active }) => ($active ? 'transparent' : '#e5e0d9')};
  background: ${({ $active }) => ($active ? '#fae5d9' : '#fff')};
  color: ${({ $active }) => ($active ? '#e8734a' : '#000')};
  font-size: 15px;
`;

const SaveButton = styled.button`
  width: 100%;
  height: 54px;
  margin-top: 28px;
  border-radius: 14px;
  background: #e8734a;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
`;

const INTEREST_LIST = ['수면', '활동량', '식사', '복약', '기분'];

function ProfileEdit() {
  const navigate = useNavigate();
  const { data, setProfile, setInterests } = useAppData();

  const [name, setName] = useState(data.profile.name || '');
  const [birth, setBirth] = useState(data.profile.birth || '');
  const [gender, setGender] = useState(data.profile.gender || '');
  const [interests, setLocalInterests] = useState(data.interests || []);

  const toggleInterest = (item) => {
    setLocalInterests((prev) =>
      prev.includes(item) ? prev.filter((v) => v !== item) : [...prev, item],
    );
  };

  const handleSave = () => {
    setProfile({ name: name.trim(), birth, gender });
    setInterests(interests);
    navigate('/home/settings');
  };

  return (
    <Page>
      <Content>
        <Header>
          <BackButton type="button" aria-label="뒤로가기" onClick={() => navigate('/home/settings')}>
            ‹
          </BackButton>
          <Title>프로필 수정</Title>
          <HeaderSpacer />
        </Header>

        <Card>
          <CardTitle>기본 정보</CardTitle>
          <Label>이름</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
          <Label>생년월일</Label>
          <Input type="date" value={birth} onChange={(e) => setBirth(e.target.value)} />
          <Label>성별</Label>
          <GenderRow>
            <GenderButton type="button" $active={gender === 'male'} onClick={() => setGender('male')}>
              남성
            </GenderButton>
            <GenderButton type="button" $active={gender === 'female'} onClick={() => setGender('female')}>
              여성
            </GenderButton>
          </GenderRow>
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

        <SaveButton type="button" onClick={handleSave}>
          저장하기
        </SaveButton>
      </Content>
    </Page>
  );
}

export default ProfileEdit;
