/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // ShareA'Bite brand tokens (mirror of theme/index.tsx light palette)
        brand: {
          paper: "#faf8ff",
          ink: "#131b2e",
          primary: "#006948",
          secondary: "#a73a00",
          amber: "#ffb95f",
          surface: "#f2f3ff",
          muted: "#4a5850",
          card: "#ffffff",
          border: "#dae2fd",
          error: "#ba1a1a",
          sticky: "#ffddb8",
        },
      },
      borderRadius: {
        '3xl': '24px',
        '4xl': '32px',
        'full': '9999px',
      },
      boxShadow: {
        // Wide, soft, and diffuse drop shadows (No stark black drop shadows)
        'soft-sm': '0 2px 8px rgba(45, 37, 34, 0.04)',
        'soft': '0 6px 20px -2px rgba(45, 37, 34, 0.07)',
        'floating': '0 12px 30px -4px rgba(45, 37, 34, 0.09)',
        'terracotta-glow': '0 8px 24px -2px rgba(224, 109, 83, 0.3)',
      }
    },
  },
  plugins: [],
};
