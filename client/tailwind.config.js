/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        cyber: {
          red: '#ff0000',
          darkred: '#8b0000',
          crimson: '#dc143c',
          bloodred: '#660000',
        },
      },
      animation: {
        'matrix-fall': 'matrix-fall 20s linear infinite',
        'code-scroll': 'code-scroll 30s linear infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
      },
      keyframes: {
        'matrix-fall': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        'code-scroll': {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-50%)' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '1', textShadow: '0 0 10px rgba(255, 0, 0, 0.8)' },
          '50%': { opacity: '0.8', textShadow: '0 0 20px rgba(255, 0, 0, 1)' },
        },
      },
    },
  },
  plugins: [],
}
