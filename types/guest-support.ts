export type GuestConcernStatus = "open" | "in_review" | "resolved" | "closed";

export type GuestSupportConcern = {
  id: string;
  referenceNumber: string;
  fullName: string;
  email: string;
  phone: string;
  concern: string;
  source: string;
  status: GuestConcernStatus;
  reviewedAt: string | null;
  reviewedBy: string | null;
  createdAt: string;
  updatedAt: string;
};

export type GuestConcernActionState = {
  error?: string;
  success?: string;
  referenceNumber?: string;
};
