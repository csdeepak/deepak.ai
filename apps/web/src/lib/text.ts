/**
 * Typography normalization for text that arrives from outside the site.
 *
 * The problem, measured on the live landing page: 263 characters from the
 * Unicode Mathematical Alphanumeric Symbols block (U+1D400–U+1D7FF) — the
 * "𝗳𝗮𝗸𝗲 𝗯𝗼𝗹𝗱" that social platforms popularised, pasted in with the LinkedIn
 * posts. It looks like bold. It is not bold. It is a separate set of
 * codepoints meant for mathematical notation, and using it as styling breaks
 * three things at once:
 *
 *   · Screen readers announce each character by its Unicode name — "𝗯𝘂𝗶𝗹𝘁"
 *     is read as four separate mathematical-symbol names, not the word
 *     "built". A sentence of it is unintelligible.
 *   · Search engines index the codepoints, not the words. A post about
 *     "𝗽𝗿𝗼𝗺𝗽𝘁 𝗲𝗻𝗴𝗶𝗻𝗲𝗲𝗿𝗶𝗻𝗴" does not match a search for prompt engineering,
 *     so the writing is invisible to exactly the people meant to find it.
 *   · Copy-paste and in-page search (Ctrl+F for "built") both fail.
 *
 * The fix is to map it back to ASCII on the way out to the public site. The
 * owner's stored text is untouched — the admin editor reads the database
 * directly, never through `contentService` — so what they pasted is still
 * what they see when they edit, and this can be removed at any time without
 * data loss.
 *
 * Emphasis that should *be* emphasis belongs in markdown (`**bold**`), which
 * the post body already renders into real `<strong>`.
 */

/**
 * Contiguous runs in the Mathematical Alphanumeric Symbols block, as
 * [firstCodepoint, length, asciiStart] triples. Each run maps 1:1 onto
 * A–Z, a–z or 0–9 in order.
 */
const MATH_RUNS: ReadonlyArray<readonly [number, number, string]> = [
  [0x1d400, 26, "A"], [0x1d41a, 26, "a"], // bold
  [0x1d434, 26, "A"], [0x1d44e, 26, "a"], // italic
  [0x1d468, 26, "A"], [0x1d482, 26, "a"], // bold italic
  [0x1d49c, 26, "A"], [0x1d4b6, 26, "a"], // script
  [0x1d4d0, 26, "A"], [0x1d4ea, 26, "a"], // bold script
  [0x1d504, 26, "A"], [0x1d51e, 26, "a"], // fraktur
  [0x1d538, 26, "A"], [0x1d552, 26, "a"], // double-struck
  [0x1d56c, 26, "A"], [0x1d586, 26, "a"], // bold fraktur
  [0x1d5a0, 26, "A"], [0x1d5ba, 26, "a"], // sans-serif
  [0x1d5d4, 26, "A"], [0x1d5ee, 26, "a"], // sans-serif bold
  [0x1d608, 26, "A"], [0x1d622, 26, "a"], // sans-serif italic
  [0x1d63c, 26, "A"], [0x1d656, 26, "a"], // sans-serif bold italic
  [0x1d670, 26, "A"], [0x1d68a, 26, "a"], // monospace
  [0x1d7ce, 10, "0"], // bold digits
  [0x1d7d8, 10, "0"], // double-struck digits
  [0x1d7e2, 10, "0"], // sans-serif digits
  [0x1d7ec, 10, "0"], // sans-serif bold digits
  [0x1d7f6, 10, "0"], // monospace digits
];

/**
 * Letters the math block leaves as holes because they were already encoded
 * in Letterlike Symbols (U+2100–U+214F). Without these, a word like "ℎ𝑒𝑙𝑙𝑜"
 * would normalise to "ℎello" — worse than leaving it alone, because it looks
 * almost right.
 */
const LETTERLIKE: Readonly<Record<string, string>> = {
  "ℎ": "h", "ℬ": "B", "ℯ": "e", "ℰ": "E",
  "ℱ": "F", "ℳ": "M", "ℊ": "g", "ℴ": "o",
  "ℐ": "I", "ℒ": "L", "ℛ": "R", "ℋ": "H",
  "ℑ": "I", "ℜ": "R", "ℨ": "Z", "℘": "P",
  "ℂ": "C", "ℍ": "H", "ℕ": "N", "ℙ": "P",
  "ℚ": "Q", "ℝ": "R", "ℤ": "Z", "ℭ": "C",
  "℩": "i", "ℵ": "A",
};

/** Built once — a map is far cheaper than scanning 31 ranges per character. */
const MATH_MAP: ReadonlyMap<number, string> = (() => {
  const map = new Map<number, string>();
  for (const [start, length, asciiStart] of MATH_RUNS) {
    const base = asciiStart.charCodeAt(0);
    for (let i = 0; i < length; i += 1) {
      map.set(start + i, String.fromCharCode(base + i));
    }
  }
  for (const [char, ascii] of Object.entries(LETTERLIKE)) {
    map.set(char.codePointAt(0) as number, ascii);
  }
  return map;
})();

/**
 * Maps Unicode pseudo-styled letters and digits back to plain ASCII.
 * Ordinary text passes through untouched — including real punctuation,
 * accents, emoji and non-Latin scripts, none of which are in these ranges.
 */
export function normalizeTypography(value: string): string {
  // Cheap guard: the overwhelming majority of strings contain none of this,
  // and `for...of` over every character of every field is not free.
  if (!/[\u{1D400}-\u{1D7FF}\u{2100}-\u{214F}]/u.test(value)) return value;

  let out = "";
  for (const char of value) {
    const code = char.codePointAt(0);
    out += (code !== undefined && MATH_MAP.get(code)) || char;
  }
  return out;
}

/** Same, for a field that may be absent. Preserves null/undefined exactly. */
export function normalizeMaybe<T extends string | null | undefined>(
  value: T,
): T {
  return (typeof value === "string" ? normalizeTypography(value) : value) as T;
}
