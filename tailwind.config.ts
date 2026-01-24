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
          dark: "#1e293b",      // Dark text (WCAG AAA compliant on white)
          darker: "#0f172a",    // Darker text variant
          slate: "#f8fafc",     // Light card backgrounds
          green: "#16a34a",     // Primary green (WCAG AA compliant)
          greenDark: "#15803d", // Darker green (WCAG AAA compliant)
          greenLight: "#22c55e", // Light green accent
          gray: "#64748b",      // Secondary text (WCAG AA compliant)
          grayLight: "#cbd5e1", // Border colors
          white: "#ffffff",     // White background
          lightGray: "#f1f5f9", // Light gray for subtle backgrounds
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
