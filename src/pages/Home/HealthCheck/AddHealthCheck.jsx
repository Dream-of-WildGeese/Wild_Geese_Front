import React, { useState } from 'react';
import styled from 'styled-components';
import DatePickerModal from '../../../components/DatePickerModal';
import { useApiAction } from '../../../hooks/useApi';
import { createCheckup, updateCheckup } from '../../../api/checkup';
import {
  PopupBackdrop,
  PopupCard,
  PopupInnerBorder,
  PopupTitle,
  PopupPrimaryButton,
  PopupClose,
} from '../../../components/PopupShell';

const formatDateLabel = (value) => {
  const [year, month, day] = String(value).split('-').map(Number);
  return `${year}년 ${month}월 ${day}일`;
};

// 💡 선택한 날짜가 과거인지 확인하는 헬퍼 함수
const checkIsPastDate = (dateStr) => {
  if (!dateStr) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [y, m, d] = dateStr.split('-').map(Number);
  const targetDate = new Date(y, m - 1, d);
  return targetDate < today;
};

const HEALTH_CHECK_TYPES = [
  '일반검진',
  '암검진',
  '치과검진',
  '안과검진',
  '이비인후과',
  '직접 입력',
];

// 백엔드 reminderDaysBefore 숫자와 UI 라벨 매핑
const ALERT_OPTIONS = [
  { label: '3일 전', value: 3 },
  { label: '1일 전', value: 1 },
  { label: '당일 알림', value: 0 },
];

