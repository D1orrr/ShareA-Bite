// Design tokens from the ShareA'Bite HTML design. Names follow its CSS variables.

export type Palette = {
  paper: string;
  ink: string;
  chili: string;
  sec: string;
  daun: string;
  kunyit: string;
  sirup: string;
  mut: string;
  card: string;
  bd: string;
  ov: string;
  err: string;
  onp: string;
  ons: string;
  sh: string;
  danger: string;
  pxl: string;
};

export const light: Palette = {
  paper: "#faf8ff",
  ink: "#131b2e",
  chili: "#006948",
  sec: "#a73a00",
  daun: "#006948",
  kunyit: "#ffb95f",
  sirup: "#f2f3ff",
  mut: "#4a5850",
  card: "#ffffff",
  bd: "#dae2fd",
  ov: "#bccac0",
  err: "#ba1a1a",
  onp: "#ffffff",
  ons: "#ffffff",
  sh: "rgba(19,27,46,0.1)",
  danger: "#C62828",
  pxl: "#006948",
};

export const dark: Palette = {
  ...light,
  paper: "#0d1322",
  ink: "#e6ebff",
  chili: "#68dba9",
  sec: "#ffb599",
  daun: "#68dba9",
  sirup: "#1a2540",
  mut: "#a9b6ad",
  card: "#162036",
  bd: "#2a3550",
  ov: "#3d4b5e",
  err: "#ffb4ab",
  onp: "#002114",
  ons: "#370e00",
  sh: "rgba(0,0,0,0.5)",
  danger: "#ffb4ab",
  pxl: "#68dba9",
};

// Same in both themes. daun and err are lighter than the design so they read on green.
export const hero: Palette = {
  ...light,
  ink: "#ffffff",
  mut: "rgba(255,255,255,0.8)",
  paper: "#005137",
  chili: "#ffffff",
  onp: "#005137",
  card: "rgba(255,255,255,0.13)",
  bd: "rgba(255,255,255,0.25)",
  ov: "rgba(255,255,255,0.5)",
  sh: "rgba(0,0,0,0.2)",
  daun: "#85f8c4",
  err: "#ffb4ab",
  danger: "#ffb4ab",
  pxl: "#ffddb8",
};

// The light panel stays light in dark mode too, so its text keeps contrast.
export const heroLt: Palette = { ...light };

// Colors the design keeps fixed in both themes.
export const fixed = {
  sticky: "#ffddb8",
  stickyInk: "#2a1700",
  avatar: "#85f8c4",
  avatarInk: "#002114",
  priceBg: "rgba(40,48,68,0.88)",
  priceInk: "#eef0ff",
  priceIcon: "#68dba9",
  saveBg: "rgba(255,255,255,0.92)",
  coin: "#ffb95f",
  you: "#2563EB",
  pinOff: "#999999",
  levelInk: "#1C1A17",
  backdrop: "rgba(19,27,46,0.5)",
};

// One family per weight, because Android ignores fontWeight on custom fonts.
export const font = {
  body: "BeVietnamPro_400Regular",
  bodyMedium: "BeVietnamPro_500Medium",
  bodyBold: "BeVietnamPro_600SemiBold",
  head: "PlusJakartaSans_700Bold",
  headSemi: "PlusJakartaSans_600SemiBold",
  headMedium: "PlusJakartaSans_500Medium",
  icon: "MaterialSymbolsOutlined",
  iconFill: "MaterialSymbolsOutlinedFilled",
};

export const rp = (n: number) =>
  (n < 0 ? "-" : "") +
  "Rp" +
  String(Math.abs(Math.round(n))).replace(/\B(?=(\d{3})+(?!\d))/g, ".");

export function alpha(hex: string, a: number) {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

export const clamp = (min: number, value: number, max: number) =>
  Math.min(max, Math.max(min, value));

export function budgetStatus(used: number, budget: number, c: Palette): [string, string] {
  const q = used / budget;
  if (q > 1) return [c.err, "Lewat budget"];
  if (q > 0.7) return [c.kunyit, "Hampir habis"];
  return [c.daun, "Dompet aman"];
}

// Approximate width in em of a Rupiah amount set in the big bold numbers.
export function amountEm(text: string) {
  let em = 0;
  for (const ch of text) em += ch === "." ? 0.3 : ch === "R" ? 0.68 : 0.64;
  return em - 0.04 * text.length;
}
