import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1280px",
      },
    },
    extend: {
      colors: {
        bg: {
          primary: "#050816",
          secondary: "#0B1020",
          card: "#111827",
          border: "#1F2937",
        },
        text: {
          primary: "#F9FAFB",
          secondary: "#9CA3AF",
        },
        accent: {
          DEFAULT: "#22D3EE",
          glow: "#38BDF8",
        },
        success: "#22C55E",
        warning: "#F59E0B",
        danger: "#EF4444",
      },
      backgroundImage: {
        "hero-grid":
          "radial-gradient(ellipse at top, rgba(56,189,248,0.18), transparent 60%), radial-gradient(ellipse at bottom right, rgba(34,211,238,0.10), transparent 60%)",
        "glass-grad":
          "linear-gradient(135deg, rgba(17,24,39,0.7) 0%, rgba(11,16,32,0.7) 100%)",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(56,189,248,0.25), 0 0 40px -8px rgba(56,189,248,0.35)",
        "glow-soft":
          "0 0 0 1px rgba(56,189,248,0.15), 0 0 24px -10px rgba(56,189,248,0.25)",
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.375rem",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
