import { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        surface: 'var(--color-bg)',
        'surface-secondary': 'var(--color-bg-secondary)',
        'surface-elevated': 'var(--color-bg-elevated)',
        'surface-hover': 'var(--color-surface-hover)',
        'surface-active': 'var(--color-surface-active)',
        ink: 'var(--color-text)',
        'ink-secondary': 'var(--color-text-secondary)',
        'ink-muted': 'var(--color-text-muted)',
        'ink-disabled': 'var(--color-text-disabled)',
        accent: 'var(--color-accent)',
        'accent-hover': 'var(--color-accent-hover)',
        'accent-soft': 'var(--color-accent-soft)',
        premium: 'var(--color-premium)',
        'premium-soft': 'var(--color-premium-soft)',
        edge: 'var(--color-border)',
        'edge-subtle': 'var(--color-border-subtle)',
        'edge-hover': 'var(--color-border-hover)',
        night: 'var(--color-night)',
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        error: 'var(--color-error)',
        info: 'var(--color-info)',
      },
      fontFamily: {
        serif: ['var(--font-dm-serif)', 'serif'],
        sans: ['var(--font-inter)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
