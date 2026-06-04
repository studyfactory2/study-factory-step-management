import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#FFF8F4",
        foreground: "#4B332E",
        card: "#FFFFFF",
        "card-foreground": "#4B332E",
        primary: "#EF7890",
        "primary-foreground": "#FFFFFF",
        secondary: "#F6E5F6",
        "secondary-foreground": "#4B332E",
        muted: "#FFF0F2",
        "muted-foreground": "#8A6D68",
        accent: "#D6A548",
        "accent-foreground": "#4B332E",
        border: "#F5D6DC",
        input: "#F5D6DC",
        ring: "#EF7890",
        lavender: "#A98B84",
        sage: "#9D7AD8"
      },
      borderRadius: {
        lg: "20px",
        md: "16px",
        sm: "12px"
      },
      boxShadow: {
        soft: "0 16px 40px rgba(239, 120, 144, 0.16)"
      }
    }
  },
  plugins: [tailwindcssAnimate]
};

export default config;
