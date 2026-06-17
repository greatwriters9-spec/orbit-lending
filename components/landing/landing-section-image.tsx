import Image from "next/image";

import type { LandingImage } from "@/lib/landing/images";
import { cn } from "@/lib/utils";

type LandingSectionImageProps = LandingImage & {
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  sizes?: string;
};

export function LandingSectionImage({
  src,
  alt,
  objectPosition = "center",
  className,
  imageClassName,
  priority = false,
  sizes = "(max-width: 768px) 100vw, 50vw",
}: LandingSectionImageProps) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        className={cn("object-cover", imageClassName)}
        style={{ objectPosition }}
      />
    </div>
  );
}
