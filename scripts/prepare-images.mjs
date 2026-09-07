/**
 * Turns the supplied source photography into web assets.
 *
 *   node scripts/prepare-images.mjs
 *
 * Sources of truth are `DIVIC URBAN/` and `divic exclusive/` — originals are never
 * modified. Derivatives are written to `src/assets/images/<property>/`, so re-running
 * this after replacing a source file regenerates everything.
 *
 * The room images arrive as marketing flyers: inset thumbnails on a panel, a contact and
 * price bar along the bottom, and a logo watermark. We crop to the photograph alone so no
 * text, price or logo reaches the site — prices in particular must come from the PMS, not
 * be burnt into a JPEG. The two properties' flyers are laid out differently, so each has
 * its own geometry.
 *
 * EVERY IMAGE IS EMITTED SEVERAL TIMES OVER, because one file cannot serve both a phone
 * and a desktop without wasting one of them:
 *
 *   · widths 480 / 960 / 1600, so a phone downloads a phone-sized picture
 *   · AVIF and WebP, which are a fraction of the JPEG at the same quality
 *   · one JPEG per image as the fallback for anything that reads neither
 *
 * The browser picks one file per image from the `srcset` the Plate component writes.
 */
import sharp from 'sharp';
import { mkdirSync, readdirSync, rmSync, statSync } from 'node:fs';
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
    flyers: new Set(['standardExclusive.jpg', 'deluxeExclusive.jpg', 'superiorExclusive.jpg']),
    skip: new Set(),
  },
];

const WIDTHS = [480, 960, 1600];
/** The JPEG is only ever the fallback, so one middling width covers it. */
const FALLBACK_WIDTH = 1200;

const slug = (file) =>
  file
    .replace(/\.[^.]+$/, '')
    .replace(/(Urban|Exclusive)$/i, '')
    .replace(/([a-z])([A-Z0-9])/g, '$1-$2')
    .toLowerCase();

/* The room crops come from small flyers and arrive soft, so everything gets a light
   unsharp mask before encoding — gentle enough not to ring around door frames. */
const SHARPEN = { sigma: 0.8, m1: 0.5, m2: 2 };

let files = 0;
let bytes = 0;

for (const job of JOBS) {
  rmSync(job.out, { recursive: true, force: true });
  mkdirSync(job.out, { recursive: true });

  const sources = readdirSync(job.src).filter((f) => /\.(jpe?g)$/i.test(f) && !job.skip.has(f));

  for (const file of sources) {
    const name = slug(file);
    const base = sharp(join(job.src, file));
    const cropped = job.flyers.has(file) ? base.clone().extract(job.flyerCrop) : base.clone();
    const meta = await cropped.metadata();
    const native = meta.width;

    /* Never upscale: a 670px flyer crop gains nothing from a 1600px file, and the
       browser would download the bigger one for no reason. */
    const widths = WIDTHS.filter((w) => w <= native);
    if (widths.length === 0 || widths[widths.length - 1] < native) widths.push(native);

    const written = [];
    for (const width of widths) {
      const resized = () =>
        cropped.clone().resize({ width, withoutEnlargement: true, kernel: 'lanczos3' }).sharpen(SHARPEN);
      for (const [ext, encode] of [
        ['avif', (p) => p.avif({ quality: 55, effort: 6 })],
        ['webp', (p) => p.webp({ quality: 76, effort: 5 })],
      ]) {
        const out = join(job.out, `${name}-${width}.${ext}`);
        await encode(resized()).toFile(out);
        written.push(out);
      }
    }

    const fallback = join(job.out, `${name}.jpg`);
    await cropped
      .clone()
      .resize({ width: Math.min(FALLBACK_WIDTH, native), withoutEnlargement: true, kernel: 'lanczos3' })
      .sharpen(SHARPEN)
      .jpeg({ quality: 82, mozjpeg: true, progressive: true })
      .toFile(fallback);
    written.push(fallback);

    const size = written.reduce((n, f) => n + statSync(f).size, 0);
    files += written.length;
    bytes += size;
    console.log(
      `${name.padEnd(14)} ${String(native).padStart(4)}px source → ` +
        `${widths.join('/')} @ avif+webp + jpg   ${(size / 1024).toFixed(0)} kB total`,
    );
  }
}

console.log(`\n${files} files, ${(bytes / 1048576).toFixed(2)} MB on disk (the browser downloads one per image).`);
