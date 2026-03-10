import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "#080b11",
          secondary: "#0d1117",
          card: "#111827",
          hover: "#1a2235",
          border: "#1e2d40",
        },
        accent: {
          green: "#00d4a3",
          red: "#ff4c6a",
          blue: "#3b82f6",
          purple: "#8b5cf6",
          yellow: "#f59e0b",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
