"use client";

import { useState } from "react";

import { ApplicationActivityPanel } from "@/components/applications/application-activity-panel";
import { ApplicationDocumentRequests } from "@/components/applications/application-document-requests";
import { ApplicationMessagesPanel } from "@/components/applications/application-messages-panel";
import { ApplicationStatusTimeline } from "@/components/applications/application-status-timeline";
import { cn } from "@/lib/utils";
import type { ApplicationDetail } from "@/types/application-details";
import type { ApplicationActivityEvent } from "@/types/notifications";

type ApplicationCommunicationCenterProps = {
  application: ApplicationDetail;
  activity: ApplicationActivityEvent[];
};

const TABS = [
  { id: "messages", label: "Messages" },
  { id: "timeline", label: "Timeline" },
  { id: "documents", label: "Documents" },
  { id: "activity", label: "Activity" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function ApplicationCommunicationCenter({
  application,
  activity,
}: ApplicationCommunicationCenterProps) {
  const [tab, setTab] = useState<TabId>("messages");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 border-b border-brand-border pb-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "rounded-t-lg px-4 py-2.5 text-sm font-semibold transition-colors",
              tab === t.id
                ? "border-b-2 border-brand-blue text-brand-blue"
                : "text-muted-foreground hover:text-brand-navy",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "messages" ? (
        <ApplicationMessagesPanel
          applicationId={application.id}
          messages={application.messages}
        />
      ) : null}

      {tab === "timeline" ? (
        <ApplicationStatusTimeline entries={application.statusHistory} />
      ) : null}

      {tab === "documents" ? (
        <ApplicationDocumentRequests
          applicationId={application.id}
          requests={application.documentRequests}
        />
      ) : null}

      {tab === "activity" ? <ApplicationActivityPanel events={activity} /> : null}
    </div>
  );
}
