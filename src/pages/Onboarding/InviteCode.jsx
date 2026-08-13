import React,{ useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
//import { createFamily } from '../../api/family/createFamily';
//import { joinFamily } from '../../api/family/joinFamily';
import { useLocation } from 'react-router-dom';


const InviteCode = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const role = location.state?.role;
  console.log('InviteCode:', role);

  //const [inviteCode, setInviteCode] = useState('');
  const [code, setCode] = useState(''); 
  const inviteCode = '482913'; //임시초대코드
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
  const handleConfirm = () => {
  if (!code.trim()) {
    alert('초대 코드를 입력해주세요.');
    return;
  }

  navigate('/onboarding/complete/1', {
    state: { role },
  });
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


const Page = styled.div`
  width: calc(100% + 32px);
  height: 100%;
  margin: 0 -${({ theme }) => theme.spacing.md};
  background: #FFF8ED;
`;

const Content = styled.div`
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  padding: 52px 20px 20px;
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

  color: #4A3A2F;
 font-size: 32px;
  font-family: inherit;
  font-weight: 300;
  line-height: 1;

  cursor: pointer;
`;

const Title = styled.h1`
  margin: 0;

  color: #4A3A2F;
  font-family: Jua;
  font-size: 22px;
  font-weight: 400;
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
    $active ? '#CBD879' : '#ECE3A8'};
`;

const ProgressText = styled.p`
  margin: 7px 0 0;

  text-align: center;
color: #A79C8E;
text-align: center;
font-family: "Noto Sans KR";
font-size: 14px;
font-style: normal;
font-weight: 400;
line-height: normal;
`;


/* =========================
   1단계 내용
========================= */

const Section = styled.section`
  width: 100%;
  margin-top: 20px;
`;

const SectionTitle = styled.h2`
  margin: 18px 0 0;
color: #4A3A2F;
font-family: Jua;
font-size: 22px;
font-style: normal;
font-weight: 400;
line-height: normal;
`;

const SectionDescription = styled.p`
  margin-top: 10px;
color: #A79C8E;
font-family: "Noto Sans KR";
font-size: 15px;
font-style: normal;
font-weight: 400;
line-height: normal;
`;






const OrText = styled.p`
  margin: 22px 0;

  text-align: center;

  color: #A79C8E;
  font-family: "Noto Sans KR";
  font-size: 22px;
  font-weight: 700;
`;


/* =========================
   내 코드
========================= */

const CodeBox = styled.div`
  margin-top: 34px;
  width: 100%;
  min-height: 176px;
  box-sizing: border-box;

  padding: 20px;

  display: flex;
  flex-direction: column;
  gap: 12px;

  border-radius: 24px;
  border: 2px solid rgba(74,58,47,.25);
  background: rgba(255,255,255,.55);
`;

const CodeLabel = styled.p`
  margin: 0;

  color: #4A3A2F;
  font-family: Jua;
  font-size: 22px;
  font-weight: 400;
`;

const InviteCodeText = styled.p`
  margin: 0;

  color: #4A3A2F;
  font-family: Jua;
  font-size: 54px;
  line-height: 1;
`;

const CopyButton = styled.button`
  width: 100%;
  height: 46px;

  border-radius: 16px;
  border: 1.5px solid rgba(74,58,47,.55);
  background: #CBD879;

  color: #FFF8ED;
  font-family: Jua;
  font-size: 22px;
  font-weight: 400;

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
  min-height: 166px;
  box-sizing: border-box;

  padding: 20px;

  display: flex;
  flex-direction: column;
  gap: 16px;

  border-radius: 24px;
  border: 2px solid rgba(74,58,47,.25);
  background: rgba(255,255,255,.55);
`;

const CodeInput = styled.input`
  width: 100%;
  height: 44px;

  padding: 0 16px;

  box-sizing: border-box;

  border-radius: 16px;
  border: 1.5px solid rgba(74,58,47,.25);

  background: rgba(255,255,255,.8);

  color: #4A3A2F;
  font-family: "Noto Sans KR";
  font-size: 20px;

  &::placeholder {
    color: #A79C8E;
  }
`;

const ConfirmButton = styled.button`
  width: 100%;
  height: 44px;

  border-radius: 16px;
  border: 1.5px solid rgba(74,58,47,.55);
  background: #CBD879;

  color: #FFF8ED;
  font-family: Jua;
  font-size: 22px;

  cursor: pointer;
`;


const HelpText = styled.p`
  margin-top: 28px;

  text-align: center;

  color: #A79C8E;
  font-family: "Noto Sans KR";
  font-size: 18px;
  font-weight: 700;
`;