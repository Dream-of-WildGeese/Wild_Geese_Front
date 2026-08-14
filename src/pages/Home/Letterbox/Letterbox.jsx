import { useState } from 'react';
import styled from 'styled-components';
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

function Letterbox({ letters, onMarkRead, onClose, initialStep }) {
  const [step, setStep] = useState(() => initialStep ?? getInitialStep(letters));
  const [selectedLetterId, setSelectedLetterId] = useState(null);

  const selectedLetter = letters.find((letter) => letter.id === selectedLetterId) ?? null;
  const unreadCount = letters.filter((letter) => !letter.read).length;

  const openLetter = (letter) => {
    if (!letter.read) onMarkRead(letter.id);
    setSelectedLetterId(letter.id);
    setStep('read');
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
        {step === 'compose' && <LetterCompose onBack={backToList} onSend={() => setStep('sent')} />}
        {step === 'sent' && <LetterSent onClose={backToList} />}
      </div>
    </Backdrop>
  );
}

export default Letterbox;
