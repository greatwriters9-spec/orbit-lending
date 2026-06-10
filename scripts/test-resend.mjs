import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnv() {
  const envPath = resolve(process.cwd(), ".env.local");
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    process.env[key] = value;
  }
}

loadEnv();

const key = process.env.RESEND_API_KEY;
const from =
  process.argv.includes("--from")
    ? process.argv[process.argv.indexOf("--from") + 1]
    : process.env.EMAIL_FROM ?? "Orbit Lending <onboarding@resend.dev>";
const toArg = process.argv.find(
  (a, i) => a.includes("@") && !a.startsWith("--") && process.argv[i - 1] !== "--from",
);
const to = toArg ?? "client@orbitlending.com";

if (!key) {
  console.error("RESEND_API_KEY missing");
  process.exit(1);
}

const testOverride = process.env.RESEND_TEST_TO?.trim();
const effectiveTo = testOverride ?? to;
const subject = testOverride
  ? `[DEV → ${to}] Orbit Lending — Resend test`
  : "Orbit Lending — Resend test";

console.log("From:", from);
console.log("To:", effectiveTo, testOverride ? `(intended: ${to})` : "");

const response = await fetch("https://api.resend.com/emails", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    from,
    to: [effectiveTo],
    subject,
    html: "<p>If you received this, Resend is configured correctly.</p>",
    text: "If you received this, Resend is configured correctly.",
  }),
});

const body = await response.text();
console.log("Status:", response.status);
console.log("Response:", body);
