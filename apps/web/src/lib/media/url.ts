/**
 * Media URL derivation (D-049 / docs/28 §2.1).
 *
 * The public URL is derived at read time from the storage key + a base URL held
 * in the environment — never persisted. This is what keeps media portable: the
 * bucket, CDN, or vendor can change with a single env value and zero data
 * migration (D-013 / D-012 no-lock-in).
 *
 * MEDIA_PUBLIC_BASE_URL is the public origin for the R2 bucket (or its custom
 * domain / CDN), e.g. https://media.deepaklabs.dev or the r2.dev URL. It is a
 * public value (not a secret) — the bucket serves published assets.
 */

export function mediaBaseUrl(): string {
  return (process.env.MEDIA_PUBLIC_BASE_URL ?? "").replace(/\/+$/, "");
}

/** Absolute public URL for a stored object. Empty base → the raw key (dev). */
export function mediaPublicUrl(storageKey: string): string {
  const base = mediaBaseUrl();
  const key = storageKey.replace(/^\/+/, "");
  return base ? `${base}/${key}` : `/${key}`;
}
