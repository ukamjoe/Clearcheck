import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        void: "#06080D",
        panel: "#10141C",
        panel2: "#161B26",
        line: "#222938",
        teal: {
          DEFAULT: "#0EBE8C",
          dim: "#0A8F6B",
        },
        red: {
          DEFAULT: "#FF3B3B",
        },
        amber: "#F2A93B",
        ink: {
          DEFAULT: "#E7ECF1",
          dim: "#8B97A8",
          faint: "#4D5868",
        },
      },
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        glow: "0 0 24px rgba(14,190,140,0.18)",
        glowRed: "0 0 24px rgba(255,59,59,0.16)",
      },
    },
  },
  plugins: [],
};

export default config;
