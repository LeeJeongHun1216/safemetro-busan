/** 부산 지하철 환승역 표기용 삼태극 — 원형, 반시계 방향 빨강→파랑→노랑 */
export function createSamtaegukSvg(size: number): string {
  const r = 46
  const x2 = (r * Math.sin((2 * Math.PI) / 3)).toFixed(2)
  const y2 = (r * (1 - Math.cos((2 * Math.PI) / 3))).toFixed(2)

  /** 120° 호 + 중심 (세 조각이 원을 정확히 채움) */
  const lobe = `M0,-${r} A${r},${r} 0 0,1 ${x2},${y2} L0,0 Z`

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100" aria-hidden="true">
  <defs>
    <clipPath id="sam-circle"><circle cx="50" cy="50" r="48"/></clipPath>
  </defs>
  <g clip-path="url(#sam-circle)">
    <g transform="translate(50,50)">
      <path fill="#D11521" transform="rotate(30)" d="${lobe}"/>
      <path fill="#1B26B1" transform="rotate(150)" d="${lobe}"/>
      <path fill="#FFEF00" transform="rotate(270)" d="${lobe}"/>
    </g>
  </g>
  <circle cx="50" cy="50" r="48" fill="none" stroke="#ffffff" stroke-width="3"/>
</svg>`
}
