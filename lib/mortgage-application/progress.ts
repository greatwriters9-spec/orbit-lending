import {
  APPLICATION_SECTIONS,
  type ApplicationSectionKey,
  type ApplicationProgress,
} from "@/types/mortgage-full-application";

const SECTION_MINUTES: Record<ApplicationSectionKey, number> = {
  personal: 2,
  residence: 2,
  employment: 3,
  income: 2,
  assets: 2,
  liabilities: 2,
  property: 2,
  "loan-details": 2,
  declarations: 2,
  documents: 1,
  review: 2,
  consent: 2,
};

export function calculateApplicationProgress(progress: ApplicationProgress): {
  percent: number;
  estimatedMinutesRemaining: number;
} {
  const completed = new Set(progress.completedSections);
  const totalSections = APPLICATION_SECTIONS.length;
  const percent = Math.round((completed.size / totalSections) * 100);

  let remaining = 0;
  for (const section of APPLICATION_SECTIONS) {
    if (!completed.has(section)) {
      remaining += SECTION_MINUTES[section];
    }
  }

  return { percent, estimatedMinutesRemaining: remaining };
}

export function getNextSection(
  current: ApplicationSectionKey,
): ApplicationSectionKey | null {
  const index = APPLICATION_SECTIONS.indexOf(current);
  if (index < 0 || index >= APPLICATION_SECTIONS.length - 1) {
    return null;
  }
  return APPLICATION_SECTIONS[index + 1];
}

export function getPreviousSection(
  current: ApplicationSectionKey,
): ApplicationSectionKey | null {
  const index = APPLICATION_SECTIONS.indexOf(current);
  if (index <= 0) {
    return null;
  }
  return APPLICATION_SECTIONS[index - 1];
}

export function markSectionComplete(
  progress: ApplicationProgress,
  section: ApplicationSectionKey,
): ApplicationProgress {
  const completedSections = progress.completedSections.includes(section)
    ? progress.completedSections
    : [...progress.completedSections, section];

  const next = getNextSection(section);

  return {
    ...progress,
    completedSections,
    currentSection: next ?? section,
    lastSavedAt: new Date().toISOString(),
  };
}

export function isSectionComplete(
  progress: ApplicationProgress,
  section: ApplicationSectionKey,
): boolean {
  return progress.completedSections.includes(section);
}

export function formatEstimatedTime(minutes: number): string {
  if (minutes <= 1) return "About 1 minute";
  if (minutes < 60) return `About ${minutes} minutes`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `About ${hours} hour${hours > 1 ? "s" : ""}`;
  return `About ${hours}h ${mins}m`;
}
