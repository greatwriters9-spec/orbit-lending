export type OnboardingFaqItem = {
  question: string;
  answer: string;
};

export type OnboardingStepKey =
  | "home-found"
  | "purchase-timeline"
  | "buying-stage"
  | "target-location"
  | "target-price"
  | "property-use-search"
  | "property-address"
  | "purchase-price"
  | "property-type"
  | "property-use-found"
  | "mortgage-preferences"
  | "about-you"
  | "contact"
  | "current-address"
  | "employment"
  | "assets"
  | "credit"
  | "create-account";

export const ONBOARDING_STEP_FAQS: Record<OnboardingStepKey, OnboardingFaqItem[]> = {
  "home-found": [
    {
      question: "Why do you ask if I've found a home?",
      answer:
        "This helps us tailor your pre-qualification. If you've found a property, we can use the actual address and purchase price. If you're still searching, we estimate based on your target area and budget.",
    },
  ],
  "purchase-timeline": [
    {
      question: "Why does my timeline matter?",
      answer:
        "Your purchase timeline helps us recommend the right mortgage program and set realistic expectations for underwriting, appraisal, and closing.",
    },
  ],
  "buying-stage": [
    {
      question: "Why do you ask about my buying stage?",
      answer:
        "Knowing whether you're just starting or ready to make an offer helps our team prioritize your application and provide relevant guidance.",
    },
  ],
  "target-location": [
    {
      question: "Why do you need my target location?",
      answer:
        "Property location affects loan limits, taxes, insurance estimates, and eligibility for certain programs. It also helps us estimate your purchasing power in that market.",
    },
  ],
  "target-price": [
    {
      question: "Why do you ask for a target home price?",
      answer:
        "Your target price is used to calculate an estimated mortgage amount, down payment, and monthly payment for your pre-qualification letter.",
    },
  ],
  "property-use-search": [
    {
      question: "Why does property use affect my mortgage?",
      answer:
        "Primary residences, vacation homes, and investment properties have different rates, down payment requirements, and underwriting guidelines.",
    },
  ],
  "property-address": [
    {
      question: "Why do you need the property address?",
      answer:
        "The address confirms the property location for appraisal, title, and compliance checks. It also helps us calculate taxes and insurance more accurately.",
    },
  ],
  "purchase-price": [
    {
      question: "Why is the purchase price important?",
      answer:
        "The agreed purchase price determines your loan amount, down payment, and monthly payment. It's a core input for your pre-qualification.",
    },
  ],
  "property-type": [
    {
      question: "Why do you ask about property type?",
      answer:
        "Single-family homes, condos, and multi-family properties have different lending rules, insurance requirements, and approval criteria.",
    },
  ],
  "property-use-found": [
    {
      question: "Why does occupancy type matter?",
      answer:
        "How you plan to use the property affects your interest rate, required down payment, and the documentation we may request during underwriting.",
    },
  ],
  "mortgage-preferences": [
    {
      question: "How do down payment and term affect my estimate?",
      answer:
        "Your down payment percentage and mortgage term help us calculate a personalized pre-qualification amount, estimated monthly payment, and interest rate. Larger down payments may qualify for lower rates.",
    },
  ],
  "about-you": [
    {
      question: "Why do you need my personal information?",
      answer:
        "Federal lending regulations require us to verify your identity. Your name and date of birth are used for credit and background checks during approval.",
    },
  ],
  contact: [
    {
      question: "Why do you need my contact details?",
      answer:
        "We use your email and phone to send application updates, document requests, and closing instructions. You'll always know where your mortgage stands.",
    },
  ],
  "current-address": [
    {
      question: "Why do you ask for my current address?",
      answer:
        "Your current residence helps verify identity and establish residency history, which lenders review as part of the approval process.",
    },
  ],
  employment: [
    {
      question: "Why is employment information required?",
      answer:
        "Stable income is essential for mortgage approval. We use your employment details to estimate how much you can comfortably borrow and repay.",
    },
  ],
  assets: [
    {
      question: "Why do you ask about my assets?",
      answer:
        "Assets show your ability to cover the down payment, closing costs, and reserves after closing — all key factors in underwriting.",
    },
  ],
  credit: [
    {
      question: "Why do you need my SSN and credit information?",
      answer:
        "A soft credit review helps us provide an accurate pre-qualification. Your information is encrypted and used only for mortgage eligibility purposes.",
    },
  ],
  "create-account": [
    {
      question: "Why do I need to create an account?",
      answer:
        "Your account lets you securely view your pre-qualification results, track your application, upload documents when requested, and message your loan team.",
    },
    {
      question: "Is my pre-qualification information saved?",
      answer:
        "Yes. Everything you entered during onboarding is saved to your profile so you can pick up right where you left off after signing in.",
    },
  ],
};
