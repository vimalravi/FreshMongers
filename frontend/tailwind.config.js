/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      /* ── Colors ──────────────────────────────────────────────── */
      colors: {
        primary: {
          DEFAULT: '#0066CC',
          light:   '#3388e0',
          dark:    '#004fa3',
          bg:      '#e8f2ff',
        },
        accent: {
          DEFAULT: '#FFD700',
          dark:    '#e6c000',
          bg:      '#fffbe6',
        },
        coral: {
          DEFAULT: '#FF6B6B',
          light:   '#ffa8a8',
          bg:      '#fee2e2',
        },
        teal: {
          DEFAULT: '#4ECDC4',
          dark:    '#38b2aa',
          bg:      '#ccfbf1',
        },
        earth: {
          cream:  '#fdf8f0',
          mint:   '#f0f9f4',
          sky:    '#f0f7ff',
        },
        surface: '#ffffff',
        border:  '#e8edf5',
      },

      /* ── Typography ──────────────────────────────────────────── */
      fontFamily: {
        sans:    ['Plus Jakarta Sans', 'sans-serif'],
        display: ['Quicksand', 'sans-serif'],
        serif:   ['DM Serif Display', 'serif'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '1rem' }],
        xs:    ['0.75rem',  { lineHeight: '1.125rem' }],
        sm:    ['0.875rem', { lineHeight: '1.375rem' }],
        base:  ['1rem',     { lineHeight: '1.65rem' }],
        lg:    ['1.125rem', { lineHeight: '1.75rem' }],
        xl:    ['1.25rem',  { lineHeight: '1.85rem' }],
        '2xl': ['1.5rem',   { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem',  { lineHeight: '2.5rem' }],
        '5xl': ['3rem',     { lineHeight: '1.15' }],
        '6xl': ['3.75rem',  { lineHeight: '1.1' }],
        '7xl': ['4.5rem',   { lineHeight: '1.05' }],
      },

      /* ── Border Radius ───────────────────────────────────────── */
      borderRadius: {
        sm:   '0.75rem',
        md:   '1.25rem',
        lg:   '1.75rem',
        xl:   '2.5rem',
        card: '1.5rem',
        pill: '99px',
        blob: '2.5rem',
        /* legacy aliases */
        '2xl': '1rem',
        '3xl': '1.5rem',
      },

      /* ── Shadows ─────────────────────────────────────────────── */
      boxShadow: {
        card:         '0 2px 12px rgba(0, 60, 120, 0.08)',
        'card-hover': '0 8px 32px rgba(0, 60, 120, 0.14)',
        primary:      '0 8px 24px rgba(0, 102, 204, 0.25)',
        accent:       '0 8px 24px rgba(255, 215, 0, 0.30)',
        teal:         '0 8px 20px rgba(78, 205, 196, 0.30)',
        coral:        '0 8px 20px rgba(255, 107, 107, 0.25)',
        nav:          '0 2px 20px rgba(0, 40, 100, 0.08)',
        float:        '0 20px 60px rgba(0, 40, 100, 0.15)',
        inner:        'inset 0 2px 8px rgba(0, 0, 0, 0.06)',
      },

      /* ── Spacing ─────────────────────────────────────────────── */
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
        '34': '8.5rem',
      },

      /* ── Max Width ───────────────────────────────────────────── */
      maxWidth: {
        '8xl': '88rem',
      },

      /* ── Animations ──────────────────────────────────────────── */
      animation: {
        float:         'float 3.5s ease-in-out infinite',
        floatSlow:     'float 6s ease-in-out infinite',
        floatReverse:  'float 5s ease-in-out infinite reverse',
        floatBlob:     'floatBlob 8s ease-in-out infinite',
        shimmer:       'shimmerText 3.5s linear infinite',
        pulseDot:      'pulseDot 2s ease-in-out infinite',
        spin:          'spin 0.75s linear infinite',
        fadeUp:        'fadeUp 0.5s ease forwards',
        scaleIn:       'scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        bounce:        'bounce 1s ease-in-out infinite',
        'slide-in':    'slideIn 0.35s ease forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':       { transform: 'translateY(-18px)' },
        },
        floatBlob: {
          '0%, 100%': { transform: 'translate(0,0) scale(1)' },
          '33%':       { transform: 'translate(20px,-30px) scale(1.05)' },
          '66%':       { transform: 'translate(-15px,20px) scale(0.97)' },
        },
        shimmerText: {
          '0%':   { backgroundPosition: '0% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        pulseDot: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%':       { opacity: '0.6', transform: 'scale(1.25)' },
        },
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.8)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideIn: {
          '0%':   { opacity: '0', transform: 'translateX(-12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },

      /* ── Background Images ───────────────────────────────────── */
      backgroundImage: {
        'dot-grid':     'radial-gradient(circle, rgba(0,60,120,0.05) 1px, transparent 1px)',
        'hero-gradient':'linear-gradient(135deg, #e8f4ff 0%, #f0fdf8 50%, #fffdf0 100%)',
        'cta-gradient': 'linear-gradient(135deg, #0066CC 0%, #4ECDC4 100%)',
        'organic-warm': 'linear-gradient(135deg, #fdf8f0 0%, #fdf4e8 100%)',
        'organic-mint': 'linear-gradient(135deg, #f0f9f4 0%, #e6f7ef 100%)',
        'organic-sky':  'linear-gradient(135deg, #f0f7ff 0%, #e0eeff 100%)',
        'footer-dark':  'linear-gradient(180deg, #0a1628 0%, #0d1f38 100%)',
      },

      /* ── Backdrop Blur ───────────────────────────────────────── */
      backdropBlur: {
        xs: '2px',
        sm: '6px',
        md: '12px',
        lg: '20px',
      },

      /* ── Transitions ─────────────────────────────────────────── */
      transitionTimingFunction: {
        spring:  'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'spring-soft': 'cubic-bezier(0.34, 1.3, 0.64, 1)',
      },
    },
  },
  plugins: [],
};
