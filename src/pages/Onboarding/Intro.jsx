import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import family from '../../assets/onboarding/family.svg';

import pinkFlower from '../../assets/onboarding/pinkflower.svg';
import yellowFlower from '../../assets/onboarding/yellowflower.svg';
import leafLeft from '../../assets/onboarding/leaf-left.svg';
import leafRight from '../../assets/onboarding/leaf.svg';

import leafIcon from '../../assets/onboarding/leaf.svg';
import moonIcon from '../../assets/onboarding/moon.svg';
import medIcon from '../../assets/onboarding/med.svg';
import introText from '../../assets/onboarding/intro-text.svg';
import logo from '../../assets/onboarding/ondam-logo.svg';

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

          <LogoImage src={logo} alt="온담" />

        </HeroSection>
        <IntroTextImage src={introText} alt="따뜻한 대화로 건강을 챙겨보세요!" />

        <FamilyImage src={family} alt="" />

        <FeatureList>
          <Feature>
              <Icon src={leafIcon} alt="" $size={48} />


            <TextBox>
              <FeatureTitle>아침엔 가벼운 질문으로 연결돼요</FeatureTitle>
              <FeatureDescription>
                가족이 같은 질문에 답하며 하루를 시작해요
              </FeatureDescription>
            </TextBox>
          </Feature>

          <Feature>

              <Icon src={moonIcon} alt="" $size={48} />


            <TextBox>
              <FeatureTitle>저녁엔 음성으로 건강을 체크해요</FeatureTitle>
              <FeatureDescription>
                컨디션, 수면, 식사를 짧게 물어봐요
              </FeatureDescription>
            </TextBox>
          </Feature>

          <Feature>

              <Icon src={medIcon} alt="" $size={48} />


            <TextBox>
              <FeatureTitle>복용약 시간도 잊지 않게 챙겨요</FeatureTitle>
              <FeatureDescription>
                등록해두면 시간 맞춰 알림을 보내드려요
              </FeatureDescription>
            </TextBox>
          </Feature>
        </FeatureList>

        <ButtonArea>
            <StartButton onClick={() => navigate('/onboarding/UserType')}>
                시작하기
            </StartButton>
        </ButtonArea>
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
  padding: 0 20px 30px;
  box-sizing: border-box;

  display: flex;
  flex-direction: column;
`;



const HeroSection = styled.div`
  position: relative;
  width: 100%;
  height: 165px;
  margin-top: 66px;
`;

const LogoImage = styled.img`
  position: absolute;
  top: 25px;
  left: 50%;
  transform: translateX(-50%);

  width: 170px;
  height: auto;
`;

const FlowerPink = styled.img`
  position: absolute;
  top: 0;
  left: 55px;
  width: 50px;
  height: 50px;
`;

const LeafTop = styled.img`
  position: absolute;
  top: 0;
  left: 255px;
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
  top: 80px;
  left: 45px;
  width: 53.13px;
  height: 53.13px;
  
`;

const IntroTextImage = styled.img`
  width: 65%;
  max-width: 364px;
  height: auto;
  margin: 20px auto 0;
  display: block;
`;

/* =========================
   가족 이미지
========================= */

const FamilyImage = styled.img`
  width: 100%;
  height: 152px;
  object-fit: cover;
  margin-top: 46px;
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
  gap: 18px;
  height:68px;

  padding: 16px 18px;

  border-radius: 20px;
  border: 1.5px solid rgba(74,58,47,.35);

  background: rgba(255,255,255,.55);
`;


const Icon = styled.img`
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  object-fit: contain;
  flex-shrink: 0;
`;

const TextBox = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
`;

const FeatureTitle = styled.h2`
  margin: 0;
  color: #4A3A2F;
  font-family: "Noto Sans KR";
  font-size: 16px;
  font-weight: 700;
  line-height: 1;
`;

const FeatureDescription = styled.p`
  margin: 0;
  color: #A79C8E;
  font-family: "Noto Sans KR";
  font-size: 13px;
  font-weight: 400;
  line-height: normal;
`;

/* =========================
   시작하기 버튼
========================= */

const StartButton = styled.button`
  width: 100%;
  height: 56px;

 

  display: flex;
  justify-content: center;
  align-items: center;

  border: 1.5px solid rgba(74, 58, 47, 0.55);
  border-radius: 16px;

  background: #cbd879;

color: #4A3A2F;
text-align: center;
font-family: Jua;
font-size: 18px;
font-style: normal;
font-weight: 400;
line-height: normal;
  cursor: pointer;
`;
const ButtonArea = styled.div`
  margin-top: auto;
  padding-top: 51px;
`;