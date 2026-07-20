# Hero face — source photo drop location (D-050 Track 1)

Put the personal source portrait here, then generate the derived asset:

```
apps/web/scripts/assets/portrait-source.jpg   ← drop your photo here (.jpg / .jpeg / .png)
cd apps/web && npm run hero:generate           ← writes apps/web/public/hero-face.json
```

## Why this folder is gitignored (on purpose)

The **input photo is never committed** — it is a personal likeness source
(photography ethics / LAW-008). Everything in this folder is gitignored
**except this README**, so the drop location stays discoverable in git.

What *is* committed is the **derived** artifact, `apps/web/public/hero-face.json`
— a quantized constellation of nodes/edges that carries no recoverable
photograph. This is the deliberate, correct use of the repo's otherwise
avoided "gitignored path" pattern: the source is private, the derivative
is public.

## Budget

`npm run hero:generate` prints the raw + gzipped size of the output and
**fails** if the gzipped JSON exceeds 60 KB (auto-retrying once at a lower
node cap first). Nodes are capped at 3,000, edges at 6,000.

## No photo? No fake face.

If no `portrait-source.*` is present the script exits with a one-line
instruction and writes nothing. The `<NeuralFaceHero />` component then
renders nothing and the hero copy stands alone (graceful absence).
