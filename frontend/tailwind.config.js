/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        kameron: ['Kameron', 'serif'],
        dm: ['DM Sans', 'sans-serif'],
      },
      colors: {
        sky: {
          light: '#E0F2FE',
          mid: '#BAE6FD',
        },
        gold: '#D4A017',
      },
    },
  },
  plugins: [],
}