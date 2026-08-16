// Best-effort color-name → hex lookup for rendering swatch dots on product
// cards. Unrecognized names fall back to a neutral dot with a tooltip.
const COLOR_MAP: Record<string, string> = {
  black: "#17181a",
  white: "#faf9f6",
  ivory: "#f4f0e6",
  cream: "#f1e9d8",
  sand: "#d9c7a3",
  beige: "#e3d4b7",
  camel: "#c19a6b",
  tan: "#d2b48c",
  brown: "#6b4a34",
  chocolate: "#4a2f22",
  rust: "#a5502b",
  terracotta: "#c1673f",
  olive: "#6b6b47",
  green: "#4c6b4f",
  forest: "#334d34",
  sage: "#9caf88",
  mint: "#b6e2c6",
  navy: "#233350",
  blue: "#3b5c8c",
  "sky blue": "#8fb8dd",
  teal: "#3c7a7a",
  charcoal: "#3a3a3a",
  grey: "#8a8a86",
  gray: "#8a8a86",
  silver: "#c6c6c2",
  red: "#a13d3d",
  maroon: "#5c2323",
  burgundy: "#5e2233",
  pink: "#e3aebb",
  blush: "#eac9c6",
  purple: "#6a4c7c",
  lavender: "#c6b6db",
  yellow: "#d9b23c",
  mustard: "#c9a13a",
  gold: "#c9a63e",
  orange: "#cf7332",
};

export function colorToHex(name: string): string | null {
  return COLOR_MAP[name.trim().toLowerCase()] || null;
}
