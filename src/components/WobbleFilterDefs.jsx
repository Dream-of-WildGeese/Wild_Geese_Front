// Figma의 카드/칩/뱃지 테두리는 전부 손으로 그린 듯 살짝 울퉁불퉁하다(완전한
// 직선이 아니다). 컴포넌트마다 크기가 달라 SVG 경로를 미리 그려둘 수 없어서,
// 대신 SVG 필터(노이즈로 테두리만 살짝 어긋나게 만드는 feDisplacementMap)를
// 한 번 심어두고 각 컴포넌트가 재사용한다 (src/styles/wobble.js 참고).
// 화면에 아무것도 그리지 않으므로 앱에서 한 번만 마운트하면 된다.
function WobbleFilterDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <defs>
        <filter id="wobbly-border" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.06"
            numOctaves="2"
            seed="7"
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="2.6"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
  );
}

export default WobbleFilterDefs;
