import { useCallback, useEffect, useRef, useState } from 'react';
import styled, { css, keyframes } from 'styled-components';
import PopupPortal from '../PopupPortal';
import { APP_FRAME_ID } from '../Layout';
import { TOUR_STEPS, MAP_LABELS } from './tourSteps';
import { markTourSeen } from '../../utils/tour';

// 밝히는 자리 둘레에 두는 여백. 딱 맞게 뚫으면 답답해 보인다.
const PAD = 8;
const MASK_ID = 'ondam-tour-holes';
const DEFAULT_DIM = 0.62;

const frameEl = () => document.getElementById(APP_FRAME_ID);

const findTarget = (name) =>
  (name && frameEl()?.querySelector(`[data-tour="${name}"]`)) || null;

// 화면 절대 좌표가 아니라 폰 프레임 안에서의 좌표를 낸다.
// 프레임은 창 가운데에 떠 있어서, 창 크기가 바뀌면 프레임째로 좌우로 움직인다.
//
// 이 오버레이는 PopupPortal로 프레임의 자식으로 붙고 inset:0을 쓰는데,
// 그건 프레임의 '테두리 안쪽'(패딩 박스)을 기준으로 잡힌다. 반면
// getBoundingClientRect()의 frame 좌표는 테두리를 포함한 바깥쪽(보더 박스)
// 기준이라, 프레임에 테두리가 있으면(지금 2px) 그만큼 오차가 생겨 오른쪽·
// 아래쪽 여백이 왼쪽·위쪽보다 미세하게 커 보였다. clientLeft/clientTop(테두리
// 두께)를 빼서 오버레이가 실제로 그려지는 기준점에 맞춘다.
const rectOf = (el) => {
  const frame = frameEl();
  if (!el || !frame) return null;

  const f = frame.getBoundingClientRect();
  const r = el.getBoundingClientRect();
  // 그림이 아직 안 실려서 크기가 0일 때가 있다. 그때 뚫으면 엉뚱한 데 구멍이 난다.
  if (r.width === 0 || r.height === 0) return null;

  return {
    top: Math.round(r.top - f.top - frame.clientTop),
    left: Math.round(r.left - f.left - frame.clientLeft),
    width: Math.round(r.width),
    height: Math.round(r.height),
  };
};

// 한 단계가 여러 곳을 밝힐 수 있다. target 하나만 적어도 되고, targets로 여러 개를 적어도 된다.
const targetsOf = (step) => step?.targets ?? (step?.target ? [step.target] : []);

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

  /* 이 껍데기가 프레임 전체를 덮는다. 클릭을 받게 두면 구멍을 뚫어놔도
     그 위에서 껍데기가 먼저 가로채서 안의 버튼이 안 눌린다.
     막는 일은 아래의 어두운 판이 맡고, 껍데기는 통과시킨다. */
  pointer-events: none;
`;

// 어둡게 하는 일과 막는 일을 나눴다.
//
// 예전에는 어두운 판 네 조각이 둘 다 맡았는데, 그러면 구멍을 하나밖에 못 뚫는다.
// 온담 한마디와 뒤로가기처럼 떨어진 두 곳을 함께 밝힐 수가 없었다.
// 어둡게 하는 건 구멍을 여러 개 팔 수 있는 마스크가 맡고,
// 막는 건 아래의 투명한 판이 맡는다.
const Dim = styled.svg`
  position: absolute;
  inset: 0;
  pointer-events: none;
`;

// 클릭을 막는 판. 눈에는 안 보이고 가로막기만 한다.
const Panel = styled.div`
  position: absolute;
  pointer-events: auto;
`;

const glow = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
`;

