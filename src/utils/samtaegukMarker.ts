/** 부산 지하철 환승역 표기용 삼태극(삼원색 회전 문양) SVG */
export function createSamtaegukSvg(size: number): string {
  const commaPath =
    'M20 6 C13 6 8 13 9.5 19.5 C10.5 23.5 14.5 26 20 24 C21.5 19 21 12.5 20 6 Z'

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 40 40" aria-hidden="true">
  <circle cx="20" cy="20" r="18.5" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
  <path fill="#E53935" d="${commaPath}"/>
  <path fill="#1E88E5" d="${commaPath}" transform="rotate(120 20 20)"/>
  <path fill="#FDD835" d="${commaPath}" transform="rotate(240 20 20)"/>
  <circle cx="20" cy="20" r="17.5" fill="none" stroke="#ffffff" stroke-width="2"/>
</svg>`
}
