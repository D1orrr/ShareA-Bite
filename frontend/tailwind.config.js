const palette = require("./constants/colors");

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
        cream: palette.cream,
        surface: palette.surface,
        track: palette.track,
        line: palette.line,
        field: palette.field,
        ink: palette.ink,
        muted: palette.muted,
        accent: {
          DEFAULT: palette.accent,
          deep: palette.accentDeep,
          soft: palette.accentSoft,
        },
        leaf: {
          DEFAULT: palette.leaf,
          soft: palette.leafSoft,
        },
        danger: {
          DEFAULT: palette.danger,
          soft: palette.dangerSoft,
        },
        // Warm & Cozy Minimalist (Soft Pop) Theme, used by the Cozy* components
        cozy: {
          bg: "#FAF7F2",             // Cream / Soft warm off-white canvas
          surface: "#FFFFFF",        // Pure white card background
          surfaceWarm: "#F5EFEB",    // Subtle warm surface container
          card: "#FFFFFF",

          // Accents
          terracotta: "#E06D53",     // Primary Accent / Buttons (Warm Orange / Terracotta)
          terracottaDark: "#C8573E",
          terracottaLight: "#FDEEE9",

          mustard: "#F59E0B",        // Secondary Accent (Mustard Yellow)
          mustardLight: "#FEF3C7",

          sky: "#38BDF8",            // Tertiary Highlight (Soft Sky Blue)
          skySoft: "#E0F2FE",

          // Fridge / Warung status colors
          fridgeGreen: "#22C55E",    // In Fridge Green (+)
          fridgeBg: "#DCFCE7",
          missingRed: "#EF4444",     // Missing Warung Red (-)
          missingBg: "#FEE2E2",

          // Typography
          textMain: "#2D2522",       // Warm deep espresso / charcoal
          textMuted: "#786F6A",      // Warm muted stone
          textLight: "#A89F9A",
          borderSoft: "#EFE8E1",     // Delicate soft border
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
      },
    },
  },
  plugins: [],
};
