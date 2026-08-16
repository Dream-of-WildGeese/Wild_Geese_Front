 import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import alarmSun from '../../assets/onboarding/alarm-sun.svg';
import alarmMoon from '../../assets/onboarding/alarm-moon.svg';
import back from '../../assets/onboarding/back.svg';
import heart from '../../assets/onboarding/heart.svg';
import clock from '../../assets/onboarding/clock.svg';
import { useAppData } from '../../store/AppDataContext';
import { updateNotificationSetting } from '../../api/user';
import { useApiAction } from '../../hooks/useApi';
import TimePickerModal from '../../components/TimePickerModal';
import { formatAlarmTime } from '../Home/Setting/settingsUtils';
import { getMedications } from '../../api/medication';
import { useApi } from '../../hooks/useApi';


const AlarmTime = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const role = location.state?.role;
  const { data, setAlarms } = useAppData();
  const { data: medicationList } = useApi(getMedications);

  const [morningTime, setMorningTime] = useState(data.alarms.morning);
  const [eveningTime, setEveningTime] = useState(data.alarms.evening);
  const { execute: saveSetting, loading: saving } = useApiAction(updateNotificationSetting);
  // 어떤 시각을 편집 중인지 ('morning' | 'evening' | null)
  const [timeEditor, setTimeEditor] = useState(null);

  // 서버는 알림 on/off와 시각을 한 번에 받으므로, 온보딩 기본값(전부 켜짐)과 함께 보낸다.
  const handleComplete = async () => {
    const { ok, error } = await saveSetting({
      morningTime,
      morningEnabled: true,
      eveningTime,
      eveningEnabled: true,
      reportEnabled: true,
      reportDayOfWeek: 'SUNDAY',
      medicationEnabled: true,
      familyReactionEnabled: true,
    });
    if (!ok) {
      alert(error.message);
      return;
    }
    setAlarms({ morning: morningTime, evening: eveningTime });
    navigate('/onboarding/complete/3', { state: { role } });
  };

  return (
    <Page>
      <Content>
        <BackButton onClick={() => navigate('/onboarding/complete/2', { state: { role } })}>
          <BackIcon src={back} alt="뒤로가기" />
        </BackButton>

        <Header>
          <Title>알림 시간 설정</Title>
        </Header>

        <ProgressWrapper>
          <Progress active />
          <Progress active />
          <Progress active />
        </ProgressWrapper>

        <ProgressText>
          전체 3단계 중 마지막 단계예요. 거의 다 왔어요!
        </ProgressText>

        <Section>
          <SectionTitleWrap>
            <Heart src={heart} alt="" />
            <SectionTitle>3단계. 알림시간</SectionTitle>
          </SectionTitleWrap>

          <SectionDesc>
            편한 시간에 안부를 나눌 수 있도록 맞춰드려요
          </SectionDesc>

          <ScrollArea>
            <Card>
              <CardHeader>
                <TitleWrap>
                  <Icon src={alarmSun} alt="" />
                  <CardTitle>아침 연결 질문 시간</CardTitle>
                </TitleWrap>
              </CardHeader>

              <CardDescBox>
                가족과 같은 질문에 각자 답하며 하루를 시작해요.
                <br />
                예) "오늘 아침 메뉴는 뭐였나요?"
              </CardDescBox>

              <TimeButton type="button" onClick={() => setTimeEditor('morning')}>
                {formatAlarmTime(morningTime)}
              </TimeButton>
            </Card>

            <Card>
              <CardHeader>
                <TitleWrap>
                  <Icon src={alarmMoon} alt="" />
                  <CardTitle>저녁 건강 체크 시간</CardTitle>
                </TitleWrap>
              </CardHeader>

              <CardDescBox>
                오늘 컨디션, 잠은 잘 잤는지, 밥은 잘 먹었는지
                <br />
                음성으로 물어봐요. 지병이 있다면 맞춤 질문도 나가요.
              </CardDescBox>

              <TimeButton type="button" onClick={() => setTimeEditor('evening')}>
                {formatAlarmTime(eveningTime)}
              </TimeButton>
            </Card>

            <Card>
              <MedicineHeader>
                <ClockIcon src={clock} alt="" />
                <CardTitle>복약알림</CardTitle>
                <ClockIcon src={clock} alt="" />
              </MedicineHeader>

              <MedicineText>
                {(medicationList ?? []).length > 0 ? (
                  medicationList.map((med) => (
                    <MedicineItem key={med.medicationId}>
                      -{med.name} :{" "}
                      {med.schedules
                        .map((schedule) => formatAlarmTime(schedule.scheduledTime))
                        .join(', ')}
                    </MedicineItem>
                  ))
                ) : (
                  '등록된 복용약이 없어요'
                )}
              </MedicineText>
            </Card>
          </ScrollArea>
          <StartButton onClick={handleComplete} disabled={saving}>
            {saving ? '저장 중...' : '완료'}
          </StartButton>
        </Section>

      </Content>

      {timeEditor && (
        <TimePickerModal
          title={timeEditor === 'morning' ? '아침 연결 질문 시간' : '저녁 건강 체크 시간'}
          value={timeEditor === 'morning' ? morningTime : eveningTime}
          onConfirm={(next) => {
            if (timeEditor === 'morning') setMorningTime(next);
            else setEveningTime(next);
            setTimeEditor(null);
          }}
          onClose={() => setTimeEditor(null)}
        />
      )}
    </Page>
  );
};

