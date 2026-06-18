"use client";

import { useState, useTransition } from "react";
import { MessageCircle, X } from "lucide-react";

import { onboardingInputClassName } from "@/components/onboarding/onboarding-shell";
import { Button } from "@/components/ui-kit/button";
import {
  formatUSPhoneInput,
  isCompleteUSPhone,
} from "@/lib/auth/input-formatters";
import { submitGuestConcernAction } from "@/lib/support/guest-concern-actions";
import { cn } from "@/lib/utils";

type AskAssistantModalProps = {
  open: boolean;
  onClose: () => void;
  source?: string;
};

export function AskAssistantModal({
  open,
  onClose,
  source = "onboarding",
}: AskAssistantModalProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [concern, setConcern] = useState("");
  const [website, setWebsite] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!open) {
    return null;
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!isCompleteUSPhone(phone)) {
      setError("Enter a valid US phone number.");
      return;
    }

    startTransition(async () => {
      const result = await submitGuestConcernAction({
        fullName,
        email,
        phone,
        concern,
        source,
        website,
      });

      if (result.error) {
        setError(result.error);
        return;
      }

      setSuccess(result.success ?? "Your concern was submitted.");
      setFullName("");
      setEmail("");
      setPhone("");
      setConcern("");
      setWebsite("");
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-[#0b1528]/55 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ask-assistant-title"
        className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_24px_60px_rgba(15,23,42,0.18)]"
      >
        <div className="flex items-start justify-between border-b border-[#E5E7EB] px-5 py-4 md:px-6">
          <div>
            <div className="flex items-center gap-2 text-brand-blue">
              <MessageCircle className="size-5" strokeWidth={1.75} />
              <span className="text-xs font-semibold tracking-wide uppercase">
                Ask Assistant
              </span>
            </div>
            <h2
              id="ask-assistant-title"
              className="heading-primary mt-2 text-xl md:text-2xl"
            >
              Raise a concern
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              No account needed. An Orbit Mortgage support staff will respond to
              your issue shortly.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-muted-foreground hover:bg-[#F8FAFC] hover:text-brand-navy"
          >
            <X className="size-5" />
          </button>
        </div>

        {success ? (
          <div className="space-y-4 px-5 py-6 md:px-6">
            <div className="rounded-xl border border-brand-success/20 bg-brand-success/5 px-4 py-4 text-sm leading-relaxed text-brand-navy">
              {success}
            </div>
            <Button
              type="button"
              onClick={onClose}
              className="h-12 w-full rounded-xl bg-brand-blue text-white hover:bg-brand-blue/90"
            >
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 px-5 py-6 md:px-6">
            {error ? (
              <div className="rounded-xl border border-brand-danger/20 bg-brand-danger/5 px-4 py-3 text-sm text-brand-danger">
                {error}
              </div>
            ) : null}

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-brand-navy">
                Full name
              </span>
              <input
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={onboardingInputClassName()}
                placeholder="Jane Doe"
                autoComplete="name"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-brand-navy">Email</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={onboardingInputClassName()}
                placeholder="you@email.com"
                autoComplete="email"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-brand-navy">
                Phone number
              </span>
              <input
                required
                value={phone}
                onChange={(e) => setPhone(formatUSPhoneInput(e.target.value))}
                className={onboardingInputClassName()}
                placeholder="(555) 555-5555"
                autoComplete="tel"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-brand-navy">
                Your concern
              </span>
              <textarea
                required
                value={concern}
                onChange={(e) => setConcern(e.target.value)}
                rows={5}
                className={cn(
                  onboardingInputClassName(),
                  "min-h-[8rem] resize-y py-3",
                )}
                placeholder="Tell us what you need help with..."
              />
            </label>

            <input
              type="text"
              name="website"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
              className="hidden"
              aria-hidden
            />

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="h-12 flex-1 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="h-12 flex-1 rounded-xl bg-brand-blue text-white hover:bg-brand-blue/90"
              >
                {isPending ? "Sending..." : "Submit concern"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
