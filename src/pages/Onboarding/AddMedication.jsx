import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import back from '../../assets/onboarding/x.svg';
import { useAppData } from '../../store/AppDataContext';

const AddMedication = () => {
  const navigate = useNavigate();
  const { addMedication } = useAppData();

  const [name, setName] = useState('');
  const [times, setTimes] = useState([]);
  const [repeat, setRepeat] = useState([]);

  const [period, setPeriod] = useState('오전');
  const [hour, setHour] = useState('');
  const [minute, setMinute] = useState('');

  const repeatList = ['매일', '월', '화', '수', '목', '금', '토', '일'];

  const timeOptions = [
    '아침 8:00',
    '점심 12:00',
    '저녁 6:00',
    '취침전 10:00',
  ];

  const toggleTime = (time) => {
    setTimes((prev) =>
      prev.includes(time)
        ? prev.filter((t) => t !== time)
        : [...prev, time]
    );
  };

  const toggleRepeat = (item) => {
    if (item === '매일') {
      setRepeat(repeat.includes('매일') ? [] : ['매일']);
      return;
    }

    let next = repeat.filter((v) => v !== '매일');

    if (next.includes(item)) {
      next = next.filter((v) => v !== item);
    } else {
      next = [...next, item];
    }

    setRepeat(next);
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
    addMedication({
      id: Date.now(),
      name: name.trim(),
      times,
      repeat: repeat.length > 0 ? repeat : ['매일'],
    });
    navigate(-1);
  };

  return (
    <Page>
      <Content>
        <CloseButton onClick={() => navigate(-1)}>
          <CloseIcon src={back} alt="닫기" />
        </CloseButton>

        <Header>
          <Title>약 추가하기</Title>
        </Header>

        <ScrollArea>
          <InputGroup>
            <Label>약 이름</Label>

            <Input
              placeholder="예: 혈압약"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </InputGroup>

          <InputGroup>
            <Label>복용하는 시간을 골라주세요 (복수 선택 가능)</Label>

            <TimeWrap>
              {timeOptions.map((time) => (
                <TimeButton
                  key={time}
                  type="button"
                  $active={times.includes(time)}
                  onClick={() => toggleTime(time)}
                >
                  {time}
                </TimeButton>
              ))}
            </TimeWrap>
          </InputGroup>

          <InputGroup>
            <Label>직접 시간 정하기</Label>

            <ManualRow>
              <PeriodSelect
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
              >
                <option value="오전">오전</option>
                <option value="오후">오후</option>
              </PeriodSelect>

              <SmallInput
                placeholder="시"
                value={hour}
                onChange={(e) => setHour(e.target.value)}
              />

              <SmallInput
                placeholder="분"
                value={minute}
                onChange={(e) => setMinute(e.target.value)}
              />

              <AddTimeButton type="button" onClick={handleAddManualTime}>+</AddTimeButton>
            </ManualRow>
          </InputGroup>

          <InputGroup>
            <Label>얼마나 자주 먹나요?</Label>

            <RepeatWrap>
              {repeatList.map((day) => (
                <RepeatChip
                  key={day}
                  type="button"
                  $active={repeat.includes(day)}
                  onClick={() => toggleRepeat(day)}
                >
                  {day}
                </RepeatChip>
              ))}
            </RepeatWrap>
          </InputGroup>
        </ScrollArea>

        <ButtonArea>
          <SaveButton onClick={handleSave} disabled={!name.trim() || times.length === 0}>
            저장하기
          </SaveButton>
        </ButtonArea>
      </Content>
    </Page>
  );
};

export default AddMedication;

/* ---------------- Layout ---------------- */

const Page = styled.div`
  width: calc(100% + 32px);
  height: 100%;
  margin: 0 -${({ theme }) => theme.spacing.md};
  background: #fff8ed;
`;

const Content = styled.div`
  position: relative;

  max-width: 402px;
  height: 100%;
  margin: 0 auto;

  padding: 86px 20px 120px;
  box-sizing: border-box;

  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 35px;
  left: 24px;
  z-index: 10;

  width: 40px;
  height: 40px;

  border: none;
  background: transparent;
  padding: 0;
  cursor: pointer;

  display: flex;
  justify-content: center;
  align-items: center;
`;

const CloseIcon = styled.img`
  width: 40px;
  height: 40px;
`;

