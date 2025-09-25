/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      animation: {
        'fadeIn': 'fadeIn 0.3s ease-in-out',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      }
    },
  },
  plugins: [],
  safelist: [
    // Color classes for dynamic styling
    'bg-sky-900/40', 'border-sky-700', 'text-sky-300', 'hover:bg-sky-900/70',
    'bg-teal-900/40', 'border-teal-700', 'text-teal-300', 'hover:bg-teal-900/70',
    'bg-indigo-900/40', 'border-indigo-700', 'text-indigo-300', 'hover:bg-indigo-900/70',
    'bg-amber-900/40', 'border-amber-700', 'text-amber-300', 'hover:bg-amber-900/70',
    'bg-rose-900/40', 'border-rose-700', 'text-rose-300', 'hover:bg-rose-900/70',
    'bg-lime-900/40', 'border-lime-700', 'text-lime-300', 'hover:bg-lime-900/70',
    'bg-fuchsia-900/40', 'border-fuchsia-700', 'text-fuchsia-300', 'hover:bg-fuchsia-900/70',
    'bg-cyan-900/40', 'border-cyan-700', 'text-cyan-300', 'hover:bg-cyan-900/70',
    // Focus ring colors
    'focus:ring-sky-500', 'focus:ring-green-500', 'focus:ring-purple-500', 'focus:ring-indigo-500',
    // Button colors
    'bg-sky-600', 'hover:bg-sky-500', 'bg-green-600', 'hover:bg-green-500',
    'bg-purple-600', 'hover:bg-purple-500', 'bg-red-600', 'hover:bg-red-500',
    'bg-indigo-600', 'hover:bg-indigo-500', 'bg-amber-600', 'hover:bg-amber-500',
    'bg-teal-600', 'hover:bg-teal-500',
    // Text colors
    'text-sky-400', 'text-green-400', 'text-purple-400', 'text-yellow-300',
    'text-red-400', 'text-amber-300', 'text-teal-300', 'text-cyan-300',
    'text-fuchsia-300', 'text-indigo-300', 'text-lime-300', 'text-rose-300',
    // Border colors
    'border-sky-500', 'border-green-500', 'border-purple-500', 'border-red-500'
  ]
}