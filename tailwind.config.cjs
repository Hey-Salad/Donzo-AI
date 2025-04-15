/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'donzo-primary': '#112231',
        'donzo-secondary': '#016B83',
        'donzo-accent': '#FF4F40',
        'donzo-light': '#F2F8F3',
        'donzo-bright': '#C3FF34',
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        donzo: {
          primary: '#112231',
          secondary: '#016B83',
          accent: '#FF4F40',
          neutral: '#F2F8F3',
          'base-100': '#ffffff',
        },
      },
    ],
  },
}