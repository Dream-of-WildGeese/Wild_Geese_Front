import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import sun from '../../assets/onboarding/sun.svg';
import moon from '../../assets/onboarding/moon.svg';

const AlarmTime = () => {
  const navigate = useNavigate();

  const [morningTime, setMorningTime] = useState('08:30');
  const [eveningTime, setEveningTime] = useState('20:00');

  return (
    <Page>
      <Content>
        <Header>
          <Title>알림 시간 설정</Title>
        </Header>

        <ProgressWrapper>
          <Progress active />
          <Progress active />
          <Progress active />
        </ProgressWrapper>

        <SubText>전체 3단계 중 마지막 단계예요. 거의 다 왔어요!</SubText>

        <SectionTitle>3단계 알림 시간</SectionTitle>
        <SectionDesc>
          편한 시간에 안부를 나눌 수 있도록 맞춰드려요
        </SectionDesc>

        <ScrollArea>
          <Card>
            <CardHeader>
                <TitleWrap>
                    <Icon src={sun} alt="" />
                    <CardTitle>아침 연결 질문 시간</CardTitle>
                </TitleWrap>
            </CardHeader>
            <CardDesc>
              가족과 매일 같은 질문에 각자 답하며 하루를 시작해요
            </CardDesc>

            <TimeInput
            type="time"
            value={morningTime}
            onChange={(e) => setMorningTime(e.target.value)}
            />
          </Card>

          <Card>
            <CardHeader>
                <TitleWrap>
                    <Icon src={moon} alt="" />
                    <CardTitle>저녁 건강 체크 시간</CardTitle>
                </TitleWrap>
            </CardHeader>
            <CardDesc>
              오늘 컨디션, 수면, 식사 같은 걸 음성으로 짧게 물어봐요
            </CardDesc>

            <TimeInput
                type="time"
                value={eveningTime}
                onChange={(e) => setEveningTime(e.target.value)}
                />
          </Card>

          <Card>
            <CardTitle>복약 알림</CardTitle>
            <CardDesc>혈압약 · 오전 8:00, 오후 6:00</CardDesc> {/*api연결하고 수정*/}
          </Card>
        </ScrollArea>

        <StartButton onClick={() => navigate('/')}>
          함께 시작해볼까요?
        </StartButton>
      </Content>
    </Page>
  );
};

export default AlarmTime;

const Page = styled.div`
  width: calc(100% + 32px);
  height: 100%;
  margin: 0 -${({ theme }) => theme.spacing.md};
  background: #FFF8ED;
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
  display: flex;
  justify-content: center;
`;

const Title = styled.h1`
  margin: 0;
  width: 362px;
height: 28px;
color: #4A3A2F;
text-align: center;
font-family: Jua;
font-size: 22px;
font-style: normal;
font-weight: 400;
line-height: normal;
`;

const ProgressWrapper = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 16px;
`;

const Progress = styled.div`
  flex: 1;
  height: 6px;
  border-radius: 999px;
  background: ${({ active }) => (active ? '#CBD879' : '#D9D4CC')};
`;

const SubText = styled.p`
  margin: 10px 0 0;
  width: 362px;
height: 16px;
color: #A79C8E;
text-align: center;
font-family: "Noto Sans KR";
font-size: 14px;
font-style: normal;
font-weight: 400;
line-height: normal;
`;

const SectionTitle = styled.h2`
  margin: 18px 0 6px;
  width: 362px;
height: 28px;
color: #4A3A2F;
font-family: Jua;
font-size: 22px;
font-style: normal;
font-weight: 400;
line-height: normal;
`;

const SectionDesc = styled.p`
  margin: 0;
  width: 362px;
height: 18px;
color: #A79C8E;
font-family: "Noto Sans KR";
font-size: 15px;
font-style: normal;
font-weight: 400;
line-height: normal;
`;

const ScrollArea = styled.div`
  flex: 1;
  overflow-y: auto;
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const Card = styled.div`
  padding: 20px;
  border-radius: 24px;
  border: 2px solid rgba(74,58,47,.25);
  background: rgba(255,255,255,.55);
`;
const CardHeader = styled.div`
  display: flex;
  align-items: center;
`;

const TitleWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Icon = styled.img`
  width: 22.36px;
  height: 20.36px
  flex-shrink: 0;
`;

const CardTitle = styled.h3`
  margin: 0;
 color: #4A3A2F;
font-family: "Noto Sans KR";
font-size: 16px;
font-style: normal;
font-weight: 700;
line-height: normal;
`;

const CardDesc = styled.p`
  margin: 6px 0 8px;
color: #A79C8E;
font-family: "Noto Sans KR";
font-size: 13px;
font-style: normal;
font-weight: 400;
line-height: normal;
`;

const TimeInput = styled.input`
  width: 100%;
  height: 56px;
  padding: 0 16px;
  box-sizing: border-box;

  border-radius: 16px;
  border: 2px solid rgba(74,58,47,.25);
  background: #FFF;

  color: #4A3A2F;
  font-family: "Noto Sans KR";
  font-size: 16px;
  font-weight: 500;

  outline: none;

  &:focus {
    border-color: #8A7B3E;
  }

  &::-webkit-calendar-picker-indicator {
    cursor: pointer;
    opacity: 0.6;
  }
`;

const StartButton = styled.button`
  width: 100%;
  height: 56px;
  margin-top: auto;

  border-radius: 16px;
  border: 1.5px solid rgba(74,58,47,.55);
  background: #CBD879;

  color: #4A3A2F;
  font-family: Jua;
  font-size: 18px;
  cursor: pointer;
`;