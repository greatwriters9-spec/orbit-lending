"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui-kit/button";
import { Input } from "@/components/ui-kit/input";
import { createSupportTicketAction } from "@/lib/support/actions";
import {
  CONTACT_PREFERENCE_LABELS,
  TICKET_CATEGORY_LABELS,
  TICKET_PRIORITY_LABELS,
} from "@/lib/support/constants";
import type { SupportTicketCategory } from "@/types/support";

type CreateSupportTicketFormProps = {
  defaultCategory?: SupportTicketCategory;
};

export function CreateSupportTicketForm({
  defaultCategory = "general_inquiry",
}: CreateSupportTicketFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const result = await createSupportTicketAction(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.push(result.ticketId ? `/dashboard/support/${result.ticketId}` : "/dashboard/support");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error ? (
        <p className="rounded-lg border border-brand-danger/20 bg-brand-danger/5 px-4 py-3 text-sm text-brand-danger">
          {error}
        </p>
      ) : null}

      <div>
        <label className="text-sm font-medium text-brand-navy">Subject</label>
        <Input name="subject" required className="mt-2 h-10" placeholder="Brief summary of your issue" />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-brand-navy">Category</label>
          <select
            name="category"
            defaultValue={defaultCategory}
            className="mt-2 h-10 w-full rounded-lg border border-brand-border px-3 text-sm"
          >
            {Object.entries(TICKET_CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-brand-navy">Priority</label>
          <select
            name="priority"
            defaultValue="normal"
            className="mt-2 h-10 w-full rounded-lg border border-brand-border px-3 text-sm"
          >
            {Object.entries(TICKET_PRIORITY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-brand-navy">Description</label>
        <textarea
          name="description"
          required
          rows={6}
          className="mt-2 w-full rounded-lg border border-brand-border px-3 py-2 text-sm"
          placeholder="Describe your issue in detail..."
        />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-brand-navy">Contact Preference</label>
          <select
            name="contactPreference"
            defaultValue="both"
            className="mt-2 h-10 w-full rounded-lg border border-brand-border px-3 text-sm"
          >
            {Object.entries(CONTACT_PREFERENCE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-brand-navy">Attachment</label>
          <Input
            name="attachment"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
            className="mt-2 h-10"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending} className="bg-brand-blue text-white">
          {isPending ? "Submitting..." : "Submit Ticket"}
        </Button>
      </div>
    </form>
  );
}
