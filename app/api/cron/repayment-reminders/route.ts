import { NextResponse } from "next/server";

import {
  processRepaymentReminders,
  processRepaymentStatusMaintenance,
} from "@/lib/repayments/actions";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return NextResponse.json(
      { error: "Cron secret is not configured." },
      { status: 503 },
    );
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [statusResult, reminderResult] = await Promise.all([
    processRepaymentStatusMaintenance(),
    processRepaymentReminders(),
  ]);

  return NextResponse.json({
    ok: true,
    statusesUpdated: statusResult.updated,
    remindersSent: reminderResult.sent,
  });
}
