/**
 * Turns the supplied source photography into web assets.
 *
 *   node scripts/prepare-images.mjs
 *
 * Sources of truth are `DIVIC URBAN/` and `divic exclusive/` — originals are never
 * modified. Derivatives are written to `src/assets/images/<property>/`, so re-running this
 * after replacing a source file regenerates everything.
 *
 * The room images arrive as marketing flyers: inset thumbnails on a panel, a contact and
 * price bar along the bottom, and a logo watermark. We crop to the photograph alone so no
 * text, price or logo reaches the site — prices in particular must come from the PMS, not
 * be burnt into a JPEG.
 *
 * The two properties' flyers are laid out differently, so each has its own geometry.
 */
import sharp from 'sharp';
import { mkdirSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const JOBS = [
  {
    src: 'DIVIC URBAN',
    out: 'src/assets/images/urban',
    /* 1200x628 flyers: thumbnails down the left, logo top right, price bar along the
       bottom. left 228 clears the panel, width 852 stops before the watermark at x≈1085,
       height 560 stops above the bar at y≈565. */
    flyerCrop: { left: 228, top: 0, width: 852, height: 560 },
    flyers: new Set(['classicUrban.jpg', 'crownUrban.jpg', 'deluxeUrban.jpg', 'superiorUrban.jpg']),
    skip: new Set(['diviclogo.JPG']),
  },
  {
    src: 'divic exclusive',
    out: 'src/assets/images/exclusive',
    /* 1080x565 flyers: thumbnails down the left, logo top CENTRE, a further inset at the
       right, price bar along the bottom. top 100 clears the watermark, width 670 stops
       before the right-hand inset at x≈878, height 408 stops above the bar at y≈512. */
    flyerCrop: { left: 205, top: 100, width: 670, height: 408 },
    flyers: new Set([
      'standardExclusive.jpg',
      'deluxeExclusive.jpg',
      'superiorExclusive.jpg',
    ]),
    skip: new Set(),
  },
];

const slug = (file) =>
  file
    .replace(/\.[^.]+$/, '')
    .replace(/(Urban|Exclusive)$/i, '')
    .replace(/([a-z])([A-Z0-9])/g, '$1-$2')
    .toLowerCase() + '.jpg';

let cropped = 0;
let total = 0;

for (const job of JOBS) {
  mkdirSync(job.out, { recursive: true });
  const files = readdirSync(job.src).filter(
    (f) => /\.(jpe?g)$/i.test(f) && !job.skip.has(f),
  );

  for (const file of files) {
    const isFlyer = job.flyers.has(file);
    let img = sharp(join(job.src, file));
    if (isFlyer) {
      img = img.extract(job.flyerCrop);
      cropped += 1;
    }

    const out = join(job.out, slug(file));
    await img
      .resize({ width: 1600, withoutEnlargement: true })
      .jpeg({ quality: 82, mozjpeg: true, progressive: true })
      .toFile(out);

    const meta = await sharp(out).metadata();
    total += 1;
    console.log(
      `${job.src}/${file}`.padEnd(38) +
        `→ ${slug(file).padEnd(18)} ${meta.width}x${meta.height}` +
        (isFlyer ? '  (cropped out of flyer)' : ''),
    );
  }
}

console.log(`\n${total} images written, ${cropped} cropped free of overlaid text.`);
