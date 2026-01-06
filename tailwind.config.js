/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./index.tsx",
    "./App.tsx",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./services/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
      },
      colors: {
        primary: '#4361ee',
        'primary-dark': '#3a56d4',
        secondary: '#3f37c9',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        dark: '#1e293b',
        light: '#f8fafc',
        surface: '#ffffff',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'card': '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)',
        'float': '0 10px 25px -5px rgba(67, 97, 238, 0.25)',
      }
    },
  },
  plugins: [],
}