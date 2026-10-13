/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0B0F14',
          surface: '#151B24',
          border: 'rgba(255, 255, 255, 0.1)',
        },
        brand: {
          DEFAULT: '#16A34A',
          light: '#22C55E',
        }
      },
    },
  },
  plugins: [],
}
