import { ClearOnboardingDraft } from "@/components/dashboard/clear-onboarding-draft";
import { OnboardingEmptyState } from "@/components/dashboard/onboarding-empty-state";
import { PreQualifiedDashboard } from "@/components/dashboard/pre-qualified-dashboard";
import { DocumentCenterWidget } from "@/components/dashboard/document-center-widget";
import { MessagesWidget } from "@/components/dashboard/messages-widget";
import { MortgageActivitySection } from "@/components/dashboard/mortgage-activity-section";
import { MortgageJourneyTracker } from "@/components/dashboard/mortgage-journey-tracker";
import { MobileMortgageDashboard } from "@/components/dashboard/mobile/mobile-mortgage-dashboard";
import {
  ClosingFundsCard,
  ApplicationDetailsCard,
  MortgageSummaryCard,
  PathwardFundingAccountCard,
  RequiredDownPaymentCard,
} from "@/components/dashboard/mortgage-primary-cards";
import { PriorityActionsWidget } from "@/components/notifications/priority-actions-widget";
import { SupportDashboardWidget } from "@/components/support/support-dashboard-widget";
import { PortfolioSummary, QuickActions } from "@/components/ui-kit";
import { getSessionUser } from "@/lib/auth/actions";
import { getDisplayName, getProfile } from "@/lib/auth/profile";
import { dashboardQuickActions } from "@/lib/dashboard/constants";
import { fetchClientDashboardData } from "@/lib/dashboard/queries";

export default async function DashboardPage() {
  const user = await getSessionUser();
  const data = user ? await fetchClientDashboardData(user.id) : null;
  const view = data?.mortgageView;
  const profile = user ? await getProfile(user.id) : null;
  const firstName = getDisplayName(profile, user?.email);
  const isPreQualifiedOnly = view?.state === "pre_qualified";
  const showDownPaymentSection = view?.downPayment.showFundingSection ?? false;

  return (
    <>
      <div className="space-y-8 md:space-y-10">
        {view ? (
          <>
            <ClearOnboardingDraft />

            {isPreQualifiedOnly ? (
              <PreQualifiedDashboard
                firstName={firstName}
                view={view}
                applicationId={view.applicationId ?? data?.onboardingApplicationId ?? ""}
              />
            ) : (
              <>
                <div className="lg:hidden">
                  <MobileMortgageDashboard view={view} />
                </div>

                <div className="hidden space-y-8 md:space-y-10 lg:block">
                  <div className="grid gap-6 lg:grid-cols-3 lg:items-stretch">
                    <MortgageSummaryCard view={view} />
                    <PathwardFundingAccountCard view={view} />
                    <ClosingFundsCard view={view} />
                  </div>

                  <MortgageJourneyTracker currentStage={view.journeyStage} />

                  <ApplicationDetailsCard view={view} />

                  {showDownPaymentSection ? (
                    <RequiredDownPaymentCard view={view} />
                  ) : null}

                  <div className="grid gap-6 lg:grid-cols-2 lg:items-stretch">
                    <DocumentCenterWidget
                      applicationId={view.applicationId}
                      documents={view.documents}
                    />
                    <MortgageActivitySection
                      activities={view.activities}
                      transactions={data?.transactions ?? []}
                    />
                  </div>

                  <MessagesWidget messages={view.messages} />

                  {data?.supportSummary ? (
                    <SupportDashboardWidget summary={data.supportSummary} />
                  ) : null}
                </div>
              </>
            )}
          </>
        ) : (
          <OnboardingEmptyState />
        )}

        {!isPreQualifiedOnly ? (
          <div className="hidden lg:block">
            <QuickActions actions={dashboardQuickActions} />
            <PriorityActionsWidget actions={data?.priorityActions ?? []} />
            {data?.portfolio ? <PortfolioSummary {...data.portfolio} /> : null}
          </div>
        ) : null}
      </div>
    </>
  );
}
