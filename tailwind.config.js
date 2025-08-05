/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        // allows you to use className="bg-hero" for your home BG
        hero: "url('/images/homeBG.jpg')",
      },
      colors: {
        primary: { DEFAULT: "#004369", light: "#2e6b8c", dark: "#002e46" },
        accent: { DEFAULT: "#01949A", light: "#2dc4c9", dark: "#017a7e" },
        sand: "#E5DDC8",
        neutral: {
          100: "#F3F4F6",
          200: "#E5E7EB",
          300: "#D1D5DB",
          400: "#9CA3AF",
          500: "#6B7280",
          600: "#4B5563",
          700: "#374151",
          800: "#1F2937",
        },
      },
    },
  },
  plugins: [],
};
