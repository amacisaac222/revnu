import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        revnu: {
          dark: "#0a0f1a",      // Deep charcoal background
          darker: "#060a12",    // Darker variant
          slate: "#1a2332",     // Card backgrounds
          green: "#4ade80",     // Primary green (money/success)
          greenDark: "#22c55e", // Darker green
          greenLight: "#86efac", // Light green accent
          gray: "#94a3b8",      // Secondary text
          grayLight: "#cbd5e1", // Border colors
        },
      },
      borderRadius: {
        'stripe': '16px',
      },
      scale: {
        '98': '0.98',
      },
    },
  },
  plugins: [],
} satisfies Config;
