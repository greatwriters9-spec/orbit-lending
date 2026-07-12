import { notFound } from "next/navigation";

import { EMAIL_TEMPLATE_LABELS } from "@/lib/email/templates/catalog-labels";
import { renderEmailFromTemplate } from "@/lib/email/templates/catalog";
import type { EmailTemplateKey } from "@/lib/email/types";

const SAMPLE_DATA = {
  firstName: "Alex",
  approvedAmount: 520000,
  previousAmount: 480000,
  amount: 85000,
  balance: 125000,
  applicationNumber: "ORB-2026-128972",
  closingAmount: 629900,
  propertyAddress: "1050 Woodward Ave, Detroit, MI 48226",
  actionUrl: "https://orbittmortgage.com/dashboard",
  message: "Your mortgage team has an update regarding your application.",
  resetUrl: "https://orbittmortgage.com/reset-password",
  label: "Closing deposit",
};

export async function GET(request: Request) {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  const { searchParams } = new URL(request.url);
  const template = (searchParams.get("template") ??
    "mortgage_closed_successfully") as EmailTemplateKey;

  if (!(template in EMAIL_TEMPLATE_LABELS)) {
    return new Response("Unknown template.", { status: 404 });
  }

  const data = {
    ...SAMPLE_DATA,
    applicationNumber:
      searchParams.get("applicationNumber") ?? SAMPLE_DATA.applicationNumber,
    approvedAmount: Number(
      searchParams.get("approvedAmount") ?? SAMPLE_DATA.approvedAmount,
    ),
    closingAmount: Number(
      searchParams.get("closingAmount") ?? SAMPLE_DATA.closingAmount,
    ),
    propertyAddress:
      searchParams.get("propertyAddress") ?? SAMPLE_DATA.propertyAddress,
  };

  const rendered = await renderEmailFromTemplate(template, data, {
    customMessage:
      searchParams.get("message") ??
      "Congratulations on completing your home purchase. The funds have been released to the seller.",
  });

  return new Response(rendered.html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
