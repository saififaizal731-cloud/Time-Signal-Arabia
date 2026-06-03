/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Instrument Serif', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        background: '#FFFFFF',
        foreground: '#000000',
        muted: '#6F6F6F',
      },
      keyframes: {
        'fade-rise': {
          'from': { opacity: '0', transform: 'translateY(20px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-rise': 'fade-rise 0.8s ease-out forwards',
        'fade-rise-delay': 'fade-rise 0.8s ease-out forwards 0.2s',
        'fade-rise-delay-2': 'fade-rise 0.8s ease-out forwards 0.4s',
      },
      letterSpacing: {
        tight: '-2.46px',
      },
    },
  },
  plugins: [],
}
