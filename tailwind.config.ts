import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./sanity/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        xs: "475px",
      },
      colors: {
        primary: {
          100: "#F3E8FF",
          200: "#E9D5FF",
          300: "#D8B4FE",
          DEFAULT: "#9333EA", // violet-600
          700: "#7E22CE",
        },
        secondary: "#A78BFA", // softer purple
        black: {
          100: "#4B5563",
          200: "#1F2937",
          300: "#111827",
          DEFAULT: "#000000",
        },
        white: {
          100: "#F9FAFB",
          DEFAULT: "#FFFFFF",
        },
        peach: "#fff7f1",
      },
      fontFamily: {
        "work-sans": ["'Work Sans'", "sans-serif"],
      },
      borderRadius: {
        lg: "1.25rem", // rounded-2xl
        md: "1rem",
        sm: "0.75rem",
      },
      boxShadow: {
        100: "2px 2px 0px 0px rgb(0, 0, 0)",
        200: "2px 2px 0px 2px rgb(0, 0, 0)",
        300: "0px 4px 20px rgba(147, 51, 234, 0.2)", // soft purple glow
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
};

export default config;
