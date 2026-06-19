import type { LegalDocument } from "@/lib/legal/types";

export const termsOfUse: LegalDocument = {
  slug: "terms-of-use",
  title: "Terms of Use",
  shortDescription:
    "Rules governing access to the Orbit Mortgage website, customer dashboard, and digital mortgage services.",
  lastUpdated: "June 19, 2026",
  sections: [
    {
      id: "acceptance",
      title: "1. Acceptance of Terms",
      paragraphs: [
        "These Terms of Use (\"Terms\") govern your access to and use of the Orbit Mortgage website located at www.orbittmortgage.com, our secure customer dashboard, mobile-responsive interfaces, and related digital services (collectively, the \"Platform\").",
        "By creating an account, submitting a mortgage application, accessing a funding account, or otherwise using the Platform, you agree to be bound by these Terms and all policies incorporated by reference, including our Privacy Policy, Cookie Policy, Electronic Communications Consent, and Mortgage Application Disclosure.",
        "If you do not agree to these Terms, you must not use the Platform.",
      ],
    },
    {
      id: "eligibility",
      title: "2. Eligibility",
      paragraphs: [
        "You must be at least eighteen (18) years of age and a legal resident of the United States to use the Platform for mortgage-related services. By using the Platform, you represent that you meet these requirements and that all information you provide is accurate and complete.",
        "Orbit Mortgage may refuse service, suspend access, or terminate accounts when we reasonably believe a user does not meet eligibility requirements or has provided false or misleading information.",
      ],
    },
    {
      id: "services",
      title: "3. Description of Services",
      paragraphs: [
        "Orbit Mortgage provides a digital mortgage origination experience that may include, depending on your application status and product eligibility:",
      ],
      list: {
        items: [
          "Online pre-qualification and mortgage application workflows",
          "Secure customer dashboards with application status, funding account activity, and document management",
          "Identity verification and document upload capabilities",
          "In-platform messaging, notifications, and email communications from Orbit Mortgage departments",
          "Funding account creation, deposit tracking, and escrow-related closing workflows",
          "Customer support channels, including the Ask Assistant feature and support ticket submission",
        ],
      },
      closingParagraphs: [
        "Orbit Mortgage does not guarantee that every visitor will qualify for a mortgage or that every product described on the Platform will be available in every state or for every borrower profile. Final loan terms are subject to underwriting approval, property eligibility, and applicable law.",
      ],
    },
    {
      id: "accounts",
      title: "4. Account Registration and Security",
      paragraphs: [
        "You are responsible for maintaining the confidentiality of your login credentials and for all activity that occurs under your account. You agree to notify Orbit Mortgage promptly if you suspect unauthorized access or a security incident involving your account.",
        "You may not share your account credentials, impersonate another person, or use the Platform on behalf of a third party unless you are an authorized representative with documented authority.",
        "We may require multi-factor authentication, identity verification, or additional documentation before granting access to sensitive features such as funding account activity or closing-related actions.",
      ],
    },
    {
      id: "applications",
      title: "5. Mortgage Applications and Representations",
      paragraphs: [
        "When you submit a mortgage application through the Platform, you authorize Orbit Mortgage and its service providers to obtain, verify, and use information necessary to evaluate your request, including credit reports, employment verification, asset documentation, and property-related records.",
        "You represent that all application data, uploaded documents, and communications you provide are true, complete, and not misleading. Material misstatements may result in denial, rescission, or legal action as permitted by law.",
        "Submitting an application does not create a binding loan commitment. A loan is not final until all required disclosures are delivered, conditions are satisfied, and closing documents are executed in accordance with applicable regulations.",
      ],
    },
    {
      id: "funding-escrow",
      title: "6. Funding Accounts and Escrow Processes",
      paragraphs: [
        "Certain borrowers may be required to establish a funding account through the Platform to satisfy down payment, closing cost, or reserve requirements associated with their mortgage transaction. Funding account features, deposit instructions, and balance visibility are provided through your customer dashboard.",
        "Funds held in connection with your transaction may be subject to verification, compliance review, and escrow-based release procedures aligned with your closing timeline. Orbit Mortgage will provide status updates through dashboard notifications, email, and in-platform messaging where applicable.",
        "You agree to follow deposit instructions exactly as presented in the Platform. Orbit Mortgage is not responsible for delays caused by incorrect transfer references, incomplete documentation, or deposits from unverified sources.",
      ],
    },
    {
      id: "communications",
      title: "7. Communications and Notifications",
      paragraphs: [
        "By using the Platform, you consent to receive transactional and service-related communications, including email, dashboard alerts, and in-platform notifications regarding your application, funding activity, document requests, and closing milestones.",
        "Marketing communications, where permitted, will be sent in accordance with your preferences and applicable law. You may manage certain notification settings through your account; however, you may not opt out of legally required servicing or compliance notices while an application or active loan relationship exists.",
      ],
    },
    {
      id: "acceptable-use",
      title: "8. Acceptable Use",
      list: {
        intro: "You agree not to:",
        items: [
          "Use the Platform for unlawful, fraudulent, or abusive purposes",
          "Attempt to gain unauthorized access to systems, accounts, or data",
          "Upload malware, corrupted files, or content you do not have the right to share",
          "Scrape, reverse engineer, or interfere with Platform operations except as permitted by law",
          "Misuse customer support channels or submit false or harassing inquiries",
        ],
      },
    },
    {
      id: "intellectual-property",
      title: "9. Intellectual Property",
      paragraphs: [
        "The Platform, including its design, software, logos, text, and proprietary workflows, is owned by Orbit Mortgage or its licensors and is protected by intellectual property laws. You receive a limited, non-exclusive, revocable license to use the Platform for personal, non-commercial mortgage-related purposes in accordance with these Terms.",
        "You may not copy, modify, distribute, or create derivative works from Platform content without prior written consent.",
      ],
    },
    {
      id: "third-parties",
      title: "10. Third-Party Services",
      paragraphs: [
        "The Platform may integrate with third-party providers for identity verification, document storage, payment processing, email delivery, and banking infrastructure. Your use of those features may be subject to additional terms imposed by the relevant provider.",
        "Orbit Mortgage is not responsible for third-party websites or services linked from the Platform, except to the extent required by applicable law.",
      ],
    },
    {
      id: "disclaimers",
      title: "11. Disclaimers",
      paragraphs: [
        "THE PLATFORM IS PROVIDED ON AN \"AS IS\" AND \"AS AVAILABLE\" BASIS. TO THE MAXIMUM EXTENT PERMITTED BY LAW, ORBIT MORTGAGE DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.",
        "Information presented on the Platform, including calculators, estimates, and status indicators, is for informational purposes and does not constitute a loan offer, commitment, or financial advice.",
      ],
    },
    {
      id: "limitation",
      title: "12. Limitation of Liability",
      paragraphs: [
        "TO THE MAXIMUM EXTENT PERMITTED BY LAW, ORBIT MORTGAGE AND ITS AFFILIATES, OFFICERS, EMPLOYEES, AND SERVICE PROVIDERS WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE PLATFORM.",
        "Our total liability for any claim arising out of or relating to these Terms or the Platform will not exceed the greater of (a) one hundred U.S. dollars ($100) or (b) the fees you paid to Orbit Mortgage for Platform-related services in the twelve (12) months preceding the claim, except where prohibited by law.",
      ],
    },
    {
      id: "indemnification",
      title: "13. Indemnification",
      paragraphs: [
        "You agree to indemnify and hold harmless Orbit Mortgage from claims, losses, and expenses (including reasonable attorneys' fees) arising from your violation of these Terms, misuse of the Platform, or inaccurate information provided in connection with your mortgage application or funding activity.",
      ],
    },
    {
      id: "termination",
      title: "14. Suspension and Termination",
      paragraphs: [
        "We may suspend or terminate your access to the Platform at any time if we reasonably believe you have violated these Terms, pose a security risk, or if continued access is inconsistent with regulatory obligations.",
        "Upon termination, provisions that by their nature should survive—including disclaimers, limitations of liability, and dispute resolution—will remain in effect.",
      ],
    },
    {
      id: "governing-law",
      title: "15. Governing Law and Dispute Resolution",
      paragraphs: [
        "These Terms are governed by the laws of the United States and the state in which Orbit Mortgage maintains its principal place of business, without regard to conflict-of-law principles.",
        "Before initiating formal legal action, you agree to contact Orbit Mortgage through the channels listed in our Contact Information page to attempt informal resolution. Nothing in this section limits either party's right to seek injunctive relief or to bring claims in a court of competent jurisdiction where required by law.",
      ],
    },
    {
      id: "changes",
      title: "16. Changes to These Terms",
      paragraphs: [
        "We may update these Terms from time to time. When we make material changes, we will post the revised Terms on the Platform and update the \"Last Updated\" date. Your continued use of the Platform after changes become effective constitutes acceptance of the revised Terms.",
      ],
    },
    {
      id: "contact",
      title: "17. Contact",
      paragraphs: [
        "Questions about these Terms may be directed to Orbit Mortgage using the contact details provided on our Contact Information page at www.orbittmortgage.com/legal/contact-information.",
      ],
    },
  ],
};
