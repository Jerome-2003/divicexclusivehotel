/**
 * Resolves a file in `public/` against the URL the site is actually served from.
 *
 * A root-absolute `/images/...` only works when the site sits at the origin root. On
 * GitHub Pages a project site is served from `/<repo>/`, so those paths resolve to the
 * user's root instead and 404. Vite fills `BASE_URL` from the `base` option (see
 * vite.config.js) and always ends it with a slash, so this returns the right URL for
 * whichever way the site is deployed.
 */
export const asset = (path) => `${import.meta.env.BASE_URL}${String(path).replace(/^\/+/, '')}`;
