/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        geometric: ['"Inter"', '"Space Grotesk"', 'sans-serif'],
        tall: ['"Antonio"', '"Bebas Neue"', '"Anton"', 'sans-serif'],
        condensed: ['"Anton"', '"Antonio"', '"Space Grotesk"', 'sans-serif'],
        serif: ['"Cormorant Garamond"', '"Cinzel"', 'serif'],
        roman: ['"Cinzel"', '"Cormorant Garamond"', 'serif'],
        mono: ['"JetBrains Mono"', '"IBM Plex Mono"', 'monospace'],
        sans: ['"Inter"', '"Space Grotesk"', 'sans-serif'],
      },
      colors: {
        cosmic: {
          950: '#020409',
          900: '#050a14',
          850: '#09101f',
          gold: '#eac078',
          amberGlow: '#ffb347',
          cyanGlow: '#6df0ff',
        },
      },
    },
  },
  plugins: [],
};
