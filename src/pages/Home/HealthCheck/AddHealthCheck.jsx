import React, { useState } from 'react';
import styled from 'styled-components';
import DatePickerModal from '../../../components/DatePickerModal';


// "1856-03-02" -> "1856년 3월 2일"
const formatDateLabel = (value) => {
  const [year, month, day] = String(value).split('-').map(Number);
  return `${year}년 ${month}월 ${day}일`;
};

const HEALTH_CHECK_TYPES = [
  '일반검진',
  '암검진',
  '치과검진',
  '안과검진',
  '이비인후과',
  '직접 입력',
];

const ALERT_OPTIONS = ['3일 전', '1일 전', '알림 받지 않기'];

const AddHealthCheck = ({ onClose, onSave }) => {
  const [checkType, setCheckType] = useState('');
  const [customTypeInput, setCustomTypeInput] = useState('');
  const [customTypes, setCustomTypes] = useState([]);
  const [date, setDate] = useState('');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [hospital, setHospital] = useState('');
  const [alertOption, setAlertOption] = useState('3일 전');

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

  const handleSave = () => {
    const finalType =
      checkType === '직접 입력'
        ? customTypes.join(', ')
        : checkType;

    if (!finalType) {
      alert('검진 종류를 선택해주세요.');
      return;
    }

    if (!date) {
      alert('날짜를 선택해주세요.');
      return;
    }

    if (!hospital.trim()) {
      alert('병원 이름을 입력해주세요.');
      return;
    }

    const healthCheckData = {
      type: finalType,
      date,
      hospital: hospital.trim(),
      alertOption,
    };

    onSave?.(healthCheckData);
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
          <Header>
            <CloseButton
              type="button"
              onClick={onClose}
              aria-label="닫기"
            >
              ×
            </CloseButton>

            <HeaderTitle id="add-health-check-title">
              검진 일정 추가하기
            </HeaderTitle>

            <HeaderSpacer />
          </Header>

          <Divider />

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
                  />
                  <AddTypeButton type="button" onClick={addCustomType}>
                    +
                  </AddTypeButton>
                </AddTypeRow>

                {customTypes.length > 0 && (
                  <TypeWrap>
                    {customTypes.map((type) => (
                      <TypeChip key={type} as="span" $active>
                        {type}
                        <RemoveTypeIcon
                          type="button"
                          onClick={() => removeCustomType(type)}
                        >
                          ×
                        </RemoveTypeIcon>
                      </TypeChip>
                    ))}
                  </TypeWrap>
                )}

                <FieldHint>
                  * "직접 입력"을 고르신 경우에만 적어주세요
                </FieldHint>
              </>
            )}
          </FormSection>

          <FormSection>
            <Label>날짜를 선택해주세요</Label>

            <DateSelectButton
              type="button"
              onClick={() => setIsDatePickerOpen(true)}
            >
              {date ? formatDateLabel(date) : '날짜를 선택해주세요'}
            </DateSelectButton>
          </FormSection>

          <FormSection>
            <Label>병원 이름을 입력해주세요</Label>

            <Input
              type="text"
              placeholder="예: 온담 종합병원"
              value={hospital}
              onChange={(event) => setHospital(event.target.value)}
            />
          </FormSection>

          <FormSection>
            <Label>언제 알려드릴까요?</Label>

            <AlertWrap>
              {ALERT_OPTIONS.map((option) => (
                <AlertChip
                  key={option}
                  type="button"
                  $active={alertOption === option}
                  onClick={() => setAlertOption(option)}
                >
                  {option}
                </AlertChip>
              ))}
            </AlertWrap>
          </FormSection>

          <SaveButton
            type="button"
            onClick={handleSave}
          >
            저장하기
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
    </Overlay>
  );
};

export default AddHealthCheck;

/* =========================
   Overlay
========================= */

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

/* =========================
   Modal
========================= */

const Modal = styled.div`
  width: 100%;
  max-width: 390px;
  max-height: calc(100% - 12px);

  padding: 8px;

  box-sizing: border-box;

  border: 2px solid #4a3a2f;
  border-radius: 28px;

  background: #fff8ed;

  box-shadow: 0 10px 40px rgba(74, 58, 47, 0.2);

  overflow: hidden;
`;

const ModalInner = styled.div`
  width: 100%;
  max-height: calc(100vh - 48px);

  padding: 18px 16px 18px;

  box-sizing: border-box;

  border: 2px dashed #8d806e;
  border-radius: 14px;

  background: #fff8ed;

  overflow-y: auto;

  &::-webkit-scrollbar {
    display: none;
  }
`;

