/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Neo-brutalist Canvas & Neutral
        brutal: {
          bg: "#FBF9F1",       // Soft warm cream
          card: "#FFFFFF",     // Stark white
          black: "#000000",    // Pitch black for borders & text
          charcoal: "#1A1A1A",
          muted: "#E2DEC9",
        },
        // Neo-brutalist High-Contrast Pastels
        neo: {
          mint: "#99F6E4",     // Crisp pastel mint (#5EEAD4 / #A7F3D0)
          green: "#86EFAC",    // Fresh warung green
          pink: "#FBCFE8",     // Playful soft baby pink
          yellow: "#FEF08A",   // High-contrast soft yellow
          orange: "#FDBA74",   // Warm pastel orange
          blue: "#BAE6FD",     // Friendly pastel sky blue
          purple: "#DDD6FE",   // Light lilac
        }
      },
      borderWidth: {
        '3': '3px',
        '4': '4px',
        '5': '5px',
      },
      boxShadow: {
        'brutal-sm': '2px 2px 0px 0px #000000',
        'brutal': '4px 4px 0px 0px #000000',
        'brutal-lg': '6px 6px 0px 0px #000000',
        'brutal-xl': '8px 8px 0px 0px #000000',
      }
    },
  },
  plugins: [],
};
