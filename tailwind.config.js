/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        "bg-primary": "#1C1C1E",
        "surface": "#2C2C2E",
        "surface-hover": "#3A3A3C",
        "text-primary": "#FFFFFF",
        "text-secondary": "#BBBBBB",
        "text-disabled": "#666666",
        "accent-blue": "#4A90E2",
        "accent-purple": "#7D5BFF",
        "alert-danger": "#FF6B6B",
        "glass-border": "rgba(255, 255, 255, 0.05)",
      },
      fontFamily: {
        "display": ["Inter", "sans-serif"],
        "body": ["Inter", "sans-serif"]
      },
      backgroundImage: {
        'premium-gradient': 'radial-gradient(circle at 50% -20%, #2C2C2E 0%, #1C1C1E 100%)',
      },
      boxShadow: {
        'subtle': '0 4px 12px rgba(0, 0, 0, 0.2)',
      },
      borderRadius: {
        'card': '14px',
        'btn': '8px'
      }
    },
  },
  plugins: [],
}
