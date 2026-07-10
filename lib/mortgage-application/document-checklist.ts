import type {
  DocumentChecklistItem,
  FullMortgageApplication,
} from "@/types/mortgage-full-application";

export function generateDocumentChecklist(
  application: FullMortgageApplication,
): DocumentChecklistItem[] {
  const items: DocumentChecklistItem[] = [
    {
      id: "gov-id",
      name: "Government ID",
      status: "required_later",
      description: "Driver license or passport",
    },
    {
      id: "pay-stubs",
      name: "Pay Stubs",
      status: "required_later",
      description: "Most recent 30 days",
    },
    {
      id: "w2",
      name: "W-2 Forms",
      status: "required_later",
      description: "Last two years",
    },
    {
      id: "tax-returns",
      name: "Tax Returns",
      status: "required_later",
      description: "Last two years",
    },
    {
      id: "bank-statements",
      name: "Bank Statements",
      status: "required_later",
      description: "Last two months",
    },
  ];

  if (application.property.hasProperty) {
    items.push({
      id: "purchase-agreement",
      name: "Purchase Agreement",
      status: "required_later",
      description: "Signed contract for the property",
    });
  }

  if (application.assets.giftFunds > 0) {
    items.push({
      id: "gift-letter",
      name: "Gift Letter",
      status: "required_later",
      description: "Documentation for gift funds",
    });
  }

  if (application.employment.current.isSelfEmployed) {
    items.push({
      id: "business-returns",
      name: "Business Tax Returns",
      status: "required_later",
      description: "Last two years of business returns",
    });
  }

  items.push({
    id: "homeowners-insurance",
    name: "Homeowners Insurance",
    status: "optional",
    description: "Required before closing",
  });

  return items;
}

export function mapChecklistForDashboard(
  items: DocumentChecklistItem[],
): DocumentChecklistItem[] {
  return items.map((item) => ({
    ...item,
    status: item.status === "pending" ? "not_requested" : item.status,
  }));
}
