/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // Critical: Points to your source files so Tailwind can find classes
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        // Wired to the variables in _app.tsx
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui'],
        serif: ['var(--font-merriweather)', 'Georgia', 'ui-serif'],
      },
      colors: {
        // Official USC Colors
        usc: {
          cardinal: '#990000',
          gold: '#FFCC00',
        },
        // Editorial Dark Mode Palette
        neutral: {
          850: '#1f1f1f',
          900: '#171717',
          950: '#0a0a0a', 
        }
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in-up': 'fadeInUp 0.8s ease-out forwards',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}