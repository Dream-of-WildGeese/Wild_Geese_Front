import { useEffect, useState } from 'react';
import styled from 'styled-components';
import PopupPortal from '../../../components/PopupPortal';
import { getMyFamily } from '../../../api/family';
import { sendLetter } from '../../../api/letter';
import { getUserId } from '../../../api/client';
import { useApi, useApiAction } from '../../../hooks/useApi';
import { findPartner, getRelationLabel } from '../../../utils/family';
import LetterboxList from './LetterboxList';
import LetterArrived from './LetterArrived';
import LetterRead from './LetterRead';
import LetterCompose from './LetterCompose';
import LetterSent from './LetterSent';
import LetterboxEmpty from './LetterboxEmpty';

const Backdrop = styled.div`
  /* Layout(폰 프레임)이 기준이 되도록 absolute를 쓴다. fixed면 브라우저 창 가운데에 뜬다. */
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(26, 23, 20, 0.55);
  z-index: ${({ theme }) => theme.zIndex.modal};
`;

const getInitialStep = (letters) => {
  if (letters.length === 0) return 'empty';
  return letters.some((letter) => !letter.read) ? 'arrived' : 'list';
};

function Letterbox({ letters, loading, onMarkRead, onSent, onClose, initialStep }) {
  // 편지 목록이 서버에서 도착해야 첫 화면(도착 알림/목록/비어있음)을 정할 수 있다.
  const [step, setStep] = useState(initialStep ?? null);
  const [selectedLetterId, setSelectedLetterId] = useState(null);

  const { data: family } = useApi(getMyFamily);
  const { execute: send, loading: sending } = useApiAction(sendLetter);

  useEffect(() => {
    if (step === null && !loading) {
      setStep(getInitialStep(letters));
    }
  }, [step, loading, letters]);

  const selectedLetter = letters.find((letter) => letter.id === selectedLetterId) ?? null;
  const unreadCount = letters.filter((letter) => !letter.read).length;

  // 편지는 가족 구성원에게 보내므로, 나를 뺀 첫 번째 구성원을 받는 사람으로 삼는다.
  const recipient = findPartner(family, getUserId());

  const openLetter = (letter) => {
    if (!letter.read) onMarkRead(letter.id);
    setSelectedLetterId(letter.id);
    setStep('read');
  };

  // 가족은 이름이 아니라 호칭으로 부른다(엄마·아빠·딸·아들).
  // 예전에는 편지에 적힌 이름을 그대로 써서 '봉미선에게 편지 쓰기'가 됐다.
  // 여기 목록은 '받은 편지'라 보낸 사람도 이 가족이므로, 같은 호칭을 함께 쓴다.
  const partnerLabel = recipient ? getRelationLabel(recipient) : '';

  const handleSend = async (content, audioUrl) => {
    if (!recipient) {
      alert('편지를 보낼 가족이 아직 연결되지 않았어요.');
      return;
    }
    const { ok, error } = await send({
      toUserId: recipient.userId,
      content,
      inputType: audioUrl ? 'VOICE' : 'TEXT',
      audioUrl,
    });
    if (!ok) {
      alert(error.message);
      return;
    }
    onSent?.();
    setStep('sent');
  };

  const handleArrivedOpen = () => {
    const firstUnread = letters.find((letter) => !letter.read);
    if (firstUnread) openLetter(firstUnread);
  };

  const backToList = () => setStep(letters.length === 0 ? 'empty' : 'list');

  return (
    <PopupPortal>
      <Backdrop onClick={onClose}>
        <div onClick={(event) => event.stopPropagation()} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          {step === 'arrived' && (
            <LetterArrived
              unreadCount={unreadCount}
              onOpen={handleArrivedOpen}
              onClose={onClose}
            />
          )}
          {step === 'list' && (
            <LetterboxList
              letters={letters}
              senderLabel={partnerLabel}
              onSelectLetter={openLetter}
              onWrite={() => setStep('compose')}
              onClose={onClose}
            />
          )}
          {step === 'empty' && (
            <LetterboxEmpty onWrite={() => setStep('compose')} onClose={onClose} />
          )}
          {step === 'read' && selectedLetter && (
            <LetterRead
              letter={selectedLetter}
              senderLabel={partnerLabel}
              onReply={() => setStep('compose')}
              onClose={backToList}
            />
          )}
          {step === 'compose' && (
            <LetterCompose
              onBack={backToList}
              onSend={handleSend}
              sending={sending}
              recipientName={partnerLabel}
            />
          )}
          {/* 보내고 나면 편지함으로 돌아가지 않고 홈으로 나간다 */}
          {step === 'sent' && <LetterSent onClose={onClose} recipientName={partnerLabel} />}
        </div>
      </Backdrop>
    </PopupPortal>
  );
}

export default Letterbox;