// 뚫린 자리 둘레의 테. 클릭은 통과시켜서 진짜 버튼이 눌리게 둔다.
// border-box로 안 두면 테두리만큼(2px×2) 실제 뚫린 자리보다 커 보여서
// 자리마다 여백이 다르게 느껴진다. 모든 링이 정확히 같은 자리에 겹치도록 맞춘다.
//
// 한 단계에 자리가 여러 곳이면(팝업 전체 + 닫기 버튼처럼) 그중 첫 번째가
// 실제로 눌러야 하는 곳이다. 그 자리만 굵은 초록 테로 두드러지게 하고,
// 나머지는 '여기 있다'는 정도로만 옅게 보여준다. 색은 둘 다 초록 계열로 맞춘다.
const Ring = styled.div`
  position: absolute;
  box-sizing: border-box;
  border-radius: 14px;
  pointer-events: none;

  ${({ $primary }) =>
    $primary
      ? css`
          border: 3px solid #7c934a;
          box-shadow: 0 0 0 5px rgba(124, 147, 74, 0.32);
          animation: ${glow} 1.4s ease-in-out infinite;
        `
      : css`
          border: 1.5px dashed rgba(203, 216, 121, 0.85);
          box-shadow: 0 0 0 3px rgba(203, 216, 121, 0.16);
        `}
`;

const Bubble = styled.div`
  position: absolute;
  pointer-events: auto;
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

const FootRow = styled.div`
  margin-top: 6px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

// 발치의 '다음' 버튼 옆에 두면 매 단계 상호작용(팝업 열기·이동)에 묻혀서 잘
// 안 보였다. 어느 단계에서든 바로 눈에 띄도록 화면 우측 상단에 고정한다.
// 반투명 검정 배경은 뒤의 어두운 판과 색이 비슷해 묻혀 보였다. 밝은 배경으로
// 확실히 도드라지게 한다.
const SkipButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 1;
  pointer-events: auto;

  padding: 6px 12px;
  border-radius: 999px;
  border: 1px solid rgba(74, 58, 47, 0.35);
  background: #fffbf1;
  box-shadow: 0 2px 8px rgba(28, 20, 14, 0.35);

  color: #4a3a2f;
  font-family: 'Noto Sans KR';
  font-size: 13px;
  font-weight: 600;
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

