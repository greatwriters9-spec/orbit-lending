import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { LANDING_CONTAINER } from "@/lib/landing/content";
import type { LandingContent } from "@/lib/landing/get-landing-content";
import { LANDING_SECTION_IMAGES } from "@/lib/landing/images";

type FinalCTAProps = {
  content: LandingContent;
};

export function FinalCTA({ content }: FinalCTAProps) {
  const image = LANDING_SECTION_IMAGES.finalCta;

  return (
    <section className="relative overflow-hidden py-20 md:py-28">
      <Image
        src={image.src}
        alt={image.alt}
        fill
        sizes="100vw"
        className="object-cover"
        style={{ objectPosition: image.objectPosition }}
      />
      <div className="final-cta-overlay absolute inset-0 bg-brand-navy/82" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,color-mix(in_srgb,var(--brand-blue)_28%,transparent),transparent_55%)]" />

      <div className={`${LANDING_CONTAINER} relative`}>
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="heading-primary-light text-3xl md:text-4xl lg:text-[2.75rem] lg:leading-tight">
            {content.finalCtaTitle}
          </h2>
          <p className="mt-5 text-base leading-relaxed text-white/75 md:text-lg">
            {content.finalCtaSubtitle}
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/get-started"
              className="inline-flex h-11 items-center gap-2 rounded-[10px] bg-brand-blue px-7 text-sm font-semibold text-white transition-colors hover:opacity-90"
            >
              {content.heroButtonText}
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/get-started?homeFound=true"
              className="inline-flex h-11 items-center rounded-[10px] border border-white/20 bg-white/10 px-7 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            >
              I Already Found A Home
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
