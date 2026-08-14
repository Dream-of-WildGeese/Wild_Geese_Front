import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { getMyFamily } from '../../../api/family';
import { sendLetter } from '../../../api/letter';
import { getUserId } from '../../../api/client';
import { useApi, useApiAction } from '../../../hooks/useApi';
import LetterboxList from './LetterboxList';
import LetterArrived from './LetterArrived';
import LetterRead from './LetterRead';
import LetterCompose from './LetterCompose';
import LetterSent from './LetterSent';
import LetterboxEmpty from './LetterboxEmpty';

const Backdrop = styled.div`
  position: fixed;
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
  const myUserId = getUserId();
  const recipient = (family?.members ?? []).find(
    (member) => String(member.userId) !== String(myUserId),
  );

  const openLetter = (letter) => {
    if (!letter.read) onMarkRead(letter.id);
    setSelectedLetterId(letter.id);
    setStep('read');
  };

  const handleSend = async (content) => {
    if (!recipient) {
      alert('편지를 보낼 가족이 아직 연결되지 않았어요.');
      return;
    }
    const { ok, error } = await send({ toUserId: recipient.userId, content, inputType: 'TEXT' });
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
    <Backdrop onClick={onClose}>
      <div onClick={(event) => event.stopPropagation()} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        {step === 'arrived' && <LetterArrived unreadCount={unreadCount} onOpen={handleArrivedOpen} />}
        {step === 'list' && (
          <LetterboxList letters={letters} onSelectLetter={openLetter} onWrite={() => setStep('compose')} />
        )}
        {step === 'empty' && <LetterboxEmpty onWrite={() => setStep('compose')} />}
        {step === 'read' && selectedLetter && (
          <LetterRead letter={selectedLetter} onReply={() => setStep('compose')} onClose={backToList} />
        )}
        {step === 'compose' && (
          <LetterCompose onBack={backToList} onSend={handleSend} sending={sending} />
        )}
        {step === 'sent' && <LetterSent onClose={backToList} />}
      </div>
    </Backdrop>
  );
}

export default Letterbox;
