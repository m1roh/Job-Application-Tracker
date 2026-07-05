// Clés alignées sur `ApplicationStatus` (packages/core/src/domain/job-application.ts).
// Dupliquées ici plutôt qu'importées : `design-tokens` est consommé par `web-angular`,
// qui ne doit jamais dépendre de `packages/core` (frontière hexagonale, cf. CLAUDE.md).
export type StatusKey =
  | "to_contact"
  | "offer_open"
  | "application_sent"
  | "follow_up_sent"
  | "hr_interview"
  | "technical_interview"
  | "offer_received"
  | "rejected"
  | "on_hold"
  | "withdrawn";

export type StatusColorTokens = {
  text: string;
  bg: string;
  border: string;
  dot: string;
};

export const neutralColors = {
  surface: "oklch(99% .002 250)",
  pageBackground: "oklch(97.5% .003 250)",
  border: "oklch(90% .004 250)",
  inputBorder: "oklch(88% .005 250)",
  textPrimary: "oklch(22% .01 250)",
  textSecondary: "oklch(48% .01 250)",
  textLabel: "oklch(38% .01 250)",
  textCaption: "oklch(55% .01 250)",
  textMeta: "oklch(58% .01 250)",
  textDisabled: "oklch(68% .006 250)",
  backgroundDisabled: "oklch(93% .004 250)",
  backgroundHover: "oklch(95% .003 250)",
  accent: "oklch(52% .17 262)",
  accentHover: "oklch(46% .17 262)",
  // Fond/bordure teintés pour signaler un filtre actif (même teinte 262 que accent) — cf. doc section 09.
  accentSurface: "oklch(93% .035 262)",
  accentSurfaceBorder: "oklch(85% .05 262)",
  // Bouton destructif : même L/C que accent/accentHover, teinte 25 (famille du statut `rejected`) — cf. doc section 12.
  destructive: "oklch(52% .17 25)",
  destructiveHover: "oklch(46% .17 25)",
} as const;

export const statusColors: Record<StatusKey, StatusColorTokens> = {
  to_contact: {
    text: "oklch(35% 0.01 250)",
    bg: "oklch(95% 0.005 250)",
    border: "oklch(88% 0.006 250)",
    dot: "oklch(55% 0.01 250)",
  },
  offer_open: {
    text: "oklch(38% 0.08 235)",
    bg: "oklch(94% 0.025 235)",
    border: "oklch(86% 0.03 235)",
    dot: "oklch(55% 0.09 235)",
  },
  application_sent: {
    text: "oklch(38% 0.14 255)",
    bg: "oklch(93% 0.035 255)",
    border: "oklch(85% 0.05 255)",
    dot: "oklch(55% 0.16 255)",
  },
  follow_up_sent: {
    text: "oklch(38% 0.11 210)",
    bg: "oklch(93% 0.035 210)",
    border: "oklch(85% 0.05 210)",
    dot: "oklch(58% 0.13 210)",
  },
  hr_interview: {
    text: "oklch(38% 0.14 300)",
    bg: "oklch(93% 0.035 300)",
    border: "oklch(85% 0.05 300)",
    dot: "oklch(55% 0.16 300)",
  },
  technical_interview: {
    text: "oklch(38% 0.15 325)",
    bg: "oklch(93% 0.035 325)",
    border: "oklch(85% 0.05 325)",
    dot: "oklch(55% 0.17 325)",
  },
  offer_received: {
    text: "oklch(38% 0.12 145)",
    bg: "oklch(93% 0.045 145)",
    border: "oklch(84% 0.06 145)",
    dot: "oklch(55% 0.14 145)",
  },
  rejected: {
    text: "oklch(40% 0.15 25)",
    bg: "oklch(93% 0.04 25)",
    border: "oklch(85% 0.055 25)",
    dot: "oklch(55% 0.17 25)",
  },
  on_hold: {
    text: "oklch(40% 0.12 80)",
    bg: "oklch(93% 0.05 80)",
    border: "oklch(85% 0.06 80)",
    dot: "oklch(60% 0.14 80)",
  },
  withdrawn: {
    text: "oklch(30% 0.005 250)",
    bg: "oklch(92% 0.005 250)",
    border: "oklch(84% 0.006 250)",
    dot: "oklch(45% 0.005 250)",
  },
};
