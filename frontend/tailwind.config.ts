import type { Config } from 'tailwindcss';
import forms from '@tailwindcss/forms';

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",  // ✅ Un seul chemin
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#1e3b8a',    // ✅ Ta couleur principale
          600: '#1a347a',
          700: '#152d6b',
          800: '#11265c',
          900: '#0d1f4d',
        },
        success: '#10b981',   // ✅ Vert pour épargne
        danger:  '#ef4444',   // ✅ Rouge pour alertes
        warning: '#f59e0b',   // ✅ Orange pour retards
        info:    '#3b82f6',   // ✅ Bleu pour info
        'background-light': '#f6f6f8',
        'background-dark': '#121620',
      },
      // ... reste identique
    },
  },
  plugins: [forms],
};

export default config;