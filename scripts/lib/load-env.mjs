import { readFile } from "node:fs/promises";
import path from "node:path";

/**
 * Load `.env.local` then `.env` into `process.env` without overwriting
 * variables already set in the shell.
 *
 * @param {string} root Repo root.
 */
export async function loadEnv(root) {
  for (const name of [".env.local", ".env"]) {
    let text;
    try {
      text = await readFile(path.join(root, name), "utf8");
    } catch {
      continue;
    }
    for (const line of text.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const index = trimmed.indexOf("=");
      if (index < 0) continue;
      const key = trimmed.slice(0, index).trim();
      let value = trimmed.slice(index + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (process.env[key] === undefined) process.env[key] = value;
    }
  }
}
