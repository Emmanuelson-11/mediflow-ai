/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        ink: '#0F172A',
        muted: '#64748B',
        line: '#E2E8F0',
        canvas: '#F8FAFC',
        teal: '#0F766E',
        'teal-soft': '#CCFBF1',
        success: '#15803D',
        warning: '#B45309',
        'warning-soft': '#FEF3C7',
        critical: '#B91C1C',
        'critical-soft': '#FEE2E2',
      },
      boxShadow: {
        card: '0 8px 28px rgba(15, 23, 42, 0.05)',
        float: '0 18px 50px rgba(15, 118, 110, 0.14)',
      },
    },
  },
  plugins: [],
}
