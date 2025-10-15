import type { Config } from 'tailwindcss'

export default {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        loom: {
          bg: "#0f1115",
          ink: "#f2f4f7",
          planet: "#2fbf71",
          people: "#f6c945",
          democracy: "#4ea1ff",
          learning: "#a78bfa"
        }
      },
      fontFamily: {
        display: ["ui-sans-serif", "system-ui", "Inter", "sans-serif"],
        body: ["ui-sans-serif", "system-ui", "Inter", "sans-serif"]
      }
    },
  },
  plugins: [],
} satisfies Config
