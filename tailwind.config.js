/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // This tells Tailwind to keep these classes even if it doesn't "see" them in your HTML
  safelist: [
    'bg-emerald-500',
    'bg-amber-500',
    'bg-rose-500',
    'bg-emerald-500/10',
    'bg-amber-500/10',
    'bg-rose-500/10',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}