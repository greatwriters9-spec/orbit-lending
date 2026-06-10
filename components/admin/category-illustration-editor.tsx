"use client";

import { Move, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import { useRef, useState, type PointerEvent as ReactPointerEvent, type WheelEvent as ReactWheelEvent } from "react";

import {
  CategoryIllustrationFrame,
  CATEGORY_ILLUSTRATION_SPECS,
} from "@/components/loans/category-illustration-frame";
import { Button } from "@/components/ui-kit/button";
import {
  DEFAULT_ILLUSTRATION_TRANSFORM,
  ILLUSTRATION_SCALE_MAX,
  ILLUSTRATION_SCALE_MIN,
  clampFocal,
  clampScale,
  normalizeIllustrationTransform,
  type CategoryIllustrationTransform,
} from "@/lib/loans/category-illustration-transform";
import { cn } from "@/lib/utils";
import type { LoanProductCategory } from "@/types/loans";

type CategoryIllustrationEditorProps = {
  category: LoanProductCategory;
  illustrationUrl: string;
  iconName: string;
  initialTransform: CategoryIllustrationTransform;
  onTransformChange?: (transform: CategoryIllustrationTransform) => void;
  disabled?: boolean;
};

const PAN_SENSITIVITY = 0.45;

export function CategoryIllustrationEditor({
  category,
  illustrationUrl,
  iconName,
  initialTransform,
  onTransformChange,
  disabled = false,
}: CategoryIllustrationEditorProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{ x: number; y: number } | null>(null);
  const transformRef = useRef(
    normalizeIllustrationTransform(initialTransform),
  );
  const [transform, setTransform] = useState(transformRef.current);
  const [isDragging, setIsDragging] = useState(false);

  function commitTransform(next: CategoryIllustrationTransform) {
    const normalized = normalizeIllustrationTransform(next);
    transformRef.current = normalized;
    setTransform(normalized);
    onTransformChange?.(normalized);
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (disabled) return;
    event.preventDefault();
    dragState.current = { x: event.clientX, y: event.clientY };
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (disabled || !dragState.current || !frameRef.current) return;

    const rect = frameRef.current.getBoundingClientRect();
    const dx = event.clientX - dragState.current.x;
    const dy = event.clientY - dragState.current.y;
    dragState.current = { x: event.clientX, y: event.clientY };

    const previous = transformRef.current;
    commitTransform({
      ...previous,
      focalX: clampFocal(
        previous.focalX - (dx / rect.width) * 100 * PAN_SENSITIVITY,
      ),
      focalY: clampFocal(
        previous.focalY - (dy / rect.height) * 100 * PAN_SENSITIVITY,
      ),
    });
  }

  function handlePointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    dragState.current = null;
    setIsDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function handleWheel(event: ReactWheelEvent<HTMLDivElement>) {
    if (disabled) return;
    event.preventDefault();
    const delta = event.deltaY > 0 ? -4 : 4;
    const previous = transformRef.current;
    commitTransform({
      ...previous,
      scale: clampScale(previous.scale + delta),
    });
  }

  function adjustZoom(delta: number) {
    const previous = transformRef.current;
    commitTransform({
      ...previous,
      scale: clampScale(previous.scale + delta),
    });
  }

  function handleReset() {
    commitTransform(DEFAULT_ILLUSTRATION_TRANSFORM);
  }

  return (
    <div className="space-y-4">
      <div
        ref={frameRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onWheel={handleWheel}
        className={cn(
          "relative touch-none select-none overflow-hidden rounded-xl ring-1 ring-brand-border/70",
          disabled
            ? "cursor-default"
            : isDragging
              ? "cursor-grabbing"
              : "cursor-grab",
        )}
      >
        <CategoryIllustrationFrame
          category={category}
          illustrationUrl={illustrationUrl}
          iconName={iconName}
          variant="banner"
          illustrationTransform={transform}
        />

        {!disabled ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[3] bg-gradient-to-t from-brand-navy/55 to-transparent px-4 py-3">
            <p className="flex items-center gap-2 text-xs font-medium text-white">
              <Move className="size-3.5" />
              Drag to reposition · Scroll or use slider to zoom
            </p>
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
        <label className="block space-y-2">
          <span className="flex items-center justify-between text-sm font-medium text-brand-navy">
            <span>Zoom</span>
            <span className="font-mono text-xs text-muted-foreground">
              {Math.round(transform.scale)}%
            </span>
          </span>
          <input
            type="range"
            min={ILLUSTRATION_SCALE_MIN}
            max={ILLUSTRATION_SCALE_MAX}
            step={1}
            value={transform.scale}
            disabled={disabled}
            onChange={(event) =>
              commitTransform({
                ...transformRef.current,
                scale: clampScale(Number(event.target.value)),
              })
            }
            className="h-2 w-full cursor-pointer accent-brand-blue"
          />
          <span className="flex justify-between text-[11px] text-muted-foreground">
            <span>Zoom out ({ILLUSTRATION_SCALE_MIN}%)</span>
            <span>Zoom in ({ILLUSTRATION_SCALE_MAX}%)</span>
          </span>
        </label>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={() => adjustZoom(-10)}
            aria-label="Zoom out"
          >
            <ZoomOut className="size-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={() => adjustZoom(10)}
            aria-label="Zoom in"
          >
            <ZoomIn className="size-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={handleReset}
          >
            <RotateCcw className="size-4" />
            Reset
          </Button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Position: {Math.round(transform.focalX)}% horizontal,{" "}
        {Math.round(transform.focalY)}% vertical · Recommended artwork:{" "}
        {CATEGORY_ILLUSTRATION_SPECS.label}
      </p>
    </div>
  );
}
