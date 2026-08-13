import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const UserType = () => {
    const navigate= useNavigate();
  const [userType, setUserType] = useState(null);

  return (
    <Page>
      <Content>
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
            <OptionText $selected={userType === 'parent'}>
              부모
            </OptionText>

          </OptionButton>

          <OptionButton
            $selected={userType === 'child'}
            onClick={() => setUserType('child')}
          >
            <OptionText $selected={userType === 'child'}>
              자녀
            </OptionText>
          </OptionButton>
        </OptionList>

        <NextButton
          disabled={!userType}
          onClick={() =>
            navigate('/onboarding/invite', {
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
  margin: 0 auto;
  padding: 104px 24px 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
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
font-weight: 700;
line-height: normal;
`;

const OptionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 72px;
  margin-top: 82px;
`;

const OptionButton = styled.button`
  width: 100%;
  height: 114px;

  display: flex;
  justify-content: center;
  align-items: center;

  border-radius: 24px;
  border: 2px solid
    ${({ $selected }) =>
      $selected ? '#8A7B3E' : 'rgba(74,58,47,.25)'};

  background: rgba(255,255,255,.55);

  cursor: pointer;
`;

const OptionText = styled.span`
  color: ${({ $selected }) =>
    $selected ? '#4A3A2F' : '#A79C8E'};

  font-family: 'Jua', sans-serif;
  font-size: 36px;
  font-weight: 400;
`;



const NextButton = styled.button`
  width: 100%;
  height: 56px;

  margin-top: auto;

  border-radius: 16px;
  border: 1.5px solid rgba(74,58,47,.55);

  background: #CBD879;
  color: #FFF8ED;

  font-family: 'Jua', sans-serif;
  font-size: 18px;
  font-weight: 400;

  cursor: pointer;
  &:disabled {
    background: #D8D5D1;
    border-color: #D8D5D1;
    cursor: not-allowed;
  }
`;