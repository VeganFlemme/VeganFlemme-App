/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdf7',
          100: '#dcfce7',
          500: '#20c997', // VeganFlemme brand green
          600: '#1ca685',
          700: '#188373',
          900: '#0f3f2f',
        },
        neutral: {
          50: '#f2f4f0', // VeganFlemme ivory
          100: '#e8ebe5',
          900: '#1a1a1a',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}