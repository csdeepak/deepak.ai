# Gallery — source photo drop location (D-056)

Put personal source photos here, then generate the derived output:

```
photos/your-photo.jpg                    ← drop photos here (.jpg / .jpeg / .png / .webp)
npm run gallery:process --workspace=web  ← writes apps/web/public/gallery/*.webp +
                                            apps/web/content/gallery/manifest.generated.json
```

## Why this folder is gitignored (on purpose)

**Source photos are never committed** — they are personal photography, and
phone photos often carry EXIF metadata (GPS coordinates, device info) that
must never land in a public repo. Everything in this folder is gitignored
**except this README**, so the drop location stays discoverable in git —
the same pattern used for the hero-face pipeline's source portrait
(`apps/web/scripts/assets/`).

What *is* committed is the **derived** output: two EXIF-stripped WebP
renditions per photo in `apps/web/public/gallery/` (a ~900px grid tile and
a ~1800px detail view), plus dimensions/orientation/blur-placeholder data
in `apps/web/content/gallery/manifest.generated.json`. `sharp` drops all
metadata on every output unless `.withMetadata()` is called, which the
pipeline never does.

## Captions, dates, and layout

The pipeline only handles the mechanical half. Caption, date, time, place,
and layout knobs (`size` / `tilt` / `depth` / `featured`) are hand-authored
separately in `apps/web/content/gallery.ts` (`PHOTO_META`), keyed by the
photo `id` the pipeline assigns (`g01`, `g02`, ...). A photo missing from
`PHOTO_META` still renders, with a blank caption/info/place instead of a
fabricated one.
