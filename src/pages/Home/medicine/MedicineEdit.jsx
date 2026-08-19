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

const Label = styled.p`
  margin: 20px 0 6px;
  font-size: 14px;
  color: #6b6661;
`;

const Input = styled.input`
  width: 100%;
  height: 50px;
  padding: 0 14px;
  border-radius: 10px;
  border: 1.3px solid rgba(74,58,47,.4);
  font-size: 16px;
  color: #000;
`;

const ChipRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const Chip = styled.button`
  padding: 8px 14px;
  border-radius: 20px;
  border: 1px solid ${({ $active }) => ($active ? 'transparent' : '#e5e0d9')};
  background: ${({ $active }) => ($active ? '#fae5d9' : '#fff')};
  color: ${({ $active }) => ($active ? '#e8734a' : '#000')};
  font-size: 15px;
`;

const CustomTimeRow = styled.div`
  display: flex;
  gap: 6px;
`;

const Select = styled.select`
  flex: 1;
  height: 50px;
  padding: 0 10px;
  border-radius: 10px;
  border: 1.3px solid rgba(74,58,47,.4);
  font-size: 15px;
  color: #000;
  background: #FFF8ED;
`;

const AddTimeButton = styled.button`
  width: 50px;
  height: 50px;
  border-radius: 10px;
  border: 1.3px solid rgba(74,58,47,.4);
  font-size: 18px;
  font-weight: 500;
`;

// '매일'을 먼저 두고, 그 아래에 요일을 따로 고를 수 있게 한다.
const DailyToggle = styled.button`
  width: 100%;
  height: 50px;
  border-radius: 12px;

  border: 2px solid ${({ $on }) => ($on ? 'rgba(143, 174, 74, 0.7)' : 'rgba(74, 58, 47, 0.3)')};
  background: ${({ $on }) => ($on ? '#edf2d4' : '#fffdf6')};
  color: ${({ $on }) => ($on ? '#5b7a2e' : '#8c8172')};

  font-size: 16px;
  font-weight: 700;
`;

const DayRow = styled.div`
  margin-top: 10px;
  display: flex;
  gap: 6px;
`;

const DayChip = styled.button`
  flex: 1;
  min-width: 0;
  height: 46px;
  border-radius: 12px;

  border: 1.5px solid ${({ $on }) => ($on ? 'rgba(232, 205, 115, 0.9)' : 'rgba(74, 58, 47, 0.25)')};
  background: ${({ $on }) => ($on ? '#f8eed2' : '#fffdf6')};
  color: ${({ $on }) => ($on ? '#a8761c' : '#a79c8e')};

  font-size: 15px;
  font-weight: 700;
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
`;

// 저장하기만 화면 아래에 고정한다. 삭제는 되돌릴 수 없어서 목록 끝까지
// 내려야 닿도록 스크롤 영역 안에 남겨둔다.
//
// 연두 배경에 흰 글자라 글씨가 배경에 묻혀 있었다. 다른 화면의 주요 버튼과 같은
// 진한 글자·테두리로 맞추고, 커서를 올리면 한 단계 진해지게 한다.
const SaveButton = styled.button`
  width: 100%;
  height: 54px;
  border-radius: 14px;
  border: 1.5px solid rgba(74, 58, 47, 0.55);
  background: #dbe4a1;
  color: #4a3a2f;
  font-family: Jua;
  font-size: 20px;
  cursor: pointer;
  transition: background 0.15s ease, transform 0.1s ease;

  &:hover:not(:disabled) {
    background: #cbd879;
  }

  &:active:not(:disabled) {
    background: #c2d16b;
    transform: translateY(1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`;

const DeleteButton = styled.button`
  width: 100%;
  height: 50px;
  margin-top: 28px;
  border-radius: 12px;
  border: 1.3px solid rgba(74,58,47,.4);
  color: #cc4d4d;
  font-size: 15px;
  font-weight: 500;
`;

const PRESET_TIMES = ['오전 8:00', '오후 12:00', '오후 6:00', '오후 10:00'];
const ALL_DAY_VALUES = DAY_OPTIONS.map((day) => day.value);

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

  const toggleTime = (time) => {
    setTimes((prev) => (prev.includes(time) ? prev.filter((t) => t !== time) : [...prev, time]));
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
        <PageDivider />

        <PageScrollArea>
          <Label>약 이름</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />

          <Label>복용 시간을 골라주세요 (여러 개 가능)</Label>
          <ChipRow>
            {[...new Set([...PRESET_TIMES, ...times])].map((time) => (
              <Chip key={time} type="button" $active={times.includes(time)} onClick={() => toggleTime(time)}>
                {time}
              </Chip>
            ))}
          </ChipRow>

          <Label>직접 시간 정하기</Label>
          <CustomTimeRow>
            <Select value={period} onChange={(e) => setPeriod(e.target.value)}>
              <option value="오전">오전</option>
              <option value="오후">오후</option>
            </Select>
            <Select value={hour} onChange={(e) => setHour(e.target.value)}>
              <option value="">시</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </Select>
            <Select value={minute} onChange={(e) => setMinute(e.target.value)}>
              <option value="">분</option>
              {['00', '10', '20', '30', '40', '50'].map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </Select>
            <AddTimeButton type="button" onClick={handleAddManualTime}>
              +
            </AddTimeButton>
          </CustomTimeRow>

          <Label>무슨 요일에 드시나요?</Label>
          <DailyToggle
            type="button"
            $on={isEveryDay(days)}
            onClick={() => setDays(isEveryDay(days) ? [] : ALL_DAY_VALUES)}
          >
            매일 먹어요
          </DailyToggle>
          <DayRow>
            {DAY_OPTIONS.map((day) => (
              <DayChip
                key={day.value}
                type="button"
                $on={days.includes(day.value)}
                onClick={() => toggleDay(day.value)}
              >
                {day.label}
              </DayChip>
            ))}
          </DayRow>
          {days.length === 0 && <HelpText>드시는 요일을 하나 이상 골라주세요.</HelpText>}

          <DeleteButton type="button" onClick={handleDelete}>
            삭제하기
          </DeleteButton>
        </PageScrollArea>

        <PageFooter>
          <SaveButton
            type="button"
            onClick={handleSave}
            disabled={!name.trim() || finalTimes.length === 0 || days.length === 0}
          >
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
