/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Base/Background
        cream: {
          50: '#FFFDF7',
          100: '#FFF8DC',
          200: '#FAF3E0',
        },
        // Primary (Sage/Olive)
        sage: {
          50: '#F2F7F2',
          100: '#E4EFE4',
          200: '#C9DFC9',
          300: '#8FBC8F',
          400: '#6B9B6B',
          500: '#4A794A',
          600: '#3C633C',
          700: '#2E4C2E',
        },
        // Secondary/Accent (Burnt Sienna/Mustard)
        sienna: {
          50: '#FDF4F2',
          100: '#FAE9E5',
          200: '#F5D3CB',
          300: '#E97451',
          400: '#D65B36',
          500: '#B44726',
          600: '#933A1F',
          700: '#722C18',
        },
        mustard: {
          50: '#FFFDF7',
          100: '#FFF8DC',
          200: '#FFEFB7',
          300: '#FFDB58',
          400: '#FFD324',
          500: '#EBC000',
          600: '#C29D00',
          700: '#997A00',
        },
        // Neutrals/Text
        charcoal: {
          50: '#F5F6F7',
          100: '#EBEDEF',
          200: '#D7DBDF',
          300: '#36454F',
          400: '#2C3841',
          500: '#232E35',
          600: '#1A242A',
          700: '#131B20',
        },
        brown: {
          50: '#F7F5F4',
          100: '#EFEAE9',
          200: '#DFD5D2',
          300: '#5C4033',
          400: '#4A3329',
          500: '#3D2B22',
          600: '#31221B',
          700: '#251A15',
        },
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}