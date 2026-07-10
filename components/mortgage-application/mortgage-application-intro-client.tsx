"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { ApplicationIntro } from "@/components/mortgage-application/application-intro";
import { saveMortgageApplicationAction } from "@/lib/mortgage-application/actions";
import { MORTGAGE_APPLICATION_ROUTES } from "@/types/mortgage-full-application";
import type { FullMortgageApplication } from "@/types/mortgage-full-application";

type MortgageApplicationIntroClientProps = {
  applicationId: string;
  initialApplication: FullMortgageApplication;
};

export function MortgageApplicationIntroClient({
  applicationId,
  initialApplication,
}: MortgageApplicationIntroClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleBegin = () => {
    startTransition(async () => {
      const startedApplication: FullMortgageApplication = {
        ...initialApplication,
        progress: {
          ...initialApplication.progress,
          startedAt: new Date().toISOString(),
          currentSection: "personal",
        },
      };

      const result = await saveMortgageApplicationAction(
        applicationId,
        startedApplication,
      );

      if (result.error) {
        return;
      }

      router.push(MORTGAGE_APPLICATION_ROUTES.apply(applicationId));
    });
  };

  return (
    <>
      {isPending ? (
        <p className="fixed top-4 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-white px-4 py-2 text-sm shadow">
          Starting application...
        </p>
      ) : null}
      <ApplicationIntro onBegin={handleBegin} />
    </>
  );
}
