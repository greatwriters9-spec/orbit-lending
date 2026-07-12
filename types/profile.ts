export type ProfileStatus = "incomplete" | "complete" | "verified";

export type AccountStatus =
  | "active"
  | "under_review"
  | "restricted"
  | "on_hold"
  | "suspended"
  | "closed";

export type UserRole = "client" | "finance_officer" | "admin" | "super_admin";

export type UserProfile = {
  id: string;
  email: string;
  first_name: string | null;
  middle_name: string | null;
  last_name: string | null;
  phone: string | null;
  country: string | null;
  state: string | null;
  city: string | null;
  address: string | null;
  zip_code: string | null;
  date_of_birth: string | null;
  profile_status: ProfileStatus;
  role: UserRole;
  account_status: AccountStatus;
  account_status_reason: string | null;
  account_status_changed_at: string | null;
  account_status_changed_by: string | null;
  avatar_url: string | null;
  company_id: string | null;
  created_at: string;
  updated_at: string;
};
