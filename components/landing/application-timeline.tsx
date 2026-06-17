import {
  BadgeCheck,
  CircleDollarSign,
  FileCheck2,
  UserRoundPlus,
  Wallet,
} from "lucide-react";

import { LANDING_PROCESS_STEPS } from "@/lib/landing/content";
import { LANDING_SECTION_IMAGES } from "@/lib/landing/images";
import { cn } from "@/lib/utils";

import { LandingSectionImage } from "./landing-section-image";
import { SectionHeading, SectionShell } from "./shared/section-shell";

const STEP_ICONS = [UserRoundPlus, FileCheck2, BadgeCheck, CircleDollarSign, Wallet] as const;

export function ApplicationTimeline() {
  const banner = LANDING_SECTION_IMAGES.process;

  return (
    <SectionShell id="process" tone="white">
      <SectionHeading
        eyebrow="Application Journey"
        title="Simple Application Process"
        subtitle="A clear, guided path from account creation to funding — with visibility at every step."
      />

      <LandingSectionImage
        {...banner}
        className="mt-12 min-h-[220px] rounded-2xl shadow-[0_16px_48px_rgba(15,23,42,0.08)] sm:min-h-[280px] md:min-h-[340px]"
        sizes="100vw"
      />

      <div className="mt-14 hidden lg:block">
        <div className="relative">
          <div className="absolute top-8 right-0 left-0 h-0.5 bg-[#E5E7EB]" />
          <div className="absolute top-8 left-0 h-0.5 w-[55%] bg-brand-blue" />
          <div className="relative grid grid-cols-5 gap-6">
            {LANDING_PROCESS_STEPS.map((step, index) => {
              const Icon = STEP_ICONS[index] ?? FileCheck2;
              const active = index <= 2;
              return (
                <div key={step.id} className="text-center">
                  <div
                    className={cn(
                      "relative z-10 mx-auto flex size-16 items-center justify-center rounded-2xl border-2 bg-white shadow-sm transition-shadow",
                      active
                        ? "border-brand-blue text-brand-blue shadow-[0_4px_14px_rgba(37,99,235,0.15)]"
                        : "border-[#E5E7EB] text-muted-foreground",
                    )}
                  >
                    <Icon className="size-6" strokeWidth={1.75} />
                  </div>
                  <p className="mt-5 text-sm font-semibold text-brand-navy">{step.title}</p>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-10 space-y-0 lg:hidden">
        {LANDING_PROCESS_STEPS.map((step, index) => {
          const Icon = STEP_ICONS[index] ?? FileCheck2;
          const isLast = index === LANDING_PROCESS_STEPS.length - 1;
          return (
            <div key={step.id} className="relative flex gap-4 pb-8">
              {!isLast ? (
                <div className="absolute top-14 left-7 h-[calc(100%-3rem)] w-0.5 bg-[#E5E7EB]" />
              ) : null}
              <div className="relative z-10 flex size-14 shrink-0 items-center justify-center rounded-xl border-2 border-brand-blue bg-white text-brand-blue shadow-sm">
                <Icon className="size-5" strokeWidth={1.75} />
              </div>
              <div className="pt-1">
                <p className="text-sm font-semibold text-brand-navy">{step.title}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </SectionShell>
  );
}
