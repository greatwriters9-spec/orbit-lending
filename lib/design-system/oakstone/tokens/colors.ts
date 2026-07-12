import type { ColorTokens } from "@/lib/design-system/types";

export const oakstoneColors = {
  primaryGreen: "#0F5B47",
  secondaryGreen: "#1D6A54",
  bronzeAccent: "#C58A2B",
  lightChampagne: "#E7C68A",
  /** @deprecated Use bronzeAccent — kept for token compatibility */
  premiumGold: "#C58A2B",
  /** @deprecated Use lightChampagne — kept for token compatibility */
  warmGoldHover: "#E7C68A",
  white: "#FFFFFF",
  lightBackground: "#F8F7F3",
  stoneGray: "#7B7B7B",
  darkText: "#1D2A24",
  borderGray: "#E5E7EB",
} as const;

export const oakstoneColorTokens: ColorTokens = {
  primaryGreen: { value: oakstoneColors.primaryGreen, description: "Primary brand green" },
  secondaryGreen: { value: oakstoneColors.secondaryGreen, description: "Secondary accent green" },
  premiumGold: { value: oakstoneColors.bronzeAccent, description: "Primary CTA bronze" },
  warmGoldHover: { value: oakstoneColors.lightChampagne, description: "Bronze hover state" },
  white: { value: oakstoneColors.white },
  lightBackground: { value: oakstoneColors.lightBackground, description: "Section backgrounds" },
  stoneGray: { value: oakstoneColors.stoneGray, description: "Muted body text" },
  darkText: { value: oakstoneColors.darkText, description: "Headings and primary text" },
  borderGray: { value: oakstoneColors.borderGray, description: "Borders and dividers" },
};
