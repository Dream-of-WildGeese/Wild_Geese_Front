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
// 서버 저장(POST /morning/answers/{answerId}/reactions)이 성공한 뒤에만 뜬다.
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
          {partnerName ? `${partnerName}에게` : '가족에게'} 알림으로 전달돼요
        </PopupSubtitle>

        <PopupPrimaryButton type="button" onClick={onClose}>
          확인
        </PopupPrimaryButton>
      </PopupCard>
    </PopupBackdrop>
  );
}

export default ReactionSentPopup;
