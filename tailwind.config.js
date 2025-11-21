/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
      },
      colors: {
        primary: '#6C63FF',
        secondary: '#FFFFFF',
        'gray-light': '#F5F5F5',
        'gray-medium': '#A0A0A0',
        'gray-dark': '#333333',
        success: '#10B981',
        danger: '#EF4444',
        'blue-light': '#3B82F6',
      },
    },
  },
  plugins: [],
};
