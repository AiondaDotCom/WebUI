/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,html}',
    './dist/**/*.{js,html}',
    './examples/**/*.{js,html}',
    './*.html'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: 'var(--primary-50)',
          100: 'var(--primary-100)',
          200: 'var(--primary-200)',
          300: 'var(--primary-300)',
          400: 'var(--primary-400)',
          500: 'var(--primary-500)',
          600: 'var(--primary-600)',
          700: 'var(--primary-700)',
          800: 'var(--primary-800)',
          900: 'var(--primary-900)',
          950: 'var(--primary-950)'
        },
        secondary: {
          50: 'var(--secondary-50)',
          100: 'var(--secondary-100)',
          200: 'var(--secondary-200)',
          300: 'var(--secondary-300)',
          400: 'var(--secondary-400)',
          500: 'var(--secondary-500)',
          600: 'var(--secondary-600)',
          700: 'var(--secondary-700)',
          800: 'var(--secondary-800)',
          900: 'var(--secondary-900)',
          950: 'var(--secondary-950)'
        },
        accent: {
          50: 'var(--accent-50)',
          100: 'var(--accent-100)',
          200: 'var(--accent-200)',
          300: 'var(--accent-300)',
          400: 'var(--accent-400)',
          500: 'var(--accent-500)',
          600: 'var(--accent-600)',
          700: 'var(--accent-700)',
          800: 'var(--accent-800)',
          900: 'var(--accent-900)',
          950: 'var(--accent-950)'
        },
        surface: {
          light: 'var(--surface-light)',
          DEFAULT: 'var(--surface)',
          dark: 'var(--surface-dark)'
        },
        background: {
          light: 'var(--background-light)',
          DEFAULT: 'var(--background)',
          dark: 'var(--background-dark)'
        },
        border: {
          light: 'var(--border-light)',
          DEFAULT: 'var(--border)',
          dark: 'var(--border-dark)'
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
          inverse: 'var(--text-inverse)'
        }
      },
      backgroundColor: {
        'theme': 'var(--background)',
        'theme-light': 'var(--background-light)',
        'theme-dark': 'var(--background-dark)',
        'surface': 'var(--surface)',
        'surface-light': 'var(--surface-light)',
        'surface-dark': 'var(--surface-dark)'
      },
      textColor: {
        'theme-primary': 'var(--text-primary)',
        'theme-secondary': 'var(--text-secondary)',
        'theme-muted': 'var(--text-muted)',
        'theme-inverse': 'var(--text-inverse)'
      },
      borderColor: {
        'theme': 'var(--border)',
        'theme-light': 'var(--border-light)',
        'theme-dark': 'var(--border-dark)'
      }
    }
  },
  plugins: [
    function({ addUtilities, theme }) {
      const darkModeUtilities = {
        '.dark-mode-bg': {
          'background-color': 'var(--background)',
        },
        '.dark-mode-surface': {
          'background-color': 'var(--surface)',
        },
        '.dark-mode-text': {
          'color': 'var(--text-primary)',
        },
        '.dark-mode-border': {
          'border-color': 'var(--border)',
        },
        '.theme-responsive': {
          'transition': 'background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease',
        },
        '@media (prefers-color-scheme: dark)': {
          '.auto-dark': {
            '--background': '#0f172a',
            '--surface': '#1e293b',
            '--text-primary': '#f9fafb',
            '--border': '#374151',
          }
        },
        '@media (max-width: 640px)': {
          '.dark-mobile-optimized': {
            'font-size': '14px',
            'padding': '0.5rem',
          }
        }
      }
      addUtilities(darkModeUtilities)
    }
  ]
}