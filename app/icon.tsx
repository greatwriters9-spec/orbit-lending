import { ImageResponse } from "next/og";

export const size = {
  width: 48,
  height: 48,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 48 48"
        width="48"
        height="48"
      >
        <rect width="48" height="48" rx="10" fill="#ffffff" />
        <rect x="8" y="8" width="16" height="16" rx="2" fill="#1a4a96" />
        <rect x="24" y="24" width="16" height="16" rx="2" fill="#3d7dd6" />
        <rect x="18" y="18" width="12" height="12" rx="2" fill="#0a2463" />
      </svg>
    ),
    {
      ...size,
    },
  );
}
