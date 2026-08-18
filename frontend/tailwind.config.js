/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Material Design 3 Colors - Dark Mode
        // Primary
        'primary': '#adc6ff',
        'on-primary': '#002e6a',
        'primary-container': '#4d8eff',
        'on-primary-container': '#00285d',
        'primary-fixed': '#d8e2ff',
        'primary-fixed-dim': '#adc6ff',
        'on-primary-fixed': '#001a42',
        'on-primary-fixed-variant': '#004395',
        
        // Secondary
        'secondary': '#ffc640',
        'on-secondary': '#402d00',
        'secondary-container': '#e3aa00',
        'on-secondary-container': '#5a4100',
        'secondary-fixed': '#ffdf9f',
        'secondary-fixed-dim': '#f9bd22',
        'on-secondary-fixed': '#261a00',
        'on-secondary-fixed-variant': '#5c4300',
        
        // Tertiary
        'tertiary': '#d0bcff',
        'on-tertiary': '#3c0091',
        'tertiary-container': '#a078ff',
        'on-tertiary-container': '#340080',
        'tertiary-fixed': '#e9ddff',
        'tertiary-fixed-dim': '#d0bcff',
        'on-tertiary-fixed': '#23005c',
        'on-tertiary-fixed-variant': '#5424af',
        
        // Error
        'error': '#ef4444',
        'on-error': '#690005',
        'error-container': '#93000a',
        'on-error-container': '#ffdad6',
        
        // Success (custom)
        'success': '#22c55e',
        
        // Warning (custom)
        'warning': '#f59e0b',
        
        // Surface
        'surface': '#0b1326',
        'surface-dim': '#0b1326',
        'surface-bright': '#31394e',
        'surface-container-lowest': '#060d20',
        'surface-container-low': '#131b2e',
        'surface-container': '#171f33',
        'surface-container-high': '#222a3e',
        'surface-container-highest': '#2d3449',
        'on-surface': '#dbe2fd',
        'on-surface-variant': '#c2c6d6',
        
        // Inverse
        'inverse-surface': '#dbe2fd',
        'inverse-on-surface': '#283044',
        'inverse-primary': '#005ac2',
        
        // Outline
        'outline': '#8c909f',
        'outline-variant': '#424754',
        
        // Background
        'background': '#0b1326',
        'on-background': '#dbe2fd',
        
        // Surface Tint
        'surface-tint': '#adc6ff',
        
        // Premium Colors
        'premium-purple': '#a855f7',
        'premium-gold': '#fbbf24',
      },
      spacing: {
        'row-height-sm': '40px',
        'row-height-md': '56px',
        'gutter': '24px',
        'sidebar-width': '280px',
        'container-padding': '32px',
      },
      fontFamily: {
        'headline-xl': ['Noto Serif', 'serif'],
        'headline-lg': ['Noto Serif', 'serif'],
        'headline-md': ['Noto Serif', 'serif'],
        'headline-sm': ['Noto Serif', 'serif'],
        'body-lg': ['Hanken Grotesk', 'sans-serif'],
        'body-md': ['Hanken Grotesk', 'sans-serif'],
        'body-sm': ['Hanken Grotesk', 'sans-serif'],
        'label-lg': ['JetBrains Mono', 'monospace'],
        'label-md': ['JetBrains Mono', 'monospace'],
        'label-sm': ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'headline-xl': ['48px', { lineHeight: '56px', fontWeight: '700' }],
        'headline-lg': ['32px', { lineHeight: '40px', fontWeight: '700' }],
        'headline-md': ['24px', { lineHeight: '32px', fontWeight: '600' }],
        'headline-sm': ['20px', { lineHeight: '28px', fontWeight: '600' }],
        'body-lg': ['18px', { lineHeight: '28px', fontWeight: '400' }],
        'body-md': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'body-sm': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'label-lg': ['14px', { lineHeight: '20px', letterSpacing: '0.02em', fontWeight: '500' }],
        'label-md': ['12px', { lineHeight: '16px', letterSpacing: '0.05em', fontWeight: '500' }],
        'label-sm': ['10px', { lineHeight: '14px', letterSpacing: '0.08em', fontWeight: '600' }],
      },
      borderRadius: {
        lg: '0.5rem',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
      },
      animation: {
        spin: 'spin 1s linear infinite',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}
