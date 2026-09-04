/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./pages/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        // 가로 내비게이션이 (가장 긴 언어 기준으로도) 넉넉한 간격을 두고
        // 한 줄에 들어가는 최소 폭. 이 미만은 메뉴가 빡빡해지므로 햄버거로 전환.
        // 최상위 항목을 줄인 뒤(연대→커뮤니티 하위) 1280px에서도 gap-x-4 여유 확보.
        nav: '1280px',
      },
      fontFamily: {
        // 스택은 src/index.css 의 --font-sans / --font-serif 가 로케일(html:lang)별로
        // 정의한다 — 여기서 family 를 나열하면 로케일 분기가 무력화돼 다른 언어 폰트까지
        // 내려받는다(2026-09-04). 새 토큰도 변수를 참조할 것.
        sans: ['var(--font-sans)'],
        serif: ['var(--font-serif)'],
        display: ['var(--font-serif)'],
        // 포인트 폰트: 도착 전 플랫폼별 메트릭 폴백(index.css @font-face) → 로케일 sans 스택
        partial: [
          'PartialSans',
          'PartialSans Fallback Apple',
          'PartialSans Fallback CJK',
          'var(--font-sans)',
        ],
        body: ['var(--font-sans)'],
        caption: ['var(--font-sans)'],
      },
      colors: {
        // Ocean Blues (Primary)
        'jeju-ocean': '#0A5F8A',
        'ocean-mist': '#4A90B8',
        'seafoam': '#B8D8E8',

        // Sky Blues
        'jeju-sky': '#87CEEB',
        'sky-horizon': '#D4E9F7',

        // Sunlight Accents
        'golden-sun': '#FDB44B',
        'sunset-coral': '#FF8C69',
        'sunlight-glow': '#FFF4E0',

        // Neutral Base
        'cloud-white': '#FFFFFF',
        'ocean-sand': '#F8F9FA',
        'coastal-gray': '#6B7C8A',
        'deep-ocean': '#1A2332',

        'light-beige': '#F5F5F5',
      },
      backgroundImage: {
        'ocean-gradient': 'linear-gradient(135deg, #0A5F8A 0%, #4A90B8 100%)',
        'sky-gradient': 'linear-gradient(180deg, #87CEEB 0%, #D4E9F7 100%)',
        'sunset-gradient': 'linear-gradient(135deg, #FDB44B 0%, #FF8C69 100%)',
        'hero-gradient': 'linear-gradient(0deg, rgba(26, 35, 50, 0.8) 0%, rgba(26, 35, 50, 0.1) 70%, transparent 100%)',
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        '.hyphens-none': {
          hyphens: 'none',
        },
        '.hyphens-manual': {
          hyphens: 'manual',
        },
        '.hyphens-auto': {
          hyphens: 'auto',
        },
      })
    },
  ],
}
