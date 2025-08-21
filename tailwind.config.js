module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./features/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'fade-in-down': 'fade-in-down 0.3s ease-out',
        'shake': 'shake 0.8s ease-in-out infinite',
        'phone-ring': 'phoneRing 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': {opacity: 0, transform: 'translateY(10px)'},
          '100%': {opacity: 1, transform: 'translateY(0)'},
        },
        'fade-in-down': {
          '0%': { opacity: 0, transform: 'translateY(-10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        shake: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'rotate(-10deg)' },
          '20%, 40%, 60%, 80%': { transform: 'rotate(10deg)' },
        },
        phoneRing: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '2%, 6%': { transform: 'rotate(-15deg)' },
          '4%, 8%': { transform: 'rotate(15deg)' },
          '10%, 90%': { transform: 'rotate(0deg)' },
        }
      },
    },
  },
  plugins: [require("daisyui")],
}