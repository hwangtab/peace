/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['GMarketSans', ...require('tailwindcss/defaultTheme').fontFamily.sans],
        'serif': ['BookkMyungjo-Bd', ...require('tailwindcss/defaultTheme').fontFamily.serif],
        // Semantic Typography
        'display': ['BookkMyungjo-Bd', ...require('tailwindcss/defaultTheme').fontFamily.serif],
        'partial': ['PartialSans', 'sans-serif'],
        'stone': ['KkuBulLim', 'sans-serif'],
        'body': ['GMarketSans', ...require('tailwindcss/defaultTheme').fontFamily.sans],
        'caption': ['S-CoreDream-3Light', 'sans-serif'],
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

        // Section-Specific
        'camp-blue': '#0A5F8A',
        'album-gold': '#FDB44B',
        'event-coral': '#FF8C69',

        // Legacy colors (for backward compatibility)
        'sage-gray': '#D3D5D4',
        'pure-white': '#FFFFFF',
        'deep-sage': '#9DA39D',
        'light-beige': '#F5F5F5',
        'text-dark': '#1A1A1A',
      },
      backgroundImage: {
        'ocean-gradient': 'linear-gradient(135deg, #0A5F8A 0%, #4A90B8 100%)',
        'sky-gradient': 'linear-gradient(180deg, #87CEEB 0%, #D4E9F7 100%)',
        'sunset-gradient': 'linear-gradient(135deg, #FDB44B 0%, #FF8C69 100%)',
        'hero-gradient': 'linear-gradient(0deg, rgba(26, 35, 50, 0.8) 0%, rgba(26, 35, 50, 0.1) 70%, transparent 100%)',
      },
    },
  },
  plugins: [],
}
