/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#00607a',
          dark: '#004d61',
        },
        accent: {
          DEFAULT: '#a3e635',
          dark: '#84cc16',
        },
        warning: '#f59e0b',
        danger: '#ef4444',
        success: '#22c55e',
        'bg-base': '#f8fafc',
        'bg-card': '#ffffff',
        'bg-sidebar': '#0f172a',
        'text-main': '#1e293b',
        'text-muted': '#64748b',
      },
      borderRadius: {
        'md': '16px',
      }
    },
  },
  plugins: [],
}
