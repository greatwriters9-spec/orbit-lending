import type { TypographyTokens } from "@/lib/design-system/types";

export const oakstoneTypography: TypographyTokens = {
  fontFamilies: {
    serif: 'var(--font-playfair), "Playfair Display", Georgia, "Times New Roman", serif',
    sans: 'var(--font-inter), ui-sans-serif, system-ui, sans-serif',
  },
  scales: {
    heroHeadline: {
      fontFamily: 'var(--font-playfair), "Playfair Display", Georgia, serif',
      fontSize: "3.75rem",
      fontWeight: 700,
      lineHeight: "1.06",
      letterSpacing: "-0.02em",
    },
    sectionTitle: {
      fontFamily: 'var(--font-playfair), "Playfair Display", Georgia, serif',
      fontSize: "2.75rem",
      fontWeight: 600,
      lineHeight: "1.15",
      letterSpacing: "-0.01em",
    },
    eyebrow: {
      fontFamily: 'var(--font-inter), ui-sans-serif, system-ui, sans-serif',
      fontSize: "0.75rem",
      fontWeight: 600,
      lineHeight: "1.4",
      letterSpacing: "0.2em",
    },
    body: {
      fontFamily: 'var(--font-inter), ui-sans-serif, system-ui, sans-serif',
      fontSize: "1rem",
      fontWeight: 400,
      lineHeight: "1.6",
    },
  },
};
