import { LandingCompanyProvider } from "@/components/landing/landing-company-context";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingNav } from "@/components/landing/landing-nav";
import { fetchBrandingConfig } from "@/lib/admin/branding/fetch-config.server";
import { getCompanyContext } from "@/lib/company/server";
import { getLandingContent } from "@/lib/landing/get-landing-content";

export default async function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const branding = await fetchBrandingConfig();
  const companyContext = await getCompanyContext();
  const content = getLandingContent(companyContext.company, branding);
  const providerValue = {
    company: companyContext.company,
    branding,
    content,
  };

  return (
    <LandingCompanyProvider value={providerValue}>
      <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
        <div className="legal-no-print">
          <LandingNav />
        </div>
        <main className="flex-1">{children}</main>
        <div className="legal-no-print">
          <LandingFooter branding={branding} content={content} />
        </div>
      </div>
    </LandingCompanyProvider>
  );
}
