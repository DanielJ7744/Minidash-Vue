/** @type {import('tailwindcss').Config} */

import type { Config } from 'tailwindcss';
import defaultTheme from 'tailwindcss/defaultTheme';
import colors from 'tailwindcss/colors';
import tailwindForms from '@tailwindcss/forms';
import autoprefixer from 'autoprefixer';

export default <Partial<Config>>{
  darkMode: 'class',
  theme: {
    screens: {
      xs: '480px',
      ...defaultTheme.screens,
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: '#591254',
          50: '#F5EDF5',
          100: '#F1DCf0',
          200: '#D99AD5',
          300: '#AC5ba7',
          400: '#8A3084',
          500: '#591254',
          600: '#42153F',
          700: '#380B35',
          800: '#2B0C29',
          900: '#1E051C',
        },
        accent: {
          DEFAULT: '#FFC30B',
          50: '#FFF6E3',
          100: '#FFEEC7',
          200: '#FFE4A5',
          300: '#FFDF7B',
          400: '#FFD143',
          500: '#FFC30B',
          600: '#EBB200',
          700: '#CD9A00',
          800: '#AE8300',
          900: '#906C00',
        },
        success: {
          DEFAULT: '#2BC443',
          50: '#Eff9EF',
          100: '#CCEFCD',
          200: '#ABE4AD',
          300: '#64DD71',
          400: '#42D656',
          500: '#2BC443',
          600: '#28A73C',
          700: '#178F2A',
          800: '#09781A',
          900: '#016614',
        },
        danger: {
          DEFAULT: '#E03F29',
          50: '#FEF8F7',
          100: '#FBDCD8',
          200: '#F6B5AB',
          300: '#EA8579',
          400: '#E55F4D',
          500: '#E03F29',
          600: '#BF2F1C',
          700: '#9B2312',
          800: '#811E11',
          900: '#6F190D',
        },
        gray: colors.slate,
      },
      fontFamily: {
        sans: ['Graphik Web', 'helvetica', 'arial', 'sans-serif'],
        mono: ['Inconsolata', 'monospace'],
      },
    },
  },
  plugins: [tailwindForms, autoprefixer],
};
