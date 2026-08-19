import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import backIcon from '../../../assets/settings/back-icon.png';
import { useAppData } from '../../../store/AppDataContext';
import { clearUserId } from '../../../api/client/userId';
import {
  getMe,
  getNotificationSetting,
  updateNotificationSetting,
  unsubscribePush,
  subscribePush,
} from '../../../api/user';
import { getMyFamily } from '../../../api/family';
import { getUserId } from '../../../api/client';
import { useApi, useApiAction } from '../../../hooks/useApi';
import { formatAlarmTime, ROLE_LABEL } from './settingsUtils';
import TimePickerModal from '../../../components/TimePickerModal';
import ConfirmPopup from './ConfirmPopup';
import NotificationListPopup from './NotificationListPopup';
import { useWebPush } from '../../../hooks/useWebPush';
import { getShowMailbox, setShowMailbox } from '../../../utils/localSettings';
import {
  PopupBackdrop,
  PopupCard,
  PopupInnerBorder,
  PopupTitle,
  PopupPrimaryButton,
} from '../../../components/PopupShell';


const Page = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  background: #FFF8ED;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const Content = styled.div`
  padding: 20px 20px 30px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
`;

const BackButton = styled.button`
  width: 40px;
  height: 40px;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

const Title = styled.p`
  flex: 1;
  margin: 0;
  text-align: center;
  color: #4a3a2f;
  font-family: Jua;
  font-size: 32px;
`;

const HeaderSpacer = styled.div`
  width: 40px;
`;

const TitleDivider = styled.div`
  height: 0;
  margin: 16px 0 20px;
  border-top: 2px dashed rgba(74, 58, 47, 0.4);
`;

const SectionLabel = styled.p`
  margin: 0 0 8px;
  color: #a79c8e;
  font-family: 'Noto Sans KR';
  font-size: 14px;
  font-weight: 700;

  &:not(:first-of-type) {
    margin-top: 24px;
  }
`;

const Card = styled.div`
  border-radius: 18px;
  border: 1.3px solid rgba(74, 58, 47, 0.4);
  background: rgba(255, 255, 255, 0.55);
  padding: 0 20px;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 52px;
`;

const ClickableRow = styled(Row).attrs({ as: 'button' })`
  width: 100%;
  text-align: left;
`;

const RowLabel = styled.span`
  color: ${({ $danger }) => ($danger ? '#c1594a' : '#4a3a2f')};
  font-family: 'Noto Sans KR';
  font-size: 16px;
  font-weight: 700;
`;

const RowValue = styled.span`
  color: #a79c8e;
  font-family: 'Noto Sans KR';
  font-size: 15px;
  font-weight: 700;
`;

const Chevron = styled.span`
  margin-left: 4px;
  font-size: 18px;
  color: ${({ $danger }) => ($danger ? '#c1594a' : '#a79c8e')};
`;

const RowDivider = styled.div`
  height: 1px;
  background: rgba(74, 58, 47, 0.12);
`;

const ToggleRow = styled(Row)``;

const ToggleTrack = styled.button`
  width: 44px;
  height: 24px;
  border-radius: 12px;
  position: relative;
  flex-shrink: 0;
  background: ${({ $on }) => ($on ? '#dbe4a1' : '#e5ded0')};
  border: 1px solid ${({ $on }) => ($on ? 'rgba(74,58,47,0.35)' : 'rgba(74,58,47,0.2)')};
  transition: background 0.15s ease;
`;

const ToggleThumb = styled.span`
  position: absolute;
  top: 1px;
  left: ${({ $on }) => ($on ? '21px' : '1px')};
  width: 20px;
  height: 20px;
  border-radius: 10px;
  background: #fff;
  border: 1px solid rgba(74, 58, 47, 0.25);
  transition: left 0.15s ease;
`;

