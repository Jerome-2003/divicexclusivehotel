import markSrc from '../assets/brand/logo-mark.png';
import fullSrc from '../assets/brand/logo-full.png';

/**
 * The hotel's own logo, in the two shapes the site needs.
 *
 *   variant="mark"  the swan and its gold oval, for a lockup where the name is set
 *                   beside it in type
 *   variant="full"  mark and wordmark together, for the splash and the footer
 *
 * Both are cut from the supplied `public/divicexlusive.jpg` by
 * `scripts/prepare-logo.mjs`, which lifts them off their white field so they sit on the
 * page's off-white without a visible box.
 *
 * Sizes are deliberately modest: the source is 503x496 and the mark inside it is only
 * about 172x187, so anything much larger than it is drawn here would be visibly soft.
 *
 * `plate` puts the logo back on the white field it was drawn for. The swan is near-white,
 * and the page ground is off-white, so without it the bird all but disappears and only
 * the gold oval reads. The plate is the logo's own presentation, not decoration.
 */
const SOURCES = { mark: markSrc, full: fullSrc };

export default function Logo({
  variant = 'mark',
  className = '',
  alt,
  priority = false,
  plate = false,
  plateClassName = '',
}) {
  const img = (
    <img
      src={SOURCES[variant] || markSrc}
      alt={alt ?? ''}
      aria-hidden={alt ? undefined : 'true'}
      loading={priority ? 'eager' : 'lazy'}
      fetchpriority={priority ? 'high' : undefined}
      decoding="async"
      className={`select-none object-contain ${className}`}
      draggable="false"
    />
  );
  if (!plate) return img;
  return (
    <span
      className={`inline-flex items-center justify-center bg-white ring-1 ring-ink/[0.07] ${
        variant === 'full' ? 'rounded-2xl px-6 py-5' : 'rounded-full p-3'
      } ${plateClassName}`}
    >
      {img}
    </span>
  );
}
