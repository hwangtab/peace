/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./pages/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // 본문/UI 산스는 모두 S-Core Dream(에스코어드림) 단일 family.
        // 굵기는 font-weight 유틸리티(font-light/normal/medium/bold)로 제어.
        'sans': ['SCDream', ...require('tailwindcss/defaultTheme').fontFamily.sans],
        'serif': ['BookkMyungjo-Bd', ...require('tailwindcss/defaultTheme').fontFamily.serif],
        // Semantic Typography
        'display': ['BookkMyungjo-Bd', ...require('tailwindcss/defaultTheme').fontFamily.serif],
        // PartialSans 는 디자인 폰트라 글리프가 ~3030 자뿐(확장 완성형 미지원).
        // '뮁' 같은 글자는 PartialSans 에 없으므로, 글리프 단위 폴백으로 SCDream 이
        // 받아 그리도록 본문 폰트를 스택에 끼운다(없으면 OS sans → 두부/공백).
        'partial': ['PartialSans', 'SCDream', 'sans-serif'],
        'body': ['SCDream', ...require('tailwindcss/defaultTheme').fontFamily.sans],
        'caption': ['SCDream', ...require('tailwindcss/defaultTheme').fontFamily.sans],
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
