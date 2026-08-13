import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const AddMedication = () => {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [times, setTimes] = useState(['아침 8:00', '저녁 6:00']);
  const [repeat, setRepeat] = useState('');

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

          <Select
            value={repeat}
            onChange={(e) => setRepeat(e.target.value)}
          >
            <option value="">선택해주세요</option>
            <option value="월">월</option>
            <option value="화">화</option>
            <option value="수">수</option>
            <option value="목">목</option>
            <option value="금">금</option>
            <option value="토">토</option>
            <option value="일">일</option>
            <option value="매일">매일</option>
          </Select>
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