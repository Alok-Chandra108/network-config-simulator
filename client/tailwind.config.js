/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // This tells Tailwind to look for class names in all JS, TS, JSX, TSX files in src/
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}