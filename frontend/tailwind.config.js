/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        'layout-dark': '#2a2a2b',
        'orange': '#eb6652',
        'orange-light': '#FFF3E0',
        'layout-dark-lighter': '#333333',
        'ghost-white': '#BEBDBD'
      },
    },
  },
  plugins: [],
};
