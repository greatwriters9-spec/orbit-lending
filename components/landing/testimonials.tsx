import { LANDING_TESTIMONIALS } from "@/lib/landing/content";

import { SectionHeading, SectionShell } from "./shared/section-shell";

export function Testimonials() {
  return (
    <SectionShell tone="white">
      <SectionHeading
        eyebrow="Borrower Stories"
        title="Borrower Success Stories"
        subtitle="Real experiences from clients who chose Orbit for personal, business, and property financing."
      />

      <div className="mt-14 grid gap-6 lg:grid-cols-3">
        {LANDING_TESTIMONIALS.map((testimonial) => (
          <figure
            key={testimonial.name}
            className="flex flex-col rounded-2xl border border-[#E5E7EB] bg-white p-7 shadow-[0_4px_24px_rgba(15,23,42,0.04)]"
          >
            <div className="flex items-center justify-between">
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
            <blockquote className="mt-5 flex-1 text-sm leading-relaxed text-[#374151]">
              &ldquo;{testimonial.quote}&rdquo;
            </blockquote>
            <figcaption className="mt-6 border-t border-[#E5E7EB] pt-5">
              <p className="font-semibold text-brand-navy">{testimonial.name}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{testimonial.role}</p>
            </figcaption>
          </figure>
        ))}
      </div>
    </SectionShell>
  );
}
