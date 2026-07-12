"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  ApplicationField,
  ApplicationSection,
  applicationInputClassName,
} from "@/components/mortgage-application/application-shell";
import { cn } from "@/lib/utils";
import type { ApplicationSignature } from "@/types/mortgage-full-application";

type ESignStepProps = {
  signature: ApplicationSignature;
  signerName: string;
  onChange: (signature: ApplicationSignature) => void;
};

type SignatureMode = "drawn" | "typed";

function ModeToggle({
  mode,
  onChange,
}: {
  mode: SignatureMode;
  onChange: (mode: SignatureMode) => void;
}) {
  return (
    <div className="inline-flex rounded-xl border border-brand-border bg-brand-background/60 p-1">
      {(
        [
          ["drawn", "Draw signature"],
          ["typed", "Type name"],
        ] as const
      ).map(([value, label]) => (
        <button
          key={value}
          type="button"
          onClick={() => onChange(value)}
          className={cn(
            "rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
            mode === value
              ? "bg-brand-blue text-white"
              : "text-brand-navy hover:text-brand-blue",
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function SignatureCanvas({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);

  const getPoint = useCallback((event: PointerEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  }, []);

  const restoreImage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !value) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    const image = new Image();
    image.onload = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
    };
    image.src = value;
  }, [value]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    context.lineCap = "round";
    context.lineJoin = "round";
    context.lineWidth = 2.5;
    context.strokeStyle = "#0f172a";

    if (!value) {
      context.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    restoreImage();
  }, [restoreImage, value]);

  const persistCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    const blank = document.createElement("canvas");
    blank.width = canvas.width;
    blank.height = canvas.height;
    const isBlank = canvas.toDataURL() === blank.toDataURL();
    onChange(isBlank ? "" : canvas.toDataURL("image/png"));
  }, [onChange]);

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    drawingRef.current = true;
    canvas.setPointerCapture(event.pointerId);

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    const point = getPoint(event.nativeEvent, canvas);
    context.beginPath();
    context.moveTo(point.x, point.y);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    const point = getPoint(event.nativeEvent, canvas);
    context.lineTo(point.x, point.y);
    context.stroke();
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    drawingRef.current = false;
    if (canvas.hasPointerCapture(event.pointerId)) {
      canvas.releasePointerCapture(event.pointerId);
    }
    persistCanvas();
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);
    onChange("");
  };

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-xl border border-brand-border bg-white">
        <canvas
          ref={canvasRef}
          width={640}
          height={180}
          className="h-44 w-full touch-none cursor-crosshair"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        />
      </div>
      <button
        type="button"
        onClick={handleClear}
        className="text-sm font-semibold text-brand-blue hover:underline"
      >
        Clear signature
      </button>
    </div>
  );
}

export function ESignStep({ signature, signerName, onChange }: ESignStepProps) {
  const [mode, setMode] = useState<SignatureMode>(signature.method ?? "typed");

  const updateSignature = (patch: Partial<ApplicationSignature>) => {
    onChange({
      ...signature,
      ...patch,
    });
  };

  const handleModeChange = (nextMode: SignatureMode) => {
    setMode(nextMode);
    updateSignature({
      method: nextMode,
      value: "",
      signedAt: undefined,
    });
  };

  return (
    <ApplicationSection
      subtitle="Section 12"
      title="Electronic Signature"
      explanation="Sign below to certify that the information in your application is accurate and complete."
    >
      <div className="space-y-6">
        <ModeToggle mode={mode} onChange={handleModeChange} />

        {mode === "drawn" ? (
          <SignatureCanvas
            value={signature.method === "drawn" ? signature.value : ""}
            onChange={(value) =>
              updateSignature({
                method: "drawn",
                value,
                signedAt: value ? new Date().toISOString() : undefined,
              })
            }
          />
        ) : (
          <ApplicationField label="Type your full legal name">
            <input
              className={cn(applicationInputClassName, "font-serif text-lg")}
              value={signature.method === "typed" ? signature.value : ""}
              placeholder={signerName || "Full legal name"}
              onChange={(event) =>
                updateSignature({
                  method: "typed",
                  value: event.target.value,
                  signedAt: event.target.value.trim()
                    ? new Date().toISOString()
                    : undefined,
                })
              }
            />
            {signature.method === "typed" && signature.value.trim() ? (
              <p
                className="mt-4 rounded-xl border border-brand-border bg-brand-background/60 px-4 py-5 text-center font-serif text-3xl text-brand-navy"
                aria-hidden
              >
                {signature.value}
              </p>
            ) : null}
          </ApplicationField>
        )}

        <p className="text-sm text-muted-foreground">
          By signing, you agree that your electronic signature is the legal equivalent
          of your handwritten signature on this mortgage application.
        </p>
      </div>
    </ApplicationSection>
  );
}
