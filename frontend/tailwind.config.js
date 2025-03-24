/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      screens: {
        break2: "200px",
        break3: "300px",
        break4: "400px",
        break5: "500px",
        break6: "600px",
        break7: "700px",
        break8: "800px",
        break9: "900px",
        break10: "1000px",
        break11: "1100px",
        break12: "1200px",
        break13: "1300px",
        break14: "1400px",
        break15: "1500px",
        break16: "1600px",
        break17: "1700px",
        break18: "1800px",
      },
      colors: {
        "layout-dark": "#2a2a2b",
        orange: "#eb6652",
        "orange-light": "#FFF3E0",
        "layout-dark-lighter": "#333333",
        "ghost-white": "#BEBDBD",
        "lightest-gray": "#f7f7f7",
      },
      backgroundImage: {
        "hero-image":
          "url('https://amdesign.rs/rent&co/images/home/home-1.jpg')",
      },
    },
  },
  plugins: [],
};