const AddHealthCheck = ({ onClose, onSuccess, editing = null }) => {
  const isCustomType = Boolean(editing) && !HEALTH_CHECK_TYPES.includes(editing.checkupType);
  const [checkType, setCheckType] = useState(
    editing ? (isCustomType ? '직접 입력' : editing.checkupType) : '',
  );
  const [customTypeInput, setCustomTypeInput] = useState('');
  const [customTypes, setCustomTypes] = useState(
    isCustomType ? editing.checkupType.split(',').map((item) => item.trim()) : [],
  );
  const [date, setDate] = useState(editing?.checkupDate ?? '');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [hospital, setHospital] = useState(editing?.hospitalName ?? '');

  const [reminderDays, setReminderDays] = useState(
    editing && editing.reminderDaysBefore !== undefined && editing.reminderDaysBefore !== null
      ? editing.reminderDaysBefore
      : 3,
  );

  const { execute: addCheckup, loading: creating } = useApiAction(createCheckup);
  const { execute: editCheckup, loading: updating } = useApiAction(updateCheckup);

  const isPast = checkIsPastDate(date);

  const handleTypeChange = (type) => {
    setCheckType(type);
    if (type !== '직접 입력') {
      setCustomTypeInput('');
      setCustomTypes([]);
    }
  };

  const addCustomType = () => {
    const value = customTypeInput.trim();
    if (!value || customTypes.includes(value)) return;
    setCustomTypes((prev) => [...prev, value]);
    setCustomTypeInput('');
  };

  const removeCustomType = (target) => {
    setCustomTypes((prev) => prev.filter((item) => item !== target));
  };

  const [missing, setMissing] = useState(null);
  const [saveError, setSaveError] = useState(null);

  const handleSave = async () => {
    const finalType =
      checkType === '직접 입력'
        ? (customTypes.length > 0 ? customTypes.join(', ') : customTypeInput.trim())
        : checkType;

    if (!finalType) return setMissing('검진 종류를 골라주세요');
    if (!date) return setMissing('날짜를 골라주세요');
    if (!hospital.trim()) return setMissing('병원 이름을 적어주세요');

    // 💡 과거 날짜인 경우 알림을 0으로 안전하게 기본 세팅하여 전달
    const body = {
      checkupDate: date,
      checkupType: finalType,
      hospitalName: hospital.trim(),
      reminderDaysBefore: isPast ? 0 : Number(reminderDays),
    };

    const { ok, error } = editing
      ? await editCheckup(editing.checkupId, body)
      : await addCheckup(body);

    if (!ok) {
      setSaveError(error);
      return;
    }

    onSuccess?.();
  };

  return (
    <Overlay onClick={onClose}>
      <Modal
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-health-check-title"
        onClick={(event) => event.stopPropagation()}
      >
        <ModalInner>
          <PopupClose type="button" aria-label="닫기" onClick={onClose}>
            ✕
          </PopupClose>

          <HeaderTitle id="add-health-check-title">
            {editing ? '검진 일정 수정하기' : '검진 일정 추가하기'}
          </HeaderTitle>

          {/* 1. 검진 종류 선택 */}
          <FormSection>
            <Label>검진 종류를 골라주세요</Label>

            <TypeWrap>
              {HEALTH_CHECK_TYPES.map((type) => (
                <TypeChip
                  key={type}
                  type="button"
                  $active={checkType === type}
                  onClick={() => handleTypeChange(type)}
                >
                  {type}
                </TypeChip>
              ))}
            </TypeWrap>

            {checkType === '직접 입력' && (
              <>
                <AddTypeRow>
                  <TypeInput
                    type="text"
                    placeholder="예: 유방암 초음파, 위내시경 등"
                    value={customTypeInput}
                    onChange={(event) =>
                      setCustomTypeInput(event.target.value)
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addCustomType();
                      }
                    }}
                  />
                  <AddTypeButton type="button" onClick={addCustomType}>
                    +
                  </AddTypeButton>
                </AddTypeRow>

                {customTypes.length > 0 && (
                  <TypeWrap style={{ marginTop: '10px' }}>
                    {customTypes.map((type) => (
                      <CustomChip key={type}>
                        {type}
                        <RemoveTypeIcon
                          type="button"
                          onClick={() => removeCustomType(type)}
                        >
                          ×
                        </RemoveTypeIcon>
                      </CustomChip>
                    ))}
                  </TypeWrap>
                )}

                <FieldHint>
                  "직접 입력"을 고르신 경우에만 적어주세요
                </FieldHint>
              </>
            )}
          </FormSection>

          {/* 2. 날짜 선택 */}
          <FormSection>
            <Label>날짜를 선택해주세요</Label>

            <DateSelectButton
              type="button"
              onClick={() => setIsDatePickerOpen(true)}
            >
              <span>
                {date ? formatDateLabel(date) : '날짜를 선택해주세요'}
              </span>
              <ChevronIcon viewBox="0 0 24 24">
                <polyline points="6 9 12 15 18 9" />
              </ChevronIcon>
            </DateSelectButton>
          </FormSection>

          {/* 3. 병원 이름 입력 */}
          <FormSection>
            <Label>병원 이름을 입력해주세요</Label>

            <Input
              type="text"
              placeholder="예: 온담 종합병원"
              value={hospital}
              onChange={(event) => setHospital(event.target.value)}
            />
          </FormSection>

          {/* 4. 알림 주기 선택 ( 과거 날짜가 아닐 때만 노출) */}
          {!isPast && (
            <FormSection>
              <Label>언제 알려드릴까요?</Label>

              <AlertWrap>
                {ALERT_OPTIONS.map((option) => (
                  <AlertChip
                    key={option.value}
                    type="button"
                    $active={reminderDays === option.value}
                    onClick={() => setReminderDays(option.value)}
                  >
                    {option.label}
                  </AlertChip>
                ))}
              </AlertWrap>
            </FormSection>
          )}

          {/* 하단 저장 버튼 */}
          <SaveButton
            type="button"
            onClick={handleSave}
            disabled={creating || updating}
          >
            {creating || updating ? '저장 중...' : '저장하기'}
          </SaveButton>
        </ModalInner>
      </Modal>

      {isDatePickerOpen && (
        <DatePickerModal
          value={date}
          title="검진 날짜 선택"
          onConfirm={(nextDate) => {
            setDate(nextDate);
            setIsDatePickerOpen(false);
          }}
          onClose={() => setIsDatePickerOpen(false)}
        />
      )}

      {(missing || saveError) && (
        <PopupBackdrop
          onClick={() => {
            setMissing(null);
            setSaveError(null);
          }}
        >
          <PopupCard $center $gap={16} $padTop={36} onClick={(event) => event.stopPropagation()}>
            <PopupInnerBorder />
            <PopupTitle $center $size={22}>
              {missing ? '아직 안 고른 게 있어요' : '등록하지 못했어요'}
            </PopupTitle>
            <NoticeText>{missing ?? saveError.message}</NoticeText>
            <PopupPrimaryButton
              type="button"
              onClick={() => {
                setMissing(null);
                setSaveError(null);
              }}
            >
              알겠어요
            </PopupPrimaryButton>
          </PopupCard>
        </PopupBackdrop>
      )}
    </Overlay>
  );
};

export default AddHealthCheck;

/* =========================
   Styles
========================= */

const NoticeText = styled.p`
  margin: 0;
  width: 100%;
  text-align: center;
  color: #6b6661;
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 16px;
  line-height: 1.5;
  word-break: keep-all;
`;

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 14px;
  box-sizing: border-box;
  background: rgba(38, 34, 30, 0.52);
