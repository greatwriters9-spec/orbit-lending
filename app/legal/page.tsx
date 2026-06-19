import type { Metadata } from "next";

import { LegalHubPage } from "@/components/legal/legal-hub";

export const metadata: Metadata = {
  title: "Legal Center | Orbit Mortgage",
  description:
    "Terms, privacy, disclosures, and contact information for Orbit Mortgage digital mortgage services.",
};

export default function LegalIndexPage() {
  return <LegalHubPage />;
}
