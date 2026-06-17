import Image from "next/image";

import { LANDING_HERO_IMAGES } from "@/lib/landing/images";

const HERO_IMAGE = LANDING_HERO_IMAGES[0];

export function HeroBackgroundCarousel() {
  return (
    <div className="absolute inset-0 w-full overflow-hidden" aria-hidden>
      <Image
        src={HERO_IMAGE.src}
        alt={HERO_IMAGE.alt}
        fill
        priority
        sizes="100vw"
        className="w-full object-cover"
        style={{ objectPosition: HERO_IMAGE.objectPosition ?? "center" }}
      />
    </div>
  );
}
