import type { DesignTheme } from "@/lib/design-system/types";

import {
  oakstoneAnimations,
  oakstoneColors,
  oakstoneRadius,
  oakstoneShadows,
  oakstoneSpacing,
  oakstoneTypography,
} from "./tokens";

export { oakstoneColors } from "./tokens/colors";

export const OAKSTONE_SLUG = "oakstone";

export function isOakstoneCompany(slug: string): boolean {
  return slug === OAKSTONE_SLUG;
}

export const oakstoneTheme: DesignTheme = {
  colors: { ...oakstoneColors },
  typography: oakstoneTypography,
  spacing: oakstoneSpacing,
  shadows: oakstoneShadows,
  radius: oakstoneRadius,
  animations: oakstoneAnimations,
};

function hexToRgba(hex: string, alpha: number): string {
  const normalized = hex.replace("#", "");
  if (normalized.length !== 6) {
    return `rgba(15, 91, 71, ${alpha})`;
  }

  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function oakstoneCssVariables(): Record<string, string> {
  const { primaryGreen, bronzeAccent, lightChampagne, lightBackground, darkText, stoneGray, borderGray, secondaryGreen } =
    oakstoneColors;

  return {
    "--brand-navy": primaryGreen,
    "--brand-blue": bronzeAccent,
    "--brand-blue-dark": lightChampagne,
    "--company-primary": primaryGreen,
    "--company-secondary": bronzeAccent,
    "--company-accent": secondaryGreen,
    "--company-background": lightBackground,

    "--oak-green": primaryGreen,
    "--oak-green-secondary": secondaryGreen,
    "--oak-gold": bronzeAccent,
    "--oak-gold-hover": lightChampagne,
    "--oak-bronze": bronzeAccent,
    "--oak-champagne": lightChampagne,
    "--oak-text": darkText,
    "--oak-stone": stoneGray,
    "--oak-cream": lightBackground,
    "--oak-border": borderGray,

    "--heading-color": darkText,
    "--background": lightBackground,
    "--brand-background": lightBackground,
    "--brand-border": borderGray,
    "--border": borderGray,
    "--foreground": darkText,
    "--primary": bronzeAccent,
    "--primary-foreground": "#ffffff",
    "--ring": bronzeAccent,
    "--accent": hexToRgba(bronzeAccent, 0.12),
    "--accent-foreground": primaryGreen,

    "--hero-overlay-start": "rgba(6, 32, 26, 0.94)",
    "--hero-overlay-mid": "rgba(15, 91, 71, 0.58)",
    "--hero-overlay-bottom": "rgba(0, 0, 0, 0.32)",
    "--hero-eyebrow-color": bronzeAccent,

    "--shadow-card": oakstoneShadows.card,
    "--shadow-card-hover": oakstoneShadows.cardHover,
    "--shadow-elevated": oakstoneShadows.elevated,
    "--shadow-nav": oakstoneShadows.nav,
    "--shadow-button": oakstoneShadows.button,

    "--sidebar": primaryGreen,
    "--sidebar-primary": bronzeAccent,
    "--sidebar-accent": hexToRgba(bronzeAccent, 0.18),
    "--sidebar-ring": bronzeAccent,

    "--font-heading": oakstoneTypography.fontFamilies.serif,
    "--heading-letter-spacing": "-0.01em",
  };
}

export function orbitCssVariables(primaryColor: string): Record<string, string> {
  return {
    "--hero-overlay-start": hexToRgba(primaryColor, 0.82),
    "--hero-overlay-mid": hexToRgba(primaryColor, 0.35),
    "--hero-overlay-bottom": hexToRgba(primaryColor, 0.28),
    "--hero-eyebrow-color": "rgba(255, 255, 255, 0.85)",
  };
}
