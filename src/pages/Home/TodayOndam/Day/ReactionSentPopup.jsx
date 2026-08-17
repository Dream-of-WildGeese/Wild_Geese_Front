import {
  PopupBackdrop,
  PopupCard,
  PopupInnerBorder,
  PopupTitle,
  PopupSubtitle,
  PopupPrimaryButton,
  PopupIcon,
} from '../../../../components/PopupShell';

// 와이어프레임 '좋아요 팝업': 가족 답변에 반응을 보낸 뒤 뜨는 확인 화면.
//
// 주의 — 반응을 저장하는 API가 아직 없다.
// 지금은 화면에만 남고 서버로는 전송되지 않는다.
// (POST /api/v1/morning/{questionId}/reactions 같은 엔드포인트가 생기면 연결)
function ReactionSentPopup({ reaction, partnerName, onClose }) {
  if (!reaction) return null;

  return (
    <PopupBackdrop onClick={onClose}>
      <PopupCard $center $gap={14} $padTop={36} onClick={(event) => event.stopPropagation()}>
        <PopupInnerBorder />

        <PopupIcon $size={96} src={reaction.icon} alt="" />
        <PopupTitle $center $size={22}>
          ‘{reaction.label}’ 반응을 보냈어요!
        </PopupTitle>
        <PopupSubtitle $center>
          {partnerName ? `${partnerName}님께` : '가족에게'} 알림으로 전달돼요
        </PopupSubtitle>

        <PopupPrimaryButton type="button" onClick={onClose}>
          확인
        </PopupPrimaryButton>
      </PopupCard>
    </PopupBackdrop>
  );
}

export default ReactionSentPopup;
