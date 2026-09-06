import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { copyFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

/**
 * The site is published as a GitHub Pages *project* site — Pages is set to the `docs/`
 * folder on `main`, and the build output is committed there — so it is served from
 * `/divicexclusivehotel/`, not the origin root.
 *
 * Nothing in the app may assume that path. Asset URLs go through `src/lib/asset.js`,
 * which resolves against `import.meta.env.BASE_URL`, and the router takes the same value
 * as its basename. `VITE_BASE` overrides it, so the same source also builds for a root
 * deployment or a preview under some other path:
 *
 *   npm run build                 → /divicexclusivehotel/  (what Pages serves today)
 *   VITE_BASE=/ npm run build     → the origin root
 *
 * The base must start and end with a slash.
 */
const base = process.env.VITE_BASE || '/divicexclusivehotel/';
const outDir = process.env.VITE_OUT_DIR || 'docs';

/**
 * Pages has no server-side rewrite, so a guest opening /urban directly — or reloading
 * one — gets Pages' own 404 rather than the app. Serving the same document as 404.html
 * hands those URLs back to the router. Written on every build so it can never drift out
 * of step with index.html the way a hand-copied one does.
 */
function spaFallback(dir) {
  return {
    name: 'divic-spa-fallback',
    apply: 'build',
    closeBundle() {
      const index = join(dir, 'index.html');
      if (existsSync(index)) copyFileSync(index, join(dir, '404.html'));
    },
  };
}

export default defineConfig({
  base,
  plugins: [react(), spaFallback(outDir)],
  build: { outDir, sourcemap: false, emptyOutDir: true },
});
