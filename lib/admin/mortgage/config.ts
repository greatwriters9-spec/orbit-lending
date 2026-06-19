import { z } from "zod";

import { createServiceRoleClient } from "@/lib/supabase/service-role";
import {
  DEFAULT_MORTGAGE_CONFIG,
  MORTGAGE_SETTINGS_KEY,
  normalizeMortgageConfig,
  type MortgageConfig,
} from "@/types/mortgage-config";

export const mortgageTermSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1, "Term label is required."),
  termMonths: z.coerce.number().int().min(1).max(600),
  interestRate: z.coerce.number().min(0).max(100),
  isPrimary: z.boolean().optional(),
  tierRates: z
    .object({
      "5": z.coerce.number().min(0).max(100).optional(),
      "10": z.coerce.number().min(0).max(100).optional(),
      "15": z.coerce.number().min(0).max(100).optional(),
      "20": z.coerce.number().min(0).max(100).optional(),
      "25": z.coerce.number().min(0).max(100).optional(),
    })
    .optional(),
});

export const mortgageConfigSchema = z
  .object({
    productName: z.string().min(2, "Product name is required."),
    description: z.string().min(10, "Description must be at least 10 characters."),
    minLoanAmount: z.coerce.number().min(0),
    maxLoanAmount: z.coerce.number().min(0),
    maxLtv: z.coerce.number().min(1).max(100),
    status: z.enum(["active", "hidden"]),
    terms: z.array(mortgageTermSchema).min(1, "Add at least one mortgage term."),
  })
  .refine((data) => data.maxLoanAmount >= data.minLoanAmount, {
    message: "Maximum loan amount must be greater than or equal to the minimum.",
    path: ["maxLoanAmount"],
  })
  .refine((data) => data.terms.some((term) => term.isPrimary), {
    message: "Mark one term as the primary term used for pre-qualification.",
    path: ["terms"],
  });

export function parseMortgageConfig(value: unknown): MortgageConfig {
  const parsed = mortgageConfigSchema.safeParse(value);
  if (!parsed.success) {
    return DEFAULT_MORTGAGE_CONFIG;
  }
  return normalizeMortgageConfig(parsed.data);
}

export async function fetchMortgageConfig(): Promise<MortgageConfig> {
  try {
    const supabase = createServiceRoleClient();
    const { data } = await supabase
      .from("platform_settings")
      .select("value")
      .eq("key", MORTGAGE_SETTINGS_KEY)
      .maybeSingle();

    if (!data?.value) {
      return DEFAULT_MORTGAGE_CONFIG;
    }

    return parseMortgageConfig(data.value);
  } catch {
    return DEFAULT_MORTGAGE_CONFIG;
  }
}
