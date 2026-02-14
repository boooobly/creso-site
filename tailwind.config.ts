import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}", "./src/app/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          red: "#d41c1c",
          gray: "#828282",
          bg: "#f7f7f7"
        }
      },
      container: {
        center: true,
        padding: "1rem"
      }
    }
  },
  plugins: []
};
export default config;
