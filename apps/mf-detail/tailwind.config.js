/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {},
  },
  safelist: [
    'bg-orange-500', 'bg-blue-500', 'bg-emerald-600', 'bg-amber-400', 'bg-purple-600',
    'bg-indigo-600', 'bg-lime-600', 'bg-slate-500', 'bg-amber-700', 'bg-pink-500',
    'bg-red-700', 'bg-pink-600', 'bg-yellow-800', 'bg-violet-800', 'bg-cyan-400',
    'bg-indigo-700', 'bg-slate-400', 'bg-gray-800', 'bg-gray-500', 'bg-red-500',
  ],
  plugins: [],
};
