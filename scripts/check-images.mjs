/**
 * Fails the build if the photography and the code disagree.
 *
 *   node scripts/check-images.mjs
 *
 * `photo()` in src/lib/images.js already throws on an unknown name, but only once a
 * page renders. This runs first, so a rename or a deleted file is caught before a build
 * is produced — let alone deployed.
 *
 * There are exactly two call sites and both pass string literals, so reading them is
 * enough. If that ever stops being true, this will say so rather than quietly passing.
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';

const ROOT = 'src/assets/images';
const CALL_SITES = ['src/data/properties.js', 'src/pages/Home.jsx'];

const onDisk = new Set();
for (const property of readdirSync(ROOT)) {
  for (const file of readdirSync(`${ROOT}/${property}`)) {
    if (file.endsWith('.jpg')) onDisk.add(`${property}/${file.replace(/\.jpg$/, '')}`);
  }
}

const used = new Set();
let sawDynamic = false;
for (const path of CALL_SITES) {
  if (!existsSync(path)) continue;
  const src = readFileSync(path, 'utf8');
  // photo('urban', 'bar')
  for (const [, p, n] of src.matchAll(/\bphoto\(\s*'([^']+)'\s*,\s*'([^']+)'\s*\)/g)) {
    used.add(`${p}/${n}`);
  }
  // urban('bar') / exclusive('pool') — the two helpers in properties.js
  for (const [, helper, n] of src.matchAll(/\b(urban|exclusive)\(\s*'([^']+)'\s*\)/g)) {
    used.add(`${helper}/${n}`);
  }
  // a non-literal argument would slip past the two patterns above
  if (/\bphoto\(\s*[^'\s)]/.test(src) || /\b(urban|exclusive)\(\s*[^'\s)]/.test(src)) {
    sawDynamic = true;
  }
}

const missing = [...used].filter((k) => !onDisk.has(k)).sort();
const unused = [...onDisk].filter((k) => !used.has(k)).sort();

if (missing.length) {
  console.error(`\n${missing.length} photograph(s) referenced but not on disk:`);
  for (const k of missing) console.error(`  ${ROOT}/${k}.jpg`);
  console.error('\nAdd the file, or fix the name at its call site.\n');
  process.exit(1);
}

console.log(`${used.size} photographs referenced, all present in ${ROOT}/.`);
if (unused.length) console.log(`Not used by the site: ${unused.join(', ')}`);
if (sawDynamic) {
  console.log('Note: a non-literal argument was found — this check no longer sees every reference.');
}
