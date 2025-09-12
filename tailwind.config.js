/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        spotify: '#1DB954',
        focus: {
          blue: '#3B82F6',
          purple: '#8B5CF6', 
          emerald: '#10B981',
        }
      }
    },
  },
  plugins: [],
}
