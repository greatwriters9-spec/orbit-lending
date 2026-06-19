"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronDown, Printer } from "lucide-react";

import { LegalSectionBlock } from "@/components/legal/legal-block-renderer";
import { getLegalTocItems } from "@/lib/legal/registry";
import type { LegalDocument } from "@/lib/legal/types";
import { cn } from "@/lib/utils";

type LegalTableOfContentsProps = {
  document: LegalDocument;
  className?: string;
  mobile?: boolean;
};

export function LegalTableOfContents({
  document,
  className,
  mobile = false,
}: LegalTableOfContentsProps) {
  const items = getLegalTocItems(document);
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-20% 0px -65% 0px", threshold: [0, 0.25, 0.5, 1] },
    );

    for (const item of items) {
      const element = window.document.getElementById(item.id);
      if (element) {
        observer.observe(element);
      }
    }

    return () => observer.disconnect();
  }, [items]);

  const nav = (
    <nav aria-label="Table of contents">
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={cn(
                "block rounded-lg px-3 py-2 text-sm transition-colors",
                item.level === 3 && "pl-6 text-[13px]",
                activeId === item.id
                  ? "bg-brand-blue/10 font-medium text-brand-blue"
                  : "text-brand-navy/70 hover:bg-brand-background hover:text-brand-navy",
              )}
            >
              {item.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );

  if (mobile) {
    return (
      <div className={cn("legal-no-print lg:hidden", className)}>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="flex w-full items-center justify-between rounded-xl border border-brand-border bg-white px-4 py-3 text-sm font-semibold text-brand-navy"
        >
          Table of Contents
          <ChevronDown
            className={cn("size-4 transition-transform", open && "rotate-180")}
          />
        </button>
        {open ? (
          <div className="mt-3 rounded-xl border border-brand-border bg-white p-3">
            {nav}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <aside
      className={cn(
        "legal-no-print hidden lg:block",
        className,
      )}
    >
      <div className="sticky top-28 rounded-2xl border border-brand-border bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold tracking-[0.08em] text-brand-blue uppercase">
          On this page
        </p>
        <div className="mt-4 max-h-[calc(100vh-10rem)] overflow-y-auto pr-1">
          {nav}
        </div>
      </div>
    </aside>
  );
}

type LegalDocumentViewProps = {
  document: LegalDocument;
};

export function LegalDocumentView({ document }: LegalDocumentViewProps) {
  return (
    <article className="legal-document pb-16 pt-10 md:pb-20 md:pt-14">
      <div className="mx-auto w-full max-w-6xl px-5 md:px-8">
        <div className="legal-no-print mb-6">
          <Link
            href="/legal"
            className="text-sm font-medium text-brand-blue hover:text-brand-blue/80"
          >
            ← Legal Center
          </Link>
        </div>

        <header className="border-b border-brand-border pb-8">
          <p className="text-xs font-semibold tracking-[0.1em] text-brand-blue uppercase">
            Orbit Mortgage Legal
          </p>
          <h1 className="heading-primary mt-3 text-3xl md:text-4xl lg:text-[2.5rem]">
            {document.title}
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">
            {document.shortDescription}
          </p>
          <div className="legal-no-print mt-6 flex flex-wrap items-center gap-3">
            <span className="inline-flex rounded-full border border-brand-border bg-brand-background px-3 py-1 text-xs font-medium text-brand-navy/75">
              Last Updated: {document.lastUpdated}
            </span>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-full border border-brand-border bg-white px-3 py-1.5 text-xs font-semibold text-brand-navy transition-colors hover:border-brand-blue/30 hover:text-brand-blue"
            >
              <Printer className="size-3.5" />
              Print
            </button>
          </div>
          <p className="legal-print-only mt-4 hidden text-xs text-brand-navy/70">
            Last Updated: {document.lastUpdated}
          </p>
        </header>

        <LegalTableOfContents document={document} mobile className="mt-8" />

        <div className="mt-8 grid gap-10 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-12">
          <LegalTableOfContents document={document} />
          <div className="min-w-0 space-y-10 rounded-2xl border border-brand-border bg-white p-6 md:p-8 lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0">
            {document.sections.map((section) => (
              <LegalSectionBlock key={section.id} section={section} />
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
