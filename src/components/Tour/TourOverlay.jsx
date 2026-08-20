import { useCallback, useEffect, useRef, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import PopupPortal from '../PopupPortal';
import { APP_FRAME_ID } from '../Layout';
import { TOUR_STEPS, MAP_LABELS } from './tourSteps';
import { markTourSeen } from '../../utils/tour';

// 밝히는 자리 둘레에 두는 여백. 딱 맞게 뚫으면 답답해 보인다.
const PAD = 8;
const DEFAULT_DIM = 0.62;

const frameEl = () => document.getElementById(APP_FRAME_ID);

const findTarget = (name) =>
  (name && frameEl()?.querySelector(`[data-tour="${name}"]`)) || null;

// 화면 절대 좌표가 아니라 폰 프레임 안에서의 좌표를 낸다.
// 프레임은 창 가운데에 떠 있어서, 창 크기가 바뀌면 프레임째로 좌우로 움직인다.
const rectOf = (el) => {
  const frame = frameEl();
  if (!el || !frame) return null;

  const f = frame.getBoundingClientRect();
  const r = el.getBoundingClientRect();
  // 그림이 아직 안 실려서 크기가 0일 때가 있다. 그때 뚫으면 엉뚱한 데 구멍이 난다.
  if (r.width === 0 || r.height === 0) return null;

  return {
    top: Math.round(r.top - f.top),
    left: Math.round(r.left - f.left),
    width: Math.round(r.width),
    height: Math.round(r.height),
  };
};

const sameRect = (a, b) =>
  (!a && !b) ||
  Boolean(a && b && a.top === b.top && a.left === b.left && a.width === b.width && a.height === b.height);

const fadeIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;

// 가운데 놓는 말풍선은 inline transform으로 위치를 잡는다. 애니메이션이 transform을
// 같이 건드리면 뜨는 동안 자리가 튀어서, 여기서는 투명도만 다룬다.
const riseIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;

const Root = styled.div`
  position: absolute;
  inset: 0;
  z-index: 1500;
  animation: ${fadeIn} 0.25s ease;
`;

// 어두운 판은 '보이게' 하는 동시에 '막는' 일도 한다.
// box-shadow로 바깥을 덮는 방법은 그림자가 클릭 판정을 안 받아서,
// 어두워 보이는 곳을 눌러도 밑의 진짜 버튼이 눌린다. 그래서 판을 직접 깐다.
const Panel = styled.div`
  position: absolute;
  background: rgba(28, 20, 14, ${({ $dim }) => $dim});
`;

// 뚫린 자리 둘레의 테. 클릭은 통과시켜서 진짜 버튼이 눌리게 둔다.
const Ring = styled.div`
  position: absolute;
  border-radius: 14px;
  border: 2px solid #cbd879;
  box-shadow: 0 0 0 4px rgba(203, 216, 121, 0.28);
  pointer-events: none;
`;

const Bubble = styled.div`
  position: absolute;
  left: 16px;
  right: 16px;
  padding: 18px 18px 16px;
  box-sizing: border-box;

  display: flex;
  flex-direction: column;
  gap: 8px;

  border-radius: 16px;
  border: 1.5px solid rgba(74, 58, 47, 0.55);
  background: #fffbf1;
  box-shadow: 0 10px 28px rgba(28, 20, 14, 0.28);

  animation: ${riseIn} 0.22s ease;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const Title = styled.p`
  margin: 0;
  color: #4a3a2f;
  font-family: Jua;
  font-size: 20px;
  line-height: 1.3;
  word-break: keep-all;
`;

const Body = styled.p`
  margin: 0;
  color: #6b6661;
  font-family: 'Noto Sans KR';
  font-size: 15px;
  font-weight: 500;
  line-height: 1.5;
  white-space: pre-line;
  word-break: keep-all;
`;

const Hint = styled.p`
  margin: 2px 0 0;
  color: #7d9440;
  font-family: 'Noto Sans KR';
  font-size: 14px;
  font-weight: 700;
  word-break: keep-all;
`;

const FootRow = styled.div`
  margin-top: 6px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const Dots = styled.div`
  display: flex;
  gap: 6px;
`;

const Dot = styled.span`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${({ $on }) => ($on ? '#8fae4a' : 'rgba(74, 58, 47, 0.22)')};
`;

const SkipButton = styled.button`
  padding: 6px 4px;
  border: none;
  background: none;
  color: #8c8780;
  font-family: 'Noto Sans KR';
  font-size: 14px;
  font-weight: 500;
  text-decoration: underline;
  cursor: pointer;
`;

const ActionButton = styled.button`
  padding: 10px 18px;
  border-radius: 12px;
  border: 1.5px solid rgba(74, 58, 47, 0.55);
  background: #cbd879;
  color: #4a3a2f;
  font-family: Jua;
  font-size: 16px;
  cursor: pointer;
`;

// 지도 단계에서 각 자리에 붙는 이름표
const MapLabel = styled.span`
  position: absolute;
  transform: translateX(-50%);
  padding: 4px 10px;
  border-radius: 999px;
  background: #fffbf1;
  border: 1px solid rgba(74, 58, 47, 0.45);
  color: #4a3a2f;
  font-family: 'Noto Sans KR';
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
  pointer-events: none;
`;

function TourOverlay({ onClose }) {
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState(null);
  const [labels, setLabels] = useState([]);
  const [waiting, setWaiting] = useState(false);
  const [frame, setFrame] = useState({ width: 402, height: 874 });

  // 되풀이해서 재는 함수가 늘 최신 단계를 보도록 따로 담아둔다.
  const indexRef = useRef(0);
  indexRef.current = index;

  const finish = useCallback(() => {
    markTourSeen();
    onClose();
  }, [onClose]);

  useEffect(() => {
    const tick = () => {
      const current = indexRef.current;
      const step = TOUR_STEPS[current];
      if (!step) return;

      // 1) 앞으로 갈 때가 됐는지 먼저 본다.
      if (step.advance === 'next') {
        const next = TOUR_STEPS[current + 1];
        if (next && findTarget(next.anchor)) {
          setIndex(current + 1);
          return;
        }
      }
      if (step.advance === 'gone' && !findTarget(step.anchor)) {
        if (current + 1 < TOUR_STEPS.length) setIndex(current + 1);
        else finish();
        return;
      }

      // 2) 지금 단계가 있을 자리인지 본다.
      //    자리가 아니면 조용히 감추고 기다린다. 사용자가 딴 데로 새도 안 깨진다.
      if (step.anchor && !findTarget(step.anchor)) {
        for (let back = current - 1; back >= 0; back -= 1) {
          if (findTarget(TOUR_STEPS[back].anchor)) {
            setIndex(back);
            return;
          }
        }
        setWaiting(true);
        return;
      }
      setWaiting(false);

      // 3) 자리를 잰다.
      const frameNode = frameEl();
      if (frameNode) {
        setFrame((prev) =>
          prev.width === frameNode.clientWidth && prev.height === frameNode.clientHeight
            ? prev
            : { width: frameNode.clientWidth, height: frameNode.clientHeight },
        );
      }

      const nextRect = step.target ? rectOf(findTarget(step.target)) : null;
      setRect((prev) => (sameRect(prev, nextRect) ? prev : nextRect));

      const nextLabels = step.map
        ? MAP_LABELS.map((label) => ({ ...label, rect: rectOf(findTarget(label.target)) })).filter(
            (label) => label.rect,
          )
        : [];
      setLabels((prev) =>
        JSON.stringify(prev) === JSON.stringify(nextLabels) ? prev : nextLabels,
      );
    };

    tick();
    // 팝업이 열리고, 그림이 실리고, 창 크기가 바뀔 때마다 자리가 달라진다.
    // 그때마다 따로 챙기는 대신 짧은 간격으로 다시 잰다.
    const timer = setInterval(tick, 150);
    window.addEventListener('resize', tick);
    return () => {
      clearInterval(timer);
      window.removeEventListener('resize', tick);
    };
  }, [finish]);

  const step = TOUR_STEPS[index];

  // 폰 프레임(874px)이 노트북 화면보다 커서 아래쪽이 잘린다. 하단 툴바처럼
  // 프레임 밑에 있는 자리를 밝히면 구멍이 화면 밖에 뚫린다. 그 자리가 보이게 옮긴다.
  useEffect(() => {
    const current = TOUR_STEPS[index];
    if (!current?.target) return undefined;

    let tries = 0;
    const timer = setInterval(() => {
      const el = findTarget(current.target);
      tries += 1;
      if (el) {
        el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        clearInterval(timer);
      } else if (tries > 20) {
        clearInterval(timer);
      }
    }, 100);

    return () => clearInterval(timer);
  }, [index]);

  const goNext = useCallback(() => {
    if (index + 1 < TOUR_STEPS.length) setIndex(index + 1);
    else finish();
  }, [index, finish]);

  // 다 막아놓고 빠져나갈 길까지 없으면 갇힌다. ESC와 뒤로가기는 살려둔다.
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') finish();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [finish]);

  if (!step || waiting) return null;

  const dim = step.dim ?? DEFAULT_DIM;
  const clickAnywhere = step.advance === 'any';
  const onPanelClick = clickAnywhere ? goNext : undefined;
  // passthrough인 단계는 어둡게만 하고 클릭은 밑으로 흘려보낸다.
  const panelStyle = step.passthrough ? { pointerEvents: 'none' } : null;

  const hole = rect
    ? {
        top: rect.top - PAD,
        left: rect.left - PAD,
        width: rect.width + PAD * 2,
        height: rect.height + PAD * 2,
      }
    : null;

  // 구멍 아래에 자리가 있으면 아래, 없으면 위. 둘 다 좁으면(구멍이 화면을
  // 거의 다 차지하는 팝업 같은 때) 아래쪽에 겹쳐 둔다. 안 그러면 말풍선이
  // 화면 밖으로 밀려나 아예 안 보인다.
  const bubblePosition = (() => {
    if (hole) {
      const NEEDED = 180;
      if (frame.height - (hole.top + hole.height) >= NEEDED) {
        return { top: hole.top + hole.height + 14 };
      }
      if (hole.top >= NEEDED) return { bottom: frame.height - hole.top + 14 };
      return { bottom: 16 };
    }
    if (step.place === 'bottom') return { bottom: 120 };
    if (step.place === 'top') return { top: 120 };
    return { top: '50%', transform: 'translateY(-50%)' };
  })();

  return (
    <PopupPortal>
      <Root>
        {hole ? (
          <>
            {/* 구멍 자리만 비우고 나머지를 네 조각으로 덮는다.
                구멍에는 판이 없으니 그 안의 진짜 버튼이 그대로 눌린다. */}
            <Panel $dim={dim} onClick={onPanelClick} style={{ ...panelStyle, top: 0, left: 0, right: 0, height: Math.max(hole.top, 0) }} />
            <Panel $dim={dim} onClick={onPanelClick} style={{ ...panelStyle, top: hole.top + hole.height, left: 0, right: 0, bottom: 0 }} />
            <Panel $dim={dim} onClick={onPanelClick} style={{ ...panelStyle, top: hole.top, left: 0, width: Math.max(hole.left, 0), height: hole.height }} />
            <Panel $dim={dim} onClick={onPanelClick} style={{ ...panelStyle, top: hole.top, left: hole.left + hole.width, right: 0, height: hole.height }} />
            <Ring style={{ top: hole.top, left: hole.left, width: hole.width, height: hole.height }} />
          </>
        ) : (
          <Panel $dim={dim} onClick={onPanelClick} style={{ ...panelStyle, inset: 0 }} />
        )}

        {labels.map((label) => (
          <MapLabel
            key={label.target}
            style={{
              left: label.rect.left + label.rect.width / 2,
              ...(label.side === 'above'
                ? { top: Math.max(label.rect.top - 26, 4) }
                : { top: label.rect.top + label.rect.height + 6 }),
            }}
          >
            {label.text}
          </MapLabel>
        ))}

        <Bubble style={bubblePosition} onClick={(event) => event.stopPropagation()}>
          <Title>{step.title}</Title>
          <Body>{step.body}</Body>
          {step.hint && <Hint>{step.hint}</Hint>}

          <FootRow>
            <Dots>
              {TOUR_STEPS.map((item, itemIndex) => (
                <Dot key={item.id} $on={itemIndex === index} />
              ))}
            </Dots>

            {step.action ? (
              <ActionButton type="button" onClick={goNext}>
                {step.action}
              </ActionButton>
            ) : (
              <SkipButton type="button" onClick={finish}>
                건너뛰기
              </SkipButton>
            )}
          </FootRow>
        </Bubble>
      </Root>
    </PopupPortal>
  );
}

export default TourOverlay;
