import React from 'react';
import styled from 'styled-components';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import check from '../../assets/onboarding/check.svg';
import back from '../../assets/onboarding/back.svg';
import sprout from '../../assets/onboarding/sprout.svg';
import completeFlower from '../../assets/onboarding/complete-flower.svg';
import completeFlower2 from '../../assets/onboarding/complete-flower2.svg';


const StepComplete = () => {
 const navigate = useNavigate();
  const location = useLocation();
  const { step } = useParams();

  const role = location.state?.role;
  const familyName = location.state?.familyName || '가족';

 const completeData = {
  1: {
    badge: '1단계 완료 1/3',
    title: `${familyName}님과 연결됐어요`,
    description: '이제부터 서로의 하루를 함께 챙길 수 있어요',
    icon: sprout,
    buttonText: '계속하기',
    next: '/onboarding/health-set',
  },
  2: {
    badge: '2단계 완료 2/3',
    title: '건강 프로필 설정이 끝났어요',
    description: '이제 알림 시간만 정하면 모든 준비가 끝나요',
    icon: completeFlower,
    buttonText: '알림 시간 설정하러 가기',
    next: '/onboarding/alarm',
  },
  3: {
    badge: '3단계 완료 3/3',
    title: `${familyName}님과 연결됐어요`,
    description: '이제부터 서로의 하루를 함께 챙길 수 있어요',
    icon: completeFlower2,
    buttonText: `${familyName} 보러가기`,
    next: '/home', // 홈 경로에 맞게 수정
  },
};

  const current = completeData[step] || completeData[1];


  return (
    <Page>
      <Content>
      <BackButton onClick={() => navigate(-1)}>
        <BackIcon src={back} alt="뒤로가기" />
      </BackButton>

      <StepBadge>{current.badge}</StepBadge>

      <CompleteContent>
        <SproutIcon src={current.icon} alt="" />

        <Title>{current.title}</Title>

        <Description>{current.description}</Description>
      </CompleteContent>

      <ButtonArea>
        <ContinueButton
          onClick={() =>
            navigate(current.next, {
              state: { role },
            })
          }
        >
          {current.buttonText}
        </ContinueButton>
      </ButtonArea>
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

  max-width: 402px;
  height: 100%;
  min-height: 100%;
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
`;


const StepBadge = styled.div`
  position: absolute;
  top: 84px;
  left: 50%;
  transform: translateX(-50%);

  width: 120px;
  height: 30px;

  display: flex;
  justify-content: center;
  align-items: center;

  border-radius: 19px;
  border: 1.3px solid rgba(74,58,47,.35);
  background: #F6EBC7;

  color: #4A3A2F;
  font-family: Jua;
  font-size: 14px;
  font-weight: 400;
`;

const CompleteContent = styled.div`
  flex: 1;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  gap: 8px;
  transform: translateY(-40px);
`;



const SproutIcon = styled.img`
  width: 170px;
  height: 170px;
  object-fit: contain;
`;

const Title = styled.h1`
  margin: -6px 0 0;

  color: #4A3A2F;
  text-align: center;
  font-family: Jua;
  font-size: 32px;
  font-weight: 400;
`;

const Description = styled.p`
  margin: -8px 0 0;

  color: #A79C8E;
  text-align: center;
  font-family: "Noto Sans KR";
  font-size: 18px;
  font-weight: 400;
`;

const ButtonArea = styled.div`
  margin-top: auto;
`;

const ContinueButton = styled.button`
  width: 100%;
  height: 56px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 16px;
  border: 1.5px solid rgba(74,58,47,.55);
  background: #CBD879;

  color: #4A3A2F;
  font-family: Jua;
  font-size: 22px;
  font-weight: 400;
`;