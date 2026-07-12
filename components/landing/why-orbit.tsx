import { Eye, RefreshCw, ShieldCheck, Zap } from "lucide-react";

import { LANDING_WHY_FEATURES } from "@/lib/landing/content";
import type { LandingContent } from "@/lib/landing/get-landing-content";
import { LANDING_SECTION_IMAGES } from "@/lib/landing/images";

import { LandingSectionImage } from "./landing-section-image";
import { SectionHeading, SectionShell } from "./shared/section-shell";

const ICONS = [Zap, Eye, ShieldCheck, RefreshCw] as const;

type WhyOrbitProps = {
  content: LandingContent;
};

export function WhyOrbit({ content }: WhyOrbitProps) {
  const image = LANDING_SECTION_IMAGES.whyOrbit;

  return (
    <SectionShell id="why-orbit" tone="muted">
      <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
        <div>
          <SectionHeading
            align="left"
            eyebrow={content.whyEyebrow}
            title={content.whyTitle}
            subtitle={content.whySubtitle}
          />

          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {LANDING_WHY_FEATURES.map((feature, index) => {
              const Icon = ICONS[index] ?? ShieldCheck;
              return (
                <div
                  key={feature.title}
                  className="oak-card rounded-2xl border border-brand-border bg-white p-5 shadow-[var(--shadow-card)] transition-shadow duration-300 hover:shadow-[var(--shadow-card-hover)]"
                >
                  <div className="flex size-11 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue">
                    <Icon className="size-5" strokeWidth={1.75} />
                  </div>
                  <h3 className="heading-tertiary mt-4 text-base">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <LandingSectionImage
          {...image}
          className="min-h-[320px] rounded-2xl shadow-[0_20px_60px_rgba(15,23,42,0.12)] sm:min-h-[420px] lg:min-h-[520px]"
          sizes="(max-width: 1024px) 100vw, 560px"
        />
      </div>
    </SectionShell>
  );
}
