/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        forest: '#1f352d',
        moss: '#607268',
        sand: '#f3efe8',
        stone: '#e9e2d8',
        clay: '#b98d6b',
        olive: '#7d8d7b',
        ink: '#1a1d1b',
        paper: '#f7f4ef',
      },
      fontFamily: {
        sans: ['Noto Sans SC', 'Inter', 'sans-serif'],
        serif: ['Noto Serif SC', 'Cormorant Garamond', 'serif'],
      },
      boxShadow: {
        soft: '0 12px 30px rgba(20, 28, 25, 0.08)',
      },
      backgroundImage: {
        grain: 'radial-gradient(circle at 20% 20%, rgba(31,53,45,0.06), transparent 35%), radial-gradient(circle at 80% 0%, rgba(124,135,116,0.08), transparent 30%)',
      },
    },
  },
  plugins: [],
};

