"use client";



import type { CSSProperties, ReactNode } from "react";



import { themeToCssVariables } from "@/lib/company/branding";

import { isOakstoneCompany } from "@/lib/design-system/oakstone/theme";

import type { CompanyTheme } from "@/types/company";



type CompanyThemeStylesProps = {

  theme: CompanyTheme;

  companySlug: string;

  children: ReactNode;

};



export function CompanyThemeStyles({ theme, companySlug, children }: CompanyThemeStylesProps) {

  const cssVars = themeToCssVariables(theme, companySlug) as CSSProperties;

  const isOakstone = isOakstoneCompany(companySlug);



  return (

    <div

      style={cssVars}

      className="contents"

      data-company={companySlug}

      data-theme={isOakstone ? "oakstone" : "default"}

    >

      {children}

    </div>

  );

}

