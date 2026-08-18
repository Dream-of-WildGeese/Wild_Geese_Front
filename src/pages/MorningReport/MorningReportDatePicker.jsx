import { useState } from 'react';
import styled from 'styled-components';
import PopupPortal from '../../components/PopupPortal';

const YEARS_PER_PAGE = 6;

// 연도 목록은 '보고 있는 해'가 아니라 '올해'를 기준으로 잡는다.
// 예전에는 보고 있는 해를 기준으로 삼아서, 2013년으로 옮긴 뒤 다시 열면
// 창이 [2008~2013]이 되고 yearPage가 0이라 '최근으로'가 막혔다.
const CURRENT_YEAR = new Date().getFullYear();

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
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  color: #d1493a;
  font-size: 24px;
  font-weight: 700;
  line-height: 1;
`;

const Title = styled.p`
  margin: 0 0 4px;
  padding-right: ${({ theme }) => theme.spacing.lg};
  font-family: 'Jua', sans-serif;
  font-size: 18px;
  color: #4a3a2f;
`;

const SectionLabel = styled.p`
  margin: ${({ theme }) => theme.spacing.md} 0 6px;
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 13px;
  font-weight: 700;
  color: #8c8172;
`;

const OptionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(${({ $columns }) => $columns ?? 3}, 1fr);
  gap: ${({ theme }) => theme.spacing.sm};
`;

const OptionButton = styled.button`
  padding: 12px 0;
  border-radius: 10px;
  background: ${({ $active }) =>
    $active ? 'rgba(193, 160, 103, 0.45)' : 'rgba(193, 160, 103, 0.14)'};
  border: 1px solid ${({ $active }) => ($active ? '#4a3a2f' : 'rgba(74, 58, 47, 0.35)')};
  font-family: 'Noto Sans KR', sans-serif;
  font-weight: 700;
  font-size: 15px;
  color: #4a3a2f;
`;

const YearPageNav = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 6px;
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

const Hint = styled.p`
  margin: ${({ theme }) => theme.spacing.md} 0 0;
  text-align: center;
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 13px;
  color: #8c8172;
`;

function MorningReportDatePicker({ year, month, onConfirm, onClose }) {
  const [draftYear, setDraftYear] = useState(year);
  // 처음 열 때 보고 있던 해가 담긴 쪽을 펴둔다.
  const [yearPage, setYearPage] = useState(() =>
    Math.max(0, Math.floor((CURRENT_YEAR - year) / YEARS_PER_PAGE)),
  );

  const yearWindowStart = CURRENT_YEAR - YEARS_PER_PAGE * (yearPage + 1) + 1;
  const yearOptions = Array.from({ length: YEARS_PER_PAGE }, (_, i) => yearWindowStart + i);
  const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <PopupPortal>
      <Backdrop onClick={onClose}>
        <Card onClick={(event) => event.stopPropagation()}>
          <CloseButton type="button" aria-label="닫기" onClick={onClose}>
            ✕
          </CloseButton>

          <Title>연월 빠른 이동</Title>

          <SectionLabel>연도</SectionLabel>
          <OptionGrid $columns={3}>
            {yearOptions.map((y) => (
              <OptionButton
                key={y}
                type="button"
                $active={y === draftYear}
                onClick={() => setDraftYear(y)}
              >
                {y}
              </OptionButton>
            ))}
          </OptionGrid>
          <YearPageNav>
            <YearPageButton type="button" onClick={() => setYearPage((p) => p + 1)}>
              ‹ 더 이전
            </YearPageButton>
            <YearPageButton
              type="button"
              disabled={yearPage === 0}
              onClick={() => setYearPage((p) => Math.max(0, p - 1))}
            >
              최근으로 ›
            </YearPageButton>
          </YearPageNav>

          {/* 달을 누르면 바로 그 달로 옮긴다. 예전에는 연도·달을 각각 다른 화면에서
              고르고 '확인'까지 눌러야 해서 손이 많이 갔다. */}
          <SectionLabel>달 (누르면 바로 이동해요)</SectionLabel>
          <OptionGrid $columns={4}>
            {monthOptions.map((m) => (
              <OptionButton
                key={m}
                type="button"
                $active={draftYear === year && m === month}
                onClick={() => onConfirm(draftYear, m)}
              >
                {m}월
              </OptionButton>
            ))}
          </OptionGrid>

          <Hint>{draftYear}년에서 볼 달을 골라주세요</Hint>
        </Card>
      </Backdrop>
    </PopupPortal>
  );
}

export default MorningReportDatePicker;
