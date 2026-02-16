/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Ye line ensure karti hai ki src folder ke saare components style hon
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(217, 33%, 17%)",
        background: "hsl(222, 47%, 7%)",
        foreground: "hsl(220, 13%, 91%)",
        primary: "hsl(217, 91%, 60%)",
        card: "hsl(222, 47%, 11%)",
      }
    },
  },
  plugins: [],
}