/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./**/*.html",
    "./js/**/*.js",
    "!./node_modules/**/*",
    "./src/**/*.{html,js}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#3490dc",
      },
      fontFamily: {
        body: ['"Open Sans"', "sans-serif"],
        heading: ['"Poppins"', "sans-serif"],
      },
    },
  },
  plugins: [],
};
