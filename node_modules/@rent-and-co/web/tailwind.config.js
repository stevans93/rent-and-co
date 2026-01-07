/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#e85d45',
          hover: '#d54d35',
        },
        dark: {
          DEFAULT: '#1a1a1a',
          light: '#2a2a2a',
        },
      },
    },
  },
  plugins: [],
};
