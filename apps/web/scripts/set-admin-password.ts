/**
 * Generates a new ADMIN_PASSWORD_HASH for the admin CMS (docs/27 §4, D-047).
 *
 * There is no password-reset flow by design: `loginAction` simply bcrypt-compares
 * the submitted password against the ADMIN_PASSWORD_HASH env var. Resetting the
 * password therefore means generating a new hash and replacing that variable.
 *
 *   npm run admin:password --workspace=web
 *
 * Prompts for the passphrase with echo off and prints only the resulting hash,
 * so the plaintext never lands in shell history, scrollback, or a file — which
 * is why this exists rather than the `node -e "...hash('yourPassphrase')"`
 * one-liner in .env.example.
 *
 * The hash it prints is safe to paste around; it is not the password.
 */

import { createInterface } from "node:readline";
import { Writable } from "node:stream";
import { hash } from "bcryptjs";

/** Matches the cost factor documented in .env.example. */
const COST = 12;
const MIN_LENGTH = 12;

function prompt(question: string, hidden = false): Promise<string> {
  return new Promise((resolve) => {
    let muted = false;

    const output = new Writable({
      write(chunk, encoding, callback) {
        if (!muted) process.stdout.write(chunk, encoding as BufferEncoding);
        callback();
      },
    });

    const rl = createInterface({ input: process.stdin, output, terminal: true });
    rl.question(question, (answer) => {
      rl.close();
      if (hidden) process.stdout.write("\n");
      resolve(answer);
    });

    // Set after question() so the prompt itself is still printed.
    muted = hidden;
  });
}

async function main() {
  if (!process.stdin.isTTY) {
    console.error(
      "This script needs an interactive terminal so the passphrase is never echoed.\n" +
        "Run it directly: npm run admin:password --workspace=web",
    );
    process.exit(1);
  }

  console.log("Set a new Deepak Labs admin passphrase.\n");

  const passphrase = await prompt("New passphrase: ", true);
  const confirmation = await prompt("Confirm passphrase: ", true);

  if (passphrase !== confirmation) {
    console.error("✗ Passphrases do not match. Nothing changed.");
    process.exit(1);
  }

  if (passphrase.length < MIN_LENGTH) {
    console.error(`✗ Use at least ${MIN_LENGTH} characters. Nothing changed.`);
    process.exit(1);
  }

  const passwordHash = await hash(passphrase, COST);

  // Next.js runs dotenv-expand over .env files, so an unescaped "$" is read as
  // a variable reference: "$2b$12$abc..." expands to garbage and login silently
  // fails with "Incorrect credentials". Quoting does NOT protect it — only
  // backslash-escaping does (verified across raw/single/double/escaped forms,
  // 2026-07-31). Always emit the escaped form for .env files.
  const escaped = passwordHash.split("$").join("\\$");

  console.log("Add this line to apps/web/.env.local, replacing any existing");
  console.log("ADMIN_PASSWORD_HASH, then restart the dev server:\n");
  console.log(`ADMIN_PASSWORD_HASH=${escaped}\n`);
  console.log("The backslashes are required — Next strips unescaped $ signs.");
  console.log("Copy the line exactly as shown, and do not add quotes.\n");
  console.log("For production (Render), paste the UNESCAPED hash instead —");
  console.log("dashboard env vars are stored literally, not parsed as .env:\n");
  console.log(`${passwordHash}\n`);
}

void main();
