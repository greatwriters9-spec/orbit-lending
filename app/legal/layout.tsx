import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingNav } from "@/components/landing/landing-nav";

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
      <div className="legal-no-print">
        <LandingNav />
      </div>
      <main className="flex-1">{children}</main>
      <div className="legal-no-print">
        <LandingFooter />
      </div>
    </div>
  );
}
