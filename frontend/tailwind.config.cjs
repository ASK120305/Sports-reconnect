/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Dark Sports-Tech Theme
        charcoal: '#0F1216',
        secondary: '#151A1F',
        card: '#1B2026',
        cardHover: '#222831',
        border: '#2A3038',
        
        // Primary Accent (Neon Green)
        primary: '#7CDE5A',
        primaryHover: '#8FEA4A',
        
        // Secondary Accent (Cyan/Teal)
        accent: '#00B3A4',
        accentHover: '#00C2B8',
        
        // Typography
        heading: '#FFFFFF',
        textPrimary: '#E6EAF0',
        textSecondary: '#B0B7C3',
        textMuted: '#7A808A',
        
        // Legacy brand colors (for backward compatibility)
        brand: {
          900: '#005461',
          700: '#018790',
          500: '#00B3A4',
          100: '#E6EAF0',
        },
        surface: '#0F1216',
      },
      fontFamily: {
        display: ['Manrope', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 8px 24px rgba(0, 0, 0, 0.35)',
        'glow-green': '0 8px 24px rgba(124, 222, 90, 0.25)',
        'glow-teal': '0 8px 24px rgba(0, 179, 164, 0.25)',
      },
      borderRadius: {
        'card': '10px',
      },
    },
  },
  plugins: [],
};
