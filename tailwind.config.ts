import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ── Zikafon Design System ─────────────────────────
        bg: {
          deep: '#080614',       // Très sombre violet-noir
          dark: '#0F0A1E',       // Fond principal
          card: '#13102A',       // Carte
          glass: 'rgba(255,255,255,0.06)',
        },
        brand: {
          purple: '#7C3AED',     // Violet primaire
          pink: '#EC4899',       // Rose accent
          orange: '#F97316',     // Orange chaleureux
          cyan: '#06B6D4',       // Cyan cool
          green: '#22C55E',      // Vert Spotify / like
          red: '#EF4444',        // Rouge skip
        },
        text: {
          primary: '#F8FAFC',
          secondary: '#94A3B8',
          muted: '#475569',
        },
      },
      backgroundImage: {
        // Dégradés principaux
        'aurora': 'linear-gradient(135deg, #7C3AED 0%, #EC4899 50%, #F97316 100%)',
        'aurora-soft': 'linear-gradient(135deg, rgba(124,58,237,0.4) 0%, rgba(236,72,153,0.3) 50%, rgba(249,115,22,0.2) 100%)',
        'aurora-radial': 'radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.5) 0%, rgba(8,6,20,0) 70%)',
        'like-gradient': 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
        'skip-gradient': 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
        'card-gradient': 'linear-gradient(180deg, transparent 40%, rgba(8,6,20,0.95) 100%)',
        'glass-border': 'linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.03))',
      },
      fontFamily: {
        display: ['Righteous', 'cursive'],
        body: ['Poppins', 'sans-serif'],
      },
      fontSize: {
        '2xs': '0.65rem',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '3rem',
      },
      boxShadow: {
        'glow-purple': '0 0 40px rgba(124, 58, 237, 0.4)',
        'glow-pink': '0 0 40px rgba(236, 72, 153, 0.4)',
        'glow-green': '0 0 30px rgba(34, 197, 94, 0.5)',
        'glow-red': '0 0 30px rgba(239, 68, 68, 0.5)',
        'card': '0 25px 50px rgba(0,0,0,0.5)',
        'card-hover': '0 35px 70px rgba(0,0,0,0.6)',
        'glass': 'inset 0 1px 0 rgba(255,255,255,0.1), 0 8px 32px rgba(0,0,0,0.3)',
      },
      animation: {
        'aurora-pulse': 'aurora-pulse 4s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 9s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
        'bounce-gentle': 'bounce-gentle 2s ease-in-out infinite',
        'fade-in': 'fade-in 0.5s ease-out',
        'slide-up': 'slide-up 0.4s ease-out',
        'scale-in': 'scale-in 0.3s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        'aurora-pulse': {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'bounce-gentle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.9)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}

export default config