const Title = styled.h1`
  margin: 0;

  color: #4a3a2f;
  font-family: Jua;
  font-size: 40px;
  font-weight: 400;
`;

/* ---------------- Scroll ---------------- */

const ScrollArea = styled.div`
  flex: 1;
  overflow-y: auto;

  margin-top: 22px;

  display: flex;
  flex-direction: column;
  gap: 16px;

  &::-webkit-scrollbar {
    display: none;
  }
`;

/* ---------------- Card ---------------- */

const InputGroup = styled.div`
  padding: 16px;
  border-radius: 18px;
  border: 1.3px solid rgba(74,58,47,.35);
  background: rgba(255,255,255,.55);

  &:last-child {
    padding-bottom: 16px;
  }
`;

const Label = styled.p`
  margin: 0 0 16px;

  color: #4a3a2f;
  font-family: 'Noto Sans KR';
  font-size: 16px;
  font-weight: 700;
`;

const Input = styled.input`
  width: 100%;
  height: 48px;
  padding: 0 18px;
  box-sizing: border-box;

  border-radius: 16px;
  border: 1.3px solid rgba(74, 58, 47, 0.35);
  background: rgba(255, 255, 255, 0.75);

  color: #4a3a2f;
  font-size: 18px;

  &::placeholder {
    color: #b7ac9f;
  }
`;

/* ---------------- Time Chips ---------------- */

const TimeWrap = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const TimeButton = styled.button`
  height: 44px;
  padding: 0 18px;

  border-radius: 22px;
  border: 1.3px
    ${({ $active }) =>
      $active ? 'solid #8A7B3E' : 'dashed rgba(74,58,47,.35)'};

  background: ${({ $active }) =>
    $active ? '#DDD39A' : 'transparent'};

  font-size: 15px;
  font-weight: 700;
`;
const PeriodSelect = styled.select`
  width: 90px;
  height: 44px;
  padding: 0 12px;

  border-radius: 14px;
  border: 1.3px solid rgba(74,58,47,.4);
  background: rgba(255,255,255,.8);

  color: #4A3A2F;
  font-size: 16px;

  appearance: none;
  -webkit-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%234A3A2F' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
`;
/* ---------------- Manual Time ---------------- */

const ManualRow = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const SmallInput = styled.input`
  display: flex;
width: 90px;
height: 44px;
padding: 0 12px;
justify-content: space-between;
align-items: center;

border-radius: 14px;
border: 1.3px solid rgba(74, 58, 47, 0.40);
background: rgba(255, 255, 255, 0.80);

  color: #4a3a2f;
  font-size: 16px;

  &::placeholder {
    color: #b7ac9f;
  }
`;

const AddTimeButton = styled.button`
  width: 48px;
  height: 48px;

  border-radius: 50%;
  border: 1.3px solid rgba(138, 123, 62, 0.9);
  background: #DDD39A;

  color: #4A3A2F;
  font-size: 28px;
  font-weight: 700;

  cursor: pointer;
`;

/* ---------------- Repeat ---------------- */

const RepeatWrap = styled.div`
  display: grid;
  grid-template-columns: 52px repeat(7, 36px);
  justify-content: space-between;
  align-items: center;
`;

const RepeatChip = styled.button`
  width: ${({ children }) => (children === '매일' ? '52px' : '36px')};
  height: 36px;

  display: flex;
  justify-content: center;
  align-items: center;

  border-radius: 18px;
  border: 1.2px
    ${({ $active }) =>
      $active
        ? 'solid rgba(74,58,47,.55)'
        : 'dashed rgba(74,58,47,.55)'};

  background: ${({ $active }) =>
    $active ? '#F8F5EE' : 'transparent'};

  color: #4A3A2F;
  font-family: "Noto Sans KR";
  font-size: 14px;
  font-weight: 700;

  white-space: nowrap;
  padding: 0;
  cursor: pointer;
`;

/* ---------------- Save ---------------- */

const ButtonArea = styled.div`
  position: absolute;
  left: 20px;
  right: 20px;
  bottom: 30px;
`;

const SaveButton = styled.button`
  width: 100%;
  height: 56px;

  border-radius: 16px;
  border: 1.5px solid rgba(74, 58, 47, 0.55);
  background: #CBD879;

  color: #4A3A2F;
  font-family: Jua;
  font-size: 18px;
  cursor: pointer;
`;