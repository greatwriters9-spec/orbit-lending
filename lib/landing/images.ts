import { isOakstoneCompany } from "@/lib/design-system/oakstone/theme";

import type { CompanyRecord } from "@/types/company";

export type LandingImage = {
  src: string;
  alt: string;
  objectPosition?: string;
  /** Optional retina asset — use 2× the display width (e.g. 2560px for 1280px layouts). */
  src2x?: string;
  /** Pre-built responsive srcSet (e.g. multiple WebP widths). */
  srcSet?: string;
  width?: number;
  height?: number;
};

/** Hero backgrounds should be at least 2400px wide for sharp full-bleed display. */
export const LANDING_HERO_MIN_WIDTH = 2400;

export const LANDING_HERO_IMAGES: LandingImage[] = [
  {
    src: "/landing/hero-couple-golden-hour.png",
    alt: "Happy couple in front of their new home on a golden sunny afternoon",
    objectPosition: "center center",
    width: 1024,
    height: 576,
  },
];

/** Premium OakStone hero — luxury home at dusk with warm interior glow. */
export const OAKSTONE_HERO_IMAGE: LandingImage = {
  src: "/assets/oakstone/hero-home.webp",
  srcSet:
    "/assets/oakstone/hero-home-768.webp 768w, /assets/oakstone/hero-home-1280.webp 1280w, /assets/oakstone/hero-home.webp 1920w",
  alt: "Luxury home at dusk with warm interior lighting and manicured landscaping",
  objectPosition: "58% 42%",
  width: 1024,
  height: 775,
};

export function resolveLandingHeroImage(
  company: Pick<CompanyRecord, "slug" | "heroBackground">,
): LandingImage {
  if (isOakstoneCompany(company.slug)) {
    return OAKSTONE_HERO_IMAGE;
  }

  if (company.heroBackground) {
    return { ...LANDING_HERO_IMAGES[0], src: company.heroBackground, src2x: undefined, srcSet: undefined };
  }

  return LANDING_HERO_IMAGES[0];
}

export const LANDING_SECTION_IMAGES = {
  whyOrbit: {
    src: "/landing/hero-family-breakfast.png",
    alt: "Family sharing breakfast together at home",
    objectPosition: "center 30%",
  },
  process: {
    src: "/landing/hero-sunny-building.png",
    alt: "Sunlit residential building on a neighborhood street",
    objectPosition: "center center",
  },
  activity: {
    src: "/landing/hero-dog-wash.png",
    alt: "Family washing their dog in the backyard",
    objectPosition: "center 40%",
  },
  trust: {
    src: "/landing/hero-coastal-home.png",
    alt: "Coastal home with a wraparound porch",
    objectPosition: "center center",
  },
  testimonials: {
    src: "/landing/section-cozy-living.png",
    alt: "Cozy living room at home with a pet",
    objectPosition: "center center",
  },
  finalCta: {
    src: "/landing/hero-red-door-home.png",
    alt: "Charming home with a red front door and green lawn",
    objectPosition: "center center",
  },
  dashboard: {
    src: "/landing/hero-coastal-home.png",
    alt: "Coastal home with a wraparound porch",
    objectPosition: "center center",
  },
} as const satisfies Record<string, LandingImage>;
