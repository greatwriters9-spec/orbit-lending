import type { LegalListBlock, LegalSection, LegalSubsection } from "@/lib/legal/types";
import { cn } from "@/lib/utils";

function LegalList({ list }: { list: LegalListBlock }) {
  return (
    <div className="mt-4">
      {list.intro ? (
        <p className="mb-2 text-sm leading-relaxed text-brand-navy/80 md:text-[15px]">
          {list.intro}
        </p>
      ) : null}
      <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-brand-navy/80 md:text-[15px]">
        {list.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function LegalParagraphs({ paragraphs }: { paragraphs: string[] }) {
  return (
    <>
      {paragraphs.map((paragraph) => (
        <p
          key={paragraph.slice(0, 48)}
          className="mt-4 text-sm leading-relaxed text-brand-navy/80 md:text-[15px]"
        >
          {paragraph}
        </p>
      ))}
    </>
  );
}

function LegalSubsectionBlock({ subsection }: { subsection: LegalSubsection }) {
  return (
    <div className="mt-6 border-l-2 border-brand-blue/15 pl-4 md:pl-5">
      <h3
        id={subsection.id}
        className="scroll-mt-28 text-base font-semibold text-brand-navy md:text-lg"
      >
        {subsection.title}
      </h3>
      {subsection.paragraphs ? (
        <LegalParagraphs paragraphs={subsection.paragraphs} />
      ) : null}
      {subsection.list ? <LegalList list={subsection.list} /> : null}
      {subsection.closingParagraphs ? (
        <LegalParagraphs paragraphs={subsection.closingParagraphs} />
      ) : null}
    </div>
  );
}

export function LegalSectionBlock({
  section,
  className,
}: {
  section: LegalSection;
  className?: string;
}) {
  return (
    <section id={section.id} className={cn("scroll-mt-28", className)}>
      <h2 className="text-lg font-semibold text-brand-navy md:text-xl">
        {section.title}
      </h2>
      {section.paragraphs ? <LegalParagraphs paragraphs={section.paragraphs} /> : null}
      {section.list ? <LegalList list={section.list} /> : null}
      {section.closingParagraphs ? (
        <LegalParagraphs paragraphs={section.closingParagraphs} />
      ) : null}
      {section.subsections?.map((subsection) => (
        <LegalSubsectionBlock key={subsection.id} subsection={subsection} />
      ))}
    </section>
  );
}
