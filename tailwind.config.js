/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./*.tsx",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Custom color palette for DietWise
        'bg-default': 'var(--bg-default)',
        'bg-card': 'var(--bg-card)',
        'text-default': 'var(--text-default)',
        'text-alt': 'var(--text-alt)',
        'border-default': 'var(--border-default)',
      },
    },
  },
  plugins: [],
}