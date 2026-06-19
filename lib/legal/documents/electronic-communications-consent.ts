import type { LegalDocument } from "@/lib/legal/types";

export const electronicCommunicationsConsent: LegalDocument = {
  slug: "electronic-communications-consent",
  title: "Electronic Communications Consent (E-Sign)",
  shortDescription:
    "Your consent to receive disclosures, notices, and signatures electronically through the Orbit Mortgage platform.",
  lastUpdated: "June 19, 2026",
  sections: [
    {
      id: "purpose",
      title: "1. Purpose",
      paragraphs: [
        "This Electronic Communications Consent (\"E-Sign Consent\") describes your agreement to receive records, disclosures, notices, and signatures electronically in connection with your use of the Orbit Mortgage platform and any mortgage application, funding account, or closing activity conducted through it.",
        "Federal and state laws, including the Electronic Signatures in Global and National Commerce Act (E-SIGN Act) and the Uniform Electronic Transactions Act (UETA) as adopted in applicable states, permit electronic records and signatures when consumers provide informed consent.",
      ],
    },
    {
      id: "scope",
      title: "2. Scope of Consent",
      paragraphs: [
        "By providing E-Sign Consent, you agree that Orbit Mortgage may deliver the following electronically through email, dashboard notifications, secure document centers, or other digital channels:",
      ],
      list: {
        items: [
          "Mortgage application disclosures and eligibility notices",
          "Identity verification requests and document upload instructions",
          "Underwriting conditions, approval letters, and adverse action notices where applicable",
          "Funding account instructions, deposit confirmations, and balance updates",
          "Escrow-related closing disclosures, transfer approvals, and milestone notifications",
          "Loan servicing notices required during the origination process",
          "Customer support correspondence and audit logs of electronic acceptance",
        ],
      },
    },
    {
      id: "methods",
      title: "3. Electronic Delivery Methods",
      paragraphs: [
        "Records may be delivered to the email address associated with your account, displayed within your Orbit Mortgage dashboard, sent through department-specific email channels (such as loan officer, underwriting, funding, or closing communications), or made available for download in your document center.",
        "You agree to maintain a valid email address and to review your dashboard and email regularly for time-sensitive disclosures.",
      ],
    },
    {
      id: "hardware-software",
      title: "4. Hardware and Software Requirements",
      list: {
        intro:
          "To access and retain electronic records, you need:",
        items: [
          "A device with internet access and a current web browser (Chrome, Safari, Firefox, or Edge)",
          "A valid email account and the ability to receive attachments in standard formats (PDF recommended)",
          "Software capable of viewing PDF documents and printing or saving records for your files",
          "Sufficient storage space or printing capability if you wish to retain copies offline",
        ],
      },
      closingParagraphs: [
        "We may update minimum technical requirements by posting revisions on the Platform. Continued use after updates constitutes acceptance of revised requirements.",
      ],
    },
    {
      id: "withdrawal",
      title: "5. Withdrawing Consent",
      paragraphs: [
        "You may withdraw E-Sign Consent at any time by contacting Orbit Mortgage through the channels listed on our Contact Information page.",
        "Withdrawal may delay or prevent completion of your mortgage application or closing if paper delivery is unavailable or impracticable for certain records. Some disclosures may still be delivered electronically where permitted by law even after withdrawal.",
      ],
    },
    {
      id: "paper-copies",
      title: "6. Paper Copies",
      paragraphs: [
        "You may request paper copies of electronic records by contacting Orbit Mortgage. We may charge a reasonable fee for paper delivery where permitted by law.",
        "Requesting paper copies does not automatically withdraw your E-Sign Consent unless you explicitly withdraw consent.",
      ],
    },
    {
      id: "signature",
      title: "7. Electronic Signatures",
      paragraphs: [
        "When you click \"I Agree,\" \"Continue,\" \"Submit,\" or similar buttons, enter a one-time code, or otherwise authenticate acceptance within the Platform, you intend to sign the associated record electronically and agree that such action constitutes your legal signature to the same extent as a handwritten signature.",
        "You represent that you are authorized to sign on behalf of yourself and, if applicable, any co-borrower or entity for whom you act.",
      ],
    },
    {
      id: "updates-contact",
      title: "8. Keeping Contact Information Current",
      paragraphs: [
        "You agree to promptly update your email address, phone number, and mailing address in your account profile if they change during the application or closing process.",
        "Orbit Mortgage is not responsible for undelivered notices caused by outdated contact information you provided or failed to update.",
      ],
    },
    {
      id: "acknowledgment",
      title: "9. Acknowledgment",
      paragraphs: [
        "By checking an E-Sign consent box during registration, application submission, or closing workflows, you confirm that you have read this E-Sign Consent, can access electronic records in the formats described, and agree to conduct transactions electronically with Orbit Mortgage.",
      ],
    },
    {
      id: "contact",
      title: "10. Contact",
      paragraphs: [
        "Questions regarding electronic delivery or signature requirements may be directed to Orbit Mortgage at www.orbittmortgage.com/legal/contact-information.",
      ],
    },
  ],
};
