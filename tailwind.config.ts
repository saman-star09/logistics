import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          base: '#0a0e17',
          raised: '#0f1420',
          panel: '#121826',
          overlay: '#161d2e',
          border: '#232b3d',
          borderStrong: '#2e3750',
        },
        ink: {
          primary: '#f4f6fb',
          secondary: '#a3aec4',
          muted: '#6b7488',
        },
        accent: {
          blue: '#3b82f6',
          blueMuted: '#1d4ed8',
          green: '#22c55e',
          amber: '#f59e0b',
          red: '#ef4444',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      borderRadius: {
        md: '10px',
        lg: '14px',
        xl: '16px',
      },
      boxShadow: {
        panel: '0 1px 2px 0 rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.03)',
        floating: '0 12px 32px -8px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04)',
      },
      keyframes: {
        pulseDot: {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 0 0 rgba(34,197,94,0.55)' },
          '50%': { opacity: '0.85', boxShadow: '0 0 0 4px rgba(34,197,94,0)' },
        },
        markerPing: {
          '0%': { transform: 'scale(1)', opacity: '0.65' },
          '75%, 100%': { transform: 'scale(2.4)', opacity: '0' },
        },
        slideIn: {
          from: { transform: 'translateX(16px)', opacity: '0' },
          to: { transform: 'translateX(0)', opacity: '1' },
        },
        fadeUp: {
          from: { transform: 'translateY(6px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
      },
      animation: {
        pulseDot: 'pulseDot 2s ease-in-out infinite',
        markerPing: 'markerPing 1.8s cubic-bezier(0,0,0.2,1) infinite',
        slideIn: 'slideIn 0.22s ease-out',
        fadeUp: 'fadeUp 0.25s ease-out',
        shimmer: 'shimmer 1.6s linear infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
