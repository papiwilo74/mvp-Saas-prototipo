/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff7ed',
          100: '#ffedd5',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c'
        },
        ink: '#141414',
        admin: {
          bg: '#fafaf9',
          card: '#ffffff',
          border: '#e7e5e4',
          muted: '#78716c'
        }
      },
      boxShadow: {
        soft: '0 16px 40px rgba(20, 20, 20, 0.08)'
      }
    }
  },
  plugins: []
};
