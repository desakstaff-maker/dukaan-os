/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#5f259f', // PhonePe Purple
          dark: '#4a1a7e',
        },
        accent: {
          DEFAULT: '#ff9900', // Amazon Yellow
          dark: '#e68a00',
        }
      },
    },
  },
  plugins: [],
}
