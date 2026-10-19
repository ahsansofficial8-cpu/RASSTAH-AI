/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary:    'var(--color-primary)',
        accent:     'var(--color-accent)',
        background: 'var(--color-background)',
        surface:    'var(--color-surface)',
        border:     'var(--color-border)',
        text:       'var(--color-text)',
        'text-muted': 'var(--color-text-muted)',
        success:    'var(--color-success)',
        warning:    'var(--color-warning)',
        danger:     'var(--color-danger)',
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        body:    ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
      },
      boxShadow: {
        card:  'var(--shadow-card)',
        hover: 'var(--shadow-hover)',
      },
      fontSize: {
        'fluid-sm':  'clamp(0.875rem, 1vw, 1rem)',
        'fluid-md':  'clamp(1rem, 1.5vw, 1.25rem)',
        'fluid-lg':  'clamp(1.25rem, 2vw, 1.75rem)',
        'fluid-xl':  'clamp(1.75rem, 3vw, 2.5rem)',
        'fluid-2xl': 'clamp(2rem, 4vw, 3.5rem)',
        'fluid-3xl': 'clamp(2.5rem, 6vw, 5rem)',
      },
      keyframes: {
        marquee: {
          '0%':   { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        marquee: 'marquee 30s linear infinite',
        float:   'float 3s ease-in-out infinite',
        shimmer: 'shimmer 1.5s infinite',
        'fade-up': 'fade-up 0.5s ease forwards',
      },
    },
  },
  plugins: [],
};
