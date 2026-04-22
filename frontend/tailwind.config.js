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
          bg: '#020617',
          card: '#0f172a',
          text: '#f1f5f9',
          border: '#1e293b'
        },
        light: {
          bg: '#f8fafc',
          card: '#ffffff',
          text: '#0f172a',
          border: '#e2e8f0'
        },
        accent: {
          DEFAULT: '#6366f1',
          glow: '#818cf8',
        },
        cyan: {
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'premium-gradient': 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)',
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
      },
      boxShadow: {
        'glow-primary': '0 0 20px rgba(99, 102, 241, 0.3)',
        'glow-cyan': '0 0 20px rgba(34, 211, 238, 0.3)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
      },
      animation: {
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        }
      }
    },
  },
  plugins: [],
}
