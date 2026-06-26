/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f0f4ff",
          100: "#dbe4ff",
          200: "#bac8ff",
          300: "#91a7ff",
          400: "#748ffc",
          500: "#5c7cfa",
          600: "#4c6ef5",
          700: "#4263eb",
          800: "#3b5bdb",
          900: "#364fc7",
        },
        gold: {
          400: "#ffd43b",
          500: "#fcc419",
          600: "#fab005",
        },
        dark: {
          900: "#0a0a0f",
          800: "#12121a",
          700: "#1a1a2e",
          600: "#16213e",
        },
      },
      fontFamily: {
        display: ["'Noto Serif SC'", "serif"],
        body: ["'Noto Sans SC'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
    },
  },
  plugins: [],
};
