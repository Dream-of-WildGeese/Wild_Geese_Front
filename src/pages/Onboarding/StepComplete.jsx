import React from 'react';
import styled from 'styled-components';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { completeOnboarding } from '../../api/user';
import { useApiAction } from '../../hooks/useApi';
import { useAppData } from '../../store/AppDataContext';
import back from '../../assets/onboarding/back.svg';
import sprout from '../../assets/onboarding/sprout.svg';
import completeFlower from '../../assets/onboarding/complete-flower.svg';
import completeFlower2 from '../../assets/onboarding/complete-flower2.svg';


const StepComplete = () => {
 const navigate = useNavigate();
  const location = useLocation();
  const { step } = useParams();

  const role = location.state?.role;
  const { data } = useAppData();
  // InviteCode에서 저장해둔 값을 우선 쓰고, 아직 안 붙었을 때만 state를 본다.
  // health-set/alarm 단계를 거치며 location.state는 유실되지만 AppData는 유지된다.
  const familyName = data.family.connectedName || location.state?.familyName || '가족';
  const { execute: finishOnboarding, loading: finishing } = useApiAction(completeOnboarding);

 const completeData = {
  1: {
    badge: '1단계 완료 1/3',
    title: `${familyName}님과 연결됐어요`,
    description: '이제부터 서로의 하루를 함께 챙길 수 있어요',
    icon: sprout,
    buttonText: '계속하기',
    next: '/onboarding/health-set',
    back: '/onboarding/invite',
  },
  2: {
    badge: '2단계 완료 2/3',
    title: '건강 프로필 설정이 끝났어요',
    description: '이제 알림 시간만 정하면 모든 준비가 끝나요',
    icon: completeFlower,
    buttonText: '알림 시간 설정하러 가기',
    next: '/onboarding/alarm',
    back: '/onboarding/health-set',
  },
  3: {
    badge: '3단계 완료 3/3',
    title: `${familyName}님과 연결됐어요`,
    description: '이제부터 서로의 하루를 함께 챙길 수 있어요',
    icon: completeFlower2,
    buttonText: `온담 시작하기`,
    next: '/home',
    back: '/onboarding/alarm',
  },
};

  const current = completeData[step] || completeData[1];
  const isFinalStep = String(step) === '3';

  // 마지막 단계를 지나면 온보딩 완료를 서버에 알린다.
  // 실패해도 홈으로는 보내준다(다음 진입 때 다시 시도할 수 있다).
  const handleContinue = async () => {
    if (isFinalStep) {
      const { ok, error } = await finishOnboarding();
      if (!ok) {
        console.error('온보딩 완료 처리 실패:', error);
      }
    }
    navigate(current.next, { state: { role } });
  };

  return (
    <Page>
      <Content>
      <BackButton onClick={() => navigate(current.back, { state: { role } })}>
        <BackIcon src={back} alt="뒤로가기" />
      </BackButton>

      <StepBadge>{current.badge}</StepBadge>

      <CompleteContent>
        <SproutIcon src={current.icon} alt="" />

        <Title>{current.title}</Title>

        <Description>{current.description}</Description>
      </CompleteContent>

      <ButtonArea>
        <ContinueButton onClick={handleContinue} disabled={finishing}>
          {finishing ? '마무리하는 중...' : current.buttonText}
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
`;


const StepBadge = styled.div`
  position: absolute;
  top: 84px;
  left: 50%;
  transform: translateX(-50%);

  min-width: 160px;
  height: 40px;
  padding: 0 14px;

  display: flex;
  justify-content: center;
  align-items: center;
  white-space: nowrap;

  border-radius: 25px;
  border: 1.3px solid rgba(74,58,47,.35);
  background: #F6EBC7;

  color: #4A3A2F;
  font-family: Jua;
  font-size: 20px;
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
  padding-top: 51px;
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
  font-size: 18px;
  font-weight: 400;
`;