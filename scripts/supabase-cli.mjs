#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
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

const supabaseBin = path.join(
  root,
  "node_modules",
  "supabase",
  "dist",
  "supabase.js",
);

if (!existsSync(supabaseBin)) {
  console.error("Supabase CLI is not installed. Run: npm install");
  process.exit(1);
}

const args = process.argv.slice(2);
const result = spawnSync(process.execPath, ["--use-system-ca", supabaseBin, ...args], {
  cwd: root,
  stdio: "inherit",
  env: process.env,
});

process.exit(result.status ?? 1);
