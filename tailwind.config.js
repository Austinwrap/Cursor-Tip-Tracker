/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#000000",
        text: "#D3D3D3",
        accent: "#FFFFFF",
        hover: "#333333",
      },
      fontFamily: {
        sans: ["Inter", "Roboto", "sans-serif"],
      },
      fontSize: {
        body: "16px",
        heading: "24px",
        small: "12px",
      },
    },
  },
  plugins: [],
} 