/**
 * Cloudflare R2 storage client (D-049) — server-only.
 *
 * R2 is S3-compatible; we use the standard AWS S3 SDK pointed at the R2
 * endpoint. Credentials are read from the environment at call time (never at
 * module load) so `npm run build` stays green with no R2 configured.
 *
 * Env (see .env.example):
 *   R2_ACCOUNT_ID          - Cloudflare account id (endpoint host)
 *   R2_ACCESS_KEY_ID       - R2 API token access key
 *   R2_SECRET_ACCESS_KEY   - R2 API token secret
 *   R2_BUCKET              - bucket name
 *   MEDIA_PUBLIC_BASE_URL  - public origin for reads (r2.dev or custom domain)
 *
 * This module must never be imported by client components or (site) code.
 */

import "server-only";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  GetObjectCommand,
} from "@aws-sdk/client-s3";

export interface R2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
}

/** Read + validate R2 env. Throws an honest error if unconfigured. */
export function r2Config(): R2Config {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET;
  if (!accountId || !accessKeyId || !secretAccessKey || !bucket) {
    throw new Error(
      "Media storage is not configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, and R2_BUCKET (see README → Media / R2 setup).",
    );
  }
  return { accountId, accessKeyId, secretAccessKey, bucket };
}

export function isStorageConfigured(): boolean {
  try {
    r2Config();
    return true;
  } catch {
    return false;
  }
}

function client(cfg: R2Config): S3Client {
  return new S3Client({
    region: "auto",
    endpoint: `https://${cfg.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: cfg.accessKeyId,
      secretAccessKey: cfg.secretAccessKey,
    },
  });
}

/** Upload an object. Returns the storage key. */
export async function putObject(
  key: string,
  body: Buffer,
  contentType: string,
): Promise<string> {
  const cfg = r2Config();
  await client(cfg).send(
    new PutObjectCommand({
      Bucket: cfg.bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );
  return key;
}

/** Delete an object by key (idempotent). */
export async function deleteObject(key: string): Promise<void> {
  const cfg = r2Config();
  await client(cfg).send(
    new DeleteObjectCommand({ Bucket: cfg.bucket, Key: key }),
  );
}

/** List every object key in the bucket (paginated). Used by the backup script. */
export async function listAllKeys(): Promise<string[]> {
  const cfg = r2Config();
  const c = client(cfg);
  const keys: string[] = [];
  let token: string | undefined;
  do {
    const res = await c.send(
      new ListObjectsV2Command({
        Bucket: cfg.bucket,
        ContinuationToken: token,
      }),
    );
    for (const obj of res.Contents ?? []) {
      if (obj.Key) keys.push(obj.Key);
    }
    token = res.IsTruncated ? res.NextContinuationToken : undefined;
  } while (token);
  return keys;
}

/** Fetch an object's bytes (used by the backup script). */
export async function getObjectBytes(key: string): Promise<Buffer> {
  const cfg = r2Config();
  const res = await client(cfg).send(
    new GetObjectCommand({ Bucket: cfg.bucket, Key: key }),
  );
  const bytes = await res.Body?.transformToByteArray();
  return Buffer.from(bytes ?? new Uint8Array());
}
