import { SectionHeader } from "@/components/ui-kit/section-header";

type PortalPlaceholderProps = {
  title: string;
  description: string;
};

export function PortalPlaceholder({
  title,
  description,
}: PortalPlaceholderProps) {
  return (
    <div className="space-y-6">
      <SectionHeader title={title} description={description} />
      <div className="card-surface p-10 text-center">
        <p className="text-sm text-muted-foreground">
          This section is scheduled for a future release. Navigation and access
          controls are active for your role.
        </p>
      </div>
    </div>
  );
}
