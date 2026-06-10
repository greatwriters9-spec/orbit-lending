import type { CSSProperties } from "react";

export type CategoryIllustrationTransform = {
  focalX: number;
  focalY: number;
  scale: number;
};

export const DEFAULT_ILLUSTRATION_TRANSFORM: CategoryIllustrationTransform = {
  focalX: 50,
  focalY: 50,
  scale: 100,
};

export const ILLUSTRATION_SCALE_MIN = 50;
export const ILLUSTRATION_SCALE_MAX = 200;

export function clampFocal(value: number): number {
  return Math.min(100, Math.max(0, value));
}

export function clampScale(value: number): number {
  return Math.min(
    ILLUSTRATION_SCALE_MAX,
    Math.max(ILLUSTRATION_SCALE_MIN, value),
  );
}

export function normalizeIllustrationTransform(
  transform?: Partial<CategoryIllustrationTransform> | null,
): CategoryIllustrationTransform {
  return {
    focalX: clampFocal(transform?.focalX ?? DEFAULT_ILLUSTRATION_TRANSFORM.focalX),
    focalY: clampFocal(transform?.focalY ?? DEFAULT_ILLUSTRATION_TRANSFORM.focalY),
    scale: clampScale(transform?.scale ?? DEFAULT_ILLUSTRATION_TRANSFORM.scale),
  };
}

export function getIllustrationImageStyle(
  transform?: Partial<CategoryIllustrationTransform> | null,
): CSSProperties {
  const { focalX, focalY, scale } = normalizeIllustrationTransform(transform);

  return {
    objectPosition: `${focalX}% ${focalY}%`,
    transform: `scale(${scale / 100})`,
    transformOrigin: `${focalX}% ${focalY}%`,
  };
}

export function parseIllustrationTransformFromForm(
  formData: FormData,
): CategoryIllustrationTransform {
  return normalizeIllustrationTransform({
    focalX: Number(formData.get("illustrationFocalX")),
    focalY: Number(formData.get("illustrationFocalY")),
    scale: Number(formData.get("illustrationScale")),
  });
}

export function mapDbIllustrationTransform(row: {
  illustration_focal_x?: number | null;
  illustration_focal_y?: number | null;
  illustration_scale?: number | null;
}): CategoryIllustrationTransform {
  return normalizeIllustrationTransform({
    focalX: row.illustration_focal_x ?? undefined,
    focalY: row.illustration_focal_y ?? undefined,
    scale: row.illustration_scale ?? undefined,
  });
}
