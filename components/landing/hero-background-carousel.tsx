import { existsSync } from "fs";
import path from "path";

import { LANDING_HERO_IMAGES, type LandingImage } from "@/lib/landing/images";

const DEFAULT_HERO_IMAGE = LANDING_HERO_IMAGES[0];

function heroSrcSet(src: string, src2x?: string, width?: number): string | undefined {
  const baseWidth = width ?? 1024;
  const base = `${src} ${baseWidth}w`;

  if (!src2x) {
    return base;
  }

  const retinaPath = path.join(process.cwd(), "public", src2x.replace(/^\//, ""));

  if (!existsSync(retinaPath)) {
    return base;
  }

  return `${src} ${baseWidth}w, ${src2x} ${baseWidth * 2}w`;
}

type HeroBackgroundCarouselProps = {
  heroImage?: LandingImage;
};

export function HeroBackgroundCarousel({ heroImage = DEFAULT_HERO_IMAGE }: HeroBackgroundCarouselProps) {
  const srcSet = heroImage.srcSet ?? heroSrcSet(heroImage.src, heroImage.src2x, heroImage.width);

  return (
    <div className="absolute inset-0 w-full overflow-hidden" aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={heroImage.src}
        srcSet={srcSet}
        sizes="100vw"
        alt={heroImage.alt}
        width={heroImage.width}
        height={heroImage.height}
        decoding="async"
        fetchPriority="high"
        className="hero-background-image absolute inset-0 h-full w-full object-cover"
        style={{ objectPosition: heroImage.objectPosition ?? "center" }}
      />
    </div>
  );
}
