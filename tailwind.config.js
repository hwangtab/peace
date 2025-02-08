/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Pretendard-Regular', ...require('tailwindcss/defaultTheme').fontFamily.sans],
        'serif': ['BookkMyungjo-Bd', ...require('tailwindcss/defaultTheme').fontFamily.serif],
      },
      colors: {
        'sage-gray': '#D3D5D4',
        'pure-white': '#FFFFFF',
        'deep-sage': '#9DA39D',
        'light-beige': '#F5F5F5',
        'text-dark': '#1A1A1A',
      },
    },
  },
  plugins: [],
}
