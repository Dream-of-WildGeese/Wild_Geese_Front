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

            {userType === 'parent' && <Check>✓</Check>}
          </OptionButton>

          <OptionButton
            $selected={userType === 'child'}
            onClick={() => setUserType('child')}
          >
            <OptionText $selected={userType === 'child'}>
              자녀
            </OptionText>

            {userType === 'child' && <Check>✓</Check>}
          </OptionButton>
        </OptionList>

        <NextButton onClick={() =>navigate('/onboarding/invite', 
        {state: { role: userType },}) }>
          다음
        </NextButton>

      </Content>
    </Page>
  );
};

export default UserType;

const Page = styled.div`
  width: 100%;
  min-height: 100vh;
`;

const Content = styled.div`
  padding-top: 64px;
`;

const Header = styled.div`
  /* 제목 + 설명 */
`;

const Title = styled.h1`
  margin: 0;
  color: #000;
font-family: Inter;
font-size: 25px;
font-style: normal;
font-weight: 600;
line-height: normal;
`;

const Description = styled.p`
  margin: 8px 0 0;
  color: #6B6661;
font-family: Inter;
font-size: 16px;
font-style: normal;
font-weight: 400;
line-height: normal;
`;

const OptionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
  
  margin-top: 78px;
`;

const OptionButton = styled.button`
  width: 100%;
  height: 68px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 0 18px 0 20px;

  flex-shrink: 0;
  align-self: stretch;

  border-radius: 14px;
  border: 2px solid ${({ $selected }) => 
    $selected ? '#E8734A' : '#DDD'
  };
  background: #FFF;
`;

const OptionText = styled.span`
  font-size: 18px;
  font-weight: 500;

  ${({ $selected }) =>
    $selected &&
    `
      color: #E8734A;
    `}
`;

const Check = styled.span`
  color: #E8734A;
  font-size: 24px;
`;

const NextButton = styled.button`
  width: 100%;
  height: 56px;

  margin-top: 0;

  border: none;
  border-radius: 14px;

  background: #E8734A;
  color: white;

  font-size: 17px;
  font-weight: 600;
`;
