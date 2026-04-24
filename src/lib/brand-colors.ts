export const BRAND_COLORS = [
  "#FF7700", // /slantis Orange  — Primary / Future / DFA / B
  "#FFE900", // Vibrant Yellow   — VIZ
  "#5BD9D6", // Sky Blue         — ARCH
  "#44C15D", // Greenie          — TRNG
  "#F479D1", // Pinky            — BIM
  "#552497", // Deep Purple      — General / OTHER
  "#202022", // Blackie          — PM
];

export function randomBrandColor(): string {
  return BRAND_COLORS[Math.floor(Math.random() * BRAND_COLORS.length)];
}

export function pickBrandColor(index: number): string {
  return BRAND_COLORS[index % BRAND_COLORS.length];
}
