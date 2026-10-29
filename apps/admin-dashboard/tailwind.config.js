/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#071D42',
          blue: '#1677E8',
          blueDark: '#0b52a8',
          bg: '#F4F7FB',
          card: '#FFFFFF',
          border: '#D8E2ED',
          success: '#10B981',
          warning: '#F59E0B',
          danger: '#EF4444',
        }
      }
    },
  },
  plugins: [],
}
