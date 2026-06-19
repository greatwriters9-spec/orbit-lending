"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  ArrowLeft,
  CreditCard,
  FileText,
  HelpCircle,
  Loader2,
  Send,
  Shield,
  Wrench,
} from "lucide-react";

import { Button } from "@/components/ui-kit/button";
import { Input } from "@/components/ui-kit/input";
import { createSupportTicketAction } from "@/lib/support/actions";
import { CLIENT_ISSUE_OPTIONS, TICKET_CATEGORY_LABELS } from "@/lib/support/constants";
import type { SupportTicketCategory } from "@/types/support";
import { cn } from "@/lib/utils";

const ISSUE_ICONS = {
  application: FileText,
  payment: CreditCard,
  documents: FileText,
  account: Shield,
  technical: Wrench,
  general: HelpCircle,
} as const;

type OpenTicketFlowProps = {
  initialCategory?: SupportTicketCategory;
  onClose?: () => void;
  embedded?: boolean;
};

export function OpenTicketFlow({
  initialCategory,
  onClose,
  embedded = false,
}: OpenTicketFlowProps) {
  const router = useRouter();
  const [step, setStep] = useState<"issue" | "message">(
    initialCategory ? "message" : "issue",
  );
  const [category, setCategory] = useState<SupportTicketCategory>(
    initialCategory ?? "general_inquiry",
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const selectedIssue = CLIENT_ISSUE_OPTIONS.find((option) => option.category === category);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.set("category", category);
    formData.set("priority", "normal");
    formData.set("contactPreference", "in_app");
    formData.set(
      "subject",
      formData.get("subject")?.toString().trim() ||
        selectedIssue?.label ||
        TICKET_CATEGORY_LABELS[category],
    );

    startTransition(async () => {
      const result = await createSupportTicketAction(formData);
      if (result.error) {
        setError(result.error);
        return;
      }

      if (result.ticketId) {
        router.push(`/dashboard/support/${result.ticketId}`);
        router.refresh();
        return;
      }

      router.push("/dashboard/support");
      router.refresh();
    });
  }

  return (
    <div className={cn(!embedded && "mx-auto max-w-2xl")}>
      {step === "issue" ? (
        <div className="space-y-5">
          <div>
            <p className="text-sm font-medium text-brand-blue">Step 1 of 2</p>
            <h2 className="mt-1 text-xl font-bold text-brand-navy">
              What do you need help with?
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Choose the option that best matches your issue.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {CLIENT_ISSUE_OPTIONS.map((option) => {
              const Icon = ISSUE_ICONS[option.icon];
              const selected = category === option.category;

              return (
                <button
                  key={option.category}
                  type="button"
                  onClick={() => {
                    setCategory(option.category);
                    setStep("message");
                    setError(null);
                  }}
                  className={cn(
                    "rounded-2xl border p-4 text-left transition",
                    selected
                      ? "border-brand-blue bg-brand-blue/[0.06] ring-2 ring-brand-blue/20"
                      : "border-brand-border bg-white hover:border-brand-blue/40 hover:bg-brand-background/40",
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue">
                      <Icon className="size-4" />
                    </span>
                    <span>
                      <span className="block font-semibold text-brand-navy">
                        {option.label}
                      </span>
                      <span className="mt-1 block text-sm text-muted-foreground">
                        {option.description}
                      </span>
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {onClose ? (
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          ) : null}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <button
              type="button"
              onClick={() => {
                if (initialCategory) {
                  onClose?.();
                  return;
                }
                setStep("issue");
                setError(null);
              }}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-blue hover:underline"
            >
              <ArrowLeft className="size-4" />
              {initialCategory ? "Back to Support" : "Choose a different issue"}
            </button>
            <p className="mt-3 text-sm font-medium text-brand-blue">Step 2 of 2</p>
            <h2 className="mt-1 text-xl font-bold text-brand-navy">
              Tell us what&apos;s going on
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {selectedIssue?.label ?? "Support request"} — describe your issue and
              we&apos;ll connect you with a support agent.
            </p>
          </div>

          {error ? (
            <p className="rounded-xl border border-brand-danger/20 bg-brand-danger/5 px-4 py-3 text-sm text-brand-danger">
              {error}
            </p>
          ) : null}

          <div>
            <label className="text-sm font-medium text-brand-navy">
              Subject <span className="text-muted-foreground">(optional)</span>
            </label>
            <Input
              name="subject"
              className="mt-2 h-11"
              placeholder={selectedIssue?.label ?? "Brief summary"}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-brand-navy">Your message</label>
            <textarea
              name="description"
              required
              rows={5}
              className="mt-2 w-full rounded-xl border border-brand-border px-4 py-3 text-sm"
              placeholder="Describe what happened and how we can help..."
            />
          </div>

          <div>
            <label className="text-sm font-medium text-brand-navy">
              Attachment <span className="text-muted-foreground">(optional)</span>
            </label>
            <Input
              name="attachment"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
              className="mt-2 h-11"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              type="submit"
              disabled={isPending}
              className="h-11 gap-2 bg-brand-blue px-6 text-white hover:bg-brand-blue/90"
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Starting chat...
                </>
              ) : (
                <>
                  <Send className="size-4" />
                  Start Live Chat
                </>
              )}
            </Button>
            {onClose ? (
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            ) : null}
          </div>
        </form>
      )}
    </div>
  );
}
