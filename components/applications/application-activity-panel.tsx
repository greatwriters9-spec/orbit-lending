import { formatApplicationDate } from "@/lib/applications/status-utils";
import { cn } from "@/lib/utils";
import type { ApplicationActivityEvent } from "@/types/notifications";

type ApplicationActivityPanelProps = {
  events: ApplicationActivityEvent[];
  className?: string;
};

export function ApplicationActivityPanel({
  events,
  className,
}: ApplicationActivityPanelProps) {
  return (
    <section className={cn("card-surface p-6 md:p-8", className)}>
      <h2 className="heading-secondary text-lg">Activity</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        All major events on this application in one place.
      </p>
      {events.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">No activity recorded yet.</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {events.map((event) => (
            <li
              key={event.id}
              className="rounded-xl border border-brand-border px-4 py-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold capitalize text-brand-navy">
                  {event.title}
                </p>
                <time className="text-xs text-muted-foreground">
                  {formatApplicationDate(event.createdAt)}
                </time>
              </div>
              {event.actorName ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  {event.actorName}
                </p>
              ) : null}
              {event.description ? (
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {event.description}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
