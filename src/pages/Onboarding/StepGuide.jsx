import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import back from '../../assets/onboarding/back.svg';
import heart from '../../assets/onboarding/heart.svg';
import arrow from '../../assets/onboarding/arrow.svg';

const StepGuide = () => {
  const navigate = useNavigate();

  return (
    <Page>
      <Content>
        <BackButton onClick={() => navigate('/onboarding/UserType')}>
          <BackIcon src={back} alt="뒤로가기" />
        </BackButton>
        <Title>온담에 오신 걸 <br />진심으로 환영해요</Title>

        <Description>
          가족과 함께, 매일의 건강을 다정하게 나눠보세요
          <br />
          아래 3가지만 하나씩 하면 준비 끝이에요
        </Description>

        <StepList>
            <StepItem>
                <Step>
                <HeartIcon src={heart} alt="" />
                <StepText>
                    <StepTitle>1단계. 가족 연결</StepTitle>
                    <StepDescription>가족을 초대해서 연결해보세요</StepDescription>
                </StepText>
                </Step>
                <ArrowIcon src={arrow} alt="" />
            </StepItem>

            <StepItem>
                <Step>
                <HeartIcon src={heart} alt="" />
                <StepText>
                    <StepTitle>2단계. 건강 프로필</StepTitle>
                    <StepDescription>정보를 바탕으로 꼭 맞는 건강체크를 도와드려요</StepDescription>
                </StepText>
                </Step>
                <ArrowIcon src={arrow} alt="" />
            </StepItem>

            <StepItem>
                <Step>
                <HeartIcon src={heart} alt="" />
                <StepText>
                    <StepTitle>3단계. 알림 시간</StepTitle>
                    <StepDescription>편한 시간에 알림을 받아보세요</StepDescription>
                </StepText>
                </Step>
            </StepItem>
        </StepList>

        <ButtonArea>
            <StartButton
            onClick={() => navigate('/onboarding/invite')}
            >
            시작하기
            </StartButton>

        </ButtonArea>


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

// Page가 화면보다 32px 넓어서, max-width로 잡아주지 않으면 뒤로가기 버튼과
// 시작하기 버튼이 다른 온보딩 페이지보다 바깥으로 밀린다. (InviteCode/AlarmTime과 동일 규격)
const Content = styled.div`
  position: relative;

  max-width: 402px;
  height: 100%;
  margin: 0 auto;

  padding: 86px 20px 30px;
  box-sizing: border-box;

  display: flex;
  flex-direction: column;
`;

const BackButton = styled.button`
  position: absolute;
  top: 35px;
  left: 24px;
  z-index: 10;

  width: 40px;
  height: 40px;

  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;

  display: flex;
  align-items: center;
  justify-content: center;
`;

const BackIcon = styled.img`
  width: 40px;
  height: 40px;
  object-fit: contain;
`;


const Title = styled.h1`
  margin: 0;
  text-align: center;
  color: #4A3A2F;
  font-family: Jua;
  font-size: 40px;
  font-weight: 400;
  font-style: normal;
  line-height: normal;
`;

const Description = styled.p`
  margin: 18px 0 0;

  text-align: center;
  color: #A79C8E;
text-align: center;
font-family: "Noto Sans KR";
font-size: 18px;
font-style: normal;
font-weight: 400;
line-height: normal;
letter-spacing: -0.36px;
`;


// 화면이 작은 기기에서 3단계 카드가 잘리지 않도록 이 영역만 스크롤되게 한다.
const StepList = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 44px;

  flex: 1;
  min-height: 0;
  overflow-y: auto;

  &::-webkit-scrollbar {
    display: none;
  }
`;



const StepItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Step = styled.div`
  width: 95%;
  height: 84px;
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 18px 20px;
  border-radius: 24px;
  border: 2px solid rgba(74,58,47,.25);
  background: rgba(255,255,255,.55);
  box-sizing: border-box;
`;

const HeartIcon = styled.img`
  width: 36px;
  height: 36px;
  flex-shrink: 0;
`;

const StepText = styled.div` 
flex: 1;
display: flex;
flex-direction: column; 
justify-content: center; 
`;

const ArrowIcon = styled.img`
  width: 50px;
  height: 50px;
  margin: 10px 0;
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

  border-radius: 16px;
  border: 1.5px solid rgba(74,58,47,.55);
  background: #CBD879;

  color: #4A3A2F;
  font-family: Jua;
  font-size: 18px;
  font-weight: 400;

  cursor: pointer;
`;
const ButtonArea = styled.div`
  margin-top: auto;
  padding-top: 51px;
`;