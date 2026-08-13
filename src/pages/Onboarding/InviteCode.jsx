import React,{ useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { createFamily } from '../../api/family/createFamily';
import { joinFamily } from '../../api/family/joinFamily';
import { useLocation } from 'react-router-dom';


const InviteCode = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const role = location.state?.role;

  const [inviteCode, setInviteCode] = useState('');
  const [code, setCode] = useState('');

  // 내 초대 코드 발급
  useEffect(() => {
    const getInviteCode = async () => {
      try {
        const response = await createFamily();

        console.log('내 초대 코드:', response);

        setInviteCode(response);
      } catch (error) {
        console.error('초대 코드 발급 실패:', error);
      }
    };

    getInviteCode();
  }, []);

  // 내 코드 복사
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode);
      alert('초대 코드가 복사됐어요!');
    } catch (error) {
      console.error(error);
      alert('초대 코드 복사에 실패했어요.');
    }
  };

  // 가족 코드 확인
  const handleConfirm = async () => {
    if (!code.trim()) {
      alert('초대 코드를 입력해주세요.');
      return;
    }

    try {
    await joinFamily({ inviteCode: code });

    navigate('/onboarding/complete/1', {
      state: { role },
    });
  } catch (error) {
    console.error(error);
    alert('유효하지 않은 초대 코드예요.');
  }
  };

  return (
    <Page>
      <Content>
        <Header>
          <BackButton onClick={() => navigate(-1)}>‹</BackButton>
          <Title>가족 연결</Title>
        </Header>

        <Progress>
          <ProgressBar $active />
          <ProgressBar />
          <ProgressBar />
        </Progress>

        <ProgressText>
          전체 3단계 중 1단계예요
        </ProgressText>

        <Section>
          <SectionTitle>1단계 가족 연결</SectionTitle>

          <SectionDescription>
            가족과 연결되면 서로의 하루를 자연스럽게 나눌 수 있어요.
            <br />
            지금 만나지 못해도 바로 연결돼요.
          </SectionDescription>


          <CodeBox>
            <CodeLabel>내 코드 직접 공유하기</CodeLabel>

            <InviteCodeText>
              {inviteCode}
            </InviteCodeText>
        
            <CopyButton onClick={handleCopy}>
              복사하기
            </CopyButton>
          </CodeBox>

          <OrText>또는</OrText>

          <InputLabel>
            가족에게 받은 코드가 있으신가요?
          </InputLabel>

          <CodeInputBox>
            <CodeInput
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="코드 6자리 입력"
              maxLength={6}
            />

            <ConfirmButton onClick={handleConfirm}>
              확인하기
            </ConfirmButton>
          </CodeInputBox>

          <HelpText>
            가족이 수락하면 자동으로 다음으로 넘어가요
          </HelpText>
        </Section>
      </Content>
    </Page>
  );
};

export default InviteCode;


/* =========================
   Page
========================= */

const Page = styled.div`
  width: 100%;
  min-height: 100vh;
  box-sizing: border-box;
`;


/* =========================
   전체 콘텐츠
========================= */

const Content = styled.div`
  width: 100%;
  padding-top: 50px;
  box-sizing: border-box;
`;


/* =========================
   상단 헤더
========================= */

const Header = styled.div`
  position: relative;

  width: 100%;
  height: 40px;

  display: flex;
  align-items: center;
  justify-content: center;
`;

const BackButton = styled.button`
  position: absolute;
  left: 0;

  width: 24px;
  height: 40px;

  padding: 0;
  margin: 0;

  display: flex;
  align-items: center;
  justify-content: flex-start;

  border: none;
  background: transparent;

  color: #000;
  font-family: inherit;
  font-size: 28px;
  font-weight: 300;
  line-height: 1;

  cursor: pointer;
`;

const Title = styled.h1`
  margin-top: 40;
color: #000;
font-family: Inter;
font-size: 18px;
font-style: normal;
font-weight: 500;
line-height: normal;
`;


