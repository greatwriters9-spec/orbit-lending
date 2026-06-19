import type { LegalDocument } from "@/lib/legal/types";

export const privacyPolicy: LegalDocument = {
  slug: "privacy-policy",
  title: "Privacy Policy",
  shortDescription:
    "How Orbit Mortgage collects, uses, shares, and protects personal information across our digital mortgage platform.",
  lastUpdated: "June 19, 2026",
  sections: [
    {
      id: "overview",
      title: "1. Overview",
      paragraphs: [
        "Orbit Mortgage (\"Orbit Mortgage,\" \"we,\" \"us,\" or \"our\") respects your privacy and is committed to protecting personal information collected through our website, customer dashboard, and related services (the \"Platform\").",
        "This Privacy Policy explains what information we collect, how we use it, when we share it, and the choices available to you. This Policy applies to visitors, applicants, and customers who interact with Orbit Mortgage digitally.",
      ],
    },
    {
      id: "information-collected",
      title: "2. Information We Collect",
      subsections: [
        {
          id: "information-you-provide",
          title: "2.1 Information You Provide",
          paragraphs: [
            "We collect information you submit directly through pre-qualification flows, account registration, mortgage applications, funding account activity, document uploads, identity verification steps, and customer support interactions.",
          ],
          list: {
            items: [
              "Identity and contact details (name, address, email, phone number, date of birth)",
              "Financial information (income, employment, assets, liabilities, bank account references for funding)",
              "Mortgage and property details (purchase price, property address, occupancy intent)",
              "Account credentials and security preferences",
              "Documents you upload (pay stubs, tax returns, identification, asset statements)",
              "Communications with our loan officers, underwriting, funding, closing, and support teams",
            ],
          },
        },
        {
          id: "information-automatic",
          title: "2.2 Information Collected Automatically",
          list: {
            items: [
              "Device and browser information, IP address, and general location derived from IP",
              "Platform usage data, including pages viewed, features accessed, and session timestamps",
              "Cookies and similar technologies as described in our Cookie Policy",
              "Log data related to authentication events, document uploads, and notification delivery",
            ],
          },
        },
        {
          id: "information-third-parties",
          title: "2.3 Information from Third Parties",
          paragraphs: [
            "With your authorization, we may obtain information from credit bureaus, employment verification vendors, identity verification providers, financial institutions involved in funding transfers, and public records sources relevant to mortgage underwriting.",
          ],
        },
      ],
    },
    {
      id: "how-we-use",
      title: "3. How We Use Information",
      list: {
        intro: "We use personal information to:",
        items: [
          "Process pre-qualification requests and mortgage applications",
          "Verify identity and evaluate creditworthiness and eligibility",
          "Operate funding accounts, track deposits, and support escrow-based closing workflows",
          "Provide dashboard status updates, in-platform notifications, and email communications",
          "Respond to customer support inquiries submitted through Ask Assistant or support channels",
          "Detect fraud, protect Platform security, and comply with legal and regulatory obligations",
          "Improve Platform functionality, user experience, and service quality",
          "Send service-related messages; marketing messages only where permitted and subject to your choices",
        ],
      },
    },
    {
      id: "legal-bases",
      title: "4. Legal Bases for Processing",
      paragraphs: [
        "We process personal information as necessary to perform our contract with you, comply with legal obligations (including mortgage lending and anti-money-laundering requirements), protect vital interests, and pursue legitimate business interests such as fraud prevention and service improvement, where those interests are not overridden by your rights.",
      ],
    },
    {
      id: "sharing",
      title: "5. How We Share Information",
      subsections: [
        {
          id: "service-providers",
          title: "5.1 Service Providers",
          paragraphs: [
            "We share information with vendors that help us operate the Platform, including cloud hosting, identity verification, document management, email delivery, analytics, and banking infrastructure partners. These providers are contractually required to use information only for authorized purposes.",
          ],
        },
        {
          id: "lending-partners",
          title: "5.2 Lending and Closing Partners",
          paragraphs: [
            "Information may be shared with underwriting teams, closing coordinators, escrow agents, title companies, appraisers, and other parties involved in evaluating or completing your mortgage transaction.",
          ],
        },
        {
          id: "legal-requirements",
          title: "5.3 Legal and Regulatory Disclosures",
          paragraphs: [
            "We may disclose information when required by law, regulation, court order, or government request, or when we believe disclosure is necessary to protect rights, safety, and Platform integrity.",
          ],
        },
        {
          id: "business-transfers",
          title: "5.4 Business Transfers",
          paragraphs: [
            "If Orbit Mortgage undergoes a merger, acquisition, or asset sale, personal information may be transferred as part of that transaction subject to appropriate confidentiality protections.",
          ],
        },
      ],
    },
    {
      id: "retention",
      title: "6. Data Retention",
      paragraphs: [
        "We retain personal information for as long as necessary to fulfill the purposes described in this Policy, including maintaining application records, funding account history, communication logs, and compliance documentation.",
        "Retention periods may extend beyond account closure where required by mortgage lending regulations, tax law, or legitimate legal defense needs.",
      ],
    },
    {
      id: "security",
      title: "7. Security",
      paragraphs: [
        "Orbit Mortgage implements administrative, technical, and physical safeguards designed to protect personal information, including encryption in transit, access controls, audit logging, and secure document storage.",
        "No method of transmission or storage is completely secure. You are responsible for safeguarding your account credentials and promptly reporting suspected unauthorized activity.",
      ],
    },
    {
      id: "your-rights",
      title: "8. Your Privacy Choices and Rights",
      paragraphs: [
        "Depending on your state of residence, you may have rights to access, correct, delete, or obtain a copy of certain personal information, as well as rights to opt out of certain processing activities such as targeted advertising or sale of personal information where applicable.",
        "To submit a privacy request, contact us using the details on our Contact Information page. We will verify your identity before fulfilling requests and respond within timeframes required by applicable law.",
        "You may manage cookie preferences as described in our Cookie Policy. You may also adjust certain notification settings within your dashboard where available.",
      ],
    },
    {
      id: "children",
      title: "9. Children's Privacy",
      paragraphs: [
        "The Platform is not directed to individuals under eighteen (18) years of age. We do not knowingly collect personal information from children.",
      ],
    },
    {
      id: "state-notices",
      title: "10. State-Specific Notices",
      paragraphs: [
        "Residents of certain U.S. states may have additional privacy rights under state law. Orbit Mortgage will honor applicable state privacy requirements and provide supplemental notices where required.",
        "If you are a California resident, you may have the right to know categories of information collected, request deletion subject to exceptions, and not receive discriminatory treatment for exercising privacy rights.",
      ],
    },
    {
      id: "international",
      title: "11. U.S.-Based Processing",
      paragraphs: [
        "Orbit Mortgage operates in the United States. If you access the Platform from outside the U.S., you understand that information may be processed and stored in the United States and subject to U.S. law.",
      ],
    },
    {
      id: "changes",
      title: "12. Changes to This Policy",
      paragraphs: [
        "We may update this Privacy Policy periodically. Material changes will be posted on the Platform with an updated \"Last Updated\" date. We encourage you to review this Policy regularly.",
      ],
    },
    {
      id: "contact",
      title: "13. Contact Us",
      paragraphs: [
        "Privacy-related questions and requests may be submitted through the contact channels listed at www.orbittmortgage.com/legal/contact-information.",
      ],
    },
  ],
};
