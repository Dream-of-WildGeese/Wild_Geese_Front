import { css } from 'styled-components';

// 카드/칩/뱃지의 실제 테두리는 이 mixin이 그리는 게 아니라, 이 mixin이 만든
// 빈 ::before 위에 SVG 필터(WobbleFilterDefs)를 씌워서 그린다. 내용물이 없는
// 별도 레이어라서 필터가 텍스트까지 왜곡시키지 않는다 — 부모에 직접 필터를
// 걸면 안쪽 글자까지 같이 울렁거린다.
//
// 이 mixin을 쓰는 컴포넌트는 자기 border를 지워야 한다(borderWidth를 여기서
// 함께 그리므로 둘 다 그리면 두 겹으로 보인다).
export const wobblyBorder = ({ radius = 18, width = 1.5, color = 'rgba(74, 58, 47, 0.4)' }) => css`
  position: relative;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: ${radius}px;
    border: ${width}px solid ${color};
    filter: url(#wobbly-border);
    pointer-events: none;
  }
`;
