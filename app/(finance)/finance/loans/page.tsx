import { PortalPlaceholder } from "@/components/layout/portal-placeholder";

export const metadata = {
  title: "Active Loans | Orbit Lending",
};

export default function Page() {
  return (
    <PortalPlaceholder
      title="Active Loans"
      description="Monitor funded loans currently in servicing."
    />
  );
}
