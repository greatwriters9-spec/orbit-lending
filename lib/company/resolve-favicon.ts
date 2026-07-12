import { readFile } from "node:fs/promises";
import path from "node:path";

import { ImageResponse } from "next/og";

import { renderCompanyFavicon } from "./favicon-art";

type FaviconResponseOptions = {
  slug: string;
  faviconPath: string | null;
  width: number;
  height: number;
};

function contentTypeForPath(assetPath: string): string {
  if (assetPath.endsWith(".svg")) {
    return "image/svg+xml";
  }
  if (assetPath.endsWith(".ico")) {
    return "image/x-icon";
  }
  if (assetPath.endsWith(".webp")) {
    return "image/webp";
  }
  return "image/png";
}

async function readPublicAsset(assetPath: string): Promise<Response | null> {
  const normalized = assetPath.replace(/^\//, "");
  const filePath = path.join(process.cwd(), "public", normalized);

  try {
    const buffer = await readFile(filePath);
    return new Response(buffer, {
      headers: {
        "Content-Type": contentTypeForPath(assetPath),
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch {
    return null;
  }
}

export async function resolveCompanyFaviconResponse(
  options: FaviconResponseOptions,
): Promise<Response | ImageResponse> {
  const { slug, faviconPath, width, height } = options;

  if (faviconPath) {
    const staticAsset = await readPublicAsset(faviconPath);
    if (staticAsset) {
      return staticAsset;
    }
  }

  return renderCompanyFavicon(slug, { width, height });
}
