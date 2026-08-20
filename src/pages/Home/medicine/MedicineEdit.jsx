import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { getMedications, updateMedication, deleteMedication } from '../../../api/medication';
import { useApi, useApiAction } from '../../../hooks/useApi';
import {
  toMedicationView,
  toMedicationRequest,
  DAY_OPTIONS,
  isEveryDay,
  isValidTime,
  isDuplicateName,
  sortTimeLabels,
  toTimeLabel,
  includesTime,
} from '../../../utils/medication';
import {
  PopupBackdrop,
  PopupCard,
  PopupInnerBorder,
  PopupTitle,
  PopupPrimaryButton,
} from '../../../components/PopupShell';
import {
  PageFrame,
  PageContent,
  PageBack,
  PageHeader,
  PageTitle,
  PageDivider,
  PageScrollArea,
  PageFooter,
} from '../../../components/PageShell';

// '약 추가하기'(AddMedication)와 같은 카드 디자인을 쓴다. 같은 항목을 고르는
// 화면인데 모양이 다르면 다른 기능처럼 보인다.
const PRESET_TIMES = ['오전 8:00', '오후 12:00', '오후 6:00', '오후 10:00'];
const ALL_DAY_VALUES = DAY_OPTIONS.map((day) => day.value);

const InputGroup = styled.div`
  padding: 16px;
  border-radius: 18px;
  border: 1.3px solid rgba(74,58,47,.35);
  background: rgba(255,255,255,.55);

  &:last-child {
    padding-bottom: 16px;
  }
`;

const Label = styled.p`
  margin: 0 0 16px;
  color: #4a3a2f;
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 16px;
  font-weight: 700;
`;

const Input = styled.input`
  width: 100%;
  height: 48px;
  padding: 0 18px;
  box-sizing: border-box;
  border-radius: 16px;
  border: 1.3px solid rgba(74, 58, 47, 0.35);
  background: rgba(255, 255, 255, 0.75);
  color: #4a3a2f;
  font-size: 18px;

  &::placeholder {
    color: #b7ac9f;
  }
`;

const TimeWrap = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const TimeButton = styled.button`
  height: 44px;
  padding: 0 18px;
  border-radius: 22px;
  border: 1.3px
    ${({ $active }) => ($active ? 'solid #8A7B3E' : 'dashed rgba(74,58,47,.35)')};
  background: ${({ $active }) => ($active ? '#F6EBC7' : 'rgba(255, 255, 255, 0.60)')};
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
`;

const PeriodSelect = styled.select`
  width: 90px;
  height: 44px;
  padding: 0 12px;
  border-radius: 14px;
  border: 1.3px solid rgba(74,58,47,.4);
  background: rgba(255,255,255,.8);
  color: #4A3A2F;
  font-size: 16px;
  appearance: none;
  -webkit-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%234A3A2F' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  cursor: pointer;
`;

const ManualRow = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const SmallInput = styled.input`
  display: flex;
  width: 90px;
  height: 44px;
  padding: 0 12px;
  box-sizing: border-box;
  text-align: center;
  border-radius: 14px;
  border: 1.3px solid rgba(74, 58, 47, 0.40);
  background: rgba(255, 255, 255, 0.80);
  color: #4a3a2f;
  font-size: 16px;

  &::placeholder {
    color: #b7ac9f;
  }
`;

const AddTimeButton = styled.button`
  width: 46px;
  height: 46px;
  min-width: 46px;
  min-height: 46px;
  flex-shrink: 0;

  padding: 0;
  box-sizing: border-box;
  border-radius: 50%;
  border: 1.3px solid rgba(138, 123, 62, 0.9);
  background: #DDD39A;

  color: #4A3A2F;
  font-size: 28px;
  font-weight: 700;
  line-height: 1;

  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  & > span, & {
    padding-bottom: 2px;
  }
`;

const CustomTimeWrap = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
`;

const CustomTimeChip = styled.span`
  display: inline-flex;
  align-items: center;
  height: 38px;
  padding: 0 14px;
  border-radius: 19px;
  border: 1.3px solid #8A7B3E;
  background: #F6EBC7;
  color: #4A3A2F;
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 14px;
  font-weight: 700;
`;

const RemoveIcon = styled.button`
  margin-left: 6px;
  padding: 0;
  border: none;
  background: transparent;
  color: #4A3A2F;
  font-size: 16px;
  font-weight: 700;
  line-height: 1;
  cursor: pointer;
