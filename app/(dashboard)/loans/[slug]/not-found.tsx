import Link from "next/link";

import { Button } from "@/components/ui-kit/button";

export default function LoanProductNotFound() {
  return (
    <div className="card-surface flex flex-col items-center px-6 py-16 text-center md:px-10">
      <h1 className="heading-primary text-2xl">
        Loan Product Not Found
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
        The loan product you are looking for may have been removed or is no
        longer available.
      </p>
      <Button
        className="mt-8 h-10 bg-brand-blue px-6 text-white hover:bg-brand-blue/90"
        render={<Link href="/loans" />}
      >
        Browse Loan Products
      </Button>
    </div>
  );
}
