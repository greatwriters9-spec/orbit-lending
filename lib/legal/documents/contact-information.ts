import type { LegalDocument } from "@/lib/legal/types";

export const contactInformation: LegalDocument = {
  slug: "contact-information",
  title: "Contact Information",
  shortDescription:
    "Official contact channels for Orbit Mortgage customer support, compliance inquiries, and legal notices.",
  lastUpdated: "June 19, 2026",
  sections: [
    {
      id: "general",
      title: "1. General Inquiries",
      paragraphs: [
        "Orbit Mortgage provides digital mortgage origination services through www.orbittmortgage.com and secure customer dashboards. For general questions about our Platform, products, or application status, use the channels below.",
      ],
    },
    {
      id: "customer-support",
      title: "2. Customer Support",
      list: {
        items: [
          "Email: support@orbittmortgage.com",
          "Dashboard: Log in and visit Support to open a ticket or view message history",
          "Ask Assistant: Available on onboarding and application pages for pre-account inquiries",
        ],
      },
      closingParagraphs: [
        "Support hours are Monday through Friday, 8:00 a.m. to 6:00 p.m. Central Time, excluding U.S. federal holidays. We aim to respond to inquiries within one (1) business day.",
      ],
    },
    {
      id: "department-contacts",
      title: "3. Department Communications",
      paragraphs: [
        "During your mortgage process, you may receive email from Orbit Mortgage departments. Official sender addresses include:",
      ],
      list: {
        items: [
          "System notifications: noreply@orbittmortgage.com",
          "Loan Officer Department: loanofficer@orbittmortgage.com",
          "Underwriting Department: underwriting@orbittmortgage.com",
          "Funding Department: funding@orbittmortgage.com",
          "Closing Department: closing@orbittmortgage.com",
          "Executive Office: chief.lending.officer@orbittmortgage.com",
        ],
      },
      closingParagraphs: [
        "Always verify that messages relate to activity visible in your dashboard before sharing sensitive information in response to email requests.",
      ],
    },
    {
      id: "application-status",
      title: "4. Application and Funding Account Status",
      paragraphs: [
        "The fastest way to check application milestones, document requests, funding account balances, and closing updates is through your Orbit Mortgage dashboard after signing in.",
        "If you cannot access your account, contact support@orbittmortgage.com from the email address associated with your application.",
      ],
    },
    {
      id: "privacy-legal",
      title: "5. Privacy and Legal Notices",
      list: {
        items: [
          "Privacy requests: support@orbittmortgage.com (Subject line: Privacy Request)",
          "Legal and compliance notices: support@orbittmortgage.com (Subject line: Legal Notice)",
          "Fair lending concerns: support@orbittmortgage.com (Subject line: Fair Lending Inquiry)",
        ],
      },
    },
    {
      id: "mailing-address",
      title: "6. Mailing Address",
      paragraphs: [
        "Orbit Mortgage",
        "Attn: Customer Support",
        "500 Mortgage Way, Suite 200",
        "Omaha, NE 68102",
        "United States",
        "Please include your full name, application reference number (if available), and a description of your request when contacting us by mail.",
      ],
    },
    {
      id: "website",
      title: "7. Website",
      paragraphs: [
        "Official website: www.orbittmortgage.com",
        "Legal documents: www.orbittmortgage.com/legal",
      ],
    },
    {
      id: "banking-infrastructure",
      title: "8. Banking Infrastructure Notice",
      paragraphs: [
        "Orbit Mortgage operates with banking infrastructure provided by Pathward National Bank. Banking services supporting certain funding and settlement workflows are subject to applicable banking regulations and partner requirements.",
        "Questions about Orbit Mortgage products and application status should be directed to Orbit Mortgage using the contact methods above.",
      ],
    },
    {
      id: "emergency",
      title: "9. Fraud and Security Reporting",
      paragraphs: [
        "If you suspect fraud, unauthorized account access, or phishing messages impersonating Orbit Mortgage, contact support@orbittmortgage.com immediately with the subject line \"Security Report\" and include relevant message headers or screenshots if available.",
      ],
    },
    {
      id: "updates",
      title: "10. Updates to Contact Information",
      paragraphs: [
        "We may update contact details by posting revisions on this page. The \"Last Updated\" date reflects the most recent revision.",
      ],
    },
  ],
};