const AccountButton = styled.button`
  width: 100%;
  height: 36px;
  margin-bottom: 12px;
  border-radius: 18px;
  border: 1.3px solid rgba(74, 58, 47, 0.4);
  background: transparent;

  color: ${({ $tone }) => ($tone === 'withdraw' ? '#c1594a' : '#d97d65')};
  font-family: Jua;
  font-size: 14px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const PushErrorText = styled.p`
  margin: 0;
  width: 100%;
  text-align: center;
  color: #6b6661;
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 16px;
  line-height: 1.5;
  word-break: keep-all;
`;

const DEFAULT_NOTIFICATION_SETTING = {
  morningTime: '08:30',
  morningEnabled: true,
  eveningTime: '20:00',
  eveningEnabled: true,
  reportEnabled: true,
  reportDayOfWeek: 'SUNDAY',
  medicationEnabled: true,
  familyReactionEnabled: true,
};

// key는 서버의 NotificationSetting 필드명을 그대로 쓴다.
const NOTIFICATION_ROWS = [
  { key: 'morningEnabled', label: '아침 연결 질문 알림' },
  { key: 'eveningEnabled', label: '저녁 건강 체크 알림' },
  { key: 'medicationEnabled', label: '복약 알림' },
  { key: 'familyReactionEnabled', label: '가족 답변/반응 알림' },
  { key: 'reportEnabled', label: '가족의 주간리포트 생성 알림' },
];

function SettingsMain() {
  const navigate = useNavigate();
  // 이름/역할은 서버에 조회 API가 없어서 온보딩 때 저장한 로컬 값을 그대로 쓴다.
  const { data, resetAppData } = useAppData();
  const [popup, setPopup] = useState(null);
  // 어떤 알림 시각을 편집 중인지 ('morningTime' | 'eveningTime' | null)
  const [timeEditor, setTimeEditor] = useState(null);
  // 홈에 우체통을 띄울지. 서버 설정에 편지 항목이 없어서 이 기기에만 저장한다.
  const [showMailbox, setShowMailboxState] = useState(getShowMailbox);

  const toggleMailbox = () => {
    const next = !showMailbox;
    setShowMailboxState(next);
    setShowMailbox(next);
  };

  // 알림 설정을 한 번도 저장한 적 없는 계정은 조회가 실패한다.
  // 그때는 기본값으로 화면을 띄워서, 토글을 누르면 그 값으로 새로 저장되게 한다.
  const { data: fetchedSetting, loading, setData: setSetting } = useApi(getNotificationSetting);
  const setting = fetchedSetting ?? (loading ? null : DEFAULT_NOTIFICATION_SETTING);
  const { data: family } = useApi(getMyFamily);
  // 이름은 서버 값을 우선 쓰고, 아직 안 왔으면 온보딩 때 저장한 로컬 값을 보여준다.
  const { data: me } = useApi(getMe);
  const { execute: saveSetting } = useApiAction(updateNotificationSetting);

  const myUserId = getUserId();
  const partner = (family?.members ?? []).find(
    (member) => String(member.userId) !== String(myUserId),
  );

  // 토글/시간 모두 먼저 화면에 반영하고, 저장에 실패하면 이전 값으로 되돌린다.
  const applyChange = async (patch) => {
    if (!setting) return;
    const next = { ...setting, ...patch };
    setSetting(next);
    const { ok, error } = await saveSetting(next);
    if (!ok) {
      setSetting(setting);
      alert(error.message);
    }
  };

  const { enablePush, removeBrowserSubscription } = useWebPush();
  // 푸시를 켜지 못했을 때 알려주는 팝업 (권한 거부, VAPID 키 누락 등)
  const [pushError, setPushError] = useState(null);

  // 켜고 끌 때 브라우저 구독과 서버 구독이 함께 움직여야 한다.
  // 예전에는 전부 끌 때 서버 구독만 지우고 브라우저 구독은 남겨둬서,
  // 다시 켜면 브라우저는 '구독 있음' / 서버는 '없음'으로 어긋났다.
  const handleToggle = async (key) => {
    if (!setting) return;
    const nextValue = !setting[key];

    // 이번 조작까지 반영했을 때 켜진 알림이 하나라도 남는지
    const anyEnabled = NOTIFICATION_ROWS.some((row) =>
      row.key === key ? nextValue : Boolean(setting[row.key]),
    );

    if (nextValue) {
      try {
        const sub = await enablePush();
        const toBase64 = (raw) =>
          raw ? btoa(String.fromCharCode(...new Uint8Array(raw))) : '';

        await subscribePush({
          endpoint: sub.endpoint,
          p256dh: toBase64(sub.getKey?.('p256dh')),
          auth: toBase64(sub.getKey?.('auth')),
        }).catch((error) => {
          // 이미 등록된 구독이면 서버가 거절하는데, 그건 우리가 원한 상태라 넘어간다.
          console.warn('구독 등록 응답:', error);
        });
      } catch (error) {
        // 권한 거부·VAPID 키 누락 등. 여기서 그냥 넘어가면 서버에는 '켜짐'으로
        // 저장되는데 실제 알림은 안 와서, 설정과 동작이 어긋난다.
        setPushError(error);
        return;
      }
    }

    await applyChange({ [key]: nextValue });

    // 전부 껐으면 서버와 브라우저 양쪽 구독을 함께 지운다.
    if (!anyEnabled) {
      try {
        await unsubscribePush();
      } catch (error) {
        console.warn('서버 푸시 구독 해제 실패:', error);
      }
      await removeBrowserSubscription();
    }
  };
  const handleTimeConfirm = (nextTime) => {
    applyChange({ [timeEditor]: nextTime });
    setTimeEditor(null);
  };

  // 유저 식별 헤더가 빠지기 전에(clearUserId 이전에) 구독 삭제 요청을 보내야 한다.
  // 실패해도 로그아웃/탈퇴 자체는 막지 않는다.
  // 서버 구독만 지우면 이 기기에는 구독이 남아서 알림이 계속 온다.
  // 브라우저 쪽까지 함께 지운다.
  const clearPushEverywhere = async () => {
    try {
      await unsubscribePush();
    } catch (error) {
      console.error('서버 푸시 구독 해제 실패:', error);
    }
    await removeBrowserSubscription();
  };

  const handleLogout = async () => {
    await clearPushEverywhere();
    clearUserId();
    setPopup(null);
    navigate('/');
  };

  const handleWithdraw = async () => {
    await clearPushEverywhere();
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
            <img src={backIcon} alt="" />
          </BackButton>
          <Title>설정</Title>
          <HeaderSpacer />
        </Header>
        <TitleDivider />

        <SectionLabel>내 정보</SectionLabel>
        <Card>
          <Row>
            <RowLabel>이름</RowLabel>
            <RowValue>{me?.name || data.profile.name || '이름을 등록해주세요'}</RowValue>
          </Row>
          <RowDivider />
          <Row>
            <RowLabel>역할</RowLabel>
            <RowValue>{ROLE_LABEL[data.profile.role] || '미설정'}</RowValue>
          </Row>
          <RowDivider />
          <ClickableRow type="button" onClick={() => navigate('/home/settings/profile')}>
            <RowLabel>프로필 수정하기</RowLabel>
            <Chevron>›</Chevron>
          </ClickableRow>
        </Card>

        <SectionLabel>알림 시간</SectionLabel>
        <Card>
          <ClickableRow
            type="button"
            disabled={!setting}
            onClick={() => setTimeEditor('morningTime')}
          >
            <RowLabel>아침 연결 질문</RowLabel>
            <RowValue>{setting ? formatAlarmTime(setting.morningTime) : '불러오는 중...'}</RowValue>
          </ClickableRow>
          <RowDivider />
          <ClickableRow
            type="button"
            disabled={!setting}
            onClick={() => setTimeEditor('eveningTime')}
          >
            <RowLabel>저녁 건강 체크</RowLabel>
            <RowValue>{setting ? formatAlarmTime(setting.eveningTime) : '불러오는 중...'}</RowValue>
          </ClickableRow>
        </Card>

        <SectionLabel>푸시 알림</SectionLabel>
        <Card>
          {NOTIFICATION_ROWS.map((row, index) => (
            <div key={row.key}>
              {index > 0 && <RowDivider />}
              <ToggleRow>
                <RowLabel>{row.label}</RowLabel>
                <ToggleTrack
                  type="button"
                  $on={Boolean(setting?.[row.key])}
                  onClick={() => handleToggle(row.key)}
                  aria-pressed={Boolean(setting?.[row.key])}
                  disabled={!setting}
                >
                  <ToggleThumb $on={Boolean(setting?.[row.key])} />
                </ToggleTrack>
              </ToggleRow>
            </div>
          ))}

          <RowDivider />
          {/* 서버 알림 설정에 편지 항목이 없어서 이 토글만 기기에 저장된다 */}
          <ToggleRow>
            <RowLabel>우편 보기</RowLabel>
            <ToggleTrack
              type="button"
              $on={showMailbox}
              onClick={toggleMailbox}
              aria-pressed={showMailbox}
            >
              <ToggleThumb $on={showMailbox} />
            </ToggleTrack>
          </ToggleRow>

          <RowDivider />
          <ClickableRow type="button" onClick={() => setPopup('notifications')}>
            <RowLabel>받은 알림 보기</RowLabel>
            <Chevron>›</Chevron>
          </ClickableRow>
        </Card>

        <SectionLabel>가족 연결</SectionLabel>
        <Card>
          <Row>
            <RowLabel>연결된 가족</RowLabel>
            {/* 가족 구성원 조회는 userId와 email만 내려줘서 이름 대신 email을 보여준다 */}
            <RowValue>{partner ? partner.email : '아직 연결된 가족이 없어요'}</RowValue>
          </Row>
        </Card>

        <SectionLabel>계정</SectionLabel>
        <AccountButton type="button" onClick={() => setPopup('logout')}>
          로그아웃
        </AccountButton>
        <AccountButton type="button" $tone="withdraw" onClick={() => setPopup('withdraw')}>
          탈퇴하기
        </AccountButton>
      </Content>

      {popup === 'notifications' && <NotificationListPopup onClose={() => setPopup(null)} />}
      {(popup === 'logout' || popup === 'withdraw') && (
        <ConfirmPopup
          type={popup}
          gender={data.profile.gender}
          onCancel={() => setPopup(null)}
          onConfirm={popup === 'logout' ? handleLogout : handleWithdraw}
        />
      )}
      {timeEditor && (
        <TimePickerModal
          title={timeEditor === 'morningTime' ? '아침 연결 질문 시간' : '저녁 건강 체크 시간'}
          value={setting?.[timeEditor]}
          onConfirm={handleTimeConfirm}
          onClose={() => setTimeEditor(null)}
        />
      )}

      {/* 푸시를 켜지 못하면 설정만 켜진 채로 알림이 안 와서, 이유를 알려준다 */}
      {pushError && (
        <PopupBackdrop onClick={() => setPushError(null)}>
          <PopupCard $center $gap={16} $padTop={36} onClick={(event) => event.stopPropagation()}>
            <PopupInnerBorder />
            <PopupTitle $center $size={22}>
              알림을 켜지 못했어요
            </PopupTitle>
            <PushErrorText>{pushError.message}</PushErrorText>
            <PopupPrimaryButton type="button" onClick={() => setPushError(null)}>
              알겠어요
            </PopupPrimaryButton>
          </PopupCard>
        </PopupBackdrop>
      )}
    </Page>
  );
}

export default SettingsMain;
