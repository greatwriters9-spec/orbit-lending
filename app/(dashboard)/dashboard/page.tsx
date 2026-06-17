import { DashboardCriticalAlerts } from "@/components/notifications/dashboard-critical-alerts";
import { DocumentCenterWidget } from "@/components/dashboard/document-center-widget";
import { MessagesWidget } from "@/components/dashboard/messages-widget";
import { MortgageActivitySection } from "@/components/dashboard/mortgage-activity-section";
import { ClearOnboardingDraft } from "@/components/dashboard/clear-onboarding-draft";
import { OnboardingEmptyState } from "@/components/dashboard/onboarding-empty-state";
import { MortgageJourneyTracker } from "@/components/dashboard/mortgage-journey-tracker";
import {
  ClosingFundsCard,
  MortgageDetailsCard,
  MortgageSummaryCard,
  PathwardFundingAccountCard,
  RequiredDownPaymentCard,
} from "@/components/dashboard/mortgage-primary-cards";
import { QualificationResultGuard } from "@/components/dashboard/qualification-result-guard";
import { PriorityActionsWidget } from "@/components/notifications/priority-actions-widget";
import { SupportDashboardWidget } from "@/components/support/support-dashboard-widget";
import { PortfolioSummary, QuickActions } from "@/components/ui-kit";
import { getSessionUser } from "@/lib/auth/actions";
import { dashboardQuickActions } from "@/lib/dashboard/constants";
import { fetchClientDashboardData } from "@/lib/dashboard/queries";

export default async function DashboardPage() {
  const user = await getSessionUser();
  const data = user ? await fetchClientDashboardData(user.id) : null;
  const view = data?.mortgageView;
  const showDownPaymentSection = view
    ? ["approved", "closing"].includes(view.state)
    : false;

  return (
    <>
      {user && view && data?.isPreQualified ? (
        <QualificationResultGuard userId={user.id} shouldPrompt />
      ) : null}

      {data?.criticalAlerts.length ? (
        <DashboardCriticalAlerts alerts={data.criticalAlerts} />
      ) : null}

      <div className="space-y-8 md:space-y-10">
        {view ? (
          <>
            <ClearOnboardingDraft />

            <div className="grid gap-6 lg:grid-cols-3 lg:items-stretch">
              <MortgageSummaryCard view={view} />
              <PathwardFundingAccountCard view={view} />
              <ClosingFundsCard view={view} />
            </div>

            <MortgageJourneyTracker currentStage={view.journeyStage} />

            <MortgageDetailsCard view={view} />

            {showDownPaymentSection ? <RequiredDownPaymentCard view={view} /> : null}

            <div className="grid gap-6 lg:grid-cols-2 lg:items-stretch">
              <DocumentCenterWidget documents={view.documents} />
              <MortgageActivitySection
                activities={view.activities}
                transactions={data?.transactions ?? []}
              />
            </div>

            <MessagesWidget messages={view.messages} />

            {data?.supportSummary ? (
              <SupportDashboardWidget summary={data.supportSummary} />
            ) : null}
          </>
        ) : (
          <OnboardingEmptyState />
        )}

        <QuickActions actions={dashboardQuickActions} />

        <PriorityActionsWidget actions={data?.priorityActions ?? []} />

        {data?.portfolio ? <PortfolioSummary {...data.portfolio} /> : null}
      </div>
    </>
  );
}