`;

const RepeatWrap = styled.div`
  display: grid;
  grid-template-columns: 52px repeat(7, 36px);
  justify-content: space-between;
  align-items: center;
`;

const RepeatChip = styled.button`
  width: ${({ children }) => (children === '매일' ? '52px' : '36px')};
  height: 36px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 18px;
  border: 1.2px
    ${({ $active }) => ($active ? 'solid rgba(74,58,47,.55)' : 'dashed rgba(74,58,47,.55)')};
  background: ${({ $active }) => ($active ? '#F6EBC7' : 'rgba(255, 255, 255, 0.60)')};
  color: #4A3A2F;
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 14px;
  font-weight: 700;
  white-space: nowrap;
  padding: 0;
  cursor: pointer;
`;

const HelpText = styled.p`
  margin: 8px 0 0;
  font-size: 13px;
  color: #8c8780;
`;

const BlockedText = styled.p`
  margin: 0;
  width: 100%;
  text-align: center;
  color: #6b6661;
  font-family: 'Noto Sans KR';
  font-size: 16px;
  line-height: 1.5;
  word-break: keep-all;
`;

const SaveButton = styled.button`
  width: 100%;
  height: 56px;
  border-radius: 16px;
  border: 1.5px solid rgba(74, 58, 47, 0.55);
  background: #CBD879;
  color: #4A3A2F;
  font-family: Jua, sans-serif;
  font-size: 18px;
  cursor: pointer;
  transition: background 0.15s ease, transform 0.1s ease;

  &:hover:not(:disabled) {
    background: #c2d16b;
  }

  &:active:not(:disabled) {
    background: #b6c65c;
    transform: translateY(1px);
  }
