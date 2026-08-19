import weeklyReportIcon from '../../../../assets/popup/weekly-report.svg';
import {
  PopupBackdrop,
  PopupCard,
  PopupInnerBorder,
  PopupIcon,
  PopupTitle,
  PopupSubtitle,
  PopupPrimaryButton,
} from '../../../../components/PopupShell';

// Figma 24b: 저녁 건강체크를 마친 뒤, 그 주 리포트가 완성됐을 때만 뜬다.
function WeeklyReportReadyPopup({ onClose, onGoToReport }) {
  return (
    <PopupBackdrop onClick={onClose}>
      <PopupCard $center $gap={16} $padTop={36} onClick={(event) => event.stopPropagation()}>
        <PopupInnerBorder />
        <PopupIcon src={weeklyReportIcon} alt="" />
        <PopupTitle $center $size={22}>
          이번 주 리포트가 완성됐어요!
        </PopupTitle>
        <PopupSubtitle $center>한 주 동안의 흐름을 확인해보세요</PopupSubtitle>
        <PopupPrimaryButton type="button" onClick={onGoToReport}>
          주간 리포트 보러가기
        </PopupPrimaryButton>
      </PopupCard>
    </PopupBackdrop>
  );
}

export default WeeklyReportReadyPopup;
