import { existsSync } from "fs";
import path from "path";

import { LANDING_HERO_IMAGES } from "@/lib/landing/images";

const HERO_IMAGE = LANDING_HERO_IMAGES[0];

function heroSrcSet(): string | undefined {
  const width = HERO_IMAGE.width ?? 1024;
  const base = `${HERO_IMAGE.src} ${width}w`;

  if (!HERO_IMAGE.src2x) {
    return base;
  }

  const retinaPath = path.join(
    process.cwd(),
    "public",
    HERO_IMAGE.src2x.replace(/^\//, ""),
  );

  if (!existsSync(retinaPath)) {
    return base;
  }

  return `${HERO_IMAGE.src} ${width}w, ${HERO_IMAGE.src2x} ${width * 2}w`;
}

export function HeroBackgroundCarousel() {
  const srcSet = heroSrcSet();

  return (
    <div className="absolute inset-0 w-full overflow-hidden" aria-hidden>
      {/* Native img avoids extra compression; srcSet picks retina when available. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={HERO_IMAGE.src}
        srcSet={srcSet}
        sizes="100vw"
        alt={HERO_IMAGE.alt}
        width={HERO_IMAGE.width}
        height={HERO_IMAGE.height}
        decoding="async"
        fetchPriority="high"
        className="absolute inset-0 h-full w-full object-cover"
        style={{ objectPosition: HERO_IMAGE.objectPosition ?? "center" }}
      />
    </div>
  );
}
