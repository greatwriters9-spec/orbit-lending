import type { LegalDocument } from "@/lib/legal/types";

export const cookiePolicy: LegalDocument = {
  slug: "cookie-policy",
  title: "Cookie Policy",
  shortDescription:
    "How Orbit Mortgage uses cookies and similar technologies on its website and customer platform.",
  lastUpdated: "June 19, 2026",
  sections: [
    {
      id: "introduction",
      title: "1. Introduction",
      paragraphs: [
        "This Cookie Policy explains how Orbit Mortgage uses cookies, local storage, pixels, and similar technologies (collectively, \"cookies\") when you visit www.orbittmortgage.com or use our secure customer dashboard.",
        "This Policy should be read together with our Privacy Policy and Terms of Use.",
      ],
    },
    {
      id: "what-are-cookies",
      title: "2. What Are Cookies?",
      paragraphs: [
        "Cookies are small text files placed on your device by a website. They help websites remember preferences, maintain secure sessions, and understand how features are used.",
        "Cookies may be \"session\" cookies (deleted when you close your browser) or \"persistent\" cookies (stored until they expire or you delete them).",
      ],
    },
    {
      id: "how-we-use",
      title: "3. How Orbit Mortgage Uses Cookies",
      subsections: [
        {
          id: "essential",
          title: "3.1 Strictly Necessary Cookies",
          paragraphs: [
            "These cookies are required for core Platform functionality and cannot be disabled through our cookie tools without affecting your ability to use essential services.",
          ],
          list: {
            items: [
              "Authentication and session management for login and dashboard access",
              "Security tokens that help prevent cross-site request forgery and unauthorized access",
              "Load balancing and infrastructure reliability",
              "Preservation of application progress during onboarding and mortgage workflows",
            ],
          },
        },
        {
          id: "functional",
          title: "3.2 Functional Cookies",
          list: {
            items: [
              "Remembering display preferences and form inputs during a session",
              "Supporting document upload workflows and dashboard navigation state",
              "Enabling customer support chat and Ask Assistant session continuity",
            ],
          },
        },
        {
          id: "analytics",
          title: "3.3 Analytics Cookies",
          paragraphs: [
            "We may use analytics cookies to understand aggregate usage patterns, measure feature performance, and improve the mortgage application experience. Analytics data is generally aggregated and does not directly identify you unless combined with other information.",
          ],
        },
        {
          id: "marketing",
          title: "3.4 Marketing Cookies",
          paragraphs: [
            "Where permitted by law, marketing cookies may help us measure campaign effectiveness and deliver relevant content. You may opt out of non-essential marketing cookies through browser settings or any cookie preference tool we provide.",
          ],
        },
      ],
    },
    {
      id: "third-party",
      title: "4. Third-Party Cookies",
      paragraphs: [
        "Some cookies are placed by service providers that support identity verification, email delivery, analytics, and banking infrastructure integrated with the Platform. These providers may collect information according to their own policies.",
        "Orbit Mortgage does not control third-party cookies and encourages you to review the privacy practices of relevant providers.",
      ],
    },
    {
      id: "choices",
      title: "5. Your Choices",
      list: {
        intro: "You can manage cookies in several ways:",
        items: [
          "Use browser settings to block or delete cookies",
          "Adjust cookie preferences through any consent banner or settings panel we provide",
          "Disable non-essential cookies while continuing to use core mortgage services that require essential cookies",
        ],
      },
      closingParagraphs: [
        "If you block essential cookies, certain features—including secure login, dashboard access, document uploads, and funding account visibility—may not function properly.",
      ],
    },
    {
      id: "do-not-track",
      title: "6. Do Not Track Signals",
      paragraphs: [
        "Some browsers transmit \"Do Not Track\" signals. Because industry standards for responding to these signals are not uniform, Orbit Mortgage does not currently respond to Do Not Track signals in a standardized way. You may still manage cookies through the methods described above.",
      ],
    },
    {
      id: "updates",
      title: "7. Updates to This Policy",
      paragraphs: [
        "We may update this Cookie Policy to reflect changes in technology, regulation, or Platform features. The \"Last Updated\" date at the top of this page indicates when the Policy was last revised.",
      ],
    },
    {
      id: "contact",
      title: "8. Contact",
      paragraphs: [
        "Questions about this Cookie Policy may be directed to Orbit Mortgage through www.orbittmortgage.com/legal/contact-information.",
      ],
    },
  ],
};
