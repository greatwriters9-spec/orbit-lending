"use client";

import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Redo2,
  Underline,
  Undo2,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { uploadEmailCompositionImageAction } from "@/lib/email/compose-actions";
import { cn } from "@/lib/utils";

const FONT_FAMILIES = [
  { label: "Default", value: "" },
  { label: "Arial", value: "Arial, Helvetica, sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Times New Roman", value: "'Times New Roman', Times, serif" },
  { label: "Tahoma", value: "Tahoma, Geneva, sans-serif" },
  { label: "Verdana", value: "Verdana, Geneva, sans-serif" },
  { label: "Courier New", value: "'Courier New', Courier, monospace" },
];

const FONT_SIZES = [
  { label: "Small", value: "2" },
  { label: "Normal", value: "3" },
  { label: "Large", value: "4" },
  { label: "Huge", value: "5" },
];

type RichEmailEditorProps = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  disabled?: boolean;
};

function ToolbarButton({
  label,
  active,
  disabled,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onMouseDown={(event) => {
        event.preventDefault();
        onClick();
      }}
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-md border text-brand-navy transition-colors",
        active
          ? "border-brand-navy bg-brand-navy text-white"
          : "border-transparent bg-white hover:border-brand-border hover:bg-brand-surface/70",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      {children}
    </button>
  );
}

