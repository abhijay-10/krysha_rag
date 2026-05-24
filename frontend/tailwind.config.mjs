/** @type {import('tailwindcss').Config} */
const config = {
  darkMode: 'class',
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        noupe: {
          bg: "#FFFBF5",
          accent: "#EA580C",
        }
      }
    },
  },
  plugins: [],
};

export default config;