/* =========================
   Header
========================= */

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const CloseButton = styled.button`
  width: 32px;
  height: 32px;

  margin: 0;
  padding: 0;

  border: none;
  background: transparent;

  display: flex;
  align-items: center;
  justify-content: center;

  color: #4a3a2f;
  font-size: 28px;
  font-weight: 300;
  line-height: 1;

  cursor: pointer;
`;

const HeaderTitle = styled.h1`
  margin: 0;

  color: #4a3a2f;

  font-family: Jua, sans-serif;
  font-size: 24px;
  font-weight: 400;

  text-align: center;
`;

const HeaderSpacer = styled.div`
  width: 32px;
`;

const Divider = styled.div`
  width: 100%;

  margin: 12px 0 0;

  border-top: 1px solid rgba(74, 58, 47, 0.25);
`;

/* =========================
   Form
========================= */

const FormSection = styled.section`
  margin-top: 20px;

  padding: 14px 14px 16px;

  border: 1.3px solid rgba(74, 58, 47, 0.35);
  border-radius: 18px;

  background: rgba(255, 255, 255, 0.55);
`;

const Label = styled.p`
  margin: 0 0 12px;

  color: #4a3a2f;

  font-family: 'Noto Sans KR';
  font-size: 15px;
  font-weight: 700;
`;

const TypeWrap = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const TypeChip = styled.button`
  min-height: 36px;

  padding: 6px 12px;

  border: ${({ $active }) =>
    $active
      ? '1.4px solid #9b7b3f'
      : '1.4px dashed #bdb4a8'};

  border-radius: 999px;

  background: ${({ $active }) =>
    $active ? '#f6ebc7' : '#fffdf8'};

  color: #4a3a2f;

  font-family: 'Noto Sans KR';
  font-size: 12px;
  font-weight: 700;

  cursor: pointer;
`;

const Input = styled.input`
  width: 100%;
  height: 48px;

  margin-top: 12px;
  padding: 0 14px;

  box-sizing: border-box;

  border: 1.3px solid #c9c0b4;
  border-radius: 14px;

  background: #fffdf8;

  color: #4a3a2f;

  font-family: 'Noto Sans KR';
  font-size: 14px;

  outline: none;

  &::placeholder {
    color: #aaa196;
  }

  &:focus {
    border-color: #a58a54;
  }
`;

const DateSelectButton = styled.button`
  width: 100%;
  height: 48px;

  margin-top: 12px;
  padding: 0 14px;

  box-sizing: border-box;

  border: 1.3px solid #c9c0b4;
  border-radius: 14px;

  background: #fffdf8;

  color: ${({ children }) =>
    String(children).includes('선택해주세요') ? '#aaa196' : '#4a3a2f'};

  font-family: 'Noto Sans KR';
  font-size: 14px;
  text-align: left;

  cursor: pointer;
`;

const AddTypeRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
`;

const TypeInput = styled(Input)`
  flex: 1;
  margin-top: 0;
`;

const AddTypeButton = styled.button`
  flex-shrink: 0;
  width: 44px;
  height: 44px;

  display: flex;
  align-items: center;
  justify-content: center;

  border: 1.4px solid #9b7b3f;
  border-radius: 12px;
  background: #f6ebc7;

  color: #4a3a2f;
  font-size: 20px;
  font-weight: 700;
  line-height: 1;

  cursor: pointer;
`;

const RemoveTypeIcon = styled.button`
  margin-left: 6px;
  padding: 0;
  border: none;
  background: transparent;

  color: #4a3a2f;
  font-size: 14px;
  font-weight: 700;
  line-height: 1;

  cursor: pointer;
`;

const FieldHint = styled.p`
  margin: 8px 0 0;

  color: #a29a91;

  font-family: 'Noto Sans KR';
  font-size: 10px;
  line-height: 1.4;
`;

/* =========================
   Alert
========================= */

const AlertWrap = styled.div`
  display: flex;
  gap: 8px;
`;

const AlertChip = styled.button`
  flex: 1;
  height: 38px;

  padding: 0 8px;

  border: ${({ $active }) =>
    $active
      ? '1.4px solid #a98663'
      : '1.4px dashed #c0b6aa'};

  border-radius: 12px;

  background: ${({ $active }) =>
    $active ? '#f6ebc7' : '#fffdf8'};

  color: #4a3a2f;

  font-family: 'Noto Sans KR';
  font-size: 11px;
  font-weight: 700;

  cursor: pointer;
`;

/* =========================
   Save
========================= */

const SaveButton = styled.button`
  width: 100%;
  height: 54px;

  margin-top: 20px;

  border: 1.5px solid rgba(74, 58, 47, 0.45);
  border-radius: 14px;

  background: #dbe4a1;
  color: #4a3a2f;

  font-family: Jua, sans-serif;
  font-size: 20px;
  font-weight: 400;

  cursor: pointer;

  &:active {
    transform: translateY(1px);
  }
`;