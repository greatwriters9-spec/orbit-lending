/**
 * Seeds a development finance officer account.
 *
 * Usage:
 *   npm run seed:finance-officer
 *
 * Requires in .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const FINANCE_EMAIL = "finance@orbitlending.com";
const FINANCE_PASSWORD = "FinanceOfficer123!";
const FINANCE_ROLE = "finance_officer";

function loadEnv() {
  const envPath = resolve(process.cwd(), ".env.local");
  if (!existsSync(envPath)) return;

  const contents = readFileSync(envPath, "utf8");
  for (const line of contents.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local",
  );
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function seedFinanceOfficer() {
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existing = existingUsers?.users?.find((u) => u.email === FINANCE_EMAIL);

  let userId = existing?.id;

  if (existing) {
    console.log(`User ${FINANCE_EMAIL} already exists — updating profile role.`);
    await supabase.auth.admin.updateUserById(existing.id, {
      password: FINANCE_PASSWORD,
      email_confirm: true,
      user_metadata: {
        first_name: "Finance",
        last_name: "Officer",
      },
    });
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email: FINANCE_EMAIL,
      password: FINANCE_PASSWORD,
      email_confirm: true,
      user_metadata: {
        first_name: "Finance",
        last_name: "Officer",
      },
    });

    if (error || !data.user) {
      console.error("Failed to create user:", error?.message);
      process.exit(1);
    }

    userId = data.user.id;
    console.log(`Created user ${FINANCE_EMAIL}`);
  }

  if (!userId) {
    console.error("Could not resolve user ID.");
    process.exit(1);
  }

  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      id: userId,
      email: FINANCE_EMAIL,
      first_name: "Finance",
      last_name: "Officer",
      role: FINANCE_ROLE,
      profile_status: "complete",
      country: "US",
    },
    { onConflict: "id" },
  );

  if (profileError) {
    console.error("Failed to update profile:", profileError.message);
    process.exit(1);
  }

  console.log("\nFinance officer account ready:");
  console.log(`  Email:    ${FINANCE_EMAIL}`);
  console.log(`  Password: ${FINANCE_PASSWORD}`);
  console.log(`  Role:     ${FINANCE_ROLE}`);
  console.log(`  Login →   /finance`);
}

seedFinanceOfficer().catch((err) => {
  console.error(err);
  process.exit(1);
});
