"use client";

import { createContext, useContext, type ReactNode } from "react";

import type { LandingContent } from "@/lib/landing/get-landing-content";
import type { BrandingConfig } from "@/types/branding-config";
import type { CompanyRecord } from "@/types/company";

type LandingCompanyContextValue = {
  company: CompanyRecord;
  branding: BrandingConfig;
  content: LandingContent;
};

const LandingCompanyContext = createContext<LandingCompanyContextValue | null>(null);

type LandingCompanyProviderProps = {
  value: LandingCompanyContextValue;
  children: ReactNode;
};

export function LandingCompanyProvider({ value, children }: LandingCompanyProviderProps) {
  return (
    <LandingCompanyContext.Provider value={value}>{children}</LandingCompanyContext.Provider>
  );
}

export function useLandingCompany(): LandingCompanyContextValue {
  const context = useContext(LandingCompanyContext);
  if (!context) {
    throw new Error("useLandingCompany must be used within LandingCompanyProvider");
  }
  return context;
}

export function useOptionalLandingCompany(): LandingCompanyContextValue | null {
  return useContext(LandingCompanyContext);
}
