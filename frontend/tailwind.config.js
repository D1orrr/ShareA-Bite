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
      },
    },
  },
  plugins: [],
};
