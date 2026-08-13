/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bone-cream': '#f4f3ec',
        'ink': '#0e0e0e',
        'paper-white': '#fdfcf8',
      },
      fontFamily: {
        'display': ['"Playfair Display"', 'serif'],
        'ui': ['"Inter"', 'sans-serif'],
      },
      fontSize: {
        'heading': ['2.25rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'subheading': ['1.25rem', { lineHeight: '1.4', letterSpacing: '-0.01em' }],
        'body': ['0.9375rem', { lineHeight: '1.6', letterSpacing: '0' }],
        'caption': ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.02em' }],
      },
      boxShadow: {
        'soft': '0 12px 48px rgba(14, 14, 14, 0.08)',
        'float': '0 24px 64px rgba(14, 14, 14, 0.12)',
      },
      animation: {
        'flip-out': 'flipOut 0.25s cubic-bezier(0.4, 0.0, 1, 1) forwards',
        'flip-in': 'flipIn 0.25s cubic-bezier(0.0, 0.0, 0.2, 1) forwards',
        'dash': 'dash 2s linear infinite',
      },
      keyframes: {
        flipOut: {
          '0%': { transform: 'rotateX(0deg) scale(1)' },
          '100%': { transform: 'rotateX(-90deg) scale(0.95)' }
        },
        flipIn: {
          '0%': { transform: 'rotateX(90deg) scale(0.95)' },
          '100%': { transform: 'rotateX(0deg) scale(1)' }
        },
        dash: {
          'to': { strokeDashoffset: -20 }
        }
      }
    },
  },
  plugins: [],
}
