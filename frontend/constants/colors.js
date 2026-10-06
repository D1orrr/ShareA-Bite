// Warm & clean palette. Shared by tailwind.config.js (class names) and by code
// that needs raw values (icon colors, navigation options, shadows).
// Text pairs were checked against WCAG AA: ink/muted pass 4.5:1 on cream,
// surface and track; `field` passes 3:1 on surface and cream for control borders.
module.exports = {
  cream: "#FAF6F0", // page background
  surface: "#FFFFFF", // cards and sheets
  track: "#F1EAE0", // insets, progress tracks, segmented controls
  line: "#E8E0D5", // decorative dividers and card edges
  field: "#8C8178", // borders of interactive controls
  ink: "#2A221D", // primary text
  muted: "#6B6058", // secondary text
  accent: "#C2410C", // the one main action per screen
  accentDeep: "#9A3412", // accent text on accentSoft (accent itself is 4.46:1 there)
  accentSoft: "#FCEBDD",
  leaf: "#2F7A4B", // savings, progress, checked items
  leafSoft: "#E4F2E8",
  danger: "#B42318", // over budget, validation errors
  dangerSoft: "#FDECEA",
};
