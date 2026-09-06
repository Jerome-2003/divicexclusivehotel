/**
 * The Divic swan, as geometry.
 *
 * One source for the mark wherever it is drawn — the header lockup, the footer, and the
 * splash animation — so the static logo and the animated one can never drift apart.
 *
 * Coordinates are in the mark's own space: viewBox "-20 0 600 620".
 */

export const SWAN_VIEWBOX = '-20 0 600 620';

/** The gold disc the swan sits against. */
export const DISC = { cx: 350, cy: 252, rx: 210, ry: 252 };

/** Neck and head: the tall open S, drawn as a stroke so the disc shows through the gap. */
export const NECK = {
  d: 'M350 445 C334 378 298 348 296 282 C294 214 306 166 344 156 C384 146 408 182 398 226',
  strokeWidth: 54,
};

export const HEAD = { cx: 398, cy: 226, r: 31 };

export const BEAK = 'M414 206 L474 232 L412 252 Z';

/** Body, with the tail point at the left. */
export const BODY =
  'M0 300 C24 330 30 356 22 380 ' +
  'C8 470 96 598 250 598 ' +
  'C400 598 490 520 490 430 ' +
  'C490 340 410 290 300 290 ' +
  'C200 290 110 306 60 306 ' +
  'C34 306 12 304 0 300 Z';

/**
 * The wing. Flush inside the body outline at rest, so the silhouette matches the logo;
 * rotating it about the shoulder lifts it clear of the back and reads as a wingbeat.
 */
export const WING =
  'M170 348 C270 312 390 340 442 404 ' +
  'C470 440 456 496 410 522 ' +
  'C336 562 232 548 190 496 ' +
  'C162 462 150 380 170 348 Z';

/** Shoulder pivot for the wingbeat. */
export const WING_PIVOT = { x: 400, y: 350 };

/** Where the body meets the water — the origin for ripples. */
export const WATERLINE = { x: 245, y: 598 };

/** Palette taken from the supplied logo artwork. */
export const SPLASH_COLORS = {
  background: '#0d0d0d',
  gold: '#d8c99a',
  offWhite: '#f0f0f0',
};
