#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return;
  const content = readFileSync(filePath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    if (!line || line.startsWith("#")) continue;
    const index = line.indexOf("=");
    if (index === -1) continue;
    const key = line.slice(0, index).trim();
    const value = line.slice(index + 1).trim();
    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(path.join(root, ".env.local"));

function getProjectRef() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const match = url.match(/https:\/\/([^.]+)\.supabase\.co/i);
  return match?.[1] ?? process.env.SUPABASE_PROJECT_REF ?? null;
}

function parsePoolerDatabaseUrl(rawUrl) {
  const trimmed = rawUrl.trim();
  const match = trimmed.match(
    /^postgresql:\/\/([^:]+):(.+)@(aws-[\w.-]+:\d+\/[^\s?#]+)$/i,
  );
  if (!match) {
    return null;
  }

  let password = match[2];
  try {
    password = decodeURIComponent(password);
  } catch {
    // Keep raw password when not percent-encoded.
  }

  return {
    user: match[1],
    password,
    hostPortPath: match[3],
  };
}

function normalizeDatabaseUrl(rawUrl) {
  const parsed = parsePoolerDatabaseUrl(rawUrl);
  if (!parsed) {
    return rawUrl.trim();
  }

  const user = encodeURIComponent(parsed.user);
  const password = encodeURIComponent(parsed.password);
  return `postgresql://${user}:${password}@${parsed.hostPortPath}`;
}

function buildDatabaseUrl() {
  const password = process.env.SUPABASE_DB_PASSWORD;
  const projectRef = getProjectRef();
  const host =
    process.env.SUPABASE_DB_HOST ??
    (projectRef ? `aws-0-us-east-1.pooler.supabase.com` : null);

  // Prefer building from the raw password — handles special characters reliably.
  if (password && projectRef && host) {
    const encodedPassword = encodeURIComponent(password);
    const port = process.env.SUPABASE_DB_PORT ?? "5432";
    return `postgresql://postgres.${projectRef}:${encodedPassword}@${host}:${port}/postgres`;
  }

  if (process.env.DATABASE_URL) {
    return normalizeDatabaseUrl(process.env.DATABASE_URL);
  }

  return null;
}

function getLocalMigrationVersions() {
  const dir = path.join(root, "supabase", "migrations");
  return readdirSync(dir)
    .filter((name) => name.endsWith(".sql"))
    .map((name) => name.split("_")[0])
    .sort();
}

/** Remote versions recorded in Supabase that don't exist in this repo. */
const REMOTE_ORPHAN_VERSIONS = [
  "20260608165257", "20260608165450", "20260608175643", "20260608181017",
  "20260608184426", "20260608185518", "20260608191358", "20260609025011",
  "20260609043450", "20260609074708", "20260609102333", "20260609112730",
  "20260609112822", "20260609120836", "20260609122109", "20260609131928",
  "20260609162543", "20260609163807", "20260609163821", "20260609163832",
  "20260609163834", "20260609181037", "20260611085114", "20260616102236",
  "20260616105216", "20260617102117", "20260618093749", "20260618152251",
  "20260618163018", "20260619133428", "20260619133502", "20260619133513",
  "20260619170921", "20260622121914", "20260629115159", "20260629151644",
  "20260630160809",
];

const PENDING_MIGRATION_VERSIONS = new Set([
  "20260710120000",
  "20260710120100",
]);

/** Renamed migrations whose schema already exists on remote — mark applied, do not re-run. */
const RENAMED_APPLIED_VERSIONS = [
  "20260701120100",
  "20260701120200",
  "20260701120300",
  "20260701120400",
];

function requireDatabaseUrl() {
  const dbUrl = buildDatabaseUrl();
  if (!dbUrl) {
    console.error("Missing database credentials in .env.local (see npm run db:push error output).");
    process.exit(1);
  }
  return dbUrl;
}

function runSupabase(args, options = {}) {
  const supabaseBin = path.join(root, "node_modules", "supabase", "dist", "supabase.js");
  if (!existsSync(supabaseBin)) {
    console.error("Supabase CLI is missing. Run:");
    console.error('  node --use-system-ca "C:\\Program Files\\nodejs\\node_modules\\npm\\bin\\npm-cli.js" install');
    process.exit(1);
  }

  const result = spawnSync(process.execPath, ["--use-system-ca", supabaseBin, ...args], {
    cwd: root,
    stdio: options.capture ? "pipe" : "inherit",
    encoding: options.capture ? "utf8" : undefined,
    env: {
      ...process.env,
      DO_NOT_TRACK: "1",
    },
  });

  if (options.capture) {
    if (result.stdout) process.stdout.write(result.stdout);
    if (result.stderr) process.stderr.write(result.stderr);
  }

  if (
    options.toleratePosthogShutdown &&
    result.status !== 0 &&
    `${result.stdout ?? ""}${result.stderr ?? ""}`.includes(
      "Timeout while shutting down PostHog",
    )
  ) {
    return { ...result, status: 0 };
  }

  return result;
}

const command = process.argv[2] ?? "push";

if (command === "link") {
  const projectRef = getProjectRef();
  const password = process.env.SUPABASE_DB_PASSWORD;

  if (!projectRef) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL in .env.local");
    process.exit(1);
  }

  if (!password) {
    console.error("Missing SUPABASE_DB_PASSWORD in .env.local");
    console.error("Get it from Supabase Dashboard → Project Settings → Database");
    process.exit(1);
  }

  const result = runSupabase([
    "link",
    "--project-ref",
    projectRef,
    "--password",
    password,
    "--yes",
  ]);

  process.exit(result.status ?? 1);
}

if (command === "sync-history") {
  const dbUrl = requireDatabaseUrl();

  console.log("Reverting remote-only migration records...");
  let result = runSupabase([
    "migration",
    "repair",
    "--status",
    "reverted",
    ...REMOTE_ORPHAN_VERSIONS,
    "--db-url",
    dbUrl,
    "--yes",
  ], { capture: true, toleratePosthogShutdown: true });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }

  const appliedVersions = getLocalMigrationVersions().filter(
    (version) => !PENDING_MIGRATION_VERSIONS.has(version),
  );

  console.log(`Marking ${appliedVersions.length} local migrations as applied...`);
  result = runSupabase([
    "migration",
    "repair",
    "--status",
    "applied",
    ...appliedVersions,
    "--db-url",
    dbUrl,
    "--yes",
  ], { capture: true, toleratePosthogShutdown: true });

  process.exit(result.status ?? 1);
}

