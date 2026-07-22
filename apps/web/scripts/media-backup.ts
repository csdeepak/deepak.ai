/**
 * Media backup (D-049 condition 2) — pull the ENTIRE R2 bucket to local disk.
 *
 * Media is never hostage to one vendor: this script downloads every object,
 * preserving its key as the on-disk path. Run it on any schedule you like; the
 * local copy is a complete, portable mirror (re-uploadable to any S3-compatible
 * store, since keys are preserved).
 *
 * Usage (from apps/web/):
 *   npm run media:backup                 # → ./media-backup/
 *   npm run media:backup -- ./somewhere  # → custom directory
 *
 * Requires R2 credentials in .env.local (see README → Media / R2 setup).
 * Self-contained (does not import the app's server-only storage module).
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config();

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
} from "@aws-sdk/client-s3";

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) {
    console.error(`✗ Missing ${name}. Set R2 credentials in .env.local.`);
    process.exit(1);
  }
  return v;
}

async function main() {
  const accountId = requireEnv("R2_ACCOUNT_ID");
  const bucket = requireEnv("R2_BUCKET");
  const client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: requireEnv("R2_ACCESS_KEY_ID"),
      secretAccessKey: requireEnv("R2_SECRET_ACCESS_KEY"),
    },
  });

  const outDir = resolve(process.argv[2] ?? "media-backup");
  console.log(`── Media backup → ${outDir} ──`);

  // List every key (paginated)
  const keys: string[] = [];
  let token: string | undefined;
  do {
    const res = await client.send(
      new ListObjectsV2Command({ Bucket: bucket, ContinuationToken: token }),
    );
    for (const obj of res.Contents ?? []) if (obj.Key) keys.push(obj.Key);
    token = res.IsTruncated ? res.NextContinuationToken : undefined;
  } while (token);

  if (keys.length === 0) {
    console.log("Bucket is empty. Nothing to back up.");
    process.exit(0);
  }

  let bytes = 0;
  for (const key of keys) {
    const res = await client.send(
      new GetObjectCommand({ Bucket: bucket, Key: key }),
    );
    const arr = await res.Body?.transformToByteArray();
    const buf = Buffer.from(arr ?? new Uint8Array());
    const dest = join(outDir, key);
    await mkdir(dirname(dest), { recursive: true });
    await writeFile(dest, buf);
    bytes += buf.length;
    console.log(`  ✓ ${key} (${(buf.length / 1024).toFixed(0)} KB)`);
  }

  console.log(
    `── Done: ${keys.length} object(s), ${(bytes / (1024 * 1024)).toFixed(1)} MB mirrored to ${outDir} ──`,
  );
  process.exit(0);
}

main().catch((err) => {
  console.error("Backup failed:", err);
  process.exit(1);
});
