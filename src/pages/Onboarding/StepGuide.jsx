import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const StepGuide = () => {
  const navigate = useNavigate();

  return (
    <Page>
      <Content>
        <Title>온담에 오신 걸 <br />진심으로 환영해요</Title>

        <Description>
          가족과 함께, 매일의 건강을 다정하게 나눠보세요
          <br />
          아래 3가지만 하나씩 하면 준비 끝이에요
        </Description>

        <StepList>
            <StepItem>
                <Step>
                <NumberCircle>1</NumberCircle>
                <StepText>
                    <StepTitle>1단계 가족 연결</StepTitle>
                    <StepDescription>가족을 초대해서 연결해보세요</StepDescription>
                </StepText>
                </Step>
                <Connector />
            </StepItem>

            <StepItem>
                <Step>
                <NumberCircle>2</NumberCircle>
                <StepText>
                    <StepTitle>2단계 건강 프로필</StepTitle>
                    <StepDescription>정보를 바탕으로 꼭 맞는 건강체크를 도와드려요</StepDescription>
                </StepText>
                </Step>
                <Connector />
            </StepItem>

            <StepItem>
                <Step>
                <NumberCircle>3</NumberCircle>
                <StepText>
                    <StepTitle>3단계 알림 시간</StepTitle>
                    <StepDescription>편한 시간에 알림을 받아보세요</StepDescription>
                </StepText>
                </Step>
            </StepItem>
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
width: calc(100% + 32px); 
height: 100%; 
margin: 0 -${({ theme }) => theme.spacing.md}; 
background: #FFF8ED; `; 

const Content = styled.div`
 height: 100%; 
 padding: 68px 20px 30px; 
 box-sizing: border-box;
  display: flex; 
  flex-direction: column; `;


const Title = styled.h1`
  margin: 0;
  text-align: center;
  color: #4A3A2F;
  font-family: Jua;
  font-size: 40px;
  font-weight: 400;
`;

const Description = styled.p`
  margin: 22px 0 0;
  text-align: center;
  color: #A79C8E;
  font-family: "Noto Sans KR";
  font-size: 18px;
  font-weight: 700;
  line-height: 1.5;
`;


const StepList = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 72px;
`;



const StepItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Step = styled.div`
  width: 100%;
  height: 84px;
  display: flex;
  align-items: center;
  gap: 16px;

  padding: 18px 22px;
  border-radius: 24px;
  border: 2px solid rgba(74,58,47,.25);
  background: rgba(255,255,255,.55);
  box-sizing: border-box;
`;

const NumberCircle = styled.div`
border-radius: 16px;
border: 1.4px solid rgba(74, 58, 47, 0.50);
background: #F6EBC7;
  display: flex;
width: 32px;
height: 32px;
flex-direction: column;
justify-content: center;
flex-shrink: 0;
color: #4A3A2F;
text-align: center;
font-family: Jua;
font-size: 16px;
font-style: normal;
font-weight: 400;
line-height: normal;
`;

const StepText = styled.div` 
flex: 1;
display: flex;
flex-direction: column; 
justify-content: center; 
`;

const Connector = styled.div` 
width: 2px; 
height: 42px; 
background: rgba(74,58,47,.28); 
`;
const StepTitle = styled.h2` 
margin: 0; 
color: #4A3A2F; 
font-family: "Noto Sans KR"; 
font-size: 18px; 
font-weight: 700; 
`; 
const StepDescription = styled.p`
 margin: 6px 0 0; 
 color: #A79C8E; 
 font-family: "Noto Sans KR"; 
 font-size: 14px; 
 font-weight: 700; 
 `;


const StartButton = styled.button`
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
