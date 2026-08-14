import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAppData } from '../../../store/AppDataContext';
import { clearUserId } from '../../../api/client/userId';
import { formatAlarmTime, ROLE_LABEL } from './settingsUtils';
import LogoutConfirmPopup from './LogoutConfirmPopup';
import WithdrawConfirmPopup from './WithdrawConfirmPopup';

const Page = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  background: #fff;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const Content = styled.div`
  padding: 16px 20px 30px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 12px;
  border-bottom: 1px solid #e5e0d9;
`;

const BackButton = styled.button`
  width: 20px;
  font-size: 22px;
  color: #000;
  line-height: 1;
`;

const Title = styled.p`
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  color: #000;
`;

const HeaderSpacer = styled.div`
  width: 20px;
`;

const SectionLabel = styled.p`
  margin: 16px 0 8px;
  font-size: 13px;
  font-weight: 500;
  color: #8c8780;

  &:first-of-type {
    margin-top: 16px;
  }
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 52px;
  padding: 0 16px;
  border-radius: 12px;
  background: #f7f5f0;
  margin-bottom: 8px;
`;

const ClickableRow = styled(Row).attrs({ as: 'button' })`
  width: 100%;
  text-align: left;
`;

const RowLabel = styled.span`
  font-size: 15px;
  color: ${({ $danger }) => ($danger ? '#cc4d4d' : '#000')};
`;

const RowValue = styled.span`
  font-size: 14px;
  color: #8c8780;
`;

const Chevron = styled.span`
  font-size: 18px;
  color: ${({ $danger }) => ($danger ? '#cc4d4d' : '#8c8780')};
`;

const ToggleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 44px;
  padding: 0 16px;
  border-radius: 12px;
  background: #f7f5f0;
  margin-bottom: 8px;
`;

const ToggleTrack = styled.button`
  width: 44px;
  height: 24px;
  border-radius: 12px;
  position: relative;
  background: ${({ $on }) => ($on ? '#e8734a' : '#d9d4cc')};
  transition: background 0.15s ease;
`;

const ToggleThumb = styled.span`
  position: absolute;
  top: 2px;
  left: ${({ $on }) => ($on ? '22px' : '2px')};
  width: 20px;
  height: 20px;
  border-radius: 10px;
  background: #fff;
  transition: left 0.15s ease;
`;

const NOTIFICATION_ROWS = [
  { key: 'morningQuestion', label: '아침 연결 질문 알림' },
  { key: 'eveningCheck', label: '저녁 건강 체크 알림' },
  { key: 'medication', label: '복약 알림' },
  { key: 'familyReaction', label: '가족 답변/반응 알림' },
];

function SettingsMain() {
  const navigate = useNavigate();
  const { data, setNotification, resetAppData } = useAppData();
  const [popup, setPopup] = useState(null);

  const handleLogout = () => {
    clearUserId();
    setPopup(null);
    navigate('/');
  };

  const handleWithdraw = () => {
    clearUserId();
    resetAppData();
    setPopup(null);
    navigate('/');
  };

  return (
    <Page>
      <Content>
        <Header>
          <BackButton type="button" aria-label="뒤로가기" onClick={() => navigate('/home')}>
            ‹
          </BackButton>
          <Title>설정</Title>
          <HeaderSpacer />
        </Header>

        <SectionLabel>내 정보</SectionLabel>
        <Row>
          <RowLabel>이름</RowLabel>
          <RowValue>{data.profile.name || '이름을 등록해주세요'}</RowValue>
        </Row>
        <Row>
          <RowLabel>역할</RowLabel>
          <RowValue>{ROLE_LABEL[data.profile.role] || '미설정'}</RowValue>
        </Row>
        <ClickableRow type="button" onClick={() => navigate('/home/settings/profile')}>
          <RowLabel>프로필 수정하기</RowLabel>
          <Chevron>›</Chevron>
        </ClickableRow>

        <SectionLabel>알림 시간</SectionLabel>
        <Row>
          <RowLabel>아침 연결 질문</RowLabel>
          <RowValue>{formatAlarmTime(data.alarms.morning)}</RowValue>
        </Row>
        <Row>
          <RowLabel>저녁 건강 체크</RowLabel>
          <RowValue>{formatAlarmTime(data.alarms.evening)}</RowValue>
        </Row>

        <SectionLabel>푸시 알림</SectionLabel>
        {NOTIFICATION_ROWS.map((row) => (
          <ToggleRow key={row.key}>
            <RowLabel>{row.label}</RowLabel>
            <ToggleTrack
              type="button"
              $on={data.notifications[row.key]}
              onClick={() => setNotification(row.key, !data.notifications[row.key])}
              aria-pressed={data.notifications[row.key]}
            >
              <ToggleThumb $on={data.notifications[row.key]} />
            </ToggleTrack>
          </ToggleRow>
        ))}

        <SectionLabel>가족 연결</SectionLabel>
        <Row>
          <RowLabel>연결된 가족</RowLabel>
          <RowValue>
            {data.family.connectedName
              ? `${data.family.connectedName} (${data.family.connectedRelation})`
              : '아직 연결된 가족이 없어요'}
          </RowValue>
        </Row>

        <SectionLabel>계정</SectionLabel>
        <ClickableRow type="button" onClick={() => setPopup('logout')}>
          <RowLabel>로그아웃</RowLabel>
          <Chevron>›</Chevron>
        </ClickableRow>
        <ClickableRow type="button" onClick={() => setPopup('withdraw')}>
          <RowLabel $danger>탈퇴하기</RowLabel>
          <Chevron $danger>›</Chevron>
        </ClickableRow>
      </Content>

      {popup === 'logout' && (
        <LogoutConfirmPopup onCancel={() => setPopup(null)} onConfirm={handleLogout} />
      )}
      {popup === 'withdraw' && (
        <WithdrawConfirmPopup onCancel={() => setPopup(null)} onConfirm={handleWithdraw} />
      )}
    </Page>
  );
}

export default SettingsMain;
