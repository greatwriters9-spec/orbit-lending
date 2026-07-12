import { CheckCircle2, Clock3 } from "lucide-react";

import { LANDING_ACTIVITY } from "@/lib/landing/content";
import type { LandingContent } from "@/lib/landing/get-landing-content";
import { LANDING_SECTION_IMAGES } from "@/lib/landing/images";
import { cn } from "@/lib/utils";

import { LandingSectionImage } from "./landing-section-image";
import { SectionHeading, SectionShell } from "./shared/section-shell";

const toneStyles = {
  success: "text-brand-success bg-brand-success/10 border-brand-success/20",
  info: "text-brand-blue bg-brand-blue/10 border-brand-blue/20",
  warning: "text-brand-warning bg-brand-warning/10 border-brand-warning/20",
};

type ActivityFeedProps = {
  content: LandingContent;
};

export function ActivityFeed({ content }: ActivityFeedProps) {
  const image = LANDING_SECTION_IMAGES.activity;

  return (
    <SectionShell tone="muted">
      <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <div>
          <SectionHeading
            align="left"
            eyebrow="Platform Activity"
            title="Recent Platform Activity"
            subtitle={content.activitySubtitle}
          />

          <div className="mt-10 grid gap-4">
            {LANDING_ACTIVITY.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-4 rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-[0_4px_20px_rgba(15,23,42,0.04)] transition-shadow hover:shadow-[0_8px_30px_rgba(15,23,42,0.07)]"
              >
                <div
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-xl border",
                    toneStyles[item.tone],
                  )}
                >
                  <CheckCircle2 className="size-4.5" strokeWidth={2} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-brand-navy">{item.message}</p>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock3 className="size-3.5" />
                    {item.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <LandingSectionImage
          {...image}
          className="min-h-[360px] rounded-2xl shadow-[0_20px_60px_rgba(15,23,42,0.12)] lg:min-h-[520px]"
          sizes="(max-width: 1024px) 100vw, 540px"
        />
      </div>
    </SectionShell>
  );
}
