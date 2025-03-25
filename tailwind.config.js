/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        "max-md": { max: "767px" }, // Custom max-width 768px breakpoint
        'max-sm': { max: '639px' }, // Targets screen sizes <= 639px
        'max-xs': { max: '446px' }, // Targets screen sizes <= 479px
      },
    },
  },
  plugins: [],
}

