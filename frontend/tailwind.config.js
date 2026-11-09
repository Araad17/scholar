/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Vazirmatn', 'Tahoma', 'sans-serif'] },
      colors: {
        lapis: { DEFAULT: '#1B3A6B', dark: '#12264A', light: '#E6ECF6' },
        saffron: { DEFAULT: '#E8A317', dark: '#B97F08' },
        paper: '#F5F6FA',
        ink: '#14213D',
      },
    },
  },
  plugins: [],
};
