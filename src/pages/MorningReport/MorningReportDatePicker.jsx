import { useState } from 'react';
import styled from 'styled-components';
import PopupPortal from '../../components/PopupPortal';

const YEARS_PER_PAGE = 6;

const Backdrop = styled.div`
  /* Layout(폰 프레임)이 기준이 되도록 absolute를 쓴다. fixed면 브라우저 창 가운데에 뜬다. */
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.lg};
  background: rgba(44, 44, 42, 0.4);
  z-index: ${({ theme }) => theme.zIndex.modal};
`;

const Card = styled.div`
  position: relative;
  width: 100%;
  max-width: 320px;
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: 20px;
  background: #fff8ed;
  border: 1px solid #4a3a2f;
`;

const CloseButton = styled.button`
  position: absolute;
  top: ${({ theme }) => theme.spacing.sm};
  right: ${({ theme }) => theme.spacing.sm};
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  color: #4a3a2f;
  font-size: 16px;
`;

const Title = styled.p`
  margin: 0 0 ${({ theme }) => theme.spacing.md};
  padding-right: ${({ theme }) => theme.spacing.lg};
  font-family: 'Jua', sans-serif;
  font-size: 18px;
  color: #4a3a2f;
`;

const RootRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const RootButton = styled.button`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.md} 0;
  border-radius: 14px;
  background: rgba(193, 160, 103, 0.18);
  border: 1px solid #4a3a2f;
  font-family: 'Jua', sans-serif;
  font-size: 22px;
  color: #4a3a2f;
`;

const OptionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${({ theme }) => theme.spacing.sm};
`;

const OptionButton = styled.button`
  padding: 12px 0;
  border-radius: 10px;
  background: ${({ $active }) => ($active ? 'rgba(193, 160, 103, 0.35)' : 'rgba(193, 160, 103, 0.14)')};
  border: 1px solid #4a3a2f;
  font-family: 'Noto Sans KR', sans-serif;
  font-weight: 700;
  font-size: 15px;
  color: #4a3a2f;
`;

const BackToRoot = styled.button`
  margin-top: ${({ theme }) => theme.spacing.md};
  font-size: 13px;
  color: #6b6661;
  text-decoration: underline;
`;

const YearPageNav = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: ${({ theme }) => theme.spacing.sm};
`;

const YearPageButton = styled.button`
  padding: 6px 10px;
  border-radius: 8px;
  font-family: 'Noto Sans KR', sans-serif;
  font-weight: 700;
  font-size: 13px;
  color: #4a3a2f;
  opacity: ${({ disabled }) => (disabled ? 0.35 : 1)};
`;

const ConfirmButton = styled.button`
  width: 100%;
  height: 48px;
  margin-top: ${({ theme }) => theme.spacing.md};
  border-radius: 14px;
  background: #4a3a2f;
  color: #fff8ed;
  font-family: 'Noto Sans KR', sans-serif;
  font-weight: 700;
  font-size: 15px;
`;

function MorningReportDatePicker({ year, month, onConfirm, onClose }) {
  const [view, setView] = useState('root');
  const [draftYear, setDraftYear] = useState(year);
  const [draftMonth, setDraftMonth] = useState(month);
  const [yearPage, setYearPage] = useState(0);

  const yearWindowStart = year - YEARS_PER_PAGE * (yearPage + 1) + 1;
  const yearOptions = Array.from({ length: YEARS_PER_PAGE }, (_, i) => yearWindowStart + i);
  const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <PopupPortal>
      <Backdrop onClick={onClose}>
        <Card onClick={(event) => event.stopPropagation()}>
          <CloseButton type="button" aria-label="닫기" onClick={onClose}>
            ✕
          </CloseButton>

          {view === 'root' && (
            <>
              <Title>연월 빠른 이동</Title>
              <RootRow>
                <RootButton type="button" onClick={() => setView('year')}>
                  {draftYear}
                </RootButton>
                <RootButton type="button" onClick={() => setView('month')}>
                  {draftMonth}월
                </RootButton>
              </RootRow>
              <ConfirmButton type="button" onClick={() => onConfirm(draftYear, draftMonth)}>
                확인
              </ConfirmButton>
            </>
          )}

          {view === 'year' && (
            <>
              <Title>연도 선택</Title>
              <OptionGrid>
                {yearOptions.map((y) => (
                  <OptionButton
                    key={y}
                    type="button"
                    $active={y === draftYear}
                    onClick={() => {
                      setDraftYear(y);
                      setView('root');
                    }}
                  >
                    {y}
                  </OptionButton>
                ))}
              </OptionGrid>
              <YearPageNav>
                <YearPageButton type="button" onClick={() => setYearPage((p) => p + 1)}>
                  ‹ 더 이전 연도
                </YearPageButton>
                <YearPageButton
                  type="button"
                  disabled={yearPage === 0}
                  onClick={() => setYearPage((p) => Math.max(0, p - 1))}
                >
                  최근으로 ›
                </YearPageButton>
              </YearPageNav>
              <BackToRoot type="button" onClick={() => setView('root')}>
                ‹ 뒤로
              </BackToRoot>
            </>
          )}

          {view === 'month' && (
            <>
              <Title>달 선택</Title>
              <OptionGrid>
                {monthOptions.map((m) => (
                  <OptionButton
                    key={m}
                    type="button"
                    $active={m === draftMonth}
                    onClick={() => {
                      setDraftMonth(m);
                      setView('root');
                    }}
                  >
                    {m}월
                  </OptionButton>
                ))}
              </OptionGrid>
              <BackToRoot type="button" onClick={() => setView('root')}>
                ‹ 뒤로
              </BackToRoot>
            </>
          )}
        </Card>
      </Backdrop>
    </PopupPortal>
  );
}

export default MorningReportDatePicker;
