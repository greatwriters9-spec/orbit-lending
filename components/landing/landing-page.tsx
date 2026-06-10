import type { CategoryConfigEntry } from "@/lib/loans/category-config";

import { ActivityFeed } from "./activity-feed";
import { ApplicationTimeline } from "./application-timeline";
import { DashboardPreview } from "./dashboard-preview";
import { FinalCTA } from "./final-cta";
import { HeroSection } from "./hero-section";
import { LandingFooter } from "./landing-footer";
import { LandingNav } from "./landing-nav";
import { LoanCalculator } from "./loan-calculator";
import { ProductShowcase } from "./product-showcase";
import { Testimonials } from "./testimonials";
import { TrustInfrastructure } from "./trust-infrastructure";
import { WhyOrbit } from "./why-orbit";

type LandingPageProps = {
  categories: CategoryConfigEntry[];
};

export function LandingPage({ categories }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-white">
      <LandingNav />
      <main>
        <HeroSection />
        <LoanCalculator />
        <ProductShowcase categories={categories} />
        <WhyOrbit />
        <ApplicationTimeline />
        <ActivityFeed />
        <DashboardPreview />
        <TrustInfrastructure />
        <Testimonials />
        <FinalCTA />
      </main>
      <LandingFooter />
    </div>
  );
}
