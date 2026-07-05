/**
 * Asset manifest (docs/22 §11): versioned CDN URLs as data — asset
 * revisions deploy without code changes. All entries are null until
 * the Blender pipeline (docs/21) delivers; consumers must handle null
 * (placeholder stand-ins render instead — the swap contract).
 */

const CDN_BASE = process.env.NEXT_PUBLIC_HERO_ASSET_BASE ?? "/hero-assets";

export const HERO_ASSET_VERSION = "v0";

interface HeroAssetManifest {
  /** Progressive LOD order: lod2 (silhouette) loads first. */
  twin: { lod2: string | null; lod1: string | null; lod0: string | null };
  bench: string | null;
  /** Baked camera rail (docs/21 §13). Null = code-authored stand-in rail. */
  camRail: string | null;
}

export const heroAssets: HeroAssetManifest = {
  twin: { lod2: null, lod1: null, lod0: null },
  bench: null,
  camRail: null,
};

/** Resolve a manifest path to a full versioned URL. */
export function assetUrl(path: string): string {
  return `${CDN_BASE}/${HERO_ASSET_VERSION}/${path}`;
}
