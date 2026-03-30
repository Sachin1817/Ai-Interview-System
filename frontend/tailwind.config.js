/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0F172A',
          card: '#1E293B',
          text: '#E2E8F0',
        },
        light: {
          bg: '#F8FAFC',
          card: '#FFFFFF',
          text: '#0F172A',
        },
        accent: '#6366F1',
      }
    },
  },
  plugins: [],
}
