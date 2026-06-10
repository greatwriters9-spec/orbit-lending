import Link from "next/link";
import {
  Download,
  FileUp,
  PlusCircle,
  Receipt,
} from "lucide-react";

import { Button } from "@/components/ui-kit/button";
import { cn } from "@/lib/utils";
import type { QuickAction } from "@/types/dashboard";

type QuickActionsProps = {
  actions: QuickAction[];
  className?: string;
};

export function QuickActions({ actions, className }: QuickActionsProps) {
  return (
    <section className={cn("card-surface px-5 py-4 md:px-6", className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs font-semibold tracking-[0.06em] text-muted-foreground uppercase">
          Quick Actions
        </p>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-end">
          {actions.map((action) => {
            const Icon = action.icon;

            return (
              <Button
                key={action.label}
                variant="outline"
                size="sm"
                className="h-9 justify-start gap-2 border-brand-border bg-white px-3 text-brand-navy shadow-none hover:border-brand-blue/30 hover:bg-brand-background"
                render={<Link href={action.href} />}
              >
                <Icon className="size-3.5 shrink-0 text-brand-blue" strokeWidth={1.75} />
                <span className="truncate text-xs font-medium">{action.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
