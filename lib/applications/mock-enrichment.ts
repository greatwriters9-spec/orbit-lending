import { buildProgressSteps } from "@/lib/applications/status-utils";
import type {
  ApplicationDetail,
  ApplicationMessage,
  ApplicationStatusEntry,
  DocumentRequest,
  LoanOffer,
} from "@/types/application-details";

export function enrichApplicationDetail(
  base: Omit<
    ApplicationDetail,
    "progressSteps" | "statusHistory" | "messages" | "documentRequests" | "offers"
  >,
  existing?: {
    statusHistory?: ApplicationStatusEntry[];
    messages?: ApplicationMessage[];
    documentRequests?: DocumentRequest[];
    offers?: LoanOffer[];
  },
): ApplicationDetail {
  return {
    ...base,
    progressSteps: buildProgressSteps(base.status),
    statusHistory: existing?.statusHistory ?? [],
    messages: existing?.messages ?? [],
    documentRequests: existing?.documentRequests ?? [],
    offers: existing?.offers ?? [],
  };
}
