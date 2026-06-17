import { LANDING_TESTIMONIALS } from "@/lib/landing/content";
import { LANDING_SECTION_IMAGES } from "@/lib/landing/images";

import { LandingSectionImage } from "./landing-section-image";
import { SectionHeading, SectionShell } from "./shared/section-shell";

export function Testimonials() {
  const image = LANDING_SECTION_IMAGES.testimonials;

  return (
    <SectionShell tone="white">
      <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <LandingSectionImage
          {...image}
          className="order-2 min-h-[300px] rounded-2xl shadow-[0_20px_60px_rgba(15,23,42,0.1)] lg:order-1 lg:min-h-[560px]"
          sizes="(max-width: 1024px) 100vw, 480px"
        />

        <div className="order-1 lg:order-2">
          <SectionHeading
            align="left"
            eyebrow="Homebuyer Stories"
            title="Homebuyer Success Stories"
            subtitle="Real experiences from clients who chose Orbit for fixed-rate mortgages, refinances, and home equity solutions."
          />

          <div className="mt-10 space-y-5">
            {LANDING_TESTIMONIALS.map((testimonial) => (
              <figure
                key={testimonial.name}
                className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-[0_4px_24px_rgba(15,23,42,0.04)]"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex gap-0.5 text-brand-warning">
                    {Array.from({ length: testimonial.rating }).map((_, index) => (
                      <span key={index} aria-hidden>
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="rounded-full bg-brand-blue/10 px-2.5 py-1 text-[11px] font-semibold text-brand-blue">
                    Funded {testimonial.fundedAmount}
                  </span>
                </div>
                <blockquote className="mt-4 text-sm leading-relaxed text-[#374151]">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-5 border-t border-[#E5E7EB] pt-4">
                  <p className="font-semibold text-brand-navy">{testimonial.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{testimonial.role}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </SectionShell>
  );
}
