import type { LegalDocument } from "@/lib/legal/types";

export const fairLendingStatement: LegalDocument = {
  slug: "fair-lending-statement",
  title: "Fair Lending Statement",
  shortDescription:
    "Orbit Mortgage commitment to equal access, fair treatment, and compliance with U.S. fair lending laws.",
  lastUpdated: "June 19, 2026",
  sections: [
    {
      id: "commitment",
      title: "1. Our Commitment",
      paragraphs: [
        "Orbit Mortgage is committed to fair lending and equal access to credit. We provide mortgage products and services without unlawful discrimination based on race, color, religion, national origin, sex (including sexual orientation and gender identity), marital status, age, familial status, disability, receipt of public assistance, or exercise of rights under consumer credit protection laws.",
        "This commitment applies to every stage of the mortgage process available through our Platform, including marketing, pre-qualification, application intake, underwriting, pricing, funding account requirements, closing coordination, and customer support.",
      ],
    },
    {
      id: "applicable-laws",
      title: "2. Applicable Fair Lending Laws",
      paragraphs: [
        "Orbit Mortgage complies with federal fair lending laws and regulations, including:",
      ],
      list: {
        items: [
          "Equal Credit Opportunity Act (ECOA) and Regulation B",
          "Fair Housing Act (FHA)",
          "Home Mortgage Disclosure Act (HMDA), where applicable to our lending activity",
          "State and local anti-discrimination and fair lending requirements",
        ],
      },
    },
    {
      id: "equal-access",
      title: "3. Equal Access to the Platform",
      paragraphs: [
        "We design our digital mortgage experience to provide consistent access to application tools, dashboard features, document upload capabilities, and support channels regardless of protected characteristics.",
        "Automated decision tools, where used, are subject to human review, compliance monitoring, and periodic validation to identify and mitigate disparate impact or unfair outcomes.",
      ],
    },
    {
      id: "pricing-terms",
      title: "4. Pricing and Terms",
      paragraphs: [
        "Loan pricing, fees, and terms are based on objective financial factors such as creditworthiness, loan-to-value ratio, property type, occupancy, product selection, and market conditions—not on prohibited personal characteristics.",
        "Employees and authorized partners may not steer applicants toward or away from products based on protected characteristics.",
      ],
    },
    {
      id: "marketing",
      title: "5. Marketing and Communications",
      paragraphs: [
        "Orbit Mortgage marketing materials and email communications are intended to describe services accurately and to reach eligible audiences without unlawful targeting or exclusion based on protected characteristics.",
        "We prohibit the use of demographic data to exclude eligible communities from mortgage opportunities where such use would violate fair lending principles.",
      ],
    },
    {
      id: "support",
      title: "6. Customer Support and Accessibility",
      paragraphs: [
        "Customer support channels—including Ask Assistant, support tickets, and department communications—are available to assist applicants and customers in completing the mortgage process.",
        "We strive to provide reasonable accommodations for individuals with disabilities and to communicate in a clear, respectful manner. If you require an accommodation, please contact us using the information on our Contact Information page.",
      ],
    },
    {
      id: "complaints",
      title: "7. Fair Lending Concerns and Complaints",
      paragraphs: [
        "If you believe you have experienced unlawful discrimination in connection with an Orbit Mortgage product or service, please contact us promptly. We take fair lending concerns seriously and will review reports in accordance with our compliance procedures.",
        "You may also file a complaint with applicable regulatory agencies, including the Consumer Financial Protection Bureau (CFPB) and the U.S. Department of Housing and Urban Development (HUD), without retaliation for exercising your rights.",
      ],
    },
    {
      id: "training-oversight",
      title: "8. Training and Oversight",
      paragraphs: [
        "Orbit Mortgage maintains fair lending training, monitoring, and audit practices designed to promote compliance across origination, operations, and customer-facing teams.",
        "We periodically review application data, decision outcomes, and customer feedback to identify potential fair lending risks and implement corrective action when necessary.",
      ],
    },
    {
      id: "equal-housing",
      title: "9. Equal Housing Lender",
      paragraphs: [
        "Orbit Mortgage supports the principle of equal housing opportunity. We are committed to helping qualified borrowers access mortgage financing in a fair and transparent manner.",
      ],
    },
    {
      id: "contact",
      title: "10. Contact",
      paragraphs: [
        "Fair lending questions or complaints may be submitted through www.orbittmortgage.com/legal/contact-information.",
      ],
    },
  ],
};
