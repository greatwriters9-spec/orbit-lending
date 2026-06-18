import { createClient } from "@/lib/supabase/server";
import type { GuestSupportConcern } from "@/types/guest-support";

function mapGuestConcern(row: Record<string, unknown>): GuestSupportConcern {
  return {
    id: row.id as string,
    referenceNumber: row.reference_number as string,
    fullName: row.full_name as string,
    email: row.email as string,
    phone: row.phone as string,
    concern: row.concern as string,
    source: row.source as string,
    status: row.status as GuestSupportConcern["status"],
    reviewedAt: (row.reviewed_at as string | null) ?? null,
    reviewedBy: (row.reviewed_by as string | null) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export async function fetchGuestSupportConcerns(): Promise<GuestSupportConcern[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("guest_support_concerns")
    .select("*")
    .order("created_at", { ascending: false });

  return (data ?? []).map((row) => mapGuestConcern(row));
}

export async function countOpenGuestConcerns(): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("guest_support_concerns")
    .select("id", { count: "exact", head: true })
    .eq("status", "open");

  return count ?? 0;
}
