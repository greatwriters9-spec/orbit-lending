"use client";

import { createContext, useContext, type ReactNode } from "react";

import type { CompanyContextValue } from "@/types/company";

const CompanyContext = createContext<CompanyContextValue | null>(null);

type CompanyProviderProps = {
  value: CompanyContextValue;
  children: ReactNode;
};

export function CompanyProvider({ value, children }: CompanyProviderProps) {
  return <CompanyContext.Provider value={value}>{children}</CompanyContext.Provider>;
}

export function useCompany(): CompanyContextValue {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error("useCompany must be used within CompanyProvider");
  }
  return context;
}

export function useOptionalCompany(): CompanyContextValue | null {
  return useContext(CompanyContext);
}
