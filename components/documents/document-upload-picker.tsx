"use client";

import { useEffect, useId, useRef, useState } from "react";
import { FileText, FileUp, X } from "lucide-react";

import { Button } from "@/components/ui-kit/button";
import { cn } from "@/lib/utils";

type DocumentUploadPickerProps = {
  requestId: string;
  disabled?: boolean;
  isUploading?: boolean;
  onUpload: (file: File) => void;
  className?: string;
  compact?: boolean;
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isPdfFile(file: File): boolean {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}

function isImageFile(file: File): boolean {
  return file.type.startsWith("image/");
}

export function DocumentUploadPicker({
  requestId,
  disabled = false,
  isUploading = false,
  onUpload,
  className,
  compact = false,
}: DocumentUploadPickerProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedFile || !isImageFile(selectedFile)) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [selectedFile]);

  useEffect(() => {
    if (!selectedFile || !isPdfFile(selectedFile)) {
      setPdfPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPdfPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [selectedFile]);

  function handleFileChange(file: File | undefined) {
    setSelectedFile(file ?? null);
  }

  function clearSelection() {
    setSelectedFile(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  if (!selectedFile) {
    return (
      <div className={cn("flex flex-wrap gap-2", className)}>
        <input
          ref={inputRef}
          id={`${inputId}-${requestId}`}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.webp"
          className="hidden"
          disabled={disabled || isUploading}
          onChange={(event) => handleFileChange(event.target.files?.[0])}
        />
        <Button
          type="button"
          variant="outline"
          disabled={disabled || isUploading}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "border-brand-border",
            compact ? "h-8 px-3 text-xs" : "h-9 px-3",
          )}
        >
          <FileUp className={compact ? "size-3.5" : "size-4"} />
          Choose File
        </Button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-xl border border-brand-border bg-white/80 p-3",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-brand-navy">
            {selectedFile.name}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {formatFileSize(selectedFile.size)}
          </p>
        </div>
        <button
          type="button"
          onClick={clearSelection}
          disabled={disabled || isUploading}
          className="rounded-md p-1 text-muted-foreground hover:bg-brand-background hover:text-brand-navy"
          aria-label="Remove selected file"
        >
          <X className="size-4" />
        </button>
      </div>

      {previewUrl ? (
        <div className="mt-3 overflow-hidden rounded-lg border border-brand-border bg-brand-background/40">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt={`Preview of ${selectedFile.name}`}
            className="max-h-48 w-full object-contain"
          />
        </div>
      ) : pdfPreviewUrl ? (
        <div className="mt-3 overflow-hidden rounded-lg border border-brand-border bg-brand-background/40">
          <iframe
            title={`Preview of ${selectedFile.name}`}
            src={pdfPreviewUrl}
            className="h-48 w-full"
          />
        </div>
      ) : (
        <div className="mt-3 flex items-center gap-3 rounded-lg border border-brand-border bg-brand-background/40 px-4 py-6">
          <FileText className="size-8 text-brand-blue" strokeWidth={1.5} />
          <p className="text-sm text-muted-foreground">
            Preview is not available for this file type. Confirm the filename
            looks correct before uploading.
          </p>
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={disabled || isUploading}
          onClick={() => inputRef.current?.click()}
          className={cn("border-brand-border", compact ? "h-8 px-3 text-xs" : "h-9 px-3")}
        >
          Change File
        </Button>
        <Button
          type="button"
          disabled={disabled || isUploading}
          onClick={() => onUpload(selectedFile)}
          className={cn(
            "bg-brand-blue text-white hover:bg-brand-blue/90",
            compact ? "h-8 px-3 text-xs" : "h-9 px-3",
          )}
        >
          {isUploading ? "Uploading..." : "Upload"}
        </Button>
        <input
          ref={inputRef}
          id={`${inputId}-${requestId}-change`}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.webp"
          className="hidden"
          disabled={disabled || isUploading}
          onChange={(event) => handleFileChange(event.target.files?.[0])}
        />
      </div>
    </div>
  );
}
