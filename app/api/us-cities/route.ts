import { NextResponse, type NextRequest } from "next/server";

import { searchUsCities } from "@/lib/auth/us-cities";

export async function GET(request: NextRequest) {
  const state = request.nextUrl.searchParams.get("state")?.trim() ?? "";
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (!/^[A-Za-z]{2}$/.test(state)) {
    return NextResponse.json({ cities: [] });
  }

  const cities = searchUsCities(state, query);
  return NextResponse.json({ cities });
}
