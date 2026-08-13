import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import family from '../../assets/onboarding/family.png';
import speech from '../../assets/onboarding/Union.svg';

import pinkFlower from '../../assets/onboarding/pinkflower.png';
import yellowFlower from '../../assets/onboarding/yellowflower.png';
import leafLeft from '../../assets/onboarding/leaf-left.png';
import leafRight from '../../assets/onboarding/leaf-right.png';

import leafIcon from '../../assets/onboarding/leaf-bot.png';
import moonIcon from '../../assets/onboarding/moon.png';
import medIcon from '../../assets/onboarding/med.png';

const Intro = () => {
  const navigate = useNavigate();

  return (
    <Page>
      <Content>
        <HeroSection>
          <FlowerPink src={pinkFlower} alt="" />
          <LeafTop src={leafRight} alt="" />
          <FlowerYellow src={yellowFlower} alt="" />
          <LeafLeft src={leafLeft} alt="" />

          <Logo>온담</Logo>

          <SpeechWrapper>
            <Speech src={speech} alt="" />
            <SpeechText>따뜻한 대화로 건강을 챙겨보세요!</SpeechText>
          </SpeechWrapper>
        </HeroSection>

        <FamilyImage src={family} alt="" />

        <FeatureList>
          <Feature>
            <IconContainer>
              <Icon src={leafIcon} alt="" $size={30} />
            </IconContainer>

            <TextBox>
              <FeatureTitle>아침엔 가벼운 질문으로 연결돼요</FeatureTitle>
              <FeatureDescription>
                가족이 같은 질문에 각자 답하며 하루를 시작해요
              </FeatureDescription>
            </TextBox>
          </Feature>

          <Feature>
            <IconContainer>
              <Icon src={moonIcon} alt="" $size={32} />
            </IconContainer>

            <TextBox>
              <FeatureTitle>저녁엔 음성으로 건강을 체크해요</FeatureTitle>
              <FeatureDescription>
                컨디션, 수면, 식사 같은 걸 짧게 물어봐요
              </FeatureDescription>
            </TextBox>
          </Feature>

          <Feature>
            <IconContainer>
              <Icon src={medIcon} alt="" $size={30} />
            </IconContainer>

            <TextBox>
              <FeatureTitle>복용약 시간도 잊지 않게 챙겨요</FeatureTitle>
              <FeatureDescription>
                등록해두면 시간 맞춰 알림을 보내드려요
              </FeatureDescription>
            </TextBox>
          </Feature>
        </FeatureList>

        <StartButton onClick={() => navigate('/onboarding/UserType')}>
          시작하기
        </StartButton>
      </Content>
    </Page>
  );
};

export default Intro;

/* =========================
   Page
========================= */

const Page = styled.div`
  width: calc(100% + 32px);
  margin: 0 -${({ theme }) => theme.spacing.md};
  height: 100%;
  background: #fff8ed;
`;

const Content = styled.div`
  max-width: 402px;
  height: 100%;
  margin: 0 auto;
  padding: 0 20px 20px;
  box-sizing: border-box;

  display: flex;
  flex-direction: column;
`;

/* =========================
   로고 + 말풍선
========================= */

const HeroSection = styled.div`
  position: relative;
  width: 100%;
  height: 229px;
  margin-top: 66px;
`;

const Logo = styled.p`
  position: absolute;
  top: 20px;
  left: 0;
  width: 100%;

  margin: 0;

  color: rgba(74, 58, 47, 0.9);
  font-family: 'Jua', sans-serif;
  font-size: 100px;
  font-weight: 400;
  line-height: normal;
  text-align: center;
`;

const FlowerPink = styled.img`
  position: absolute;
  top: 0;
  left: 65px;
  width: 50px;
  height: 50px;
`;

const LeafTop = styled.img`
  position: absolute;
  top: 0;
  left: 245px;
  width: 50px;
  height: 50px;
`;

const FlowerYellow = styled.img`
  position: absolute;
  top: 88px;
  left: 245px;
  width: 50px;
  height: 50px;
`;

const LeafLeft = styled.img`
  position: absolute;
  top: 70px;
  left: 60px;
  width: 53.13px;
  height: 53.13px;
  
`;

const SpeechWrapper = styled.div`
  position: absolute;
  top: 173px;
  left: 20px;
  width: 316px;
  height: 55.913px;
`;

const Speech = styled.img`
  width: 100%;
  height: 100%;
`;

const SpeechText = styled.p`
  position: absolute;
  inset: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  margin: 0;

  color: #4a3a2f;
  font-family: 'Jua', sans-serif;
  font-size: 18px;
  font-weight: 400;
  line-height: normal;
`;

/* =========================
   가족 이미지
========================= */

const FamilyImage = styled.img`
  width: 100%;
  height: 152px;
  object-fit: cover;
  margin-top: 15px;
`;

/* =========================
   기능 소개 리스트
========================= */

const FeatureList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;

  margin-top: 53px;
`;

const Feature = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;

  padding: 12px;
  border-radius: 18px;
  border: 1.3px solid rgba(74, 58, 47, 0.4);
  background: rgba(255, 255, 255, 0.55);
`;

const IconContainer = styled.div`
  display: flex;
width: 48px;
height: 48px;
justify-content: center;
align-items: center;
border-radius: 14px;
border: 1.5px solid rgba(74, 58, 47, 0.55);
background: #F6EBC7;
`;

const Icon = styled.img`
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
`;

const TextBox = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const FeatureTitle = styled.h2`
  margin: 0 0 6px;

  color: #4A3A2F;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.35;
`;

const FeatureDescription = styled.p`
  margin: 0;
  color: #A79C8E;
font-family: "Noto Sans KR";
font-size: 13px;
font-style: normal;
font-weight: 400;
line-height: normal;
height: 18px;
align-self: stretch;
;
`;

/* =========================
   시작하기 버튼
========================= */

const StartButton = styled.button`
  width: 100%;
  height: 56px;

  margin-top: 51px;

  display: flex;
  justify-content: center;
  align-items: center;

  border: 1.5px solid rgba(74, 58, 47, 0.55);
  border-radius: 16px;

  background: #cbd879;
  color: #f8f5ee;

  font-family: 'Jua', sans-serif;
  font-size: 18px;
  font-weight: 400;

  cursor: pointer;
`;
