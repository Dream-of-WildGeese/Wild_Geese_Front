import React, { useState } from 'react';
import styled from 'styled-components';

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
  const [customType, setCustomType] = useState('');
  const [date, setDate] = useState('');
  const [hospital, setHospital] = useState('');
  const [alertOption, setAlertOption] = useState('3일 전');

  const handleTypeChange = (type) => {
    setCheckType(type);

    if (type !== '직접 입력') {
      setCustomType('');
    }
  };

  const handleSave = () => {
    const finalType =
      checkType === '직접 입력'
        ? customType.trim()
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

    // 아직 API가 없으므로 부모에게 데이터만 전달
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

        <Content>
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
                <Input
                  type="text"
                  placeholder="예: 유방암 초음파, 위내시경 등"
                  value={customType}
                  onChange={(event) =>
                    setCustomType(event.target.value)
                  }
                />

                <FieldHint>
                  * 직접 입력을 선택한 경우만 적어주세요
                </FieldHint>
              </>
            )}
          </FormSection>

          <FormSection>
            <Label>날짜를 선택해주세요</Label>

            <Input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
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
        </Content>
      </Modal>
    </Overlay>
  );
};

export default AddHealthCheck;

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  z-index: 1000;

  display: flex;
  align-items: flex-end;
  justify-content: center;

  background: rgba(49, 41, 35, 0.25);
`;

const Modal = styled.div`
  width: 100%;
  max-width: 402px;
  max-height: 88vh;

  padding: 20px 16px 24px;
  box-sizing: border-box;

  overflow-y: auto;

  border-radius: 24px 24px 0 0;
  border: 1px solid rgba(74, 58, 47, 0.15);

  background: #fff8ed;

  box-shadow: 0 -8px 30px rgba(74, 58, 47, 0.14);

  &::-webkit-scrollbar {
    display: none;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const CloseButton = styled.button`
  width: 32px;
  height: 32px;

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
  font-family: 'Noto Sans KR';
  font-size: 17px;
  font-weight: 700;
`;

const HeaderSpacer = styled.div`
  width: 32px;
`;

const Divider = styled.div`
  width: 100%;
  margin-top: 12px;

  border-top: 1px solid #e5ddd2;
`;

const Content = styled.div`
  padding-top: 4px;
`;

const FormSection = styled.section`
  margin-top: 20px;
`;

const Label = styled.p`
  margin: 0 0 10px;

  color: #7b736b;

  font-family: 'Noto Sans KR';
  font-size: 12px;
  font-weight: 500;
`;

const TypeWrap = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const TypeChip = styled.button`
  min-height: 34px;
  padding: 7px 12px;

  border: 1.2px solid
    ${({ $active }) =>
      $active ? '#c97956' : '#d8d0c6'};

  border-radius: 999px;

  background: ${({ $active }) =>
    $active ? '#f8e1d2' : '#fffdf8'};

  color: ${({ $active }) =>
    $active ? '#c97158' : '#5d554d'};

  font-family: 'Noto Sans KR';
  font-size: 11px;
  font-weight: 600;

  cursor: pointer;
`;

const Input = styled.input`
  width: 100%;
  height: 44px;

  margin-top: 10px;
  padding: 0 12px;

  box-sizing: border-box;

  border: 1.2px solid #d8d0c6;
  border-radius: 10px;

  background: #fffdf8;

  color: #4a3a2f;

  font-family: 'Noto Sans KR';
  font-size: 12px;

  outline: none;

  &::placeholder {
    color: #a79f96;
  }

  &:focus {
    border-color: #c98263;
  }
`;

const FieldHint = styled.p`
  margin: 6px 0 0;

  color: #a79f96;

  font-size: 9px;
`;

const AlertWrap = styled.div`
  display: flex;
  gap: 8px;
`;

const AlertChip = styled.button`
  flex: 1;
  height: 38px;

  border: 1.2px solid
    ${({ $active }) =>
      $active ? '#c97956' : '#d8d0c6'};

  border-radius: 10px;

  background: ${({ $active }) =>
    $active ? '#f4dfd1' : '#fffdf8'};

  color: ${({ $active }) =>
    $active ? '#c97158' : '#635b53'};

  font-family: 'Noto Sans KR';
  font-size: 11px;
  font-weight: 600;

  cursor: pointer;
`;

const SaveButton = styled.button`
  width: 100%;
  height: 50px;

  margin-top: 28px;

  border: 1.5px solid rgba(74, 58, 47, 0.35);
  border-radius: 14px;

  background: #d17b55;
  color: #fffdf8;

  font-family: Jua, sans-serif;
  font-size: 17px;
  font-weight: 400;

  cursor: pointer;
`;