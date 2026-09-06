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
 */

/* Eager so the map is a plain object at module scope; `?url` so each file is emitted as
   a file and referenced by URL rather than inlined. */
const FILES = import.meta.glob('../assets/images/*/*.jpg', {
  eager: true,
  query: '?url',
  import: 'default',
});

/* Keyed as `<property>/<name>`, e.g. 'urban/bar'. */
const BY_KEY = Object.fromEntries(
  Object.entries(FILES).map(([path, url]) => {
    const [, property, name] = path.match(/\/([^/]+)\/([^/]+)\.jpg$/);
    return [`${property}/${name}`, url];
  }),
);

/**
 * The URL for one photograph, e.g. `photo('urban', 'bar')`.
 *
 * Throws on an unknown name. That is deliberate: this is called while the page renders,
 * so a typo or a deleted file surfaces immediately in development and in the build's
 * own smoke test, rather than as a broken image nobody notices.
 */
export function photo(property, name) {
  const url = BY_KEY[`${property}/${name}`];
  if (!url) {
    throw new Error(
      `No photograph "${property}/${name}". Available: ${Object.keys(BY_KEY).sort().join(', ')}`,
    );
  }
  return url;
}

/** Every key that resolved, for scripts/check-images.mjs. */
export const PHOTO_KEYS = Object.keys(BY_KEY).sort();
