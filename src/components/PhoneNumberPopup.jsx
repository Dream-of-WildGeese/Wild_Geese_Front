import { useState } from 'react';
import styled from 'styled-components';
import {
  PopupBackdrop,
  PopupCard,
  PopupInnerBorder,
  PopupTitle,
  PopupSubtitle,
  PopupPrimaryButton,
  PopupSecondaryButton,
  PopupButtonRow,
} from './PopupShell';
import { isValidPhone, setFamilyPhone } from '../utils/call';

// 가족 전화번호를 받아 저장하는 팝업.
// 서버가 전화번호를 안 주기 때문에 처음 '전화하기'를 누를 때 한 번 물어본다.
const PhoneInput = styled.input`
  width: 100%;
  height: 56px;
  padding: 0 16px;

  border-radius: 10px;
  border: 1px solid #d8cbb8;
  background: #fff;

  color: #4a3a2f;
  font-family: 'Noto Sans KR';
  font-size: 20px;
  text-align: center;

  &::placeholder {
    color: #a79c8e;
  }
`;

const Hint = styled.p`
  margin: 0;
  width: 100%;
  text-align: center;
  color: #a79c8e;
  font-family: 'Noto Sans KR';
  font-size: 13px;
`;

function PhoneNumberPopup({ name, initialValue = '', onSaved, onClose }) {
  const [phone, setPhone] = useState(initialValue);
  const valid = isValidPhone(phone);

  const handleSave = () => {
    if (!valid) return;
    setFamilyPhone(phone);
    onSaved(phone);
  };

  return (
    <PopupBackdrop onClick={onClose}>
      <PopupCard $center $gap={14} $padTop={36} onClick={(event) => event.stopPropagation()}>
        <PopupInnerBorder />

        <PopupTitle $center $size={22}>
          {name ? `${name}님 전화번호` : '가족 전화번호'}
        </PopupTitle>
        <PopupSubtitle $center>한 번만 저장해두면 바로 걸 수 있어요</PopupSubtitle>

        <PhoneInput
          type="tel"
          inputMode="tel"
          placeholder="010-0000-0000"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
        />
        <Hint>숫자만 입력해도 괜찮아요</Hint>

        <PopupButtonRow>
          <PopupSecondaryButton type="button" onClick={onClose}>
            취소
          </PopupSecondaryButton>
          <PopupPrimaryButton type="button" onClick={handleSave} disabled={!valid}>
            저장하고 걸기
          </PopupPrimaryButton>
        </PopupButtonRow>
      </PopupCard>
    </PopupBackdrop>
  );
}

export default PhoneNumberPopup;
