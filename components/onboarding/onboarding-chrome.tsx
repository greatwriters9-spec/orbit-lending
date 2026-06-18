"use client";

import Link from "next/link";
import { useState } from "react";
import { MessageCircle } from "lucide-react";

import { OrbitLogo } from "@/components/brand/orbit-logo";
import { AskAssistantModal } from "@/components/support/ask-assistant-modal";
import {
  ONBOARDING_STEP_FAQS,
  type OnboardingStepKey,
} from "@/lib/onboarding/faq-content";
import { LANDING_TESTIMONIALS, PATHWARD_BANK } from "@/lib/landing/content";
import { cn } from "@/lib/utils";

export function AskAssistantButton({
  isLoggedIn,
  className,
  source = "onboarding",
}: {
  isLoggedIn?: boolean;
  className?: string;
  source?: string;
}) {
  const [open, setOpen] = useState(false);

  if (isLoggedIn) {
    return (
      <Link
        href="/dashboard/support/new?category=application_support"
        className={cn(
          "fixed bottom-6 right-4 z-40 inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-4 py-3 text-sm font-semibold text-brand-navy shadow-[0_10px_30px_rgba(15,23,42,0.12)] transition-colors hover:border-brand-blue/30 hover:text-brand-blue md:right-6",
          className,
        )}
      >
        <MessageCircle className="size-4 text-brand-blue" strokeWidth={1.75} />
        Ask Assistant
      </Link>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "fixed bottom-6 right-4 z-40 inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-4 py-3 text-sm font-semibold text-brand-navy shadow-[0_10px_30px_rgba(15,23,42,0.12)] transition-colors hover:border-brand-blue/30 hover:text-brand-blue md:right-6",
          className,
        )}
      >
        <MessageCircle className="size-4 text-brand-blue" strokeWidth={1.75} />
        Ask Assistant
      </button>
      <AskAssistantModal
        open={open}
        onClose={() => setOpen(false)}
        source={source}
      />
    </>
  );
}

export function OnboardingTestimonials({ step = 1 }: { step?: number }) {
  const item = LANDING_TESTIMONIALS[(step - 1) % LANDING_TESTIMONIALS.length];

  return (
    <figure className="mt-10 border-t border-[#E5E7EB] pt-6">
      <blockquote className="text-sm leading-relaxed text-brand-navy/65 md:text-base">
        &ldquo;{item.quote}&rdquo;
      </blockquote>
      <figcaption className="mt-2 text-xs font-medium text-muted-foreground md:text-sm">
        {item.name} · {item.role}
      </figcaption>
    </figure>
  );
}

export function OnboardingStepFaq({ stepKey }: { stepKey?: OnboardingStepKey }) {
  if (!stepKey) return null;

  const faqs = ONBOARDING_STEP_FAQS[stepKey];
  if (!faqs?.length) return null;

  return (
    <section className="mt-10">
      <h2 className="text-sm font-semibold text-brand-navy">Common questions</h2>
      <div className="mt-4 space-y-3">
        {faqs.map((faq) => (
          <details
            key={faq.question}
            className="group rounded-xl border border-[#E5E7EB] bg-white"
          >
            <summary className="cursor-pointer list-none px-4 py-3.5 text-sm font-medium text-brand-navy marker:content-none [&::-webkit-details-marker]:hidden">
              <span className="flex items-center justify-between gap-3">
                {faq.question}
                <span className="shrink-0 text-xs font-semibold text-brand-blue group-open:hidden">
                  View answer
                </span>
                <span className="hidden shrink-0 text-xs font-semibold text-brand-blue group-open:inline">
                  Hide answer
                </span>
              </span>
            </summary>
            <p className="border-t border-[#E5E7EB] px-4 py-3 text-sm leading-relaxed text-muted-foreground">
              {faq.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}

export function OnboardingFooter({ className }: { className?: string }) {
  return (
    <footer
      className={cn(
        "fixed inset-x-0 bottom-0 z-30 border-t border-[#E5E7EB] bg-white/95 backdrop-blur-md shadow-[0_-4px_20px_rgba(15,23,42,0.06)]",
        className,
      )}
    >
      <div className="mx-auto flex max-w-3xl flex-col items-center justify-between gap-2 px-4 py-3 sm:flex-row md:px-6">
        <div className="flex items-center gap-3">
          <OrbitLogo href="/" size="sm" />
          <span className="hidden text-xs text-muted-foreground sm:inline">
            {PATHWARD_BANK.name}
          </span>
        </div>
        <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-xs font-medium md:text-sm">
          <Link href="/login" className="text-brand-blue hover:text-brand-blue/80">
            Log In
          </Link>
          <Link href="/get-started" className="text-brand-blue hover:text-brand-blue/80">
            Get Pre-Qualified
          </Link>
          <Link
            href="/dashboard/support"
            className="text-brand-blue hover:text-brand-blue/80"
          >
            Support
          </Link>
        </nav>
        <p className="text-[11px] text-muted-foreground sm:text-xs">
          © {new Date().getFullYear()} Orbit Mortgage
        </p>
      </div>
    </footer>
  );
}
