"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { hasSeenQualificationResult } from "@/lib/qualification/result-storage";

type QualificationResultGuardProps = {
  userId: string;
  shouldPrompt: boolean;
};

export function QualificationResultGuard({
  userId,
  shouldPrompt,
}: QualificationResultGuardProps) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!shouldPrompt) {
      return;
    }

    if (pathname === "/dashboard/qualification-result") {
      return;
    }

    if (!hasSeenQualificationResult(userId)) {
      router.replace("/dashboard/qualification-result");
    }
  }, [pathname, router, shouldPrompt, userId]);

  return null;
}
