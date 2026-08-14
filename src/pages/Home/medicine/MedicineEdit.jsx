import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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

const Label = styled.p`
  margin: 20px 0 6px;
  font-size: 14px;
  color: #6b6661;
`;

const Input = styled.input`
  width: 100%;
  height: 50px;
  padding: 0 14px;
  border-radius: 10px;
  border: 1px solid #e5e0d9;
  font-size: 16px;
  color: #000;
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

const CustomTimeRow = styled.div`
  display: flex;
  gap: 6px;
`;

const Select = styled.select`
  flex: 1;
  height: 50px;
  padding: 0 10px;
  border-radius: 10px;
  border: 1px solid #e5e0d9;
  font-size: 15px;
  color: #000;
  background: #fff;
`;

const AddTimeButton = styled.button`
  width: 50px;
  height: 50px;
  border-radius: 10px;
  border: 1px solid #e5e0d9;
  font-size: 18px;
  font-weight: 500;
`;

const RepeatSelect = styled.select`
  width: 100%;
  height: 50px;
  padding: 0 14px;
  border-radius: 10px;
  border: 1px solid #e5e0d9;
  font-size: 16px;
  color: #000;
  background: #fff;
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

const DeleteButton = styled.button`
  width: 100%;
  height: 50px;
  margin-top: 12px;
  border-radius: 12px;
  border: 1px solid #e5e0d9;
  color: #cc4d4d;
  font-size: 15px;
  font-weight: 500;
`;

const PRESET_TIMES = ['아침 8:00', '점심 12:00', '저녁 6:00', '취침전 10:00'];
const REPEAT_OPTIONS = ['매일', '이틀에 한 번', '주 3회', '필요할 때만'];

function MedicineEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data, updateMedication, removeMedication } = useAppData();
  const medication = data.medications.find((med) => String(med.id) === id);

  const [name, setName] = useState(medication?.name ?? '');
  const [times, setTimes] = useState(medication?.times ?? []);
  const [repeat, setRepeat] = useState(
    medication?.repeat?.includes('매일') ? '매일' : medication?.repeat?.[0] ?? '매일',
  );
  const [period, setPeriod] = useState('오전');
  const [hour, setHour] = useState('');
  const [minute, setMinute] = useState('');

  if (!medication) {
    return (
      <Page>
        <Content>
          <Header>
            <BackButton type="button" onClick={() => navigate('/home/medicine')}>
              ‹
            </BackButton>
            <Title>약 정보 수정</Title>
            <HeaderSpacer />
          </Header>
          <Label>이미 삭제된 약이에요.</Label>
        </Content>
      </Page>
    );
  }

  const toggleTime = (time) => {
    setTimes((prev) => (prev.includes(time) ? prev.filter((t) => t !== time) : [...prev, time]));
  };

  const handleAddManualTime = () => {
    if (!hour.trim() || !minute.trim()) return;
    const label = `${period} ${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;
    if (!times.includes(label)) setTimes((prev) => [...prev, label]);
    setHour('');
    setMinute('');
  };

  const handleSave = () => {
    if (!name.trim() || times.length === 0) return;
    updateMedication(medication.id, { name: name.trim(), times, repeat: [repeat] });
    navigate('/home/medicine');
  };

  const handleDelete = () => {
    removeMedication(medication.id);
    navigate('/home/medicine');
  };

  return (
    <Page>
      <Content>
        <Header>
          <BackButton type="button" aria-label="뒤로가기" onClick={() => navigate('/home/medicine')}>
            ‹
          </BackButton>
          <Title>약 정보 수정</Title>
          <HeaderSpacer />
        </Header>

        <Label>약 이름</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} />

        <Label>복용 시간을 골라주세요 (여러 개 가능)</Label>
        <ChipRow>
          {[...new Set([...PRESET_TIMES, ...times])].map((time) => (
            <Chip key={time} type="button" $active={times.includes(time)} onClick={() => toggleTime(time)}>
              {time}
            </Chip>
          ))}
        </ChipRow>

        <Label>직접 시간 정하기</Label>
        <CustomTimeRow>
          <Select value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option value="오전">오전</option>
            <option value="오후">오후</option>
          </Select>
          <Select value={hour} onChange={(e) => setHour(e.target.value)}>
            <option value="">시</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </Select>
          <Select value={minute} onChange={(e) => setMinute(e.target.value)}>
            <option value="">분</option>
            {['00', '10', '20', '30', '40', '50'].map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </Select>
          <AddTimeButton type="button" onClick={handleAddManualTime}>
            +
          </AddTimeButton>
        </CustomTimeRow>

        <Label>얼마나 자주 먹나요?</Label>
        <RepeatSelect value={repeat} onChange={(e) => setRepeat(e.target.value)}>
          {REPEAT_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </RepeatSelect>

        <SaveButton type="button" onClick={handleSave} disabled={!name.trim() || times.length === 0}>
          저장하기
        </SaveButton>
        <DeleteButton type="button" onClick={handleDelete}>
          이 약 삭제하기
        </DeleteButton>
      </Content>
    </Page>
  );
}

export default MedicineEdit;
