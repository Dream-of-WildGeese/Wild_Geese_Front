import React from 'react';
import styled from 'styled-components';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import check from '../../assets/onboarding/check.svg';


const StepComplete = () => {
 const navigate = useNavigate();
  const location = useLocation();
  const { step } = useParams();

  const role = location.state?.role;
  const familyName = location.state?.familyName || '가족';

  const completeData = {
    1: {
      badge: '1단계 완료 · 1/3',
      title: `${familyName}님과 연결됐어요`,
      description: '이제부터 서로의 하루를 함께 챙길 수 있어요',
      next: '/onboarding/health-set',
    },
    2: {
      badge: '2단계 완료 · 2/3',
      title: '건강 프로필 설정이 완료됐어요',
      description: '마지막으로 알림 시간을 설정해볼게요',
      next: '/onboarding/alarm',
    },
  };

  const current = completeData[step] || completeData[1];


  return (
    <Page>
      <Content>
        <StepBadge>{current.badge}</StepBadge>

        <CompleteContent>
        <CheckIcon src={check} alt="완료" />
        <Title>{current.title}</Title>

        <Description>{current.description}</Description>

        <ContinueButton
            onClick={() =>
            navigate(current.next, {
                state: { role },
            })
            }
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
  width: calc(100% + 32px);
  height: 100%;
  margin: 0 -${({ theme }) => theme.spacing.md};
  background: #FFF8ED;
`;

const Content = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  padding: 30px 24px 24px;
`;

const StepBadge = styled.div`
  position: absolute;
  top: 56px;
  left: 50%;
  transform: translateX(-50%);

  padding: 6px 16px;

  border-radius: 999px;
  border: 1.5px solid rgba(74, 58, 47, 0.35);
  background: #fff8ed;

  color: #4a3a2f;
  font-family: "Noto Sans KR";
  font-size: 16px;
  font-weight: 700;
  white-space: nowrap;
`;

const CompleteContent = styled.div`
  position: absolute;
  top: 60%;
  left: 50%;
  transform: translate(-50%, -52%);

  width: calc(100% - 48px);

  display: flex;
  flex-direction: column;
  align-items: center;
`;



const CheckIcon = styled.img`
  width: 88px;
  height: 88px;
  object-fit: contain;
`;

const Title = styled.h1`
  margin: 28px 0 0;

color: #4A3A2F;
text-align: center;
font-family: Jua;
font-size: 22px;
font-style: normal;
font-weight: 400;
line-height: normal;
`;

const Description = styled.p`
  margin: 6px 0 0;

 color: #A79C8E;
text-align: center;
font-family: "Noto Sans KR";
font-size: 16px;
font-style: normal;
font-weight: 400;
line-height: normal;
`;

const ContinueButton = styled.button`
  width: 100%;
  height: 60px;

  margin-top: 46px;

  display: flex;
  justify-content: center;
  align-items: center;

  border-radius: 18px;
  border: 1.5px solid rgba(74, 58, 47, 0.55);

  background: #cbd879;
  color: #4A3A2F;

  font-family: Jua;
  font-size: 24px;
  font-weight: 400;

  cursor: pointer;

  &:active {
    transform: scale(0.99);
  }
`;