export default AlarmTime;

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

const BackButton = styled.button`
  position: absolute;
  top: 35px;
  left: 24px;
  z-index: 10;

  width: 40px;
  height: 40px;

  border: none;
  padding: 0;
  background: transparent;
  cursor: pointer;

  display: flex;
  justify-content: center;
  align-items: center;
`;

const BackIcon = styled.img`
  width: 40px;
  height: 40px;
`;

const Header = styled.div`
  height: 40px;

  display: flex;
  justify-content: center;
  align-items: center;
`;

const Title = styled.h1`
  margin: 0;

  color: #4A3A2F;
  font-family: Jua;
  font-size: 40px;
  font-weight: 400;
`;

const ProgressWrapper = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 14px;
`;

const Progress = styled.div`
  flex: 1;
  height: 6px;
  border-radius: 999px;
  background: ${({ active }) => (active ? '#DBE4A1' : '#DBE4A1')};
`;

const ProgressText = styled.p`
  margin: 8px 0 0;

  text-align: center;

  color: #A79C8E;
  font-family: "Noto Sans KR";
  font-size: 16px;
`;

const Section = styled.section`
  flex: 1;
  margin-top: 20px;

  display: flex;
  flex-direction: column;
  min-height: 0;
`;

const SectionTitleWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Heart = styled.img`
  width: 32px;
  height: 32px;
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

const SectionDesc = styled.p`
  margin: 0 0 0;
  color: #A79C8E;
  font-family: "Noto Sans KR";
  font-size: 18px;
`;

const ScrollArea = styled.div`
  flex: 1;
  overflow-y: auto;
  min-height: 0;

  margin-top: 22px;

  display: flex;
  flex-direction: column;
  gap: 16px;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const Card = styled.div`
  padding: 18px;

  border-radius: 18px;
  border: 1.3px solid rgba(74,58,47,.4);
  background: rgba(255,255,255,.55);
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 12px;
`;

const TitleWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Icon = styled.img`
  width: 24px;
  height: 24px;
  flex-shrink: 0;
`;

const ClockIcon = styled.img`
  width: 22px;
  height: 22px;
  flex-shrink: 0;
`;

const CardTitle = styled.h3`
  margin: 0;

  color: #4A3A2F;
  font-family: "Noto Sans KR";
  font-size: 16px;
  font-weight: 700;
`;

const CardDescBox = styled.div`
  margin-top: 12px;
  padding: 12px 14px;

  border-radius: 12px;
  background: rgba(219,228,161,.25);

  color: #4A3A2F;
  font-family: "Noto Sans KR";
  font-size: 13px;
  line-height: 1.45;
`;

// 브라우저 기본 <input type="time"> 대신 앱 톤에 맞춘 모달을 띄우는 버튼.
const TimeButton = styled.button`
  width: 100%;
  height: 50px;

  margin-top: 12px;
  padding: 0 16px;

  box-sizing: border-box;

  border-radius: 14px;
  border: 1.3px solid rgba(74,58,47,.4);
  background: rgba(255,255,255,.8);

  color: #4A3A2F;
  font-family: "Noto Sans KR";
  font-size: 16px;
  font-weight: 700;

  text-align: left;
  cursor: pointer;
`;

const MedicineHeader = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
`;

const MedicineText = styled.p`
  margin: 12px 8px 0;

  text-align: left;

  color: #4A3A2F;
  font-family: "Noto Sans KR";
  font-size: 14px;
  font-weight: 700;
`;

const MedicineItem = styled.div`
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
  }
`;
const StartButton = styled.button`
  width: 100%;
  height: 56px;

  margin-top: 16px;
  flex-shrink: 0;

  border-radius: 16px;
  border: 1.5px solid rgba(74,58,47,.55);
  background: #CBD879;
color: #4A3A2F;
text-align: center;
font-family: Jua;
font-size: 18px;
font-style: normal;
font-weight: 400;
line-height: normal;
`;