`;

const Modal = styled.div`
  width: 100%;
  max-width: 390px;
  max-height: calc(100% - 12px);
  padding: 8px;
  box-sizing: border-box;
  border-radius: 10px;
  border: 3px solid rgba(108, 67, 23, 0.70);
  background: #FEF3D5;
  box-shadow: 0 10px 40px rgba(74, 58, 47, 0.2);
  overflow: hidden;
  display: flex;
`;

const ModalInner = styled.div`
  width: 100%;
  max-height: calc(100vh - 48px);
  padding: 20px 16px 18px;
  box-sizing: border-box;
  border-radius: 10px;
  border: 3px dashed rgba(108, 67, 23, 0.70);
  background: #FEF3D5;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const HeaderTitle = styled.h1`
  margin: 0 0 6px;
  color: #4A3A2F;
  text-align: center;
  font-family: "Noto Sans KR";
  font-size: 26px;
  font-weight: 700;
`;

const FormSection = styled.div`
  padding: 16px 14px;
  box-sizing: border-box;
  border: 1.3px solid rgba(74, 58, 47, 0.35);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.55);
`;

const Label = styled.p`
  margin: 0 0 12px;
  color: #4A3A2F;
  font-family: "Noto Sans KR";
  font-size: 15px;
  font-weight: 700;
`;

const TypeWrap = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const TypeChip = styled.button`
  height: 38px;
  padding: 0 16px;
  box-sizing: border-box;
  border-radius: 20px;
  border: 1.3px
    ${({ $active }) =>
      $active ? 'solid rgba(74, 58, 47, 0.65)' : 'dashed rgba(74, 58, 47, 0.4)'};
  background: ${({ $active }) =>
    $active ? '#DDD39A' : 'rgba(255, 255, 255, 0.8)'};
  color: #4A3A2F;
  font-family: "Noto Sans KR";
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
`;

const CustomChip = styled.span`
  display: inline-flex;
  align-items: center;
  height: 34px;
  padding: 0 12px;
  border-radius: 17px;
  border: 1.2px solid #8A7B3E;
  background: #DDD39A;
  color: #4A3A2F;
  font-family: 'Noto Sans KR';
  font-size: 13px;
  font-weight: 700;
`;

const RemoveTypeIcon = styled.button`
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

const Input = styled.input`
  width: 100%;
  height: 46px;
  padding: 0 14px;
  box-sizing: border-box;
  border: 1.3px solid rgba(74, 58, 47, 0.35);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.85);
  color: #4A3A2F;
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 14px;
  outline: none;

  &::placeholder {
    color: #A79C8E;
  }

  &:focus {
    border-color: #8A7B3E;
  }
`;

const DateSelectButton = styled.button`
  width: 100%;
  height: 46px;
  padding: 0 14px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1.3px solid rgba(74, 58, 47, 0.35);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.85);
  color: ${({ children }) =>
    String(children).includes('선택해주세요') ? '#A79C8E' : '#4A3A2F'};
  font-family: 'Noto Sans KR';
  font-size: 14px;
  cursor: pointer;
`;

const ChevronIcon = styled.svg`
  width: 16px;
  height: 16px;
  fill: none;
  stroke: #8C8780;
  stroke-width: 2;
`;

const AddTypeRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
`;

const TypeInput = styled(Input)`
  flex: 1;
  margin-top: 0;
`;

const AddTypeButton = styled.button`
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  border: 1.3px solid rgba(138, 123, 62, 0.9);
  background: #DDD39A;
  color: #4A3A2F;
  font-size: 24px;
  font-weight: 700;
  cursor: pointer;
`;

const FieldHint = styled.p`
  margin: 8px 0 0;
  color: #8C8780;
  font-family: 'Noto Sans KR';
  font-size: 11px;
  line-height: 1.4;
`;

const AlertWrap = styled.div`
  display: flex;
  gap: 8px;
`;

const AlertChip = styled.button`
  flex: 1;
  height: 40px;
  padding: 0 4px;
  border: 1.3px
    ${({ $active }) =>
      $active ? 'solid rgba(74, 58, 47, 0.65)' : 'dashed rgba(74, 58, 47, 0.4)'};
  border-radius: 12px;
  background: ${({ $active }) =>
    $active ? '#DDD39A' : 'rgba(255, 255, 255, 0.8)'};
  color: #4A3A2F;
  font-family: 'Noto Sans KR';
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
`;

const SaveButton = styled.button`
  width: 100%;
  height: 52px;
  margin-top: 6px;
  border-radius: 10px;
  border: 1.5px solid rgba(74, 58, 47, 0.55);
  background: #DBE4A1;
  color: #4A3A2F;
  font-family: Jua;
  font-size: 20px;
  cursor: pointer;

  &:active {
    transform: translateY(1px);
  }
`;