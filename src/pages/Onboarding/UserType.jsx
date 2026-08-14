import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import pinkFlower from '../../assets/onboarding/pinkflower.svg';
import yellowFlower from '../../assets/onboarding/yellowflower.svg';
import back from '../../assets/onboarding/back.svg';

const UserType = () => {
    const navigate= useNavigate();
  const [userType, setUserType] = useState(null);

  return (
    <Page>
      <Content>
        <BackButton onClick={() => navigate('/')}>
          <BackIcon src={back} alt="뒤로가기" />
        </BackButton>
        <Header>
          <Title>당신은 누구신가요?</Title>
          <Description>
            부모님과 자녀 중 하나를 선택해주세요
          </Description>
        </Header>

        <OptionList>
          <OptionButton
            $selected={userType === 'parent'}
            onClick={() => setUserType('parent')}
          >
            <Flower src={yellowFlower} alt="" />
            <OptionText $selected={userType === 'parent'}>
              부모
            </OptionText>
            <Flower src={yellowFlower} alt="" />
          </OptionButton>

          <OptionButton
            $selected={userType === 'child'}
            onClick={() => setUserType('child')}
          >
            <Flower src={pinkFlower} alt="" />
            <OptionText $selected={userType === 'child'}>
              자녀
            </OptionText>
            <Flower src={pinkFlower} alt="" />
          </OptionButton>
        </OptionList>

        <NextButton
          disabled={!userType}
          onClick={() =>
            navigate('/onboarding/step-guide', {
              state: { role: userType },
            })
          }
        >
          다음
        </NextButton>

      </Content>
    </Page>
  );
};

export default UserType;

const Page = styled.div`
  width: calc(100% + 32px);
  height: 100%;
  margin: 0 -${({ theme }) => theme.spacing.md};
  background: #FFF8ED;
`;

const Content = styled.div`
  max-width: 402px;
  height: 100%;
  min-height: 100%;
  margin: 0 auto;
  padding: 104px 24px 30px;
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
const Header = styled.div`
  text-align: center;
`;

const Title = styled.h1`
  margin: 0;
color: #4A3A2F;
text-align: center;
font-family: Jua;
font-size: 40px;
font-style: normal;
font-weight: 400;
line-height: normal;
`;

const Description = styled.p`
margin-top:10px;
height: 20px;
align-self: stretch;
color: #A79C8E;
text-align: center;
font-family: "Noto Sans KR";
font-size: 22px;
font-style: normal;
font-weight: 400;
line-height: normal;
`;

const OptionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 72px;
  margin-top: 82px;
`;

const OptionButton = styled.button`
  display: flex;
  height: 140px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  align-self: stretch;
  border-radius: 20px;
  border: 2px solid rgba(74, 58, 47, 0.70);
    ${({ $selected }) =>
        $selected ? '#8A7B3E' : 'rgba(74,58,47,.25)'};

    background: rgba(255,255,255,.55);

  cursor: pointer;
`;

const Flower = styled.img`
  width: 70px;
  height: 70px;
  flex-shrink: 0;
`;

const OptionText = styled.span`
  color: ${({ $selected }) =>
    $selected ? '#4A3A2F' : '#A79C8E'};

  text-align: center;
  font-family: Jua;
  font-size: 60px;
  font-weight: 400;
`;




const NextButton = styled.button`
  width: 100%;
  height: 56px;

  margin-top: auto;

  display: flex;
  justify-content: center;
  align-items: center;

  border: 1.5px solid rgba(74, 58, 47, 0.55);
  border-radius: 16px;
  background: #CBD879;

  color: #4A3A2F;
  font-family: Jua;
  font-size: 18px;
  font-weight: 400;
`;
