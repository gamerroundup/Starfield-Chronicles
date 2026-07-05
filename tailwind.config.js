/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        space: {
          950: '#030308',
          900: '#070714',
          800: '#0d0d26',
          700: '#14143a',
          600: '#1d1d4f',
        },
        constellation: {
          cyan: '#00f0ff',
          orange: '#ff8a00',
          yellow: '#ffcc00',
          violet: '#a855f7',
          blue: '#3b82f6',
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      boxShadow: {
        'glow-cyan': '0 0 15px rgba(0, 240, 255, 0.4)',
        'glow-orange': '0 0 15px rgba(255, 138, 0, 0.4)',
      }
    },
  },
  plugins: [],
};
