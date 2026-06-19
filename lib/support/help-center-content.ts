import { ONBOARDING_STEP_FAQS } from "@/lib/onboarding/faq-content";
import type { SupportKnowledgeArticle } from "@/types/support";

export type HelpCenterFaqItem = {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
};

const ONBOARDING_FAQ_CATEGORY = "application_faqs";

export const ONBOARDING_FAQ_CATEGORY_LABEL = "Application & Pre-Qualification";

/** Flatten onboarding step FAQs for the dashboard Help Center. */
export function getOnboardingHelpCenterFaqs(): HelpCenterFaqItem[] {
  const items: HelpCenterFaqItem[] = [];

  for (const [step, faqs] of Object.entries(ONBOARDING_STEP_FAQS)) {
    for (const [index, faq] of faqs.entries()) {
      items.push({
        id: `onboarding-${step}-${index}`,
        title: faq.question,
        content: faq.answer,
        category: ONBOARDING_FAQ_CATEGORY,
        tags: ["onboarding", "application", step],
      });
    }
  }

  return items;
}

export function articleToHelpItem(article: SupportKnowledgeArticle): HelpCenterFaqItem {
  return {
    id: article.id,
    title: article.title,
    content: article.content,
    category: article.category,
    tags: article.tags,
  };
}

/** Merge DB articles + onboarding FAQs. FAQ category articles appear first. */
export function buildHelpCenterItems(
  articles: SupportKnowledgeArticle[],
): HelpCenterFaqItem[] {
  const fromDb = articles.map(articleToHelpItem);
  const onboarding = getOnboardingHelpCenterFaqs();

  const faqArticles = fromDb.filter((item) => item.category === "faq");
  const otherArticles = fromDb.filter((item) => item.category !== "faq");

  return [...faqArticles, ...onboarding, ...otherArticles];
}

export function groupHelpCenterItems(items: HelpCenterFaqItem[]) {
  const groups = new Map<string, HelpCenterFaqItem[]>();

  for (const item of items) {
    const list = groups.get(item.category) ?? [];
    list.push(item);
    groups.set(item.category, list);
  }

  const orderedCategories = [
    "faq",
    ONBOARDING_FAQ_CATEGORY,
    "getting_started",
    "applying_for_financing",
    "loan_status_tracking",
    "repayments",
    "wallet_management",
    "transactions",
    "document_uploads",
    "account_security",
  ];

  const entries: Array<[string, HelpCenterFaqItem[]]> = [];

  for (const category of orderedCategories) {
    const list = groups.get(category);
    if (list?.length) {
      entries.push([category, list]);
      groups.delete(category);
    }
  }

  for (const [category, list] of groups.entries()) {
    entries.push([category, list]);
  }

  return entries;
}

export function getHelpCategoryLabel(category: string): string {
  if (category === ONBOARDING_FAQ_CATEGORY) {
    return ONBOARDING_FAQ_CATEGORY_LABEL;
  }

  const labels: Record<string, string> = {
    getting_started: "Getting Started",
    applying_for_financing: "Applying For a Mortgage",
    loan_status_tracking: "Mortgage Status",
    repayments: "Repayments",
    wallet_management: "Funding Account",
    transactions: "Transactions",
    document_uploads: "Documents",
    account_security: "Account Security",
    faq: "Frequently Asked Questions",
  };

  return labels[category] ?? category;
}
