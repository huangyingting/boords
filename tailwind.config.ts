import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#F6F6F0",
        surface: {
          DEFAULT: "#FFFFFF",
          muted: "#F2F2EE",
          frame: "#ECECE6",
          banner: "#F9E5C3",
        },
        ink: {
          DEFAULT: "#121212",
          secondary: "#6E6D68",
          muted: "#9A9992",
        },
        border: {
          DEFAULT: "#E5E4DE",
          strong: "#D4D3CB",
        },
        brand: {
          amber: "#F4BD64",
          amberHover: "#EAA942",
          orange: "#FF6340",
        },
      },
      fontFamily: {
        sans: [
          "Matter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
