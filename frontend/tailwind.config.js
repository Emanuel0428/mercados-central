/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#4CAF50',
        secondary: '#FFD700',
        background: {
          light: '#FFFFFF',
          dark: '#1a1a1a',
        }
      },
    },
  },
  plugins: [],
};