import { ActivityFeed } from "./activity-feed";
import { ApplicationTimeline } from "./application-timeline";
import { DashboardPreview } from "./dashboard-preview";
import { FinalCTA } from "./final-cta";
import { HeroSection } from "./hero-section";
import { LandingCompanyProvider } from "./landing-company-context";
import { LandingFooter } from "./landing-footer";
import { LandingNav } from "./landing-nav";
import { LoanCalculator } from "./loan-calculator";
import { Testimonials } from "./testimonials";
import { TrustInfrastructure } from "./trust-infrastructure";
import { WhyOrbit } from "./why-orbit";
import type { LandingContent } from "@/lib/landing/get-landing-content";
import { resolveLandingHeroImage } from "@/lib/landing/images";
import type { BrandingConfig } from "@/types/branding-config";
import type { CompanyRecord } from "@/types/company";

type LandingPageProps = {
  branding: BrandingConfig;
  company: CompanyRecord;
  content: LandingContent;
};

export function LandingPage({ branding, company, content }: LandingPageProps) {
  const contextValue = { company, branding, content };
  const heroImage = resolveLandingHeroImage(company);

  return (
    <LandingCompanyProvider value={contextValue}>
      <div className="min-h-screen bg-white">
        <LandingNav />
        <main>
          <HeroSection
            content={content}
            heroImage={heroImage}
            branding={branding}
            primaryColor={company.primaryColor}
          />
          <LoanCalculator />
          <WhyOrbit content={content} />
          <ApplicationTimeline />
          <ActivityFeed content={content} />
          <DashboardPreview />
          <TrustInfrastructure />
          <Testimonials content={content} />
          <FinalCTA content={content} />
        </main>
        <LandingFooter branding={branding} content={content} />
      </div>
    </LandingCompanyProvider>
  );
}
