import { ImageResponse } from "next/og";

import { oakstoneColors } from "@/lib/design-system/oakstone/tokens/colors";

type FaviconSize = {
  width: number;
  height: number;
};

function OrbitMark() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
      <rect width="48" height="48" rx="10" fill="#ffffff" />
      <rect x="8" y="8" width="16" height="16" rx="2" fill="#1a4a96" />
      <rect x="24" y="24" width="16" height="16" rx="2" fill="#3d7dd6" />
      <rect x="18" y="18" width="12" height="12" rx="2" fill="#0a2463" />
    </svg>
  );
}

function OakstoneMark() {
  const { primaryGreen, bronzeAccent, lightChampagne } = oakstoneColors;

  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
      <rect width="48" height="48" rx="10" fill="#ffffff" />
      <path
        d="M24 4 L40 12 V28 C40 36 24 44 24 44 C24 44 8 36 8 28 V12 Z"
        fill={primaryGreen}
      />
      <path
        d="M24 6 L37 13 V27 C37 33.5 24 40 24 40 C24 40 11 33.5 11 27 V13 Z"
        fill="#ffffff"
        opacity="0.12"
      />
      <path
        d="M10 12 Q24 4 38 12"
        fill="none"
        stroke={bronzeAccent}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M24 16 C20 16 18 20 18 24 C18 30 24 34 24 34 C24 34 30 30 30 24 C30 20 28 16 24 16 Z"
        fill={lightChampagne}
      />
      <path
        d="M24 17 C21 17 19.5 20 19.5 23.5 C19.5 28 24 31 24 31 C24 31 28.5 28 28.5 23.5 C28.5 20 27 17 24 17 Z"
        fill={primaryGreen}
      />
      <path
        d="M24 18 V30"
        stroke={bronzeAccent}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function renderCompanyFavicon(
  slug: string,
  size: FaviconSize,
): ImageResponse {
  const mark = slug === "oakstone" ? <OakstoneMark /> : <OrbitMark />;

  return new ImageResponse(mark, size);
}
