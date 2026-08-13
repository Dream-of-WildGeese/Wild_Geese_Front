import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const StepGuide = () => {
  const navigate = useNavigate();

  return (
    <Page>
      <Content>
        <Title>온담에 오신 걸 진심으로 환영해요</Title>

        <Description>
          가족과 함께, 매일의 건강을 다정하게 나눠보세요
          <br />
          아래 3가지만 하나씩 하면 준비 끝이에요
        </Description>

        <StepList>
          <Step>
            <StepTitle>1단계 가족 연결</StepTitle>
            <StepDescription>
              가족을 초대해서 연결해보세요
            </StepDescription>
          </Step>

          <Step>
            <StepTitle>2단계 건강 프로필</StepTitle>
            <StepDescription>
              건강정보를 바탕으로 꼭 맞는 건강체크를 도와드려요
            </StepDescription>
          </Step>

          <Step>
            <StepTitle>3단계 알림 시간</StepTitle>
            <StepDescription>
              편한 시간에 알림을 받아보세요
            </StepDescription>
          </Step>
        </StepList>

        <StartButton
          onClick={() => navigate('/onboarding/invite')}
        >
          시작하기
        </StartButton>
      </Content>
    </Page>
  );
};

export default StepGuide;

const Page = styled.div`
  width: 100%;
  min-height: 100vh;
`;

const Content = styled.div`
  padding-top: 50px;
`;

const Title = styled.h1`
  margin: 0;

  color: #000;
font-family: Inter;
font-size: 25px;
font-style: normal;
font-weight: 600;
line-height: normal;
`;

const Description = styled.p`
  margin: 6px 0 0;

color: #6B6661;
font-family: Inter;
font-size: 16px;
font-style: normal;
font-weight: 400;
line-height: normal;
`;

const StepList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;

  margin-top: 24px;
`;

const Step = styled.div`
 display: flex;
padding: 18px;
flex-direction: column;
align-items: flex-start;
gap: 4px;
align-self: stretch;
border-radius: 14px;
border: 1px solid #D9D4CC;
background: #FFF;
`;

const StepTitle = styled.h2`
  margin: 0;

  color: #000;
font-family: Inter;
font-size: 19px;
font-style: normal;
font-weight: 500;
line-height: normal;
`;

const StepDescription = styled.p`
  margin: 4px 0 0;
  color: #6B6661;
font-family: Inter;
font-size: 15px;
font-style: normal;
font-weight: 400;
line-height: normal;
`;

const StartButton = styled.button`
 margin-top: 20px;
  display: flex;
height: 56px;
width: 100%;
justify-content: center;
align-items: center;
flex-shrink: 0;
align-self: stretch;
border-radius: 14px;
background: #E8734A;

  cursor: pointer;
  color: #FFF;
font-family: Inter;
font-size: 17px;
font-style: normal;
font-weight: 600;
line-height: normal;
`;
