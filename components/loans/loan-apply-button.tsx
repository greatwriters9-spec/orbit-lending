import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui-kit/button";
import { cn } from "@/lib/utils";

type LoanApplyButtonProps = {
  productName: string;
  slug: string;
  className?: string;
};

export function LoanApplyButton({
  productName,
  slug,
  className,
}: LoanApplyButtonProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <Button
        size="lg"
        className="h-11 w-full bg-brand-blue text-sm font-semibold text-white shadow-[var(--shadow-sidebar-active)] hover:bg-brand-blue/90 sm:w-auto sm:min-w-[220px]"
        render={<Link href={`/loans/${slug}/apply`} />}
      >
        Get Pre-Qualified for {productName}
        <ArrowRight className="size-4" strokeWidth={2} />
      </Button>
      <p className="text-xs leading-relaxed text-muted-foreground">
        Start your secure multi-step application. Save your progress as a draft
        at any time.
      </p>
    </div>
  );
}
