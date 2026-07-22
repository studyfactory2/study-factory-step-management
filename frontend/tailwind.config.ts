import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#F7F8FA",
        foreground: "#191F28",
        card: "#FFFFFF",
        "card-foreground": "#191F28",
        primary: "#3182F6",
        "primary-foreground": "#FFFFFF",
        secondary: "#F2F4F6",
        "secondary-foreground": "#333D4B",
        muted: "#F9FAFB",
        "muted-foreground": "#8B95A1",
        accent: "#8B5CF6",
        "accent-foreground": "#FFFFFF",
        border: "#E5E8EB",
        input: "#D1D6DB",
        ring: "#3182F6",
        lavender: "#8B5CF6",
        sage: "#00A878",
      },
      borderRadius: {
        lg: "24px",
        md: "18px",
        sm: "14px",
      },
      boxShadow: {
        soft: "0 12px 36px rgba(0, 27, 55, 0.08)",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
