import Link from "next/link";
import { ArrowRight, FileText, Scale, Shield, Cookie, Mail, Landmark, Phone } from "lucide-react";

import { LEGAL_DOCUMENT_META } from "@/lib/legal/registry";
import { cn } from "@/lib/utils";

const ICONS: Record<string, typeof FileText> = {
  "terms-of-use": Scale,
  "privacy-policy": Shield,
  "cookie-policy": Cookie,
  "electronic-communications-consent": Mail,
  "mortgage-application-disclosure": FileText,
  "fair-lending-statement": Landmark,
  "contact-information": Phone,
};

export function LegalHubPage() {
  return (
    <div className="pb-16 pt-10 md:pb-20 md:pt-14">
      <div className="mx-auto w-full max-w-6xl px-5 md:px-8">
        <header className="max-w-3xl">
          <p className="text-xs font-semibold tracking-[0.1em] text-brand-blue uppercase">
            Orbit Mortgage
          </p>
          <h1 className="heading-primary mt-3 text-3xl md:text-4xl lg:text-[2.75rem]">
            Legal Center
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
            Review Orbit Mortgage policies, disclosures, and contact information
            governing use of our digital mortgage platform—including applications,
            funding accounts, document uploads, identity verification, customer
            support, notifications, email communications, and escrow-based closing
            workflows.
          </p>
        </header>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {LEGAL_DOCUMENT_META.map((doc) => {
            const Icon = ICONS[doc.slug] ?? FileText;

            return (
              <Link
                key={doc.slug}
                href={`/legal/${doc.slug}`}
                className={cn(
                  "group rounded-2xl border border-brand-border bg-white p-6 shadow-sm transition-all",
                  "hover:border-brand-blue/25 hover:shadow-[0_12px_32px_rgba(15,45,120,0.08)]",
                )}
              >
                <div className="flex items-start gap-4">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue">
                    <Icon className="size-5" strokeWidth={1.75} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg font-semibold text-brand-navy group-hover:text-brand-blue">
                      {doc.title}
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {doc.shortDescription}
                    </p>
                    <p className="mt-3 text-xs font-medium text-brand-navy/55">
                      Last Updated: {doc.lastUpdated}
                    </p>
                  </div>
                  <ArrowRight className="mt-1 size-4 shrink-0 text-brand-blue opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-10 rounded-2xl border border-brand-border bg-brand-background p-6 md:p-8">
          <h2 className="text-lg font-semibold text-brand-navy">
            Important Notice
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-brand-navy/75 md:text-[15px]">
            These documents provide general information about Orbit Mortgage
            policies and platform practices. They do not constitute legal,
            tax, or financial advice, and they do not replace loan-specific
            disclosures provided during your application or closing process.
            For application-specific questions, contact our support team or
            refer to your customer dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}
