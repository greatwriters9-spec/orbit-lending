"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui-kit/button";

export type RequestDocumentDraft = {
  id: string;
  name: string;
  description: string;
};

type RequestDocumentsFormProps = {
  documents: RequestDocumentDraft[];
  onChange: (documents: RequestDocumentDraft[]) => void;
};

function createDraft(): RequestDocumentDraft {
  return {
    id: crypto.randomUUID(),
    name: "",
    description: "",
  };
}

export function RequestDocumentsForm({
  documents,
  onChange,
}: RequestDocumentsFormProps) {
  const rows = useMemo(
    () => (documents.length > 0 ? documents : [createDraft()]),
    [documents],
  );

  function updateRow(id: string, patch: Partial<RequestDocumentDraft>) {
    onChange(rows.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  }

  function addRow() {
    onChange([...rows, createDraft()]);
  }

  function removeRow(id: string) {
    const next = rows.filter((row) => row.id !== id);
    onChange(next.length > 0 ? next : [createDraft()]);
  }

  return (
    <div className="space-y-3">
      {rows.map((row, index) => (
        <div
          key={row.id}
          className="rounded-xl border border-brand-border bg-brand-background/40 p-4"
        >
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Document {index + 1}
            </p>
            {rows.length > 1 ? (
              <button
                type="button"
                onClick={() => removeRow(row.id)}
                className="inline-flex items-center gap-1 text-xs text-brand-danger"
              >
                <Trash2 className="size-3.5" />
                Remove
              </button>
            ) : null}
          </div>
          <input
            value={row.name}
            onChange={(event) => updateRow(row.id, { name: event.target.value })}
            placeholder="Document name"
            className="h-10 w-full rounded-lg border border-brand-border px-3 text-sm"
          />
          <textarea
            rows={2}
            value={row.description}
            onChange={(event) =>
              updateRow(row.id, { description: event.target.value })
            }
            placeholder="Document description (optional)"
            className="mt-2 w-full rounded-lg border border-brand-border px-3 py-2 text-sm"
          />
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={addRow}
        className="h-9 border-brand-border px-3"
      >
        <Plus className="size-4" />
        Add Another Document
      </Button>
    </div>
  );
}

export function getValidRequestDocuments(
  documents: RequestDocumentDraft[],
): Array<{ name: string; description?: string }> {
  return documents
    .map((document) => ({
      name: document.name.trim(),
      description: document.description.trim() || undefined,
    }))
    .filter((document) => document.name.length >= 2);
}

export function useRequestDocumentsFormState() {
  const [documents, setDocuments] = useState<RequestDocumentDraft[]>([createDraft()]);
  return { documents, setDocuments };
}
