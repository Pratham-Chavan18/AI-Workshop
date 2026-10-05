import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: '#000000',
        input: '#000000',
        ring: '#4da2ff',
        background: '#ffffff',
        foreground: '#000000',
        // Slush Palette
        slush: {
          carbon: '#000000',
          paper: '#ffffff',
          sky: '#dceeff',
          concrete: '#cccccc',
          mist: '#e9e9e9',
          electric: '#4da2ff',
          mint: '#55db9c',
          lavender: '#e9ccff',
          ember: '#fb4903',
          sunburst: '#ffd731',
          voltage: '#5c4ade',
        },
        primary: {
          DEFAULT: '#000000',
          foreground: '#ffffff',
          electric: '#4da2ff',
        },
        secondary: {
          DEFAULT: '#dceeff',
          foreground: '#000000',
        },
        destructive: {
          DEFAULT: '#fb4903',
          foreground: '#ffffff',
        },
        muted: {
          DEFAULT: '#e9e9e9',
          foreground: '#444444',
        },
        accent: {
          DEFAULT: '#e9ccff',
          foreground: '#000000',
        },
        card: {
          DEFAULT: '#ffffff',
          foreground: '#000000',
        },
      },
      borderRadius: {
        pill: '1600px',
        card: '24px',
        elevated: '40px',
        body: '30px',
      },
      fontFamily: {
        display: ['Antonio', 'Lateral', 'system-ui', 'sans-serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
