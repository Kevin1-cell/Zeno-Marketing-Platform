/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        'zeno-dark': '#050d1a',
        'zeno-card': '#0a1628',
        'zeno-blue': '#1e6fff',
        'zeno-orange': '#ff8c00',
        'zeno-text': '#ffffff',
        'zeno-text-sec': '#94a3b8',
        'zeno-border': '#1e3a5f',
        'zeno-success': '#22c55e',
        'zeno-alert': '#f59e0b',
      },
    },
  },
  plugins: [],
}