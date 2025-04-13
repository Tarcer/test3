/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}", 
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
      border: 'rgb(229 231 235)',
      background: '#f0f0f0'
    },
    },
  },
  plugins: [],
}
