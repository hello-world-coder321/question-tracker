/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    'bg-slate-500',      // New Basic color
    'bg-slate-500/10',   // New Basic track
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