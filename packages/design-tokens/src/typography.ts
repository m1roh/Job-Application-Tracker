export const fontFamilies = {
  text: "'Inter', -apple-system, sans-serif",
  mono: "'JetBrains Mono', monospace",
} as const;

export const typeScale = {
  h1: { fontSize: "38px", fontWeight: 800, letterSpacing: "-0.02em" },
  h1Hero: { fontSize: "52px", fontWeight: 800, letterSpacing: "-0.03em" },
  h2: { fontSize: "26px", fontWeight: 700, letterSpacing: "-0.01em" },
  h3: { fontSize: "18px", fontWeight: 600 },
  body: { fontSize: "15px", fontWeight: 400 },
  caption: {
    fontSize: "12px",
    fontWeight: 500,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
} as const;
