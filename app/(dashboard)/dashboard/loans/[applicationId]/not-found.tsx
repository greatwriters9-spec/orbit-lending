import Link from "next/link";

import { Button } from "@/components/ui-kit/button";

export default function ApplicationNotFound() {
  return (
    <div className="card-surface flex flex-col items-center px-6 py-16 text-center">
      <h1 className="heading-primary text-2xl">
        Application Not Found
      </h1>
      <p className="mt-3 max-w-md text-sm text-muted-foreground">
        This application may not exist or you may not have permission to view it.
      </p>
      <Button
        className="mt-8 h-10 bg-brand-blue px-6 text-white hover:bg-brand-blue/90"
        render={<Link href="/dashboard/loans" />}
      >
        Back to My Applications
      </Button>
    </div>
  );
}
