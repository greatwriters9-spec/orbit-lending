import Link from "next/link";

import { DashboardCriticalAlerts } from "@/components/notifications/dashboard-critical-alerts";
import { LoanStatusWidget } from "@/components/notifications/loan-status-widget";
import { PriorityActionsWidget } from "@/components/notifications/priority-actions-widget";
import { SupportDashboardWidget } from "@/components/support/support-dashboard-widget";
import {
  DashboardHero,
  PortfolioSummary,
  QuickActions,
  SectionHeader,
  StatCard,
  TransactionList,
  NotificationTimeline,
} from "@/components/ui-kit";
import { getSessionUser } from "@/lib/auth/actions";
import { getDisplayName, getProfile } from "@/lib/auth/profile";
import { dashboardQuickActions } from "@/lib/dashboard/constants";
import { fetchClientDashboardData } from "@/lib/dashboard/queries";
import { buildProgressSteps } from "@/lib/applications/status-utils";

const statVariants = ["featured", "growth", "success"] as const;

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardPage() {
  const user = await getSessionUser();
  const profile = user ? await getProfile(user.id) : null;
  const firstName = getDisplayName(profile, user?.email);

  const data = user ? await fetchClientDashboardData(user.id) : null;

  const stats = data?.stats ?? [];
  const progressSteps = data?.loanStatus.status
    ? buildProgressSteps(data.loanStatus.status)
    : data?.progressSteps ?? [];

  return (
    <>
      {data?.criticalAlerts.length ? (
        <DashboardCriticalAlerts alerts={data.criticalAlerts} />
      ) : null}

      <div className="space-y-8 md:space-y-9">
        <DashboardHero
          greeting={getGreeting()}
          userName={firstName}
          standing={data?.hero.standing ?? "Welcome to Orbit Lending."}
          paymentReminder={
            data?.hero.paymentReminder ?? "Browse loan products to get started."
          }
          nextAction={data?.hero.nextAction ?? "Browse loans"}
          nextActionHref={data?.hero.nextActionHref ?? "/loans"}
          showLoanDetails={data?.hero.showLoanDetails ?? false}
        />

        <section className="grid gap-5 lg:grid-cols-2">
          <LoanStatusWidget
            status={data?.loanStatus.status}
            applicationNumber={data?.loanStatus.applicationNumber}
            productName={data?.loanStatus.productName}
            progressSteps={progressSteps}
          />
          <PriorityActionsWidget actions={data?.priorityActions ?? []} />
        </section>

        {data?.supportSummary ? (
          <SupportDashboardWidget summary={data.supportSummary} />
        ) : null}

        {stats.length > 0 ? (
          <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {stats.map((stat, index) => (
              <StatCard
                key={stat.title}
                {...stat}
                variant={statVariants[index] ?? "featured"}
              />
            ))}
          </section>
        ) : null}

        <QuickActions actions={dashboardQuickActions} />

        {data?.portfolio ? <PortfolioSummary {...data.portfolio} /> : null}

        <div className="grid gap-7 xl:grid-cols-5">
          <section className="card-surface overflow-hidden xl:col-span-3">
            <div className="border-b border-brand-border px-6 py-6 md:px-8">
              <SectionHeader
                title="Account Statement"
                description="Your latest wallet activity and repayment history."
                action={
                  <Link
                    href="/dashboard/transactions"
                    className="text-sm font-semibold text-brand-blue transition-colors hover:text-brand-blue/80"
                  >
                    View all
                  </Link>
                }
              />
            </div>
            {data?.transactions.length ? (
              <TransactionList transactions={data.transactions} />
            ) : (
              <div className="px-6 py-10 text-center text-sm text-muted-foreground md:px-8">
                No transactions yet. Activity will appear here after loan funding
                or wallet movements.
              </div>
            )}
          </section>

          <section className="card-surface p-6 md:p-8 xl:col-span-2">
            <SectionHeader
              title="Activity Timeline"
              description="Alerts and updates that need your attention."
              action={
                <Link
                  href="/dashboard/notifications"
                  className="text-sm font-semibold text-brand-blue transition-colors hover:text-brand-blue/80"
                >
                  View all
                </Link>
              }
            />
            <div className="mt-7">
              {data?.notifications.length ? (
                <NotificationTimeline notifications={data.notifications} />
              ) : (
                <p className="text-sm text-muted-foreground">
                  No notifications yet. You&apos;re all caught up.
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