`;

// 지우기는 되돌릴 수 없어서, 저장하기와 헷갈리지 않도록 옅은 테두리만 둔다.
const DeleteButton = styled.button`
  width: 100%;
  height: 48px;
  margin-top: 4px;
  border-radius: 16px;
  border: 1.3px solid rgba(74, 58, 47, 0.35);
  background: rgba(255, 255, 255, 0.6);
  color: #cc4d4d;
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
`;

function MedicineEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  // 단건 조회 API가 없어서 목록을 받아 해당 약만 골라 쓴다.
  const { data, loading } = useApi(getMedications);
  const { execute: saveMedication } = useApiAction(updateMedication);
  const { execute: removeMedication } = useApiAction(deleteMedication);

  const medication = (data ?? []).map(toMedicationView).find((med) => String(med.id) === id);

  const [name, setName] = useState('');
  const [times, setTimes] = useState([]);
  const [days, setDays] = useState(ALL_DAY_VALUES);
  // 서버가 수정을 못 받을 때 띄우는 안내
  const [saveBlocked, setSaveBlocked] = useState(false);
  // 입력값이 잘못됐을 때 알려주는 문구 (시간 형식, 이름 중복 등)
  const [missing, setMissing] = useState(null);
  // 이미 골라둔 시각을 또 넣으려 할 때 알려줄 시각
  const [duplicateTime, setDuplicateTime] = useState(null);
  const [period, setPeriod] = useState('오전');
  const [hour, setHour] = useState('');
  const [minute, setMinute] = useState('');

  // 목록이 도착한 뒤에야 초기값을 알 수 있어서 입력 상태를 한 번 채워준다.
  // medication은 매 렌더 새로 만들어지는 객체라, 이미 채운 약인지 id로 확인한다.
  const initializedIdRef = useRef(null);
  useEffect(() => {
    if (!medication || initializedIdRef.current === medication.id) return;
    initializedIdRef.current = medication.id;
    setName(medication.name);
    setTimes(medication.times);
    // 요일이 비어 있으면(옛 데이터) 매일로 본다
    setDays(medication.days.length > 0 ? medication.days : ALL_DAY_VALUES);
  }, [medication]);

  if (loading) {
    return (
      <PageFrame>
        <PageContent>
          <Label>불러오는 중이에요...</Label>
        </PageContent>
      </PageFrame>
    );
  }

  if (!medication) {
    return (
      <PageFrame>
        <PageContent>
          <PageBack onClick={() => navigate('/home/medicine')} />
          <PageHeader>
            <PageTitle>약 정보 수정</PageTitle>
          </PageHeader>
          <PageDivider />
          <Label>이미 삭제된 약이에요.</Label>
        </PageContent>
      </PageFrame>
    );
  }

  const customTimes = times.filter((t) => !PRESET_TIMES.includes(t));

  const toggleTime = (time) => {
    setTimes((prev) => (prev.includes(time) ? prev.filter((t) => t !== time) : [...prev, time]));
  };

  const removeCustomTime = (timeToRemove) => {
    setTimes((prev) => prev.filter((t) => t !== timeToRemove));
  };

  const handleAddManualTime = () => {
    if (!hour.trim() || !minute.trim()) return;
    // 12시 89분 같은 값이 들어오면 서버가 못 알아듣는 시각이 만들어진다.
    if (!isValidTime(hour, minute)) {
      setMissing('시간을 다시 확인해주세요 (시 1~12, 분 0~59)');
      return;
    }

    // 표기를 목록과 같은 규칙으로 굳힌다. 예전에는 '오전 08:00'처럼 시에 0을 붙여
    // 만들어서, 미리 준비된 '오전 8:00'과 다른 것으로 잡혔다. 그래서 같은 시각이
    // 두 번 들어가고, 저장하면 목록에 '오전 8:00'이 두 개씩 보였다.
    const label = toTimeLabel(period, hour, minute);

    if (includesTime(times, label)) {
      setDuplicateTime(label);
      return;
    }

    setTimes((prev) => sortTimeLabels([...prev, label]));
    setHour('');
    setMinute('');
  };

  const handleHourChange = (e) => setHour(e.target.value.replace(/[^0-9]/g, ''));
  const handleMinuteChange = (e) => setMinute(e.target.value.replace(/[^0-9]/g, ''));

  const toggleDay = (value) =>
    setDays((prev) =>
      prev.includes(value) ? prev.filter((day) => day !== value) : [...prev, value],
    );

  // 시·분을 적어두고 '+'를 안 누른 채 저장하면 그 시간이 그냥 사라졌다.
  // 적어둔 값이 멀쩡하면 저장할 때 함께 담고, 저장 버튼도 이 값을 기준으로 켠다.
  const pendingTime = isValidTime(hour, minute) ? toTimeLabel(period, hour, minute) : null;
  const finalTimes =
    pendingTime && !includesTime(times, pendingTime)
      ? sortTimeLabels([...times, pendingTime])
      : times;

  const handleSave = async () => {
    // 예전에는 조건에 안 맞으면 아무 반응 없이 끝나서, 왜 저장이 안 되는지 알 수 없었다.
    if (!name.trim()) {
      setMissing('약 이름을 적어주세요');
      return;
    }
    if (finalTimes.length === 0) {
      setMissing('복용하는 시간을 하나 이상 골라주세요');
      return;
    }
    if (days.length === 0) {
      setMissing('드시는 요일을 하나 이상 골라주세요');
      return;
    }

    // 이름이 겹치면 복약 화면에서 어느 약을 체크한 건지 구분할 수 없다.
    // 지금 고치는 약 자신은 제외하고 본다.
    const otherNames = (data ?? []).map(toMedicationView).map((med) => med.name);
    if (isDuplicateName(name, otherNames, medication.name)) {
      setMissing('같은 이름의 약이 이미 있어요');
      return;
    }

    const { ok } = await saveMedication(
      medication.id,
      toMedicationRequest({ name, times: finalTimes, days }),
    );
    if (ok) {
      navigate('/home/medicine');
      return;
    }

    // 서버가 '복약 기록이 있는 약'의 수정을 아직 못 받는다(500).
    // 에러 문구를 그대로 보여주면 무슨 뜻인지 알 수 없어서 할 수 있는 방법을 알려준다.
    setSaveBlocked(true);
  };

  const handleDelete = async () => {
    const { ok, error } = await removeMedication(medication.id);
    if (ok) {
      navigate('/home/medicine');
      return;
    }
    alert(error.message);
  };

  return (
    <PageFrame>
      <PageContent>
        <PageBack onClick={() => navigate('/home/medicine')} />
        <PageHeader>
          <PageTitle>약 정보 수정</PageTitle>
        </PageHeader>

        <PageScrollArea $gap={16}>
          <InputGroup>
            <Label>약 이름</Label>
            <Input placeholder="예: 혈압약" value={name} onChange={(e) => setName(e.target.value)} />
          </InputGroup>

          <InputGroup>
            <Label>복용하는 시간을 골라주세요 (복수 선택 가능)</Label>
            <TimeWrap>
              {PRESET_TIMES.map((time) => (
                <TimeButton
                  key={time}
                  type="button"
                  $active={times.includes(time)}
                  onClick={() => toggleTime(time)}
                >
                  {time}
                </TimeButton>
              ))}
            </TimeWrap>

            <Label style={{ marginTop: 16 }}>직접 시간 정하기</Label>
            <ManualRow>
              <PeriodSelect value={period} onChange={(e) => setPeriod(e.target.value)}>
                <option value="오전">오전</option>
                <option value="오후">오후</option>
              </PeriodSelect>

              <SmallInput
                type="text"
                inputMode="numeric"
                maxLength={2}
                placeholder="시"
                value={hour}
                onChange={handleHourChange}
              />

              <SmallInput
                type="text"
                inputMode="numeric"
                maxLength={2}
                placeholder="분"
                value={minute}
                onChange={handleMinuteChange}
              />

              <AddTimeButton type="button" onClick={handleAddManualTime}>
                +
              </AddTimeButton>
            </ManualRow>

            {customTimes.length > 0 && (
              <CustomTimeWrap>
                {customTimes.map((time) => (
                  <CustomTimeChip key={time}>
                    {time}
                    <RemoveIcon type="button" onClick={() => removeCustomTime(time)}>
                      ×
                    </RemoveIcon>
                  </CustomTimeChip>
                ))}
              </CustomTimeWrap>
            )}
          </InputGroup>

          <InputGroup>
            <Label>무슨 요일에 드시나요?</Label>
            <RepeatWrap>
              <RepeatChip
                type="button"
                $active={isEveryDay(days)}
                onClick={() => setDays(isEveryDay(days) ? [] : ALL_DAY_VALUES)}
              >
                매일
              </RepeatChip>
              {DAY_OPTIONS.map((day) => (
                <RepeatChip
                  key={day.value}
                  type="button"
                  $active={days.includes(day.value)}
                  onClick={() => toggleDay(day.value)}
                >
                  {day.label}
                </RepeatChip>
              ))}
            </RepeatWrap>
            {days.length === 0 && <HelpText>드시는 요일을 하나 이상 골라주세요.</HelpText>}
          </InputGroup>

          <DeleteButton type="button" onClick={handleDelete}>
            삭제하기
          </DeleteButton>
        </PageScrollArea>

        <PageFooter>
          {/* 버튼을 끄지 않는다. :disabled 겉모습이 켜졌을 때와 같아서,
              눌리지 않는 건지 저장이 실패한 건지 구분할 수 없었다.
              늘 누를 수 있게 두고, 빠진 것이 있으면 눌렀을 때 알려준다. */}
          <SaveButton type="button" onClick={handleSave}>
            저장하기
          </SaveButton>
        </PageFooter>
      </PageContent>

      {missing && (
        <PopupBackdrop onClick={() => setMissing(null)}>
          <PopupCard $center $gap={16} $padTop={36} onClick={(event) => event.stopPropagation()}>
            <PopupInnerBorder />
            <PopupTitle $center $size={22}>
              다시 확인해주세요
            </PopupTitle>
            <BlockedText>{missing}</BlockedText>
            <PopupPrimaryButton type="button" onClick={() => setMissing(null)}>
              알겠어요
            </PopupPrimaryButton>
          </PopupCard>
        </PopupBackdrop>
      )}

      {duplicateTime && (
        <PopupBackdrop onClick={() => setDuplicateTime(null)}>
          <PopupCard $center $gap={16} $padTop={36} onClick={(event) => event.stopPropagation()}>
            <PopupInnerBorder />
            <PopupTitle $center $size={22}>
              이미 넣은 시간이에요
            </PopupTitle>
            <BlockedText>
              {duplicateTime}
              <br />
              같은 시간을 두 번 넣을 수는 없어요.
            </BlockedText>
            <PopupPrimaryButton type="button" onClick={() => setDuplicateTime(null)}>
              알겠어요
            </PopupPrimaryButton>
          </PopupCard>
        </PopupBackdrop>
      )}

      {saveBlocked && (
        <PopupBackdrop onClick={() => setSaveBlocked(false)}>
          <PopupCard $center $gap={16} $padTop={36} onClick={(event) => event.stopPropagation()}>
            <PopupInnerBorder />
            <PopupTitle $center $size={22}>
              지금은 수정할 수 없어요
            </PopupTitle>
            <BlockedText>
              이미 복약을 체크한 약은 아직 고칠 수 없어요.
              <br />
              약을 지우고 다시 등록해주세요.
            </BlockedText>
            <PopupPrimaryButton type="button" onClick={() => setSaveBlocked(false)}>
              알겠어요
            </PopupPrimaryButton>
          </PopupCard>
        </PopupBackdrop>
      )}
    </PageFrame>
  );
}

export default MedicineEdit;
