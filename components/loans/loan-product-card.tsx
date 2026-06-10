import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui-kit/badge";
import {
  formatApr,
  formatCurrency,
  getLowestApr,
} from "@/lib/loans/queries";
import { cn } from "@/lib/utils";
import type { LoanProduct } from "@/types/loans";

type LoanProductCardProps = {
  product: LoanProduct;
  className?: string;
};

export function LoanProductCard({ product, className }: LoanProductCardProps) {
  const lowestApr = getLowestApr(product);

  return (
    <Link
      href={`/loans/${product.slug}`}
      className={cn(
        "group card-surface flex flex-col p-6 transition-all duration-200 hover:border-brand-blue/30 hover:shadow-[var(--shadow-card-hover)] md:p-7",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="heading-tertiary text-lg transition-colors group-hover:text-brand-blue">
            {product.name}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {product.description}
          </p>
        </div>
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue ring-1 ring-brand-blue/15 transition-colors group-hover:bg-brand-blue group-hover:text-white">
          <ArrowRight className="size-4" strokeWidth={2} />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <Badge className="border-brand-border bg-brand-background text-brand-navy">
          {formatCurrency(product.minAmount)} – {formatCurrency(product.maxAmount)}
        </Badge>
        {lowestApr > 0 ? (
          <Badge className="border-brand-success/20 bg-brand-success/10 text-brand-success">
            From {formatApr(lowestApr)}
          </Badge>
        ) : null}
      </div>

      <p className="mt-5 text-sm font-semibold text-brand-blue">
        View details
        <span className="ml-1 inline-block transition-transform group-hover:translate-x-0.5">
          →
        </span>
      </p>
    </Link>
  );
}
