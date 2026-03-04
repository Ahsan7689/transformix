/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['"Clash Display"', '"Space Grotesk"', 'sans-serif'],
        body: ['"Satoshi"', '"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      },
      colors: {
        // Light theme
        'light-primary': '#75BDE0',
        'light-accent': '#F8D49B',
        // Dark theme
        'dark-primary': '#F89B9B',
        'dark-accent': '#F8D49B',
      }
    }
  },
  plugins: []
}
