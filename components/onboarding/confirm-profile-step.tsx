import Link from "next/link";

import { OnboardingQuestion } from "@/components/onboarding/onboarding-shell";
import { formatUSPhoneInput } from "@/lib/auth/input-formatters";
import type { MortgageApplicationDraft } from "@/types/mortgage-onboarding";

function formatDate(value?: string): string {
  if (!value) {
    return "—";
  }

  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 border-b border-brand-border/60 py-4 last:border-b-0 sm:flex-row sm:items-baseline sm:justify-between">
      <dt className="text-sm font-medium text-brand-muted">{label}</dt>
      <dd className="text-base font-medium text-brand-navy">{value || "—"}</dd>
    </div>
  );
}

export function ConfirmProfileStep({ draft }: { draft: MortgageApplicationDraft }) {
  const fullName = [draft.firstName, draft.middleName, draft.lastName]
    .filter(Boolean)
    .join(" ");

  const addressLine = [
    draft.address?.street,
    [draft.address?.city, draft.address?.state, draft.address?.zip].filter(Boolean).join(", "),
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <OnboardingQuestion
      title="Confirm your information"
      subtitle="We saved these details from your account profile. Review them and continue if everything looks correct."
    >
      <dl className="rounded-xl border border-brand-border bg-white px-5">
        <DetailRow label="Full name" value={fullName} />
        <DetailRow label="Date of birth" value={formatDate(draft.dateOfBirth)} />
        <DetailRow label="Email" value={draft.email ?? ""} />
        <DetailRow label="Phone" value={formatUSPhoneInput(draft.phone ?? "")} />
        <DetailRow label="Current address" value={addressLine} />
      </dl>

      <p className="mt-4 text-center text-sm text-brand-muted">
        Need to update something?{" "}
        <Link
          href="/dashboard/profile"
          className="font-medium text-brand-blue underline-offset-2 hover:underline"
        >
          Edit your profile
        </Link>
      </p>
    </OnboardingQuestion>
  );
}
