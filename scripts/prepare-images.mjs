/**
 * Turns the supplied source photography into web assets.
 *
 *   node scripts/prepare-images.mjs
 *
 * Source of truth is `DIVIC URBAN/` — originals are never modified. Derivatives are
 * written to `public/images/urban/`, so re-running this after replacing a source file
 * regenerates everything.
 *
 * The four room images arrive as 1200x628 marketing flyers: two inset thumbnails on a
 * panel down the left, a contact/price bar along the bottom, and a logo watermark top
 * right. We crop to just the photograph so no text, price or logo appears on the site —
 * prices in particular must come from the PMS, not be burnt into a JPEG.
 */
import sharp from 'sharp';
import { mkdirSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const SRC = 'DIVIC URBAN';
const OUT = 'public/images/urban';

/* Flyer geometry, measured from the 1200x628 sources.
   left 228  — clears the inset-thumbnail panel
   width 852 — stops at x=1080, clearing the logo watermark that starts near x=1085
   height 560 — stops above the contact/price bar that begins near y=565 */
const FLYER_CROP = { left: 228, top: 0, width: 852, height: 560 };
const FLYER_FILES = new Set(['classicUrban.jpg', 'crownUrban.jpg', 'deluxeUrban.jpg', 'superiorUrban.jpg']);

// diviclogo is the brand mark, not photography — the site draws the swan as vector
const SKIP = new Set(['diviclogo.JPG']);

const slug = (file) =>
  file
    .replace(/\.[^.]+$/, '')
    .replace(/Urban$/i, '')
    .replace(/([a-z])([A-Z0-9])/g, '$1-$2')
    .toLowerCase() + '.jpg';

mkdirSync(OUT, { recursive: true });

const files = readdirSync(SRC).filter((f) => /\.(jpe?g)$/i.test(f) && !SKIP.has(f));
let cropped = 0;

for (const file of files) {
  const isFlyer = FLYER_FILES.has(file);
  let img = sharp(join(SRC, file));

  if (isFlyer) {
    img = img.extract(FLYER_CROP);
    cropped += 1;
  }

  const out = join(OUT, slug(file));
  await img
    .resize({ width: 1600, withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true, progressive: true })
    .toFile(out);

  const meta = await sharp(out).metadata();
  console.log(
    `${file.padEnd(24)} → ${slug(file).padEnd(18)} ${meta.width}x${meta.height}` +
      (isFlyer ? '  (cropped out of flyer)' : ''),
  );
}

console.log(`\n${files.length} images written, ${cropped} cropped free of overlaid text.`);
