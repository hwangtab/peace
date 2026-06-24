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
        // 본문/UI 산스는 모두 S-Core Dream(에스코어드림) 단일 family.
        // 굵기는 font-weight 유틸리티(font-light/normal/medium/bold)로 제어.
        // BookkMyungjo-Bd 를 한글 폴백으로 끼운다: SCDream·PartialSans 둘 다
        // '뮁'·'읭' 같은 확장 완성형 음절 글리프가 비어(없거나 빈 outline) 깨지는데,
        // 이 글자들만 명조가 받아 그린다. (서브셋 단계에서 SCDream 의 빈 글리프
        // cmap 을 제거해 폴백이 실제로 명조까지 도달하도록 했다 — scripts/subset-fonts.py)
        'sans': ['SCDream', 'BookkMyungjo-Bd', ...require('tailwindcss/defaultTheme').fontFamily.sans],
        'serif': ['BookkMyungjo-Bd', ...require('tailwindcss/defaultTheme').fontFamily.serif],
        // Semantic Typography
        'display': ['BookkMyungjo-Bd', ...require('tailwindcss/defaultTheme').fontFamily.serif],
        'partial': ['PartialSans', 'SCDream', 'BookkMyungjo-Bd', 'sans-serif'],
        'body': ['SCDream', 'BookkMyungjo-Bd', ...require('tailwindcss/defaultTheme').fontFamily.sans],
        'caption': ['SCDream', 'BookkMyungjo-Bd', ...require('tailwindcss/defaultTheme').fontFamily.sans],
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
