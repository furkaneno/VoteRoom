import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Syne'", "sans-serif"],
        body:    ["'DM Sans'", "sans-serif"],
        mono:    ["'JetBrains Mono'", "monospace"],
      },
      fontWeight: {
        "300": "300",
        "400": "400",
        "500": "500",
        "600": "600",
        "700": "700",
        "800": "800",
      },
      colors: {
        brand: {
          50:  "#f0f4ff",
          100: "#e0eaff",
          200: "#c7d7fe",
          300: "#a5b8fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
        },
        dark: {
          950: "#05060f",
          900: "#0a0b1a",
          850: "#0e0f22",
          800: "#13142e",
          750: "#181a38",
          700: "#1e2042",
        },
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4,0,0.6,1) infinite",
        "float":      "float 5s ease-in-out infinite",
        "ping-ring":  "ping-ring 2s cubic-bezier(0,0,0.2,1) infinite",
      },
      keyframes: {
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%":     { transform: "translateY(-9px)" },
        },
        "ping-ring": {
          "75%,100%": { transform: "scale(2)", opacity: "0" },
        },
      },
      boxShadow: {
        "glow-sm": "0 0 15px rgba(99,102,241,0.3)",
        "glow-md": "0 0 30px rgba(99,102,241,0.4)",
        "glow-lg": "0 0 60px rgba(99,102,241,0.5)",
      },
    },
  },
  plugins: [],
};

export default config;
