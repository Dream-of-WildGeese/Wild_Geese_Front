import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const StepComplete = () => {
  const navigate = useNavigate();

  return (
    <Page>
      <Content>
        <StepBadge>
          1단계 완료 · 1/3
        </StepBadge>

       <CompleteContent>
        <CheckIcon>✓</CheckIcon>

        <Title>김민준님과 연결됐어요</Title>

        <Description>
            이제부터 서로의 하루를 함께 챙길 수 있어요
        </Description>

        <ContinueButton
            onClick={() => navigate('/onboarding/basic-info')}
        >
            계속하기
        </ContinueButton>
        </CompleteContent>
      </Content>
    </Page>
  );
};

export default StepComplete;

const Page = styled.div`
  width: 100%;
  min-height: 100vh;
  box-sizing: border-box;
`;

const Content = styled.div`
  position: relative;

  width: 100%;
  min-height: 100vh;
  box-sizing: border-box;

  padding: 30px 24px 24px;
`;

const StepBadge = styled.div`
  position: absolute;
  top: 30px;
  left: 50%;
  transform: translateX(-50%);

  padding: 4px 12px;

  border-radius: 8px;
  background: #E0F2E3;

  color: #339959;
  font-family: Inter, sans-serif;
  font-size: 14px;
  font-weight: 500;
  line-height: normal;
`;

const CompleteContent = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;

  transform: translate(-50%, -50%);

  display: flex;
  flex-direction: column;
  align-items: center;

  width: calc(100% - 48px);
`;

const CheckIcon = styled.div`
color: #339959;
font-family: Inter;
font-size: 64px;
font-style: normal;
font-weight: 600;
line-height: normal;
`;

const Title = styled.h1`
  margin: 20px 0 0;
  color: #000;
  text-align: center;
  font-family: Inter, sans-serif;
  font-size: 22px;
  font-weight: 500;
  line-height: normal;
`;

const Description = styled.p`
  margin: 10px 0 0;

  color: #6B6661;
  text-align: center;
  font-family: Inter, sans-serif;
  font-size: 16px;
  font-weight: 400;
  line-height: normal;
`;

const ContinueButton = styled.button`
  width: 100%;
  height: 60px;

  margin-top: 36px;

  display: flex;
  justify-content: center;
  align-items: center;

  border: none;
  border-radius: 14px;
  background: #E8734A;

  color: #FFF;
  font-family: Inter, sans-serif;
  font-size: 19px;
  font-weight: 600;
  line-height: normal;

  cursor: pointer;
`;