/**
 * Seeds development test accounts for all supported roles.
 *
 * Usage:
 *   npm run seed:dev-users
 *
 * Requires in .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const DEV_PASSWORD = "OrbitLending123!";

const DEV_USERS = [
  {
    email: "client@orbitlending.com",
    role: "client",
    firstName: "Client",
    lastName: "User",
    portal: "/dashboard",
  },
  {
    email: "finance@orbitlending.com",
    role: "finance_officer",
    firstName: "John",
    lastName: "Smith",
    portal: "/finance",
  },
  {
    email: "admin@orbitlending.com",
    role: "admin",
    firstName: "Jane",
    lastName: "Doe",
    portal: "/admin",
  },
  {
    email: "superadmin@orbitlending.com",
    role: "super_admin",
    firstName: "Michael",
    lastName: "Brown",
    portal: "/super-admin",
  },
];

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

async function upsertDevUser(account) {
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existing = existingUsers?.users?.find((u) => u.email === account.email);

  let userId = existing?.id;

  if (existing) {
    await supabase.auth.admin.updateUserById(existing.id, {
      password: DEV_PASSWORD,
      email_confirm: true,
      user_metadata: {
        first_name: account.firstName,
        last_name: account.lastName,
      },
    });
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email: account.email,
      password: DEV_PASSWORD,
      email_confirm: true,
      user_metadata: {
        first_name: account.firstName,
        last_name: account.lastName,
      },
    });

    if (error || !data.user) {
      throw new Error(`Failed to create ${account.email}: ${error?.message}`);
    }

    userId = data.user.id;
  }

  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      id: userId,
      email: account.email,
      first_name: account.firstName,
      last_name: account.lastName,
      role: account.role,
      profile_status: "complete",
      country: "US",
    },
    { onConflict: "id" },
  );

  if (profileError) {
    throw new Error(`Failed to update profile for ${account.email}: ${profileError.message}`);
  }

  return account;
}

async function seedDevUsers() {
  console.log("Seeding development test accounts...\n");

  for (const account of DEV_USERS) {
    await upsertDevUser(account);
    console.log(`✓ ${account.email} (${account.role}) → ${account.portal}`);
  }

  console.log("\nAll development accounts ready.");
  console.log(`Shared password: ${DEV_PASSWORD}`);
}

seedDevUsers().catch((err) => {
  console.error(err);
  process.exit(1);
});
