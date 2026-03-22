/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#22c55e',
          50:  '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        gold: {
          DEFAULT: '#f59e0b',
          light: '#fbbf24',
          dark: '#d97706',
        },
        cream: '#f1f5f0',
        surface: {
          DEFAULT: '#151c25',
          light: '#1e2a38',
          deep: '#0d1117',
        },
        secondary: '#FFD700',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'emerald-glow': '0 0 20px rgba(34, 197, 94, 0.35)',
        'emerald-sm':   '0 0 10px rgba(34, 197, 94, 0.2)',
        'gold-glow':    '0 0 20px rgba(245, 158, 11, 0.3)',
        'card':         '0 4px 24px rgba(0,0,0,0.35)',
        'card-hover':   '0 12px 40px rgba(0,0,0,0.5)',
      },
      backgroundImage: {
        'radial-dark': 'radial-gradient(ellipse at top, #1a2e1c 0%, #0d1117 60%)',
        'hero-overlay': 'linear-gradient(135deg, rgba(13,17,23,0.92) 0%, rgba(13,17,23,0.6) 100%)',
        'card-gradient': 'linear-gradient(to top, rgba(13,17,23,0.95) 0%, transparent 60%)',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'fade-in':    'fadeIn 0.5s ease-out forwards',
        shimmer:      'shimmer 2s infinite',
        'pulse-dot':  'pulseDot 1.5s ease-in-out infinite',
      },
      keyframes: {
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseDot: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%':      { transform: 'scale(1.3)', opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
};