/* =========================
   진행률
========================= */

const Progress = styled.div`
  width: 100%;

  display: flex;
  gap: 8px;

  margin-top: 14px;
`;

const ProgressBar = styled.div`
  flex: 1;
  height: 6px;

  border-radius: 999px;

  background: ${({ $active }) =>
    $active ? '#E8734A' : '#D9D4CC'};
`;

const ProgressText = styled.p`
  margin: 8px 0 0;

  color: #999;
  font-family: Inter, sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1;
`;


/* =========================
   1단계 내용
========================= */

const Section = styled.section`
  width: 100%;
  margin-top: 20px;
`;

const SectionTitle = styled.h2`
color: #000;
font-family: Inter;
font-size: 23px;
font-style: normal;
font-weight: 500;
line-height: normal;
  margin: 0;
`;

const SectionDescription = styled.p`
  margin: 8px 0 0;

color: #6B6661;
font-family: Inter;
font-size: 15px;
font-style: normal;
font-weight: 400;
line-height: normal;
`;






const OrText = styled.p`
  margin: 14px 0 14px;
color: #8C8780;
text-align: center;
font-family: Inter;
font-size: 15px;
font-style: normal;
font-weight: 400;
line-height: normal;
`;


/* =========================
   내 코드
========================= */

const CodeBox = styled.div`
  margin-top:48px;
  width: 100%;
  height: 142px;
  box-sizing: border-box;

  padding: 16px;

  border-radius: 14px;
  background: #F7F5F0;
`;

const CodeLabel = styled.p`
  margin: 0;

  color: #6B6661;
  font-family: Inter, sans-serif;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 20px;
`;

const InviteCodeText = styled.p`
  margin: 8px 0;

  color: #000;
  font-family: Inter, sans-serif;
  font-size: 26px;
  font-style: normal;
  font-weight: 600;
  line-height: 28px;
  letter-spacing: 3px;
`;

const CopyButton = styled.button`
  width: 100%;
  height: 46px;

  padding: 0;

  display: flex;
  justify-content: center;
  align-items: center;

  box-sizing: border-box;

  border-radius: 10px;
  border: 1px solid #D9D4CC;
  background: #FFF;

  color: #000;
  font-family: Inter, sans-serif;
  font-size: 15px;
  font-style: normal;
  font-weight: 500;
  line-height: 1;

  cursor: pointer;
`;


/* =========================
   받은 코드 입력
========================= */

const InputLabel = styled.p`
  margin: 20px 0 10px;
  color: #6B6661;
font-family: Inter;
font-size: 14px;
font-style: normal;
font-weight: 400;
line-height: normal;
`;

const CodeInputBox = styled.div`
  width: 100%;
  height: 130px;
  box-sizing: border-box;

  padding: 16px;

  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;

  border-radius: 14px;
  background: #F7F5F0;
`;

const CodeInput = styled.input`
  width: 100%;
  height: 44px;

  box-sizing: border-box;

  padding: 0 16px;

  border: 1px solid #D9D4CC;
  border-radius: 12px;

  background: #FFF;

  color: #000;
  font-family: Inter, sans-serif;
  font-size: 15px;
  font-weight: 400;
  line-height: 1;

  outline: none;

  &::placeholder {
    color: #999;
  }

  &:focus {
    border-color: #E8734A;
  }
`;

const ConfirmButton = styled.button`
  width: 100%;
  height: 44px;

  padding: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  box-sizing: border-box;

  border: 1px solid #D9D4CC;
  border-radius: 12px;

  background: #FFF;

  color: #000;
  font-family: Inter, sans-serif;
  font-size: 15px;
  font-weight: 500;
  line-height: 1;

  cursor: pointer;
`;


const HelpText = styled.p`
  margin: 16px 0 0;

  color: #8C8780;
text-align: center;
font-family: Inter;
font-size: 13px;
font-style: normal;
font-weight: 400;
line-height: normal;
`;