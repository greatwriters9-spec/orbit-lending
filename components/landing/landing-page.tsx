import { ActivityFeed } from "./activity-feed";
import { ApplicationTimeline } from "./application-timeline";
import { DashboardPreview } from "./dashboard-preview";
import { FinalCTA } from "./final-cta";
import { HeroSection } from "./hero-section";
import { LandingFooter } from "./landing-footer";
import { LandingNav } from "./landing-nav";
import { LoanCalculator } from "./loan-calculator";
import { Testimonials } from "./testimonials";
import { TrustInfrastructure } from "./trust-infrastructure";
import { WhyOrbit } from "./why-orbit";
import type { BrandingConfig } from "@/types/branding-config";

type LandingPageProps = {
  branding: BrandingConfig;
};

export function LandingPage({ branding }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-white">
      <LandingNav />
      <main>
        <HeroSection />
        <LoanCalculator />
        <WhyOrbit />
        <ApplicationTimeline />
        <ActivityFeed />
        <DashboardPreview />
        <TrustInfrastructure />
        <Testimonials />
        <FinalCTA />
      </main>
      <LandingFooter branding={branding} />
    </div>
  );
}
