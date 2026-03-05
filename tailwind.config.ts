import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ["var(--font-heading)", "Bebas Neue", "Arial Black", "sans-serif"],
        body: ["var(--font-body)", "DM Sans", "system-ui", "sans-serif"],
      },
      colors: {
        amber: {
          50: "#fffbeb",
          100: "#fef3c7", 
          200: "#fde68a",
          300: "#fcd34d",
          400: "#f59e0b",
          500: "#f59e0b",
          600: "#ea580c",
        },
      },
      animation: {
        "fade-in": "fadeIn 0.8s ease-out",
      },
      keyframes: {
        fadeIn: {
          from: {
            opacity: "0",
            transform: "translateY(20px)",
          },
          to: {
            opacity: "1", 
            transform: "translateY(0)",
          },
        },
      },
    },
  },
  plugins: [],
};

export default config;