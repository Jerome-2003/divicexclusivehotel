import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { copyFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

/**
 * GitHub Pages serves a *user* site (`<user>.github.io`) from the origin root and a
 * *project* site from `/<repo>/`. Nothing in the app may assume which: every asset URL
 * goes through `src/lib/asset.js`, which resolves against `import.meta.env.BASE_URL`,
 * and the router takes the same value as its basename.
 *
 *   npm run build                                   → served from /
 *   VITE_BASE=/divicexclusivehotel/ npm run build   → served from /divicexclusivehotel/
 *
 * The base must start and end with a slash.
 */
const base = process.env.VITE_BASE || '/';

/**
 * Pages has no server-side rewrite, so a guest opening /urban directly — or reloading
 * one — gets Pages' own 404 rather than the app. Serving the same document as 404.html
 * hands those URLs back to the router, which is the standard SPA fallback for Pages.
 */
function spaFallback() {
  return {
    name: 'divic-spa-fallback',
    apply: 'build',
    closeBundle() {
      const dir = 'dist';
      const index = join(dir, 'index.html');
      if (existsSync(index)) copyFileSync(index, join(dir, '404.html'));
    },
  };
}

export default defineConfig({
  base,
  plugins: [react(), spaFallback()],
  build: { outDir: 'dist', sourcemap: false },
});
