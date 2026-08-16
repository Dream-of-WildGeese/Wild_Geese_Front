import styled from 'styled-components';

// Figma 24: 저녁 건강체크 완료. 버튼이 '닫기'에서 '오늘의 건강일지 보러가기'로 바뀌었다.
const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 24px;
  background: rgba(26, 23, 20, 0.55);
  z-index: ${({ theme }) => theme.zIndex.modal};
`;

const Card = styled.div`
  position: relative;
  width: 100%;
  max-width: 377px;
  padding: 36px 26px 34px;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;

  border-radius: 10px;
  border: 3px solid rgba(108, 67, 23, 0.7);
  background: #fef3d5;
`;

const InnerBorder = styled.div`
  position: absolute;
  inset: 11px 8px;
  border-radius: 10px;
  border: 3px dashed rgba(108, 67, 23, 0.7);
  pointer-events: none;
`;

const IconRing = styled.div`
  width: 88px;
  height: 88px;
  border-radius: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #edf3d5;
  border: 1.5px solid #cbd879;
  font-size: 36px;
`;

const Title = styled.p`
  margin: 0;
  text-align: center;
  color: #4a3a2f;
  font-family: 'Noto Sans KR';
  font-size: 20px;
  font-weight: 700;
`;

const Description = styled.p`
  margin: 0;
  text-align: center;
  color: #8c8780;
  font-family: 'Noto Sans KR';
  font-size: 14px;
  line-height: 1.6;
`;

const Highlight = styled.span`
  color: #576b1a;
  font-weight: 700;
`;

const PrimaryButton = styled.button`
  width: 100%;
  height: 50px;
  margin-top: 6px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 10px;
  border: 1.5px solid rgba(74, 58, 47, 0.55);
  background: #dbe4a1;

  color: #4a3a2f;
  font-family: Jua;
  font-size: 20px;
`;

function NightCompletePopup({ onClose, onGoToJournal }) {
  return (
    <Backdrop onClick={onClose}>
      <Card onClick={(event) => event.stopPropagation()}>
        <InnerBorder />
        <IconRing>✎</IconRing>
        <Title>오늘의 건강기록도 잘 남겨주셨어요!</Title>
        <Description>
          매일의 건강기록은
          <br />
          🌿 <Highlight>오늘의 건강일지</Highlight> 🌿
          <br />
          에서 모아볼 수 있어요!
        </Description>
        <PrimaryButton type="button" onClick={onGoToJournal ?? onClose}>
          오늘의 건강일지 보러가기
        </PrimaryButton>
      </Card>
    </Backdrop>
  );
}

export default NightCompletePopup;
