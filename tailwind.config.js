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
          navy: '#104A96',
          'deep-navy': '#07366F',
          orange: '#FF8500',
          'orange-hover': '#e67700',
          green: '#35A936',
          'light-blue': '#F1F7FF',
          'light-grey': '#F7F9FC',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'Poppins', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 4px 20px -2px rgba(16, 74, 150, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 12px 30px -4px rgba(16, 74, 150, 0.16), 0 4px 10px -2px rgba(0, 0, 0, 0.06)',
        'nav': '0 4px 20px -2px rgba(7, 54, 111, 0.08)',
      }
    },
  },
  plugins: [],
}

