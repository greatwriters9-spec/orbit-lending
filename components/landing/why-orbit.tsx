import { Eye, RefreshCw, ShieldCheck, Zap } from "lucide-react";

import { LANDING_WHY_FEATURES } from "@/lib/landing/content";

import { SectionHeading, SectionShell } from "./shared/section-shell";

const ICONS = [Zap, Eye, ShieldCheck, RefreshCw] as const;

export function WhyOrbit() {
  return (
    <SectionShell id="why-orbit" tone="muted">
      <SectionHeading
        eyebrow="Why Orbit"
        title="Why Borrowers Choose Orbit"
        subtitle="Built for speed, transparency, and modern lending experiences."
      />

      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {LANDING_WHY_FEATURES.map((feature, index) => {
          const Icon = ICONS[index] ?? ShieldCheck;
          return (
            <div
              key={feature.title}
              className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-[0_4px_24px_rgba(15,23,42,0.04)] transition-shadow duration-300 hover:shadow-[0_12px_40px_rgba(15,23,42,0.08)]"
            >
              <div className="flex size-12 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue">
                <Icon className="size-5" strokeWidth={1.75} />
              </div>
              <h3 className="heading-tertiary mt-5 text-lg">{feature.title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>
    </SectionShell>
  );
}
