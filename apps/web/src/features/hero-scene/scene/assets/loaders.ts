/**
 * Loader configuration (docs/22 §11, docs/21 §11): Draco + Meshopt +
 * KTX2 support for the GLB pipeline. Decoders are self-hosted and
 * versioned with the app — never a third-party CDN (docs/21).
 *
 * Not exercised until the first real GLB arrives (manifest entries
 * are null in H-01); the contract is fixed now so asset integration
 * is a manifest edit, not an engineering task.
 *
 * TODO(assets): place decoder files under /public/loaders/draco/ and
 * wire KTX2 transcoder when the first textured GLB ships.
 */
export const DRACO_DECODER_PATH = "/loaders/draco/";
export const KTX2_TRANSCODER_PATH = "/loaders/basis/";

/**
 * Usage contract for future asset components (e.g. the Twin):
 *
 *   useGLTF(url, DRACO_DECODER_PATH)            // drei draco support
 *   useGLTF.preload(url, DRACO_DECODER_PATH)    // serial LOD prefetch
 *
 * Meshopt: drei's useGLTF accepts a meshopt decoder via its third
 * argument; import { MeshoptDecoder } from "three-stdlib" at the
 * consuming site (kept out of this chunk until a meshopt GLB exists —
 * no dead decoder bytes in the bundle).
 */
export const LOD_FETCH_ORDER = ["lod2", "lod1", "lod0"] as const;
