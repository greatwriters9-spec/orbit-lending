export type LandingImage = {
  src: string;
  alt: string;
  objectPosition?: string;
};

export const LANDING_HERO_IMAGES: LandingImage[] = [
  {
    src: "/landing/hero-couple-home.png",
    alt: "Happy couple celebrating in front of their new home",
    objectPosition: "62% center",
  },
];

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
