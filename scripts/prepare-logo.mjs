/**
 * Turns the supplied logo into the assets the site actually needs.
 *
 *   node scripts/prepare-logo.mjs
 *
 * `public/divicexlusive.jpg` is a 503x496 JPEG: the swan-and-oval mark above two lines
 * of type, on a pure white field. The site's ground is off-white, so pasting the JPEG
 * anywhere would show a white box around it. It also needs to appear twice over: as the
 * full lockup, and as the mark alone where a text wordmark already sits beside it.
 *
 * The background is removed by flooding inward from the border rather than by keying
 * every white pixel — the swan itself is near-white, and a naive key erases it.
 *
 * Outputs (transparent PNG, in src/assets/brand/):
 *   logo-full.png   mark + wordmark, for the splash and the footer
 *   logo-mark.png   mark alone, for the header lockup and the favicon
 *
 * NOTE ON RESOLUTION. The source is 503x496, and the mark inside it is only about
 * 171x186. Nothing here can invent detail, so neither output is enlarged — they are
 * emitted at native size and the site is sized to suit (see README). A higher-resolution
 * original, or the vector the logo was drawn from, would let the splash run larger.
 */
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

const SRC = 'public/divicexlusive.jpg';
const OUT = 'src/assets/brand';

/* Measured from the source: ink runs rows 94-366, with a 16px clear band at 281-296
   separating the mark from the first line of type. */
const MARK = { top: 88, height: 200 };
const FULL = { top: 88, height: 285 };

/** How close to white a pixel must be to count as background. */
const NEAR_WHITE = 238;

/**
 * Flood the background from every border pixel, four-connected. Anything the flood
 * cannot reach — the white inside the swan, the counters of the letters — keeps its
 * pixels, which is the whole point of doing it this way.
 */
async function cutout(region) {
  const { data, info } = await sharp(SRC)
    .extract({ left: 0, top: region.top, width: 503, height: region.height })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width: w, height: h, channels: c } = info;
  const isNearWhite = (i) => data[i] >= NEAR_WHITE && data[i + 1] >= NEAR_WHITE && data[i + 2] >= NEAR_WHITE;

  const seen = new Uint8Array(w * h);
  const queue = [];
  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return;
    const p = y * w + x;
    if (seen[p] || !isNearWhite(p * c)) return;
    seen[p] = 1;
    queue.push(p);
  };
  for (let x = 0; x < w; x++) { push(x, 0); push(x, h - 1); }
  for (let y = 0; y < h; y++) { push(0, y); push(w - 1, y); }

  for (let head = 0; head < queue.length; head++) {
    const p = queue[head];
    const x = p % w;
    const y = (p - x) / w;
    push(x - 1, y); push(x + 1, y); push(x, y - 1); push(x, y + 1);
  }

  let cleared = 0;
  for (let p = 0; p < w * h; p++) {
    if (seen[p]) { data[p * c + 3] = 0; cleared += 1; }
  }
  return { buffer: data, w, h, c, cleared, total: w * h };
}

mkdirSync(OUT, { recursive: true });

for (const [name, region] of [['logo-mark', MARK], ['logo-full', FULL]]) {
  const { buffer, w, h, c, cleared, total } = await cutout(region);
  const out = `${OUT}/${name}.png`;
  await sharp(buffer, { raw: { width: w, height: h, channels: c } })
    .trim()                                   // drop the now-transparent margin
    /* A light unsharp mask recovers the edge the JPEG blurred, without the halo a
       heavier one would leave around the swan. No resize: see the note above. */
    .sharpen({ sigma: 0.7, m1: 0.4, m2: 1.6 })
    .png({ compressionLevel: 9 })
    .toFile(out);
  const meta = await sharp(out).metadata();
  console.log(
    `${name.padEnd(11)} ${meta.width}x${meta.height}  ` +
      `background removed: ${((cleared / total) * 100).toFixed(1)}% of the crop`,
  );
}
