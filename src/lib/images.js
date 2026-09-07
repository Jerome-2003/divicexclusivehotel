/**
 * The photography, resolved by the bundler rather than by string concatenation.
 *
 * These files used to sit in `public/` and be referenced as `/images/urban/bar.jpg`.
 * Two things went wrong with that, twice:
 *
 *   1. A literal URL has to know where the site is deployed. At the origin root it is
 *      right; under a GitHub Pages project path it points at the user root and 404s.
 *   2. Nothing checks it. A wrong or missing filename is a runtime 404 that only shows
 *      up in a browser console, usually someone else's.
 *
 * Importing them fixes both by construction. Vite resolves every file at build time,
 * emits it with a content hash, and writes the URL with the deployment base already
 * applied — so the base can never be wrong, a stale cached file can never be served,
 * and a name that does not exist fails here, loudly, instead of in production.
 *
 * `scripts/prepare-images.mjs` writes each photograph several times over — AVIF and WebP
 * at 480/960/1600, plus one JPEG fallback — so what `photo()` returns is not a URL but a
 * descriptor the Plate component turns into a `<picture>`. The browser then downloads
 * one file per image, at the size it actually needs, in the best format it reads.
 */

/* Eager so the maps are plain objects at module scope; `?url` so each file is emitted as
   a file and referenced by URL rather than inlined. */
const SETS = {
  avif: import.meta.glob('../assets/images/*/*.avif', { eager: true, query: '?url', import: 'default' }),
  webp: import.meta.glob('../assets/images/*/*.webp', { eager: true, query: '?url', import: 'default' }),
};
const FALLBACK = import.meta.glob('../assets/images/*/*.jpg', {
  eager: true,
  query: '?url',
  import: 'default',
});

/**
 * `.../urban/bar-960.avif` → { key: 'urban/bar', width: 960 }
 *
 * Both name groups are `[^/]+` on purpose. A `.+` there matches across the slash, so the
 * property group binds to `images` and the key comes out as `images/urban/bar` — which
 * matches nothing, leaves every srcset empty, and silently serves the JPEG fallback to
 * everyone. That is exactly what happened the first time.
 */
function parseVariant(path) {
  const m = path.match(/\/([^/]+)\/([^/]+)-(\d+)\.(?:avif|webp)$/);
  return m ? { key: `${m[1]}/${m[2]}`, width: Number(m[3]) } : null;
}

const BY_KEY = {};

for (const [path, url] of Object.entries(FALLBACK)) {
  const m = path.match(/\/([^/]+)\/([^/]+)\.jpg$/);
  if (m) BY_KEY[`${m[1]}/${m[2]}`] = { src: url, avif: [], webp: [] };
}

for (const [format, files] of Object.entries(SETS)) {
  for (const [path, url] of Object.entries(files)) {
    const v = parseVariant(path);
    if (v && BY_KEY[v.key]) BY_KEY[v.key][format].push({ url, width: v.width });
  }
}

/* Freeze each descriptor into the shape a <picture> wants: one srcset string per format,
   widths ascending so the browser's own selection is predictable. */
for (const entry of Object.values(BY_KEY)) {
  for (const format of ['avif', 'webp']) {
    entry[format] = entry[format]
      .sort((a, b) => a.width - b.width)
      .map((v) => `${v.url} ${v.width}w`)
      .join(', ');
  }
}

/**
 * The descriptor for one photograph, e.g. `photo('urban', 'bar')`.
 *
 * Throws on an unknown name. That is deliberate: this is called while the page renders,
 * so a typo or a deleted file surfaces immediately in development and in the build's
 * own check, rather than as a broken image nobody notices.
 */
export function photo(property, name) {
  const entry = BY_KEY[`${property}/${name}`];
  if (!entry) {
    throw new Error(
      `No photograph "${property}/${name}". Available: ${Object.keys(BY_KEY).sort().join(', ')}`,
    );
  }
  return entry;
}

/** Every key that resolved, for scripts/check-images.mjs. */
export const PHOTO_KEYS = Object.keys(BY_KEY).sort();
