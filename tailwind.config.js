/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: "jit",
  darkMode: "class",
  content: ["./src/**/*.tsx"],
  theme: {
    extend: {
      colors: {
        cookie: {
          50: "#fef7ed",
          100: "#fdecd4",
          200: "#fad5a8",
          300: "#f6b871",
          400: "#f19038",
          500: "#ee7613",
          600: "#df5c09",
          700: "#b9440a",
          800: "#933610",
          900: "#772e10"
        }
      }
    }
  },
  plugins: []
}
