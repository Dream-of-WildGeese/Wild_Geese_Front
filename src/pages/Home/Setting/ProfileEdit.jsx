import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAppData } from '../../../store/AppDataContext';
import { getMe, getHealthProfile, updateHealthProfile } from '../../../api/user';
import { useApi, useApiAction } from '../../../hooks/useApi';

const Page = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  background: #FFF8ED;

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
  border-bottom: 1.3px solid rgba(74,58,47,.25);
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

const GenderButton = styled.button`
  flex: 1;
  height: 50px;
  border-radius: 10px;
  border: ${({ $active }) => ($active ? '2px solid #e8734a' : '1px solid #e5e0d9')};
  background: #FFF8ED;
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
  background: #DBE4A1;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
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
  const { setProfile, setInterests } = useAppData();

  // 이름은 users/me, 나머지는 건강 프로필에서 가져온다.
  const { data: me, loading: meLoading } = useApi(getMe);
  const { data: profile, loading: profileLoading } = useApi(getHealthProfile);
  const { execute: saveProfile, loading: saving } = useApiAction(updateHealthProfile);

  const [name, setName] = useState('');
  const [birth, setBirth] = useState('');
  const [gender, setGender] = useState('');
  const [interests, setLocalInterests] = useState([]);
  const [diseases, setDiseases] = useState([]);

  // 서버 값이 도착하면 입력 상태를 한 번 채운다.
  const loadedRef = useRef(false);
  useEffect(() => {
    if (loadedRef.current || meLoading || profileLoading) return;
    loadedRef.current = true;

    setName(me?.name ?? '');
    setBirth(profile?.birthDate ?? '');
    setGender(profile?.gender ?? '');
    // 과거 온보딩 저장 버그로 서버에 같은 병명이 중복 저장돼 있을 수 있어 중복 제거한다.
    setDiseases([...new Set(profile?.diseases ?? [])]);
    setLocalInterests(
      (profile?.wellnessInterests ?? []).map((value) => ENUM_TO_INTEREST[value]).filter(Boolean),
    );
  }, [me, profile, meLoading, profileLoading]);

  const toggleInterest = (item) => {
    setLocalInterests((prev) =>
      prev.includes(item) ? prev.filter((v) => v !== item) : [...prev, item],
    );
  };

  const handleSave = async () => {
    const { ok, error } = await saveProfile({
      name: name.trim(),
      birthDate: birth,
      gender,
      // 질병은 이 화면에서 수정하지 않으므로 서버 값을 그대로 돌려보낸다.
      diseases,
      wellnessInterests: interests.map((item) => INTEREST_TO_ENUM[item]).filter(Boolean),
    });
    if (!ok) {
      alert(error.message);
      return;
    }

    // 설정 화면이 아직 로컬 값을 쓰는 부분이 있어 함께 갱신해둔다.
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

        <SaveButton type="button" onClick={handleSave} disabled={saving}>
          {saving ? '저장 중...' : '저장하기'}
        </SaveButton>
      </Content>
    </Page>
  );
}

export default ProfileEdit;
