import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { fetchTransactionTimeline } from "@/lib/transactions/queries";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: tx } = await supabase
    .from("platform_transactions")
    .select("borrower_id")
    .eq("id", id)
    .maybeSingle();

  if (!tx) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const isFinance =
    profile?.role === "finance_officer" ||
    profile?.role === "admin" ||
    profile?.role === "super_admin";

  if (tx.borrower_id !== user.id && !isFinance) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const timeline = await fetchTransactionTimeline(id);
  return NextResponse.json({ timeline });
}