// '이전'은 '다음/시작하기'보다 덜 중요한 동작이라 테두리만 있는 옅은 모양으로 둔다.
const PrevButton = styled.button`
  padding: 10px 16px;
  border-radius: 12px;
  border: 1.5px solid rgba(74, 58, 47, 0.35);
  background: transparent;
  color: #6b6661;
  font-family: 'Noto Sans KR';
  font-size: 14px;
  font-weight: 700;
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
  const [rects, setRects] = useState([]);
  const [labels, setLabels] = useState([]);
  const [frame, setFrame] = useState({ width: 402, height: 874 });

  // 되풀이해서 재는 함수가 늘 최신 단계를 보도록 따로 담아둔다.
  const indexRef = useRef(0);
  indexRef.current = index;

  // 'gone'(닫히면 다음으로)은 '한 번 열린 뒤 닫힘'과 '애초에 연 적이 없음'을
  // 구분해야 한다. '이전/다음' 버튼으로 이 단계에 수동으로 들어왔을 때는
  // 실제 팝업을 아직 안 열었을 수 있는데, 그때도 findTarget이 못 찾으면
  // '방금 닫혔다'로 착각해서 곧장 다음 단계로 튕겨나갔다.
  const seenAnchorRef = useRef(false);
  useEffect(() => {
    seenAnchorRef.current = false;
  }, [index]);

  const finish = useCallback(() => {
    markTourSeen();
    onClose();
  }, [onClose]);

  useEffect(() => {
    const tick = () => {
      const current = indexRef.current;
      const step = TOUR_STEPS[current];
      if (!step) return;

      const found = !step.anchor || Boolean(findTarget(step.anchor));
      if (found) seenAnchorRef.current = true;

      // 1) 앞으로 갈 때가 됐는지 먼저 본다.
      if (step.advance === 'next') {
        const next = TOUR_STEPS[current + 1];
        if (next && findTarget(next.anchor)) {
          setIndex(current + 1);
          return;
        }
      }
      if (step.advance === 'gone' && seenAnchorRef.current && !found) {
        if (current + 1 < TOUR_STEPS.length) setIndex(current + 1);
        else finish();
        return;
      }

      // 2) 지금 단계가 있을 자리인지 본다.
      //    자리가 없으면(아직 그 화면/팝업을 안 열었으면) 밝힐 구멍만 없이 두고
      //    안내 글은 그대로 보여준다. 예전에는 여기서 앞 단계 중 자리가 있는
      //    쪽으로 조용히 되돌렸는데, 그러면 '이전/다음' 버튼으로 옮긴 단계를
      //    이 코드가 마음대로 다시 튕겨서 순서대로 못 갔다.
      if (!found) {
        setRects((prev) => (prev.length === 0 ? prev : []));
        return;
      }

      // 3) 자리를 잰다.
      const frameNode = frameEl();
      if (frameNode) {
        setFrame((prev) =>
          prev.width === frameNode.clientWidth && prev.height === frameNode.clientHeight
            ? prev
            : { width: frameNode.clientWidth, height: frameNode.clientHeight },
        );
      }

      const nextRects = targetsOf(step)
        .map((name) => rectOf(findTarget(name)))
        .filter(Boolean);
      setRects((prev) =>
        prev.length === nextRects.length && prev.every((item, i) => sameRect(item, nextRects[i]))
          ? prev
          : nextRects,
      );

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
    const first = targetsOf(TOUR_STEPS[index])[0];
    if (!first) return undefined;

    let tries = 0;
    const timer = setInterval(() => {
      const el = findTarget(first);
      tries += 1;
      if (el) {
        // 'nearest'는 이미 화면 안에 있으면 안 움직여서, 위쪽에 걸친 자리는
        // 아래쪽 여백만 잔뜩 남기고 안 옮겨졌다. 가운데로 옮겨서 위아래
        // 여백이 고르게 남게 한다.
        el.scrollIntoView({ block: 'center', inline: 'center', behavior: 'smooth' });
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

  if (!step) return null;

  const dim = step.dim ?? DEFAULT_DIM;
  const clickAnywhere = step.advance === 'any';
  const onPanelClick = clickAnywhere ? goNext : undefined;

  const holes = rects.map((item) => ({
    top: item.top - PAD,
    left: item.left - PAD,
    width: item.width + PAD * 2,
    height: item.height + PAD * 2,
  }));
  // 클릭 막기는 '실제로 눌러야 하는' 첫 번째 구멍만 기준으로 잡는다(picker처럼
  // 팝업 전체 + 닫기 버튼을 함께 밝힐 때, 클릭 통과는 닫기 버튼 자리만 남긴다).
  const hole = holes[0] ?? null;

  // 말풍선 자리는 그 단계가 밝히는 자리 '전부'를 아우르는 사각형을 기준으로 잡는다.
  // 클릭 통과용 첫 번째 구멍만 기준으로 삼으면(예: picker의 닫기 버튼처럼 작은
  // 자리), 말풍선이 그 작은 자리 바로 밑에 붙어서 나머지 밝힌 영역(팝업 본문)과
  // 겹쳐 보인다.
  const boundsHole =
    holes.length === 0
      ? null
      : {
          top: Math.min(...holes.map((item) => item.top)),
          left: Math.min(...holes.map((item) => item.left)),
          right: Math.max(...holes.map((item) => item.left + item.width)),
          bottom: Math.max(...holes.map((item) => item.top + item.height)),
        };
  const boundsRect = boundsHole && {
    top: boundsHole.top,
    height: boundsHole.bottom - boundsHole.top,
  };

  // 구멍 아래에 자리가 있으면 아래, 없으면 위. 둘 다 좁으면(구멍이 화면을
  // 거의 다 차지하는 팝업 같은 때) 아래쪽에 겹쳐 둔다. 안 그러면 말풍선이
  // 화면 밖으로 밀려나 아예 안 보인다.
  const bubblePosition = (() => {
    if (boundsRect) {
      const NEEDED = 180;
      if (frame.height - (boundsRect.top + boundsRect.height) >= NEEDED) {
        return { top: boundsRect.top + boundsRect.height + 14 };
      }
      if (boundsRect.top >= NEEDED) return { bottom: frame.height - boundsRect.top + 14 };
      return { bottom: 16 };
    }
    // 하단 툴바 위에 이름표가 붙으므로 그만큼 더 띄운다. 175에서는 설명
    // 창과 툴바(+이름표)가 거의 맞닿아 보여서 간격을 더 벌린다.
    if (step.place === 'bottom') return { bottom: 205 };
    if (step.place === 'top') return { top: 120 };
    return { top: '50%', transform: 'translateY(-50%)' };
  })();

  return (
    <PopupPortal>
      <Root>
        {/* 어둡게 하는 일. 구멍을 여러 개 파도 한 장으로 그려진다. */}
        <Dim
          width={frame.width}
          height={frame.height}
          viewBox={`0 0 ${frame.width} ${frame.height}`}
        >
          <defs>
            <mask id={MASK_ID}>
              <rect x="0" y="0" width={frame.width} height={frame.height} fill="#fff" />
              {holes.map((item) => (
                <rect
                  key={`${item.top}-${item.left}`}
                  x={item.left}
                  y={item.top}
                  width={item.width}
                  height={item.height}
                  rx="14"
                  fill="#000"
                />
              ))}
            </mask>
          </defs>
          <rect
            x="0"
            y="0"
            width={frame.width}
            height={frame.height}
            fill={`rgba(28, 20, 14, ${dim})`}
            mask={`url(#${MASK_ID})`}
          />
        </Dim>

        {/* 어느 단계에서든 바로 눈에 띄도록 우측 상단에 고정해서 둔다. */}
        <SkipButton type="button" onClick={finish}>
          건너뛰기
        </SkipButton>

        {/* 막는 일. 통과 단계에서는 아예 깔지 않는다.
            구멍 자리만 비우고 나머지를 네 조각으로 덮어서, 구멍 안의 진짜 버튼만 눌린다. */}
        {!step.passthrough &&
          (hole ? (
            <>
              <Panel onClick={onPanelClick} style={{ top: 0, left: 0, right: 0, height: Math.max(hole.top, 0) }} />
              <Panel onClick={onPanelClick} style={{ top: hole.top + hole.height, left: 0, right: 0, bottom: 0 }} />
              <Panel onClick={onPanelClick} style={{ top: hole.top, left: 0, width: Math.max(hole.left, 0), height: hole.height }} />
              <Panel onClick={onPanelClick} style={{ top: hole.top, left: hole.left + hole.width, right: 0, height: hole.height }} />
            </>
          ) : (
            <Panel onClick={onPanelClick} style={{ inset: 0 }} />
          ))}

        {holes.map((item, itemIndex) => (
          <Ring
            key={`${item.top}-${item.left}`}
            $primary={itemIndex === 0}
            style={{ top: item.top, left: item.left, width: item.width, height: item.height }}
          />
        ))}

        {labels.map((label) => (
          <MapLabel
            key={label.target}
            style={{
              left: label.rect.left + label.rect.width / 2,
              // 상단 아이콘(below)은 이름표가 바로 밑에 거의 붙어야 한눈에
              // 어느 아이콘 이름인지 알 수 있다. 하단 아이콘(above)은 그 위의
              // 안내 창과 겹치지 않도록 조금 더 띄운다.
              ...(label.side === 'above'
                ? { top: Math.max(label.rect.top - 34, 4) }
                : { top: label.rect.top + label.rect.height + 4 }),
            }}
          >
            {label.text}
          </MapLabel>
        ))}

        <Bubble style={bubblePosition} onClick={(event) => event.stopPropagation()}>
          <Title>{step.title}</Title>
          <Body>{step.body}</Body>

          <FootRow>
            {/* 첫 단계는 '시작하기' 하나만 둔다. 그다음부터는 이전/다음으로 오간다. */}
            {index > 0 ? (
              <PrevButton type="button" onClick={() => setIndex(index - 1)}>
                이전
              </PrevButton>
            ) : (
              <span />
            )}
            <ActionButton type="button" onClick={goNext}>
              {step.action ?? '다음'}
            </ActionButton>
          </FootRow>
        </Bubble>
      </Root>
    </PopupPortal>
  );
}

export default TourOverlay;
