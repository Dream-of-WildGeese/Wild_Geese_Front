import React from 'react'
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const Intro = () => {
    const navigate = useNavigate();
  return (
    <Page>
      <Content>
        <Title>온담</Title>

        <Subtitle>따뜻한 대화로 건강을 챙겨보세요!</Subtitle>

        <FeatureList>
          <Feature>
            <IconBox>♥</IconBox>
            <TextBox>
              <FeatureTitle>아침엔 가벼운 질문으로 연결돼요</FeatureTitle>
              <FeatureDescription>
                가족이 같은 질문에 각자 답하며 하루를 시작해요
              </FeatureDescription>
            </TextBox>
          </Feature>

          <Feature>
            <IconBox>♪</IconBox>
            <TextBox>
              <FeatureTitle>저녁엔 음성으로 건강을 체크해요</FeatureTitle>
              <FeatureDescription>
                컨디션, 수면, 식사 같은 걸 짧게 물어봐요
              </FeatureDescription>
            </TextBox>
          </Feature>

          <Feature>
            <IconBox>+</IconBox>
            <TextBox>
              <FeatureTitle>복용약 시간도 잊지 않게 챙겨요</FeatureTitle>
              <FeatureDescription>
                등록해두면 시간 맞춰 알림을 보내드려요
              </FeatureDescription>
            </TextBox>
          </Feature>
        </FeatureList>

        <StartButton onClick={()=> navigate('/onboarding/UserType')}>시작하기</StartButton>
      </Content>
    </Page>
  );
};

export default Intro;



const Page = styled.div`
  width: 100%;
  min-height: 100vh;
 margin: 0;

`;

const Content = styled.div`
  padding-top: 80px;
`;

const Title = styled.h1`
 margin: 0;
align-self: stretch;
color: #000;
text-align: center;
font-family: Inter;
font-size: 25px;
font-style: normal;
font-weight: 600;
line-height: normal;
`;

const Subtitle = styled.p`
  margin: 8px 0 0;
  color: #6B6661;
text-align: center;
font-family: Inter;
font-size: 16px;
font-style: normal;
font-weight: 400;
line-height: normal;

`;

const FeatureList = styled.div`

  display: flex;
  flex-direction: column;
  gap: 24px;

  margin-top: 32px;
  margin-bottom :31.5px
`;

const Feature = styled.div`
  display: flex;
  align-items: center;

  gap: 16px;
`;

const IconBox = styled.div`
 display: flex;
 width: 48px;
 height: 48px;
 justify-content: center;
 align-items: center;
border-radius: 12px;
background: #FAE5D9;

  color: #d47c50;
  font-size: 20px;
`;

const TextBox = styled.div`
  min-width: 0;
`;

const FeatureTitle = styled.h2`
  margin: 0 0 4px;

  font-size: 17px;
  font-weight: 700;
  line-height: 1.4;
`;

const FeatureDescription = styled.p`
  margin: 0;

  color: #777;
  font-size: 15px;
  line-height: 1.45;
`;

const StartButton = styled.button`
  display: flex;
  height: 56px;
  width:100%;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;

  border-radius: 14px;
  background: #E8734A;
  color: white;

  font-size: 17px;
  font-weight: 600;
  font-family: Inter;
  font-style: normal;
  line-height: normal;

  cursor: pointer;
`;