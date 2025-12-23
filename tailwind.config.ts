import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      animation: {
        'float': 'float 2s ease-out forwards',
        'shake': 'shake 0.1s ease-in-out',
      },
      keyframes: {
        float: {
          '0%': { transform: 'translate(0, 0) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translate(var(--float-x), var(--float-y)) rotate(var(--float-rotate))', opacity: '0' },
        },
        shake: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '25%': { transform: 'translate(-5px, 0)' },
          '75%': { transform: 'translate(5px, 0)' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