export function RichEmailEditor({
  value,
  onChange,
  placeholder = "Write your message...",
  disabled = false,
}: RichEmailEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const syncingRef = useRef(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || syncingRef.current) {
      return;
    }

    if (editor.innerHTML !== value) {
      editor.innerHTML = value || "";
    }
  }, [value]);

  const emitChange = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) {
      return;
    }

    syncingRef.current = true;
    onChange(editor.innerHTML);
    window.requestAnimationFrame(() => {
      syncingRef.current = false;
    });
  }, [onChange]);

  const runCommand = useCallback(
    (command: string, commandValue?: string) => {
      if (disabled) {
        return;
      }

      editorRef.current?.focus();
      document.execCommand(command, false, commandValue);
      emitChange();
    },
    [disabled, emitChange],
  );

  const handleLink = useCallback(() => {
    const url = window.prompt("Enter link URL");
    if (!url?.trim()) {
      return;
    }

    runCommand("createLink", url.trim());
  }, [runCommand]);

  const handleImageUpload = useCallback(
    async (file: File) => {
      setUploadError(null);
      setUploadingImage(true);

      try {
        const formData = new FormData();
        formData.append("file", file);
        const result = await uploadEmailCompositionImageAction(formData);

        if (result.error || !result.url) {
          setUploadError(result.error ?? "Unable to upload image.");
          return;
        }

        runCommand("insertImage", result.url);
      } finally {
        setUploadingImage(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    },
    [runCommand],
  );

  return (
    <div className="rich-email-editor overflow-hidden rounded-xl border border-brand-border bg-white shadow-sm">
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-1 border-b border-brand-border bg-brand-surface/80 p-2 backdrop-blur-sm">
        <ToolbarButton
          label="Undo"
          disabled={disabled}
          onClick={() => runCommand("undo")}
        >
          <Undo2 className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Redo"
          disabled={disabled}
          onClick={() => runCommand("redo")}
        >
          <Redo2 className="size-4" />
        </ToolbarButton>

        <span className="mx-1 hidden h-6 w-px bg-brand-border sm:block" />

        <ToolbarButton
          label="Bold"
          disabled={disabled}
          onClick={() => runCommand("bold")}
        >
          <Bold className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Italic"
          disabled={disabled}
          onClick={() => runCommand("italic")}
        >
          <Italic className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Underline"
          disabled={disabled}
          onClick={() => runCommand("underline")}
        >
          <Underline className="size-4" />
        </ToolbarButton>

        <span className="mx-1 hidden h-6 w-px bg-brand-border sm:block" />

        <label className="inline-flex items-center gap-1 rounded-md border border-transparent bg-white px-2 py-1 text-xs text-brand-navy hover:border-brand-border hover:bg-brand-surface/70">
          <span className="hidden sm:inline">Font</span>
          <select
            disabled={disabled}
            className="max-w-[9rem] bg-transparent text-xs outline-none"
            defaultValue=""
            onChange={(event) => runCommand("fontName", event.target.value)}
          >
            {FONT_FAMILIES.map((font) => (
              <option key={font.label} value={font.value}>
                {font.label}
              </option>
            ))}
          </select>
        </label>

        <label className="inline-flex items-center gap-1 rounded-md border border-transparent bg-white px-2 py-1 text-xs text-brand-navy hover:border-brand-border hover:bg-brand-surface/70">
          <span className="hidden sm:inline">Size</span>
          <select
            disabled={disabled}
            className="bg-transparent text-xs outline-none"
            defaultValue="3"
            onChange={(event) => runCommand("fontSize", event.target.value)}
          >
            {FONT_SIZES.map((size) => (
              <option key={size.label} value={size.value}>
                {size.label}
              </option>
            ))}
          </select>
        </label>

        <label className="inline-flex items-center gap-1 rounded-md border border-transparent bg-white px-2 py-1 text-xs text-brand-navy hover:border-brand-border hover:bg-brand-surface/70">
          <span className="hidden sm:inline">Color</span>
          <input
            type="color"
            disabled={disabled}
            defaultValue="#0a2463"
            className="size-6 cursor-pointer rounded border border-brand-border bg-white p-0.5"
            onChange={(event) => runCommand("foreColor", event.target.value)}
          />
        </label>

        <span className="mx-1 hidden h-6 w-px bg-brand-border md:block" />

        <ToolbarButton
          label="Bulleted list"
          disabled={disabled}
          onClick={() => runCommand("insertUnorderedList")}
        >
          <List className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Numbered list"
          disabled={disabled}
          onClick={() => runCommand("insertOrderedList")}
        >
          <ListOrdered className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Align left"
          disabled={disabled}
          onClick={() => runCommand("justifyLeft")}
        >
          <AlignLeft className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Align center"
          disabled={disabled}
          onClick={() => runCommand("justifyCenter")}
        >
          <AlignCenter className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Align right"
          disabled={disabled}
          onClick={() => runCommand("justifyRight")}
        >
          <AlignRight className="size-4" />
        </ToolbarButton>

        <span className="mx-1 hidden h-6 w-px bg-brand-border md:block" />

        <ToolbarButton label="Insert link" disabled={disabled} onClick={handleLink}>
          <LinkIcon className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Insert image"
          disabled={disabled || uploadingImage}
          onClick={() => fileInputRef.current?.click()}
        >
          <ImageIcon className="size-4" />
        </ToolbarButton>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              void handleImageUpload(file);
            }
          }}
        />
      </div>

      <div
        ref={editorRef}
        contentEditable={!disabled}
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        aria-label="Email message"
        data-placeholder={placeholder}
        onInput={emitChange}
        onBlur={emitChange}
        onPaste={() => {
          window.requestAnimationFrame(() => emitChange());
        }}
        className={cn(
          "rich-email-editor__content min-h-[min(520px,60vh)] max-h-[70vh] overflow-y-auto px-5 py-4 text-[15px] leading-7 text-brand-navy focus:outline-none",
          disabled && "cursor-not-allowed opacity-60",
        )}
      />

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-brand-border bg-brand-surface/40 px-4 py-2 text-xs text-muted-foreground">
        <span>
          Paste from Word or other apps — formatting, fonts, and images are preserved.
        </span>
        {uploadingImage ? <span>Uploading image...</span> : null}
        {uploadError ? <span className="text-brand-danger">{uploadError}</span> : null}
      </div>
    </div>
  );
}
