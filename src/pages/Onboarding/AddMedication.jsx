import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const AddMedication = () => {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [times, setTimes] = useState(['']);
  const [repeat, setRepeat] = useState([]);
  const repeatList = ['월', '화', '수', '목', '금', '토', '일', '매일'];

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
            setRepeat(
            repeat.includes('매일') ? [] : ['매일']
            );
            return;
        }

        let next = repeat.filter(v => v !== '매일');

        if (next.includes(item)) {
            next = next.filter(v => v !== item);
        } else {
            next = [...next, item];
        }

        setRepeat(next);
        };

  return (
    <Page>
      <Content>
        <Header>
          <CloseButton onClick={() => navigate(-1)}>×</CloseButton>
          <Title>약 추가하기</Title>
        </Header>

        <InputGroup>
          <Label>약 이름</Label>
          <Input
            placeholder="예: 혈압약"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </InputGroup>

        <InputGroup>
          <Label>복용하는 시간을 골라주세요 (여러 개 가능)</Label>

          <TimeWrap>
            {timeOptions.map((time) => (
              <TimeButton
                key={time}
                $active={times.includes(time)}
                onClick={() => toggleTime(time)}
              >
                {time}
              </TimeButton>
            ))}
          </TimeWrap>
        </InputGroup>

        <InputGroup>
            <Label>얼마나 자주 먹나요?</Label>

            <RepeatWrap>
                {repeatList.map((day) => (
                <RepeatChip
                    key={day}
                    $active={repeat.includes(day)}
                    onClick={() => toggleRepeat(day)}
                    type="button"
                >
                    {day}
                </RepeatChip>
                ))}
            </RepeatWrap>
        </InputGroup>
        <SaveButton onClick={() => navigate(-1)}>
          저장하기
        </SaveButton>
      </Content>
    </Page>
  );
};

export default AddMedication;

const Page = styled.div`
  width: calc(100% + 32px);
  height: 100%;
  margin: 0 -${({ theme }) => theme.spacing.md};
  background: #fff8ed;
`;

const Content = styled.div`
  max-width: 402px;
  height: 100%;
  margin: 0 auto;
  padding: 50px 20px 20px;
  box-sizing: border-box;

  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  position: relative;
  height: 40px;

  display: flex;
  justify-content: center;
  align-items: center;
`;

const CloseButton = styled.button`
  position: absolute;
  left: 0;

  border: none;
  background: none;

  font-size: 34px;
  color: #4a3a2f;
  cursor: pointer;
`;

const Title = styled.h1`
  margin: 0;
  color: #4a3a2f;
  font-family: Jua;
  font-size: 28px;
  font-weight: 400;
`;

const InputGroup = styled.div`
  margin-top: 36px;
`;

const Label = styled.p`
  margin: 0 0 14px;
  color: #a79c8e;
  font-family: "Noto Sans KR";
  font-size: 18px;
  font-weight: 700;
`;

const Input = styled.input`
  width: 100%;
  height: 58px;
  padding: 0 18px;
  box-sizing: border-box;

  border-radius: 18px;
  border: 2px solid rgba(74,58,47,.25);
  background: rgba(255,255,255,.55);

  color: #4a3a2f;
  font-size: 18px;

  &::placeholder {
    color: #b7ac9f;
  }
`;

const TimeWrap = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
`;

const TimeButton = styled.button`
  padding: 10px 18px;

  border-radius: 999px;
  border: 2px solid
    ${({ $active }) =>
      $active ? '#8A7B3E' : 'rgba(74,58,47,.25)'};

  background: ${({ $active }) =>
    $active ? '#CBD879' : '#FFF'};

  color: #4a3a2f;

  font-family: "Noto Sans KR";
  font-size: 16px;
  font-weight: 700;

  cursor: pointer;
`;

const Select = styled.select`
  width: 100%;
  height: 58px;
  padding: 0 18px;
  box-sizing: border-box;

  border-radius: 18px;
  border: 2px solid rgba(74,58,47,.25);
  background: rgba(255,255,255,.55);

  color: #4a3a2f;
  font-size: 18px;
`;

const SaveButton = styled.button`
  width: 100%;
  height: 56px;

  margin-top: auto;

  border-radius: 16px;
  border: 1.5px solid rgba(74,58,47,.55);

  background: #CBD879;
  color: #FFF8ED;

  font-family: Jua;
  font-size: 18px;
  font-weight: 400;

  cursor: pointer;
`;

const RepeatWrap = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const RepeatChip = styled.button`
  min-width: 54px;
  height: 40px;
  padding: 0 16px;

  border-radius: 999px;
  border: 1.5px solid
    ${({ $active }) =>
      $active ? '#8A7B3E' : 'rgba(74,58,47,.25)'};

  background: ${({ $active }) =>
    $active ? '#CBD879' : '#FFF'};

  color: ${({ $active }) =>
    $active ? '#4A3A2F' : '#6B6661'};

  font-family: "Noto Sans KR";
  font-size: 15px;
  font-weight: 700;

  cursor: pointer;
`;