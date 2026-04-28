/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Deep Black Theme overrides existing Slate palettes across the app globally
        slate: {
          400: '#a3a3a3', // Soft text
          500: '#737373', // Icons and muted elements 
          600: '#525252',
          700: '#262626', // borders
          800: '#1a1a1a', // standard cards
          900: '#0f0f0f', // deep black background
        },
        // Re-routing Blue utility classes to Green palettes globally
        blue: {
          400: '#4ade80', // green-400
          500: '#22c55e', // green-500
          600: '#16a34a', // green-600
        },
        // Re-routing Indigo utility gradients to Emerald palettes globally
        indigo: {
          400: '#34d399', // emerald-400
          500: '#10b981', // emerald-500
          600: '#059669', // emerald-600
        }
      }
    },
  },
  plugins: [],
}
