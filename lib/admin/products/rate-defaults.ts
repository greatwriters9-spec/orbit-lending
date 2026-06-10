import type { AdminLoanProduct } from "@/types/admin";

export type ProductRateDefaults = {
  defaultApr: number;
  minApr: number;
  maxApr: number;
  minTerm: number;
  maxTerm: number;
};

export function deriveProductRateDefaults(
  product?: Pick<
    AdminLoanProduct,
    | "defaultApr"
    | "minApr"
    | "maxApr"
    | "minTerm"
    | "maxTerm"
    | "weeklyRepaymentSupported"
    | "monthlyRepaymentSupported"
  > | null,
): ProductRateDefaults {
  const minApr = product?.minApr ?? product?.defaultApr ?? 8;
  const maxApr = product?.maxApr ?? product?.defaultApr ?? 24;
  const defaultApr =
    product?.defaultApr ?? Number(((minApr + maxApr) / 2).toFixed(2));

  return {
    defaultApr,
    minApr,
    maxApr,
    minTerm: product?.minTerm ?? 6,
    maxTerm: product?.maxTerm ?? 60,
  };
}
