/**
 * No-op stand-in for the `server-only` package, used *only* by the guard
 * scripts (D-059).
 *
 * `server-only` is not a real installed dependency here — Next.js aliases the
 * bare specifier to its own compiled copy at build time. That works inside the
 * app and fails outside it, so any plain `tsx` script importing a module that
 * declares `import "server-only"` cannot resolve it and dies before running a
 * single assertion.
 *
 * `scripts/tsconfig.json` maps the specifier here for script runs only. The
 * application build is untouched and keeps the real guard: this file is never
 * reachable from `src/`.
 */
export {};
