/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          900: '#005461',
          700: '#018790',
          500: '#00B7B5',
          100: '#F4F4F4',
        },
        surface: '#0b1a1f',
      },
      fontFamily: {
        display: ['Manrope', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 10px 50px rgba(0, 183, 181, 0.35)',
      },
    },
  },
  plugins: [],
};