if (command === "mark-renamed-applied") {
  const dbUrl = requireDatabaseUrl();
  console.log("Marking renamed duplicate migrations as applied...");
  const result = runSupabase([
    "migration",
    "repair",
    "--status",
    "applied",
    ...RENAMED_APPLIED_VERSIONS,
    "--db-url",
    dbUrl,
    "--yes",
  ], { capture: true, toleratePosthogShutdown: true });
  process.exit(result.status ?? 1);
}

if (command === "mark-multi-company-base-applied") {
  const dbUrl = requireDatabaseUrl();
  console.log("Marking base multi-company migration as applied (schema partially exists)...");
  const result = runSupabase([
    "migration",
    "repair",
    "--status",
    "applied",
    "20260710120000",
    "--db-url",
    dbUrl,
    "--yes",
  ], { capture: true, toleratePosthogShutdown: true });
  process.exit(result.status ?? 1);
}

if (command === "push") {
  const dbUrl = buildDatabaseUrl();
  const password = process.env.SUPABASE_DB_PASSWORD;
  const linkedRefPath = path.join(root, "supabase", ".temp", "project-ref");
  const isLinked = existsSync(linkedRefPath);

  let result;

  if (dbUrl) {
    result = runSupabase(["db", "push", "--db-url", dbUrl, "--yes"], {
      capture: true,
      toleratePosthogShutdown: true,
    });
  } else if (isLinked && password) {
    result = runSupabase(["db", "push", "--linked", "--password", password, "--yes"], {
      capture: true,
      toleratePosthogShutdown: true,
    });
  } else {
    console.error("Cannot push migrations automatically yet.");
    console.error("");
    console.error("Add ONE of these to .env.local:");
    console.error("");
    console.error("Option A (recommended):");
    console.error("  DATABASE_URL=postgresql://postgres.[ref]:[password]@[host]:6543/postgres");
    console.error("");
    console.error("Option B (best if password has @ # ! etc.):");
    console.error("  SUPABASE_DB_PASSWORD=your-database-password");
    console.error("  SUPABASE_DB_HOST=aws-0-eu-west-1.pooler.supabase.com");
    console.error("");
    console.error("Copy the connection string from:");
    console.error("Supabase Dashboard → Project Settings → Database → Connection string → URI");
    process.exit(1);
  }

  process.exit(result.status ?? 1);
}

if (command === "status") {
  const dbUrl = buildDatabaseUrl();
  const args = dbUrl
    ? ["migration", "list", "--db-url", dbUrl]
    : ["migration", "list", "--linked"];
  const result = runSupabase(args);
  process.exit(result.status ?? 1);
}

console.error(`Unknown command: ${command}`);
console.error("Usage: node scripts/db.mjs [link|push|status|sync-history]");
process.exit(1);
