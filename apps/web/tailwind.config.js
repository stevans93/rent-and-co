/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#e85d45',
          hover: '#d54d35',
          light: '#ff7b66',
        },
        accent: {
          blue: '#3b82f6',
          purple: '#8b5cf6',
          teal: '#14b8a6',
        },
        dark: {
          DEFAULT: '#0f0f0f',
          50: '#1a1a1a',
          100: '#242424',
          200: '#2d2d2d',
          300: '#363636',
          400: '#404040',
          500: '#525252',
          600: '#737373',
        },
      },
      backgroundImage: {
        'gradient-dark': 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        'gradient-card': 'linear-gradient(145deg, #242424 0%, #1a1a1a 100%)',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(232, 93, 69, 0.3)',
        'glow-sm': '0 0 10px rgba(232, 93, 69, 0.2)',
      },
    },
  },
  plugins: [],
};
