import Link from "next/link";

import { Button } from "@/components/ui-kit/button";

export default function FinanceApplicationNotFound() {
  return (
    <div className="card-surface flex flex-col items-center px-6 py-16 text-center">
      <h1 className="heading-primary text-2xl">Application Not Found</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        This application does not exist or is not available for loan officer review.
      </p>
      <Button
        className="mt-8 h-10 bg-brand-blue px-6 text-white"
        render={<Link href="/finance/applications" />}
      >
        Back to Queue
      </Button>
    </div>
  );
}
