import type { LegalDocument } from "@/lib/legal/types";

export const mortgageApplicationDisclosure: LegalDocument = {
  slug: "mortgage-application-disclosure",
  title: "Mortgage Application Disclosure",
  shortDescription:
    "Important disclosures regarding Orbit Mortgage applications, underwriting, funding accounts, and closing processes.",
  lastUpdated: "June 19, 2026",
  sections: [
    {
      id: "purpose",
      title: "1. Purpose of This Disclosure",
      paragraphs: [
        "This Mortgage Application Disclosure provides general information about the Orbit Mortgage digital application process. It is not a loan estimate, commitment letter, or binding offer of credit.",
        "Specific loan terms, fees, and timing will be provided in regulated disclosures when applicable based on your application type, property location, and product selection.",
      ],
    },
    {
      id: "application-process",
      title: "2. Application Process Overview",
      paragraphs: [
        "Orbit Mortgage offers online pre-qualification and full mortgage application workflows. Pre-qualification provides an preliminary assessment based on information you supply and does not guarantee final approval.",
        "After pre-qualification, you may complete a detailed application, upload supporting documents, and track progress through your customer dashboard. Application status may include stages such as submitted, under review, additional documents required, approved, on hold, or declined.",
      ],
    },
    {
      id: "information-verification",
      title: "3. Information Verification",
      paragraphs: [
        "You authorize Orbit Mortgage to verify application information through credit reports, employment and income verification, asset documentation, fraud prevention tools, and identity verification services integrated with the Platform.",
        "Failure to provide requested documentation within stated timeframes may result in delay or denial of your application.",
      ],
    },
    {
      id: "credit",
      title: "4. Credit Inquiries",
      paragraphs: [
        "Submitting a full mortgage application may result in a hard credit inquiry that can affect your credit score. Pre-qualification may involve a soft inquiry where permitted.",
        "Credit eligibility depends on multiple factors, including credit history, debt-to-income ratio, employment stability, and property characteristics.",
      ],
    },
    {
      id: "fees-costs",
      title: "5. Fees and Costs",
      paragraphs: [
        "Mortgage transactions may involve origination charges, appraisal fees, title services, recording fees, prepaid items, and third-party costs. Applicable fees will be disclosed in loan-specific documents when your application advances.",
        "Orbit Mortgage does not charge Platform access fees for standard online application and dashboard features unless otherwise disclosed at the time of service.",
      ],
    },
    {
      id: "funding-accounts",
      title: "6. Funding Accounts",
      paragraphs: [
        "Some borrowers are required to establish a funding account through the Platform to demonstrate availability of down payment, closing costs, or required reserves. Funding account features may include account creation, deposit submission, verification review, and balance tracking visible in your dashboard.",
        "Deposits may be subject to source-of-funds review and compliance screening. Rejected or unverified deposits will not be credited toward your transaction requirements until resolved.",
      ],
    },
    {
      id: "escrow-closing",
      title: "7. Escrow and Closing",
      paragraphs: [
        "Orbit Mortgage supports escrow-based closing workflows that may include transfer requests, pending approval states, and release of funds to authorized parties in connection with your closing timeline.",
        "Closing is contingent upon satisfaction of underwriting conditions, clear title, acceptable appraisal, receipt of required funds, and execution of closing documents. Estimated closing dates shown in the dashboard are subject to change.",
      ],
    },
    {
      id: "communications",
      title: "8. Application Communications",
      paragraphs: [
        "You will receive application updates through dashboard notifications, in-platform messaging, and email from Orbit Mortgage departments including system notifications, loan officer communications, underwriting requests, funding updates, and closing coordination messages.",
        "You are responsible for monitoring these channels and responding promptly to document requests and verification steps.",
      ],
    },
    {
      id: "denial-withdrawal",
      title: "9. Denial, Withdrawal, and Adverse Action",
      paragraphs: [
        "If your application is denied or you receive an adverse action notice, Orbit Mortgage will provide information required by applicable law, including reasons for denial where mandated and instructions for obtaining additional details.",
        "You may withdraw your application at any time before closing by notifying Orbit Mortgage through your dashboard or support channels, subject to any non-refundable third-party costs already incurred.",
      ],
    },
    {
      id: "no-commitment",
      title: "10. No Loan Commitment",
      paragraphs: [
        "Submission of an application through the Orbit Mortgage Platform does not obligate Orbit Mortgage to extend credit. All loans are subject to final underwriting approval, investor guidelines, regulatory requirements, and executed closing documents.",
      ],
    },
    {
      id: "state-licensing",
      title: "11. Licensing and Availability",
      paragraphs: [
        "Mortgage products and services may not be available in all states or for all property types. Orbit Mortgage originates loans only where authorized and in compliance with applicable licensing and regulatory requirements.",
      ],
    },
    {
      id: "questions",
      title: "12. Questions",
      paragraphs: [
        "For questions about this disclosure or your application status, contact Orbit Mortgage using the information at www.orbittmortgage.com/legal/contact-information or through your dashboard support options.",
      ],
    },
  ],
};
