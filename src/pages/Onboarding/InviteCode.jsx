import React, { useState ,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { joinFamily } from '../../api/family';
import { getMyInviteCode } from '../../api/user';
import { useApiAction } from '../../hooks/useApi';
import { useLocation } from 'react-router-dom';
import { useAppData } from '../../store/AppDataContext';
import { getDemoPartner, getPartnerRelation } from '../../demo/accounts';
import back from '../../assets/onboarding/back.svg';
import heart from '../../assets/onboarding/heart.svg';

const InviteCode = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const role = location.state?.role;
  const { setFamily } = useAppData();

  const [code, setCode] = useState('');
  const [inviteCode, setInviteCode] = useState('');

  const { execute: join, loading: joining } = useApiAction(joinFamily);
  const { execute: fetchInviteCode } = useApiAction(getMyInviteCode);
  
  useEffect(() => {
  const loadInviteCode = async () => {
    const { ok, data, error } = await fetchInviteCode();

    if (!ok) {
      console.error('초대코드 조회 실패:', error);
      return;
    }

    setInviteCode(data.inviteCode);
  };

  loadInviteCode();
}, []);

  // 내 코드 복사
  const handleCopy = async () => {
    if (!inviteCode) {
      alert('아직 발급된 초대 코드가 없어요.');
      return;
    }
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

    const { ok, data, error } = await join({ inviteCode: code.trim() });
    if (!ok) {
      alert(error.message);
      return;
    }

    // 응답이 상대 이름을 담아준다. 없을 때만 시연용 이름으로 대신한다.
    const familyName = data?.connectedUserName || getDemoPartner(role).name;

    setFamily({ connectedName: familyName, connectedRelation: getPartnerRelation(role) });

    navigate('/onboarding/complete/1', {
      state: { role, familyName },
    });
  };

  return (
    <Page>
      <Content>
        <BackButton onClick={() => navigate('/onboarding/step-guide')}>
          <BackIcon src={back} alt="뒤로가기" />
        </BackButton>
        <Header>
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
          <SectionTitleWrap>
            <Heart src={heart} alt="" />
            <SectionTextWrap>
              <SectionTitle>1단계. 가족 연결</SectionTitle>
              <SectionDescription>코드를 통해 가족과 연결되세요</SectionDescription>
            </SectionTextWrap>
          </SectionTitleWrap>


          <CodeBox>
            <CodeLabel>내 코드 공유하기</CodeLabel>

            <CodeValueBox>
              <InviteCodeText>{inviteCode || '- - - - - -'}</InviteCodeText>
            </CodeValueBox>

            <CopyButton onClick={handleCopy} disabled={!inviteCode}>
              복사하기
            </CopyButton>

            <CodeHelp>
              {inviteCode
                ? '가족에게 이 코드를 보내주세요'
                : '아직 코드가 없어요. 아래에 가족 코드를 넣어 연결하세요'}
            </CodeHelp>
          </CodeBox>

          <OrSection>
            또는
            <br />
            <span>가족에게 받은 코드가 있으신가요?</span>
          </OrSection>

          <CodeBox>
            <CodeLabel>받은 코드 입력하기</CodeLabel>

            <CodeInput
              value={code}
              onChange={(e)=>setCode(e.target.value)}
              placeholder="코드 6자리 입력"
            />

            <ConfirmButton onClick={handleConfirm} disabled={joining}>
              {joining ? '연결 중...' : '확인하기'}
            </ConfirmButton>

            <HelpText>가족이 보내준 코드를 입력하세요</HelpText>
          </CodeBox>
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
  position: relative;

  max-width: 402px;
  height: 100%;
  margin: 0 auto;

  padding: 86px 20px 30px;
  box-sizing: border-box;

  display: flex;
  flex-direction: column;
`;


/* =========================
   상단 헤더
========================= */

const Header = styled.div`
  width: 100%;
  height: 40px;

  display: flex;
  align-items: center;
  justify-content: center;
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
    $active ? '#DBE4A1;' : '#F6EBC7;'};
`;

const ProgressText = styled.p`
  margin: 7px 0 0;
color: #A79C8E;
text-align: center;
font-family: "Noto Sans KR";
font-size: 16px;
font-style: normal;
font-weight: 400;
line-height: normal;
`;


/* =========================
   1단계 내용
========================= */

// 코드 박스 두 개가 화면 높이를 넘어서면 아래가 잘려 보여서 스크롤을 허용한다.
// (다른 온보딩 페이지의 ScrollArea와 같은 규격)
const Section = styled.section`
  width: 100%;
  margin-top: 12px;

  flex: 1;
  min-height: 0;
  overflow-y: auto;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const SectionTitleWrap = styled.div`
  display: flex;
  align-items: flex-start; /* 하트 아이콘을 상단 기준으로 맞춤 */
  gap: 12px;
  margin-top: 2px;
`;

const Heart = styled.img`
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  margin-top: 2px; /* 제목 폰트 높이에 맞춰 자연스럽게 보정 */
`;


const SectionTextWrap = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const SectionTitle = styled.h2`
  margin: 0;
  color: #4A3A2F;
  font-family: Jua;
  font-size: 28px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
`;

const SectionDescription = styled.p`
  margin: 0 0 0; 
  color: #A79C8E;
  font-family: "Noto Sans KR";
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
`;





/* =========================
   내 코드
========================= */

// 높이를 고정하면 안내 문구가 두 줄이 될 때 아래로 삐져나온다. 내용에 맞춰 늘어나게 둔다.
const CodeBox = styled.div`
  margin-top: 24px;
  padding: 34px 20px 20px;

  display: flex;
  min-height: 210px;
  flex-direction: column;
  align-items: stretch;
  gap: 10px;
  align-self: stretch;

  border-radius: 18px;
  border: 1.3px solid rgba(74, 58, 47, 0.40);
  background: rgba(255, 255, 255, 0.55);
`;
const CodeValueBox = styled.div`
  display: flex;
height: 46px;
justify-content: center;
align-items: center;
gap: 5px;
align-self: stretch;
border-radius: 12px;
border: 1.3px solid rgba(74, 58, 47, 0.40);
background: rgba(255, 255, 255, 0.80);
`;

const CodeLabel = styled.p`
  margin: 0;
  align-self: flex-start;
color: #4A3A2F;
font-family: Jua;
font-size: 20px;
font-style: normal;
font-weight: 400;
line-height: normal;
`;

const InviteCodeText = styled.p`
  margin: 0;

 color: #4A3A2F;
text-align: center;
font-family: Jua;
font-size: 38px;
font-style: normal;
font-weight: 400;
line-height: normal;
`;

const CodeHelp = styled.p`
  margin: 0 0 0;
color: #A79C8E;
text-align: center;
font-family: "Noto Sans KR";
font-size: 16px;
font-style: normal;
font-weight: 500;
line-height: normal;
`;

const CopyButton = styled.button`
  width: 100%;
  height: 40px;
  min-height: 40px;
  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 0;
  border-radius: 16px;
  border: 1.5px solid rgba(74, 58, 47, 0.55);
  background: #DBE4A1;
  box-sizing: border-box;

  color: #4A3A2F;
  font-family: "Noto Sans KR";
  font-size: 16px;
  font-weight: 700;
  line-height: 1;

  cursor: pointer;
`;


/* =========================
   받은 코드 입력
========================= */

const InputTitle = styled.p`
  margin: 0;

  color: #4A3A2F;
  font-family: Jua;
  font-size: 22px;
`;

const OrSection = styled.p`
margin: 16px 0 12px;
color: #877E73;
text-align: center;
font-family: "Noto Sans KR";
font-size: 16px;
font-style: normal;
font-weight: 700;
line-height: normal;
`;





const CodeInput = styled.input`
  width: 100%;
  height: 46px;

  padding: 0 16px;
  box-sizing: border-box;

  border-radius: 12px;
  border: 1.3px solid rgba(74,58,47,.4);
  background: rgba(255,255,255,.8);

  text-align: center;

  color: #4A3A2F;
  font-family: "Noto Sans KR";
  font-size: 18px;
  font-weight: 400;

  &::placeholder{
    color:#A79C8E;
  }
`;

const ConfirmButton = styled.button`
  width: 100%;
  height: 40px;

  border-radius: 16px;
  border: 1.5px solid rgba(74,58,47,.55);
  background: #DBE4A1;

  color: #4A3A2F;
  font-family: "Noto Sans KR";
  font-size: 16px;
  font-weight: 700;

  cursor: pointer;
`;


const HelpText = styled.p`
  margin: 0;

  color: #A79C8E;
  text-align: center;
  font-family: "Noto Sans KR";
  font-size: 16px;
  font-weight: 500;
  line-height: normal;
`;